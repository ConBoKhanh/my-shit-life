import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tv,
  Power,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Sparkles,
  Moon,
  Zap,
  Film,
  Trophy,
  Radio,
  Music,
  Smile,
  X,
} from 'lucide-react';

interface TvChannel {
  id: number;
  name: string;
  category: string;
  color: string;
  headline: string;
  subtext: string;
  badge: string;
  videoUrl?: string;
  bgGradient: string;
  icon: any;
}

const TV_CHANNELS: TvChannel[] = [
  {
    id: 1,
    name: 'VTV Meme 1: Thời Sự Chuyển Sinh',
    category: 'Thời Sự & Meme',
    color: '#EF4444',
    headline: 'BẢN TIN NÓNG: Bé sơ sinh vừa chào đời đã biết cất tiếng gáy vang dội!',
    subtext: 'Bố mẹ Huấn - Linh tuyên bố thưởng nóng siêu xe đồ chơi cho bé cưng.',
    badge: 'TRỰC TIẾP',
    bgGradient: 'radial-gradient(circle at center, #7F1D1D 0%, #180808 100%)',
    icon: Radio,
  },
  {
    id: 2,
    name: 'Cartoon Network: Tom & Jerry & Bé Yêu',
    category: 'Hoạt Hình Thiếu Nhi',
    color: '#F59E0B',
    headline: 'TẬP ĐẶC BIỆT: Tom và Jerry cùng nhau trông trẻ siêu bão tố!',
    subtext: 'Baby Shark EDM Remix đang phát liên tục làm rung chuyển phòng khách.',
    badge: 'FULL HD',
    bgGradient: 'radial-gradient(circle at center, #78350F 0%, #150E05 100%)',
    icon: Film,
  },
  {
    id: 3,
    name: 'Sport GOAT: Ronaldo SIUUU vs Messi',
    category: 'Thể Thao Siêu Sao',
    color: '#3B82F6',
    headline: 'CHUNG KẾT VŨ TRỤ: Trận thư hùng đọ 8 Quả Bóng Vàng nảy lửa!',
    subtext: 'Bình luận viên thốt lên: "Aura của bé nhà ông Huấn sánh ngang siêu sao thế giới!"',
    badge: '4K 120FPS',
    bgGradient: 'radial-gradient(circle at center, #1E3A8A 0%, #0A1128 100%)',
    icon: Trophy,
  },
  {
    id: 4,
    name: 'Vinahey Kids: Nhạc Sôi Động Nhức Nách',
    category: 'Ca Nhạc & Quẩy',
    color: '#EC4899',
    headline: 'TOP HIT: Điệu múa quạt thiếu nhi Đỉnh Nóc Kịch Trần!',
    subtext: 'Bé vừa nghe vừa nhún nhảy bập bẹ theo nhịp bass căng đét cực sung.',
    badge: 'HOT TREND',
    bgGradient: 'radial-gradient(circle at center, #831843 0%, #18050E 100%)',
    icon: Music,
  },
  {
    id: 5,
    name: 'Discovery: Thế Giới Động Vật Cưng',
    category: 'Khoa Học & Thám Hiểm',
    color: '#10B981',
    headline: 'KHÁM PHÁ: Những chú chim cánh cụt vụng về tập đi như em bé 1 tuổi.',
    subtext: 'Hình ảnh đàn hải cẩu béo tròn lăn lông lốc siêu dễ thương trên tuyết.',
    badge: 'TỰ NHIÊN',
    bgGradient: 'radial-gradient(circle at center, #064E3B 0%, #03140F 100%)',
    icon: Zap,
  },
  {
    id: 6,
    name: 'Comedy TV: Cười Bể Bụng Cùng Gia Đình',
    category: 'Hài Hước Gia Đình',
    color: '#8B5CF6',
    headline: 'GẶP NHAU CUỐI TUẦN: Bố lười rửa bát bị mẹ tịch thu quỹ đen!',
    subtext: 'Tiếng cười vang dội khắp căn nhà ấm cúng của gia đình bé.',
    badge: 'HÀI VCL',
    bgGradient: 'radial-gradient(circle at center, #4C1D95 0%, #0E051D 100%)',
    icon: Smile,
  },
];

interface TvWatchingModalProps {
  isOpen: boolean;
  characterName?: string;
  onClose: (eventOutcome?: 'fell_asleep' | 'normal_close') => void;
}

export const TvWatchingModal: React.FC<TvWatchingModalProps> = ({
  isOpen,
  characterName = 'Bé Con',
  onClose,
}) => {
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isTvOn, setIsTvOn] = useState(true);
  const [isStaticNoise, setIsStaticNoise] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume] = useState(70);
  const [isFellAsleep, setIsFellAsleep] = useState(false);

  const currentChannel = TV_CHANNELS[currentChannelIndex];
  const osdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset trạng thái xem TV mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setIsFellAsleep(false);
      setIsTvOn(true);
      setIsStaticNoise(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    };
  }, []);

  // Trigger TV static sound / blip when changing channels
  const triggerChannelChange = (newIndex: number) => {
    setIsStaticNoise(true);
    setTimeout(() => {
      setCurrentChannelIndex(newIndex);
      setIsStaticNoise(false);
    }, 180);

    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => {}, 3000);
  };

  const handleNextChannel = () => {
    const nextIdx = (currentChannelIndex + 1) % TV_CHANNELS.length;
    triggerChannelChange(nextIdx);
  };

  const handlePrevChannel = () => {
    const prevIdx = (currentChannelIndex - 1 + TV_CHANNELS.length) % TV_CHANNELS.length;
    triggerChannelChange(prevIdx);
  };

  const handleSelectChannelNum = (idx: number) => {
    if (idx >= 0 && idx < TV_CHANNELS.length) {
      triggerChannelChange(idx);
    }
  };

  // Watch timer: sau 15s tự động buồn ngủ
  useEffect(() => {
    if (!isOpen || !isTvOn || isFellAsleep) return;
    const timer = setTimeout(() => {
      handleFallAsleep();
    }, 15000);

    return () => clearTimeout(timer);
  }, [isOpen, isTvOn, isFellAsleep]);

  const handleFallAsleep = () => {
    setIsFellAsleep(true);
  };

  const handleWakeUpAndContinue = () => {
    onClose('fell_asleep');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        data-no-advance="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          backgroundColor: 'rgba(5, 2, 15, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflow: 'hidden',
          userSelect: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* KỊCH BẢN NGỦ GẬT (FELL ASLEEP OVERLAY) */}
        {isFellAsleep ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              maxWidth: '560px',
              width: '100%',
              backgroundColor: '#1E1035',
              border: '2px solid #8B5CF6',
              borderRadius: '24px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              zIndex: 400,
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #A78BFA',
              }}
            >
              <Moon size={42} color="#FBBF24" />
            </div>

            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#FBBF24', marginBottom: '8px' }}>
                Bé {characterName} Ngủ Gật Mất Rồi! 😴💤
              </h2>
              <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.6 }}>
                Đang xem tivi say sưa thì mắt bé díp dần lại... Bố Huấn và Mẹ Linh nhẹ nhàng rón rén tắt tivi, bế bé
                vào giường đắp chiếc chăn ấm áp thơm mùi sữa.
              </p>
              <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '8px', fontStyle: 'italic' }}>
                "Ngủ ngoan nhé thiên thần nhỏ của bố mẹ!"
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWakeUpAndContinue}
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              <Sparkles size={18} />
              <span>Tỉnh Dậy Sảng Khoái (Tiếp Tục Hoạt Động)</span>
            </motion.button>
          </motion.div>
        ) : (
          /* GIAO DIỆN PHÒNG KHÁCH & SMART TV */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '920px',
              gap: '16px',
            }}
          >
            {/* Header thanh điều hướng phòng khách */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tv size={22} color="#FBBF24" />
                <span style={{ fontSize: '16px', fontWeight: 800 }}>
                  Phòng Khách Gia Đình: Smart TV 4K của Bố Huấn
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleFallAsleep}
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.25)',
                    border: '1px solid #8B5CF6',
                    color: '#DDD6FE',
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Moon size={14} color="#FBBF24" />
                  <span>Ngáp ngủ (Buồn ngủ quá)</span>
                </button>

                <button
                  onClick={() => onClose('normal_close')}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #EF4444',
                    color: '#FCA5A5',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <X size={16} />
                  <span>Tắt TV</span>
                </button>
              </div>
            </div>

            {/* Khung Smart TV */}
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                maxHeight: '52vh',
                backgroundColor: '#000000',
                borderRadius: '20px',
                border: '8px solid #27272A',
                boxShadow: `0 0 50px ${currentChannel.color}40, 0 20px 40px rgba(0,0,0,0.8)`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'box-shadow 0.5s ease',
              }}
            >
              {/* LED Ambilight Effect (Viền phát sáng theo màu kênh) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: currentChannel.bgGradient,
                  opacity: isTvOn ? 1 : 0,
                  transition: 'background 0.4s ease',
                }}
              />

              {/* TV Static Noise Effect khi đổi kênh */}
              {isStaticNoise && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#1E293B',
                    backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`,
                    backgroundSize: '8px 8px',
                    opacity: 0.8,
                    zIndex: 50,
                  }}
                />
              )}

              {/* Màn hình TV đang bật */}
              {isTvOn ? (
                <div
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px',
                  }}
                >
                  {/* Top Bar Kênh & Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(6px)',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderLeft: `4px solid ${currentChannel.color}`,
                      }}
                    >
                      <currentChannel.icon size={18} color={currentChannel.color} />
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                        Kênh 0{currentChannel.id}: {currentChannel.name}
                      </span>
                    </div>

                    <div
                      style={{
                        backgroundColor: currentChannel.color,
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 900,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        letterSpacing: '1px',
                        boxShadow: `0 0 12px ${currentChannel.color}`,
                      }}
                    >
                      {currentChannel.badge}
                    </div>
                  </div>

                  {/* Nội dung chính đang chiếu trên TV */}
                  <div
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          color: '#FBBF24',
                        }}
                      >
                        {currentChannel.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>• Phát sóng liên tục</span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px', lineHeight: 1.4 }}>
                      {currentChannel.headline}
                    </h3>

                    <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5 }}>
                      {currentChannel.subtext}
                    </p>
                  </div>

                  {/* Bottom Bar: OSD âm lượng & thời lượng */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isMuted ? <VolumeX size={16} color="#EF4444" /> : <Volume2 size={16} color="#10B981" />}
                      <span>{isMuted ? 'MUTE' : `VOL ${volume}%`}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#FBBF24" />
                      <span>Bé {characterName} đang chăm chú theo dõi...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#4B5563', fontSize: '14px', fontWeight: 700 }}>
                  TV Đang Tắt • Bấm nút nguồn trên Remote để bật
                </div>
              )}
            </div>

            {/* Remote Điều Khiển TV Cực Xịn */}
            <div
              style={{
                backgroundColor: '#1E1B2E',
                border: '2px solid #3B3355',
                borderRadius: '20px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  title="Bật/Tắt TV"
                  onClick={() => setIsTvOn(!isTvOn)}
                  style={{
                    backgroundColor: isTvOn ? '#EF4444' : '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isTvOn ? '0 0 12px #EF4444' : '0 0 12px #10B981',
                  }}
                >
                  <Power size={18} />
                </button>

                <button
                  title="Bật/Tắt Âm Thanh"
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    backgroundColor: '#2D2744',
                    color: '#DDD6FE',
                    border: '1px solid #4C3F70',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {isMuted ? <VolumeX size={18} color="#EF4444" /> : <Volume2 size={18} />}
                </button>
              </div>

              {/* Nút Chuyển Kênh Tiến Lên & Lùi Xuống (Channel +/-) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#151221',
                  padding: '4px 8px',
                  borderRadius: '16px',
                  border: '1px solid #2D2744',
                }}
              >
                <button
                  onClick={handlePrevChannel}
                  disabled={!isTvOn}
                  style={{
                    backgroundColor: '#3B3355',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: isTvOn ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: isTvOn ? 1 : 0.5,
                  }}
                >
                  <ChevronDown size={18} />
                  <span>Kênh Trước (Lùi)</span>
                </button>

                <span style={{ fontSize: '13px', fontWeight: 900, color: '#FBBF24', padding: '0 6px' }}>
                  0{currentChannel.id}/{TV_CHANNELS.length}
                </span>

                <button
                  onClick={handleNextChannel}
                  disabled={!isTvOn}
                  style={{
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: isTvOn ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: isTvOn ? 1 : 0.5,
                  }}
                >
                  <span>Kênh Sau (Tiến)</span>
                  <ChevronUp size={18} />
                </button>
              </div>

              {/* Các phím số chọn kênh nhanh 1 - 6 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {TV_CHANNELS.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChannelNum(idx)}
                    disabled={!isTvOn}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: currentChannelIndex === idx ? ch.color : '#2D2744',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: isTvOn ? 'pointer' : 'not-allowed',
                      opacity: isTvOn ? 1 : 0.4,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {ch.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
