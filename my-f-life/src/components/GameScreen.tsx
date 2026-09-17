import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Clock,
  LogOut,
  CheckCircle2,
  Flame,
  Lock,
  Play,
  Award,
  BookOpen,
  Music,
  SkipForward,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { StageData, UserProfile, UserActionLog } from '../types/game';
import type { StoryChoice } from '../types/story';
import { useGameStore } from '../stores/useGameStore';
import { StoryDialogueEngine } from './game/StoryDialogueEngine';
import { TadpoleRaceScreen } from './game/tadpole/TadpoleRaceScreen';
import { FertilizationCinemaCutscene } from './game/cutscenes/FertilizationCinemaCutscene';
import type { WinnerInfo } from '../game/tadpole/GameEngine';
import storyStagesData from '../data/storyStages.json';
import { backgroundMusicManager } from '../services/backgroundMusicManager';
import { CharacterAvatarRenderer } from './game/character/CharacterAvatarRenderer';

export const GameScreen: React.FC = () => {
  const currentUser = useGameStore((state) => state.currentUser);
  const currentSession = useGameStore((state) => state.currentSession);
  const currentRoute = useGameStore((state) => state.currentRoute);
  const navigate = useGameStore((state) => state.navigate);
  const updateUserProgress = useGameStore((state) => state.updateUserProgress);
  const updateUserProfile = useGameStore((state) => state.updateUserProfile);
  const updateDialogueProgress = useGameStore((state) => state.updateDialogueProgress);
  const logUserAction = useGameStore((state) => state.logUserAction);
  const logout = useGameStore((state) => state.logout);

  const [activeView, setActiveView] = useState<'story' | 'dashboard' | 'fertilization_cutscene'>(() => {
    return currentRoute === '/menu' ? 'dashboard' : 'story';
  });
  const [isFlashFading, setIsFlashFading] = useState(false);
  const [isMuted, setIsMuted] = useState(backgroundMusicManager.isMuted);
  const [currentTrackInfo, setCurrentTrackInfo] = useState(() => backgroundMusicManager.getCurrentTrack());
  const [confirmReplayStage, setConfirmReplayStage] = useState<StageData | null>(null);

  // Lắng nghe cập nhật bài hát & mute từ Background Music Manager
  useEffect(() => {
    return backgroundMusicManager.subscribe(() => {
      setCurrentTrackInfo(backgroundMusicManager.getCurrentTrack());
      setIsMuted(backgroundMusicManager.isMuted);
    });
  }, []);

  // Đảm bảo nhạc nền luôn phát ở Menu
  useEffect(() => {
    if (activeView === 'dashboard') {
      backgroundMusicManager.startBackgroundMusic();
    }
  }, [activeView]);

  // Tạm dừng hoàn toàn nhạc nền khi ở Màn Đua (stage_0) hoặc Rạp Chiếu Phim (fertilization_cutscene)
  useEffect(() => {
    if (activeView === 'fertilization_cutscene' || (activeView === 'story' && currentUser?.currentStageId === 'stage_0')) {
      backgroundMusicManager.pauseBackgroundMusic();
    }
  }, [activeView, currentUser?.currentStageId]);

  // Đồng bộ route khi activeView thay đổi hoặc khi người dùng back/forward
  useEffect(() => {
    if (currentRoute === '/menu' && activeView !== 'dashboard') {
      setActiveView('dashboard');
    } else if (currentRoute === '/game' && activeView === 'dashboard') {
      setActiveView('story');
    }
  }, [currentRoute]);

  const goToMenu = () => {
    setActiveView('dashboard');
    navigate('/menu');
    backgroundMusicManager.playRandomTrack();
  };

  const goToGame = () => {
    setActiveView('story');
    navigate('/game');
  };

  if (!currentUser) return null;

  const currentStage = currentUser.stages.find((s) => s.id === currentUser.currentStageId) || currentUser.stages[0];
  const stageStoryConfig = (storyStagesData as any)[currentStage.id];
  const currentStepId = currentUser.currentStepId || stageStoryConfig?.initialStepId || 'step_1_birth';
  const activeStepConfig = stageStoryConfig?.steps[currentStepId] || stageStoryConfig?.steps[stageStoryConfig?.initialStepId || 'step_1_birth'];

  // Xử lý khi chiến thắng Cuộc Đua Chuyển Sinh (Tadpole Race)
  const handleTadpoleVictory = (_winner: WinnerInfo) => {
    const bonusScore = 200;

    // Ghi log hoàn thành Cuộc Đua Chuyển Sinh
    logUserAction({
      actionType: 'STAGE_COMPLETED',
      stageId: 'stage_0',
      stageName: 'Cuộc Đua Chuyển Sinh',
      scoreReward: bonusScore,
      metadata: {
        winnerType: 'player',
        note: 'Nòng nọc người thường thắng cuộc đua chuyển sinh',
      },
    });

    // Cập nhật stage_0 thành completed và mở khóa stage_1
    const updatedStages = currentUser.stages.map((stage) => {
      if (stage.id === 'stage_0') {
        return {
          ...stage,
          currentStep: 1,
          score: bonusScore,
          status: 'completed' as StageData['status'],
        };
      }
      if (stage.id === 'stage_1') {
        return {
          ...stage,
          currentStep: 1,
          status: 'in_progress' as StageData['status'],
        };
      }
      return stage;
    });

    const newTotalScore = updatedStages.reduce((sum, s) => sum + s.score, 0);

    const updatedUser = {
      ...currentUser,
      currentStageId: 'stage_1',
      currentStepId: 'step_1_birth',
      currentDialogueIndex: 0,
      totalScore: newTotalScore,
      stages: updatedStages,
      lastPlayedAt: new Date().toISOString(),
    };

    updateUserProgress(updatedUser);
    toast.success(`Chuyển sinh thành công! Bắt đầu hành trình hình thành sinh linh (+${bonusScore}đ)`);
    setActiveView('fertilization_cutscene');
  };

  const formatActionLogText = (log: UserActionLog, profile?: UserProfile): string => {
    const gender = profile?.gender || 'male';
    const genderLabel = gender === 'female' ? 'gái' : 'trai';
    const charName = profile?.characterName || 'Bé Con';
    const birth = profile?.birthdate || 'Hôm nay';

    const resolveRaw = (text: string) => {
      if (!text) return '';
      return text
        .replace(/\{gender\}/g, gender)
        .replace(/\{gender_label\}/g, genderLabel)
        .replace(/\{gender_value\}/g, genderLabel)
        .replace(/\{characterName\}/g, charName)
        .replace(/\{character_name\}/g, charName)
        .replace(/\{name\}/g, charName)
        .replace(/\{birthdate\}/g, birth)
        .replace(/\{names\}/g, charName);
    };

    if (log.actionType === 'CHOICE_SELECTED') {
      return resolveRaw(log.choiceText || 'Đã đưa ra quyết định');
    }
    if (log.actionType === 'PROFILE_INITIALIZED') {
      const g = log.metadata?.gender || gender;
      const b = log.metadata?.birthdate || birth;
      return `Khởi tạo hồ sơ: Giới tính Bé ${g === 'female' ? 'Gái' : 'Trai'}${b ? ` (Sinh ngày ${b})` : ''}`;
    }
    if (log.actionType === 'CHARACTER_NAMED') {
      const name = log.metadata?.characterName || charName;
      return `Khai sinh đặt tên bé: "${name}"`;
    }
    if (log.actionType === 'CHARACTER_CUSTOMIZED') {
      return `Tùy chỉnh diện mạo bé mẫu giáo: ${log.details || 'Thời trang mầm non'}`;
    }
    if (log.actionType === 'STAGE_STARTED') {
      return `Bắt đầu màn: ${log.stageName || log.stageId}`;
    }
    if (log.actionType === 'STAGE_RESTARTED') {
      return `Chơi lại từ đầu màn: ${log.stageName || log.stageId} (Đã làm mới điểm)`;
    }
    if (log.actionType === 'STAGE_COMPLETED') {
      return `Hoàn thành xuất sắc: ${log.stageName || log.stageId}`;
    }
    return resolveRaw(log.choiceText || log.stageName || log.actionType);
  };

  // Xử lý lựa chọn trong StoryDialogueEngine
  const handleStoryChoice = (choice: StoryChoice) => {
    const scoreGain = typeof choice.scoreReward === 'number' ? choice.scoreReward : 100;
    const gender = currentUser.profile?.gender || 'male';
    const genderLabel = gender === 'female' ? 'gái' : 'trai';
    const charName = currentUser.profile?.characterName || 'Bé Con';
    const birth = currentUser.profile?.birthdate || 'Hôm nay';

    const resolvedChoiceText = choice.text
      .replace(/\{gender\}/g, gender)
      .replace(/\{gender_label\}/g, genderLabel)
      .replace(/\{gender_value\}/g, genderLabel)
      .replace(/\{characterName\}/g, charName)
      .replace(/\{character_name\}/g, charName)
      .replace(/\{name\}/g, charName)
      .replace(/\{birthdate\}/g, birth)
      .replace(/\{names\}/g, charName);

    if (scoreGain > 0) {
      toast.success(`Lựa chọn: ${resolvedChoiceText.slice(0, 30)}... (+${scoreGain}đ)`);
    } else {
      toast.info(`Lựa chọn: ${resolvedChoiceText.slice(0, 30)}...`);
    }

    // Ghi log hành động lựa chọn kèm mã định danh choice.id
    logUserAction({
      actionType: 'CHOICE_SELECTED',
      stageId: currentStage.id,
      stageName: currentStage.name,
      stepId: currentStepId,
      choiceId: choice.id,
      choiceText: resolvedChoiceText,
      scoreReward: scoreGain,
      metadata: {
        nextStepId: choice.nextStepId,
        statEffects: choice.statEffects,
      },
    });

    if (choice.nextStepId === 'stage_completed') {
      handleCompleteCurrentStage(scoreGain);
      return;
    }

    if (choice.nextStepId && stageStoryConfig?.steps?.[choice.nextStepId]) {
      const nextStepConfig = stageStoryConfig.steps[choice.nextStepId];

      // Cập nhật tiến độ step trong stage
      const updatedStages = currentUser.stages.map((stage) => {
        if (stage.id === currentStage.id) {
          return {
            ...stage,
            currentStep: nextStepConfig.stepNumber,
            score: stage.score + scoreGain,
          };
        }
        return stage;
      });

      const newTotalScore = updatedStages.reduce((sum, s) => sum + s.score, 0);
      updateUserProgress({
        ...currentUser,
        currentStageId: currentStage.id,
        currentStepId: choice.nextStepId,
        currentDialogueIndex: 0,
        totalScore: newTotalScore,
        stages: updatedStages,
      });
    }
  };

  // Hoàn thành toàn bộ stage
  const handleCompleteCurrentStage = (finalBonus: number = 500) => {
    // Ghi log hoàn thành màn chơi
    logUserAction({
      actionType: 'STAGE_COMPLETED',
      stageId: currentStage.id,
      stageName: currentStage.name,
      scoreReward: finalBonus,
      metadata: {
        totalSteps: currentStage.totalSteps,
        finalScore: currentStage.score + finalBonus,
      },
    });

    const updatedStages = currentUser.stages.map((stage) => {
      if (stage.id === currentStage.id) {
        return {
          ...stage,
          currentStep: stage.totalSteps,
          score: stage.score + finalBonus,
          status: 'completed' as StageData['status'],
        };
      }
      return stage;
    });

    const currentIndex = updatedStages.findIndex((s) => s.id === currentStage.id);
    let nextStageId = currentUser.currentStageId;
    let nextStepId = 'step_1_birth';

    if (currentIndex + 1 < updatedStages.length) {
      const nextStage = updatedStages[currentIndex + 1];
      if (nextStage.status === 'locked') {
        nextStage.status = 'in_progress';
        nextStage.currentStep = 1;
      }
      nextStageId = nextStage.id;
      const nextStageConfig = (storyStagesData as any)[nextStageId];
      nextStepId = nextStageConfig?.initialStepId || (nextStageId === 'stage_2' ? 'step_2_first_words' : 'step_1_birth');
    }

    const newTotalScore = updatedStages.reduce((sum, s) => sum + s.score, 0);

    const updatedUser = {
      ...currentUser,
      currentStageId: nextStageId,
      currentStepId: nextStepId,
      currentDialogueIndex: 0,
      totalScore: newTotalScore,
      stages: updatedStages,
      lastPlayedAt: new Date().toISOString(),
    };

    updateUserProgress(updatedUser);

    // Tự động chuyển ngay sang màn tiếp theo mà không cần phải thoát ra menu
    if (currentIndex + 1 < updatedStages.length) {
      toast.success(`🎉 Hoàn thành "${currentStage.name}"! Tự động chuyển sang màn tiếp theo...`);
      goToGame();
    } else {
      toast.success(`🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc tất cả các màn chơi!`);
      goToMenu();
    }
  };

  // Chơi tiếp hoặc vào màn đang chơi
  const handlePlayStage = (stage: StageData) => {
    logUserAction({
      actionType: 'STAGE_SELECTED',
      stageId: stage.id,
      stageName: stage.name,
      metadata: {
        status: stage.status,
        currentStep: stage.currentStep,
      },
    });
    updateUserProgress({
      ...currentUser,
      currentStageId: stage.id,
      currentStepId: stage.id === 'stage_0' ? 'step_race' : (currentUser.currentStepId || 'step_1_birth'),
    });
    goToGame();
  };

  // Xác nhận chơi lại màn chơi: Xóa toàn bộ điểm màn đó VÀ các màn tiếp theo, reset tiến trình và khóa lại
  const handleConfirmReplay = (stage: StageData) => {
    const stageConfig = (storyStagesData as any)[stage.id];
    const initialStepId = stage.id === 'stage_0' ? 'step_race' : (stageConfig?.initialStepId || 'step_1_birth');

    const replayingIndex = currentUser.stages.findIndex((s) => s.id === stage.id);
    const subsequentStages = currentUser.stages.filter((_, idx) => idx > replayingIndex);

    // 1. Reset điểm và bước của màn chơi này VÀ tất cả các màn tiếp theo
    const updatedStages = currentUser.stages.map((s, idx) => {
      if (idx === replayingIndex) {
        return {
          ...s,
          currentStep: stage.id === 'stage_0' ? 0 : 1,
          score: 0,
          status: 'in_progress' as const,
        };
      }
      if (idx > replayingIndex) {
        return {
          ...s,
          currentStep: 0,
          score: 0,
          status: 'locked' as const,
        };
      }
      return s; // Giữ nguyên các màn trước đó (ví dụ stage_0 khi chơi lại stage_1)
    });

    const newTotalScore = updatedStages.reduce((sum, s) => sum + s.score, 0);

    // 2. Xóa các lựa chọn thuộc màn này và tất cả các màn tiếp theo
    const affectedStageIds = currentUser.stages.slice(replayingIndex).map((s) => s.id);
    const affectedPrefixes = affectedStageIds.map((id) => id.replace('stage_', ''));

    const updatedChoiceIds = (currentUser.selectedChoiceIds || []).filter((cId) => {
      return (
        !affectedStageIds.some((sId) => cId.startsWith(sId)) &&
        !affectedPrefixes.some((pfx) => cId.startsWith(`${pfx}.`))
      );
    });

    // 3. Reset profile nếu cần (chơi lại Màn 1 hoặc Màn 0)
    let updatedProfile = { ...currentUser.profile };
    if (stage.id === 'stage_1' || stage.id === 'stage_0') {
      updatedProfile = {
        ...updatedProfile,
        characterName: '',
        babyAvatar: '',
      };
    } else if (stage.id === 'stage_2') {
      updatedProfile = {
        ...updatedProfile,
        babyAvatar: '',
      };
    }

    // 4. Ghi log trace chơi lại
    logUserAction({
      actionType: 'STAGE_RESTARTED',
      stageId: stage.id,
      stageName: stage.name,
      scoreReward: 0,
      metadata: {
        previousScore: stage.score,
        clearedSubsequentStages: subsequentStages.map((s) => s.name).join(', '),
        note: `Chơi lại màn "${stage.name}", đã xóa ${stage.score}đ của màn này và khóa lại ${subsequentStages.length} màn tiếp theo`,
      },
    });

    // 5. Lưu progress và chuyển vào game
    updateUserProgress({
      ...currentUser,
      currentStageId: stage.id,
      currentStepId: initialStepId,
      currentDialogueIndex: 0,
      totalScore: newTotalScore,
      stages: updatedStages,
      selectedChoiceIds: updatedChoiceIds,
      profile: updatedProfile,
      lastPlayedAt: new Date().toISOString(),
    });

    setConfirmReplayStage(null);
    toast.info(`Đã làm mới "${stage.name}" và toàn bộ tiến trình phía sau!`);
    goToGame();
  };

  const handleUpdateProfile = (profileUpdate: Partial<UserProfile>, nextDialogueIndex?: number) => {
    if (profileUpdate.gender || profileUpdate.birthdate) {
      logUserAction({
        actionType: 'PROFILE_INITIALIZED',
        stageId: currentStage.id,
        stageName: currentStage.name,
        stepId: currentStepId,
        metadata: {
          gender: profileUpdate.gender,
          birthdate: profileUpdate.birthdate,
        },
      });
    }

    if (profileUpdate.characterName) {
      logUserAction({
        actionType: 'CHARACTER_NAMED',
        stageId: currentStage.id,
        stageName: currentStage.name,
        stepId: currentStepId,
        metadata: {
          characterName: profileUpdate.characterName,
        },
      });
    }

    if (profileUpdate.avatarConfig) {
      logUserAction({
        actionType: 'CHARACTER_CUSTOMIZED',
        stageId: currentStage.id,
        stageName: currentStage.name,
        stepId: currentStepId,
        details: 'Phối đồ đi học Mẫu Giáo (+500đ)',
        scoreReward: 500,
        metadata: {
          avatarConfig: profileUpdate.avatarConfig,
        },
      });
    }

    updateUserProfile(profileUpdate, nextDialogueIndex);
  };

  const handleDialogueIndexChange = (index: number) => {
    updateDialogueProgress(index);
  };

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất phiên chơi');
  };

  // 1. NẾU ĐANG Ở CHẾ ĐỘ STORY VÀ LÀ CUỘC ĐUA CHUYỂN SINH (TADPOLE RACE)
  if (activeView === 'story' && currentUser.currentStageId === 'stage_0') {
    return (
      <TadpoleRaceScreen
        onVictory={handleTadpoleVictory}
        onBackToDashboard={goToMenu}
      />
    );
  }

  // 1.5 NẾU ĐANG CHIẾU THƯỚC PHIM CHUYỂN SINH (RẠP CHIẾU PHIM THỤ TINH -> PHÔI THAI -> FLASHBANG)
  if (activeView === 'fertilization_cutscene') {
    return (
      <FertilizationCinemaCutscene
        onExplode={() => {
          setIsFlashFading(true);
          goToGame();
        }}
      />
    );
  }

  // 2. NẾU ĐANG Ở CHẾ ĐỘ STORY VÀ CÓ CONFIG THOẠI (STAGE 1 TRỞ ĐI)
  if (activeView === 'story' && activeStepConfig) {
    return (
      <>
        <StoryDialogueEngine
          key={`${currentUser.currentStageId}_${activeStepConfig.id}`}
          stepConfig={activeStepConfig}
          userProfile={currentUser.profile}
          selectedChoiceIds={currentUser.selectedChoiceIds || []}
          initialDialogueIndex={currentUser.currentDialogueIndex || 0}
          actionLogs={currentUser.actionLogs || []}
          onDialogueIndexChange={handleDialogueIndexChange}
          onUpdateProfile={handleUpdateProfile}
          onStepChoice={handleStoryChoice}
          onStageCompleted={handleCompleteCurrentStage}
          onBackToDashboard={goToMenu}
        />

        {/* Hiệu ứng Flashbang trắng xóa lâu gấp 3 lần hé lộ Màn 1 */}
        <AnimatePresence>
          {isFlashFading && (
            <motion.div
              key="flash-fade-overlay"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 7.5, // Lâu gấp 3 lần
                times: [0, 0.45, 1], // Giữ trắng xóa 100% trong ~3.4 giây, sau đó tan mờ dần sang Màn 1
                ease: [0.22, 1, 0.36, 1],
              }}
              onAnimationComplete={() => setIsFlashFading(false)}
              style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100dvh',
                backgroundColor: '#FFFFFF',
                zIndex: 999999,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // CHẾ ĐỘ DASHBOARD TIẾN ĐỘ
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        maxWidth: '680px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Brand Header with Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '4px 0 0 0',
        }}
      >
        <motion.img
          whileHover={{ scale: 1.08, rotate: 3 }}
          src="/logo.png"
          alt="Logo Game"
          style={{
            width: '44px',
            height: '44px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.45))',
          }}
        />
        <div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#F5F0FF',
              letterSpacing: '-0.3px',
              margin: 0,
              textShadow: '0 2px 10px rgba(168, 85, 247, 0.4)',
            }}
          >
            Cuộc Đời Của Tôi
          </h1>
          <p style={{ fontSize: '12px', color: '#D8B4FE', margin: 0, fontWeight: 600 }}>
            Hành trình mô phỏng cuộc đời
          </p>
        </div>
      </div>

      {/* 1. TOP MAIN HEADER */}
      <div className="game-card" style={{ padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* User Info & Profile */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-primary)',
                  fontWeight: 900,
                  overflow: 'hidden',
                  border: '1.5px solid var(--color-border)',
                }}
              >
                {currentUser.profile?.avatarConfig ? (
                  <CharacterAvatarRenderer config={currentUser.profile.avatarConfig} width={40} height={50} showShadow={false} />
                ) : (
                  <User size={20} />
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {currentUser.username}
                  </h2>
                  {currentUser.profile?.characterName && (
                    <span className="badge badge-primary" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      Nhân vật: {currentUser.profile.characterName}
                    </span>
                  )}
                </div>

                {currentSession && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    <Clock size={12} color="var(--color-success)" />
                    <span>Phiên 24h</span>
                    {currentUser.profile?.birthdate && (
                      <span style={{ marginLeft: '6px' }}>• Sinh ngày: <b>{currentUser.profile.birthdate}</b></span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Mode, Music Player & Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Music Player Widget */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 8px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Music size={14} color="var(--color-primary)" />
                <span
                  style={{
                    maxWidth: '120px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                    fontSize: '11px',
                    color: 'var(--color-text-primary)',
                  }}
                  title={`Đang phát: ${currentTrackInfo.title} - ${currentTrackInfo.artist}`}
                >
                  {currentTrackInfo.title}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    backgroundMusicManager.playNextTrack();
                    toast.info(`Chuyển bài: ${backgroundMusicManager.getCurrentTrack().title}`);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title="Đổi bài nhạc nền tiếp theo"
                >
                  <SkipForward size={13} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newMuted = !isMuted;
                    backgroundMusicManager.setMuted(newMuted);
                    setIsMuted(newMuted);
                    if (newMuted) {
                      toast.info('Đã tắt tiếng nhạc nền');
                    } else {
                      toast.success('Đã bật tiếng nhạc nền');
                    }
                  }}
                  style={{
                    background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(108, 92, 231, 0.15)',
                    border: isMuted ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(108, 92, 231, 0.4)',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    color: isMuted ? 'var(--color-danger)' : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                  title={isMuted ? 'Bật âm thanh (Đang tắt tiếng)' : 'Tắt âm thanh (Đang bật)'}
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
              </div>
            </div>

            <div className="badge badge-warning" style={{ fontSize: '13px', padding: '7px 14px' }}>
              <Award size={15} />
              <span>{currentUser.totalScore.toLocaleString()} Điểm</span>
            </div>

            <button
              type="button"
              onClick={goToGame}
              className="btn-primary"
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              <BookOpen size={14} />
              <span>Vào Cốt Truyện</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-outline"
              style={{ padding: '7px 12px', fontSize: '12px' }}
              title="Đăng xuất"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. STAGES LIST */}
      <div className="game-card">
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Danh Sách Các Màn Chơi:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentUser.stages.map((stage) => {
              const isCurrent = stage.id === currentUser.currentStageId;
              const isDone = stage.status === 'completed';
              const isLocked = stage.status === 'locked';

              return (
                <div
                  key={stage.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: isCurrent ? 'var(--color-background-secondary)' : isDone ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isDone ? (
                        <CheckCircle2 size={18} color="var(--color-success)" />
                      ) : isCurrent ? (
                        <Flame size={18} color="var(--color-primary)" />
                      ) : (
                        <Lock size={18} color="var(--color-text-disabled)" />
                      )}
                      <span style={{ fontWeight: isCurrent ? 800 : 700, color: isCurrent ? 'var(--color-primary)' : 'inherit', fontSize: '15px' }}>
                        {stage.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Tiến trình: <b>Step {stage.currentStep}/{stage.totalSteps}</b>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#D98200' }}>
                        {stage.score} đ
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: isDone ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--color-text-disabled)',
                        }}
                      >
                        {isDone ? 'Đã Xong' : isCurrent ? 'Đang Chơi' : 'Khóa'}
                      </span>
                    </div>

                    {!isLocked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDone) {
                            setConfirmReplayStage(stage);
                          } else {
                            handlePlayStage(stage);
                          }
                        }}
                        className={isCurrent ? 'btn-primary' : isDone ? 'btn-secondary' : 'btn-outline'}
                        style={{
                          padding: '7px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isDone ? <RotateCcw size={13} /> : <Play size={13} />}
                        <span>{isDone ? 'Chơi Lại' : 'Chơi Ngay'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. AUDIT TRAIL / TRACE LOGS CARD */}
      <div className="game-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Lịch Sử Quyết Định & Trace Hành Động:
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Đã ghi nhận <b>{currentUser.selectedChoiceIds?.length || 0}</b> quyết định • <b>{currentUser.actionLogs?.length || 0}</b> sự kiện trace
            </p>
          </div>
        </div>

        {(!currentUser.actionLogs || currentUser.actionLogs.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            Chưa có lịch sử hành động nào được ghi lại. Hãy bắt đầu chơi để tạo dấu ấn của bạn!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {currentUser.actionLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-background-secondary)',
                  borderLeft: log.actionType === 'CHOICE_SELECTED' ? '3px solid var(--color-secondary)' : log.actionType === 'STAGE_COMPLETED' ? '3px solid var(--color-success)' : log.actionType === 'STAGE_RESTARTED' ? '3px solid var(--color-danger)' : '3px solid var(--color-primary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: log.actionType === 'CHOICE_SELECTED' ? 'rgba(255, 184, 77, 0.2)' : log.actionType === 'STAGE_RESTARTED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(108, 92, 231, 0.15)',
                        color: log.actionType === 'CHOICE_SELECTED' ? '#D98200' : log.actionType === 'STAGE_RESTARTED' ? 'var(--color-danger)' : 'var(--color-primary)',
                      }}
                    >
                      {log.actionType === 'CHOICE_SELECTED' ? 'LỰA CHỌN' : log.actionType === 'STAGE_COMPLETED' ? 'HOÀN THÀNH MÀN' : log.actionType === 'STAGE_RESTARTED' ? 'CHƠI LẠI' : log.actionType === 'STAGE_SELECTED' ? 'CHỌN MÀN' : 'HỒ SƠ'}
                    </span>

                    {log.choiceId && (
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-secondary)', fontFamily: 'monospace' }}>
                        Mã: [{log.choiceId}]
                      </span>
                    )}

                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {log.stageName || log.stageId}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatActionLogText(log, currentUser.profile)}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {log.scoreReward && (
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-success)' }}>
                      +{log.scoreReward}đ
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: 'var(--color-text-disabled)', marginTop: '2px' }}>
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL CẢNH BÁO CHƠI LẠI MÀN CHƠI */}
      <AnimatePresence>
        {confirmReplayStage && (() => {
          const replayingIndex = currentUser.stages.findIndex((s) => s.id === confirmReplayStage.id);
          const subsequentStages = replayingIndex >= 0 ? currentUser.stages.filter((_, idx) => idx > replayingIndex) : [];
          const totalDeductedScore = replayingIndex >= 0 
            ? currentUser.stages.slice(replayingIndex).reduce((sum, s) => sum + s.score, 0)
            : confirmReplayStage.score;

          return (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 8, 28, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
              onClick={() => setConfirmReplayStage(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '520px',
                  width: '100%',
                  borderRadius: '24px',
                  padding: '28px',
                  background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF5F5 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.35)',
                  boxShadow: '0 25px 60px -15px rgba(239, 68, 68, 0.35), 0 0 0 1px rgba(239, 68, 68, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Header Icon + Titles */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      border: '1.5px solid rgba(239, 68, 68, 0.25)',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 8px 16px rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    <AlertTriangle size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        Cảnh Báo Quan Trọng
                      </span>
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#1F2937', margin: 0, lineHeight: '1.3' }}>
                      Chơi Lại "{confirmReplayStage.name}"?
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      Hành động này sẽ làm mới toàn bộ tiến trình từ màn chơi này trở đi.
                    </p>
                  </div>
                </div>

                {/* Warning Details Content */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  {/* Item 1: Stage being reset */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: '#EF4444', marginTop: '2px', flexShrink: 0 }}>
                      <RotateCcw size={16} />
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#374151' }}>
                      <b>Làm mới màn hiện tại:</b> Tiến trình của <b>{confirmReplayStage.name}</b> sẽ quay về ban đầu, điểm số ({confirmReplayStage.score}đ) sẽ được làm mới về <b>0đ</b>.
                    </div>
                  </div>

                  {/* Item 2: Subsequent stages locked */}
                  {subsequentStages.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ color: '#DC2626', marginTop: '2px', flexShrink: 0 }}>
                        <Lock size={16} />
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#374151' }}>
                        <b>Khóa lại {subsequentStages.length} màn tiếp theo:</b>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0' }}>
                          {subsequentStages.map((s) => (
                            <span
                              key={s.id}
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                border: '1px solid #E5E7EB',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              🔒 {s.name} ({s.score}đ)
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>
                          Toàn bộ điểm và lựa chọn của các màn sau sẽ bị xóa để bạn trải nghiệm lại cốt truyện liền mạch.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ color: '#F59E0B', marginTop: '2px', flexShrink: 0 }}>
                        <Flame size={16} />
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#374151' }}>
                        <b>Khám phá nhánh rẽ mới:</b> Bạn có thể chọn các câu thoại khác để xem phản ứng mới lạ từ các nhân vật!
                      </div>
                    </div>
                  )}

                  {/* Item 3: Summary score deduction */}
                  {totalDeductedScore > 0 && (
                    <div
                      style={{
                        paddingTop: '10px',
                        borderTop: '1px dashed #E5E7EB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: '#6B7280', fontWeight: 600 }}>Tổng điểm sẽ bị khấu trừ:</span>
                      <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '14px' }}>
                        -{totalDeductedScore} điểm
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setConfirmReplayStage(null)}
                    style={{
                      padding: '11px 22px',
                      fontSize: '13px',
                      fontWeight: 700,
                      backgroundColor: '#F3F4F6',
                      color: '#4B5563',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmReplay(confirmReplayStage)}
                    style={{
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '11px 24px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <RotateCcw size={16} color="#FFFFFF" />
                    <span>Xác Nhận Chơi Lại</span>
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
};
