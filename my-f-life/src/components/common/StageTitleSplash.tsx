import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';

interface StageTitleSplashProps {
  stageNumber?: number | string;
  stageName: string;
  subtitle?: string;
  onComplete: () => void;
  durationMs?: number;
}

export const StageTitleSplash: React.FC<StageTitleSplashProps> = ({
  stageNumber = 2,
  stageName,
  subtitle = 'Giai đoạn tập nói & những lời bập bẹ đầu đời...',
  onComplete,
  durationMs = 2200,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onComplete}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#0F081C',
        backgroundImage:
          'radial-gradient(circle at center, rgba(108, 92, 231, 0.35) 0%, rgba(26, 14, 46, 0.9) 60%, #0B0517 100%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Ambient background glow ring */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 184, 77, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Chapter Badge */}
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 184, 77, 0.15)',
          border: '1.5px solid rgba(255, 184, 77, 0.5)',
          color: '#FFB84D',
          padding: '6px 18px',
          borderRadius: 'var(--radius-xl)',
          fontSize: '13px',
          fontWeight: 900,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '16px',
          boxShadow: '0 0 20px rgba(255, 184, 77, 0.25)',
        }}
      >
        <Trophy size={15} />
        <span>MÀN {stageNumber}</span>
      </motion.div>

      {/* Main Title with Gold Shimmer */}
      <motion.h1
        initial={{ y: 25, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: 'clamp(26px, 5vw, 42px)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFE8B8 50%, #FFB84D 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.25',
          maxWidth: '680px',
          marginBottom: '14px',
          filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.6))',
          letterSpacing: '-0.5px',
        }}
      >
        {stageName}
      </motion.h1>

      {/* Subtitle / Context */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        style={{
          fontSize: 'clamp(13px, 2.5vw, 16px)',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: '520px',
          lineHeight: '1.6',
          marginBottom: '28px',
        }}
      >
        {subtitle}
      </motion.p>

      {/* Loading Sparkle indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.45)',
          letterSpacing: '0.8px',
        }}
      >
        <Sparkles size={13} color="var(--color-secondary)" />
        <span>ĐANG TẢI CỐT TRUYỆN • CHẠM ĐỂ BỎ QUA</span>
      </motion.div>
    </motion.div>
  );
};
