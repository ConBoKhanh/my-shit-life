import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Check,
  RotateCcw,
  Rotate3d,
  Palette,
  Eye,
  Smile,
  Scissors,
  Shirt,
  Footprints,
  Layers,
  Sparkle,
  Sliders,
  Globe,
} from 'lucide-react';
import type { CharacterAvatarConfig } from '../../../types/game';
import {
  type RealisticAvatarConfig,
  DEFAULT_REALISTIC_CONFIG,
  normalizeToRealisticConfig,
  REALISTIC_HAIR_OPTIONS,
  REALISTIC_HAIR_COLORS,
  REALISTIC_EXPRESSION_OPTIONS,
  REALISTIC_EYE_SHAPE_OPTIONS,
  REALISTIC_EYE_COLORS,
  REALISTIC_NOSE_SHAPE_OPTIONS,
  REALISTIC_MOUTH_SHAPE_OPTIONS,
  REALISTIC_LIP_COLORS,
  REALISTIC_BROW_SHAPE_OPTIONS,
  REALISTIC_JAW_SHAPE_OPTIONS,
  REALISTIC_SHIRT_OPTIONS,
  REALISTIC_PANTS_OPTIONS,
  REALISTIC_SHOES_OPTIONS,
} from '../../../three/character/RealisticAssetsCatalog';
import {
  Character3DViewer,
  CHARACTER_POSES,
  type CharacterPoseId,
} from './Character3DViewer';

interface CharacterCustomizerModalProps {
  initialConfig?: CharacterAvatarConfig | RealisticAvatarConfig | any;
  characterName?: string;
  gender?: 'male' | 'female';
  onConfirm: (config: any) => void;
  onClose?: () => void;
}

// CÁC TAB CHÍNH: CHUNG (MÀU DA & VÓC DÁNG) -> ĐẦU -> THÂN -> CHÂN -> BÀN CHÂN
export type CustomizerTab = 'general' | 'head' | 'torso' | 'legs' | 'feet';

const MAIN_TABS: { id: CustomizerTab; label: string; icon: string; badge: string; desc: string }[] = [
  { id: 'general', label: 'CHUNG', icon: '🌐', badge: 'Màu Da & Body', desc: 'Màu da toàn thân PBR và tỉ lệ vóc dáng cơ thể' },
  { id: 'head', label: 'ĐẦU', icon: '👤', badge: 'Ngũ Quan', desc: 'Mắt, Mũi, Môi, Chân mày, Khung hàm, Tóc, Biểu cảm' },
  { id: 'torso', label: 'THÂN', icon: '👕', badge: 'Áo', desc: 'Bộ sưu tập áo thun, sơ mi oxford và cơ thể nguyên bản' },
  { id: 'legs', label: 'CHÂN', icon: '👖', badge: 'Quần', desc: 'Bộ sưu tập quần jeans, chinos và quần thể thao' },
  { id: 'feet', label: 'BÀN CHÂN', icon: '👟', badge: 'Giày', desc: 'Bộ sưu tập sneaker, giày tây oxford và chân trần' },
];

// Danh sách các tông màu da & chất liệu PBR cao cấp cho khung 3D (Tab Chung)
const EXPANDED_SKIN_TONES = [
  { id: 'clay_studio', name: 'Studio Clay (Mặc định)', hex: '#B57850', badge: '★ Chuẩn Studio' },
  { id: 'terracotta_warm', name: 'Đất Nung Terracotta', hex: '#C48B68', badge: '★ Ấm Áp' },
  { id: 'natural_sand', name: 'Tự Nhiên (Natural Sand)', hex: '#E8BA9A', badge: '★ Tự Nhiên' },
  { id: 'warm_ivory', name: 'Trắng Hồng (Warm Ivory)', hex: '#FAD4C0', badge: '★ Sáng Da' },
  { id: 'fair_porcelain', name: 'Trắng Sáng (Fair)', hex: '#FFE8D6', badge: '★ Thanh Thoát' },
  { id: 'golden_honey', name: 'Rám Nắng (Golden Honey)', hex: '#D29B72', badge: '★ Khỏe Khoắn' },
  { id: 'bronze_tan', name: 'Ngăm Khỏe (Bronze Tan)', hex: '#9E6847', badge: '★ Nam Tính' },
  { id: 'deep_espresso', name: 'Nâu Trầm (Deep Espresso)', hex: '#633B27', badge: '★ Đậm Đà' },
  { id: 'white_porcelain', name: 'Sứ Trắng Studio', hex: '#F4F7FA', badge: '★ Điêu Khắc' },
];

// Bảng màu trang phục áo
const SHIRT_COLORS = [
  { id: 'pure_white', name: 'Trắng Tinh', hex: '#FFFFFF' },
  { id: 'navy_blue', name: 'Xanh Navy', hex: '#1E293B' },
  { id: 'obsidian_black', name: 'Đen Obsidian', hex: '#18181B' },
  { id: 'burgundy_red', name: 'Đỏ Burgundy', hex: '#881337' },
  { id: 'forest_green', name: 'Xanh Rêu', hex: '#14532D' },
  { id: 'heather_grey', name: 'Xám Heather', hex: '#64748B' },
];

// Bảng màu trang phục quần
const PANTS_COLORS = [
  { id: 'classic_denim', name: 'Xanh Denim', hex: '#1E40AF' },
  { id: 'washed_black', name: 'Đen Washed', hex: '#1F2937' },
  { id: 'khaki_beige', name: 'Kaki Be', hex: '#A3907C' },
  { id: 'slate_grey', name: 'Xám Tro', hex: '#475569' },
  { id: 'olive_drab', name: 'Xanh Olive', hex: '#3F4E3F' },
];

// Bảng màu giày
const SHOES_COLORS = [
  { id: 'clean_white', name: 'Trắng Clean', hex: '#F8FAFC' },
  { id: 'polished_black', name: 'Đen Bóng', hex: '#0F172A' },
  { id: 'cognac_brown', name: 'Nâu Da Bò', hex: '#78350F' },
  { id: 'racing_red', name: 'Đỏ Thể Thao', hex: '#991B1B' },
];

type HeadSubSection = 'all' | 'eyes_nose' | 'mouth_jaw' | 'hair' | 'expression';

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  initialConfig,
  characterName = 'Nhân Vật',
  onConfirm,
  onClose,
}) => {
  const [config, setConfig] = useState<RealisticAvatarConfig>(() => {
    const normalized = normalizeToRealisticConfig(initialConfig);
    return {
      ...normalized,
      eyeShapeId: (!normalized.eyeShapeId || !REALISTIC_EYE_SHAPE_OPTIONS.map((o) => o.id).includes(normalized.eyeShapeId)) 
        ? REALISTIC_EYE_SHAPE_OPTIONS[0].id 
        : normalized.eyeShapeId,
      eyeColor: (!normalized.eyeColor || normalized.eyeColor === '#261710') 
        ? REALISTIC_EYE_COLORS[0].hex 
        : normalized.eyeColor,
      lipColor: (!normalized.lipColor || normalized.lipColor === '#261710')
        ? REALISTIC_LIP_COLORS[0].hex
        : normalized.lipColor,
      noseShapeId: (!normalized.noseShapeId || !REALISTIC_NOSE_SHAPE_OPTIONS.map((o) => o.id).includes(normalized.noseShapeId))
        ? REALISTIC_NOSE_SHAPE_OPTIONS[0].id
        : normalized.noseShapeId,
      mouthShapeId: (!normalized.mouthShapeId || !REALISTIC_MOUTH_SHAPE_OPTIONS.map((o) => o.id).includes(normalized.mouthShapeId))
        ? REALISTIC_MOUTH_SHAPE_OPTIONS[0].id
        : normalized.mouthShapeId,
      body: {
        ...normalized.body,
        heightCm: (!normalized.body?.heightCm || normalized.body.heightCm < 95 || normalized.body.heightCm > 115) 
          ? 105 
          : normalized.body.heightCm,
      },
    };
  });

  const [activeTab, setActiveTab] = useState<CustomizerTab>('general');
  const [headFilter, setHeadFilter] = useState<HeadSubSection>('all');
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedPose, setSelectedPose] = useState<CharacterPoseId>('relaxed');
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn lên đầu cột nội dung khi chuyển tab
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Xác định focusTarget cho 3D camera theo từng tab
  const getFocusTarget = (): 'body' | 'face' | 'torso' | 'legs' | 'shoes' => {
    switch (activeTab) {
      case 'general':
        return 'body';
      case 'head':
        return 'face';
      case 'torso':
        return 'torso';
      case 'legs':
        return 'legs';
      case 'feet':
        return 'shoes';
      default:
        return 'body';
    }
  };

  // Reset về mặc định
  const handleResetDefault = () => {
    setConfig({
      ...DEFAULT_REALISTIC_CONFIG,
      skinTone: '#B57850',
      lipColor: REALISTIC_LIP_COLORS[0].hex,
      body: {
        heightCm: 105,
        weightKg: 24,
        musclePct: 20,
        shoulderWidthScale: 1.0,
        legLengthScale: 1.0,
      },
    });
  };

  // Xác nhận lưu nhân vật
  const handleConfirm = () => {
    const mergedConfig = {
      ...config,
      heightScale: config.body.heightCm / 105,
      legScale: config.body.legLengthScale,
      headScale: 1.0,
    };
    onConfirm(mergedConfig);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 6, 22, 0.92)',
        backdropFilter: 'blur(16px)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="game-card"
        style={{
          width: '100%',
          maxWidth: '1240px',
          height: '92vh',
          maxHeight: '880px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.55)',
          border: '2px solid rgba(108, 92, 231, 0.30)',
        }}
      >
        {/* ==========================================
            1. HEADER & TOP MAIN TABS BAR
        ========================================== */}
        <div
          style={{
            borderBottom: '1.5px solid var(--color-border)',
            background: 'linear-gradient(135deg, rgba(248, 247, 255, 0.98), rgba(240, 244, 255, 0.98))',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top Title Row */}
          <div
            style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(108, 92, 231, 0.10)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6C5CE7, #8075FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(108, 92, 231, 0.35)',
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    color: 'var(--color-text-main)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  TÙY BIẾN NHÂN VẬT 3D STUDIO
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '1px 0 0 0' }}>
                  Thiết kế diện mạo cho <strong style={{ color: '#4F46E5' }}>{characterName}</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleResetDefault}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  borderRadius: '10px',
                }}
              >
                <RotateCcw size={13} /> Mặc Định
              </button>
            </div>
          </div>

          {/* Main Tabs Bar (CHUNG -> ĐẦU -> THÂN -> CHÂN -> BÀN CHÂN) */}
          <div
            style={{
              display: 'flex',
              padding: '8px 20px',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
            }}
          >
            {MAIN_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: isActive ? '2px solid #6C5CE7' : '1.5px solid rgba(108, 92, 231, 0.12)',
                    backgroundColor: isActive ? '#6C5CE7' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                    cursor: 'pointer',
                    boxShadow: isActive
                      ? '0 6px 18px rgba(108, 92, 231, 0.35)'
                      : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px' }}>
                      {tab.label}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: isActive ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {tab.badge}
                    </div>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activeTabBadge"
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        width: '24px',
                        height: '3px',
                        borderRadius: '2px',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            2. BODY CONTENT (3D View + Customizer Panels)
        ========================================== */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* CỘT TRÁI: 3D VIEWER */}
          <div
            style={{
              flex: '0 0 46%',
              backgroundColor: '#0F081C',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1.5px solid var(--color-border)',
            }}
          >
            {/* Top Toolbar */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                right: 14,
                display: 'flex',
                justifyContent: 'space-between',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  padding: '6px 14px',
                  background: 'rgba(108, 92, 231, 0.88)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
              >
                <Sparkles size={13} /> Focus:{' '}
                {activeTab === 'general'
                  ? '🌐 Chung (Toàn Thân)'
                  : activeTab === 'head'
                    ? '👤 Ngũ Quan & Đầu'
                    : activeTab === 'torso'
                      ? '👕 Thân & Áo'
                      : activeTab === 'legs'
                        ? '👖 Chân & Quần'
                        : '👟 Bàn Chân & Giày'}
              </div>

              <button
                onClick={() => setAutoRotate(!autoRotate)}
                style={{
                  padding: '6px 14px',
                  background: autoRotate ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Rotate3d size={13} /> Xoay: {autoRotate ? 'BẬT' : 'TẮT'}
              </button>
            </div>

            {/* Canvas 3D Viewer với Auto Focus Zoom theo từng Tab */}
            <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
              <Character3DViewer
                config={config}
                autoRotate={autoRotate}
                showPodium={true}
                cameraDistance={2.15}
                focusTarget={getFocusTarget()}
                currentPose={selectedPose}
              />

              {/* Thanh chọn 5 Tư Thế (Pose Selector) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  zIndex: 15,
                  display: 'flex',
                  gap: '6px',
                  backgroundColor: 'rgba(15, 8, 28, 0.85)',
                  backdropFilter: 'blur(12px)',
                  padding: '6px 8px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                }}
              >
                {CHARACTER_POSES.map((p) => {
                  const isActive = selectedPose === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPose(p.id)}
                      title={p.desc}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '6px 2px',
                        borderRadius: '10px',
                        border: isActive ? '1.5px solid #8075FF' : '1px solid transparent',
                        backgroundColor: isActive ? 'rgba(108, 92, 231, 0.38)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.70)',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontSize: '10px',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{p.icon}</span>
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG TÙY BIẾN CHI TIẾT THEO TAB */}
          <div
            ref={contentScrollRef}
            style={{
              flex: '1',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FAF9FE',
            }}
          >
            <AnimatePresence mode="wait">
              {/* ========================================================
                  TAB 0: CHUNG (MÀU DA TOÀN THÂN PBR & TỈ LỆ VÓC DÁNG)
              ======================================================== */}
              {activeTab === 'general' && (
                <motion.div
                  key="tab-general"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--color-text-main)',
                        margin: '0 0 6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Globe size={18} color="#6C5CE7" /> Tùy Biến Chung: Màu Da & Tỉ Lệ Cơ Thể
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                      Chọn tông màu da toàn thân PBR chuẩn studio và tùy chỉnh các chỉ số hình thể của nhân vật.
                    </p>
                  </div>

                  {/* 1. BẢNG MÀU DA TOÀN THÂN PBR */}
                  <div className="section-block">
                    <div style={{ marginBottom: '12px' }}>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: 'var(--color-text-main)',
                          margin: '0 0 4px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Palette size={16} color="#6C5CE7" /> 1. Bảng Màu Da PBR (Skin Tone Palette)
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                        Chất liệu satin bán bóng PBR phản quang tự nhiên, đồng bộ trên toàn bộ cơ thể.
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                        gap: '10px',
                      }}
                    >
                      {EXPANDED_SKIN_TONES.map((tone) => {
                        const isSelected = config.skinTone?.toLowerCase() === tone.hex.toLowerCase();
                        return (
                          <div
                            key={tone.id}
                            onClick={() => setConfig((prev) => ({ ...prev, skinTone: tone.hex }))}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '12px',
                              border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                              backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                backgroundColor: tone.hex,
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12)',
                                border: '2px solid #FFFFFF',
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6C5CE7' }}>
                                {tone.badge}
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: isSelected ? '#4F46E5' : 'var(--color-text-main)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {tone.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                {tone.hex}
                              </div>
                            </div>
                            {isSelected && <Check size={16} color="#6C5CE7" strokeWidth={3} />}
                          </div>
                        );
                      })}

                      {/* Thẻ Tự Chọn Màu Da Tùy Chỉnh (Native Color Spectrum) */}
                      {(() => {
                        const isPreset = EXPANDED_SKIN_TONES.some((t) => t.hex.toLowerCase() === (config.skinTone || '').toLowerCase());
                        return (
                          <label
                            style={{
                              padding: '12px 14px',
                              borderRadius: '12px',
                              border: !isPreset ? '2px solid #6C5CE7' : '1.5px dashed rgba(108, 92, 231, 0.4)',
                              backgroundColor: !isPreset ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              position: 'relative',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            <input
                              type="color"
                              value={config.skinTone || '#B57850'}
                              onChange={(e) => setConfig((prev) => ({ ...prev, skinTone: e.target.value }))}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                              }}
                            />
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.12)',
                                border: '2px solid #FFFFFF',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: config.skinTone || '#B57850', border: '1.5px solid #FFFFFF' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6C5CE7' }}>
                                ★ Tự Do Phối Màu
                              </div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: !isPreset ? '#4F46E5' : 'var(--color-text-main)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                🎨 Tự Chọn Màu...
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                {config.skinTone}
                              </div>
                            </div>
                            {!isPreset && <Check size={16} color="#6C5CE7" strokeWidth={3} />}
                          </label>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 2. TỈ LỆ VÓC DÁNG CƠ THỂ (GIAI ĐOẠN MẦM NON) */}
                  <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(108, 92, 231, 0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--color-text-main)',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Sliders size={16} color="#6C5CE7" /> 2. Tỉ Lệ Vóc Dáng (Độ Tuổi Mầm Non)
                        </h4>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: 'rgba(108, 92, 231, 0.10)', color: '#6C5CE7' }}>
                          2 Chỉ Số Tùy Chỉnh
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                        Tùy chỉnh chiều cao và tỉ lệ dài chân phù hợp cho nhân vật giai đoạn mầm non (chuẩn WHO: 95cm - 115cm, mặc định: 105cm).
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* 1. Chiều cao (Mầm non chuẩn WHO: 95cm - 115cm, Default: 105cm) */}
                      <div style={{ padding: '14px 16px', background: '#F8F7FC', borderRadius: '12px', border: '1px solid rgba(108, 92, 231, 0.10)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>Chiều cao nhân vật:</span>
                            {config.body.heightCm === 105 && (
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                                ⭐ Chuẩn WHO mầm non (105cm)
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#6C5CE7' }}>
                            {config.body.heightCm} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min={95}
                          max={115}
                          step={1}
                          value={config.body.heightCm}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setConfig((prev) => ({
                              ...prev,
                              body: { ...prev.body, heightCm: val },
                            }));
                          }}
                          style={{ width: '100%', accentColor: '#6C5CE7', cursor: 'pointer', height: '6px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                          <span>95 cm (3 tuổi)</span>
                          <span style={{ color: config.body.heightCm === 105 ? '#6C5CE7' : 'inherit', fontWeight: config.body.heightCm === 105 ? 700 : 400 }}>105 cm (Mặc định)</span>
                          <span>115 cm (Tối đa / 6 tuổi)</span>
                        </div>
                        {/* Quick Presets */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          {[
                            { label: '95 cm', value: 95 },
                            { label: '100 cm', value: 100 },
                            { label: '105 cm (Chuẩn)', value: 105 },
                            { label: '110 cm', value: 110 },
                            { label: '115 cm (Max)', value: 115 },
                          ].map((p) => {
                            const isCur = config.body.heightCm === p.value;
                            return (
                              <button
                                key={p.value}
                                onClick={() => setConfig((prev) => ({ ...prev, body: { ...prev.body, heightCm: p.value } }))}
                                style={{
                                  flex: 1,
                                  padding: '5px 0',
                                  fontSize: '11px',
                                  fontWeight: isCur ? 700 : 500,
                                  borderRadius: '8px',
                                  border: isCur ? '1.5px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.20)',
                                  background: isCur ? '#6C5CE7' : '#FFFFFF',
                                  color: isCur ? '#FFFFFF' : 'var(--color-text-main)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Tỉ lệ chiều dài chân (85% - 115%, Default: 100%) */}
                      <div style={{ padding: '14px 16px', background: '#F8F7FC', borderRadius: '12px', border: '1px solid rgba(108, 92, 231, 0.10)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>Tỉ lệ chiều dài chân:</span>
                            {Math.round(config.body.legLengthScale * 100) === 100 && (
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                                ⭐ Cân đối chuẩn (100%)
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#6C5CE7' }}>
                            {Math.round(config.body.legLengthScale * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.85}
                          max={1.15}
                          step={0.01}
                          value={config.body.legLengthScale}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setConfig((prev) => ({
                              ...prev,
                              body: { ...prev.body, legLengthScale: val },
                            }));
                          }}
                          style={{ width: '100%', accentColor: '#6C5CE7', cursor: 'pointer', height: '6px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                          <span>85% (Chân ngắn/Đáng yêu)</span>
                          <span style={{ color: Math.round(config.body.legLengthScale * 100) === 100 ? '#6C5CE7' : 'inherit', fontWeight: Math.round(config.body.legLengthScale * 100) === 100 ? 700 : 400 }}>100% (Chuẩn)</span>
                          <span>115% (Chân dài/Nhanh nhẹn)</span>
                        </div>
                        {/* Quick Presets */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          {[
                            { label: '85% (Ngắn)', value: 0.85 },
                            { label: '92% (Vừa)', value: 0.92 },
                            { label: '100% (Chuẩn)', value: 1.0 },
                            { label: '108% (Dài)', value: 1.08 },
                            { label: '115% (Thon dài)', value: 1.15 },
                          ].map((p) => {
                            const isCur = Math.round(config.body.legLengthScale * 100) === Math.round(p.value * 100);
                            return (
                              <button
                                key={p.value}
                                onClick={() => setConfig((prev) => ({ ...prev, body: { ...prev.body, legLengthScale: p.value } }))}
                                style={{
                                  flex: 1,
                                  padding: '5px 0',
                                  fontSize: '11px',
                                  fontWeight: isCur ? 700 : 500,
                                  borderRadius: '8px',
                                  border: isCur ? '1.5px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.20)',
                                  background: isCur ? '#6C5CE7' : '#FFFFFF',
                                  color: isCur ? '#FFFFFF' : 'var(--color-text-main)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ========================================================
                  TAB 1: ĐẦU (NGŨ QUAN, MẮT, MŨI, MÔI, HÀM, TÓC)
              ======================================================== */}
              {activeTab === 'head' && (
                <motion.div
                  key="tab-head"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}
                >
                  {/* Sub-navigation Pills for Head Tab */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '4px',
                      borderBottom: '1px solid rgba(108, 92, 231, 0.12)',
                    }}
                  >
                    {[
                      { id: 'all', label: '🌟 Tất Cả Ngũ Quan' },
                      { id: 'eyes_nose', label: '👁️ Mắt & Mũi' },
                      { id: 'mouth_jaw', label: '👄 Màu Môi & Khung Hàm' },
                      { id: 'hair', label: '💇 Kiểu & Màu Tóc' },
                      { id: 'expression', label: '😊 Biểu Cảm' },
                    ].map((sub) => {
                      const isSubActive = headFilter === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setHeadFilter(sub.id as HeadSubSection)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            border: isSubActive ? '1.5px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                            backgroundColor: isSubActive ? 'rgba(108, 92, 231, 0.12)' : '#FFFFFF',
                            color: isSubActive ? '#6C5CE7' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* 1. DÁNG MẮT & MÀU MẮT */}
                  {(headFilter === 'all' || headFilter === 'eyes_nose') && (
                    <div className="section-block">
                      <div style={{ marginBottom: '12px' }}>
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--color-text-main)',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Eye size={16} color="#6C5CE7" /> 1. Dáng Mắt & Màu Mắt (Eyes & Iris)
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          Khung hốc mắt 3D chuẩn giải phẫu và tròng mắt khúc xạ ánh sáng.
                        </p>
                      </div>

                      {/* Dáng mắt options */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        {REALISTIC_EYE_SHAPE_OPTIONS.map((opt) => {
                          const isSelected = (config.eyeShapeId || DEFAULT_REALISTIC_CONFIG.eyeShapeId) === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setConfig((prev) => ({ ...prev, eyeShapeId: opt.id }))}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{opt.badge}</span>
                                {isSelected && <Check size={14} color="#6C5CE7" strokeWidth={3} />}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                                {opt.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                                {opt.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bảng Màu Tròng Mắt PBR Cao Cấp (Full Width Grid) */}
                      <div style={{ marginTop: '14px', padding: '14px 16px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(108, 92, 231, 0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Palette size={15} color="#6C5CE7" /> Bảng Màu Tròng Mắt (Iris Palette)
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(108, 92, 231, 0.10)', color: '#6C5CE7' }}>
                            {REALISTIC_EYE_COLORS.length} Gam Màu Độc Đáo
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                            gap: '8px',
                          }}
                        >
                          {REALISTIC_EYE_COLORS.map((eyeCol) => {
                            const isSelected = (config.eyeColor || DEFAULT_REALISTIC_CONFIG.eyeColor)?.toLowerCase() === eyeCol.hex.toLowerCase();
                            return (
                              <div
                                key={eyeCol.id}
                                onClick={() => setConfig((prev) => ({ ...prev, eyeColor: eyeCol.hex }))}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '12px',
                                  border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.14)',
                                  backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FAF9FE',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  transition: 'all 0.18s ease',
                                }}
                              >
                                <div
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    backgroundColor: eyeCol.hex,
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.15)',
                                    border: '2px solid #FFFFFF',
                                    flexShrink: 0,
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      color: isSelected ? '#4F46E5' : 'var(--color-text-main)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {eyeCol.name}
                                  </div>
                                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                    {eyeCol.hex}
                                  </div>
                                </div>
                                {isSelected && <Check size={14} color="#6C5CE7" strokeWidth={3} />}
                              </div>
                            );
                          })}

                          {/* Thẻ Tự Chọn Màu Tròng Mắt Tùy Chỉnh (Native Color Picker) */}
                          {(() => {
                            const isPreset = REALISTIC_EYE_COLORS.some((c) => c.hex.toLowerCase() === (config.eyeColor || '').toLowerCase());
                            return (
                              <label
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '12px',
                                  border: !isPreset ? '2px solid #6C5CE7' : '1.5px dashed rgba(108, 92, 231, 0.4)',
                                  backgroundColor: !isPreset ? 'rgba(108, 92, 231, 0.08)' : '#FAF9FE',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  position: 'relative',
                                  transition: 'all 0.18s ease',
                                }}
                              >
                                <input
                                  type="color"
                                  value={config.eyeColor || '#151316'}
                                  onChange={(e) => setConfig((prev) => ({ ...prev, eyeColor: e.target.value }))}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer',
                                  }}
                                />
                                <div
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25), 0 2px 5px rgba(0,0,0,0.15)',
                                    border: '2px solid #FFFFFF',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: config.eyeColor || '#151316', border: '1px solid #FFFFFF' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      color: !isPreset ? '#4F46E5' : '#6C5CE7',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    🎨 Tự Chọn Màu...
                                  </div>
                                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                    {config.eyeColor}
                                  </div>
                                </div>
                                {!isPreset && <Check size={14} color="#6C5CE7" strokeWidth={3} />}
                              </label>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. DÁNG MŨI */}
                  {(headFilter === 'all' || headFilter === 'eyes_nose') && (
                    <div className="section-block">
                      <div style={{ marginBottom: '12px' }}>
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--color-text-main)',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Sparkle size={16} color="#6C5CE7" /> 2. Dáng Sống Mũi (Nose Morphology)
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          Góc trán mũi, sống mũi và chóp mũi thanh tú hài hòa.
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {REALISTIC_NOSE_SHAPE_OPTIONS.map((opt) => {
                          const isSelected = (config.noseShapeId || DEFAULT_REALISTIC_CONFIG.noseShapeId) === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setConfig((prev) => ({ ...prev, noseShapeId: opt.id }))}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{opt.badge}</span>
                                {isSelected && <Check size={14} color="#6C5CE7" strokeWidth={3} />}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                                {opt.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                                {opt.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. DÁNG MÔI & MÀU MÔI (LIPS & COLOR) */}
                  {(headFilter === 'all' || headFilter === 'mouth_jaw') && (
                    <div className="section-block">
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4
                            style={{
                              fontSize: '14px',
                              fontWeight: 800,
                              color: 'var(--color-text-main)',
                              margin: '0 0 4px 0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Smile size={16} color="#6C5CE7" /> 3. Dáng Môi & Màu Môi (Lips Morphology & Color)
                          </h4>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(108, 92, 231, 0.10)', color: '#6C5CE7' }}>
                            3 Dáng Môi 3D
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          Chọn kiểu dáng môi 3D (từ mỏng nhẹ, căng mọng đến môi trề to dày cộp độc lạ) và sắc màu môi tươi tắn.
                        </p>
                      </div>

                      {/* 3 Dáng Môi 3D Options */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                        {REALISTIC_MOUTH_SHAPE_OPTIONS.map((opt) => {
                          const isSelected = (config.mouthShapeId || DEFAULT_REALISTIC_CONFIG.mouthShapeId) === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setConfig((prev) => ({ ...prev, mouthShapeId: opt.id }))}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{opt.badge}</span>
                                {isSelected && <Check size={14} color="#6C5CE7" strokeWidth={3} />}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                                {opt.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                                {opt.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bảng Màu Môi (Lip Color Palette) Full-Width Grid */}
                      <div style={{ padding: '14px 16px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(108, 92, 231, 0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Palette size={15} color="#6C5CE7" /> Bảng Màu Sắc Môi (Lip Color Palette)
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#6C5CE7' }}>
                            {REALISTIC_LIP_COLORS.find((c) => c.hex.toLowerCase() === (config.lipColor || DEFAULT_REALISTIC_CONFIG.lipColor || '').toLowerCase())?.name || config.lipColor}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                          {REALISTIC_LIP_COLORS.map((lipCol) => {
                            const isSelected = (config.lipColor || DEFAULT_REALISTIC_CONFIG.lipColor || '').toLowerCase() === lipCol.hex.toLowerCase();
                            return (
                              <div
                                key={lipCol.id}
                                onClick={() => setConfig((prev) => ({ ...prev, lipColor: lipCol.hex }))}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  borderRadius: '10px',
                                  border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                  backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div
                                  style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    backgroundColor: lipCol.hex,
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 5px rgba(0,0,0,0.12)',
                                    border: '2px solid #FFFFFF',
                                    flexShrink: 0,
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      color: isSelected ? '#4F46E5' : 'var(--color-text-main)',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {lipCol.name}
                                  </div>
                                  <div style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                    {lipCol.hex}
                                  </div>
                                </div>
                                {isSelected && <Check size={13} color="#6C5CE7" strokeWidth={3} />}
                              </div>
                            );
                          })}

                          {/* Thẻ Tự Chọn Màu Môi Tùy Chỉnh (Native Color Spectrum) */}
                          {(() => {
                            const isPreset = REALISTIC_LIP_COLORS.some((c) => c.hex.toLowerCase() === (config.lipColor || '').toLowerCase());
                            return (
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 10px',
                                  borderRadius: '10px',
                                  border: !isPreset ? '2px solid #6C5CE7' : '1.5px dashed rgba(108, 92, 231, 0.4)',
                                  backgroundColor: !isPreset ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <input
                                  type="color"
                                  value={config.lipColor || '#DE7E8A'}
                                  onChange={(e) => setConfig((prev) => ({ ...prev, lipColor: e.target.value }))}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer',
                                  }}
                                />
                                <div
                                  style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25), 0 2px 5px rgba(0,0,0,0.12)',
                                    border: '2px solid #FFFFFF',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: config.lipColor || '#DE7E8A', border: '1px solid #FFFFFF' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      color: !isPreset ? '#4F46E5' : '#6C5CE7',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    🎨 Tự Chọn...
                                  </div>
                                  <div style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                    {config.lipColor}
                                  </div>
                                </div>
                                {!isPreset && <Check size={13} color="#6C5CE7" strokeWidth={3} />}
                              </label>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. CHÂN MÀY & KHUNG HÀM */}
                  {(headFilter === 'all' || headFilter === 'mouth_jaw') && (
                    <div className="section-block">
                      <div style={{ marginBottom: '12px' }}>
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--color-text-main)',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Layers size={16} color="#6C5CE7" /> 4. Chân Mày & Khung Hàm (Eyebrows & Jawline)
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          Khung xương mặt và chân mày định hình nét nam tính/nữ tính thanh thoát.
                        </p>
                      </div>

                      {/* Chân mày */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                          Dáng Chân Mày:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {REALISTIC_BROW_SHAPE_OPTIONS.map((opt) => {
                            const isSelected = (config.eyebrowShapeId || DEFAULT_REALISTIC_CONFIG.eyebrowShapeId) === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => setConfig((prev) => ({ ...prev, eyebrowShapeId: opt.id }))}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                  backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                                  {opt.name}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.badge}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Khung hàm */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                          Khung Hàm & Cằm:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {REALISTIC_JAW_SHAPE_OPTIONS.map((opt) => {
                            const isSelected = (config.jawlineShapeId || DEFAULT_REALISTIC_CONFIG.jawlineShapeId) === opt.id;
                            return (
                              <div
                                key={opt.id}
                                onClick={() => setConfig((prev) => ({ ...prev, jawlineShapeId: opt.id }))}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                  backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                                  {opt.name}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.badge}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. KIỂU TÓC & MÀU TÓC */}
                  {(headFilter === 'all' || headFilter === 'hair') && (
                    <div className="section-block">
                      <div style={{ marginBottom: '12px' }}>
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--color-text-main)',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Scissors size={16} color="#6C5CE7" /> 5. Kiểu Tóc & Màu Tóc (Hairstyles)
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          Kiểu tóc chuẩn salon và màu nhuộm tự nhiên.
                        </p>
                      </div>

                      {/* Danh sách kiểu tóc */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                        {REALISTIC_HAIR_OPTIONS.map((opt) => {
                          const isSelected = config.hairId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setConfig((prev) => ({ ...prev, hairId: opt.id }))}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{opt.badge}</span>
                                {isSelected && <Check size={14} color="#6C5CE7" strokeWidth={3} />}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                                {opt.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                                {opt.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bảng màu tóc */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(108, 92, 231, 0.12)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>Màu nhuộm tóc:</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {REALISTIC_HAIR_COLORS.map((hairCol) => {
                            const isSelected = config.hairColor?.toLowerCase() === hairCol.hex.toLowerCase();
                            return (
                              <button
                                key={hairCol.id}
                                onClick={() => setConfig((prev) => ({ ...prev, hairColor: hairCol.hex }))}
                                title={hairCol.name}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '16px',
                                  border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(0,0,0,0.1)',
                                  backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.1)' : '#FAF9FE',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: isSelected ? 700 : 500,
                                }}
                              >
                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: hairCol.hex, display: 'inline-block' }} />
                                <span>{hairCol.name}</span>
                              </button>
                            );
                          })}

                          {/* Nút Tự Chọn Màu Tóc Custom */}
                          {(() => {
                            const isPreset = REALISTIC_HAIR_COLORS.some((c) => c.hex.toLowerCase() === (config.hairColor || '').toLowerCase());
                            return (
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '16px',
                                  border: !isPreset ? '2px solid #6C5CE7' : '1.5px dashed rgba(108, 92, 231, 0.4)',
                                  backgroundColor: !isPreset ? 'rgba(108, 92, 231, 0.1)' : '#FFFFFF',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: !isPreset ? 700 : 500,
                                  position: 'relative',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <input
                                  type="color"
                                  value={config.hairColor || '#16161a'}
                                  onChange={(e) => setConfig((prev) => ({ ...prev, hairColor: e.target.value }))}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer',
                                  }}
                                />
                                <span
                                  style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                    display: 'inline-block',
                                  }}
                                />
                                <span style={{ color: '#6C5CE7' }}>🎨 Tự Chọn ({config.hairColor})</span>
                              </label>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. BIỂU CẢM & THẦN THÁI */}
                  {(headFilter === 'all' || headFilter === 'expression') && (
                    <div className="section-block">
                      <div style={{ marginBottom: '12px' }}>
                        <h4
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--color-text-main)',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Smile size={16} color="#6C5CE7" /> 6. Biểu Cảm & Thần Thái (Facial Expressions)
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                          Cơ mặt chuyển động sống động và thần thái tự nhiên.
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {REALISTIC_EXPRESSION_OPTIONS.map((opt) => {
                          const isSelected = config.faceId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => setConfig((prev) => ({ ...prev, faceId: opt.id }))}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                                backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{opt.badge}</span>
                                {isSelected && <Check size={14} color="#6C5CE7" strokeWidth={3} />}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                                {opt.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                                {opt.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ========================================================
                  TAB 2: THÂN (ÁO & TRANG PHỤC TRÊN)
              ======================================================== */}
              {activeTab === 'torso' && (
                <motion.div
                  key="tab-torso"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--color-text-main)',
                        margin: '0 0 6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Shirt size={18} color="#6C5CE7" /> Bộ Sưu Tập Áo & Trang Phục Thân Trên
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                      Lựa chọn kiểu dáng áo và phối màu yêu thích cho nhân vật.
                    </p>
                  </div>

                  {/* Danh sách áo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {REALISTIC_SHIRT_OPTIONS.map((shirt) => {
                      const isSelected = config.shirtId === shirt.id;
                      return (
                        <div
                          key={shirt.id}
                          onClick={() => setConfig((prev) => ({ ...prev, shirtId: shirt.id }))}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                            backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{shirt.badge}</span>
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)' }}>
                                {shirt.materialType}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                              {shirt.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                              {shirt.description}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6C5CE7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={16} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bảng màu áo */}
                  {config.shirtId !== 'shirt_none' && (
                    <div style={{ padding: '14px 16px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(108, 92, 231, 0.15)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '10px' }}>
                        🎨 Bảng Màu Áo (Shirt Color Palette):
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {SHIRT_COLORS.map((sc) => {
                          const isColorSelected = config.shirtColor?.toLowerCase() === sc.hex.toLowerCase();
                          return (
                            <button
                              key={sc.id}
                              onClick={() => setConfig((prev) => ({ ...prev, shirtColor: sc.hex }))}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: isColorSelected ? '2px solid #6C5CE7' : '1px solid rgba(0,0,0,0.12)',
                                backgroundColor: isColorSelected ? 'rgba(108, 92, 231, 0.1)' : '#FAF9FE',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: isColorSelected ? 700 : 500,
                              }}
                            >
                              <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: sc.hex, border: '1px solid rgba(0,0,0,0.2)', display: 'inline-block' }} />
                              <span>{sc.name}</span>
                            </button>
                          );
                        })}

                        {/* Nút Tự Chọn Màu Áo Custom */}
                        {(() => {
                          const isPreset = SHIRT_COLORS.some((c) => c.hex.toLowerCase() === (config.shirtColor || '').toLowerCase());
                          return (
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: !isPreset ? '2px solid #6C5CE7' : '1.5px dashed rgba(108, 92, 231, 0.4)',
                                backgroundColor: !isPreset ? 'rgba(108, 92, 231, 0.1)' : '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: !isPreset ? 700 : 500,
                                position: 'relative',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="color"
                                value={config.shirtColor || '#ffffff'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, shirtColor: e.target.value }))}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  cursor: 'pointer',
                                }}
                              />
                              <span
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                  display: 'inline-block',
                                }}
                              />
                              <span style={{ color: '#6C5CE7' }}>🎨 Tự Chọn ({config.shirtColor})</span>
                            </label>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ========================================================
                  TAB 3: CHÂN (QUẦN & TRANG PHỤC DƯỚI)
              ======================================================== */}
              {activeTab === 'legs' && (
                <motion.div
                  key="tab-legs"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--color-text-main)',
                        margin: '0 0 6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Layers size={18} color="#6C5CE7" /> Bộ Sưu Tập Quần & Trang Phục Thân Dưới
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                      Phom dáng quần jeans, quần tây chỉn chu hoặc quần thể thao năng động.
                    </p>
                  </div>

                  {/* Danh sách quần */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {REALISTIC_PANTS_OPTIONS.map((pants) => {
                      const isSelected = config.pantsId === pants.id;
                      return (
                        <div
                          key={pants.id}
                          onClick={() => setConfig((prev) => ({ ...prev, pantsId: pants.id }))}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                            backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{pants.badge}</span>
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)' }}>
                                {pants.materialType}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                              {pants.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                              {pants.description}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6C5CE7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={16} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bảng màu quần */}
                  {config.pantsId !== 'pants_underwear_briefs' && (
                    <div style={{ padding: '14px 16px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(108, 92, 231, 0.15)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '10px' }}>
                        🎨 Bảng Màu Quần (Pants Color Palette):
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {PANTS_COLORS.map((pc) => {
                          const isColorSelected = config.pantsColor?.toLowerCase() === pc.hex.toLowerCase();
                          return (
                            <button
                              key={pc.id}
                              onClick={() => setConfig((prev) => ({ ...prev, pantsColor: pc.hex }))}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: isColorSelected ? '2px solid #6C5CE7' : '1px solid rgba(0,0,0,0.12)',
                                backgroundColor: isColorSelected ? 'rgba(108, 92, 231, 0.1)' : '#FAF9FE',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: isColorSelected ? 700 : 500,
                              }}
                            >
                              <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: pc.hex, border: '1px solid rgba(0,0,0,0.2)', display: 'inline-block' }} />
                              <span>{pc.name}</span>
                            </button>
                          );
                        })}

                        {/* Nút Tự Chọn Màu Quần Custom */}
                        {(() => {
                          const isPreset = PANTS_COLORS.some((c) => c.hex.toLowerCase() === (config.pantsColor || '').toLowerCase());
                          return (
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: !isPreset ? '2px solid #6C5CE7' : '1.5px dashed rgba(108, 92, 231, 0.4)',
                                backgroundColor: !isPreset ? 'rgba(108, 92, 231, 0.1)' : '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: !isPreset ? 700 : 500,
                                position: 'relative',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="color"
                                value={config.pantsColor || '#1e293b'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, pantsColor: e.target.value }))}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  cursor: 'pointer',
                                }}
                              />
                              <span
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                  display: 'inline-block',
                                }}
                              />
                              <span style={{ color: '#6C5CE7' }}>🎨 Tự Chọn ({config.pantsColor})</span>
                            </label>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ========================================================
                  TAB 4: BÀN CHÂN (GIÀY & FOOTWEAR)
              ======================================================== */}
              {activeTab === 'feet' && (
                <motion.div
                  key="tab-feet"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: 'var(--color-text-main)',
                        margin: '0 0 6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Footprints size={18} color="#6C5CE7" /> Bộ Sưu Tập Giày & Phụ Kiện Bàn Chân
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                      Sneaker thể thao, giày tây da bóng hoặc chân trần chuẩn giải phẫu.
                    </p>
                  </div>

                  {/* Danh sách giày */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {REALISTIC_SHOES_OPTIONS.map((shoes) => {
                      const isSelected = config.shoesId === shoes.id;
                      return (
                        <div
                          key={shoes.id}
                          onClick={() => setConfig((prev) => ({ ...prev, shoesId: shoes.id }))}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: isSelected ? '2px solid #6C5CE7' : '1px solid rgba(108, 92, 231, 0.15)',
                            backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6C5CE7' }}>{shoes.badge}</span>
                              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-text-muted)' }}>
                                {shoes.materialType}
                              </span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#4F46E5' : 'var(--color-text-main)' }}>
                              {shoes.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                              {shoes.description}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#6C5CE7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={16} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bảng màu giày */}
                  {config.shoesId !== 'shoes_barefoot' && (
                    <div style={{ padding: '14px 16px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid rgba(108, 92, 231, 0.15)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '10px' }}>
                        🎨 Bảng Màu Giày (Shoes Color Palette):
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {SHOES_COLORS.map((shc) => {
                          const isColorSelected = config.shoesColor?.toLowerCase() === shc.hex.toLowerCase();
                          return (
                            <button
                              key={shc.id}
                              onClick={() => setConfig((prev) => ({ ...prev, shoesColor: shc.hex }))}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: isColorSelected ? '2px solid #6C5CE7' : '1px solid rgba(0,0,0,0.12)',
                                backgroundColor: isColorSelected ? 'rgba(108, 92, 231, 0.1)' : '#FAF9FE',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: isColorSelected ? 700 : 500,
                              }}
                            >
                              <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: shc.hex, border: '1px solid rgba(0,0,0,0.2)', display: 'inline-block' }} />
                              <span>{shc.name}</span>
                            </button>
                          );
                        })}

                        {/* Nút Tự Chọn Màu Giày Custom */}
                        {(() => {
                          const isPreset = SHOES_COLORS.some((c) => c.hex.toLowerCase() === (config.shoesColor || '').toLowerCase());
                          return (
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                border: !isPreset ? '2px solid #6C5CE7' : '1.5px dashed rgba(108, 92, 231, 0.4)',
                                backgroundColor: !isPreset ? 'rgba(108, 92, 231, 0.1)' : '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: !isPreset ? 700 : 500,
                                position: 'relative',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="color"
                                value={config.shoesColor || '#f8fafc'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, shoesColor: e.target.value }))}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  cursor: 'pointer',
                                }}
                              />
                              <span
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)',
                                  display: 'inline-block',
                                }}
                              />
                              <span style={{ color: '#6C5CE7' }}>🎨 Tự Chọn ({config.shoesColor})</span>
                            </label>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ==========================================
            3. FOOTER ACTIONS
        ========================================== */}
        <div
          style={{
            padding: '14px 28px',
            borderTop: '1.5px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            💡 Mẹo: Chuyển đổi giữa các tab (Chung, Đầu, Thân, Chân, Bàn Chân) để camera tự động zoom vào chi tiết từng bộ phận.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {onClose && (
              <button
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '9px 20px', fontSize: '13px', borderRadius: '10px' }}
              >
                Hủy Bỏ
              </button>
            )}

            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{
                padding: '9px 28px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6C5CE7, #4F46E5)',
                boxShadow: '0 4px 14px rgba(108, 92, 231, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={15} /> Hoàn Tất & Tiếp Tục
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
