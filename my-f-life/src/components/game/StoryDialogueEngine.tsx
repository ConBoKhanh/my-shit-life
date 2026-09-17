import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Sparkles,
  FastForward,
  Play,
  Check,
  User,
  Award,
  History,
  X,
  LayoutDashboard,
  Volume2,
  VolumeX,
  Heart,
  Coins,
  Laptop,
  BookOpen,
  ChevronDown,
  Flame,
  Zap,
  Trophy,
  Music,
  SkipForward,
} from 'lucide-react';
import { toast } from 'sonner';
import type { StoryStepConfig, DialogueLine, StoryChoice, StoryActionConfig } from '../../types/story';
import type { UserProfile, UserActionLog, CharacterAvatarConfig } from '../../types/game';
import { resolveAssetUrl, getRandomHospitalBackground } from '../../utils/assets';
import { GameDatePicker } from '../common/GameDatePicker';
import { BabyAvatarPicker } from '../common/BabyAvatarPicker';
import { StageTitleSplash } from '../common/StageTitleSplash';
import { TvWatchingModal } from './modals/TvWatchingModal';
import { TikTokFeedModal } from './modals/TikTokFeedModal';
import { backgroundMusicManager } from '../../services/backgroundMusicManager';
import { CharacterCustomizerModal } from './character/CharacterCustomizerModal';
import { CharacterAvatarRenderer } from './character/CharacterAvatarRenderer';

interface StoryDialogueEngineProps {
  stepConfig: StoryStepConfig;
  userProfile?: UserProfile;
  selectedChoiceIds?: string[];
  initialDialogueIndex?: number;
  actionLogs?: UserActionLog[];
  onDialogueIndexChange?: (index: number) => void;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>, nextDialogueIndex?: number) => void;
  onStepChoice: (choice: StoryChoice) => void;
  onStageCompleted?: (scoreGain: number) => void;
  onBackToDashboard?: () => void;
}

export const StoryDialogueEngine: React.FC<StoryDialogueEngineProps> = ({
  stepConfig,
  userProfile = {},
  selectedChoiceIds = [],
  initialDialogueIndex = 0,
  actionLogs = [],
  onDialogueIndexChange,
  onUpdateProfile,
  onStepChoice,
  onBackToDashboard,
}) => {
  // Dialogue state (can switch between step dialogues and choice reaction dialogues)
  const [activeDialogueList, setActiveDialogueList] = useState<DialogueLine[]>(stepConfig.dialogues);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState<number>(() => {
    return typeof initialDialogueIndex === 'number' && initialDialogueIndex >= 0 ? initialDialogueIndex : 0;
  });
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeModalAction, setActiveModalAction] = useState<StoryActionConfig | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTab, setHistoryTab] = useState<'dialogues' | 'actions'>('dialogues');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [cachedVariables, setCachedVariables] = useState<Record<string, string>>({});
  const [isMuted, setIsMuted] = useState(false);

  // Local record of selected choice IDs to immediately filter out used options
  const [localSelectedChoiceIds, setLocalSelectedChoiceIds] = useState<string[]>(() => selectedChoiceIds || []);

  useEffect(() => {
    setLocalSelectedChoiceIds(selectedChoiceIds || []);
  }, [selectedChoiceIds]);

  // Danh sách các lựa chọn chưa được chọn (Lựa chọn qua màn luôn hiển thị)
  const availableChoices = useMemo(() => {
    if (!stepConfig.choices) return [];
    return stepConfig.choices.filter((choice) => {
      // Lựa chọn kết thúc màn hoặc qua màn kế tiếp luôn hiển thị
      if (choice.nextStepId === 'stage_completed' || choice.id.endsWith('c8')) {
        return true;
      }
      // Loại bỏ lựa chọn đã chọn
      return !localSelectedChoiceIds.includes(choice.id);
    });
  }, [stepConfig.choices, localSelectedChoiceIds]);

  // Floating score feedback
  const [floatingScore, setFloatingScore] = useState<number | null>(null);

  // Pending selected choice transition (after reaction dialogues finish)
  const [pendingChoiceTransition, setPendingChoiceTransition] = useState<StoryChoice | null>(null);

  // Interactive Action Modals (Smart TV & TikTok feed)
  const [isTvOpen, setIsTvOpen] = useState(false);
  const [isTikTokOpen, setIsTikTokOpen] = useState(false);
  const [activeInteractiveChoice, setActiveInteractiveChoice] = useState<StoryChoice | null>(null);

  // Audio refs & Typewriter timer ref
  const typewriterAudioCtxRef = useRef<AudioContext | null>(null);
  const typewriterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStepIdRef = useRef<string>(stepConfig.id);

  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Form states for modals
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [birthdateInput, setBirthdateInput] = useState(userProfile.birthdate || '2000-09-16');
  const [characterNameInput, setCharacterNameInput] = useState(userProfile.characterName || '');
  const [selectedBabyAvatar, setSelectedBabyAvatar] = useState<string>(userProfile.babyAvatar || '');

  // Check if current stage is Stage 3+ (Kindergarten or older) where custom 3D avatar is used
  const isCustomAvatarStage = !stepConfig.id.startsWith('step_1') && !stepConfig.id.startsWith('step_2');

  useEffect(() => {
    if (userProfile.babyAvatar) {
      setSelectedBabyAvatar(userProfile.babyAvatar);
    }
  }, [userProfile.babyAvatar]);

  const currentDialogue: DialogueLine | undefined = activeDialogueList[currentDialogueIndex];
  const isLastDialogue = currentDialogueIndex >= activeDialogueList.length - 1;
  const showChoices = currentDialogueIndex >= activeDialogueList.length && !pendingChoiceTransition;
  const [showTitleSplash, setShowTitleSplash] = useState<boolean>(true);

  // Dynamic randomized background support
  const [customBgUrl, setCustomBgUrl] = useState<string>(() => {
    if (stepConfig.background?.url === 'asset:bg_hospital') {
      return getRandomHospitalBackground();
    }
    return resolveAssetUrl(stepConfig.background?.url || '');
  });

  useEffect(() => {
    if (stepConfig.background?.url === 'asset:bg_hospital') {
      setCustomBgUrl(getRandomHospitalBackground());
    } else {
      setCustomBgUrl(resolveAssetUrl(stepConfig.background?.url || ''));
    }
  }, [stepConfig.id]);

  // Track already handled trigger actions to avoid re-triggering across sessions
  const handledTriggersRef = useRef<Set<string>>(
    new Set(
      stepConfig.dialogues
        .slice(0, typeof initialDialogueIndex === 'number' ? initialDialogueIndex : 0)
        .map((d) => d.id)
    )
  );

  // Reset when stepConfig.id actually changes to a new step
  useEffect(() => {
    if (prevStepIdRef.current !== stepConfig.id) {
      prevStepIdRef.current = stepConfig.id;
      setShowTitleSplash(true);
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
      setActiveDialogueList(stepConfig.dialogues);
      const startIdx = typeof initialDialogueIndex === 'number' ? initialDialogueIndex : 0;
      setCurrentDialogueIndex(startIdx);
      setDisplayedText('');
      setIsTyping(false);
      setActiveModalAction(null);
      setPendingChoiceTransition(null);
      setFloatingScore(null);
      setLocalSelectedChoiceIds(selectedChoiceIds || []);
      handledTriggersRef.current = new Set(
        stepConfig.dialogues.slice(0, startIdx).map((d) => d.id)
      );
      onDialogueIndexChange?.(startIdx);
    }
  }, [stepConfig.id, stepConfig.dialogues, initialDialogueIndex, selectedChoiceIds, onDialogueIndexChange]);

  // Quản lý theo dõi bài hát nền hiện tại
  const [currentTrackInfo, setCurrentTrackInfo] = useState(() => backgroundMusicManager.getCurrentTrack());

  useEffect(() => {
    return backgroundMusicManager.subscribe(() => {
      setCurrentTrackInfo(backgroundMusicManager.getCurrentTrack());
      setIsMuted(backgroundMusicManager.isMuted);
    });
  }, []);

  // 1. Quản lý phát nhạc nền liên tục cho game
  useEffect(() => {
    backgroundMusicManager.startBackgroundMusic();
  }, []);

  // 2. Cập nhật Mute khi người dùng bấm nút
  useEffect(() => {
    if (backgroundMusicManager.isMuted !== isMuted) {
      backgroundMusicManager.setMuted(isMuted);
    }
  }, [isMuted]);

  // 3. Tự động tạm dừng nhạc nền khi hội thoại có âm thanh riêng (SFX/BGM riêng) và phát tiếp khi hết
  useEffect(() => {
    if (!currentDialogue) return;

    const sfxUrl = currentDialogue.sfx ? resolveAssetUrl(currentDialogue.sfx) : '';
    const dialogueBgmUrl = currentDialogue.bgm ? resolveAssetUrl(currentDialogue.bgm) : '';
    const stepBgmUrl = stepConfig.bgm ? resolveAssetUrl(stepConfig.bgm) : '';

    const customAudio = sfxUrl || dialogueBgmUrl || stepBgmUrl;

    if (customAudio) {
      backgroundMusicManager.playDialogueAudio(customAudio, 0.85);
    } else {
      backgroundMusicManager.resumeFromCustomAudio();
    }
  }, [currentDialogue?.id, currentDialogue?.sfx, currentDialogue?.bgm, stepConfig.bgm]);

  // Dọn dẹp typewriter timer
  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
    };
  }, []);

  // Fully resolved characters map with names and dynamic avatar
  const resolvedCharacters = useMemo(() => {
    const chars = { ...stepConfig.characters };
    const charName = userProfile.characterName || characterNameInput || 'Bé Con';
    const dadName = userProfile.dadName || 'Huấn Hoa Hòe';
    const momName = userProfile.momName || 'Trần Hà Linh';

    const result: Record<string | number, (typeof stepConfig.characters)[string]> = {};

    Object.entries(chars).forEach(([key, rawChar]) => {
      const char = { ...rawChar };

      // Resolve character display name
      let name = char.name || '';
      name = name.replace(/\{characterName\}/g, charName);
      name = name.replace(/\{character_name\}/g, charName);
      name = name.replace(/\{name\}/g, charName);
      name = name.replace(/\{dad_name\}/g, dadName);
      name = name.replace(/\{dadName\}/g, dadName);
      name = name.replace(/\{mom_name\}/g, momName);
      name = name.replace(/\{momName\}/g, momName);
      char.name = name;

      // Assign avatar sprite for player in Stage 3+ (custom avatar) or Stage 1 & 2 (baby avatars)
      if (char.role === 'player' || char.id === 1 || String(char.id) === '1') {
        const isBabyStage = stepConfig.id.startsWith('step_1') || stepConfig.id.startsWith('step_2');
        if (stepConfig.id.startsWith('step_1') || stepConfig.id === 'step_1_birth') {
          // Màn 1 (Khoa sản Bệnh Viện Phụ Sản): Bé sơ sinh vừa sinh ra, chỉ có Bố, Mẹ và Cô Y Tá trên màn hình
          char.sprite = '';
        } else if (stepConfig.id.startsWith('step_2') || stepConfig.id === 'step_2_first_words') {
          char.sprite = selectedBabyAvatar || userProfile.babyAvatar || 'asset:baby_1';
        } else if (isBabyStage) {
          char.sprite = selectedBabyAvatar || userProfile.babyAvatar || 'asset:baby_1';
        } else {
          // Stage 3+ (Mẫu giáo trở lên): Sử dụng avatar tùy biến 3D
          char.sprite = 'asset:custom_avatar';
        }
      }

      result[key] = char;
    });

    return result;
  }, [
    stepConfig.characters,
    stepConfig.id,
    selectedBabyAvatar,
    userProfile.babyAvatar,
    userProfile.characterName,
    characterNameInput,
    userProfile.dadName,
    userProfile.momName,
  ]);

  // Current speaker resolution
  const currentSpeaker = useMemo(() => {
    if (!currentDialogue) {
      const firstNpc = Object.values(resolvedCharacters).find((c) => c.role === 'npc');
      return firstNpc || Object.values(resolvedCharacters)[0];
    }
    const char = resolvedCharacters[currentDialogue.speakerId];
    if (!char) return null;

    return {
      ...char,
      side: currentDialogue.side || char.side,
    };
  }, [currentDialogue, resolvedCharacters]);

  // Universal text & template variable resolver (Gender, character name, birthdate, pool names)
  const resolveText = useCallback(
    (rawText: string, d?: DialogueLine) => {
      if (!rawText) return '';
      let text = rawText;

      const gender = userProfile.gender || selectedGender || 'male';
      const genderLabel = gender === 'female' ? 'gái' : 'trai';
      const charName = userProfile.characterName || characterNameInput || 'Bé Con';
      const birth = userProfile.birthdate || birthdateInput || 'Hôm nay';
      const dadName = userProfile.dadName || 'Huấn Hoa Hòe';
      const momName = userProfile.momName || 'Trần Hà Linh';

      text = text.replace(/\{gender\}/g, gender);
      text = text.replace(/\{gender_label\}/g, genderLabel);
      text = text.replace(/\{gender_value\}/g, genderLabel);
      text = text.replace(/\{characterName\}/g, charName);
      text = text.replace(/\{character_name\}/g, charName);
      text = text.replace(/\{name\}/g, charName);
      text = text.replace(/\{dad_name\}/g, dadName);
      text = text.replace(/\{dadName\}/g, dadName);
      text = text.replace(/\{mom_name\}/g, momName);
      text = text.replace(/\{momName\}/g, momName);
      text = text.replace(/\{birthdate\}/g, birth);

      if (d?.varMap) {
        Object.entries(d.varMap).forEach(([varKey, mapping]) => {
          const placeholder = `{${varKey}}`;
          if (text.includes(placeholder)) {
            let replacementValue = cachedVariables[`${stepConfig.id}_${d.id}_${varKey}`];

            if (!replacementValue) {
              if (typeof mapping === 'object' && mapping.fromPool && stepConfig.randomPools) {
                const pool = stepConfig.randomPools[mapping.fromPool];
                if (pool) {
                  if (Array.isArray(pool)) {
                    replacementValue = pool[Math.floor(Math.random() * pool.length)];
                  } else if (typeof pool === 'object') {
                    const subPool = (pool as any)[gender] || (pool as any).male || [];
                    replacementValue = subPool[Math.floor(Math.random() * subPool.length)] || 'Bé Cưng';
                  }
                }
              } else if (typeof mapping === 'string') {
                replacementValue = mapping;
              }

              if (replacementValue) {
                setCachedVariables((prev) => ({
                  ...prev,
                  [`${stepConfig.id}_${d.id}_${varKey}`]: replacementValue!,
                }));
              }
            }

            if (replacementValue) {
              text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), replacementValue);
            }
          }
        });
      }

      return text;
    },
    [userProfile, selectedGender, characterNameInput, birthdateInput, cachedVariables, stepConfig]
  );

  // Dynamic text resolution
  const resolvedFullText = useMemo(() => {
    if (!currentDialogue) return '';
    return resolveText(currentDialogue.text, currentDialogue);
  }, [currentDialogue, resolveText]);

  // Sound effect for typewriter dialogue (chatter tick / gõ từng ký tự)
  const playTypewriterBlip = useCallback(() => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!typewriterAudioCtxRef.current) {
        typewriterAudioCtxRef.current = new AudioCtx();
      }
      const ctx = typewriterAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => { });
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Âm thanh gõ text game visual novel nhẹ nhàng, vui tai (480-560Hz)
      const freq = 480 + Math.random() * 80;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, ctx.currentTime + 0.022);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.022);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // Safe fallback
    }
  }, [isMuted]);

  // Typewriter effect
  useEffect(() => {
    if (!currentDialogue || showChoices || activeModalAction) return;

    if (currentDialogue.triggerAction && !handledTriggersRef.current.has(currentDialogue.id)) {
      handledTriggersRef.current.add(currentDialogue.id);
      setActiveModalAction(currentDialogue.triggerAction);
      return;
    }

    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }

    // Nếu đang bật Tự Động (AutoPlay): Show hết text ngay lập tức, không chạy từng chữ
    if (isAutoPlay) {
      setDisplayedText(resolvedFullText);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');

    let charIndex = 0;
    const fullText = resolvedFullText;

    typewriterTimerRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        const nextChar = fullText[charIndex];
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;

        // Phát hiệu ứng âm thanh chữ đang chạy (cứ mỗi 2 ký tự hoặc ký tự không phải khoảng trắng)
        if (nextChar && nextChar.trim() !== '' && charIndex % 2 === 0) {
          playTypewriterBlip();
        }
      } else {
        setIsTyping(false);
        if (typewriterTimerRef.current) {
          clearInterval(typewriterTimerRef.current);
          typewriterTimerRef.current = null;
        }
      }
    }, 24);

    return () => {
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
    };
  }, [currentDialogueIndex, resolvedFullText, showChoices, activeModalAction, activeDialogueList, isAutoPlay, playTypewriterBlip]);

  // Advance dialogue callback
  const handleNextDialogue = useCallback(() => {
    if (activeModalAction || showHistoryModal || isTvOpen || isTikTokOpen) return;

    // Fast-forward typewriter if currently typing
    if (isTyping) {
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
      setDisplayedText(resolvedFullText);
      setIsTyping(false);
      return;
    }

    if (currentDialogueIndex < activeDialogueList.length - 1) {
      const nextIdx = currentDialogueIndex + 1;
      setCurrentDialogueIndex(nextIdx);
      onDialogueIndexChange?.(nextIdx);
    } else {
      if (pendingChoiceTransition) {
        if (pendingChoiceTransition.loopBackToChoices) {
          // Quay lại bảng lựa chọn của step hiện tại
          setActiveDialogueList(stepConfig.dialogues);
          setCurrentDialogueIndex(stepConfig.dialogues.length);
          setPendingChoiceTransition(null);
          setDisplayedText('');
          setIsTyping(false);
          onDialogueIndexChange?.(stepConfig.dialogues.length);
        } else {
          const choiceToEmit = pendingChoiceTransition;
          setPendingChoiceTransition(null);
          onStepChoice(choiceToEmit);
        }
      } else {
        const nextIdx = activeDialogueList.length;
        setCurrentDialogueIndex(nextIdx);
        onDialogueIndexChange?.(nextIdx);
      }
    }
  }, [
    activeModalAction,
    showHistoryModal,
    isTvOpen,
    isTikTokOpen,
    isTyping,
    resolvedFullText,
    currentDialogueIndex,
    activeDialogueList.length,
    pendingChoiceTransition,
    stepConfig.dialogues,
    onStepChoice,
    onDialogueIndexChange,
  ]);

  // Global Keyboard Navigation Listener: Any key advances dialogue except inputs / modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalAction || showHistoryModal || showChoices || isTvOpen || isTikTokOpen) return;

      const target = e.target as HTMLElement | null;
      const targetTag = target?.tagName?.toLowerCase();
      if (
        targetTag === 'input' ||
        targetTag === 'select' ||
        targetTag === 'textarea' ||
        target?.isContentEditable
      ) {
        return;
      }

      // Ignore modifier combinations (Ctrl+R, Ctrl+Shift+I, Alt+Tab, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // Ignore individual modifier / system control keys
      const ignoredKeys = [
        'Control',
        'Alt',
        'Shift',
        'Meta',
        'Tab',
        'Escape',
        'CapsLock',
        'NumLock',
        'ScrollLock',
        'Pause',
        'PrintScreen',
        'ContextMenu',
      ];
      if (ignoredKeys.includes(e.key)) {
        return;
      }

      // Ignore Function keys (F1 - F12)
      if (e.key.startsWith('F') && !isNaN(Number(e.key.slice(1)))) {
        return;
      }

      // Any other keyboard key (Space, Enter, Letters, Numbers, Arrows, etc.) advances dialogue
      e.preventDefault();
      handleNextDialogue();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalAction, showHistoryModal, showChoices, isTvOpen, isTikTokOpen, handleNextDialogue]);

  // Global screen click handler
  const handleGlobalScreenClick = (e: React.MouseEvent) => {
    if (activeModalAction || showHistoryModal || showChoices || isTvOpen || isTikTokOpen) return;

    const target = e.target as HTMLElement;
    // Don't advance if clicked on any interactive button, input, select, form, or element marked as no-advance
    if (target.closest('button, input, select, textarea, form, a, [data-no-advance="true"]')) {
      return;
    }

    handleNextDialogue();
  };

  // Auto-play timer: Tự động chuyển câu thoại tiếp theo sau mỗi 5 giây
  useEffect(() => {
    if (!isAutoPlay || isTyping || showChoices || activeModalAction || isTvOpen || isTikTokOpen) return;

    const autoTimer = setTimeout(() => {
      handleNextDialogue();
    }, 5000);

    return () => clearTimeout(autoTimer);
  }, [isAutoPlay, isTyping, showChoices, activeModalAction, isTvOpen, isTikTokOpen, currentDialogueIndex, activeDialogueList, handleNextDialogue]);

  // User selects an option
  const handleSelectChoice = (choice: StoryChoice) => {
    // 1. Lưu ngay ID lựa chọn vào danh sách đã chọn để loại bỏ khỏi menu
    setLocalSelectedChoiceIds((prev) => (prev.includes(choice.id) ? prev : [...prev, choice.id]));

    // Phát âm thanh hiệu ứng riêng nếu có (Ví dụ: SIUUUU Cristiano Ronaldo)
    const choiceSfx = choice.sfx
      ? resolveAssetUrl(choice.sfx)
      : choice.text.toLowerCase().includes('siu')
        ? resolveAssetUrl('asset:sfx_siuu')
        : '';

    if (choiceSfx) {
      backgroundMusicManager.playDialogueAudio(choiceSfx, 0.95);
    }

    const scoreGain = typeof choice.scoreReward === 'number' ? choice.scoreReward : 0;
    if (scoreGain > 0) {
      setFloatingScore(scoreGain);
      toast.success(`Nhận thưởng +${scoreGain} điểm!`);

      setTimeout(() => {
        setFloatingScore(null);
      }, 2000);
    }

    // Nếu là lựa chọn mở Modal Xem Tivi
    if (choice.actionModal === 'watch_tv') {
      setActiveInteractiveChoice(choice);
      setIsTvOpen(true);
      return;
    }

    // Nếu là lựa chọn mở Modal Xem TikTok máy bố
    if (choice.actionModal === 'watch_tiktok') {
      setActiveInteractiveChoice(choice);
      setIsTikTokOpen(true);
      return;
    }

    if (choice.reactionDialogues && choice.reactionDialogues.length > 0) {
      setPendingChoiceTransition(choice);
      setActiveDialogueList(choice.reactionDialogues);
      setCurrentDialogueIndex(0);
      setDisplayedText('');
      setIsTyping(false);
    } else if (choice.loopBackToChoices) {
      setActiveDialogueList(stepConfig.dialogues);
      setCurrentDialogueIndex(stepConfig.dialogues.length);
      setPendingChoiceTransition(null);
    } else {
      onStepChoice(choice);
    }
  };

  // Callback khi đóng Modal Xem Tivi
  const handleTvClose = (_eventOutcome?: 'fell_asleep' | 'normal_close') => {
    setIsTvOpen(false);
    if (activeInteractiveChoice?.reactionDialogues && activeInteractiveChoice.reactionDialogues.length > 0) {
      setPendingChoiceTransition(activeInteractiveChoice);
      setActiveDialogueList(activeInteractiveChoice.reactionDialogues);
      setCurrentDialogueIndex(0);
      setDisplayedText('');
      setIsTyping(false);
    } else if (activeInteractiveChoice?.loopBackToChoices) {
      setActiveDialogueList(stepConfig.dialogues);
      setCurrentDialogueIndex(stepConfig.dialogues.length);
      setPendingChoiceTransition(null);
    } else if (activeInteractiveChoice) {
      onStepChoice(activeInteractiveChoice);
    }
  };

  // Callback khi đóng Modal Xem TikTok máy bố
  const handleTikTokClose = (_eventOutcome?: 'mom_caught_girls' | 'normal_close') => {
    setIsTikTokOpen(false);
    if (activeInteractiveChoice?.reactionDialogues && activeInteractiveChoice.reactionDialogues.length > 0) {
      setPendingChoiceTransition(activeInteractiveChoice);
      setActiveDialogueList(activeInteractiveChoice.reactionDialogues);
      setCurrentDialogueIndex(0);
      setDisplayedText('');
      setIsTyping(false);
    } else if (activeInteractiveChoice?.loopBackToChoices) {
      setActiveDialogueList(stepConfig.dialogues);
      setCurrentDialogueIndex(stepConfig.dialogues.length);
      setPendingChoiceTransition(null);
    } else if (activeInteractiveChoice) {
      onStepChoice(activeInteractiveChoice);
    }
  };

  // Submit profile init (Gender & Birthdate)
  const handleSubmitProfileInit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextIdx = currentDialogueIndex < activeDialogueList.length - 1 ? currentDialogueIndex + 1 : currentDialogueIndex;
    onUpdateProfile(
      {
        gender: selectedGender,
        birthdate: birthdateInput,
      },
      nextIdx
    );
    toast.success(`Đã chọn giới tính: Bé ${selectedGender === 'male' ? 'Trai' : 'Gái'} (${birthdateInput})`);
    setActiveModalAction(null);
    setCurrentDialogueIndex(nextIdx);
    onDialogueIndexChange?.(nextIdx);
  };

  // Submit character name picker
  const handleSubmitNamePicker = (nameToSave: string) => {
    const trimmed = nameToSave.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập tên cho bé!');
      return;
    }
    const nextIdx = currentDialogueIndex < activeDialogueList.length - 1 ? currentDialogueIndex + 1 : currentDialogueIndex;
    onUpdateProfile(
      {
        characterName: trimmed,
      },
      nextIdx
    );
    setCharacterNameInput(trimmed);
    toast.success(`Tên của bé là "${trimmed}"!`);
    setActiveModalAction(null);
    setCurrentDialogueIndex(nextIdx);
    onDialogueIndexChange?.(nextIdx);
  };

  // Submit baby avatar selection (Swiper)
  const handleSelectBabyAvatar = (avatarId: string) => {
    setSelectedBabyAvatar(avatarId);
    const nextIdx = currentDialogueIndex < activeDialogueList.length - 1 ? currentDialogueIndex + 1 : currentDialogueIndex;
    onUpdateProfile(
      {
        babyAvatar: avatarId,
      },
      nextIdx
    );
    toast.success('Đã chọn diện mạo bé yêu thành công!');
    setActiveModalAction(null);
    setCurrentDialogueIndex(nextIdx);
    onDialogueIndexChange?.(nextIdx);
  };

  // Submit character customizer (Stage 3 Kindergarten)
  const handleConfirmCharacterCustomizer = (newConfig: CharacterAvatarConfig) => {
    const nextIdx = currentDialogueIndex < activeDialogueList.length - 1 ? currentDialogueIndex + 1 : currentDialogueIndex;
    onUpdateProfile(
      {
        avatarConfig: newConfig,
      },
      nextIdx
    );
    toast.success('Đã lưu diện mạo bé mẫu giáo thành công! (+500đ Phong Cách)');
    setFloatingScore(500);
    setTimeout(() => setFloatingScore(null), 2000);
    setActiveModalAction(null);
    setCurrentDialogueIndex(nextIdx);
    onDialogueIndexChange?.(nextIdx);
  };

  // Quick suggestions based on gender
  const nameSuggestions = useMemo(() => {
    const gender = userProfile.gender || selectedGender || 'male';
    if (gender === 'female') {
      return ['Khánh Linh', 'Minh Anh', 'Hạ Vy', 'Tuệ Mẫn', 'Thục Quyên', 'Bảo Ngọc'];
    }
    return ['Duy Khánh', 'Quang Minh', 'Bảo Nam', 'Gia Hưng', 'Thiên Ân', 'Đức Huy'];
  }, [userProfile.gender, selectedGender]);

  // Choice icon resolver
  const renderChoiceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Volume2':
        return <Volume2 size={16} color="var(--color-secondary)" />;
      case 'Heart':
        return <Heart size={16} color="var(--color-accent)" />;
      case 'Coins':
        return <Coins size={16} color="var(--color-secondary)" />;
      case 'Laptop':
        return <Laptop size={16} color="#3B82F6" />;
      case 'BookOpen':
        return <BookOpen size={16} color="#10B981" />;
      case 'Award':
        return <Award size={16} color="#FFB84D" />;
      case 'Flame':
        return <Flame size={16} color="#FB7185" />;
      case 'Zap':
        return <Zap size={16} color="#FACC15" />;
      case 'Trophy':
        return <Trophy size={16} color="#FBBF24" />;
      default:
        return iconName ? (
          <span style={{ fontSize: '15px', flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
            {iconName}
          </span>
        ) : (
          <Sparkles size={16} color="var(--color-secondary)" />
        );
    }
  };

  return (
    <div
      onClick={handleGlobalScreenClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        minHeight: '100dvh',
        zIndex: 100,
        backgroundColor: '#150B28',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: !showChoices && !activeModalAction && !showHistoryModal ? 'pointer' : 'default',
      }}
    >
      {/* Floating Score Celebration */}
      <AnimatePresence>
        {floatingScore && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1.25 }}
            exit={{ opacity: 0, y: -80, scale: 1.4 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 200,
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-text-primary)',
              padding: '12px 28px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 12px 32px rgba(255, 184, 77, 0.6)',
              fontSize: '22px',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
            }}
          >
            <Sparkles size={24} />
            <span>+{floatingScore} Điểm!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. SCENE BACKGROUND (FULLSCREEN) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${customBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.92)',
          zIndex: 1,
        }}
      />

      {/* Ambient Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15, 8, 28, 0.4) 0%, rgba(15, 8, 28, 0.05) 35%, rgba(15, 8, 28, 0.8) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* 2. TOP HUD BAR */}
      <div
        data-no-advance="true"
        style={{
          position: 'relative',
          zIndex: 40,
          padding: isMobile ? '12px 14px' : '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Location & Character Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: isMobile ? '5px 10px' : '6px 14px',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            <MapPin size={14} color="var(--color-primary)" />
            <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {resolveText(stepConfig.locationName || stepConfig.title)}
            </span>
          </div>

          {userProfile.characterName && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(108, 92, 231, 0.92)',
                color: '#FFFFFF',
                padding: isMobile ? '5px 10px' : '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
              }}
            >
              <User size={13} />
              <span>Bé: {userProfile.characterName}</span>
            </div>
          )}
        </div>

        {/* Right: Music Track Info, Audio Mute, Day Tag & Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Background Music Widget */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(30, 18, 51, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: isMobile ? '4px 6px' : '5px 8px',
              color: '#FFFFFF',
              fontSize: '11px',
            }}
          >
            <Music size={13} color="var(--color-primary)" />
            {!isMobile && (
              <span
                style={{
                  maxWidth: '110px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: 600,
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
                title={`Đang phát: ${currentTrackInfo.title} - ${currentTrackInfo.artist}`}
              >
                {currentTrackInfo.title}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                backgroundMusicManager.playNextTrack();
                toast.info(`Chuyển bài: ${backgroundMusicManager.getCurrentTrack().title}`);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: '#CBD5E1',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Đổi bài nhạc nền tiếp theo"
            >
              <SkipForward size={13} />
            </button>
          </div>

          {/* Audio BGM Mute / Unmute Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            style={{
              background: isMuted ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: isMobile ? '6px 8px' : '7px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: isMuted ? 'var(--color-text-disabled)' : 'var(--color-primary)',
            }}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <div
            style={{
              backgroundColor: 'rgba(30, 18, 51, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFB84D',
              padding: isMobile ? '5px 10px' : '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Calendar size={13} />
            <span>{resolveText(stepConfig.dayLabel || `Step ${stepConfig.stepNumber}`)}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowHistoryModal(true);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: isMobile ? '6px 8px' : '7px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
            title="Xem nhật ký thoại"
          >
            <History size={14} />
            {!isMobile && <span>Nhật ký</span>}
          </button>

          {onBackToDashboard && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBackToDashboard();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: isMobile ? '6px 8px' : '7px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
              title="Về bảng tổng quan"
            >
              <LayoutDashboard size={14} />
              {!isMobile && <span>Tiến độ</span>}
            </button>
          )}
        </div>
      </div>

      {/* 3. CHARACTERS STAGE */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? '160px' : 0,
          left: 0,
          right: 0,
          height: isMobile ? 'auto' : '100%',
          maxHeight: isMobile ? '48dvh' : '100%',
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'flex-end',
          padding: isMobile ? '0 12px' : '0 48px',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {isMobile ? (
          /* MOBILE MODE: ONLY RENDER 1 ACTIVE CHARACTER GROUNDED ABOVE DIALOGUE BOX */
          currentSpeaker && currentSpeaker.sprite ? (
            <motion.div
              key={`mobile-${currentSpeaker.id}`}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                filter: 'brightness(1.05) contrast(1.02)',
              }}
            >
              {/* Soft ambient backlight glow behind character */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                  height: '75%',
                  background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.28) 0%, rgba(139, 92, 246, 0) 70%)',
                  borderRadius: '50%',
                  filter: 'blur(20px)',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
              />
              {/* Ground contact shadow */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '70%',
                  height: '16px',
                  background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, transparent 75%)',
                  borderRadius: '50%',
                  filter: 'blur(3px)',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
              />
              {(currentSpeaker.role === 'player' || currentSpeaker.id === 1 || String(currentSpeaker.id) === '1') && isCustomAvatarStage && userProfile.avatarConfig ? (
                <div style={{ maxHeight: '44dvh', maxWidth: '80vw', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <CharacterAvatarRenderer config={userProfile.avatarConfig} width={180} height={250} showShadow={false} use3D={true} />
                </div>
              ) : (
                <img
                  src={resolveAssetUrl(currentSpeaker.sprite)}
                  alt={currentSpeaker.name}
                  style={{
                    maxHeight: '42dvh',
                    maxWidth: '76vw',
                    objectFit: 'contain',
                    display: 'block',
                    verticalAlign: 'bottom',
                    marginBottom: 0,
                    maskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 86%, transparent 100%)',
                  }}
                />
              )}
            </motion.div>
          ) : null
        ) : (
          /* DESKTOP / TABLET MODE: GROUNDED AT BOTTOM: 0 WITH SPOTLIGHT & DARKENING */
          <>
            {/* LEFT CHARACTERS */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', alignSelf: 'flex-end' }}>
              {Object.values(resolvedCharacters)
                .filter((c) => c.side === 'left' && c.sprite)
                .map((char) => {
                  const isSpeaking = currentSpeaker?.id === char.id;
                  const isBaby = char.role === 'player' || char.id === 1 || String(char.id) === '1';
                  return (
                    <motion.div
                      key={char.id}
                      animate={{
                        scale: isSpeaking ? (isBaby ? 1.08 : 1.04) : (isBaby ? 0.96 : 0.95),
                        y: isSpeaking ? (isBaby ? [0, -10, 0] : 0) : 8,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        alignSelf: 'flex-end',
                        opacity: 1,
                        zIndex: isSpeaking ? 8 : (isBaby ? 7 : 4),
                        filter: isSpeaking
                          ? 'brightness(1.05) contrast(1.02)'
                          : 'brightness(0.45) contrast(0.9) grayscale(15%)',
                        transition: 'filter 0.3s ease',
                      }}
                    >
                      {/* Ambient backlight glow when speaking */}
                      {isSpeaking && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '18%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            height: '75%',
                            background: isBaby
                              ? 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0) 72%)'
                              : 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0) 72%)',
                            borderRadius: '50%',
                            filter: 'blur(24px)',
                            pointerEvents: 'none',
                            zIndex: -1,
                          }}
                        />
                      )}
                      {/* Ground contact shadow */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-6px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '75%',
                          height: '20px',
                          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, transparent 75%)',
                          borderRadius: '50%',
                          filter: 'blur(4px)',
                          pointerEvents: 'none',
                          zIndex: -1,
                        }}
                      />
                      {isBaby && isCustomAvatarStage && userProfile.avatarConfig ? (
                        <div style={{ maxHeight: '52vh', maxWidth: '280px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <CharacterAvatarRenderer config={userProfile.avatarConfig} width={240} height={330} showShadow={false} use3D={true} />
                        </div>
                      ) : (
                        <img
                          src={resolveAssetUrl(char.sprite)}
                          alt={char.name}
                          style={{
                            maxHeight: isBaby ? '48vh' : '92vh',
                            maxWidth: isBaby ? '260px' : '425px',
                            objectFit: 'contain',
                            display: 'block',
                            verticalAlign: 'bottom',
                            marginBottom: 0,
                            maskImage: isBaby ? 'none' : 'linear-gradient(to bottom, black 88%, transparent 100%)',
                            WebkitMaskImage: isBaby ? 'none' : 'linear-gradient(to bottom, black 88%, transparent 100%)',
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
            </div>

            {/* CENTER CHARACTERS (e.g. Baby / Player in Stage 2) */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', alignSelf: 'flex-end', marginBottom: '170px' }}>
              {Object.values(resolvedCharacters)
                .filter((c) => c.side === 'center' && c.sprite)
                .map((char) => {
                  const isSpeaking = currentSpeaker?.id === char.id;
                  const isBaby = char.role === 'player' || char.id === 1 || String(char.id) === '1';
                  return (
                    <motion.div
                      key={char.id}
                      animate={{
                        scale: isSpeaking ? 1.1 : 0.97,
                        y: isSpeaking ? [0, -12, 0] : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        alignSelf: 'flex-end',
                        opacity: 1,
                        zIndex: isSpeaking ? 10 : 6,
                        filter: isSpeaking
                          ? 'brightness(1.08) contrast(1.04) drop-shadow(0 0 16px rgba(255, 184, 77, 0.45))'
                          : 'brightness(0.92) contrast(1)',
                        transition: 'filter 0.3s ease',
                      }}
                    >
                      {/* Ambient backlight glow when speaking */}
                      {isSpeaking && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '15%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '110%',
                            height: '80%',
                            background: 'radial-gradient(ellipse at center, rgba(255, 184, 77, 0.4) 0%, rgba(255, 184, 77, 0) 70%)',
                            borderRadius: '50%',
                            filter: 'blur(20px)',
                            pointerEvents: 'none',
                            zIndex: -1,
                          }}
                        />
                      )}
                      {/* Ground contact shadow */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '70%',
                          height: '18px',
                          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, transparent 75%)',
                          borderRadius: '50%',
                          filter: 'blur(4px)',
                          pointerEvents: 'none',
                          zIndex: -1,
                        }}
                      />
                      {isBaby && isCustomAvatarStage && userProfile.avatarConfig ? (
                        <div style={{ maxHeight: '52vh', maxWidth: '280px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <CharacterAvatarRenderer config={userProfile.avatarConfig} width={240} height={330} showShadow={false} use3D={true} />
                        </div>
                      ) : (
                        <img
                          src={resolveAssetUrl(char.sprite)}
                          alt={char.name}
                          style={{
                            maxHeight: isBaby ? '50vh' : '88vh',
                            maxWidth: isBaby ? '280px' : '400px',
                            objectFit: 'contain',
                            display: 'block',
                            verticalAlign: 'bottom',
                            marginBottom: 0,
                            filter: isSpeaking ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
            </div>

            {/* RIGHT CHARACTERS */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', alignSelf: 'flex-end' }}>
              {Object.values(resolvedCharacters)
                .filter((c) => c.side === 'right' && c.sprite)
                .map((char) => {
                  const isSpeaking = currentSpeaker?.id === char.id;
                  const isBaby = char.role === 'player' || char.id === 1 || String(char.id) === '1';
                  return (
                    <motion.div
                      key={char.id}
                      animate={{
                        scale: isSpeaking ? (isBaby ? 1.08 : 1.04) : (isBaby ? 0.96 : 0.95),
                        y: isSpeaking ? (isBaby ? [0, -10, 0] : 0) : 8,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        alignSelf: 'flex-end',
                        opacity: 1,
                        zIndex: isSpeaking ? 8 : (isBaby ? 7 : 4),
                        filter: isSpeaking
                          ? 'brightness(1.05) contrast(1.02)'
                          : 'brightness(0.45) contrast(0.9) grayscale(15%)',
                        transition: 'filter 0.3s ease',
                      }}
                    >
                      {/* Ambient backlight glow when speaking */}
                      {isSpeaking && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '18%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            height: '75%',
                            background: isBaby
                              ? 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0) 72%)'
                              : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 72%)',
                            borderRadius: '50%',
                            filter: 'blur(24px)',
                            pointerEvents: 'none',
                            zIndex: -1,
                          }}
                        />
                      )}
                      {/* Ground contact shadow */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-6px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '75%',
                          height: '20px',
                          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, transparent 75%)',
                          borderRadius: '50%',
                          filter: 'blur(4px)',
                          pointerEvents: 'none',
                          zIndex: -1,
                        }}
                      />
                      {isBaby && isCustomAvatarStage && userProfile.avatarConfig ? (
                        <div style={{ maxHeight: '52vh', maxWidth: '280px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <CharacterAvatarRenderer config={userProfile.avatarConfig} width={240} height={330} showShadow={false} use3D={true} />
                        </div>
                      ) : (
                        <img
                          src={resolveAssetUrl(char.sprite)}
                          alt={char.name}
                          style={{
                            maxHeight: isBaby ? '48vh' : '92vh',
                            maxWidth: isBaby ? '260px' : '425px',
                            objectFit: 'contain',
                            display: 'block',
                            verticalAlign: 'bottom',
                            marginBottom: 0,
                            maskImage: isBaby ? 'none' : 'linear-gradient(to bottom, black 88%, transparent 100%)',
                            WebkitMaskImage: isBaby ? 'none' : 'linear-gradient(to bottom, black 88%, transparent 100%)',
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </>
        )}
      </div>
      {/* 4. DIALOGUE BOX OR BRANCHING CHOICES */}
      <div
        data-no-advance={showChoices ? 'true' : undefined}
        style={{
          position: 'relative',
          zIndex: 30,
          padding: isMobile
            ? '4px 10px calc(env(safe-area-inset-bottom, 8px) + 8px) 10px'
            : '16px 40px 24px 40px',
          width: '100%',
          maxWidth: '1080px',
          margin: '0 auto',
        }}
      >
        {!showChoices ? (
          /* DIALOGUE BOX */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'relative',
              backgroundColor: 'rgba(24, 14, 42, 0.94)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255, 255, 255, 0.22)',
              borderRadius: isMobile ? 'var(--radius-md)' : 'var(--radius-lg)',
              padding: isMobile ? '14px 12px 8px 12px' : '22px 28px 18px 28px',
              cursor: 'pointer',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              minHeight: isMobile ? '86px' : '130px',
              maxHeight: isMobile ? '34dvh' : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* SPEAKER NAME PLATE */}
            {currentSpeaker && (
              <div
                style={{
                  position: 'absolute',
                  top: isMobile ? '-12px' : '-16px',
                  left: isMobile ? '12px' : currentSpeaker.side === 'left' ? '28px' : 'auto',
                  right: isMobile ? 'auto' : currentSpeaker.side === 'right' ? '28px' : 'auto',
                  backgroundColor: currentSpeaker.color || 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: isMobile ? '3px 10px' : '6px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 800,
                  letterSpacing: '0.3px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>{currentSpeaker.name}</span>
              </div>
            )}

            {/* DIALOGUE TEXT CONTENT */}
            <p
              style={{
                fontSize: isMobile ? '13px' : '15px',
                lineHeight: 1.5,
                color: '#FFFFFF',
                fontWeight: 600,
                marginTop: isMobile ? '2px' : '4px',
                marginBottom: '4px',
                minHeight: isMobile ? '32px' : '48px',
                maxHeight: isMobile ? '16dvh' : 'none',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {displayedText}
              {isTyping && <span style={{ opacity: 0.85, color: 'var(--color-secondary)' }}>▌</span>}
            </p>

            {/* FOOTER CONTROLS */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: isMobile ? '4px' : '10px',
                paddingTop: isMobile ? '4px' : '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextAuto = !isAutoPlay;
                    setIsAutoPlay(nextAuto);
                    if (nextAuto) {
                      if (typewriterTimerRef.current) {
                        clearInterval(typewriterTimerRef.current);
                        typewriterTimerRef.current = null;
                      }
                      setDisplayedText(resolvedFullText);
                      setIsTyping(false);
                    }
                  }}
                  style={{
                    background: isAutoPlay ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: isMobile ? '3px 7px' : '4px 10px',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Play size={10} />
                  <span>{isAutoPlay ? 'Tự động: BẬT' : 'Tự động'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const endIdx = activeDialogueList.length;
                    setCurrentDialogueIndex(endIdx);
                    onDialogueIndexChange?.(endIdx);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: isMobile ? '3px 7px' : '4px 10px',
                    fontSize: isMobile ? '10px' : '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FastForward size={10} />
                  <span>Tua nhanh</span>
                </button>
              </div>

              {/* Advance Indicator using Lucide Icon */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-secondary)',
                  fontSize: isMobile ? '10.5px' : '12px',
                  fontWeight: 700,
                }}
              >
                <span>{isLastDialogue ? (pendingChoiceTransition ? 'Tiếp tục' : 'Quyết định') : 'Chạm để tiếp tục'}</span>
                <ChevronDown size={13} />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* BRANCHING CHOICES MENU (AUTO GRID: 2-3 COLUMNS TO PREVENT SCROLLING) */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'rgba(24, 14, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              borderRadius: isMobile ? 'var(--radius-md)' : 'var(--radius-lg)',
              padding: isMobile ? '12px 10px' : '16px 22px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              maxHeight: isMobile ? '55dvh' : '50vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '8px' : '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--color-secondary)" />
                <h3 style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  {stepConfig.isEnding ? 'Hoàn Thành Màn Chơi!' : 'Lựa Chọn Của Bạn:'}
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
                {availableChoices.length} phương án
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? availableChoices.length <= 2
                    ? '1fr'
                    : 'repeat(2, 1fr)'
                  : availableChoices.length === 1
                    ? '1fr'
                    : availableChoices.length === 2
                      ? 'repeat(2, 1fr)'
                      : availableChoices.length === 3
                        ? 'repeat(3, 1fr)'
                        : availableChoices.length === 4
                          ? 'repeat(2, 1fr)'
                          : 'repeat(3, 1fr)',
                gap: isMobile ? '6px' : '8px',
              }}
            >
              {availableChoices.map((choice) => {
                const totalChoices = availableChoices.length;
                return (
                  <motion.button
                    key={choice.id}
                    whileHover={{ scale: 1.015, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChoice(choice);
                    }}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.09)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRadius: 'var(--radius-md)',
                      padding: isMobile
                        ? totalChoices >= 3
                          ? '8px 10px'
                          : '10px 12px'
                        : totalChoices >= 4
                          ? '10px 14px'
                          : '13px 16px',
                      color: '#FFFFFF',
                      fontSize: isMobile ? (totalChoices >= 3 ? '11.5px' : '12.5px') : (totalChoices >= 4 ? '13px' : '14px'),
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '6px' : '8px',
                      transition: 'all 0.18s ease',
                      minHeight: isMobile ? (totalChoices >= 3 ? '44px' : '48px') : '50px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.35)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.09)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                    }}
                  >
                    {renderChoiceIcon(choice.icon)}
                    <span style={{ flex: 1, lineHeight: 1.35, wordBreak: 'break-word' }}>
                      {resolveText(choice.text)}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* 5. POPUP MODAL: PROFILE INIT WITH GAME DATE PICKER */}
      <AnimatePresence>
        {activeModalAction?.type === 'profile_init' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 8, 28, 0.88)',
              backdropFilter: 'blur(12px)',
              zIndex: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="game-card"
              style={{ width: '100%', maxWidth: '440px', padding: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-background-secondary)',
                    color: 'var(--color-primary)',
                    marginBottom: '8px',
                  }}
                >
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {activeModalAction.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {activeModalAction.description || 'Chọn thông tin ban đầu cho nhân vật của bạn'}
                </p>
              </div>

              <form onSubmit={handleSubmitProfileInit}>
                {/* Gender Picker using Lucide Icons */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    Giới tính của bé:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGender('male');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: selectedGender === 'male' ? 'var(--color-background-secondary)' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      }}
                    >
                      <User size={22} color="var(--color-primary)" />
                      <span>Bé Trai (Nam)</span>
                    </button>

                    <button
                      type="button"
                      disabled
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Hiện tại chỉ mới có cốt truyện nhân vật Nam. Cốt truyện Nữ đang được cập nhật!');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--color-border)',
                        backgroundColor: '#F8FAFC',
                        cursor: 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: 'var(--color-text-disabled)',
                        opacity: 0.65,
                        position: 'relative',
                      }}
                      title="Hiện tại chỉ có cốt truyện nhân vật Nam"
                    >
                      <Heart size={20} color="var(--color-text-disabled)" />
                      <span>Bé Gái (Nữ)</span>
                      <span
                        style={{
                          fontSize: '10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 800,
                        }}
                      >
                        Chưa có cốt truyện
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dedicated GameDatePicker Component */}
                <div style={{ marginBottom: '20px' }}>
                  <GameDatePicker
                    value={birthdateInput}
                    onChange={setBirthdateInput}
                    label="Ngày tháng năm sinh:"
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  <Check size={18} />
                  <span>Xác Nhận & Chào Đời</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. POPUP MODAL: NAME PICKER */}
      <AnimatePresence>
        {activeModalAction?.type === 'name_picker' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 8, 28, 0.88)',
              backdropFilter: 'blur(12px)',
              zIndex: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="game-card"
              style={{ width: '100%', maxWidth: '440px', padding: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF3D6',
                    color: '#D98200',
                    marginBottom: '8px',
                  }}
                >
                  <Award size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {activeModalAction.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {activeModalAction.description || 'Nhập tên chính thức cho bé:'}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  className="game-input"
                  placeholder={activeModalAction.placeholder || 'Nhập tên của bạn...'}
                  value={characterNameInput}
                  onChange={(e) => setCharacterNameInput(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Suggestions */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  Gợi ý tên hay cho bé {selectedGender === 'female' ? 'gái' : 'trai'}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {nameSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCharacterNameInput(suggestion);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        background: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'var(--color-text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmitNamePicker(characterNameInput);
                }}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                <Check size={18} />
                <span>Xác Nhận Tên Này</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6.5. POPUP MODAL: BABY AVATAR PICKER (SWIPER) */}
      <AnimatePresence>
        {activeModalAction?.type === 'baby_avatar_select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 8, 28, 0.88)',
              backdropFilter: 'blur(12px)',
              zIndex: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="game-card"
              style={{
                width: '100%',
                maxWidth: isMobile ? '95vw' : '720px',
                padding: isMobile ? '16px 14px' : '28px 24px',
                maxHeight: '94vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <BabyAvatarPicker
                currentAvatar={selectedBabyAvatar || userProfile.babyAvatar || 'asset:baby_1'}
                characterName={userProfile.characterName || characterNameInput || 'Bé Cưng'}
                onSelectAvatar={handleSelectBabyAvatar}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6.6. POPUP MODAL: CHARACTER CUSTOMIZER (STAGE 3 MẪU GIÁO) */}
      <AnimatePresence>
        {activeModalAction?.type === 'character_customizer' && (
          <CharacterCustomizerModal
            initialConfig={userProfile.avatarConfig}
            characterName={userProfile.characterName || characterNameInput || 'Bé Con'}
            gender={userProfile.gender || selectedGender || 'male'}
            onConfirm={handleConfirmCharacterCustomizer}
            onClose={() => setActiveModalAction(null)}
          />
        )}
      </AnimatePresence>

      {/* 7. HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistoryModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 8, 28, 0.88)',
              backdropFilter: 'blur(12px)',
              zIndex: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              className="game-card"
              style={{
                width: '100%',
                maxWidth: '540px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--color-border)',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setHistoryTab('dialogues')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: historyTab === 'dialogues' ? 'var(--color-primary)' : 'var(--color-background-secondary)',
                      color: historyTab === 'dialogues' ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Hội Thoại
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryTab('actions')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: historyTab === 'actions' ? 'var(--color-primary)' : 'var(--color-background-secondary)',
                      color: historyTab === 'actions' ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Trace Quyết Định ({actionLogs.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {historyTab === 'dialogues' ? (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {activeDialogueList.slice(0, currentDialogueIndex + 1).map((d) => {
                    const char = stepConfig.characters[d.speakerId];
                    const isPlayer = char?.role === 'player';
                    const speakerName = char ? resolveText(char.name) : 'Người nói';
                    const fullText = resolveText(d.text, d);

                    return (
                      <div
                        key={d.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isPlayer ? 'var(--color-background-secondary)' : '#F8FAFC',
                          borderLeft: `3px solid ${isPlayer ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, color: isPlayer ? 'var(--color-primary)' : 'var(--color-secondary)', marginBottom: '2px' }}>
                          {speakerName}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                          {fullText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {actionLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-disabled)', fontSize: '13px', marginTop: '20px' }}>
                      Chưa có lịch sử thao tác nào.
                    </div>
                  ) : (
                    actionLogs.map((log) => {
                      const displayLogText = log.details || (log.choiceId ? `Đã chọn: ${log.choiceId}` : log.actionType);

                      return (
                        <div
                          key={log.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: log.actionType === 'CHOICE_SELECTED' ? 'rgba(255, 184, 77, 0.2)' : 'rgba(108, 92, 231, 0.15)',
                                  color: log.actionType === 'CHOICE_SELECTED' ? '#D98200' : 'var(--color-primary)',
                                }}
                              >
                                {log.actionType === 'CHOICE_SELECTED' ? 'LỰA CHỌN' : log.actionType === 'STAGE_COMPLETED' ? 'HOÀN THÀNH MÀN' : log.actionType === 'STAGE_SELECTED' ? 'CHỌN MÀN' : log.actionType === 'STAGE_RESTARTED' ? 'CHƠI LẠI' : 'HỒ SƠ'}
                              </span>

                              {log.choiceId && (
                                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-secondary)', fontFamily: 'monospace' }}>
                                  Mã: [{log.choiceId}]
                                </span>
                              )}
                            </div>

                            <span style={{ fontSize: '10px', color: 'var(--color-text-disabled)' }}>
                              {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>

                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {displayLogText}
                          </div>

                          {log.scoreReward && (
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', marginTop: '3px' }}>
                              +{log.scoreReward} Điểm thưởng
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN STAGE TITLE SPLASH (SHOWS FOR ~2.2 SECONDS) */}
      <AnimatePresence>
        {showTitleSplash && (
          <StageTitleSplash
            stageNumber={stepConfig.id === 'step_2_first_words' ? 2 : (stepConfig.stepNumber || 1)}
            stageName={resolveText(stepConfig.title || 'Màn Chơi Mới')}
            subtitle={resolveText(stepConfig.dayLabel || 'Hành trình cuộc đời tiếp diễn...')}
            onComplete={() => setShowTitleSplash(false)}
            durationMs={2200}
          />
        )}
      </AnimatePresence>

      {/* SMART TV WATCHING MODAL */}
      <TvWatchingModal
        isOpen={isTvOpen}
        characterName={userProfile.characterName || characterNameInput || 'Bé Con'}
        onClose={handleTvClose}
      />

      {/* TIKTOK FEED MODAL */}
      <TikTokFeedModal
        isOpen={isTikTokOpen}
        characterName={userProfile.characterName || characterNameInput || 'Bé Con'}
        onClose={handleTikTokClose}
      />
    </div>
  );
};
