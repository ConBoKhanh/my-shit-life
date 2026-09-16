import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

// Assets
import rapPhimBg from '../../../assets/rapphim.png';
import nongnocImg from '../../../assets/nongnoc.png';
import nongnoctotrungImg from '../../../assets/nongnoctotrung.png';
import trungthutinhImg from '../../../assets/trungthutinh.png';
import hinhthanhphoi1Img from '../../../assets/hinhthanhphoi1.png';
import hinhthanhphoi2Img from '../../../assets/hinhthanhphoi2.png';
import baby1Img from '../../../assets/baby1.png';
import flashGrenadeImg from '../../../assets/flash.png';
import fertilizationAudio from '../../../assets/Fertilization.mp3';

interface FertilizationCinemaCutsceneProps {
  onExplode: () => void;
}

const SLIDE_IMAGES: string[] = [
  nongnocImg,
  nongnoctotrungImg,
  trungthutinhImg,
  hinhthanhphoi1Img,
  hinhthanhphoi2Img,
  baby1Img,
];

const SLIDE_DURATION_MS = 3200; // Tương thích với tốc độ x1.5 của âm thanh

export const FertilizationCinemaCutscene: React.FC<FertilizationCinemaCutsceneProps> = ({
  onExplode,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [phase, setPhase] = useState<'screening' | 'throwing_flash' | 'exploded'>('screening');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Phát âm thanh Flashbang Ringing (Meme tinnitus 3.8kHz ringing decay)
  const playFlashbangRinging = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(3800, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 7.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 7.0);
    } catch {}
  };

  // Khởi chạy âm thanh Fertilization.mp3 tốc độ x1.5 khi cutscene bắt đầu
  useEffect(() => {
    const audio = new Audio(fertilizationAudio);
    audio.loop = false;
    audio.volume = 0.85;
    audio.playbackRate = 1.5;
    audio.defaultPlaybackRate = 1.5;
    audioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Trình duyệt có thể chặn autoplay nếu chưa click
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Xử lý bật/tắt mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isAudioMuted;
    }
  }, [isAudioMuted]);

  // Điều khiển Slideshow qua 6 bức ảnh (Chậm rãi, không chữ)
  useEffect(() => {
    if (phase !== 'screening') return;

    const timer = setTimeout(() => {
      if (currentSlideIndex < SLIDE_IMAGES.length - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      } else {
        // Đã chiếu xong ảnh cuối (baby1.png) -> Chuyển sang ném quả lưu đạn Flash
        setPhase('throwing_flash');
      }
    }, SLIDE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [currentSlideIndex, phase]);

  // Hoạt ảnh ném lưu đạn Flashbang mượt mà & nổ trắng
  useEffect(() => {
    if (phase === 'throwing_flash') {
      // Lưu đạn bay vòng cung 1.6s -> kích nổ
      const timer = setTimeout(() => {
        setPhase('exploded');
        playFlashbangRinging();

        if (audioRef.current) {
          audioRef.current.pause();
        }

        // Báo cho GameScreen kích hoạt màn 1 ngay trong lúc flash trắng che phủ
        onExplode();
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [phase, onExplode]);

  const currentImage = SLIDE_IMAGES[currentSlideIndex];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#040208',
        overflow: 'hidden',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* 1. KHUNG HÌNH RẠP CHIẾU PHIM (BACKGROUND CINEMA) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxWidth: '1440px',
          maxHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Ảnh nền Rạp phim */}
        <img
          src={rapPhimBg}
          alt="Rạp Chiếu Phim"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            zIndex: 1,
          }}
        />

        {/* Lớp ánh sáng Projector phản chiếu rạp phim */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 35%, rgba(139, 92, 246, 0.22) 0%, rgba(10, 5, 20, 0.45) 55%, rgba(3, 1, 6, 0.8) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* 2. MÀN HÌNH CHIẾU PHIM TRONG RẠP (CINEMA SCREEN PROJECTION) */}
        <div
          style={{
            position: 'absolute',
            top: '4.5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(68vw, 690px)',
            height: 'min(38dvh, 360px)',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#06030c',
            boxShadow: '0 0 50px rgba(139, 92, 246, 0.4), 0 0 90px rgba(0, 0, 0, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.14)',
          }}
        >
          {/* Hiệu ứng chùm sáng máy chiếu (Projector light beam) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 8,
            }}
          />

          {/* Slideshow 6 hình ảnh (Không chữ, chuyển cảnh mượt mà 1.2s) */}
          <AnimatePresence mode="wait">
            {phase === 'screening' && (
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#000000',
                }}
              >
                <img
                  src={currentImage}
                  alt={`Giai đoạn ${currentSlideIndex + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8)) brightness(1.04)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. HOẠT ẢNH QUẢ LƯU ĐẠN FLASH (NÉM VÒNG CUNG SIÊU MƯỢT & XOAY 720 ĐỘ) */}
          <AnimatePresence>
            {phase === 'throwing_flash' && (
              <motion.div
                initial={{
                  x: 180,
                  y: 250,
                  scale: 0.35,
                  rotate: 0,
                  opacity: 0,
                }}
                animate={{
                  x: [180, 90, 0],
                  y: [250, -90, -5],
                  scale: [0.35, 1.15, 1.0],
                  rotate: [0, 540, 840],
                  opacity: [0, 1, 1],
                }}
                transition={{
                  duration: 1.6,
                  times: [0, 0.6, 1],
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  position: 'absolute',
                  zIndex: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <img
                  src={flashGrenadeImg}
                  alt="Flashbang"
                  style={{
                    width: 'clamp(75px, 12vw, 115px)',
                    height: 'auto',
                    filter: 'drop-shadow(0 15px 30px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 35px rgba(250, 204, 21, 0.7))',
                  }}
                />

                {/* Vệt sáng cảnh báo trước khi nổ */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0, 1], scale: [0.5, 1, 2.5] }}
                  transition={{ duration: 1.6, times: [0, 0.8, 1] }}
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(250, 204, 21, 0.6) 40%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thanh Progress Bar hiển thị tiến độ 6 slide dưới rạp */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 20,
          }}
        >
          {SLIDE_IMAGES.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentSlideIndex ? '28px' : '8px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: idx === currentSlideIndex ? '#A855F7' : idx < currentSlideIndex ? '#E2E8F0' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.3s ease',
                boxShadow: idx === currentSlideIndex ? '0 0 10px rgba(168, 85, 247, 0.8)' : 'none',
              }}
            />
          ))}
        </div>

        {/* 4. NÚT ĐIỀU KHIỂN ÂM THANH (MUTE / UNMUTE) */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 30,
          }}
        >
          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 10, 35, 0.75)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={isAudioMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isAudioMuted ? <VolumeX size={18} color="#EF4444" /> : <Volume2 size={18} color="#A855F7" />}
          </button>
        </div>
      </div>
    </div>
  );
};
