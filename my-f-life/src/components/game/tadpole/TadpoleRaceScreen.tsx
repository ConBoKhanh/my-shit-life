import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';
import { GameEngine } from '../../../game/tadpole/GameEngine';
import type { GameStateStatus, WinnerInfo } from '../../../game/tadpole/GameEngine';
import { VirtualJoystick } from './VirtualJoystick';
import { soundEffects } from '../../../game/tadpole/audio/SoundEffects';
import type { InputState } from '../../../game/tadpole/input/InputState';

interface TadpoleRaceScreenProps {
  onVictory: (winnerInfo: WinnerInfo) => void;
  onBackToDashboard?: () => void;
}

export const TadpoleRaceScreen: React.FC<TadpoleRaceScreenProps> = ({
  onVictory,
  onBackToDashboard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [status, setStatus] = useState<GameStateStatus>('idle');
  const [countdownText, setCountdownText] = useState<string | number>('');
  const [currentRank, setCurrentRank] = useState<number>(1);
  const [totalRacers, setTotalRacers] = useState<number>(21);
  const [distancePercent, setDistancePercent] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [winner, setWinner] = useState<WinnerInfo | null>(null);
  const [isSlowed, setIsSlowed] = useState<boolean>(false);

  // Detect mobile
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? (window.innerWidth < 768 || 'ontouchstart' in window) : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resize canvas with DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (engineRef.current) {
      engineRef.current.handleResize(width, height, dpr);
    }
  }, []);

  // Initialize GameEngine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const engine = new GameEngine(canvas, {
      onStatusChange: (newStatus) => setStatus(newStatus),
      onCountdownTick: (tick) => setCountdownText(tick),
      onRankChange: (rank, total, dist) => {
        setCurrentRank(rank);
        setTotalRacers(total);
        setDistancePercent(dist);
      },
      onFinish: (winnerInfo) => {
        setWinner(winnerInfo);
      },
      onPlayerHitBoundary: () => {
        setIsSlowed(true);
        setTimeout(() => setIsSlowed(false), 500);
      },
    });

    engineRef.current = engine;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      engine.stop();
      engineRef.current = null;
    };
  }, [resizeCanvas]);

  const handleStartGame = () => {
    setWinner(null);
    engineRef.current?.startRace();
  };

  const handleRestart = () => {
    setWinner(null);
    engineRef.current?.startRace();
  };

  const handleTogglePause = () => {
    if (status === 'running') {
      engineRef.current?.pause();
    } else if (status === 'paused') {
      engineRef.current?.resume();
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.isMuted = next;
  };

  const handleJoystickInput = useCallback((input: InputState) => {
    if (engineRef.current) {
      engineRef.current.customInput = input;
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100dvh',
        backgroundColor: '#270818',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
        zIndex: 100,
      }}
    >
      {/* 1. HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      />

      {/* 2. TOP HUD (Active during countdown / running / paused) */}
      {status !== 'idle' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            padding: isMobile ? '8px 10px' : '16px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 40,
            pointerEvents: 'none',
          }}
        >
          {/* Left: Real-time Rank Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', pointerEvents: 'auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: currentRank === 1 ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.88)',
                color: '#FFFFFF',
                backdropFilter: 'blur(10px)',
                border: `1.5px solid ${currentRank === 1 ? '#FBBF24' : 'rgba(255, 255, 255, 0.2)'}`,
                padding: isMobile ? '4px 8px' : '8px 16px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                fontWeight: 900,
                fontSize: isMobile ? '11px' : '15px',
              }}
            >
              <Trophy size={isMobile ? 13 : 16} color={currentRank === 1 ? '#FFFFFF' : '#FBBF24'} />
              <span>Hạng: {currentRank} / {totalRacers}</span>
            </div>

            {/* Slowed Warning Badge */}
            {isSlowed && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  padding: isMobile ? '4px 6px' : '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: isMobile ? '10px' : '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Zap size={isMobile ? 11 : 13} />
                <span>CHẠM BIÊN: -50% SPEED</span>
              </motion.div>
            )}
          </div>

          {/* Right: Progress to Egg & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px', pointerEvents: 'auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                padding: isMobile ? '4px 8px' : '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: isMobile ? '11px' : '14px',
                fontWeight: 800,
              }}
            >
              <Flame size={isMobile ? 13 : 15} color="#FB7185" />
              <span>Đến Đích: {distancePercent}%</span>
            </div>

            {/* Pause / Resume */}
            <button
              type="button"
              onClick={handleTogglePause}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: isMobile ? '5px 7px' : '8px 12px',
                cursor: 'pointer',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
              }}
              title={status === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}
            >
              {status === 'paused' ? <Play size={isMobile ? 13 : 16} /> : <Pause size={isMobile ? 13 : 16} />}
            </button>

            {/* Mute / Unmute */}
            <button
              type="button"
              onClick={handleToggleMute}
              style={{
                background: isMuted ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: isMobile ? '5px 7px' : '8px 12px',
                cursor: 'pointer',
                color: isMuted ? 'var(--color-text-disabled)' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
              }}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX size={isMobile ? 13 : 16} /> : <Volume2 size={isMobile ? 13 : 16} />}
            </button>
          </div>
        </div>
      )}

      {/* 3. VIRTUAL JOYSTICK (For Mobile Controls) */}
      {isMobile && status === 'running' && (
        <VirtualJoystick onInputChange={handleJoystickInput} />
      )}

      {/* 4. COUNTDOWN OVERLAY */}
      <AnimatePresence>
        {status === 'countdown' && countdownText && (
          <motion.div
            key={String(countdownText)}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 80,
            }}
          >
            <div
              style={{
                fontSize: countdownText === 'GO!' ? '72px' : '96px',
                fontWeight: 900,
                color: countdownText === 'GO!' ? '#10B981' : '#FACC15',
                textShadow: '0 0 40px rgba(250, 204, 21, 0.8), 0 8px 24px rgba(0,0,0,0.8)',
                letterSpacing: '2px',
              }}
            >
              {countdownText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. START SCREEN (IDLE MODAL) */}
      <AnimatePresence>
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(9, 4, 20, 0.92)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 100,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="game-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                maxHeight: '88vh',
                overflowY: 'auto',
                padding: isMobile ? '20px 16px' : '28px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: isMobile ? '12px' : '16px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(108, 92, 231, 0.15)',
                  color: 'var(--color-primary)',
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={isMobile ? 28 : 36} color="#00F2FE" />
              </div>
              <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                Cuộc Đua Chuyển Sinh
              </h2>
              <p style={{ fontSize: isMobile ? '12px' : '14px', color: 'var(--color-primary)', fontWeight: 700, marginTop: '4px' }}>
                Đại Chiến 21 Tinh Binh — Tranh Giành Slot Làm Người!
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-background-secondary)',
                  padding: isMobile ? '12px 14px' : '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  margin: isMobile ? '14px 0' : '18px 0',
                  textAlign: 'left',
                  fontSize: isMobile ? '12px' : '13px',
                  lineHeight: 1.5,
                  color: 'var(--color-text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: '6px', color: 'var(--color-primary)', fontSize: isMobile ? '13px' : '14px' }}>
                  Luật Sinh Tử (Không Đọc Ráng Chịu):
                </div>
                <div style={{ marginBottom: '4px' }}>
                  • <b>Nòng Nọc Người Thường:</b> Bạn là nòng nọc bình dân đang phải chạy đua với 20 nòng nọc tinh hoa xã hội!
                </div>
                <div style={{ marginBottom: '4px' }}>
                  • <b>Đua khốc liệt:</b> Bơi cật lực vượt mặt các nòng nọc tỷ phú, chủ tịch, bác sĩ, ca sĩ... để chạm vào <b>Trứng Noãn Bào</b> đầu tiên!
                </div>
                <div style={{ marginBottom: '4px' }}>
                  • <b>Tử địa vạch biên:</b> Cạ vào 2 bên thành sẽ bị tắc đường sinh học, tụt <b>50% tốc độ</b>!
                </div>
                <div style={{ color: '#F87171' }}>
                  • <b>Cảnh báo:</b> Thua cuộc là coi chừng kiếp sau đầu thai nhầm làm Phạm Tường Lan Thy đó!
                </div>
              </div>

              <div style={{ fontSize: isMobile ? '11px' : '12px', color: 'var(--color-text-secondary)', marginBottom: isMobile ? '14px' : '20px' }}>
                {isMobile ? 'Điều khiển: Sử dụng cần xoay joystick ảo trên màn hình' : 'Điều khiển: Dùng phím W, A, S, D hoặc 4 phím Mũi Tên'}
              </div>

              <button
                type="button"
                onClick={handleStartGame}
                className="btn-primary"
                style={{ width: '100%', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', fontWeight: 800 }}
              >
                <Play size={18} />
                <span>Bắt Đầu Bơi Giành Slot Làm Người!</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. WINNER / DEFEAT MODAL */}
      <AnimatePresence>
        {status === 'finished' && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(9, 4, 20, 0.94)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 150,
            }}
          >
            {winner.isPlayer ? (
              /* PLAYER VICTORY MODAL */
              <motion.div
                initial={{ scale: 0.85, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className="game-card"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  maxHeight: '88vh',
                  overflowY: 'auto',
                  padding: isMobile ? '20px 16px' : '30px 24px',
                  textAlign: 'center',
                  border: '2px solid #F59E0B',
                  boxShadow: '0 16px 48px rgba(245, 158, 11, 0.4)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    padding: isMobile ? '12px' : '16px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(254, 240, 138, 0.25)',
                    color: '#D97706',
                    marginBottom: '10px',
                  }}
                >
                  <Trophy size={isMobile ? 32 : 42} />
                </div>

                <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: '#F59E0B' }}>
                  CHUYỂN SINH THÀNH CÔNG!
                </h2>
                <p style={{ fontSize: isMobile ? '12px' : '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Nòng nọc người thường đã xuất sắc vượt mặt 20 đối thủ tinh hoa để giành slot làm người!
                </p>

                {/* Player Victory Card */}
                <div
                  style={{
                    margin: isMobile ? '14px 0' : '20px 0',
                    padding: isMobile ? '12px 14px' : '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(108, 92, 231, 0.15)',
                    border: '1.5px solid var(--color-primary)',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Phần Thưởng Chuyển Sinh:
                  </div>
                  <div style={{ fontSize: isMobile ? '17px' : '20px', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    Tấm Vé Đầu Thai Làm Người
                  </div>
                  <div style={{ fontSize: isMobile ? '12px' : '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Chính thức thụ tinh thành công và tiến vào Màn 1: Ngày Chào Đời!
                  </div>
                  <div style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 800, color: 'var(--color-success)', marginTop: '8px' }}>
                    Quà Khởi Điểm: +200 Điểm Tài Lộc!
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onVictory(winner)}
                  className="btn-primary"
                  style={{ width: '100%', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', fontWeight: 800 }}
                >
                  <span>Đầu Thai Ngay (Sang Ngày Chào Đời)</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              /* BOT WON (PLAYER DEFEAT MODAL) */
              <motion.div
                initial={{ scale: 0.85, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className="game-card"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  maxHeight: '88vh',
                  overflowY: 'auto',
                  padding: isMobile ? '20px 16px' : '28px 24px',
                  textAlign: 'center',
                  border: '2px solid #EF4444',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    padding: isMobile ? '12px' : '16px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    marginBottom: '10px',
                  }}
                >
                  <RotateCcw size={isMobile ? 28 : 36} />
                </div>

                <h2 style={{ fontSize: isMobile ? '19px' : '22px', fontWeight: 900, color: '#EF4444' }}>
                  BỊ CƯỚP MẤT SLOT ĐẦU THAI!
                </h2>
                <p style={{ fontSize: isMobile ? '12px' : '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Bạn đã bị đối thủ tinh hoa vượt mặt ở mét cuối cùng!
                </p>

                {/* Elite Bot Profile Card */}
                {winner.botProfile && (
                  <div
                    style={{
                      margin: isMobile ? '12px 0' : '16px 0',
                      padding: isMobile ? '10px 12px' : '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1.5px solid rgba(239, 68, 68, 0.3)',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Thân Thế Đối Thủ Về Nhất:
                    </div>
                    <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#FFFFFF', marginTop: '3px' }}>
                      {winner.botProfile.title}
                    </div>
                    <div style={{ fontSize: isMobile ? '11px' : '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {winner.botProfile.description}
                    </div>
                    <div style={{ fontSize: isMobile ? '11px' : '12px', fontStyle: 'italic', color: '#FCA5A5', marginTop: '4px' }}>
                      "{winner.botProfile.taunt}"
                    </div>
                  </div>
                )}

                <div
                  style={{
                    margin: isMobile ? '10px 0' : '14px 0',
                    padding: isMobile ? '10px' : '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background-secondary)',
                    fontSize: isMobile ? '11px' : '13px',
                    lineHeight: 1.45,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Bơi chậm thế này là kiếp sau phải chuyển sinh làm Phạm Tường Lan Thy đấy! Mau phục thù cướp lại slot nào!
                </div>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="btn-primary"
                  style={{ width: '100%', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '14px' : '15px', backgroundColor: '#EF4444', borderColor: '#EF4444', fontWeight: 800 }}
                >
                  <RotateCcw size={18} />
                  <span>Hồi Sinh & Bơi Lại Ngay!</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
