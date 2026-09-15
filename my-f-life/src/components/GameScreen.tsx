import React from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import type { StageData } from '../types/game';
import { useGameStore } from '../stores/useGameStore';

export const GameScreen: React.FC = () => {
  const currentUser = useGameStore((state) => state.currentUser);
  const currentSession = useGameStore((state) => state.currentSession);
  const updateUserProgress = useGameStore((state) => state.updateUserProgress);
  const logout = useGameStore((state) => state.logout);

  if (!currentUser) return null;

  const currentStage = currentUser.stages.find((s) => s.id === currentUser.currentStageId) || currentUser.stages[0];

  // Giả lập đưa ra lựa chọn để tăng step và điểm
  const handleMakeChoice = (choiceTitle: string, scoreGain: number) => {
    const updatedStages = currentUser.stages.map((stage) => {
      if (stage.id === currentStage.id) {
        const nextStep = stage.currentStep + 1;
        const isDone = nextStep >= stage.totalSteps;
        return {
          ...stage,
          currentStep: isDone ? stage.totalSteps : nextStep,
          score: stage.score + scoreGain,
          status: (isDone ? 'completed' : 'in_progress') as StageData['status'],
        };
      }
      return stage;
    });

    // Mở khóa màn tiếp theo nếu xong màn hiện tại
    const currentIndex = updatedStages.findIndex((s) => s.id === currentStage.id);
    let nextStageId = currentUser.currentStageId;

    if (updatedStages[currentIndex].status === 'completed' && currentIndex + 1 < updatedStages.length) {
      if (updatedStages[currentIndex + 1].status === 'locked') {
        updatedStages[currentIndex + 1].status = 'in_progress';
        updatedStages[currentIndex + 1].currentStep = 1;
      }
      nextStageId = updatedStages[currentIndex + 1].id;
      toast.success(`Xuất sắc! Bạn đã hoàn thành "${currentStage.name}"!`);
    } else {
      toast(`Quyết định: ${choiceTitle} (+${scoreGain}đ)`);
    }

    const newTotalScore = updatedStages.reduce((sum, s) => sum + s.score, 0);

    const updatedUser = {
      ...currentUser,
      currentStageId: nextStageId,
      totalScore: newTotalScore,
      stages: updatedStages,
      lastPlayedAt: new Date().toISOString(),
    };

    updateUserProgress(updatedUser);
  };

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất phiên chơi');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', maxWidth: '640px', padding: '16px' }}
    >
      <div className="game-card">
        {/* Header người chơi & Session Token */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {currentUser.username}
              </h2>
            </div>
            {currentSession && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                <Clock size={12} color="var(--color-success)" />
                <span>Phiên hoạt động: <b>Hạn 24 giờ</b></span>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div className="badge badge-warning" style={{ fontSize: '13px', padding: '6px 12px' }}>
              <Award size={14} />
              <span>{currentUser.totalScore.toLocaleString()} Điểm</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Danh sách tất cả các màn */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Tiến độ các màn chơi:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentUser.stages.map((stage) => {
              const isCurrent = stage.id === currentUser.currentStageId;
              const isDone = stage.status === 'completed';
              const isLocked = stage.status === 'locked';

              return (
                <div
                  key={stage.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: isCurrent ? 'var(--color-background-secondary)' : isDone ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isDone ? (
                        <CheckCircle2 size={16} color="var(--color-success)" />
                      ) : isCurrent ? (
                        <Flame size={16} color="var(--color-primary)" />
                      ) : (
                        <Lock size={16} color="var(--color-text-disabled)" />
                      )}
                      <span style={{ fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--color-primary)' : 'inherit', fontSize: '14px' }}>
                        {stage.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Tiến trình: <b>Step {stage.currentStep}/{stage.totalSteps}</b>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Khu vực tương tác màn hiện tại */}
        <div
          style={{
            padding: '18px',
            backgroundColor: '#FBF9FD',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)' }}>
              Tình huống Step {currentStage.currentStep}/{currentStage.totalSteps}
            </span>
            <span className="badge badge-primary">
              {currentStage.status === 'completed' ? 'Màn này đã hoàn thành' : 'Đang diễn ra'}
            </span>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: '16px' }}>
            {currentStage.status === 'completed'
              ? 'Chúc mừng! Bạn đã hoàn thành toàn bộ bước trong màn này. Hãy tiến vào màn tiếp theo!'
              : `Bạn đang ở bước số ${currentStage.currentStep} của "${currentStage.name}". Hãy đưa ra quyết định:`}
          </p>

          {currentStage.status !== 'completed' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleMakeChoice('Chăm chỉ học tập', 100)}
                className="btn-primary"
                style={{ justifyContent: 'space-between' }}
              >
                <span>Option A: Chăm chỉ học tập / Làm việc nghiêm túc</span>
                <span style={{ opacity: 0.9 }}>+100 đ</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleMakeChoice('Liều ăn nhiều', 200)}
                className="btn-secondary"
                style={{ justifyContent: 'space-between' }}
              >
                <span>Option B: Liều ăn nhiều, bứt phá giới hạn</span>
                <span style={{ fontWeight: 800 }}>+200 đ</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleMakeChoice('Ở nhà nghỉ ngơi', 50)}
                className="btn-outline"
                style={{ justifyContent: 'space-between', background: '#FFFFFF' }}
              >
                <span>Option C: Ở nhà nghỉ ngơi, dưỡng sức</span>
                <span>+50 đ</span>
              </motion.button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                const nextStage = currentUser.stages.find((s) => s.status === 'in_progress');
                if (nextStage) {
                  updateUserProgress({ ...currentUser, currentStageId: nextStage.id });
                }
              }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              <Play size={18} />
              <span>Tiến Vào Màn Kế Tiếp</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
