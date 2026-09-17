/**
 * RealisticAssetsCatalog.ts
 * Curated 2 high-fidelity options per category according to:
 * realistic-human-threejs-character-system.md
 */

export interface RealisticAssetOption {
  id: string;
  name: string;
  category: 'hair' | 'face' | 'shirt' | 'pants' | 'shoes' | 'accessory';
  description: string;
  materialType: 'cotton' | 'denim' | 'leather' | 'wool' | 'silk' | 'metal';
  badge: string;
  colorHex?: string;
}

export interface RealisticBodyMetrics {
  heightCm: number; // 150 - 200 (Default: 175)
  weightKg: number; // 45 - 110 (Default: 68)
  musclePct: number; // 0 - 100 (Default: 45)
  shoulderWidthScale: number; // 0.85 - 1.25 (Default: 1.0)
  legLengthScale: number; // 0.9 - 1.15 (Default: 1.0)
}

export interface RealisticAvatarConfig {
  // Appearance & Assets
  hairId: string;
  faceId: string;
  shirtId: string;
  pantsId: string;
  shoesId: string;
  accessoryId?: string;

  // Ngũ Quan (Facial Features)
  eyeShapeId?: string;
  noseShapeId?: string;
  mouthShapeId?: string;
  eyebrowShapeId?: string;
  jawlineShapeId?: string;

  // Colors
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;

  // Body Morphology
  body: RealisticBodyMetrics;
}

// 1. Tóc (2 kiểu chuẩn salon cao cấp)
export const REALISTIC_HAIR_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'hair_modern_quiff',
    name: 'Modern Textured Quiff',
    category: 'hair',
    description: 'Tóc tỉa fade 2 bên gọn gàng, phần đỉnh chải phồng tự nhiên theo từng lọn có chiều sâu ánh sáng.',
    materialType: 'silk',
    badge: '★ Hiện Đại',
  },
  {
    id: 'hair_layered_side_part',
    name: 'Natural Layered Side-Part',
    category: 'hair',
    description: 'Tóc rẽ ngôi 7/3 cổ điển, các lớp tóc rủ nhẹ tự nhiên ôm sát vầng trán và thái dương thanh lịch.',
    materialType: 'silk',
    badge: '★ Lịch Lãm',
  },
  {
    id: 'hair_bald_natural',
    name: 'Đầu Trọc Tự Nhiên (Base Scalp)',
    category: 'hair',
    description: 'Khung đầu giải phẫu tự nhiên, phô diễn trọn vẹn đường cong hộp sọ người thật.',
    materialType: 'silk',
    badge: '★ Base Body',
  },
];

// 2. Khuôn mặt & Biểu cảm (2 biểu cảm sống động)
export const REALISTIC_EXPRESSION_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'face_confident_natural',
    name: 'Confident Natural',
    category: 'face',
    description: 'Ánh mắt kiên định, khóe môi thư thái tự tin, sống mũi sắc nét chuẩn tỷ lệ vàng.',
    materialType: 'silk',
    badge: '★ Tự Tin',
  },
  {
    id: 'face_warm_smile',
    name: 'Gentle Warm Smile',
    category: 'face',
    description: 'Nụ cười mỉm ấm áp, cơ gò má hơi nâng nhẹ, ánh mắt rạng rỡ thân thiện.',
    materialType: 'silk',
    badge: '★ Thân Thiện',
  },
];

// 2.1. Dáng Mắt (Eyes)
export const REALISTIC_EYE_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'eye_shape_almond',
    name: 'Mắt Hạnh Nhân Tự Nhiên',
    category: 'face',
    description: 'Dáng mắt hạnh nhân cân đối hài hòa, mí mắt cong tự nhiên, ánh nhìn ấm áp và trong sáng.',
    materialType: 'silk',
    badge: '★ Tự Nhiên',
  },
  {
    id: 'eye_shape_phoenix',
    name: 'Mắt Phượng Sắc Sảo',
    category: 'face',
    description: 'Đuôi mắt hơi xếch nhẹ thanh tú, hốc mắt sâu cuốn hút, ánh nhìn kiên định đầy thần thái.',
    materialType: 'silk',
    badge: '★ Sắc Sảo',
  },
];

// 2.2. Dáng Mũi (Nose)
export const REALISTIC_NOSE_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'nose_natural_soft',
    name: 'Mũi S-Line Tự Nhiên',
    category: 'face',
    description: 'Sống mũi uốn lượn cong nhẹ thanh tú, đầu mũi tròn mềm mại, cánh mũi thu gọn chuẩn Á Đông.',
    materialType: 'silk',
    badge: '★ Thanh Tú',
  },
  {
    id: 'nose_straight_l_line',
    name: 'Mũi Cao Thẳng L-Line',
    category: 'face',
    description: 'Sống mũi cao thẳng tắp từ nasion đến đỉnh chóp, góc mũi trán sắc nét chuẩn tỷ lệ vàng.',
    materialType: 'silk',
    badge: '★ Cao Tây',
  },
];

// 2.3. Dáng Môi & Miệng (Mouth & Lips)
export const REALISTIC_MOUTH_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'mouth_cupid_bow',
    name: 'Môi Cánh Cung Cupid',
    category: 'face',
    description: 'Vành môi trên uốn lượn trái tim sắc nét, khóe miệng hé cười duyên, rãnh nhân trung rõ nét.',
    materialType: 'silk',
    badge: '★ Quyến Rũ',
  },
  {
    id: 'mouth_gentle_natural',
    name: 'Môi Căng Mọng Thư Thái',
    category: 'face',
    description: 'Môi dưới đầy đặn tự nhiên, viền môi mềm mại, khóe miệng bằng phẳng tự tin.',
    materialType: 'silk',
    badge: '★ Tự Nhiên',
  },
];

// 2.4. Dáng Chân Mày (Eyebrows)
export const REALISTIC_BROW_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'brow_soft_arch',
    name: 'Chân Mày Cánh Cung',
    category: 'face',
    description: 'Dáng mày cong mềm mại theo khung xương ổ mắt, sợi lông mày mượt mà tự nhiên.',
    materialType: 'silk',
    badge: '★ Nhẹ Nhàng',
  },
  {
    id: 'brow_sword_bold',
    name: 'Chân Mày Kiếm',
    category: 'face',
    description: 'Đầu mày thẳng, đuôi mày vát nhọn hướng lên thái dương, toát lên khí phách mạnh mẽ.',
    materialType: 'silk',
    badge: '★ Khí Chất',
  },
];

// 2.5. Khung Hàm & Cằm (Jawline & Face Contour)
export const REALISTIC_JAW_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'jaw_sharp_v_line',
    name: 'Góc Hàm V-Line',
    category: 'face',
    description: 'Khung xương hàm thon gọn tinh tế, cằm thon chuẩn giải phẫu hiện đại.',
    materialType: 'silk',
    badge: '★ Thon Gọn',
  },
  {
    id: 'jaw_structured_masculine',
    name: 'Góc Hàm Vuông Góc Cạnh',
    category: 'face',
    description: 'Góc hàm mandible rõ nét, cằm chẻ vuông vức nam tính và vững chãi.',
    materialType: 'silk',
    badge: '★ Vững Chãi',
  },
];

// 3. Áo (2 mẫu áo kinh điển chuẩn PBR)
export const REALISTIC_SHIRT_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'shirt_fitted_cotton_tee',
    name: 'Fitted Cotton Crewneck Tee',
    category: 'shirt',
    description: 'Áo thun cotton dệt sợi cao cấp, cổ tròn bo viền gân tinh tế, form ôm vừa vặn và nếp gấp eo mềm mại.',
    materialType: 'cotton',
    badge: '★ Tối Giản',
    colorHex: '#ffffff',
  },
  {
    id: 'shirt_oxford_button_down',
    name: 'Oxford Button-Down Shirt',
    category: 'shirt',
    description: 'Áo sơ mi Oxford đứng form, cổ bẻ cài cúc, nẹp áo đính hàng cúc xà cừ và túi ngực may chìm sang trọng.',
    materialType: 'cotton',
    badge: '★ Thanh Lịch',
    colorHex: '#e2e8f0',
  },
  {
    id: 'shirt_none',
    name: 'Cơ Thể Nguyên Bản (Base Torso)',
    category: 'shirt',
    description: 'Không mặc áo, phô diễn trọn vẹn giải phẫu cơ ngực, xương quai xanh, eo thon và cơ lưng mềm mại.',
    materialType: 'cotton',
    badge: '★ Base Body',
    colorHex: '#ffffff',
  },
];

// 4. Quần (2 mẫu quần phom chuẩn + Base Underwear)
export const REALISTIC_PANTS_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'pants_classic_denim_jeans',
    name: 'Classic Straight-Cut Denim Jeans',
    category: 'pants',
    description: 'Quần jeans vải bò dệt chéo (twill weave), đinh tán đồng ở góc túi, con đỉa cạp quần và nếp gấp ống chân.',
    materialType: 'denim',
    badge: '★ Phong Cách',
    colorHex: '#2563eb',
  },
  {
    id: 'pants_tailored_chinos',
    name: 'Tailored Chino Trousers',
    category: 'pants',
    description: 'Quần kaki/âu cao cấp dáng suông, đường ly quần ép phẳng phiu, túi mổ sau và gấu quần may giấu chỉ.',
    materialType: 'cotton',
    badge: '★ Chỉn Chu',
    colorHex: '#475569',
  },
  {
    id: 'pants_underwear_briefs',
    name: 'Quần Thể Thao Tối Giản (Athletic Briefs)',
    category: 'pants',
    description: 'Quần lót thể thao ôm sát hông, để lộ toàn bộ đường nét giải phẫu cơ đùi, đầu gối và bắp chân.',
    materialType: 'cotton',
    badge: '★ Base Body',
    colorHex: '#1e293b',
  },
];

// 5. Giày (2 mẫu giày 3D đúng chuẩn footwear + Chân trần)
export const REALISTIC_SHOES_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'shoes_low_top_sneaker',
    name: 'Low-Top Leather Sneaker',
    category: 'shoes',
    description: 'Đế cao su đúc có rãnh bám hình học, thân giày da mềm, lỗ xỏ kim loại và dây giày buộc thắt nơ 3D.',
    materialType: 'leather',
    badge: '★ Năng Động',
    colorHex: '#f8fafc',
  },
  {
    id: 'shoes_polished_leather_oxford',
    name: 'Polished Leather Dress Shoes',
    category: 'shoes',
    description: 'Giày da bóng mũi nhọn thanh thoát, đế gót gỗ nhiều lớp, đường viền welt khâu tay đẳng cấp quý ông.',
    materialType: 'leather',
    badge: '★ Quý Phái',
    colorHex: '#1e1b18',
  },
  {
    id: 'shoes_barefoot',
    name: 'Bàn Chân Trần (Barefoot 5-Toes)',
    category: 'shoes',
    description: 'Bàn chân trần chuẩn giải phẫu với vòm chân (arch), gót (heel), mắt cá chân và 5 ngón chân tự nhiên.',
    materialType: 'leather',
    badge: '★ Base Body',
    colorHex: '#ffffff',
  },
];

// 6. Phụ kiện (2 mẫu phụ kiện kim loại & da thật)
export const REALISTIC_ACCESSORY_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'acc_wireframe_glasses',
    name: 'Classic Wireframe Glasses',
    category: 'accessory',
    description: 'Kính mắt gọng kim loại thanh mảnh ôm sát sống mũi, tròng kính thủy tinh phản quang trong suốt.',
    materialType: 'metal',
    badge: '★ Trí Thức',
  },
  {
    id: 'acc_minimalist_leather_watch',
    name: 'Minimalist Leather Watch',
    category: 'accessory',
    description: 'Đồng hồ mặt tròn viền thép không gỉ bóng loáng, vạch kim thanh mảnh và dây da khâu tay ở cổ tay trái.',
    materialType: 'leather',
    badge: '★ Đẳng Cấp',
  },
];

// 7. Bảng màu da chân thực (PBR Tones)
export const REALISTIC_SKIN_TONES = [
  { id: 'fair_porcelain', name: 'Trắng Sáng (Fair)', hex: '#FFE8D6' },
  { id: 'warm_ivory', name: 'Trắng Hồng (Warm Ivory)', hex: '#FAD4C0' },
  { id: 'natural_sand', name: 'Tự Nhiên (Natural Sand)', hex: '#E8BA9A' },
  { id: 'golden_honey', name: 'Rám Nắng (Golden Honey)', hex: '#D29B72' },
  { id: 'bronze_tan', name: 'Ngăm Khỏe (Bronze Tan)', hex: '#9E6847' },
  { id: 'deep_espresso', name: 'Nâu Trầm (Deep Espresso)', hex: '#633B27' },
];

// 8. Bảng màu tóc tự nhiên
export const REALISTIC_HAIR_COLORS = [
  { id: 'jet_black', name: 'Đen Tuyến (Jet Black)', hex: '#16161a' },
  { id: 'dark_espresso', name: 'Nâu Đen (Espresso)', hex: '#2b211b' },
  { id: 'chestnut_brown', name: 'Nâu Hạt Dẻ (Chestnut)', hex: '#4a3325' },
  { id: 'golden_blonde', name: 'Vàng Khói (Blonde)', hex: '#c5a059' },
  { id: 'auburn_copper', name: 'Nâu Đỏ (Auburn)', hex: '#6e2b1d' },
  { id: 'silver_slate', name: 'Bạc Khói (Silver Slate)', hex: '#94a3b8' },
];

// 9. Bảng màu mắt
export const REALISTIC_EYE_COLORS = [
  { id: 'deep_brown', name: 'Nâu Đen Châu Á', hex: '#261710' },
  { id: 'hazel_amber', name: 'Nâu Hổ Phách', hex: '#4d3319' },
  { id: 'oceanic_blue', name: 'Xanh Biển Sâu', hex: '#1e3a5f' },
  { id: 'emerald_green', name: 'Xanh Ngọc Lục Bảo', hex: '#1e3f2b' },
];

// Cấu hình mặc định: Chuẩn Human Base Mesh giải phẫu (Ảnh 2 Reference)
export const DEFAULT_REALISTIC_CONFIG: RealisticAvatarConfig = {
  hairId: 'hair_bald_natural',
  faceId: 'face_confident_natural',
  shirtId: 'shirt_none',
  pantsId: 'pants_underwear_briefs',
  shoesId: 'shoes_barefoot',
  accessoryId: '',

  // Ngũ Quan mặc định
  eyeShapeId: 'eye_shape_almond',
  noseShapeId: 'nose_natural_soft',
  mouthShapeId: 'mouth_cupid_bow',
  eyebrowShapeId: 'brow_soft_arch',
  jawlineShapeId: 'jaw_sharp_v_line',

  skinTone: '#E8BA9A',
  hairColor: '#16161a',
  eyeColor: '#261710',
  shirtColor: '#ffffff',
  pantsColor: '#1e293b',
  shoesColor: '#f8fafc',

  body: {
    heightCm: 176,
    weightKg: 68,
    musclePct: 50,
    shoulderWidthScale: 1.0,
    legLengthScale: 1.0,
  },
};

export function normalizeToRealisticConfig(input?: any): RealisticAvatarConfig {
  if (!input) return DEFAULT_REALISTIC_CONFIG;

  if (input.body && input.hairId) {
    return {
      ...DEFAULT_REALISTIC_CONFIG,
      ...input,
      body: {
        ...DEFAULT_REALISTIC_CONFIG.body,
        ...input.body,
      },
    };
  }

  const isShirtNone = input.shirtId === 'shirt_none' || input.shirtId === 'none' || input.shirtId === '';
  const isShirtOxford = input.shirtId?.includes('formal') || input.shirtId?.includes('vest') || input.shirtId?.includes('polo') || input.shirtId === 'shirt_oxford_button_down';
  
  const isPantsUnderwear = input.pantsId === 'pants_underwear_briefs' || input.pantsId === 'none' || input.pantsId === '';
  const isPantsChino = input.pantsId?.includes('trouser') || input.pantsId?.includes('khaki') || input.pantsId?.includes('chino') || input.pantsId === 'pants_tailored_chinos';
  
  const isHairBald = input.hairId === 'hair_bald_natural' || input.hairId === 'none' || input.hairId === '';
  const isHairSidePart = input.hairId?.includes('side') || input.hairId?.includes('part') || input.hairId === 'hair_layered_side_part';
  
  const isShoesBarefoot = input.shoesId === 'shoes_barefoot' || input.shoesId === 'none' || input.shoesId === '';
  const isShoesOxford = input.shoesId?.includes('leather') || input.shoesId?.includes('dress') || input.shoesId === 'shoes_polished_leather_oxford';

  return {
    hairId: isHairBald ? 'hair_bald_natural' : (isHairSidePart ? 'hair_layered_side_part' : 'hair_modern_quiff'),
    faceId: input.faceId?.includes('smile') ? 'face_warm_smile' : 'face_confident_natural',
    shirtId: isShirtNone ? 'shirt_none' : (isShirtOxford ? 'shirt_oxford_button_down' : 'shirt_fitted_cotton_tee'),
    pantsId: isPantsUnderwear ? 'pants_underwear_briefs' : (isPantsChino ? 'pants_tailored_chinos' : 'pants_classic_denim_jeans'),
    shoesId: isShoesBarefoot ? 'shoes_barefoot' : (isShoesOxford ? 'shoes_polished_leather_oxford' : 'shoes_low_top_sneaker'),
    accessoryId: input.accessoryId === '' || input.accessoryId === 'none' || !input.accessoryId ? '' : (input.accessoryId?.includes('watch') ? 'acc_minimalist_leather_watch' : 'acc_wireframe_glasses'),
    eyeShapeId: input.eyeShapeId || DEFAULT_REALISTIC_CONFIG.eyeShapeId,
    noseShapeId: input.noseShapeId || DEFAULT_REALISTIC_CONFIG.noseShapeId,
    mouthShapeId: input.mouthShapeId || DEFAULT_REALISTIC_CONFIG.mouthShapeId,
    eyebrowShapeId: input.eyebrowShapeId || DEFAULT_REALISTIC_CONFIG.eyebrowShapeId,
    jawlineShapeId: input.jawlineShapeId || DEFAULT_REALISTIC_CONFIG.jawlineShapeId,
    skinTone: input.skinTone || DEFAULT_REALISTIC_CONFIG.skinTone,
    hairColor: input.hairColor || DEFAULT_REALISTIC_CONFIG.hairColor,
    eyeColor: input.eyeColor || DEFAULT_REALISTIC_CONFIG.eyeColor,
    shirtColor: input.shirtColor || DEFAULT_REALISTIC_CONFIG.shirtColor,
    pantsColor: input.pantsColor || DEFAULT_REALISTIC_CONFIG.pantsColor,
    shoesColor: input.shoesColor || DEFAULT_REALISTIC_CONFIG.shoesColor,
    body: {
      heightCm: input.heightScale ? Math.round(input.heightScale * 176) : (input.body?.heightCm || DEFAULT_REALISTIC_CONFIG.body.heightCm),
      weightKg: input.body?.weightKg || DEFAULT_REALISTIC_CONFIG.body.weightKg,
      musclePct: input.body?.musclePct || DEFAULT_REALISTIC_CONFIG.body.musclePct,
      shoulderWidthScale: input.body?.shoulderWidthScale || 1.0,
      legLengthScale: input.legScale || input.body?.legLengthScale || 1.0,
    },
  };
}
