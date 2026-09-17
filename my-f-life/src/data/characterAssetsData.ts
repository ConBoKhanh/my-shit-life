import type { CharacterAvatarConfig } from '../types/game';

export interface AssetOption {
  id: string;
  name: string;
  category: 'hair' | 'face' | 'shirt' | 'pants' | 'shoes' | 'accessory';
  styleTag: 'sloppy' | 'casual' | 'fancy';
  styleLabel: string;
  description: string;
  fashionScore: number;
  genderFit?: 'all' | 'boy' | 'girl';
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

// ==========================================
// 🎨 BẢNG MÀU DA & MÀU TÓC
// ==========================================
export const SKIN_TONES: ColorOption[] = [
  { id: 'skin_fair', name: 'Trắng Sứ Hồng Hào', hex: '#FFE8D6' },
  { id: 'skin_light', name: 'Trắng Sáng Tự Nhiên', hex: '#FFDFBA' },
  { id: 'skin_warm', name: 'Vàng Ấm Áp Chuẩn Việt', hex: '#F5CD9E' },
  { id: 'skin_tan', name: 'Bánh Mật Khỏe Khoắn', hex: '#E0A96D' },
  { id: 'skin_caramel', name: 'Nâu Đồng Rắn Rỏi', hex: '#B87A44' },
  { id: 'skin_deep', name: 'Socola Ngăm Đen', hex: '#7D4F27' },
];

export const HAIR_COLORS: ColorOption[] = [
  { id: 'hair_black', name: 'Đen Tuyền Mực', hex: '#22202A' },
  { id: 'hair_dark_brown', name: 'Nâu Hạt Dẻ', hex: '#4A3326' },
  { id: 'hair_caramel', name: 'Nâu Trà Sữa', hex: '#8C5D3D' },
  { id: 'hair_gold', name: 'Vàng Hoe Tỏa Sáng', hex: '#F4B234' },
  { id: 'hair_platinum', name: 'Bạch Kim Sành Điệu', hex: '#DCDFE8' },
  { id: 'hair_neon_blue', name: 'Xanh Dương Cyber', hex: '#3B82F6' },
  { id: 'hair_pastel_pink', name: 'Hồng Kẹo Ngọt', hex: '#F472B6' },
  { id: 'hair_fire_red', name: 'Đỏ Lửa Cháy Phố', hex: '#EF4444' },
];

// ==========================================
// 💇 12 KIỂU TÓC (ĐỦ CÁC CÁ TÍNH)
// ==========================================
export const HAIR_OPTIONS: AssetOption[] = [
  {
    id: 'hair_spiky_cool',
    name: 'Vuốt Dựng Năng Động',
    category: 'hair',
    styleTag: 'casual',
    styleLabel: 'Năng Động',
    description: 'Bướng bỉnh, tinh nghịch, dân chơi mầm non không ngại va chạm.',
    fashionScore: 45,
    genderFit: 'boy',
  },
  {
    id: 'hair_kpop_part',
    name: '2 Mái K-Pop Lãng Tử',
    category: 'hair',
    styleTag: 'fancy',
    styleLabel: 'Đào Hoa',
    description: 'Hot boy nhí vạn người mê, nụ cười làm tan chảy góc đồ chơi.',
    fashionScore: 60,
    genderFit: 'all',
  },
  {
    id: 'hair_twintails_ribbon',
    name: 'Song Búi Cột Nơ Hồng',
    category: 'hair',
    styleTag: 'fancy',
    styleLabel: 'Điệu Đà',
    description: 'Công chúa nhỏ của bố mẹ, xinh xắn đáng yêu như búp bê.',
    fashionScore: 55,
    genderFit: 'girl',
  },
  {
    id: 'hair_curly_afro',
    name: 'Xoăn Mì Tôm Bồng Bềnh',
    category: 'hair',
    styleTag: 'casual',
    styleLabel: 'Hài Hước',
    description: 'Nghệ sĩ tấu hài tương lai, chỉ cần xuất hiện là cả lớp cười.',
    fashionScore: 50,
    genderFit: 'all',
  },
  {
    id: 'hair_bowl_cut',
    name: 'Úp Nồi / Mái Ngố Tàu',
    category: 'hair',
    styleTag: 'casual',
    styleLabel: 'Ngây Thơ',
    description: 'Ngoan ngoãn, ngây thơ vô số tội, hay bị bạn mượn đồ chơi.',
    fashionScore: 35,
    genderFit: 'all',
  },
  {
    id: 'hair_mohawk_punk',
    name: 'Mào Gà Mohawk Cá Tính',
    category: 'hair',
    styleTag: 'fancy',
    styleLabel: 'Nổi Loạn',
    description: 'Cá tính gai góc, mầm non giang hồ, trùm trường tương lai.',
    fashionScore: 65,
    genderFit: 'boy',
  },
  {
    id: 'hair_braids_cute',
    name: 'Tết Bím Đôi Thùy Mị',
    category: 'hair',
    styleTag: 'casual',
    styleLabel: 'Bé Ngoan',
    description: 'Con nhà người ta, luôn giơ tay phát biểu và được cô giáo khen.',
    fashionScore: 40,
    genderFit: 'girl',
  },
  {
    id: 'hair_bald_monk',
    name: 'Đầu Trọc Bóng Lưỡng',
    category: 'hair',
    styleTag: 'sloppy',
    styleLabel: 'Siêu Bựa',
    description: 'Mát mẻ, đại ca tịnh tâm, không bao giờ lo chấy rận.',
    fashionScore: 30,
    genderFit: 'all',
  },
  {
    id: 'hair_bedhead_messy',
    name: 'Tổ Quạ Mới Ngủ Dậy',
    category: 'hair',
    styleTag: 'sloppy',
    styleLabel: 'Lười Biếng',
    description: 'Chúa lười, nghiện ngủ nướng, vừa ngáp vừa bước vào lớp.',
    fashionScore: 20,
    genderFit: 'all',
  },
  {
    id: 'hair_chom_dao',
    name: 'Chỏm Đào 3 Chỏm Dân Gian',
    category: 'hair',
    styleTag: 'casual',
    styleLabel: 'Hóm Hỉnh',
    description: 'Thần đồng tí hon, nhanh nhảu tinh anh như Trạng Tí.',
    fashionScore: 45,
    genderFit: 'all',
  },
  {
    id: 'hair_snapback_cap',
    name: 'Snapback Ngược Hiphop',
    category: 'hair',
    styleTag: 'fancy',
    styleLabel: 'Đường Phố',
    description: 'Dân bóng rổ nhí, ngầu đét với chiếc nón lưỡi trai đội ngược.',
    fashionScore: 58,
    genderFit: 'all',
  },
  {
    id: 'hair_mullet',
    name: 'Mullet Đuôi Dài Khí Chất',
    category: 'hair',
    styleTag: 'fancy',
    styleLabel: 'Tổng Tài',
    description: 'Dân bay mầm non, thần thái tổng tài cuốn hút mọi ánh nhìn.',
    fashionScore: 62,
    genderFit: 'all',
  },
];

// ==========================================
// 👀 8 KHUÔN MẶT & BIỂU CẢM
// ==========================================
export const FACE_OPTIONS: AssetOption[] = [
  {
    id: 'face_big_smile',
    name: 'Cười Tươi Tít Mắt',
    category: 'face',
    styleTag: 'casual',
    styleLabel: 'Hớn Hở',
    description: 'Nụ cười tỏa nắng rạng rỡ, tràn ngập năng lượng tích cực.',
    fashionScore: 40,
  },
  {
    id: 'face_sparkle_eyes',
    name: 'Mắt Tròn Long Lanh Anime',
    category: 'face',
    styleTag: 'fancy',
    styleLabel: 'Cute Hạt Me',
    description: 'Ánh mắt long lanh khiến không ai nỡ từ chối bất kỳ đòi hỏi nào.',
    fashionScore: 50,
  },
  {
    id: 'face_cool_shades',
    name: 'Kính Râm Đen Cực Ngầu',
    category: 'face',
    styleTag: 'fancy',
    styleLabel: 'Ngầu Lòi',
    description: 'Đeo kính râm đen bóng, khí chất đại ca trường mẫu giáo.',
    fashionScore: 60,
  },
  {
    id: 'face_nerdy_glasses',
    name: 'Kính Cận Tri Thức',
    category: 'face',
    styleTag: 'casual',
    styleLabel: 'Thần Đồng',
    description: 'Cặp kính tròn thông thái, nhìn là biết tương lai đỗ thủ khoa.',
    fashionScore: 45,
  },
  {
    id: 'face_playful_wink',
    name: 'Nháy Mắt Tinh Nghịch',
    category: 'face',
    styleTag: 'casual',
    styleLabel: 'Tinh Quái',
    description: 'Vừa nháy mắt vừa lên kế hoạch giấu dép của bạn cùng bàn.',
    fashionScore: 45,
  },
  {
    id: 'face_pouty_cheeks',
    name: 'Má Bánh Bao Hờn Dỗi',
    category: 'face',
    styleTag: 'casual',
    styleLabel: 'Dỗi Cả Thế Giới',
    description: 'Phồng má chu môi ửng hồng đòi kẹo mút.',
    fashionScore: 42,
  },
  {
    id: 'face_tongue_out',
    name: 'Thè Lưỡi Lêu Lêu',
    category: 'face',
    styleTag: 'sloppy',
    styleLabel: 'Trêu Chọc',
    description: 'Chuyên gia đi chọc ghẹo khiến bạn bè tức sôi máu.',
    fashionScore: 35,
  },
  {
    id: 'face_sleepy_eyes',
    name: 'Mắt Lim Dim Ngái Ngủ',
    category: 'face',
    styleTag: 'sloppy',
    styleLabel: 'Buồn Ngủ',
    description: 'Vừa đi vừa gật gà gật gù, chuẩn bị lăn ra sàn ngủ tiếp.',
    fashionScore: 25,
  },
];

// ==========================================
// 👕 20 LOẠI ÁO (TỪ LÔI THÔI ĐẾN SANG CHẢNH)
// ==========================================
export const SHIRT_OPTIONS: AssetOption[] = [
  // Lôi thôi (1-7)
  {
    id: 'shirt_sloppy_tanktop',
    name: 'Ba Lỗ Cháo Lòng Ố Vàng',
    category: 'shirt',
    styleTag: 'sloppy',
    styleLabel: 'Ố Vàng',
    description: 'Chiếc áo ba lỗ huyền thoại mặc từ thời anh trai truyền lại.',
    fashionScore: 10,
  },
  {
    id: 'shirt_food_stain',
    name: 'Áo Dính Vết Tương Cà',
    category: 'shirt',
    styleTag: 'sloppy',
    styleLabel: 'Dính Bẩn',
    description: 'Chiến tích oanh liệt sau trận chiến với đĩa xúc xích rán.',
    fashionScore: 15,
  },
  {
    id: 'shirt_stretched_collar',
    name: 'Áo Thun Giãn Cổ Trễ Nải',
    category: 'shirt',
    styleTag: 'sloppy',
    styleLabel: 'Cổ Rộng',
    description: 'Cổ áo kéo rộng ngoác hở cả vai, gió lùa mát rười rượi.',
    fashionScore: 18,
  },
  {
    id: 'shirt_backwards',
    name: 'Áo Mặc Lộn Cổ Ra Sau',
    category: 'shirt',
    styleTag: 'sloppy',
    styleLabel: 'Ngược Đời',
    description: 'Sáng dậy mắt nhắm mắt mở tự mặc đồ không thèm nhìn gương.',
    fashionScore: 20,
  },
  {
    id: 'shirt_ripped_punk',
    name: 'Áo Rách Tưa Một Bên Tay',
    category: 'shirt',
    styleTag: 'sloppy',
    styleLabel: 'Rách Rưới',
    description: 'Hậu quả sau trận vật lộn tranh giành cầu trượt ở sân trường.',
    fashionScore: 22,
  },
  {
    id: 'shirt_superhero_fake',
    name: 'Siêu Nhân Nhện Pha Ke 30k',
    category: 'shirt',
    styleTag: 'sloppy',
    styleLabel: 'Hàng Chợ',
    description: 'Áo siêu nhân mua ở chợ quê, hình in méo xẹo nhưng bé rất tự hào.',
    fashionScore: 28,
  },
  {
    id: 'shirt_duck_bib',
    name: 'Áo Kèm Yếm Vịt Ăn Dặm',
    category: 'shirt',
    styleTag: 'sloppy',
    styleLabel: 'Chưa Cai Bột',
    description: 'Vừa xúc vội bát cháo đã bị bố mẹ túm gáy tống đi học.',
    fashionScore: 25,
  },

  // Đời thường / Năng động (8-14)
  {
    id: 'shirt_kindergarten_standard',
    name: 'Đồng Phục Cổ Sen Mầm Non',
    category: 'shirt',
    styleTag: 'casual',
    styleLabel: 'Bé Ngoan',
    description: 'Áo vàng viền xanh navy chuẩn mực học sinh gương mẫu.',
    fashionScore: 40,
  },
  {
    id: 'shirt_dino_roar',
    name: 'Áo Khủng Long Bạo Chúa T-Rex',
    category: 'shirt',
    styleTag: 'casual',
    styleLabel: 'Dũng Mãnh',
    description: 'Màu xanh lá rực rỡ, gầm gừ khắp mọi ngóc ngách lớp học.',
    fashionScore: 48,
  },
  {
    id: 'shirt_cr7_football',
    name: 'Áo Đấu CR7 Đỏ Chói Lọi',
    category: 'shirt',
    styleTag: 'casual',
    styleLabel: 'SIUUU',
    description: 'Áo bóng đá số 7, gặp ai cũng bật nhảy hô vang SIUUU!',
    fashionScore: 50,
  },
  {
    id: 'shirt_messi_argentina',
    name: 'Áo Sọc Xanh Trắng M10',
    category: 'shirt',
    styleTag: 'casual',
    styleLabel: 'Huyền Thoại',
    description: 'Fan cứng Messi, chạy lon ton rê bóng nhựa quanh sân.',
    fashionScore: 50,
  },
  {
    id: 'shirt_bear_hoodie',
    name: 'Áo Nỉ Hoodie Tai Gấu Bông',
    category: 'shirt',
    styleTag: 'casual',
    styleLabel: 'Gấu Con',
    description: 'Mũ có tai gấu tròn xinh, nhìn mũm mĩm ai cũng muốn nựng.',
    fashionScore: 45,
  },
  {
    id: 'shirt_hawaii_floral',
    name: 'Sơ Mi Hawaii Hoa Lá Cành',
    category: 'shirt',
    styleTag: 'casual',
    styleLabel: 'Nghỉ Dưỡng',
    description: 'Phong cách dân chơi nghỉ dưỡng, hoa cúc hoa dâm bụt rực rỡ.',
    fashionScore: 46,
  },
  {
    id: 'shirt_striped_polo',
    name: 'Áo Polo Kẻ Cổ Bẻ',
    category: 'shirt',
    styleTag: 'casual',
    styleLabel: 'Ông Cụ Non',
    description: 'Đứng đắn, chững chạc như một doanh nhân nhí 4 tuổi.',
    fashionScore: 42,
  },

  // Sang chảnh / Con nhà giàu (15-20)
  {
    id: 'shirt_rich_suit_vest',
    name: 'Gile Vest Mini Thắt Nơ Đỏ',
    category: 'shirt',
    styleTag: 'fancy',
    styleLabel: 'Tổng Tài Nhí',
    description: 'Cậu ấm tập đoàn nghìn tỷ, đi học bằng trực thăng riêng.',
    fashionScore: 75,
  },
  {
    id: 'shirt_princess_elsa',
    name: 'Váy Elsa Băng Giá Kim Tuyến',
    category: 'shirt',
    styleTag: 'fancy',
    styleLabel: 'Công Chúa',
    description: 'Lấp lánh băng tuyết, quyền lực tuyệt đối ở góc búp bê.',
    fashionScore: 70,
  },
  {
    id: 'shirt_sailor_suit',
    name: 'Thủy Thủ Hoàng Gia Ruy Băng',
    category: 'shirt',
    styleTag: 'fancy',
    styleLabel: 'Quốc Tế',
    description: 'Đồng phục trường quốc tế quý tộc học phí trăm triệu một tháng.',
    fashionScore: 68,
  },
  {
    id: 'shirt_luxury_tweed',
    name: 'Áo Dạ Tweed Quý Cô Nhí',
    category: 'shirt',
    styleTag: 'fancy',
    styleLabel: 'Tiểu Thư',
    description: 'Phong cách Paris đài các, sang chảnh không tì vết.',
    fashionScore: 72,
  },
  {
    id: 'shirt_leather_jacket',
    name: 'Áo Khoác Da Biker Mini',
    category: 'shirt',
    styleTag: 'fancy',
    styleLabel: 'Rocker Nhí',
    description: 'Khóa kéo kim loại hầm hố, cưỡi xe đạp 3 bánh gầm rú.',
    fashionScore: 65,
  },
  {
    id: 'shirt_golden_dragon',
    name: 'Gấm Hoàng Gia Thêu Rồng Vàng',
    category: 'shirt',
    styleTag: 'fancy',
    styleLabel: 'Phú Nhị Đại',
    description: 'Áo gấm cung đình thêu chỉ vàng lộng lẫy, vương giả ngút ngàn.',
    fashionScore: 80,
  },
];

// ==========================================
// 🩳 20 LOẠI QUẦN & VÁY (TỪ BỰA ĐẾN XỊN)
// ==========================================
export const PANTS_OPTIONS: AssetOption[] = [
  // Lôi thôi (1-7)
  {
    id: 'pants_hole_butt',
    name: 'Quần Đùi Thủng Đít Gió Lùa',
    category: 'pants',
    styleTag: 'sloppy',
    styleLabel: 'Thủng Đít',
    description: 'Đỉnh cao thông thoáng, tiện lợi mỗi khi cần đi vệ sinh gấp.',
    fashionScore: 10,
  },
  {
    id: 'pants_droopy_pajamas',
    name: 'Quần Pijama Quét Đất',
    category: 'pants',
    styleTag: 'sloppy',
    styleLabel: 'Quá Khổ',
    description: 'Mặc nhầm quần của bố, vừa chạy vừa vấp ngã dập mũi.',
    fashionScore: 15,
  },
  {
    id: 'pants_diaper_bulge',
    name: 'Quần Đùi Lòi Bỉm Phồng Tướng',
    category: 'pants',
    styleTag: 'sloppy',
    styleLabel: 'Căng Bỉm',
    description: 'Chưa cai bỉm thành công, đi lạch bạch như chú vịt bầu.',
    fashionScore: 18,
  },
  {
    id: 'pants_floral_boxer',
    name: 'Quần Đùi Hoa Chợ Đầu Mối',
    category: 'pants',
    styleTag: 'sloppy',
    styleLabel: 'Hoa Hòe',
    description: 'Họa tiết hoa cúc hoa hồng sặc sỡ phong cách bà ngoại.',
    fashionScore: 20,
  },
  {
    id: 'pants_stained_knees',
    name: 'Quần Đầu Gối Dính Bùn Đất',
    category: 'pants',
    styleTag: 'sloppy',
    styleLabel: 'Bẩn Gối',
    description: 'Bò trườn thám hiểm gầm giường khiến hai gối đen sì.',
    fashionScore: 16,
  },
  {
    id: 'pants_reversed',
    name: 'Quần Mặc Lộn Trái Phơi Mác',
    category: 'pants',
    styleTag: 'sloppy',
    styleLabel: 'Lộn Trái',
    description: 'Đường may và mác vải phơi ra ngoài cực kỳ ngáo ngơ.',
    fashionScore: 22,
  },
  {
    id: 'pants_elastic_loose',
    name: 'Quần Thun Nhão Tụt Hông',
    category: 'pants',
    styleTag: 'sloppy',
    styleLabel: 'Tụt Chun',
    description: 'Chun quần rão ngoét, vừa chạy vừa phải một tay túm cạp.',
    fashionScore: 14,
  },

  // Đời thường / Năng động (8-14)
  {
    id: 'pants_uniform_navy',
    name: 'Quần Soóc Đồng Phục Xanh',
    category: 'pants',
    styleTag: 'casual',
    styleLabel: 'Đồng Phục',
    description: 'Ngay ngắn, nghiêm chỉnh, chuẩn tác phong học sinh gương mẫu.',
    fashionScore: 40,
  },
  {
    id: 'pants_sport_jogger',
    name: 'Quần Nỉ Bo Gấu 3 Sọc',
    category: 'pants',
    styleTag: 'casual',
    styleLabel: 'Thể Thao',
    description: 'Siêu co giãn, sẵn sàng bứt tốc tranh giành đồ chơi giờ ra chơi.',
    fashionScore: 45,
  },
  {
    id: 'pants_denim_dungarees',
    name: 'Quần Yếm Bò Jeans Quai Cài',
    category: 'pants',
    styleTag: 'casual',
    styleLabel: 'Bụi Bặm',
    description: 'Phong cách chú thợ sửa ống nước Mario siêu ngộ nghĩnh.',
    fashionScore: 50,
  },
  {
    id: 'pants_cartoon_sponge',
    name: 'Quần Đùi Bọt Biển Spongebob',
    category: 'pants',
    styleTag: 'casual',
    styleLabel: 'Vui Nhộn',
    description: 'Màu vàng rực rỡ in hình chú bọt biển cười toe toét.',
    fashionScore: 44,
  },
  {
    id: 'pants_camo_cargo',
    name: 'Quần Túi Hộp Rằn Ri Rừng Rậm',
    category: 'pants',
    styleTag: 'casual',
    styleLabel: 'Thám Hiểm',
    description: 'Hai túi hộp to đùng nhét đầy bi ve, kẹo ngậm và sỏi đá.',
    fashionScore: 48,
  },
  {
    id: 'pants_basketball_mesh',
    name: 'Quần Lưới Bóng Rổ Số 23',
    category: 'pants',
    styleTag: 'casual',
    styleLabel: 'Baller Nhí',
    description: 'Thoáng khí, phong cách cầu thủ bóng rổ nhà nghề tương lai.',
    fashionScore: 46,
  },
  {
    id: 'pants_khaki_chinos',
    name: 'Quần Soóc Kaki Be Lịch Lãm',
    category: 'pants',
    styleTag: 'casual',
    styleLabel: 'Thanh Lịch',
    description: 'Lịch sự trang nhã, đúng chất con ngoan trò giỏi.',
    fashionScore: 45,
  },

  // Sang chảnh / Xinh xắn (15-20)
  {
    id: 'pants_tuxedo_slacks',
    name: 'Quần Tây Âu Là Ly Thẳng Tắp',
    category: 'pants',
    styleTag: 'fancy',
    styleLabel: 'Quý Ông',
    description: 'Thắt lưng da bóng lộn, phối cùng vest tạo nên tổng tài quyền uy.',
    fashionScore: 70,
  },
  {
    id: 'pants_pleated_tartan',
    name: 'Chân Váy Xếp Ly Caro Anh Quốc',
    category: 'pants',
    styleTag: 'fancy',
    styleLabel: 'Quý Tộc',
    description: 'Họa tiết ca rô đỏ phong cách học viện quý tộc hoàng gia.',
    fashionScore: 68,
  },
  {
    id: 'pants_tutu_ballerina',
    name: 'Váy Xòe Phồng Voan Ren Công Chúa',
    category: 'pants',
    styleTag: 'fancy',
    styleLabel: 'Thiên Nga',
    description: 'Bồng bềnh óng ánh như thiên nga múa vũ khúc ballet.',
    fashionScore: 72,
  },
  {
    id: 'pants_white_linen',
    name: 'Quần Đũi Trắng Du Thuyền Thượng Lưu',
    category: 'pants',
    styleTag: 'fancy',
    styleLabel: 'Rich Kid',
    description: 'Quý tử ngậm thìa vàng, phong thái thanh tao không vướng bụi trần.',
    fashionScore: 75,
  },
  {
    id: 'pants_leather_moto',
    name: 'Quần Da Đen Bóng Hầm Hố',
    category: 'pants',
    styleTag: 'fancy',
    styleLabel: 'Biker Chiến',
    description: 'Chiến đét, phối cùng áo khoác da biker là chuẩn tay chơi.',
    fashionScore: 65,
  },
  {
    id: 'pants_gold_silk',
    name: 'Quần Lụa Tơ Tằm Hoàng Cung',
    category: 'pants',
    styleTag: 'fancy',
    styleLabel: 'Vương Giả',
    description: 'Lụa vàng mềm mại óng ả nâng niu làn da nhạy cảm.',
    fashionScore: 80,
  },
];

// ==========================================
// 👟 6 ĐÔI GIÀY
// ==========================================
export const SHOES_OPTIONS: AssetOption[] = [
  {
    id: 'shoes_lightup_red',
    name: 'Sneaker Đỏ Đèn LED Phát Sáng',
    category: 'shoes',
    styleTag: 'fancy',
    styleLabel: 'Phát Sáng',
    description: 'Mỗi bước dậm chân đèn LED lại nhấp nháy 7 màu cực ngầu.',
    fashionScore: 55,
  },
  {
    id: 'shoes_pink_bow',
    name: 'Búp Bê Quai Nơ Hồng Điệu Đà',
    category: 'shoes',
    styleTag: 'fancy',
    styleLabel: 'Điệu Xinh',
    description: 'Giày da bóng quai nơ công chúa, đi êm ái nhẹ như mây.',
    fashionScore: 50,
  },
  {
    id: 'shoes_bitis_sandals',
    name: 'Dép Quai Hậu Biti\'s Siêu Bền',
    category: 'shoes',
    styleTag: 'casual',
    styleLabel: 'Nâng Niu Bàn Chân',
    description: 'Huyền thoại học đường Việt Nam, đá bóng chạy nhảy không sợ đứt.',
    fashionScore: 40,
  },
  {
    id: 'shoes_yellow_boots',
    name: 'Ủng Cao Su Vàng Chống Nước',
    category: 'shoes',
    styleTag: 'casual',
    styleLabel: 'Lội Mưa',
    description: 'Bất chấp mọi vũng bùn lầy, thỏa sức nhảy nhót ngày mưa.',
    fashionScore: 42,
  },
  {
    id: 'shoes_white_kicks',
    name: 'Sneaker Trắng Basic Phong Cách',
    category: 'shoes',
    styleTag: 'casual',
    styleLabel: 'Thời Thượng',
    description: 'Trắng tinh khôi, phối với bất kỳ bộ đồ nào cũng đẹp.',
    fashionScore: 45,
  },
  {
    id: 'shoes_shark_slippers',
    name: 'Dép Cá Mập Bánh Mì Há Miệng',
    category: 'shoes',
    styleTag: 'sloppy',
    styleLabel: 'Siêu Hài',
    description: 'Miệng cá mập há hốc răng cắn chân, nhìn là bật cười.',
    fashionScore: 35,
  },
];

// ==========================================
// 🎒 6 PHỤ KIỆN
// ==========================================
export const ACCESSORY_OPTIONS: AssetOption[] = [
  {
    id: 'acc_egg_backpack',
    name: 'Balo Quả Trứng Vàng Mầm Non',
    category: 'accessory',
    styleTag: 'casual',
    styleLabel: 'Balo Trứng',
    description: 'Balo vỏ cứng quả trứng, đựng hộp sữa, bánh quy và thú bông.',
    fashionScore: 45,
  },
  {
    id: 'acc_duck_bucket_hat',
    name: 'Mũ Vành Vịt Con Che Nắng',
    category: 'accessory',
    styleTag: 'casual',
    styleLabel: 'Vịt Vàng',
    description: 'Mũ tai bèo tròn xoe có mỏ vịt nhô ra ngộ nghĩnh.',
    fashionScore: 40,
  },
  {
    id: 'acc_good_kid_medal',
    name: 'Huy Hiệu Hoa Bé Ngoan Tự Hào',
    category: 'accessory',
    styleTag: 'fancy',
    styleLabel: 'Bé Ngoan',
    description: 'Huy hiệu bông hoa đỏ rực cài ngực, niềm kiêu hãnh của cả họ.',
    fashionScore: 50,
  },
  {
    id: 'acc_giant_lollipop',
    name: 'Cây Kẹo Mút Cầu Vồng Khổng Lồ',
    category: 'accessory',
    styleTag: 'sloppy',
    styleLabel: 'Mút Kẹo',
    description: 'To hơn cả khuôn mặt, mút từ sáng tới chiều chưa hết.',
    fashionScore: 35,
  },
  {
    id: 'acc_dino_water_bottle',
    name: 'Bình Nước Khủng Long Đeo Chéo',
    category: 'accessory',
    styleTag: 'casual',
    styleLabel: 'Khủng Long',
    description: 'Bình nước có ống hút silicon hình chú khủng long con.',
    fashionScore: 38,
  },
  {
    id: 'none',
    name: 'Không Đeo Phụ Kiện',
    category: 'accessory',
    styleTag: 'casual',
    styleLabel: 'Đơn Giản',
    description: 'Nhẹ nhàng thanh thoát, không mang vác gì trên người.',
    fashionScore: 20,
  },
];

// ==========================================
// 🌟 TÍNH ĐIỂM & DANH HIỆU THỜI TRANG (FASHION RANK)
// ==========================================
export interface FashionRankInfo {
  totalScore: number;
  title: string;
  rankBadge: string;
  comment: string;
}

export function getOutfitFashionRank(config: CharacterAvatarConfig): FashionRankInfo {
  const hair = HAIR_OPTIONS.find((h) => h.id === config.hairId);
  const face = FACE_OPTIONS.find((f) => f.id === config.faceId);
  const shirt = SHIRT_OPTIONS.find((s) => s.id === config.shirtId);
  const pants = PANTS_OPTIONS.find((p) => p.id === config.pantsId);
  const shoes = SHOES_OPTIONS.find((sh) => sh.id === config.shoesId);
  const acc = ACCESSORY_OPTIONS.find((a) => a.id === config.accessoryId);

  const totalScore =
    (hair?.fashionScore || 40) +
    (face?.fashionScore || 40) +
    (shirt?.fashionScore || 40) +
    (pants?.fashionScore || 40) +
    (shoes?.fashionScore || 40) +
    (acc?.fashionScore || 20);

  // Đếm số lượng món đồ lôi thôi vs sang chảnh
  const items = [hair, face, shirt, pants, shoes, acc].filter(Boolean);
  const sloppyCount = items.filter((i) => i?.styleTag === 'sloppy').length;
  const fancyCount = items.filter((i) => i?.styleTag === 'fancy').length;

  if (sloppyCount >= 3) {
    return {
      totalScore,
      title: 'Chúa Tể Lôi Thôi • Thánh Bựa Mầm Non',
      rankBadge: '🗑️ Bựa Đỉnh Nóc',
      comment: 'Bố mẹ nhìn thấy chỉ biết thở dài ngao ngán, nhưng bạn bè ai cũng cười đau ruột!',
    };
  }

  if (fancyCount >= 3 || totalScore >= 320) {
    return {
      totalScore,
      title: 'Tổng Tài Nhí • Fashionista Quý Tộc',
      rankBadge: '👑 Thần Thái Sang Chảnh',
      comment: 'Vừa bước vào cổng trường là cả sân trường phải ngoái nhìn ngưỡng mộ!',
    };
  }

  if (config.shirtId === 'shirt_kindergarten_standard' && config.pantsId === 'pants_uniform_navy') {
    return {
      totalScore,
      title: 'Học Sinh Gương Mẫu • Cháu Ngoan Bác Hồ',
      rankBadge: '⭐ Bé Ngoan Chuẩn Mực',
      comment: 'Đồng phục phẳng phiu ngay ngắn, cô giáo mầm non chấm ngay 10 điểm chuyên cần!',
    };
  }

  return {
    totalScore,
    title: 'Dân Chơi Mầm Non • Tự Tin Khoe Cá Tính',
    rankBadge: '✨ Năng Động Hồn Nhiên',
    comment: 'Phong cách thoải mái, chạy nhảy vui chơi hết mình cùng bạn bè!',
  };
}

// Cấu hình mặc định
export const DEFAULT_AVATAR_CONFIG: CharacterAvatarConfig = {
  skinTone: '#FFE8D6',
  hairId: 'hair_spiky_cool',
  hairColor: '#22202A',
  faceId: 'face_big_smile',
  shirtId: 'shirt_kindergarten_standard',
  pantsId: 'pants_uniform_navy',
  shoesId: 'shoes_bitis_sandals',
  accessoryId: 'acc_egg_backpack',
  ageStage: 'kindergarten',
  heightScale: 1.0,
  legScale: 1.0,
  headScale: 1.0,
};

// Hàm bốc ngẫu nhiên outfit
export function getRandomAvatarConfig(gender: 'male' | 'female' = 'male'): CharacterAvatarConfig {
  const filteredHairs = HAIR_OPTIONS.filter((h) => !h.genderFit || h.genderFit === 'all' || (gender === 'female' ? h.genderFit === 'girl' : h.genderFit === 'boy'));
  const randomHair = filteredHairs[Math.floor(Math.random() * filteredHairs.length)] || HAIR_OPTIONS[0];
  const randomColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  const randomSkin = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const randomFace = FACE_OPTIONS[Math.floor(Math.random() * FACE_OPTIONS.length)];
  const randomShirt = SHIRT_OPTIONS[Math.floor(Math.random() * SHIRT_OPTIONS.length)];
  const randomPants = PANTS_OPTIONS[Math.floor(Math.random() * PANTS_OPTIONS.length)];
  const randomShoes = SHOES_OPTIONS[Math.floor(Math.random() * SHOES_OPTIONS.length)];
  const randomAcc = ACCESSORY_OPTIONS[Math.floor(Math.random() * ACCESSORY_OPTIONS.length)];

  return {
    skinTone: randomSkin.hex,
    hairId: randomHair.id,
    hairColor: randomColor.hex,
    faceId: randomFace.id,
    shirtId: randomShirt.id,
    pantsId: randomPants.id,
    shoesId: randomShoes.id,
    accessoryId: randomAcc.id,
    ageStage: 'kindergarten',
    heightScale: 1.0,
    legScale: 1.0,
    headScale: 1.0,
  };
}
