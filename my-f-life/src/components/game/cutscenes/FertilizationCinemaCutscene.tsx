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

const SLIDE_DURATION_MS = 2400; // Tương thích hoàn hảo với tốc độ x2.0 của âm thanh mp3

// Custom hook tự động xóa nền trắng của ảnh flash.png qua Canvas để hiển thị hào quang và đổ bóng siêu đẹp như NPC
const useTransparentFlashImage = (rawSrc: string) => {
  const [transparentSrc, setTransparentSrc] = useState<string>(rawSrc);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Nếu là điểm ảnh trắng / gần trắng của nền hình vuông
          if (r >= 235 && g >= 235 && b >= 235) {
            data[i + 3] = 0; // Trong suốt hoàn toàn
          } else if (r >= 210 && g >= 210 && b >= 210) {
            // Khử răng cưa viền mềm mại
            const factor = Math.max(0, (235 - Math.max(r, g, b)) / 25);
            data[i + 3] = Math.floor(data[i + 3] * factor);
          }
        }
        ctx.putImageData(imgData, 0, 0);
        if (isMounted) {
          setTransparentSrc(canvas.toDataURL('image/png'));
        }
      } catch {
        // Dự phòng giữ nguyên ảnh gốc nếu canvas lỗi
      }
    };
    img.src = rawSrc;

    return () => {
      isMounted = false;
    };
  }, [rawSrc]);

  return transparentSrc;
};

export const FertilizationCinemaCutscene: React.FC<FertilizationCinemaCutsceneProps> = ({
  onExplode,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [phase, setPhase] = useState<'screening' | 'throwing_flash' | 'exploded'>('screening');
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transparentFlashImg = useTransparentFlashImage(flashGrenadeImg);

  // Lắng nghe thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Khởi chạy âm thanh Fertilization.mp3 tốc độ x2.0 khi cutscene bắt đầu
  useEffect(() => {
    const audio = new Audio(fertilizationAudio);
    audio.loop = false;
    audio.volume = 0.85;
    audio.playbackRate = 2.0;
    audio.defaultPlaybackRate = 2.0;
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

  // Điều khiển Slideshow qua 6 bức ảnh (Chuyển cảnh mượt mà theo tốc độ x2 của audio)
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

  // Hoạt ảnh ném lưu đạn Flashbang mượt mà hình parabol & nổ trắng (kéo dài 2.6s - lâu hơn 1 giây)
  useEffect(() => {
    if (phase === 'throwing_flash') {
      // Lưu đạn bay vòng cung parabol mượt mà 2.6s -> kích nổ
      const timer = setTimeout(() => {
        setPhase('exploded');
        playFlashbangRinging();

        if (audioRef.current) {
          audioRef.current.pause();
        }

        // Báo cho GameScreen kích hoạt màn 1 ngay trong lúc flash trắng che phủ
        onExplode();
      }, 2600);

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
        {/* Trên điện thoại: width 98% chừa 1% lề trái/phải khoảng trắng */}
        <div
          style={{
            position: 'absolute',
            top: isMobile ? '3.5%' : '4.5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '98%' : 'min(68vw, 690px)',
            height: isMobile ? 'min(42dvh, 320px)' : 'min(38dvh, 360px)',
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

          {/* Slideshow 6 hình ảnh (Không chữ, chuyển cảnh mượt mà) */}
          <AnimatePresence mode="wait">
            {phase === 'screening' && (
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
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

          {/* 3. HOẠT ẢNH QUẢ LƯU ĐẠN FLASH (BAY VÒNG CUNG PARABOL 1 MẠCH SIÊU MƯỢT 2.6s) */}
          <AnimatePresence>
            {phase === 'throwing_flash' && (
              /* Lớp X: Chuyển động ngang 1 mạch mượt mà không khựng từ góc phải sang tâm */
              <motion.div
                initial={{ x: isMobile ? 180 : 260 }}
                animate={{ x: 0 }}
                transition={{
                  duration: 2.6,
                  ease: [0.22, 1, 0.36, 1], // Cubic bezier lướt mượt mà 1 mạch duy nhất
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
                {/* Lớp Y + Xoay + Phóng to: Bay bổng lên đỉnh parabol rồi rơi xuống tâm, xoay đều liên tục */}
                <motion.div
                  initial={{
                    y: isMobile ? 220 : 280,
                    scale: 0.35,
                    rotate: 0,
                    opacity: 0,
                  }}
                  animate={{
                    y: [isMobile ? 220 : 280, isMobile ? -80 : -120, 0],
                    scale: [0.35, 1.15, 1.05],
                    rotate: 1080,
                    opacity: [0, 1, 1],
                  }}
                  transition={{
                    y: {
                      duration: 2.6,
                      times: [0, 0.44, 1],
                      ease: ['easeOut', 'easeIn'], // Lên đỉnh bằng easeOut và rơi bằng easeIn theo đúng trọng lực
                    },
                    scale: {
                      duration: 2.6,
                      times: [0, 0.5, 1],
                      ease: 'easeOut',
                    },
                    rotate: {
                      duration: 2.6,
                      ease: 'linear', // Xoay đều 1 mạch 1080 độ không giật
                    },
                    opacity: {
                      duration: 0.35,
                      ease: 'easeOut',
                    },
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Hào quang nền phát sáng tròn bao quanh quả Flash (tương tự hào quang NPC) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: isMobile ? '95px' : '130px',
                      height: isMobile ? '95px' : '130px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(250, 204, 21, 0.45) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 70%)',
                      filter: 'blur(16px)',
                      pointerEvents: 'none',
                      zIndex: -1,
                    }}
                  />

                  {/* Quả Flashbang đã xóa nền trắng, đổ bóng ôm khít thân grenade */}
                  <img
                    src={transparentFlashImg}
                    alt="Flashbang"
                    style={{
                      width: isMobile ? '70px' : 'clamp(75px, 12vw, 115px)',
                      height: 'auto',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 12px 24px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 32px rgba(250, 204, 21, 0.85))',
                      display: 'block',
                    }}
                  />

                  {/* Vệt sáng cảnh báo bùng nổ trước khi nổ trắng */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: [0, 0, 0.15, 0.85, 1], scale: [0.3, 0.5, 0.9, 1.8, 3.2] }}
                    transition={{ duration: 2.6, times: [0, 0.5, 0.7, 0.88, 1], ease: 'easeIn' }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '140px',
                      height: '140px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(250, 204, 21, 0.8) 45%, transparent 75%)',
                      filter: 'blur(10px)',
                      pointerEvents: 'none',
                      zIndex: -1,
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thanh Progress Bar hiển thị tiến độ 6 slide dưới rạp */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '16px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: isMobile ? '6px' : '8px',
            zIndex: 20,
          }}
        >
          {SLIDE_IMAGES.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentSlideIndex ? (isMobile ? '22px' : '28px') : (isMobile ? '6px' : '8px'),
                height: isMobile ? '5px' : '6px',
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
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
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
            {isAudioMuted ? <VolumeX size={isMobile ? 16 : 18} color="#EF4444" /> : <Volume2 size={isMobile ? 16 : 18} color="#A855F7" />}
          </button>
        </div>
      </div>
    </div>
  );
};
