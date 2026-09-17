import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Check,
  RotateCcw,
  Rotate3d,
  Palette,
} from 'lucide-react';
import type { CharacterAvatarConfig } from '../../../types/game';
import {
  type RealisticAvatarConfig,
  DEFAULT_REALISTIC_CONFIG,
  normalizeToRealisticConfig,
} from '../../../three/character/RealisticAssetsCatalog';
import { Character3DViewer } from './Character3DViewer';

interface CharacterCustomizerModalProps {
  initialConfig?: CharacterAvatarConfig | RealisticAvatarConfig | any;
  characterName?: string;
  gender?: 'male' | 'female';
  onConfirm: (config: any) => void;
  onClose?: () => void;
}

// Danh sách các tông màu da & chất liệu PBR cao cấp cho khung 3D
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

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  initialConfig,
  characterName = 'Nhân Vật',
  onConfirm,
  onClose,
}) => {
  const [config, setConfig] = useState<RealisticAvatarConfig>(() => {
    return normalizeToRealisticConfig(initialConfig);
  });

  const [autoRotate, setAutoRotate] = useState(false);

  // Chọn màu da
  const handleSelectSkinTone = (hex: string) => {
    setConfig((prev) => ({
      ...prev,
      skinTone: hex,
    }));
  };

  // Reset về mặc định
  const handleResetDefault = () => {
    setConfig({
      ...DEFAULT_REALISTIC_CONFIG,
      skinTone: '#B57850',
    });
  };

  // Xác nhận lưu nhân vật
  const handleConfirm = () => {
    const mergedConfig = {
      ...config,
      heightScale: config.body.heightCm / 176,
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
        backgroundColor: 'rgba(12, 6, 24, 0.90)',
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
          maxWidth: '1080px',
          height: '88vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: '0 28px 70px rgba(0, 0, 0, 0.45)',
          border: '2px solid rgba(108, 92, 231, 0.25)',
        }}
      >
        {/* ==========================================
            1. HEADER BAR
        ========================================== */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1.5px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(245, 243, 255, 0.95), rgba(238, 242, 255, 0.95))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6C5CE7, #8075FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(108, 92, 231, 0.35)',
              }}
            >
              <Palette size={22} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--color-text-main)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                TÙY BIẾN NHÂN VẬT 3D
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Lựa chọn màu sắc và diện mạo cho <strong style={{ color: '#4F46E5' }}>{characterName}</strong>
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
                padding: '8px 14px',
                fontSize: '13px',
                borderRadius: '10px',
              }}
            >
              <RotateCcw size={14} /> Mặc Định
            </button>
          </div>
        </div>

        {/* ==========================================
            2. BODY CONTENT (3D View + Skin Palette)
        ========================================== */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* CỘT TRÁI: 3D VIEWER */}
          <div
            style={{
              flex: '0 0 48%',
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
                  background: 'rgba(108, 92, 231, 0.85)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                }}
              >
                <Sparkles size={14} /> 3D View
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
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Rotate3d size={14} /> Xoay: {autoRotate ? 'BẬT' : 'TẮT'}
              </button>
            </div>

            {/* Canvas 3D Viewer */}
            <div style={{ flex: 1, width: '100%', height: '100%' }}>
              <Character3DViewer
                config={config}
                autoRotate={autoRotate}
                showPodium={true}
                cameraDistance={2.5}
              />
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG CHỌN MÀU DA */}
          <div
            style={{
              flex: '1',
              padding: '24px 28px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FAF9FE',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
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
                <Palette size={18} color="#6C5CE7" /> Bảng Màu Da & Chất Liệu Cơ Thể (Skin Tone Palette)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Chọn gam màu da phù hợp cho nhân vật của bạn. Các chi tiết ngoại hình khác sẽ được phát triển tiếp ở các giai đoạn sau.
              </p>
            </div>

            {/* Grid danh sách màu da */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '14px',
              }}
            >
              {EXPANDED_SKIN_TONES.map((tone) => {
                const isSelected = config.skinTone?.toLowerCase() === tone.hex.toLowerCase();

                return (
                  <motion.div
                    key={tone.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectSkinTone(tone.hex)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: isSelected ? '2.5px solid #6C5CE7' : '1.5px solid rgba(108, 92, 231, 0.15)',
                      backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 6px 18px rgba(108, 92, 231, 0.22)' : '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      position: 'relative',
                    }}
                  >
                    {/* Color Swatch Circle */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: tone.hex,
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 3px 8px rgba(0,0,0,0.15)',
                        border: '2px solid #FFFFFF',
                        flexShrink: 0,
                      }}
                    />

                    {/* Tone Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#6C5CE7',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {tone.badge}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: isSelected ? '#4F46E5' : 'var(--color-text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {tone.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        {tone.hex}
                      </div>
                    </div>

                    {/* Selected Check Icon */}
                    {isSelected && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#6C5CE7',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(108, 92, 231, 0.4)',
                        }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==========================================
            3. FOOTER ACTIONS
        ========================================== */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1.5px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            💡 Mẹo: Dùng chuột trái để xoay 360°, cuộn chuột để phóng to / thu nhỏ mô hình.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {onClose && (
              <button
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '12px' }}
              >
                Hủy Bỏ
              </button>
            )}

            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{
                padding: '10px 30px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6C5CE7, #4F46E5)',
                boxShadow: '0 4px 14px rgba(108, 92, 231, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} /> Xác Nhận & Tiếp Tục
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
