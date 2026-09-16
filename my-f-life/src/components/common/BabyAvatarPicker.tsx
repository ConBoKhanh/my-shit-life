import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Sparkles, Check, Heart, Baby, ChevronLeft, ChevronRight } from 'lucide-react';
import { BABY_AVATARS } from '../../utils/assets';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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
  const swiperRef = useRef<SwiperCore | null>(null);
  const selectedBaby = BABY_AVATARS[activeIndex] || BABY_AVATARS[0];

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
          Vuốt sang trái/phải hoặc dùng nút điều hướng để chọn diện mạo ưng ý nhất nhé!
        </p>
      </div>

      {/* Swiper Coverflow Carousel Container with Nav Buttons */}
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          position: 'relative',
          padding: '10px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            swiperRef.current?.slidePrev();
          }}
          aria-label="Previous avatar"
          style={{
            position: 'absolute',
            left: '4px',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* Swiper Component */}
        <div style={{ width: '100%', height: '330px' }}>
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            initialSlide={initialIndex}
            coverflowEffect={{
              rotate: 20,
              stretch: 0,
              depth: 130,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Pagination, Navigation]}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            style={{ width: '100%', height: '100%', paddingBottom: '36px' }}
          >
            {BABY_AVATARS.map((baby, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <SwiperSlide
                  key={baby.id}
                  style={{
                    width: '220px',
                    height: '275px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <motion.div
                    animate={{
                      scale: isSelected ? 1.08 : 0.88,
                      opacity: isSelected ? 1 : 0.65,
                    }}
                    transition={{ duration: 0.25 }}
                    style={{
                      width: '200px',
                      height: '245px',
                      backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                      borderRadius: 'var(--radius-xl)',
                      border: isSelected ? '3px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      boxShadow: isSelected
                        ? '0 16px 36px rgba(108, 92, 231, 0.35)'
                        : '0 6px 16px rgba(0, 0, 0, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 10px',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onClick={() => swiperRef.current?.slideTo(idx)}
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
                        width: '155px',
                        height: '155px',
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
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            swiperRef.current?.slideNext();
          }}
          aria-label="Next avatar"
          style={{
            position: 'absolute',
            right: '4px',
            zIndex: 10,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronRight size={22} />
        </button>
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
