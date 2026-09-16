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
} from 'lucide-react';
import { toast } from 'sonner';
import type { StoryStepConfig, DialogueLine, StoryChoice, StoryActionConfig } from '../../types/story';
import type { UserProfile, UserActionLog } from '../../types/game';
import { resolveAssetUrl } from '../../utils/assets';
import { GameDatePicker } from '../common/GameDatePicker';

interface StoryDialogueEngineProps {
  stepConfig: StoryStepConfig;
  userProfile?: UserProfile;
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

  // Floating score feedback
  const [floatingScore, setFloatingScore] = useState<number | null>(null);

  // Pending selected choice transition (after reaction dialogues finish)
  const [pendingChoiceTransition, setPendingChoiceTransition] = useState<StoryChoice | null>(null);

  // Audio refs & Typewriter timer ref
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentBgmUrlRef = useRef<string>('');
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
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(userProfile.gender || 'male');
  const [birthdateInput, setBirthdateInput] = useState(userProfile.birthdate || '2000-09-16');
  const [characterNameInput, setCharacterNameInput] = useState(userProfile.characterName || '');

  const currentDialogue: DialogueLine | undefined = activeDialogueList[currentDialogueIndex];
  const isLastDialogue = currentDialogueIndex >= activeDialogueList.length - 1;
  const showChoices = currentDialogueIndex >= activeDialogueList.length && !pendingChoiceTransition;

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
      handledTriggersRef.current = new Set(
        stepConfig.dialogues.slice(0, startIdx).map((d) => d.id)
      );
      onDialogueIndexChange?.(startIdx);
    }
  }, [stepConfig.id, stepConfig.dialogues, initialDialogueIndex, onDialogueIndexChange]);

  // BGM Priority Logic
  const activeBgmUrl = useMemo(() => {
    if (currentDialogue?.bgm) {
      return resolveAssetUrl(currentDialogue.bgm);
    }
    return stepConfig.bgm ? resolveAssetUrl(stepConfig.bgm) : '';
  }, [currentDialogue?.bgm, stepConfig.bgm]);

  // Manage BGM Audio playback
  useEffect(() => {
    if (!activeBgmUrl) {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
        currentBgmUrlRef.current = '';
      }
      return;
    }

    if (currentBgmUrlRef.current !== activeBgmUrl) {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }

      try {
        const audio = new Audio(activeBgmUrl);
        audio.loop = true;
        audio.volume = isMuted ? 0 : 0.6;
        audio.play().catch(() => {});
        bgmAudioRef.current = audio;
        currentBgmUrlRef.current = activeBgmUrl;
      } catch {
        // Safe fallback
      }
    }
  }, [activeBgmUrl, isMuted]);

  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = isMuted ? 0 : 0.6;
    }
  }, [isMuted]);

  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
      }
      if (sfxAudioRef.current) {
        sfxAudioRef.current.pause();
        sfxAudioRef.current = null;
      }
    };
  }, []);

  // SFX playback
  useEffect(() => {
    if (currentDialogue?.sfx && !isMuted) {
      try {
        const sfxUrl = resolveAssetUrl(currentDialogue.sfx);
        const sfx = new Audio(sfxUrl);
        sfx.volume = 0.8;
        sfx.play().catch(() => {});
        sfxAudioRef.current = sfx;
      } catch {
        // Safe fallback
      }
    }
  }, [currentDialogue?.id, currentDialogue?.sfx, isMuted]);

  // Current speaker resolution
  const currentSpeaker = useMemo(() => {
    if (!currentDialogue) {
      const firstNpc = Object.values(stepConfig.characters).find((c) => c.role === 'npc');
      return firstNpc || Object.values(stepConfig.characters)[0];
    }
    const char = stepConfig.characters[currentDialogue.speakerId];
    if (!char) return null;

    let resolvedName = char.name;
    if (resolvedName.includes('{characterName}')) {
      resolvedName = resolvedName.replace('{characterName}', userProfile.characterName || 'Bé Con');
    }
    return {
      ...char,
      name: resolvedName,
      side: currentDialogue.side || char.side,
    };
  }, [currentDialogue, stepConfig.characters, userProfile.characterName]);

  // Dynamic text resolution
  const resolvedFullText = useMemo(() => {
    if (!currentDialogue) return '';
    let text = currentDialogue.text;

    const gender = userProfile.gender || selectedGender || 'male';
    const genderLabel = gender === 'female' ? 'gái' : 'trai';
    text = text.replace(/\{gender\}/g, gender);
    text = text.replace(/\{gender_label\}/g, genderLabel);

    text = text.replace(/\{characterName\}/g, userProfile.characterName || characterNameInput || 'Bé Con');
    text = text.replace(/\{birthdate\}/g, userProfile.birthdate || birthdateInput || 'Hôm nay');

    if (currentDialogue.varMap) {
      Object.entries(currentDialogue.varMap).forEach(([varKey, mapping]) => {
        const placeholder = `{${varKey}}`;
        if (text.includes(placeholder)) {
          let replacementValue = cachedVariables[`${stepConfig.id}_${currentDialogue.id}_${varKey}`];

          if (!replacementValue) {
            if (typeof mapping === 'object' && mapping.fromPool && stepConfig.randomPools) {
              const pool = stepConfig.randomPools[mapping.fromPool];
              if (pool) {
                if (Array.isArray(pool)) {
                  replacementValue = pool[Math.floor(Math.random() * pool.length)];
                } else if (typeof pool === 'object') {
                  const subPool = pool[gender] || pool.male || [];
                  replacementValue = subPool[Math.floor(Math.random() * subPool.length)] || 'Bé Cưng';
                }
              }
            } else if (typeof mapping === 'string') {
              replacementValue = mapping;
            }

            if (replacementValue) {
              setCachedVariables((prev) => ({
                ...prev,
                [`${stepConfig.id}_${currentDialogue.id}_${varKey}`]: replacementValue,
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
  }, [
    currentDialogue,
    userProfile,
    selectedGender,
    characterNameInput,
    birthdateInput,
    cachedVariables,
    stepConfig,
  ]);

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

    setIsTyping(true);
    setDisplayedText('');

    let charIndex = 0;
    const fullText = resolvedFullText;

    typewriterTimerRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        if (typewriterTimerRef.current) {
          clearInterval(typewriterTimerRef.current);
          typewriterTimerRef.current = null;
        }
      }
    }, 22);

    return () => {
      if (typewriterTimerRef.current) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
    };
  }, [currentDialogueIndex, resolvedFullText, showChoices, activeModalAction, activeDialogueList]);

  // Advance dialogue callback
  const handleNextDialogue = useCallback(() => {
    if (activeModalAction || showHistoryModal) return;

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
        onStepChoice(pendingChoiceTransition);
        setPendingChoiceTransition(null);
      } else {
        const nextIdx = activeDialogueList.length;
        setCurrentDialogueIndex(nextIdx);
        onDialogueIndexChange?.(nextIdx);
      }
    }
  }, [
    activeModalAction,
    showHistoryModal,
    isTyping,
    resolvedFullText,
    currentDialogueIndex,
    activeDialogueList.length,
    pendingChoiceTransition,
    onStepChoice,
    onDialogueIndexChange,
  ]);

  // Global Keyboard Navigation Listener: Any key advances dialogue except inputs / modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalAction || showHistoryModal || showChoices) return;

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
  }, [activeModalAction, showHistoryModal, showChoices, handleNextDialogue]);

  // Global screen click handler
  const handleGlobalScreenClick = (e: React.MouseEvent) => {
    if (activeModalAction || showHistoryModal || showChoices) return;

    const target = e.target as HTMLElement;
    // Don't advance if clicked on any interactive button, input, select, form, or element marked as no-advance
    if (target.closest('button, input, select, textarea, form, a, [data-no-advance="true"]')) {
      return;
    }

    handleNextDialogue();
  };

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay || isTyping || showChoices || activeModalAction) return;

    const autoTimer = setTimeout(() => {
      handleNextDialogue();
    }, 2600);

    return () => clearTimeout(autoTimer);
  }, [isAutoPlay, isTyping, showChoices, activeModalAction, currentDialogueIndex, activeDialogueList, handleNextDialogue]);

  // User selects an option
  const handleSelectChoice = (choice: StoryChoice) => {
    const scoreGain = typeof choice.scoreReward === 'number' ? choice.scoreReward : 100;
    if (scoreGain > 0) {
      setFloatingScore(scoreGain);
      toast.success(`Nhận thưởng +${scoreGain} điểm!`);

      setTimeout(() => {
        setFloatingScore(null);
      }, 2000);
    }

    if (choice.reactionDialogues && choice.reactionDialogues.length > 0) {
      setPendingChoiceTransition(choice);
      setActiveDialogueList(choice.reactionDialogues);
      setCurrentDialogueIndex(0);
      setDisplayedText('');
      setIsTyping(false);
    } else {
      onStepChoice(choice);
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
        return <Sparkles size={16} color="var(--color-secondary)" />;
    }
  };

  return (
    <div
      onClick={handleGlobalScreenClick}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
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
          backgroundImage: `url(${resolveAssetUrl(stepConfig.background.url)})`,
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
              {stepConfig.locationName || stepConfig.title}
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

        {/* Right: Day Tag, Audio Mute & Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <span>{stepConfig.dayLabel || `Step ${stepConfig.stepNumber}`}</span>
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

      {/* 3. CHARACTERS STAGE: GROUNDED AT BOTTOM: 0 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'flex-end',
          padding: isMobile ? '0 16px' : '0 48px',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {isMobile ? (
          /* MOBILE MODE: ONLY RENDER 1 ACTIVE CHARACTER GROUNDED TO BOTTOM */
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
                filter: 'brightness(1.06) drop-shadow(0 14px 32px rgba(0, 0, 0, 0.65))',
              }}
            >
              <img
                src={resolveAssetUrl(currentSpeaker.sprite)}
                alt={currentSpeaker.name}
                style={{
                  maxHeight: '68vh',
                  maxWidth: '88vw',
                  objectFit: 'contain',
                  display: 'block',
                  verticalAlign: 'bottom',
                  marginBottom: 0,
                }}
              />
            </motion.div>
          ) : null
        ) : (
          /* DESKTOP / TABLET MODE: GROUNDED AT BOTTOM: 0 WITH SPOTLIGHT & DARKENING (25% BIGGER) */
          <>
            {/* LEFT CHARACTERS */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', alignSelf: 'flex-end' }}>
              {Object.values(stepConfig.characters)
                .filter((c) => c.side === 'left' && c.sprite)
                .map((char) => {
                  const isSpeaking = currentSpeaker?.id === char.id;
                  return (
                    <motion.div
                      key={char.id}
                      animate={{
                        scale: isSpeaking ? 1.04 : 0.95,
                        y: isSpeaking ? 0 : 8,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        alignSelf: 'flex-end',
                        opacity: 1,
                        zIndex: isSpeaking ? 8 : 4,
                        filter: isSpeaking
                          ? 'brightness(1.06) drop-shadow(0 16px 36px rgba(108, 92, 231, 0.55))'
                          : 'brightness(0.42) contrast(0.88)',
                        transition: 'filter 0.3s ease',
                      }}
                    >
                      <img
                        src={resolveAssetUrl(char.sprite)}
                        alt={char.name}
                        style={{
                          maxHeight: '92vh',
                          maxWidth: '425px',
                          objectFit: 'contain',
                          display: 'block',
                          verticalAlign: 'bottom',
                          marginBottom: 0,
                        }}
                      />
                    </motion.div>
                  );
                })}
            </div>

            {/* RIGHT CHARACTERS */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', alignSelf: 'flex-end' }}>
              {Object.values(stepConfig.characters)
                .filter((c) => c.side === 'right' && c.sprite)
                .map((char) => {
                  const isSpeaking = currentSpeaker?.id === char.id;
                  return (
                    <motion.div
                      key={char.id}
                      animate={{
                        scale: isSpeaking ? 1.04 : 0.95,
                        y: isSpeaking ? 0 : 8,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        alignSelf: 'flex-end',
                        opacity: 1,
                        zIndex: isSpeaking ? 8 : 4,
                        filter: isSpeaking
                          ? 'brightness(1.06) drop-shadow(0 16px 36px rgba(59, 130, 246, 0.55))'
                          : 'brightness(0.42) contrast(0.88)',
                        transition: 'filter 0.3s ease',
                      }}
                    >
                      <img
                        src={resolveAssetUrl(char.sprite)}
                        alt={char.name}
                        style={{
                          maxHeight: '92vh',
                          maxWidth: '425px',
                          objectFit: 'contain',
                          display: 'block',
                          verticalAlign: 'bottom',
                          marginBottom: 0,
                        }}
                      />
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
          padding: isMobile ? '12px 14px 18px 14px' : '16px 40px 24px 40px',
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
              backgroundColor: 'rgba(24, 14, 42, 0.92)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255, 255, 255, 0.22)',
              borderRadius: isMobile ? 'var(--radius-md)' : 'var(--radius-lg)',
              padding: isMobile ? '18px 16px 14px 16px' : '22px 28px 18px 28px',
              cursor: 'pointer',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              minHeight: isMobile ? '110px' : '130px',
            }}
          >
            {/* SPEAKER NAME PLATE */}
            {currentSpeaker && (
              <div
                style={{
                  position: 'absolute',
                  top: isMobile ? '-14px' : '-16px',
                  left: isMobile ? '16px' : currentSpeaker.side === 'left' ? '28px' : 'auto',
                  right: isMobile ? 'auto' : currentSpeaker.side === 'right' ? '28px' : 'auto',
                  backgroundColor: currentSpeaker.color || 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: isMobile ? '4px 14px' : '6px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: 800,
                  letterSpacing: '0.3px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{currentSpeaker.name}</span>
              </div>
            )}

            {/* DIALOGUE TEXT CONTENT */}
            <p
              style={{
                fontSize: isMobile ? '14px' : '15px',
                lineHeight: 1.6,
                color: '#FFFFFF',
                fontWeight: 600,
                marginTop: '4px',
                minHeight: isMobile ? '40px' : '48px',
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
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoPlay(!isAutoPlay);
                  }}
                  style={{
                    background: isAutoPlay ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Play size={11} />
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
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <FastForward size={11} />
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
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: 700,
                }}
              >
                <span>{isLastDialogue ? (pendingChoiceTransition ? 'Tiếp tục câu chuyện' : 'Đưa ra quyết định') : 'Chạm/Nhấn phím để tiếp tục'}</span>
                <ChevronDown size={14} />
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* BRANCHING CHOICES MENU (CLEAN - NO PREVIEW SCORE) */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'rgba(24, 14, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              borderRadius: isMobile ? 'var(--radius-md)' : 'var(--radius-lg)',
              padding: isMobile ? '16px 14px' : '22px 28px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
              maxHeight: '45vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={18} color="var(--color-secondary)" />
              <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 800, color: '#FFFFFF' }}>
                {stepConfig.isEnding ? 'Hoàn Thành Màn Chơi!' : 'Lựa Chọn Của Bạn (Quyết Định Tương Lai):'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stepConfig.choices?.map((choice) => (
                <motion.button
                  key={choice.id}
                  whileHover={{ scale: 1.012, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectChoice(choice);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: isMobile ? '12px 14px' : '14px 18px',
                    color: '#FFFFFF',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'left',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(108, 92, 231, 0.35)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                    {renderChoiceIcon(choice.icon)}
                  </div>
                  <span style={{ flex: 1 }}>{choice.text}</span>
                </motion.button>
              ))}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGender('female');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${selectedGender === 'female' ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        backgroundColor: selectedGender === 'female' ? '#FFF0F3' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: selectedGender === 'female' ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      }}
                    >
                      <Heart size={22} color="var(--color-accent)" />
                      <span>Bé Gái (Nữ)</span>
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

      {/* 7. HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
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
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Lời Thoại ({activeDialogueList.slice(0, currentDialogueIndex + 1).length})
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
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Quyết Định & Trace ({actionLogs.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {historyTab === 'dialogues' ? (
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                  {activeDialogueList.slice(0, currentDialogueIndex + 1).map((d) => {
                    const speaker = stepConfig.characters[d.speakerId];
                    return (
                      <div
                        key={d.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-background-secondary)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: speaker?.color || 'var(--color-primary)' }}>
                            {speaker?.name || 'Nhân vật'}
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-disabled)', fontFamily: 'monospace' }}>
                            ID: {d.id}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', marginTop: '2px', color: 'var(--color-text-primary)' }}>
                          {d.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                  {actionLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                      Chưa có quyết định nào được lưu lại trong phiên này.
                    </div>
                  ) : (
                    actionLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-background-secondary)',
                          borderLeft: log.actionType === 'CHOICE_SELECTED' ? '3px solid var(--color-secondary)' : log.actionType === 'STAGE_COMPLETED' ? '3px solid var(--color-success)' : '3px solid var(--color-primary)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
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
                              {log.actionType === 'CHOICE_SELECTED' ? 'LỰA CHỌN' : log.actionType === 'STAGE_COMPLETED' ? 'HOÀN THÀNH MÀN' : log.actionType === 'STAGE_SELECTED' ? 'CHỌN MÀN' : 'HỒ SƠ'}
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
                          {log.choiceText || log.stageName || log.actionType}
                        </div>

                        {log.scoreReward && (
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', marginTop: '3px' }}>
                            +{log.scoreReward} Điểm thưởng
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
