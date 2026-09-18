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
  subCategory?: 'trend' | 'noble' | 'luxury' | 'clown';
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
  eyebrowIntensity?: number; // 10 - 100 (Độ đậm nhạt chân mày)
  jawlineShapeId?: string;

  // Colors
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  lipColor?: string;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;

  // Body Morphology
  body: RealisticBodyMetrics;
}

// 1. Tóc Đầu Cua Cơ Bản Chuẩn Men
export const REALISTIC_HAIR_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'hair_buzz_cut_fade',
    name: 'Tóc Đầu Cua 1 Phân Fade (Buzz Cut Waves)',
    category: 'hair',
    description: 'Tóc húi cua 1 phân vân sóng 3D đỉnh đầu, 2 bên mang tai và gáy fade mờ dần tự nhiên chuẩn form.',
    materialType: 'silk',
    badge: '★ Đầu Cua Fade 1 Phân',
  },
  {
    id: 'hair_curtain_wavy_two_block',
    name: 'Tóc 2 Mái Dài Tóc Moi (Two-Block Curtains)',
    category: 'hair',
    description: 'Kiểu tóc 2 mái lãng tử bồng bềnh, vạt tóc dài phủ ngang qua tai và gáy Two-block dày dặn chuẩn form.',
    materialType: 'silk',
    badge: '★ 2 Mái Tóc Moi',
  },
  {
    id: 'hair_crew_cut',
    name: 'Crew Cut (Gọn Gàng Lịch Lãm)',
    category: 'hair',
    description: 'Đỉnh đầu vuốt dốc thoải từ trán về đỉnh sọ, 2 bên cạo fade gọn gàng nam tính.',
    materialType: 'silk',
    badge: '★ Crew Cut',
  },
  {
    id: 'hair_caesar_cut',
    name: 'Caesar Cut (Mái Ngang La Mã)',
    category: 'hair',
    description: 'Mái ngang cắt bằng dứt khoát trên trán, viền góc vuông vức ôm sát hộp sọ.',
    materialType: 'silk',
    badge: '★ Caesar Cut',
  },
  {
    id: 'hair_french_crop',
    name: 'French Crop (Mái Ngắn Hiện Đại)',
    category: 'hair',
    description: 'Mái ngang ngắn trên trán, đỉnh sọ vân nổi bồng bềnh, 2 bên cạo fade cao.',
    materialType: 'silk',
    badge: '★ French Crop',
  },
  {
    id: 'hair_undercut_classic',
    name: 'Classic Undercut (Vuốt Phồng Nam Tính)',
    category: 'hair',
    description: 'Khối tóc đỉnh sọ dày dặn vuốt bồng bềnh, 2 bên thái dương và gáy cạo fade sát.',
    materialType: 'silk',
    badge: '★ Classic Undercut',
  },
  {
    id: 'hair_modern_quiff',
    name: 'Modern Quiff (Mái Vuốt Cuộn Phồng)',
    category: 'hair',
    description: 'Mái trước vồng cao cuộn sóng bồng bềnh năng động, 2 bên ôm gọn gàng.',
    materialType: 'silk',
    badge: '★ Modern Quiff',
  },
  {
    id: 'hair_buzz_fade',
    name: 'High Skin Buzz Fade (Húi Cua Sát Da)',
    category: 'hair',
    description: 'Tóc húi cua siêu ngắn cạo sát trắng chân tóc 2 bên và sau gáy cực ngầu.',
    materialType: 'silk',
    badge: '★ High Buzz Fade',
  },
  {
    id: 'hair_faux_hawk',
    name: 'Faux Hawk (Sống Lưng Thời Thượng)',
    category: 'hair',
    description: 'Dải tóc sống lưng giữa đầu vuốt nhọn nổi gồ cao mạnh mẽ, 2 bên vuốt gọn.',
    materialType: 'silk',
    badge: '★ Faux Hawk',
  },
  {
    id: 'hair_ivy_league',
    name: 'Ivy League (Rẽ Ngôi Quý Tộc)',
    category: 'hair',
    description: 'Rẽ ngôi lệch 7/3 ngắn quý ông, mái vuốt dốc nhẹ sang bên thanh lịch.',
    materialType: 'silk',
    badge: '★ Ivy League',
  },
  {
    id: 'hair_mohawk_punk',
    name: 'Mohawk Punk (Chóp Gai Dựng Cao)',
    category: 'hair',
    description: 'Sống tóc dựng cao sắc nét từ trán dọc suốt sống lưng tới gáy phong cách punk rock.',
    materialType: 'silk',
    badge: '★ Mohawk Punk',
  },
  {
    id: 'hair_pompadour',
    name: 'Classic Pompadour (Retro Cổ Điển)',
    category: 'hair',
    description: 'Mái trước phồng vòm cong lớn retro bồng bềnh cuộn ngược ra sau quý phái.',
    materialType: 'silk',
    badge: '★ Pompadour',
  },
  {
    id: 'hair_side_part_slick',
    name: 'Side Part 7/3 Slick (Lịch Lãm Doanh Nhân)',
    category: 'hair',
    description: 'Đường rẽ ngôi sắc nét chải mượt ép phẳng sang 2 bên lịch lãm.',
    materialType: 'silk',
    badge: '★ Side Part 7/3',
  },
  {
    id: 'hair_mullet_modern',
    name: 'Modern Mullet (Đuôi Dài Cá Tính)',
    category: 'hair',
    description: 'Mặt trước và 2 bên cắt ngắn gọn gàng, đuôi tóc sau gáy vuốt dài xuống cổ.',
    materialType: 'silk',
    badge: '★ Modern Mullet',
  },
  {
    id: 'hair_comb_over_fade',
    name: 'Comb Over Fade (Chải Lệch Sang Trọng)',
    category: 'hair',
    description: 'Toàn bộ khối tóc đỉnh chải dạt sang một bên mượt mà, fade cao dứt khoát.',
    materialType: 'silk',
    badge: '★ Comb Over',
  },
  {
    id: 'hair_slicked_back',
    name: 'Slicked Back (Vuốt Ngược Toàn Bộ)',
    category: 'hair',
    description: 'Vuốt ngược toàn bộ lọn tóc ra sau ôm sát form sọ sang trọng đẳng cấp.',
    materialType: 'silk',
    badge: '★ Slicked Back',
  },
  {
    id: 'hair_textured_crop',
    name: 'Textured Crop (Gợn Sóng Xếp Tầng)',
    category: 'hair',
    description: 'Đỉnh sọ tạo các vân lọn xếp lớp đan xen cá tính, mái ngang ngắn.',
    materialType: 'silk',
    badge: '★ Textured Crop',
  },
  {
    id: 'hair_man_bun',
    name: 'Top Knot / Man Bun (Búi Củ Tỏi Lãng Tử)',
    category: 'hair',
    description: 'Khối tóc ôm ngược về đỉnh sọ kèm búi tóc tròn củ tỏi 3D nghệ thuật.',
    materialType: 'silk',
    badge: '★ Man Bun',
  },
  {
    id: 'hair_spiky_modern',
    name: 'Modern Spiky (Gai Nhọn Năng Động)',
    category: 'hair',
    description: 'Các chóp gai nhọn nổi khối thể thao năng động vuốt dựng đều đặn.',
    materialType: 'silk',
    badge: '★ Spiky Modern',
  },
  {
    id: 'hair_ponytail_high',
    name: 'Tóc Buộc Đuôi Ngựa (High Ponytail)',
    category: 'hair',
    description: 'Tóc mái trước chải gọn ngược ra sau, kết hợp chùm đuôi ngựa 3D dài uốn lượn bồng bềnh sau gáy.',
    materialType: 'silk',
    badge: '★ Đuôi Ngựa',
  },
  {
    id: 'hair_long_female_flowing',
    name: 'Tóc Dài Nữ Tính (Long Flowing Hair)',
    category: 'hair',
    description: 'Mái tóc dài mượt buông xõa bồng bềnh qua 2 bên vai và sau lưng nữ tính duyên dáng.',
    materialType: 'silk',
    badge: '★ Tóc Dài Xõa',
  },
  {
    id: 'hair_curly_afro_perm',
    name: 'Tóc Xoăn Bồng Bềnh (Curly Afro Perm)',
    category: 'hair',
    description: 'Khối tóc xoăn tít bồng bềnh 3D với vô số lọn sóng xoăn nổi vân tự nhiên cá tính.',
    materialType: 'silk',
    badge: '★ Afro Perm',
  },
  {
    id: 'hair_curly_crop_fade',
    name: 'Curly Crop Perm (Xoăn Mái Ngố Fade)',
    category: 'hair',
    description: 'Mái ngắn ngang uốn xoăn nhẹ lượn sóng tự nhiên, 2 bên cạo fade cao chuẩn style Hàn Quốc.',
    materialType: 'silk',
    badge: '★ Curly Crop',
  },
  {
    id: 'hair_curly_undercut',
    name: 'Curly Undercut (Xoăn Vuốt Phồng)',
    category: 'hair',
    description: '2 bên cạo gọn dứt khoát, đỉnh sọ uốn xoăn lọn lớn bồng bềnh đổ dồn về trước cá tính.',
    materialType: 'silk',
    badge: '★ Curly Undercut',
  },
  {
    id: 'hair_curly_mullet',
    name: 'Wavy Curly Mullet (Mullet Xoăn Lãng Tử)',
    category: 'hair',
    description: 'Mặt trước uốn xoăn bồng bềnh, 2 bên gọn gàng và đuôi gáy xoăn sóng uốn lượn xuống cổ.',
    materialType: 'silk',
    badge: '★ Curly Mullet',
  },
  {
    id: 'hair_wavy_middle_part',
    name: 'Wavy Middle Part (Xoăn Rẽ Ngôi 5/5)',
    category: 'hair',
    description: 'Rẽ ngôi giữa 5/5 lãng tử với 2 vạt mái xoăn sóng chữ S bay bổng ôm 2 bên thái dương.',
    materialType: 'silk',
    badge: '★ Xoăn 5/5',
  },
  {
    id: 'hair_curly_side_part',
    name: 'Curly Side Part (Xoăn Rẽ Ngôi 7/3)',
    category: 'hair',
    description: 'Đường rẽ ngôi 7/3 dứt khoát kết hợp khối tóc xoăn bồng bềnh sang trọng phong nhã.',
    materialType: 'silk',
    badge: '★ Xoăn 7/3',
  },
  {
    id: 'hair_curly_quiff',
    name: 'Curly Wavy Quiff (Quiff Xoăn Sóng Lớn)',
    category: 'hair',
    description: 'Mái trước xoăn cuộn vồng cao năng động, từng lớp sóng xoăn nhấp nhô khỏe khoắn.',
    materialType: 'silk',
    badge: '★ Curly Quiff',
  },
  {
    id: 'hair_messy_wavy_shag',
    name: 'Messy Wavy Shag (Xoăn Tầng Phá Cách)',
    category: 'hair',
    description: 'Các lớp xoăn xếp tầng so le tự nhiên phong cách Shaggy Nhật Bản phong trần bụi bặm.',
    materialType: 'silk',
    badge: '★ Xoăn Shag',
  },
  {
    id: 'hair_long_beach_waves',
    name: 'Beach Waves (Tóc Dài Xoăn Sóng Nước)',
    category: 'hair',
    description: 'Mái tóc dài buông xõa qua vai với từng đợt sóng nước uốn lượn mềm mại bồng bềnh nữ tính.',
    materialType: 'silk',
    badge: '★ Sóng Nước',
  },
  {
    id: 'hair_curly_high_top',
    name: 'Curly High Top (Xoăn Vuông Hiphop)',
    category: 'hair',
    description: 'Khối tóc xoăn đứng vuông vức cao ráo trên đỉnh sọ phong cách đường phố hiphop mạnh mẽ.',
    materialType: 'silk',
    badge: '★ High Top Curls',
  },
  {
    id: 'hair_curly_frohawk',
    name: 'Curly Frohawk (Bờm Xoăn Cá Tính)',
    category: 'hair',
    description: 'Dải bờm tóc xoăn xù dập sóng nổi gồ dọc suốt đỉnh đầu, 2 bên thái dương cạo sát trắng.',
    materialType: 'silk',
    badge: '★ Frohawk',
  },
  {
    id: 'hair_bald_natural',
    name: 'Đầu Trọc Tự Nhiên (Bald Scalp)',
    category: 'hair',
    description: 'Khung đầu trọc nguyên bản phô diễn trọn vẹn đường cong khối sọ 3D chuẩn giải phẫu.',
    materialType: 'silk',
    badge: '★ Đầu Trọc',
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

// 2.1. Dáng Mắt (4 dạng từ mắt híp đến mắt to)
export const REALISTIC_EYE_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'eye_shape_narrow_slanted',
    name: '1. Mắt Híp / Một Mí',
    category: 'face',
    description: 'Dáng mắt nhỏ hẹp ngang, một mí đáng yêu, nét duyên dáng hồn nhiên của trẻ thơ.',
    materialType: 'silk',
    badge: '★ Mắt Híp',
  },
  {
    id: 'eye_shape_natural_almond',
    name: '2. Mắt Hạnh Nhân Vừa Vặn',
    category: 'face',
    description: 'Dáng mắt cân đối hài hòa, mí mắt cong tự nhiên, chuẩn nét đẹp Á Đông thanh lịch.',
    materialType: 'silk',
    badge: '★ Tự Nhiên',
  },
  {
    id: 'eye_shape_phoenix',
    name: '3. Mắt Phượng Sắc Nét',
    category: 'face',
    description: 'Đuôi mắt cong nhẹ thanh tú, ánh nhìn tinh anh, thông minh và sắc sảo.',
    materialType: 'silk',
    badge: '★ Tinh Anh',
  },
  {
    id: 'eye_shape_big_round',
    name: '4. Mắt To Tròn Long Lanh',
    category: 'face',
    description: 'Dáng mắt to tròn hai mí rõ rệt, ngây thơ, nổi bật và bừng sáng gương mặt.',
    materialType: 'silk',
    badge: '★ To Tròn',
  },
];

// 2.2. Dáng Mũi (Nose Morphology)
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
  {
    id: 'nose_witch_hooked',
    name: 'Mũi Gồ La Mã (Aquiline)',
    category: 'face',
    description: 'Sống mũi gồ nhẹ cá tính, chóp cong thanh lịch chuẩn nét quý tộc La Mã / phương Tây.',
    materialType: 'silk',
    badge: '★ Quý Tộc',
  },
  {
    id: 'nose_cute_button_snub',
    name: 'Mũi Hếch Hạt Mít Baby',
    category: 'face',
    description: 'Sống mũi nhỏ xinh, chóp mũi hếch tròn xoe đáng yêu chuẩn nét trẻ thơ.',
    materialType: 'silk',
    badge: '★ Đáng Yêu',
  },
];

// 2.3. Dáng Môi & Miệng (3 Dáng Môi từ mỏng tự nhiên, căng mọng đến môi trề to dày cộp hài hước)
export const REALISTIC_MOUTH_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'mouth_natural_thin',
    name: '1. Môi Mỏng Tự Nhiên',
    category: 'face',
    description: 'Vành môi mỏng nhẹ thanh tú, viền môi tự nhiên, nét đẹp thư thái chuẩn Á Đông.',
    materialType: 'silk',
    badge: '★ Mỏng Nhẹ',
  },
  {
    id: 'mouth_plump_full',
    name: '2. Môi Căng Mọng Dày Dặn',
    category: 'face',
    description: 'Môi trên cánh cung rõ nét, môi dưới đầy đặn căng tràn sức sống, quyến rũ và rạng rỡ.',
    materialType: 'silk',
    badge: '★ Căng Mọng',
  },
  {
    id: 'mouth_pouting_thick_tre',
    name: '3. Môi Hờn Dỗi Đầy Đặn',
    category: 'face',
    description: 'Môi dưới hơi trề nhẹ đầy đặn cá tính, tạo nét biểu cảm hờn dỗi đáng yêu tự nhiên.',
    materialType: 'silk',
    badge: '★ Hờn Dỗi',
  },
];

// 2.4. Dáng Chân Mày (9 Dáng Chân Mày đa dạng từ tự nhiên, kiếm mi, unibrow liền mạch đến độc lạ cắt khấc, lượn sóng, tia chớp)
export const REALISTIC_BROW_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'brow_soft_arch',
    name: '1. Mày Cánh Cung Tự Nhiên',
    category: 'face',
    description: 'Dáng mày cong mềm mại thanh tú ôm trọn bầu mắt, sợi mượt mà tự nhiên chuẩn Á Đông.',
    materialType: 'silk',
    badge: '★ Tự Nhiên',
  },
  {
    id: 'brow_sword_bold',
    name: '2. Mày Kiếm Khí Chất',
    category: 'face',
    description: 'Đầu mày thẳng sắc, đuôi mày vát nhọn xếch nhẹ lên thái dương, toát lên khí phách nam tính.',
    materialType: 'silk',
    badge: '★ Sắc Sảo',
  },
  {
    id: 'brow_unibrow_continuous',
    name: '3. Mày Liền Nhất Tự (Unibrow)',
    category: 'face',
    description: 'Lông mày liền một dải nối dài xuyên qua sống mũi, biểu tượng cá tính độc lạ kinh điển.',
    materialType: 'silk',
    badge: '★ Liền Nhau ⚡',
  },
  {
    id: 'brow_slit_cyber',
    name: '4. Cắt Khấc Cyber Slit',
    category: 'face',
    description: 'Đuôi mày rạch khấc đứt đoạn phong cách Hip-hop / Cyberpunk cực ngầu và chất lừ.',
    materialType: 'silk',
    badge: '★ Độc Lạ 🔥',
  },
  {
    id: 'brow_wave_squiggles',
    name: '5. Lượn Sóng Squiggle',
    category: 'face',
    description: 'Dáng mày uốn lượn hình sin sóng biển siêu độc dị, phá cách và tạo nét hài hước.',
    materialType: 'silk',
    badge: '★ Phá Cách 〰️',
  },
  {
    id: 'brow_lightning_zigzag',
    name: '6. Tia Chớp Zig-Zag',
    category: 'face',
    description: 'Gãy khúc zic-zắc sắc nhọn như tia sét ma thuật, siêu ấn tượng và hút mắt.',
    materialType: 'silk',
    badge: '★ Tia Sét ⚡',
  },
  {
    id: 'brow_straight_korean',
    name: '7. Mày Ngang Hàn Quốc',
    category: 'face',
    description: 'Dáng mày ngang thẳng thanh thoát, bản vừa vặn trẻ trung tạo nét mặt hiền hòa.',
    materialType: 'silk',
    badge: '★ Trẻ Trung',
  },
  {
    id: 'brow_high_arch_western',
    name: '8. Mày Cong Cao Diva',
    category: 'face',
    description: 'Đỉnh vòm mày nâng cao sắc sảo, đuôi vuốt nhọn thanh mảnh quyến rũ chuẩn phong cách Tây Âu.',
    materialType: 'silk',
    badge: '★ Cao Tây',
  },
  {
    id: 'brow_thick_bushy',
    name: '9. Mày Rậm Rạp Sâu Róm',
    category: 'face',
    description: 'Sợi lông mày to bản, rậm rạp dày đặc nam tính, cực kỳ ấn tượng và nổi bật.',
    materialType: 'silk',
    badge: '★ Rậm Rạp',
  },
  {
    id: 'brow_sigma_raised',
    name: '10. Nhướn Mày Sigma (The Rock)',
    category: 'face',
    description: 'Một bên mày nhướn cong vút siêu cao, một bên gằn sắc sảo tạo biểu cảm nhếch mày Sigma / The Rock kinh điển.',
    materialType: 'silk',
    badge: '★ Nhướn Mày 🤨',
  },
];

// 2.5. Khung Hàm & Cằm (6 Dáng Khung Hàm & Cằm đa dạng từ V-Line, Sigma Chad Mewing Cleft Chin đến Cằm Vuông, Cằm Chẻ, Baby, Cằm Nhọn)
export const REALISTIC_JAW_SHAPE_OPTIONS: RealisticAssetOption[] = [
  {
    id: 'jaw_sharp_v_line',
    name: '1. Góc Hàm V-Line Thanh Tú',
    category: 'face',
    description: 'Khung xương hàm thon gọn tinh tế, cằm V-line mềm mại chuẩn Á Đông thanh lịch.',
    materialType: 'silk',
    badge: '★ V-Line',
  },
  {
    id: 'jaw_sigma_chad_mewing',
    name: '2. Cằm Chẻ Sigma Chad Mewing',
    category: 'face',
    description: 'Góc hàm bạnh 90° cực bén, má hóp sâu chuẩn Mewing, cằm vuông nhô cao chẻ đôi (Cleft Chin) siêu nam tính tối thượng.',
    materialType: 'silk',
    badge: '★ Sigma Mewing 🔥',
  },
  {
    id: 'jaw_structured_masculine',
    name: '3. Khung Hàm Vuông Nam Tính',
    category: 'face',
    description: 'Góc hàm mandible rõ nét, cằm vuông vức vững chãi, đường nét phong trần khỏe khoắn.',
    materialType: 'silk',
    badge: '★ Vuông Vức',
  },
  {
    id: 'jaw_cleft_chin_gentleman',
    name: '4. Cằm Chẻ Quý Tộc Lãng Tử',
    category: 'face',
    description: 'Khung hàm thon gọn thanh tú kiểu tài tử điện ảnh Hollywood, rãnh cằm chẻ quyến rũ cuốn hút.',
    materialType: 'silk',
    badge: '★ Cằm Chẻ ✨',
  },
  {
    id: 'jaw_round_soft_baby',
    name: '5. Khung Hàm Tròn Baby Bầu Bĩnh',
    category: 'face',
    description: 'Đường viền xương hàm cong tròn mềm mại, má phính bầu bĩnh đáng yêu chuẩn nét trẻ thơ.',
    materialType: 'silk',
    badge: '★ Bầu Bĩnh 👶',
  },
  {
    id: 'jaw_heart_pointed',
    name: '6. Khung Hàm Trái Tim Cằm Nhọn',
    category: 'face',
    description: 'Gò má nở rộng, viền hàm vuốt thon nhọn sắc sảo về đỉnh cằm theo hình khối trái tim / kim cương.',
    materialType: 'silk',
    badge: '★ Cằm Nhọn 💎',
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

// 9. Bảng màu mắt (Gồm các tông màu chuẩn và màu ngầu/cyber/fantasy)
export const REALISTIC_EYE_COLORS = [
  { id: 'deep_black', name: 'Đen Tuyền', hex: '#151316' },
  { id: 'deep_brown', name: 'Nâu Đen Á Đông', hex: '#2b1810' },
  { id: 'amber_gold', name: 'Hoàng Kim Hổ Phách', hex: '#c47d2b' },
  { id: 'crimson_ruby', name: 'Đỏ Ruby Ma Thuật', hex: '#a8182b' },
  { id: 'cyber_neon_blue', name: 'Xanh Băng Cyber', hex: '#0ea5e9' },
  { id: 'deep_ocean', name: 'Xanh Biển Sâu', hex: '#1d4ed8' },
  { id: 'emerald_green', name: 'Ngọc Lục Bảo', hex: '#059669' },
  { id: 'amethyst_mystic', name: 'Tím Thạch Anh Huyền Bí', hex: '#7c3aed' },
  { id: 'silver_slate', name: 'Bạc Ánh Kim / Khói', hex: '#94a3b8' },
  { id: 'blazing_fire', name: 'Cam Lửa Rực Cháy', hex: '#ea580c' },
];

// 10. Bảng màu môi tự nhiên & tươi tắn (Lip Colors)
export const REALISTIC_LIP_COLORS = [
  { id: 'natural_pink', name: 'Hồng Tự Nhiên', hex: '#DE7E8A' },
  { id: 'coral_peach', name: 'Đào San Hô', hex: '#E88674' },
  { id: 'baby_blossom', name: 'Hồng Baby Ngọt Ngào', hex: '#EA99B2' },
  { id: 'nude_peach', name: 'Hồng Cam Nude', hex: '#D68A78' },
  { id: 'cherry_red', name: 'Đỏ Cherry Tươi', hex: '#B83B46' },
  { id: 'warm_terracotta', name: 'Hồng Đất Thanh Lịch', hex: '#C27367' },
  { id: 'berry_wine', name: 'Đỏ Rượu Dâu', hex: '#9E3246' },
  { id: 'vibrant_coral', name: 'Hồng Cam Rạng Rỡ', hex: '#F06C59' },
  { id: 'bright_apricot', name: 'Cam San Hô', hex: '#EE8055' },
  { id: 'plum_velvet', name: 'Đỏ Mận Quý Phái', hex: '#8A293E' },
];

// Cấu hình mặc định: Chuẩn Human Base Mesh giải phẫu (Ảnh 2 Reference)
export const DEFAULT_REALISTIC_CONFIG: RealisticAvatarConfig = {
  hairId: 'hair_buzz_cut_fade',
  faceId: 'face_confident_natural',
  shirtId: 'shirt_none',
  pantsId: 'pants_underwear_briefs',
  shoesId: 'shoes_barefoot',
  accessoryId: '',

  // Ngũ Quan mặc định (luôn chọn option đầu tiên theo yêu cầu)
  eyeShapeId: 'eye_shape_narrow_slanted',
  noseShapeId: 'nose_natural_soft',
  mouthShapeId: 'mouth_natural_thin',
  eyebrowShapeId: 'brow_soft_arch',
  eyebrowIntensity: 85,
  jawlineShapeId: 'jaw_sharp_v_line',

  skinTone: '#E8BA9A',
  hairColor: '#16161a',
  eyeColor: '#151316',
  lipColor: '#DE7E8A',
  shirtColor: '#ffffff',
  pantsColor: '#1e293b',
  shoesColor: '#f8fafc',

  body: {
    heightCm: 105, // Default cho giai đoạn mầm non theo WHO: 105cm (Khoảng 95cm - 115cm)
    weightKg: 24,
    musclePct: 20,
    shoulderWidthScale: 1.0,
    legLengthScale: 1.0,
  },
};

export function normalizeToRealisticConfig(input?: any): RealisticAvatarConfig {
  if (!input) return DEFAULT_REALISTIC_CONFIG;

  // 1. Ưu tiên lấy giá trị từ input.body (state từ thanh trượt customizer)
  let parsedHeight = DEFAULT_REALISTIC_CONFIG.body.heightCm; // 105
  let parsedLegScale = DEFAULT_REALISTIC_CONFIG.body.legLengthScale; // 1.0

  if (input.body) {
    if (typeof input.body.heightCm === 'number') {
      // Giới hạn chiều cao giai đoạn mầm non theo chuẩn WHO: [95cm, 115cm], mặc định 105cm
      if (input.body.heightCm > 115 || input.body.heightCm < 95) {
        parsedHeight = 105;
      } else {
        parsedHeight = input.body.heightCm;
      }
    }
    if (typeof input.body.legLengthScale === 'number') {
      parsedLegScale = Math.max(0.85, Math.min(1.15, input.body.legLengthScale));
    }
  } else {
    // Fallback nếu truyền từ định dạng 2D avatar cũ (ví dụ heightScale: 1.0)
    if (typeof input.heightScale === 'number' && input.heightScale > 0) {
      const rawH = Math.round(input.heightScale * 105);
      parsedHeight = rawH > 115 || rawH < 95 ? 105 : rawH;
    }
    if (typeof input.legScale === 'number' && input.legScale > 0) {
      parsedLegScale = Math.max(0.85, Math.min(1.15, input.legScale));
    }
  }

  // Tách bỏ các thuộc tính heightScale / legScale ở root để tránh ghi đè body
  const { heightScale: _hs, legScale: _ls, ...cleanInput } = input;

  // Lọc dáng mắt: kiểm tra hợp lệ
  const validEyeShapes = REALISTIC_EYE_SHAPE_OPTIONS.map((o) => o.id);
  let resolvedEyeShape = cleanInput.eyeShapeId;
  if (!resolvedEyeShape || !validEyeShapes.includes(resolvedEyeShape)) {
    resolvedEyeShape = REALISTIC_EYE_SHAPE_OPTIONS[0].id;
  }

  let resolvedEyeColor = cleanInput.eyeColor;
  if (!resolvedEyeColor || resolvedEyeColor === '#261710') {
    resolvedEyeColor = REALISTIC_EYE_COLORS[0].hex;
  }

  let resolvedLipColor = cleanInput.lipColor;
  if (!resolvedLipColor) {
    resolvedLipColor = REALISTIC_LIP_COLORS[0].hex;
  }

  const validNoseShapes = REALISTIC_NOSE_SHAPE_OPTIONS.map((o) => o.id);
  let resolvedNoseShape = cleanInput.noseShapeId;
  if (!resolvedNoseShape || !validNoseShapes.includes(resolvedNoseShape)) {
    resolvedNoseShape = REALISTIC_NOSE_SHAPE_OPTIONS[0].id;
  }

  const validMouthShapes = REALISTIC_MOUTH_SHAPE_OPTIONS.map((o) => o.id);
  let resolvedMouthShape = cleanInput.mouthShapeId;
  if (!resolvedMouthShape || !validMouthShapes.includes(resolvedMouthShape)) {
    resolvedMouthShape = REALISTIC_MOUTH_SHAPE_OPTIONS[0].id;
  }

  const validEyebrowShapes = REALISTIC_BROW_SHAPE_OPTIONS.map((o) => o.id);
  let resolvedEyebrowShape = cleanInput.eyebrowShapeId;
  if (!resolvedEyebrowShape || !validEyebrowShapes.includes(resolvedEyebrowShape)) {
    resolvedEyebrowShape = REALISTIC_BROW_SHAPE_OPTIONS[0].id;
  }

  const validJawlineShapes = REALISTIC_JAW_SHAPE_OPTIONS.map((o) => o.id);
  let resolvedJawlineShape = cleanInput.jawlineShapeId;
  if (!resolvedJawlineShape || !validJawlineShapes.includes(resolvedJawlineShape)) {
    resolvedJawlineShape = REALISTIC_JAW_SHAPE_OPTIONS[0].id;
  }

  const resolvedEyebrowIntensity = typeof cleanInput.eyebrowIntensity === 'number'
    ? Math.max(10, Math.min(100, Math.round(cleanInput.eyebrowIntensity)))
    : DEFAULT_REALISTIC_CONFIG.eyebrowIntensity ?? 85;

  const validHairIds = REALISTIC_HAIR_OPTIONS.map((o) => o.id);
  let resolvedHairId = cleanInput.hairId;
  if (!resolvedHairId || !validHairIds.includes(resolvedHairId)) {
    resolvedHairId = DEFAULT_REALISTIC_CONFIG.hairId;
  }

  if (input.body && input.hairId) {
    return {
      ...DEFAULT_REALISTIC_CONFIG,
      ...cleanInput,
      hairId: resolvedHairId,
      eyeShapeId: resolvedEyeShape,
      eyeColor: resolvedEyeColor,
      lipColor: resolvedLipColor,
      noseShapeId: resolvedNoseShape,
      mouthShapeId: resolvedMouthShape,
      eyebrowShapeId: resolvedEyebrowShape,
      eyebrowIntensity: resolvedEyebrowIntensity,
      jawlineShapeId: resolvedJawlineShape,
      body: {
        ...DEFAULT_REALISTIC_CONFIG.body,
        ...input.body,
        heightCm: parsedHeight,
        legLengthScale: parsedLegScale,
      },
    };
  }

  const isShirtNone = input.shirtId === 'shirt_none' || input.shirtId === 'none' || input.shirtId === '';
  const isShirtOxford = input.shirtId?.includes('formal') || input.shirtId?.includes('vest') || input.shirtId?.includes('polo') || input.shirtId === 'shirt_oxford_button_down';
  
  const isPantsUnderwear = input.pantsId === 'pants_underwear_briefs' || input.pantsId === 'none' || input.pantsId === '';
  const isPantsChino = input.pantsId?.includes('trouser') || input.pantsId?.includes('khaki') || input.pantsId?.includes('chino') || input.pantsId === 'pants_tailored_chinos';
  
  const isShoesBarefoot = input.shoesId === 'shoes_barefoot' || input.shoesId === 'none' || input.shoesId === '';
  const isShoesOxford = input.shoesId?.includes('leather') || input.shoesId?.includes('dress') || input.shoesId === 'shoes_polished_leather_oxford';

  return {
    ...DEFAULT_REALISTIC_CONFIG,
    ...cleanInput,
    hairId: resolvedHairId,
    faceId: input.faceId?.includes('smile') ? 'face_warm_smile' : (input.faceId || DEFAULT_REALISTIC_CONFIG.faceId),
    shirtId: isShirtNone ? 'shirt_none' : (isShirtOxford ? 'shirt_oxford_button_down' : (input.shirtId || DEFAULT_REALISTIC_CONFIG.shirtId)),
    pantsId: isPantsUnderwear ? 'pants_underwear_briefs' : (isPantsChino ? 'pants_tailored_chinos' : (input.pantsId || DEFAULT_REALISTIC_CONFIG.pantsId)),
    shoesId: isShoesBarefoot ? 'shoes_barefoot' : (isShoesOxford ? 'shoes_polished_leather_oxford' : (input.shoesId || DEFAULT_REALISTIC_CONFIG.shoesId)),
    accessoryId: input.accessoryId === '' || input.accessoryId === 'none' || !input.accessoryId ? '' : (input.accessoryId?.includes('watch') ? 'acc_minimalist_leather_watch' : 'acc_wireframe_glasses'),
    eyeShapeId: resolvedEyeShape,
    noseShapeId: resolvedNoseShape,
    mouthShapeId: resolvedMouthShape,
    eyebrowShapeId: resolvedEyebrowShape,
    eyebrowIntensity: resolvedEyebrowIntensity,
    jawlineShapeId: resolvedJawlineShape,
    skinTone: input.skinTone || DEFAULT_REALISTIC_CONFIG.skinTone,
    hairColor: input.hairColor || DEFAULT_REALISTIC_CONFIG.hairColor,
    eyeColor: resolvedEyeColor,
    lipColor: resolvedLipColor,
    shirtColor: input.shirtColor || DEFAULT_REALISTIC_CONFIG.shirtColor,
    pantsColor: input.pantsColor || DEFAULT_REALISTIC_CONFIG.pantsColor,
    shoesColor: input.shoesColor || DEFAULT_REALISTIC_CONFIG.shoesColor,
    body: {
      heightCm: parsedHeight,
      weightKg: input.body?.weightKg || DEFAULT_REALISTIC_CONFIG.body.weightKg,
      musclePct: input.body?.musclePct || DEFAULT_REALISTIC_CONFIG.body.musclePct,
      shoulderWidthScale: input.body?.shoulderWidthScale || 1.0,
      legLengthScale: parsedLegScale,
    },
  };
}
