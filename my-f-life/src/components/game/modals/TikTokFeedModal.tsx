import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  X,
  Send,
  User,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Import all 8 TikTok videos from assets/user/tiktok
import video1 from '../../../assets/user/tiktok/snaptik.vn_7575122609172466965.mp4';
import video2 from '../../../assets/user/tiktok/snaptik.vn_7577733045936016647.mp4';
import video3 from '../../../assets/user/tiktok/snaptik.vn_7581125537276480788.mp4';
import video4 from '../../../assets/user/tiktok/snaptik.vn_7600607428199058708.mp4';
import video5 from '../../../assets/user/tiktok/snaptik.vn_7677005507034483989.mp4';
import video6 from '../../../assets/user/tiktok/snaptik.vn_7677841159338609940.mp4';
import video7 from '../../../assets/user/tiktok/snaptik.vn_7681007266669120776.mp4';
import video8 from '../../../assets/user/tiktok/snaptik.vn_7684660182655323400.mp4';

interface TikTokItem {
  id: number;
  src: string;
  author: string;
  authorTag: string;
  avatarColor: string;
  desc: string;
  musicTitle: string;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: { user: string; text: string; time: string; likes: number }[];
}

const TIKTOK_VIDEOS: TikTokItem[] = [
  {
    id: 1,
    src: video1,
    author: 'Vũ Điệu Tóp Tóp',
    authorTag: '@gai_xinh_quay_tay',
    avatarColor: '#EC4899',
    desc: 'Điệu nhảy hot trend lắc hông cháy phố tuần này 🔥💃 Mọi người thả tim cho em nhé!',
    musicTitle: 'Nhạc nền Vinahouse Căng Đét - Producer Mix',
    likes: 124500,
    commentsCount: 3420,
    shares: 8900,
    comments: [
      { user: 'Bố Huấn Idol', text: 'Nhảy mượt mà nét căng em ơiiii!', time: '1 giờ trước', likes: 120 },
      { user: 'Trần Lình Ha (Mẹ)', text: 'Ủa ông Huấn? Ông làm gì ở cái video này thế kia??? 😡', time: '45 phút trước', likes: 980 },
      { user: 'CĐM Hóng Hớt', text: 'Chuyến này anh Huấn tới công chiện với chị nhà rồi kkk', time: '30 phút trước', likes: 450 },
    ],
  },
  {
    id: 2,
    src: video2,
    author: 'Idol Gen Z Cute',
    authorTag: '@be_xinh_dang_yeu',
    avatarColor: '#8B5CF6',
    desc: 'Nụ cười tỏa nắng đốn tim bao nhiêu chàng trai 💖 Nhìn là muốn rước về dinh liền!',
    musicTitle: 'Em Là Nhất Miền Tây Remix - Ca sĩ ẩn danh',
    likes: 89400,
    commentsCount: 1850,
    shares: 4200,
    comments: [
      { user: 'Quạt Cứng Số 1', text: 'Xinh xuất sắc 100 điểm!', time: '2 giờ trước', likes: 88 },
      { user: 'Thánh Soi', text: 'Bố Huấn đã bấm like video này lúc 2h sáng =))))', time: '1 giờ trước', likes: 620 },
    ],
  },
  {
    id: 3,
    src: video3,
    author: 'Vinahey Dance Team',
    authorTag: '@dance_pro_vietnam',
    avatarColor: '#3B82F6',
    desc: 'Vũ điệu lắc lư giật giật đỉnh chóp ⚡ Bé nào ở nhà cũng phải học theo điệu này!',
    musicTitle: 'Tokyo Drift Vinahey Remix - DJ Kantik',
    likes: 215000,
    commentsCount: 6540,
    shares: 15400,
    comments: [
      { user: 'Bé Con', text: 'Bập bẹ bập bẹ (Nhạc cháy quá ba ơi)', time: 'Vừa xong', likes: 1500 },
      { user: 'Mẹ Linh', text: 'Ông Huấn mau trả máy cho con uống sữa ngay!', time: '10 phút trước', likes: 320 },
    ],
  },
  {
    id: 4,
    src: video4,
    author: 'Tiểu Thư Sang Chảnh',
    authorTag: '@luxury_girl_99',
    avatarColor: '#F59E0B',
    desc: 'Outfit check cuối tuần đi dạo phố sương sương ✨ Mọi người chấm mấy điểm?',
    musicTitle: 'Gucci Prada Remix - Trending TikTok 2026',
    likes: 67800,
    commentsCount: 1420,
    shares: 2800,
    comments: [
      { user: 'Bố Huấn', text: 'Trang phục này nhìn thanh lịch đấy!', time: '3 giờ trước', likes: 45 },
      { user: 'Mẹ Linh', text: 'Về nhà giải trình quả comment này ngay cho tôi!', time: '2 giờ trước', likes: 1100 },
    ],
  },
  {
    id: 5,
    src: video5,
    author: 'Nàng Thơ Dịu Dàng',
    authorTag: '@nang_tho_vintage',
    avatarColor: '#10B981',
    desc: 'Một chút bình yên giữa cuộc sống tấp nập 🌿 Thả một trái tim để nhận may mắn nha!',
    musicTitle: 'Bản Nhạc Lofi Bình Yên Chiều Hoàng Hôn',
    likes: 95400,
    commentsCount: 2100,
    shares: 5300,
    comments: [
      { user: 'Người Đi Ngang', text: 'Góc quay chill quá bạn ơi', time: '4 giờ trước', likes: 35 },
    ],
  },
  {
    id: 6,
    src: video6,
    author: 'Nữ Thần Lắc Hông',
    authorTag: '@sexy_dance_queen',
    avatarColor: '#EF4444',
    desc: 'Ai bảo con gái không biết nhảy hiphop bốc lửa? 🔥 Xem đến giây cuối để bất ngờ!',
    musicTitle: 'Bass Cực Mạnh Phá Đảo Top Top',
    likes: 312000,
    commentsCount: 8900,
    shares: 24500,
    comments: [
      { user: 'Cộng Đồng Mạng', text: 'Cứu anh Huấn với ae ơi quả này xác định ngủ ngoài hành lang kkk', time: '1 giờ trước', likes: 2100 },
    ],
  },
  {
    id: 7,
    src: video7,
    author: 'Cô Bé Tinh Nghịch',
    authorTag: '@cute_pranks',
    avatarColor: '#06B6D4',
    desc: 'Thử thách biến hình trước và sau khi trang điểm 💄 Ai thấy xinh thì cho 1 tim!',
    musicTitle: 'Biến Hình Magic Sound - Sound Official',
    likes: 154000,
    commentsCount: 3100,
    shares: 7200,
    comments: [
      { user: 'Dân Mạng', text: 'Ảo ma canada thật sự', time: '2 giờ trước', likes: 64 },
    ],
  },
  {
    id: 8,
    src: video8,
    author: 'Vũ Công Đường Phố',
    authorTag: '@street_dancer_vn',
    avatarColor: '#A855F7',
    desc: 'Trend này ai chưa nhảy là tối cổ rồi nha 💃 Quẩy hết nấc cùng nhóm bạn!',
    musicTitle: 'SIUUUU Remix Phối Khí Quẩy Đêm',
    likes: 278000,
    commentsCount: 7600,
    shares: 18900,
    comments: [
      { user: 'Cristiano Fan', text: 'SIUUUUUUUUUUUUUUUUUU!', time: '1 giờ trước', likes: 5000 },
    ],
  },
];

interface TikTokFeedModalProps {
  isOpen: boolean;
  characterName?: string;
  onClose: (eventOutcome?: 'mom_caught_girls' | 'normal_close') => void;
}

export const TikTokFeedModal: React.FC<TikTokFeedModalProps> = ({
  isOpen,
  characterName = 'Bé Con',
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    TIKTOK_VIDEOS.forEach((v) => {
      init[v.id] = v.likes;
    });
    return init;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number; id: number } | null>(null);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentVideo = TIKTOK_VIDEOS[currentIndex];

  // Play current video and pause others
  useEffect(() => {
    if (!isOpen) return;

    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [currentIndex, isOpen]);

  // Navigate Videos (Scroll up / down)
  const handleNextVideo = () => {
    if (currentIndex < TIKTOK_VIDEOS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop back to first video
      setCurrentIndex(0);
    }
  };

  const handlePrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(TIKTOK_VIDEOS.length - 1);
    }
  };

  // Wheel listener for smooth scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (showComments) return;
    if (e.deltaY > 40) {
      handleNextVideo();
    } else if (e.deltaY < -40) {
      handlePrevVideo();
    }
  };

  // Double click heart burst
  const handleVideoDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHeartBurst({ x, y, id: Date.now() });

    if (!likedMap[currentVideo.id]) {
      setLikedMap((prev) => ({ ...prev, [currentVideo.id]: true }));
      setLikesCountMap((prev) => ({ ...prev, [currentVideo.id]: prev[currentVideo.id] + 1 }));
    }

    setTimeout(() => {
      setHeartBurst(null);
    }, 900);
  };

  const handleToggleLike = () => {
    const isLiked = !!likedMap[currentVideo.id];
    setLikedMap((prev) => ({ ...prev, [currentVideo.id]: !isLiked }));
    setLikesCountMap((prev) => ({
      ...prev,
      [currentVideo.id]: isLiked ? prev[currentVideo.id] - 1 : prev[currentVideo.id] + 1,
    }));
  };

  const handleShare = () => {
    toast.success('Đã sao chép liên kết video TikTok thành công!');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    currentVideo.comments.unshift({
      user: `Bé ${characterName}`,
      text: commentInput.trim(),
      time: 'Vừa xong',
      likes: 1,
    });

    setCommentInput('');
    toast.success('Đã đăng bình luận thành công!');
  };

  // Exit trigger: Mẹ bắt quả tang máy bố toàn video gái
  const handleExitAndTriggerDrama = () => {
    // Dừng tất cả video
    videoRefs.current.forEach((vid) => vid?.pause());
    onClose('mom_caught_girls');
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
          backgroundColor: 'rgba(5, 2, 15, 0.96)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          overflow: 'hidden',
          userSelect: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        {/* Smartphone Container (iPhone Frame) */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '390px',
            height: '92vh',
            maxHeight: '820px',
            backgroundColor: '#000000',
            borderRadius: '44px',
            border: '8px solid #27272A',
            boxShadow: '0 0 50px rgba(236, 72, 153, 0.35), 0 25px 50px rgba(0,0,0,0.9)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Dynamic Island / Notch */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '110px',
              height: '26px',
              backgroundColor: '#000000',
              borderRadius: '20px',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1E293B' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
          </div>

          {/* Top Status Bar: Đang Follow | Dành Cho Bạn & Nút Trả Điện Thoại */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              right: 0,
              zIndex: 50,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 16px',
              color: '#FFFFFF',
            }}
          >
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#FFFFFF',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isMuted ? <VolumeX size={16} color="#EF4444" /> : <Volume2 size={16} />}
            </button>

            {/* TikTok Header Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '15px', fontWeight: 800 }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Đang Follow</span>
              <span
                style={{
                  color: '#FFFFFF',
                  position: 'relative',
                  paddingBottom: '4px',
                  borderBottom: '2px solid #FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Dành Cho Bạn
              </span>
            </div>

            {/* Nút Đóng / Trả Điện Thoại Cho Bố */}
            <button
              onClick={handleExitAndTriggerDrama}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.85)',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              }}
            >
              <X size={14} />
              <span>Trả máy</span>
            </button>
          </div>

          {/* Video Player & Overlay */}
          <div
            style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#0A0A0A' }}
            onDoubleClick={handleVideoDoubleClick}
          >
            <video
              ref={(el) => {
                videoRefs.current[currentIndex] = el;
              }}
              src={currentVideo.src}
              loop
              playsInline
              muted={isMuted}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Heart burst animation on double click */}
            {heartBurst && (
              <motion.div
                initial={{ opacity: 1, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 2.2, y: -40 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  left: heartBurst.x - 30,
                  top: heartBurst.y - 30,
                  zIndex: 70,
                  pointerEvents: 'none',
                }}
              >
                <Heart size={60} color="#EF4444" fill="#EF4444" />
              </motion.div>
            )}

            {/* Gradient Overlay for bottom readable text */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Right Action Sidebar (Heart, Comment, Share, Sound Disc) */}
            <div
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                zIndex: 40,
              }}
            >
              {/* Author Avatar with Plus Badge */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: currentVideo.avatarColor,
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '18px',
                  }}
                >
                  <User size={22} />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#EC4899',
                    color: '#FFFFFF',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 900,
                  }}
                >
                  +
                </div>
              </div>

              {/* Like Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <motion.button
                  whileTap={{ scale: 1.3 }}
                  onClick={handleToggleLike}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Heart
                    size={26}
                    color={likedMap[currentVideo.id] ? '#EF4444' : '#FFFFFF'}
                    fill={likedMap[currentVideo.id] ? '#EF4444' : 'none'}
                  />
                </motion.button>
                <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }}>
                  {(likesCountMap[currentVideo.id] / 1000).toFixed(1)}k
                </span>
              </div>

              {/* Comment Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <button
                  onClick={() => setShowComments(true)}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                  }}
                >
                  <MessageCircle size={26} />
                </button>
                <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }}>
                  {currentVideo.commentsCount}
                </span>
              </div>

              {/* Share Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <button
                  onClick={handleShare}
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#FFFFFF',
                  }}
                >
                  <Share2 size={24} />
                </button>
                <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }}>
                  {currentVideo.shares}
                </span>
              </div>

              {/* Spinning Music Disc */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#1E1B2E',
                  border: '3px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FBBF24',
                  marginTop: '6px',
                }}
              >
                <Music size={16} />
              </motion.div>
            </div>

            {/* Bottom Caption & Video Info */}
            <div
              style={{
                position: 'absolute',
                left: '16px',
                right: '72px',
                bottom: '16px',
                color: '#FFFFFF',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 900, fontSize: '15px' }}>{currentVideo.author}</span>
                <CheckCircle size={14} color="#38BDF8" />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{currentVideo.authorTag}</span>
              </div>

              <p style={{ fontSize: '13px', lineHeight: 1.4, margin: 0, color: '#F1F5F9' }}>
                {currentVideo.desc}
              </p>

              {/* Marquee Music Sound Track */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#FBBF24', marginTop: '2px' }}>
                <Music size={13} />
                <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {currentVideo.musicTitle}
                </span>
              </div>
            </div>
          </div>

          {/* External Scroll Buttons (Lên / Xuống) */}
          <div
            style={{
              position: 'absolute',
              right: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 100,
            }}
          >
            <button
              onClick={handlePrevVideo}
              title="Video Trước (Lên)"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.5)',
              }}
            >
              <ChevronUp size={24} />
            </button>

            <button
              onClick={handleNextVideo}
              title="Video Kế Tiếp (Xuống)"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#EC4899',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.5)',
              }}
            >
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Comment Drawer Modal */}
          {showComments && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '65%',
                backgroundColor: '#181424',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                zIndex: 80,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  {currentVideo.comments.length} Bình luận
                </span>
                <button
                  onClick={() => setShowComments(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Comments List */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                {currentVideo.comments.map((cm, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#3B3355',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#DDD6FE',
                        fontWeight: 800,
                        fontSize: '13px',
                        flexShrink: 0,
                      }}
                    >
                      {cm.user.slice(0, 1)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#E2E8F0' }}>{cm.user}</span>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>{cm.time}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#CBD5E1', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                        {cm.text}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <Heart size={14} color="#64748B" />
                      <span style={{ fontSize: '10px', color: '#64748B' }}>{cm.likes}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input
                  type="text"
                  placeholder="Viết bình luận cho video này..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: '#272238',
                    border: '1px solid #3B3355',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#EC4899',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
