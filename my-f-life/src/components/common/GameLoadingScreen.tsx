import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LOADING_TIPS = [
  'Đang kết nối dữ liệu kiếp trước...',
  'Đang tính toán số phận và nhân phẩm...',
  'Đang đồng bộ hệ thống chuyển sinh...',
  'Đang nạp vũ trụ và các nhánh rẽ cuộc đời...',
  'Sẵn sàng bước vào hành trình mới...',
];

export const GameLoadingScreen: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#0A0518',
        backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(108, 92, 231, 0.22) 0%, rgba(10, 5, 24, 0.95) 70%, #05020C 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        userSelect: 'none',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* Background Animated Ambient Light */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          padding: '32px',
          maxWidth: '420px',
          width: '90%',
          textAlign: 'center',
        }}
      >
        {/* Glowing Orb with Spinning Ring */}
        <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer dashed spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '2px dashed rgba(168, 85, 247, 0.6)',
            }}
          />

          {/* Inner reverse spinning ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 2,
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#EC4899',
              borderRightColor: '#8B5CF6',
            }}
          />

          {/* Center glowing core logo */}
          <motion.div
            animate={{
              scale: [0.92, 1.08, 0.92],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5) 0%, rgba(168, 85, 247, 0.5) 50%, rgba(236, 72, 153, 0.5) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.4)',
              overflow: 'hidden',
              padding: '6px',
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            />
          </motion.div>
        </div>

        {/* Game Title */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '24px',
              fontWeight: 900,
              letterSpacing: '1px',
              margin: 0,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E9D5FF 60%, #F472B6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 25px rgba(168, 85, 247, 0.5)',
            }}
          >
            CUỘC ĐỜI TÔI
          </motion.h1>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>
            Life Simulator RPG
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '60%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, transparent 0%, #8B5CF6 50%, #EC4899 100%)',
              boxShadow: '0 0 12px #EC4899',
            }}
          />
        </div>

        {/* Rotating Loading Tips */}
        <div style={{ minHeight: '24px' }}>
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.75)',
              margin: 0,
              letterSpacing: '0.2px',
            }}
          >
            {LOADING_TIPS[tipIndex]}
          </motion.p>
        </div>
      </div>
    </div>
  );
};
