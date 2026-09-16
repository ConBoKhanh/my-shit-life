import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { toast } from 'sonner';
import type { StageData, UserProfile } from '../types/game';
import type { StoryChoice } from '../types/story';
import { useGameStore } from '../stores/useGameStore';
import { StoryDialogueEngine } from './game/StoryDialogueEngine';
import { TadpoleRaceScreen } from './game/tadpole/TadpoleRaceScreen';
import type { WinnerInfo } from '../game/tadpole/GameEngine';
import storyStagesData from '../data/storyStages.json';

export const GameScreen: React.FC = () => {
  const currentUser = useGameStore((state) => state.currentUser);
  const currentSession = useGameStore((state) => state.currentSession);
  const updateUserProgress = useGameStore((state) => state.updateUserProgress);
  const updateUserProfile = useGameStore((state) => state.updateUserProfile);
  const updateDialogueProgress = useGameStore((state) => state.updateDialogueProgress);
  const logUserAction = useGameStore((state) => state.logUserAction);
  const logout = useGameStore((state) => state.logout);

  const [activeView, setActiveView] = useState<'story' | 'dashboard'>('story');

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
    toast.success(`Chuyển sinh thành công! Bạn nhận được tấm vé làm người (+${bonusScore}đ)`);
    setActiveView('story');
  };

  // Xử lý lựa chọn trong StoryDialogueEngine
  const handleStoryChoice = (choice: StoryChoice) => {
    const scoreGain = typeof choice.scoreReward === 'number' ? choice.scoreReward : 100;
    if (scoreGain > 0) {
      toast.success(`Lựa chọn: ${choice.text.slice(0, 30)}... (+${scoreGain}đ)`);
    } else {
      toast.info(`Lựa chọn: ${choice.text.slice(0, 30)}...`);
    }

    // Ghi log hành động lựa chọn kèm mã định danh choice.id
    logUserAction({
      actionType: 'CHOICE_SELECTED',
      stageId: currentStage.id,
      stageName: currentStage.name,
      stepId: currentStepId,
      choiceId: choice.id,
      choiceText: choice.text,
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

    if (currentIndex + 1 < updatedStages.length) {
      if (updatedStages[currentIndex + 1].status === 'locked') {
        updatedStages[currentIndex + 1].status = 'in_progress';
        updatedStages[currentIndex + 1].currentStep = 1;
      }
      nextStageId = updatedStages[currentIndex + 1].id;
    }

    const newTotalScore = updatedStages.reduce((sum, s) => sum + s.score, 0);

    const updatedUser = {
      ...currentUser,
      currentStageId: nextStageId,
      currentStepId: 'step_1_birth',
      currentDialogueIndex: 0,
      totalScore: newTotalScore,
      stages: updatedStages,
      lastPlayedAt: new Date().toISOString(),
    };

    updateUserProgress(updatedUser);
    toast.success(`🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc "${currentStage.name}"!`);
    setActiveView('dashboard');
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
        onBackToDashboard={() => setActiveView('dashboard')}
      />
    );
  }

  // 2. NẾU ĐANG Ở CHẾ ĐỘ STORY VÀ CÓ CONFIG THOẠI (STAGE 1 TRỞ ĐI)
  if (activeView === 'story' && activeStepConfig) {
    return (
      <StoryDialogueEngine
        stepConfig={activeStepConfig}
        userProfile={currentUser.profile}
        initialDialogueIndex={currentUser.currentDialogueIndex || 0}
        actionLogs={currentUser.actionLogs || []}
        onDialogueIndexChange={handleDialogueIndexChange}
        onUpdateProfile={handleUpdateProfile}
        onStepChoice={handleStoryChoice}
        onStageCompleted={handleCompleteCurrentStage}
        onBackToDashboard={() => setActiveView('dashboard')}
      />
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
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-primary)',
                  fontWeight: 900,
                }}
              >
                <User size={20} />
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

          {/* Navigation Mode & Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="badge badge-warning" style={{ fontSize: '13px', padding: '7px 14px' }}>
              <Award size={15} />
              <span>{currentUser.totalScore.toLocaleString()} Điểm</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('story')}
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
                    cursor: !isLocked ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (!isLocked) {
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
                        currentStepId: stage.id === 'stage_0' ? 'step_race' : 'step_1_birth',
                        currentDialogueIndex: 0,
                      });
                      setActiveView('story');
                    }
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
                        className={isCurrent ? 'btn-primary' : 'btn-outline'}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Play size={12} />
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
                  borderLeft: log.actionType === 'CHOICE_SELECTED' ? '3px solid var(--color-secondary)' : log.actionType === 'STAGE_COMPLETED' ? '3px solid var(--color-success)' : '3px solid var(--color-primary)',
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

                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {log.stageName || log.stageId}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {log.choiceText || log.actionType}
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
    </motion.div>
  );
};
