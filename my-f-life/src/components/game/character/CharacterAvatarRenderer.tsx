import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CharacterAvatarConfig } from '../../../types/game';
import { DEFAULT_AVATAR_CONFIG } from '../../../data/characterAssetsData';
import { Character3DViewer } from './Character3DViewer';

interface CharacterAvatarRendererProps {
  config?: CharacterAvatarConfig;
  width?: number | string;
  height?: number | string;
  interactiveParallax?: boolean;
  showShadow?: boolean;
  showPodium?: boolean;
  autoRotateFloat?: boolean;
  use3D?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const CharacterAvatarRenderer: React.FC<CharacterAvatarRendererProps> = ({
  config = DEFAULT_AVATAR_CONFIG,
  width = 280,
  height = 360,
  interactiveParallax = false,
  showShadow = true,
  showPodium = false,
  autoRotateFloat = false,
  use3D = false,
  className = '',
  style = {},
  onClick,
}) => {
  if (use3D) {
    return (
      <Character3DViewer
        config={config}
        width={width}
        height={height}
        showPodium={showPodium}
        autoRotate={autoRotateFloat}
        enableControls={interactiveParallax}
        className={className}
        style={style}
        onCharacterClick={onClick}
      />
    );
  }
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; tiltX: number; tiltY: number }>({
    x: 0,
    y: 0,
    tiltX: 0,
    tiltY: 0,
  });

  const skin = config.skinTone || '#FFE8D6';
  const hairColor = config.hairColor || '#22202A';
  const heightScale = config.heightScale || 1.0;
  const legScale = config.legScale || 1.0;
  const headScale = config.headScale || 1.0;

  // Tính toán tương tác Parallax Tilt khi di chuột hoặc kéo chuột
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactiveParallax) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tiltX: tilt.x,
      tiltY: tilt.y,
    };
  };

  useEffect(() => {
    if (!interactiveParallax) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Giới hạn góc xoay tối đa ±25 độ
      const nextTiltY = Math.max(-25, Math.min(25, dragStartRef.current.tiltY + deltaX * 0.25));
      const nextTiltX = Math.max(-20, Math.min(20, dragStartRef.current.tiltX - deltaY * 0.2));

      setTilt({ x: nextTiltX, y: nextTiltY });
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, interactiveParallax]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveParallax || isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const tiltY = (mouseX / (rect.width / 2)) * 14;
    const tiltX = -(mouseY / (rect.height / 2)) * 12;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isDragging) {
      setTilt({ x: 0, y: 0 });
    }
  };

  // =========================================================================
  // 🎨 VECTOR RENDERERS CHO TỪNG BỘ PHẬN
  // =========================================================================

  // 1. Phụ Kiện Sau Lưng (Balo trứng vàng)
  const renderBackAccessory = () => {
    if (config.accessoryId === 'acc_egg_backpack') {
      return (
        <g id="back_backpack">
          <ellipse cx="68" cy="195" rx="28" ry="36" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />
          <ellipse cx="64" cy="188" rx="20" ry="26" fill="#FDE68A" />
          <path d="M54 175 C 60 170, 75 170, 80 175" stroke="#B45309" strokeWidth="2.5" fill="none" />
          <rect x="63" y="196" width="10" height="12" rx="3" fill="#D97706" />
        </g>
      );
    }
    return null;
  };

  // 2. Chân & Giày
  const renderLegsAndShoes = () => {
    const legY = 245 + (legScale - 1) * 20;
    const footY = legY + 40;

    return (
      <g id="layer_legs_and_shoes">
        {/* Hai chân da */}
        <rect x="88" y={legY - 20} width="22" height="50" rx="10" fill={skin} stroke="#29243D" strokeWidth="2.5" />
        <rect x="130" y={legY - 20} width="22" height="50" rx="10" fill={skin} stroke="#29243D" strokeWidth="2.5" />

        {/* 👟 6 LOẠI GIÀY */}
        {config.shoesId === 'shoes_lightup_red' && (
          <g id="shoes_lightup_red">
            {/* Chân trái */}
            <rect x="78" y={footY} width="36" height="22" rx="10" fill="#EF4444" stroke="#29243D" strokeWidth="2.5" />
            <path d="M78 274 L114 274" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="86" cy="275" r="3" fill="#FDE047" className="animate-pulse" />
            <circle cx="98" cy="275" r="3" fill="#60A5FA" className="animate-pulse" />
            {/* Chân phải */}
            <rect x="126" y={footY} width="36" height="22" rx="10" fill="#EF4444" stroke="#29243D" strokeWidth="2.5" />
            <path d="M126 274 L162 274" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="134" cy="275" r="3" fill="#FDE047" className="animate-pulse" />
            <circle cx="146" cy="275" r="3" fill="#60A5FA" className="animate-pulse" />
          </g>
        )}

        {config.shoesId === 'shoes_pink_bow' && (
          <g id="shoes_pink_bow">
            <rect x="80" y={footY + 2} width="33" height="19" rx="9" fill="#F472B6" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="94" cy={footY + 5} r="4" fill="#DB2777" />
            <rect x="127" y={footY + 2} width="33" height="19" rx="9" fill="#F472B6" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="141" cy={footY + 5} r="4" fill="#DB2777" />
          </g>
        )}

        {config.shoesId === 'shoes_bitis_sandals' && (
          <g id="shoes_bitis_sandals">
            <rect x="80" y={footY + 4} width="34" height="16" rx="8" fill="#1E293B" stroke="#29243D" strokeWidth="2.5" />
            <path d="M84 270 L110 270" stroke="#3B82F6" strokeWidth="4" />
            <rect x="126" y={footY + 4} width="34" height="16" rx="8" fill="#1E293B" stroke="#29243D" strokeWidth="2.5" />
            <path d="M130 270 L156 270" stroke="#3B82F6" strokeWidth="4" />
          </g>
        )}

        {config.shoesId === 'shoes_yellow_boots' && (
          <g id="shoes_yellow_boots">
            <rect x="78" y={footY - 8} width="35" height="28" rx="8" fill="#FBBF24" stroke="#29243D" strokeWidth="2.5" />
            <path d="M78 274 L113 274" stroke="#B45309" strokeWidth="4" />
            <rect x="127" y={footY - 8} width="35" height="28" rx="8" fill="#FBBF24" stroke="#29243D" strokeWidth="2.5" />
            <path d="M127 274 L162 274" stroke="#B45309" strokeWidth="4" />
          </g>
        )}

        {config.shoesId === 'shoes_white_kicks' && (
          <g id="shoes_white_kicks">
            <rect x="80" y={footY} width="34" height="20" rx="9" fill="#FFFFFF" stroke="#29243D" strokeWidth="2.5" />
            <path d="M83 271 L108 271" stroke="#94A3B8" strokeWidth="3" />
            <rect x="126" y={footY} width="34" height="20" rx="9" fill="#FFFFFF" stroke="#29243D" strokeWidth="2.5" />
            <path d="M129 271 L154 271" stroke="#94A3B8" strokeWidth="3" />
          </g>
        )}

        {config.shoesId === 'shoes_shark_slippers' && (
          <g id="shoes_shark_slippers">
            {/* Chân trái cá mập */}
            <path d="M76 278 C 76 264, 114 264, 114 278 Z" fill="#60A5FA" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="86" cy="270" r="2.5" fill="#1E293B" />
            <path d="M92 276 L94 272 L97 276 L100 272 L103 276" stroke="#FFFFFF" strokeWidth="2" fill="none" />
            {/* Chân phải cá mập */}
            <path d="M126 278 C 126 264, 164 264, 164 278 Z" fill="#60A5FA" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="136" cy="270" r="2.5" fill="#1E293B" />
            <path d="M142 276 L144 272 L147 276 L150 272 L153 276" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          </g>
        )}
      </g>
    );
  };

  // 3. Quần & Váy (20 Loại)
  const renderPants = () => {
    switch (config.pantsId) {
      case 'pants_hole_butt': // Thủng đít
        return (
          <g id="pants_hole_butt">
            <path d="M84 215 L156 215 L154 246 L128 246 L120 228 L112 246 L86 246 Z" fill="#3B82F6" stroke="#29243D" strokeWidth="2.5" />
            {/* Lỗ thủng đít gió lùa */}
            <ellipse cx="120" cy="235" rx="8" ry="6" fill={skin} stroke="#EF4444" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        );
      case 'pants_droopy_pajamas': // Pijama dài quét đất
        return (
          <g id="pants_droopy_pajamas">
            <path d="M82 215 L158 215 L164 268 L134 268 L120 230 L106 268 L76 268 Z" fill="#A7F3D0" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="95" cy="235" r="3" fill="#10B981" />
            <circle cx="145" cy="245" r="3" fill="#10B981" />
          </g>
        );
      case 'pants_diaper_bulge': // Lòi bỉm phồng tướng
        return (
          <g id="pants_diaper_bulge">
            <ellipse cx="120" cy="236" rx="42" ry="24" fill="#F8FAFC" stroke="#29243D" strokeWidth="2.5" />
            <path d="M82 220 L158 220 L150 240 L90 240 Z" fill="#F59E0B" opacity="0.4" />
          </g>
        );
      case 'pants_floral_boxer': // Quần hoa bà ngoại
        return (
          <g id="pants_floral_boxer">
            <path d="M84 215 L156 215 L155 248 L128 248 L120 226 L112 248 L85 248 Z" fill="#F43F5E" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="96" cy="226" r="3" fill="#FDE047" />
            <circle cx="144" cy="234" r="3.5" fill="#FDE047" />
            <circle cx="106" cy="240" r="3" fill="#FDE047" />
          </g>
        );
      case 'pants_stained_knees': // Đầu gối dính bùn
        return (
          <g id="pants_stained_knees">
            <path d="M85 215 L155 215 L154 252 L128 252 L120 228 L112 252 L86 252 Z" fill="#334155" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="98" cy="248" rx="6" ry="4" fill="#78350F" opacity="0.8" />
            <ellipse cx="142" cy="248" rx="6" ry="4" fill="#78350F" opacity="0.8" />
          </g>
        );
      case 'pants_reversed': // Mặc lộn trái
        return (
          <g id="pants_reversed">
            <path d="M85 215 L155 215 L154 246 L128 246 L120 228 L112 246 L86 246 Z" fill="#94A3B8" stroke="#29243D" strokeWidth="2.5" />
            <line x1="88" y1="215" x2="88" y2="246" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="152" y1="215" x2="152" y2="246" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="135" y="218" width="8" height="6" fill="#FFFFFF" stroke="#EF4444" strokeWidth="1" />
          </g>
        );
      case 'pants_elastic_loose': // Tụt chun hông
        return (
          <g id="pants_elastic_loose">
            <path d="M84 225 L156 222 L154 254 L128 254 L120 236 L112 254 L86 254 Z" fill="#64748B" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="120" cy="223" rx="36" ry="6" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" />
          </g>
        );
      case 'pants_uniform_navy': // Soóc xanh đồng phục mầm non
        return (
          <g id="pants_uniform_navy">
            <path d="M84 215 L156 215 L155 248 L128 248 L120 228 L112 248 L85 248 Z" fill="#1E3A8A" stroke="#29243D" strokeWidth="2.5" />
            <line x1="120" y1="215" x2="120" y2="228" stroke="#3B82F6" strokeWidth="2" />
          </g>
        );
      case 'pants_sport_jogger': // Quần thể thao 3 sọc
        return (
          <g id="pants_sport_jogger">
            <path d="M85 215 L155 215 L152 258 L128 258 L120 230 L112 258 L88 258 Z" fill="#18181B" stroke="#29243D" strokeWidth="2.5" />
            <line x1="88" y1="218" x2="90" y2="256" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="152" y1="218" x2="150" y2="256" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        );
      case 'pants_denim_dungarees': // Yếm bò Mario
        return (
          <g id="pants_denim_dungarees">
            <path d="M84 215 L156 215 L154 250 L128 250 L120 228 L112 250 L86 250 Z" fill="#2563EB" stroke="#29243D" strokeWidth="2.5" />
            <rect x="94" y="196" width="52" height="22" fill="#2563EB" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="102" cy="202" r="3" fill="#F59E0B" />
            <circle cx="138" cy="202" r="3" fill="#F59E0B" />
          </g>
        );
      case 'pants_cartoon_sponge': // Quần bọt biển Spongebob
        return (
          <g id="pants_cartoon_sponge">
            <path d="M85 215 L155 215 L154 246 L128 246 L120 228 L112 246 L86 246 Z" fill="#FACC15" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="105" cy="232" rx="4" ry="5" fill="#EAB308" />
            <ellipse cx="135" cy="235" rx="5" ry="4" fill="#EAB308" />
          </g>
        );
      case 'pants_camo_cargo': // Quần túi hộp rằn ri
        return (
          <g id="pants_camo_cargo">
            <path d="M84 215 L156 215 L155 252 L128 252 L120 228 L112 252 L85 252 Z" fill="#4D7C0F" stroke="#29243D" strokeWidth="2.5" />
            <rect x="80" y="230" width="10" height="14" rx="2" fill="#365314" stroke="#29243D" strokeWidth="1.5" />
            <rect x="150" y="230" width="10" height="14" rx="2" fill="#365314" stroke="#29243D" strokeWidth="1.5" />
          </g>
        );
      case 'pants_basketball_mesh': // Quần bóng rổ số 23
        return (
          <g id="pants_basketball_mesh">
            <path d="M83 215 L157 215 L156 254 L128 254 L120 228 L112 254 L84 254 Z" fill="#DC2626" stroke="#29243D" strokeWidth="2.5" />
            <path d="M83 250 L157 250" stroke="#FFFFFF" strokeWidth="2" />
            <text x="140" y="246" fontSize="10" fontWeight="900" fill="#FFFFFF">23</text>
          </g>
        );
      case 'pants_khaki_chinos': // Quần soóc kaki be
        return (
          <g id="pants_khaki_chinos">
            <path d="M85 215 L155 215 L154 246 L128 246 L120 228 L112 246 L86 246 Z" fill="#D4B996" stroke="#29243D" strokeWidth="2.5" />
            <line x1="85" y1="220" x2="155" y2="220" stroke="#A88B67" strokeWidth="2" />
          </g>
        );
      case 'pants_tuxedo_slacks': // Quần tây âu thẳng tắp
        return (
          <g id="pants_tuxedo_slacks">
            <path d="M86 215 L154 215 L152 260 L128 260 L120 230 L112 260 L88 260 Z" fill="#09090B" stroke="#29243D" strokeWidth="2.5" />
            <line x1="86" y1="218" x2="154" y2="218" stroke="#EAB308" strokeWidth="2" />
          </g>
        );
      case 'pants_pleated_tartan': // Chân váy xếp ly caro Anh Quốc
        return (
          <g id="pants_pleated_tartan">
            <path d="M82 215 L158 215 L168 248 L72 248 Z" fill="#B91C1C" stroke="#29243D" strokeWidth="2.5" />
            <line x1="90" y1="215" x2="84" y2="248" stroke="#FDE047" strokeWidth="2" />
            <line x1="120" y1="215" x2="120" y2="248" stroke="#FDE047" strokeWidth="2" />
            <line x1="150" y1="215" x2="156" y2="248" stroke="#FDE047" strokeWidth="2" />
          </g>
        );
      case 'pants_tutu_ballerina': // Váy ballet xòe bồng bềnh
        return (
          <g id="pants_tutu_ballerina">
            <path d="M80 216 L160 216 L174 246 C 174 254, 66 254, 66 246 Z" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2.5" />
            <path d="M82 226 L158 226 L168 250 C 168 256, 72 256, 72 250 Z" fill="#FBCFE8" opacity="0.8" />
          </g>
        );
      case 'pants_white_linen': // Quần đũi trắng du thuyền
        return (
          <g id="pants_white_linen">
            <path d="M85 215 L155 215 L153 258 L128 258 L120 230 L112 258 L87 258 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
            <line x1="100" y1="222" x2="100" y2="255" stroke="#E2E8F0" strokeWidth="2" />
            <line x1="140" y1="222" x2="140" y2="255" stroke="#E2E8F0" strokeWidth="2" />
          </g>
        );
      case 'pants_leather_moto': // Quần da đen bóng
        return (
          <g id="pants_leather_moto">
            <path d="M85 215 L155 215 L153 258 L128 258 L120 230 L112 258 L87 258 Z" fill="#18181B" stroke="#29243D" strokeWidth="2.5" />
            <path d="M92 225 L106 235" stroke="#52525B" strokeWidth="2" />
            <path d="M148 225 L134 235" stroke="#52525B" strokeWidth="2" />
          </g>
        );
      case 'pants_gold_silk': // Quần lụa tơ tằm vàng óng
        return (
          <g id="pants_gold_silk">
            <path d="M85 215 L155 215 L153 258 L128 258 L120 230 L112 258 L87 258 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
            <ellipse cx="120" cy="217" rx="34" ry="4" fill="#FDE68A" />
          </g>
        );
      default:
        return (
          <g id="pants_default">
            <path d="M84 215 L156 215 L155 248 L128 248 L120 228 L112 248 L85 248 Z" fill="#1E3A8A" stroke="#29243D" strokeWidth="2.5" />
          </g>
        );
    }
  };

  // 4. Thân & Áo (20 Loại)
  const renderTorsoAndShirt = () => {
    return (
      <g id="layer_torso_and_shirt">
        {/* Hai cánh tay da nền */}
        <rect x="62" y="160" width="22" height="55" rx="10" fill={skin} stroke="#29243D" strokeWidth="2.5" />
        <rect x="156" y="160" width="22" height="55" rx="10" fill={skin} stroke="#29243D" strokeWidth="2.5" />

        {/* 👕 20 LOẠI ÁO */}
        {config.shirtId === 'shirt_sloppy_tanktop' && (
          <g id="shirt_sloppy_tanktop">
            <path d="M82 152 C 92 145, 148 145, 158 152 L154 220 L86 220 Z" fill="#F5F5F0" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="120" cy="180" rx="18" ry="12" fill="#EAD99B" opacity="0.6" />
          </g>
        )}

        {config.shirtId === 'shirt_food_stain' && (
          <g id="shirt_food_stain">
            <path d="M72 150 L168 150 L158 220 L82 220 Z" fill="#F8FAFC" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="110" cy="175" r="7" fill="#DC2626" />
            <circle cx="118" cy="184" r="4" fill="#DC2626" />
            <circle cx="130" cy="190" r="5" fill="#EA580C" />
          </g>
        )}

        {config.shirtId === 'shirt_stretched_collar' && (
          <g id="shirt_stretched_collar">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#60A5FA" stroke="#29243D" strokeWidth="2.5" />
            <path d="M90 150 C 95 180, 145 180, 150 150 Z" fill={skin} stroke="#29243D" strokeWidth="2.5" />
          </g>
        )}

        {config.shirtId === 'shirt_backwards' && (
          <g id="shirt_backwards">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#F472B6" stroke="#29243D" strokeWidth="2.5" />
            <rect x="114" y="152" width="12" height="10" fill="#FFFFFF" stroke="#EF4444" strokeWidth="1.5" />
            <line x1="120" y1="162" x2="120" y2="215" stroke="#DB2777" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        )}

        {config.shirtId === 'shirt_ripped_punk' && (
          <g id="shirt_ripped_punk">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#18181B" stroke="#29243D" strokeWidth="2.5" />
            <path d="M158 152 L176 170 L168 180 L162 172 Z" fill="#18181B" stroke="#29243D" strokeWidth="2.5" />
            {/* Vết rách tưa một bên tay */}
            <path d="M62 152 L78 152 L76 168 L70 162 L66 174 L62 165 Z" fill="#18181B" stroke="#29243D" strokeWidth="2" />
          </g>
        )}

        {config.shirtId === 'shirt_superhero_fake' && (
          <g id="shirt_superhero_fake">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#DC2626" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="120" cy="180" rx="18" ry="20" fill="#2563EB" />
            {/* Nhện méo mó pha ke */}
            <circle cx="120" cy="180" r="6" fill="#18181B" />
            <line x1="110" y1="172" x2="130" y2="188" stroke="#18181B" strokeWidth="2" />
            <line x1="110" y1="188" x2="130" y2="172" stroke="#18181B" strokeWidth="2" />
          </g>
        )}

        {config.shirtId === 'shirt_duck_bib' && (
          <g id="shirt_duck_bib">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#E2E8F0" stroke="#29243D" strokeWidth="2.5" />
            {/* Yếm ăn dặm hình vịt vàng */}
            <path d="M96 150 C 96 195, 144 195, 144 150 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
            <ellipse cx="120" cy="172" rx="4" ry="2.5" fill="#EA580C" />
            <circle cx="114" cy="166" r="2" fill="#18181B" />
            <circle cx="126" cy="166" r="2" fill="#18181B" />
          </g>
        )}

        {config.shirtId === 'shirt_kindergarten_standard' && (
          <g id="shirt_kindergarten_standard">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#FBBF24" stroke="#29243D" strokeWidth="2.5" />
            {/* Cổ sen xanh navy */}
            <path d="M95 150 C 95 168, 120 172, 120 172 C 120 172, 145 168, 145 150 Z" fill="#1E3A8A" stroke="#29243D" strokeWidth="2" />
            <circle cx="120" cy="185" r="3" fill="#1E3A8A" />
            <circle cx="120" cy="200" r="3" fill="#1E3A8A" />
          </g>
        )}

        {config.shirtId === 'shirt_dino_roar' && (
          <g id="shirt_dino_roar">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#16A34A" stroke="#29243D" strokeWidth="2.5" />
            {/* Khủng long T-Rex */}
            <ellipse cx="120" cy="185" rx="18" ry="14" fill="#22C55E" />
            <polygon points="106,175 112,170 118,175 124,170 130,175" fill="#FACC15" />
            <circle cx="126" cy="182" r="3" fill="#052E16" />
          </g>
        )}

        {config.shirtId === 'shirt_cr7_football' && (
          <g id="shirt_cr7_football">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#DC2626" stroke="#29243D" strokeWidth="2.5" />
            <path d="M110 150 L130 150 L120 162 Z" fill="#FACC15" />
            <text x="120" y="196" textAnchor="middle" fontSize="26" fontWeight="900" fill="#FFFFFF" stroke="#000000" strokeWidth="1">7</text>
          </g>
        )}

        {config.shirtId === 'shirt_messi_argentina' && (
          <g id="shirt_messi_argentina">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#38BDF8" stroke="#29243D" strokeWidth="2.5" />
            <rect x="94" y="150" width="16" height="70" fill="#FFFFFF" />
            <rect x="130" y="150" width="16" height="70" fill="#FFFFFF" />
            <text x="120" y="196" textAnchor="middle" fontSize="24" fontWeight="900" fill="#1E3A8A">10</text>
          </g>
        )}

        {config.shirtId === 'shirt_bear_hoodie' && (
          <g id="shirt_bear_hoodie">
            <path d="M70 148 L170 148 L160 220 L80 220 Z" fill="#92400E" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="120" cy="185" rx="16" ry="14" fill="#FDE68A" />
            <rect x="100" y="202" width="40" height="15" rx="5" fill="#78350F" />
          </g>
        )}

        {config.shirtId === 'shirt_hawaii_floral' && (
          <g id="shirt_hawaii_floral">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#F97316" stroke="#29243D" strokeWidth="2.5" />
            <circle cx="95" cy="170" r="6" fill="#FDE047" />
            <circle cx="140" cy="180" r="8" fill="#FDE047" />
            <circle cx="110" cy="205" r="7" fill="#FDE047" />
          </g>
        )}

        {config.shirtId === 'shirt_striped_polo' && (
          <g id="shirt_striped_polo">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#0284C7" stroke="#29243D" strokeWidth="2.5" />
            <rect x="76" y="168" width="88" height="8" fill="#FFFFFF" />
            <rect x="79" y="192" width="82" height="8" fill="#FFFFFF" />
            <polygon points="108,150 132,150 120,165" fill="#FFFFFF" stroke="#29243D" strokeWidth="1.5" />
          </g>
        )}

        {config.shirtId === 'shirt_rich_suit_vest' && (
          <g id="shirt_rich_suit_vest">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#18181B" stroke="#29243D" strokeWidth="2.5" />
            {/* Áo sơ mi trắng bên trong & nơ đỏ */}
            <polygon points="106,150 134,150 120,185" fill="#FFFFFF" stroke="#29243D" strokeWidth="1.5" />
            <ellipse cx="120" cy="160" rx="6" ry="4" fill="#DC2626" />
            <circle cx="120" cy="192" r="2.5" fill="#FACC15" />
            <circle cx="120" cy="206" r="2.5" fill="#FACC15" />
          </g>
        )}

        {config.shirtId === 'shirt_princess_elsa' && (
          <g id="shirt_princess_elsa">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#38BDF8" stroke="#29243D" strokeWidth="2.5" />
            <path d="M84 165 C 120 180, 120 180, 156 165 L150 220 L90 220 Z" fill="#BAE6FD" />
            <polygon points="120,166 124,174 132,174 126,180 128,188 120,183 112,188 114,180 108,174 116,174" fill="#FFFFFF" />
          </g>
        )}

        {config.shirtId === 'shirt_sailor_suit' && (
          <g id="shirt_sailor_suit">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#F8FAFC" stroke="#29243D" strokeWidth="2.5" />
            <path d="M92 150 L148 150 L154 176 L86 176 Z" fill="#1E3A8A" stroke="#29243D" strokeWidth="2" />
            <polygon points="112,176 128,176 120,196" fill="#DC2626" />
          </g>
        )}

        {config.shirtId === 'shirt_luxury_tweed' && (
          <g id="shirt_luxury_tweed">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#F1F5F9" stroke="#29243D" strokeWidth="2.5" />
            <path d="M74 150 L166 150" stroke="#1E293B" strokeWidth="3" strokeDasharray="4 3" />
            <line x1="120" y1="150" x2="120" y2="220" stroke="#1E293B" strokeWidth="2" />
            <circle cx="114" cy="175" r="3" fill="#FACC15" stroke="#29243D" strokeWidth="1" />
            <circle cx="114" cy="195" r="3" fill="#FACC15" stroke="#29243D" strokeWidth="1" />
          </g>
        )}

        {config.shirtId === 'shirt_leather_jacket' && (
          <g id="shirt_leather_jacket">
            <path d="M70 148 L170 148 L158 220 L82 220 Z" fill="#18181B" stroke="#29243D" strokeWidth="2.5" />
            <line x1="105" y1="150" x2="135" y2="220" stroke="#94A3B8" strokeWidth="3" />
            <circle cx="95" cy="165" r="2.5" fill="#E2E8F0" />
            <circle cx="145" cy="165" r="2.5" fill="#E2E8F0" />
          </g>
        )}

        {config.shirtId === 'shirt_golden_dragon' && (
          <g id="shirt_golden_dragon">
            <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#B91C1C" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="120" cy="185" rx="16" ry="18" fill="#FACC15" />
            <path d="M112 178 Q 120 172 128 178 Q 120 188 112 194 Q 128 194 128 186" fill="none" stroke="#78350F" strokeWidth="2" />
          </g>
        )}

        {/* Fallback Áo mặc định */}
        {!config.shirtId && (
          <path d="M74 150 L166 150 L158 220 L82 220 Z" fill="#FBBF24" stroke="#29243D" strokeWidth="2.5" />
        )}
      </g>
    );
  };

  // 5. Đầu, Mặt & Cảm Xúc (8 Biểu Cảm)
  const renderHeadAndFace = () => {
    return (
      <g id="layer_head_and_face">
        {/* Khuôn mặt tròn Chibi */}
        <circle cx="120" cy="95" r="54" fill={skin} stroke="#29243D" strokeWidth="3" />

        {/* Đôi tai */}
        <ellipse cx="66" cy="98" rx="8" ry="12" fill={skin} stroke="#29243D" strokeWidth="2.5" />
        <ellipse cx="174" cy="98" rx="8" ry="12" fill={skin} stroke="#29243D" strokeWidth="2.5" />

        {/* Má hồng hào */}
        <ellipse cx="88" cy="110" rx="9" ry="6" fill="#FB7185" opacity="0.6" />
        <ellipse cx="152" cy="110" rx="9" ry="6" fill="#FB7185" opacity="0.6" />

        {/* 👀 8 LOẠI MẶT & BIỂU CẢM */}
        {config.faceId === 'face_big_smile' && (
          <g id="face_big_smile">
            {/* Hai mắt cười tít */}
            <path d="M88 90 Q 98 80 108 90" stroke="#29243D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M132 90 Q 142 80 152 90" stroke="#29243D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Miệng cười to thấy lưỡi */}
            <path d="M104 112 Q 120 134 136 112 Z" fill="#DC2626" stroke="#29243D" strokeWidth="2.5" />
            <ellipse cx="120" cy="120" rx="6" ry="4" fill="#F472B6" />
          </g>
        )}

        {config.faceId === 'face_sparkle_eyes' && (
          <g id="face_sparkle_eyes">
            {/* Mắt to tròn long lanh */}
            <ellipse cx="98" cy="90" rx="10" ry="13" fill="#18181B" />
            <circle cx="95" cy="85" r="4.5" fill="#FFFFFF" />
            <circle cx="102" cy="95" r="2" fill="#FFFFFF" />
            <ellipse cx="142" cy="90" rx="10" ry="13" fill="#18181B" />
            <circle cx="139" cy="85" r="4.5" fill="#FFFFFF" />
            <circle cx="146" cy="95" r="2" fill="#FFFFFF" />
            <path d="M110 115 Q 120 126 130 115" stroke="#29243D" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {config.faceId === 'face_cool_shades' && (
          <g id="face_cool_shades">
            {/* Kính râm đen cực ngầu */}
            <rect x="80" y="80" width="36" height="24" rx="6" fill="#09090B" stroke="#29243D" strokeWidth="2" />
            <rect x="124" y="80" width="36" height="24" rx="6" fill="#09090B" stroke="#29243D" strokeWidth="2" />
            <line x1="116" y1="90" x2="124" y2="90" stroke="#09090B" strokeWidth="4" />
            <line x1="84" y1="84" x2="108" y2="98" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
            <line x1="128" y1="84" x2="152" y2="98" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
            <path d="M112 116 Q 120 122 128 116" stroke="#29243D" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {config.faceId === 'face_nerdy_glasses' && (
          <g id="face_nerdy_glasses">
            <circle cx="98" cy="88" r="14" fill="none" stroke="#1E293B" strokeWidth="3" />
            <circle cx="142" cy="88" r="14" fill="none" stroke="#1E293B" strokeWidth="3" />
            <line x1="112" y1="88" x2="128" y2="88" stroke="#1E293B" strokeWidth="3" />
            <circle cx="98" cy="88" r="4" fill="#29243D" />
            <circle cx="142" cy="88" r="4" fill="#29243D" />
            <path d="M114 116 Q 120 122 126 116" stroke="#29243D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {config.faceId === 'face_playful_wink' && (
          <g id="face_playful_wink">
            {/* Một mắt mở to, một mắt nháy */}
            <ellipse cx="98" cy="89" rx="8" ry="11" fill="#18181B" />
            <circle cx="96" cy="86" r="3.5" fill="#FFFFFF" />
            <path d="M132 90 Q 142 80 152 90" stroke="#29243D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M108 114 Q 120 128 132 114" stroke="#29243D" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {config.faceId === 'face_pouty_cheeks' && (
          <g id="face_pouty_cheeks">
            <circle cx="98" cy="88" r="4" fill="#29243D" />
            <circle cx="142" cy="88" r="4" fill="#29243D" />
            <ellipse cx="120" cy="116" rx="5" ry="5" fill="#EF4444" stroke="#29243D" strokeWidth="2" />
          </g>
        )}

        {config.faceId === 'face_tongue_out' && (
          <g id="face_tongue_out">
            <ellipse cx="98" cy="88" rx="5" ry="7" fill="#29243D" />
            <ellipse cx="142" cy="88" rx="5" ry="7" fill="#29243D" />
            <path d="M110 112 Q 120 122 130 112" stroke="#29243D" strokeWidth="2.5" fill="none" />
            <ellipse cx="124" cy="120" rx="5" ry="7" fill="#F43F5E" stroke="#29243D" strokeWidth="1.5" />
          </g>
        )}

        {config.faceId === 'face_sleepy_eyes' && (
          <g id="face_sleepy_eyes">
            <path d="M90 92 Q 98 98 106 92" stroke="#29243D" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M134 92 Q 142 98 150 92" stroke="#29243D" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="120" cy="116" rx="4" ry="5" fill="#38BDF8" />
          </g>
        )}
      </g>
    );
  };

  // 6. Kiểu Tóc (12 Kiểu)
  const renderHair = () => {
    switch (config.hairId) {
      case 'hair_spiky_cool': // Vuốt dựng năng động
        return (
          <g id="hair_spiky_cool">
            <path
              d="M66 90 C 58 50, 78 30, 92 40 C 96 25, 114 20, 122 35 C 130 20, 150 25, 152 42 C 168 32, 184 55, 174 90 C 164 68, 140 60, 120 62 C 100 60, 76 68, 66 90 Z"
              fill={hairColor}
              stroke="#29243D"
              strokeWidth="3"
            />
            {/* Lọn tóc nhọn vuốt lên */}
            <polygon points="110,40 120,15 130,40" fill={hairColor} stroke="#29243D" strokeWidth="2.5" />
            <polygon points="90,48 95,28 108,46" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            <polygon points="132,46 145,28 150,48" fill={hairColor} stroke="#29243D" strokeWidth="2" />
          </g>
        );

      case 'hair_kpop_part': // 2 Mái K-Pop
        return (
          <g id="hair_kpop_part">
            <path
              d="M64 92 C 58 45, 80 32, 120 32 C 160 32, 182 45, 176 92 C 165 65, 138 60, 128 75 C 122 75, 105 60, 64 92 Z"
              fill={hairColor}
              stroke="#29243D"
              strokeWidth="3"
            />
            {/* Lọn tóc rẽ ngôi 2 bên */}
            <path d="M72 75 Q 98 85 116 75" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M124 75 Q 142 85 168 75" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.4" />
          </g>
        );

      case 'hair_twintails_ribbon': // Song búi nơ hồng
        return (
          <g id="hair_twintails_ribbon">
            {/* Mái tóc chính */}
            <path d="M64 88 C 60 48, 80 34, 120 34 C 160 34, 180 48, 176 88 C 158 64, 82 64, 64 88 Z" fill={hairColor} stroke="#29243D" strokeWidth="3" />
            {/* Hai búi tròn 2 bên */}
            <circle cx="56" cy="52" r="18" fill={hairColor} stroke="#29243D" strokeWidth="2.5" />
            <circle cx="184" cy="52" r="18" fill={hairColor} stroke="#29243D" strokeWidth="2.5" />
            {/* Hai chiếc nơ hồng */}
            <circle cx="68" cy="62" r="6" fill="#F472B6" />
            <circle cx="172" cy="62" r="6" fill="#F472B6" />
          </g>
        );

      case 'hair_curly_afro': // Xoăn mì tôm bồng bềnh
        return (
          <g id="hair_curly_afro">
            <circle cx="70" cy="55" r="16" fill={hairColor} />
            <circle cx="95" cy="38" r="18" fill={hairColor} />
            <circle cx="120" cy="32" r="20" fill={hairColor} />
            <circle cx="145" cy="38" r="18" fill={hairColor} />
            <circle cx="170" cy="55" r="16" fill={hairColor} />
            <circle cx="60" cy="78" r="14" fill={hairColor} />
            <circle cx="180" cy="78" r="14" fill={hairColor} />
            <path d="M66 85 C 75 60, 165 60, 174 85 Z" fill={hairColor} stroke="#29243D" strokeWidth="3" />
          </g>
        );

      case 'hair_bowl_cut': // Úp nồi / Mái ngố
        return (
          <g id="hair_bowl_cut">
            <path d="M62 90 C 58 40, 80 30, 120 30 C 160 30, 182 40, 178 90 L174 76 L66 76 Z" fill={hairColor} stroke="#29243D" strokeWidth="3" />
            <line x1="70" y1="76" x2="170" y2="76" stroke="#29243D" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'hair_mohawk_punk': // Mào gà Mohawk
        return (
          <g id="hair_mohawk_punk">
            <path d="M106 50 L112 12 L120 5 L128 12 L134 50 Z" fill={hairColor} stroke="#29243D" strokeWidth="2.5" />
            <path d="M96 52 L120 28 L144 52 Z" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            {/* Hai bên cạo trọc chân tóc */}
            <path d="M68 85 Q 85 70 106 65" stroke="#94A3B8" strokeWidth="2" strokeDasharray="2 2" fill="none" />
            <path d="M172 85 Q 155 70 134 65" stroke="#94A3B8" strokeWidth="2" strokeDasharray="2 2" fill="none" />
          </g>
        );

      case 'hair_braids_cute': // Tết bím đôi
        return (
          <g id="hair_braids_cute">
            <path d="M64 88 C 60 48, 80 34, 120 34 C 160 34, 180 48, 176 88 C 158 64, 82 64, 64 88 Z" fill={hairColor} stroke="#29243D" strokeWidth="3" />
            {/* Hai bím tóc thả xuống */}
            <ellipse cx="62" cy="110" rx="8" ry="16" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            <ellipse cx="62" cy="132" rx="7" ry="14" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            <ellipse cx="178" cy="110" rx="8" ry="16" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            <ellipse cx="178" cy="132" rx="7" ry="14" fill={hairColor} stroke="#29243D" strokeWidth="2" />
          </g>
        );

      case 'hair_bald_monk': // Đầu trọc bóng lưỡng
        return (
          <g id="hair_bald_monk">
            {/* Ánh sáng phản chiếu trên đỉnh đầu */}
            <ellipse cx="106" cy="62" rx="14" ry="6" fill="#FFFFFF" opacity="0.6" />
          </g>
        );

      case 'hair_bedhead_messy': // Bù xù tổ quạ
        return (
          <g id="hair_bedhead_messy">
            <path
              d="M62 90 L52 70 L72 65 L68 45 L88 48 L100 25 L120 35 L138 20 L145 42 L168 35 L166 58 L185 68 L175 90 C 160 65, 80 65, 62 90 Z"
              fill={hairColor}
              stroke="#29243D"
              strokeWidth="2.5"
            />
          </g>
        );

      case 'hair_chom_dao': // Chỏm đào 3 chỏm
        return (
          <g id="hair_chom_dao">
            <circle cx="120" cy="38" r="14" fill={hairColor} stroke="#29243D" strokeWidth="2.5" />
            <circle cx="85" cy="52" r="10" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            <circle cx="155" cy="52" r="10" fill={hairColor} stroke="#29243D" strokeWidth="2" />
          </g>
        );

      case 'hair_snapback_cap': // Mũ snapback hiphop
        return (
          <g id="hair_snapback_cap">
            <path d="M62 76 C 62 38, 178 38, 178 76 Z" fill="#DC2626" stroke="#29243D" strokeWidth="3" />
            {/* Vành lưỡi trai đội ngược ra sau */}
            <path d="M50 76 L70 76 L70 68 L46 68 Z" fill="#18181B" stroke="#29243D" strokeWidth="2" />
            <circle cx="120" cy="42" r="4" fill="#FACC15" />
          </g>
        );

      case 'hair_mullet': // Mullet lãng tử
        return (
          <g id="hair_mullet">
            {/* Đuôi tóc mullet dài phía sau */}
            <path d="M70 95 L65 145 L82 140 L80 100 Z" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            <path d="M170 95 L175 145 L158 140 L160 100 Z" fill={hairColor} stroke="#29243D" strokeWidth="2" />
            {/* Mái trước */}
            <path d="M64 88 C 60 48, 80 34, 120 34 C 160 34, 180 48, 176 88 C 158 64, 82 64, 64 88 Z" fill={hairColor} stroke="#29243D" strokeWidth="3" />
          </g>
        );

      default:
        return (
          <g id="hair_default">
            <path d="M66 90 C 58 50, 78 30, 120 30 C 162 30, 182 50, 174 90 C 158 65, 82 65, 66 90 Z" fill={hairColor} stroke="#29243D" strokeWidth="3" />
          </g>
        );
    }
  };

  // 7. Phụ Kiện Phía Trước (Mũ, kẹo mút, bình nước, huy hiệu)
  const renderFrontAccessory = () => {
    switch (config.accessoryId) {
      case 'acc_duck_bucket_hat': // Mũ vành vịt con
        return (
          <g id="acc_duck_bucket_hat">
            <ellipse cx="120" cy="50" rx="58" ry="12" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
            <path d="M78 50 C 78 22, 162 22, 162 50 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
            {/* Mỏ vịt con */}
            <ellipse cx="120" cy="46" rx="8" ry="4" fill="#EA580C" />
            <circle cx="112" cy="38" r="2" fill="#18181B" />
            <circle cx="128" cy="38" r="2" fill="#18181B" />
          </g>
        );

      case 'acc_good_kid_medal': // Huy hiệu Hoa Bé Ngoan
        return (
          <g id="acc_good_kid_medal">
            <circle cx="95" cy="165" r="9" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
            <circle cx="95" cy="165" r="5" fill="#FDE047" />
            <text x="95" y="167" textAnchor="middle" fontSize="6" fontWeight="900" fill="#B91C1C">NGOAN</text>
          </g>
        );

      case 'acc_giant_lollipop': // Cây kẹo mút khổng lồ
        return (
          <g id="acc_giant_lollipop">
            <line x1="165" y1="180" x2="185" y2="230" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            <circle cx="162" cy="172" r="16" fill="#F43F5E" stroke="#29243D" strokeWidth="2.5" />
            <path d="M152 172 Q 162 160 172 172" stroke="#FFFFFF" strokeWidth="3" fill="none" />
            <path d="M156 178 Q 162 188 168 178" stroke="#FDE047" strokeWidth="3" fill="none" />
          </g>
        );

      case 'acc_dino_water_bottle': // Bình nước khủng long đeo chéo
        return (
          <g id="acc_dino_water_bottle">
            <line x1="90" y1="150" x2="155" y2="215" stroke="#059669" strokeWidth="3" />
            <rect x="142" y="196" width="18" height="26" rx="6" fill="#10B981" stroke="#29243D" strokeWidth="2" />
            <rect x="146" y="190" width="10" height="6" rx="2" fill="#047857" />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`character-avatar-stage-container ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        userSelect: 'none',
        cursor: interactiveParallax ? (isDragging ? 'grabbing' : 'grab') : 'default',
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* 🎪 BỤC 3D PODIUM (NẾU BẬT) */}
      {showPodium && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            width: '210px',
            height: '42px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, #6C5CE7 0%, #4B38B3 65%, #29243D 100%)',
            boxShadow: '0 16px 36px rgba(108, 92, 231, 0.4), inset 0 3px 8px rgba(255, 255, 255, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            transform: `rotateX(68deg) rotateY(${tilt.y * 0.4}deg)`,
            transformStyle: 'preserve-3d',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {/* Spotlight ánh sáng vàng trên bục */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 184, 77, 0.4) 0%, transparent 70%)',
            }}
          />
        </div>
      )}

      {/* 🌑 BÓNG TIẾP ĐẤT (CONTACT SHADOW) */}
      {showShadow && (
        <div
          style={{
            position: 'absolute',
            bottom: showPodium ? '26px' : '10px',
            width: '140px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: 'rgba(20, 10, 35, 0.45)',
            filter: 'blur(5px)',
            transform: `scale(${1 + tilt.x * 0.01})`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* 🧍 NHÂN VẬT 2.5D HOLOGRAPHIC PARALLAX WRAPPER */}
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          y: autoRotateFloat ? [0, -6, 0] : 0,
        }}
        transition={{
          rotateX: { type: 'spring', stiffness: 320, damping: 26 },
          rotateY: { type: 'spring', stiffness: 320, damping: 26 },
          y: autoRotateFloat ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined,
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          zIndex: 10,
        }}
      >
        <svg
          viewBox="0 0 240 310"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            filter: isHovered ? 'drop-shadow(0 16px 30px rgba(108, 92, 231, 0.3))' : 'drop-shadow(0 12px 24px rgba(0,0,0,0.18))',
            transition: 'filter 0.3s ease',
          }}
        >
          {/* Layer 0: Phụ kiện sau lưng (Balo) - Z: -15 */}
          <g style={{ transform: 'translateZ(-15px)' }}>{renderBackAccessory()}</g>

          {/* Layer 1: Chân & Giày - Z: 10 */}
          <g style={{ transform: `translateZ(10px) scaleY(${legScale})`, transformOrigin: 'bottom' }}>
            {renderLegsAndShoes()}
          </g>

          {/* Layer 2: Quần & Váy - Z: 25 */}
          <g style={{ transform: `translateZ(25px) scaleY(${legScale})`, transformOrigin: 'top' }}>
            {renderPants()}
          </g>

          {/* Layer 3: Thân & Áo - Z: 40 */}
          <g style={{ transform: `translateZ(40px) scaleY(${heightScale})`, transformOrigin: 'bottom' }}>
            {renderTorsoAndShirt()}
          </g>

          {/* Layer 4: Đầu & Khuôn Mặt - Z: 60 */}
          <g style={{ transform: `translateZ(60px) scale(${headScale})`, transformOrigin: '120px 95px' }}>
            {renderHeadAndFace()}
          </g>

          {/* Layer 5: Mái Tóc - Z: 75 */}
          <g style={{ transform: `translateZ(75px) scale(${headScale})`, transformOrigin: '120px 95px' }}>
            {renderHair()}
          </g>

          {/* Layer 6: Phụ Kiện Phía Trước (Mũ, Kẹo mút...) - Z: 90 */}
          <g style={{ transform: 'translateZ(90px)' }}>{renderFrontAccessory()}</g>
        </svg>

        {/* ✨ HOLOGRAPHIC GLARE / ÁNH SÁNG PHẢN CHIẾU 3D */}
        {interactiveParallax && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px',
              background: `linear-gradient(${135 + tilt.y * 3}deg, rgba(255, 255, 255, ${Math.abs(tilt.y) * 0.015}) 0%, transparent 60%)`,
              pointerEvents: 'none',
              transform: 'translateZ(100px)',
            }}
          />
        )}
      </motion.div>
    </div>
  );
};
