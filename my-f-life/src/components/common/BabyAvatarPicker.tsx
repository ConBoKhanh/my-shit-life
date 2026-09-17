import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Heart, Baby, ChevronLeft, ChevronRight } from 'lucide-react';
import { BABY_AVATARS } from '../../utils/assets';

interface BabyAvatarPickerProps {
  currentAvatar?: string;
  characterName?: string;
  onSelectAvatar: (avatarId: string) => void;
}

export const BabyAvatarPicker: React.FC<BabyAvatarPickerProps> = ({
  currentAvatar = 'asset:baby_1',
  characterName = 'Bé Yêu',
  onSelectAvatar,
}) => {
  const initialIndex = Math.max(
    0,
    BABY_AVATARS.findIndex((b) => `asset:${b.id}` === currentAvatar)
  );
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const selectedBaby = BABY_AVATARS[activeIndex] || BABY_AVATARS[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : BABY_AVATARS.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < BABY_AVATARS.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        userSelect: 'none',
      }}
    >
      {/* Header Info */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 184, 77, 0.15)',
            color: '#D98200',
            padding: '5px 14px',
            borderRadius: 'var(--radius-xl)',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '8px',
          }}
        >
          <Baby size={16} />
          <span>Bé Tròn 1 Tuổi • Bộ Sưu Tập 10 Diện Mạo</span>
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Chọn Diện Mạo Của Bé: {characterName}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Bấm các mũi tên hoặc bấm trực tiếp vào từng bé để chọn diện mạo ưng ý nhất nhé!
        </p>
      </div>

      {/* 3D Coverflow Carousel Container with Nav Buttons */}
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          position: 'relative',
          padding: '10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '320px',
          perspective: '1000px',
        }}
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous avatar"
          style={{
            position: 'absolute',
            left: '4px',
            zIndex: 30,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Carousel Cards Track */}
        <div
          style={{
            position: 'relative',
            width: '240px',
            height: '270px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AnimatePresence initial={false}>
            {BABY_AVATARS.map((baby, idx) => {
              const offset = idx - activeIndex;
              const absOffset = Math.abs(offset);

              // Only render visible items within distance of 2
              if (absOffset > 2 && !(activeIndex <= 1 && idx >= BABY_AVATARS.length - 2) && !(activeIndex >= BABY_AVATARS.length - 2 && idx <= 1)) {
                return null;
              }

              const isSelected = activeIndex === idx;
              const translateX = offset * 130;
              const scale = isSelected ? 1.08 : Math.max(0.75, 1 - absOffset * 0.18);
              const rotateY = offset * -25;
              const zIndex = 20 - absOffset;
              const opacity = isSelected ? 1 : Math.max(0.4, 1 - absOffset * 0.35);

              return (
                <motion.div
                  key={baby.id}
                  onClick={() => setActiveIndex(idx)}
                  animate={{
                    x: translateX,
                    scale,
                    rotateY,
                    opacity,
                    zIndex,
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  style={{
                    position: 'absolute',
                    width: '210px',
                    height: '255px',
                    backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                    borderRadius: 'var(--radius-xl)',
                    border: isSelected ? '3px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    boxShadow: isSelected
                      ? '0 18px 40px rgba(108, 92, 231, 0.4)'
                      : '0 6px 16px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '14px 10px',
                    cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Index Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'rgba(0,0,0,0.06)',
                      color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '10px',
                    }}
                  >
                    #{idx + 1}
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(108, 92, 231, 0.5)',
                      }}
                    >
                      <Check size={16} />
                    </div>
                  )}

                  <img
                    src={baby.src}
                    alt={baby.name}
                    style={{
                      width: '145px',
                      height: '145px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.18))',
                    }}
                  />

                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      marginTop: '8px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '180px',
                    }}
                  >
                    {baby.name}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next avatar"
          style={{
            position: 'absolute',
            right: '4px',
            zIndex: 30,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {BABY_AVATARS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            style={{
              width: activeIndex === idx ? '20px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: activeIndex === idx ? 'var(--color-primary)' : 'rgba(0,0,0,0.18)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Selected Baby Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--color-background-secondary)',
          border: '1.5px solid rgba(108, 92, 231, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '10px 20px',
          boxShadow: '0 4px 14px rgba(108, 92, 231, 0.1)',
        }}
      >
        <Heart size={18} color="var(--color-accent)" />
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Đang chọn: <b style={{ color: 'var(--color-primary)' }}>{selectedBaby.name}</b> ({activeIndex + 1}/{BABY_AVATARS.length})
        </span>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => onSelectAvatar(`asset:${selectedBaby.id}`)}
        className="btn-primary"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '14px 24px',
          fontSize: '15px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(108, 92, 231, 0.35)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <Sparkles size={18} />
        <span>Xác Nhận Chọn Bé Này!</span>
      </motion.button>
    </div>
  );
};
