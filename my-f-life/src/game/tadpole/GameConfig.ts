export interface GameConfigType {
  BOT_COUNT: number;
  BOT_BASE_SPEED: number;
  PLAYER_SPEED_MULTIPLIER: number;
  BOUNDARY_SLOW_FACTOR: number;
  BOUNDARY_SLOW_DURATION: number;
  TRACK_WIDTH: number;
  TRACK_LENGTH: number;
  TADPOLE_RADIUS: number;
  COUNTDOWN_SECONDS: number;
  TARGET_FPS: number;
  SPIKE_COUNT: number;
  SPIKE_RADIUS: number;
  SPIKE_STUN_DURATION: number;
}

export const GAME_CONFIG: GameConfigType = {
  BOT_COUNT: 20, // 1 Player + 20 BOTs = 21 Tadpoles
  BOT_BASE_SPEED: 260, // pixels per second
  PLAYER_SPEED_MULTIPLIER: 1.07, // Player is 1.07x faster than base BOT
  BOUNDARY_SLOW_FACTOR: 0.5, // 50% speed penalty on boundary contact
  BOUNDARY_SLOW_DURATION: 500, // 500ms slow duration
  TRACK_WIDTH: 720, // Default width of the race track in world units
  TRACK_LENGTH: 7600, // Total track distance to the egg (~30-35s intense race)
  TADPOLE_RADIUS: 14, // Collision & visual radius
  COUNTDOWN_SECONDS: 3,
  TARGET_FPS: 60,
  SPIKE_COUNT: 22, // Number of spike hazards placed along the track
  SPIKE_RADIUS: 24, // Collision radius of spike hazard
  SPIKE_STUN_DURATION: 1000, // 1000ms (1.0s) stun when hitting spike
};

export interface EliteBotProfile {
  title: string;
  description: string;
  taunt: string;
}

export const ELITE_BOT_PROFILES: EliteBotProfile[] = [
  {
    title: 'Nòng Nọc Tỷ Phú Đô La',
    description: 'Sinh ra đã ở vạch đích, tài sản nghìn tỷ!',
    taunt: 'Nòng nọc người thường sao đọ lại gia thế ngút trời của tỷ phú!',
  },
  {
    title: 'Nòng Nọc Chủ Tịch / Doanh Nhân',
    description: 'Đỉnh nóc kịch trần, ra quyết định triệu đô mỗi giây!',
    taunt: 'Tốc độ ký hợp đồng triệu đô nhanh hơn bạn bơi nhiều!',
  },
  {
    title: 'Nòng Nọc Bác Sĩ Trưởng Khoa',
    description: 'Bàn tay vàng nắm giữ sinh mệnh nhân loại!',
    taunt: 'Bác sĩ đã nhanh tay đón lấy noãn bào trước bạn rồi!',
  },
  {
    title: 'Nòng Nọc Rapper Triệu View',
    description: 'Bắn flow mượt mà, fan cuồng xếp hàng dài!',
    taunt: 'Flow bơi lội đỉnh chóp thế này thì người thường chỉ có hít khói!',
  },
  {
    title: 'Nòng Nọc Gia Chủ Nhà Mặt Phố',
    description: 'Đầu thai đúng quy trình, ngồi thu tiền trọ đầu tháng!',
    taunt: 'Slot nhà mặt phố đã có chủ, bạn bơi chậm ráng chịu!',
  },
  {
    title: 'Nòng Nọc Siêu Sao Idol K-Pop',
    description: 'Visual phát sáng, sinh ra để làm idol quốc dân!',
    taunt: 'Hào quang nhân vật chính của Idol đã cướp mất ánh sáng của bạn!',
  },
  {
    title: 'Nòng Nọc Thủ Khoa Olympia',
    description: 'Não to vô cực, tính toán góc bo cua chuẩn từng milimet!',
    taunt: 'Đã tính toán quỹ đạo hoàn hảo để cướp noãn bào trên tay bạn!',
  },
  {
    title: 'Nòng Nọc Chiến Thần Crypto',
    description: 'Mua đáy bán đỉnh, tài khoản x100 sau một đêm!',
    taunt: 'Tốc độ bắt đáy noãn bào chuẩn xác không trượt phát nào!',
  },
  {
    title: 'Nòng Nọc Phi Hành Gia NASA',
    description: 'Sinh ra để chinh phục những vì sao xa xôi!',
    taunt: 'Tốc độ tên lửa vũ trụ đã bỏ xa nòng nọc người thường!',
  },
  {
    title: 'Nòng Nọc Vận Động Viên Vô Địch',
    description: 'Thể lực vô biên, bơi xé toạc làn sóng!',
    taunt: 'Kình ngư đẳng cấp thế giới đã hẫng mất tấm vé của bạn!',
  },
  {
    title: 'Nòng Nọc Tổng Tài Lạnh Lùng',
    description: 'Không nói nhiều, chỉ dùng ánh mắt để chốt deal!',
    taunt: 'Tổng tài không cần bơi nhanh, số phận tự đưa noãn bào đến!',
  },
  {
    title: 'Nòng Nọc CEO 8X',
    description: 'Sáng lập 7 công ty, 6 công ty chưa ai biết tên!',
    taunt: 'Bạn còn đang bơi, người ta đã gọi vốn vòng Series A rồi!',
  },
  {
    title: 'Nòng Nọc TikToker Triệu Follow',
    description: 'Bơi một vòng lên xu hướng, view tự tăng!',
    taunt: 'Bạn đua để thắng, nó đua để lên xu hướng!',
  },
  {
    title: 'Nòng Nọc Streamer Top 1',
    description: 'Vừa bơi vừa gáy, donate vẫn nổ liên tục!',
    taunt: 'Bạn đang cố thắng, nó đang livestream cảnh bạn thua!',
  },
  {
    title: 'Nòng Nọc Hacker Mũ Trắng',
    description: 'Không hack game, chỉ hack thẳng vận mệnh!',
    taunt: 'Ping của bạn 999ms, ping của người ta đã ở tương lai!',
  },
  {
    title: 'Nòng Nọc Cao Thủ Cờ Vua',
    description: 'Nhìn trước 37 nước, cua góc không bao giờ sai!',
    taunt: 'Bạn mới nghĩ đường bơi, nó đã tính xong cả cuộc đời bạn!',
  },
  {
    title: 'Nòng Nọc Thầy Bói Online',
    description: 'Nhìn một phát biết ngay hôm nay ai về nhì!',
    taunt: 'Thầy đã xem quẻ và thấy bạn không có cửa!',
  },
  {
    title: 'Nòng Nọc Pháp Sư Tối Thượng',
    description: 'Không cần bơi, dùng phép thuật để dịch chuyển!',
    taunt: 'Bạn đang bơi bằng cơ bắp, nó đang bơi bằng ma pháp!',
  },
  {
    title: 'Nòng Nọc Siêu Nhân',
    description: 'Sức mạnh vượt giới hạn, tốc độ vượt định luật vật lý!',
    taunt: 'Định luật vật lý cũng bó tay trước tốc độ này!',
  },
  {
    title: 'Nòng Nọc Flash',
    description: 'Chớp mắt một cái, đã không thấy đâu!',
    taunt: 'Bạn vừa định vượt thì nó đã về đích từ kiếp trước!',
  },
  {
    title: 'Nòng Nọc Ninja',
    description: 'Ẩn thân giữa dòng nước, xuất hiện ngay tại vạch đích!',
    taunt: 'Bạn không thua tốc độ, bạn thua khả năng tàng hình!',
  },
  {
    title: 'Nòng Nọc Đầu Bếp Michelin',
    description: 'Nấu món gì cũng ngon, cua góc nào cũng mượt!',
    taunt: 'Người ta nấu ăn 3 sao, bạn bơi còn chưa nổi 1 sao!',
  },
  {
    title: 'Nòng Nọc Thợ Săn Tiền Thưởng',
    description: 'Thấy mục tiêu là lao tới, không hỏi lý do!',
    taunt: 'Noãn bào đã nằm trong tầm ngắm thì chạy đằng trời!',
  },
  {
    title: 'Nòng Nọc Công An Tốc Độ',
    description: 'Bắt mọi đối tượng trước khi đối tượng kịp chạy!',
    taunt: 'Bạn tưởng đang đua, thật ra đang bị áp giải về đích!',
  },
  {
    title: 'Nòng Nọc Shipper Quốc Dân',
    description: 'Đơn ở đâu, anh có mặt ở đó!',
    taunt: 'Đơn noãn bào giao hỏa tốc, bạn đặt thường nên đến sau!',
  },
  {
    title: 'Nòng Nọc Grab Premium',
    description: 'Đón tận nơi, giao tận đích, không bao giờ trễ chuyến!',
    taunt: 'Bạn còn đang tìm đường, tài xế đã giao thành công!',
  },
  {
    title: 'Nòng Nọc Thầy Giáo Làng',
    description: 'Dạy đời 24/7, kiến thức không thiếu chỉ thiếu học sinh!',
    taunt: 'Bài học hôm nay: bơi chậm thì mất noãn bào!',
  },
  {
    title: 'Nòng Nọc Sinh Viên Năm Cuối',
    description: 'Deadline dí đến đâu, tốc độ tăng đến đó!',
    taunt: 'Deadline còn chưa dí bạn mà nó đã về đích rồi!',
  },
  {
    title: 'Nòng Nọc Intern 3 Năm Kinh Nghiệm',
    description: 'CV chưa có gì nhưng kinh nghiệm thì vô hạn!',
    taunt: 'Bạn còn đang thử việc, nó đã lên chức từ lâu rồi!',
  },
  {
    title: 'Nòng Nọc IT Fullstack',
    description: 'Frontend, Backend, DevOps... cái gì cũng cân!',
    taunt: 'Bạn còn đang debug đường bơi, nó đã deploy lên production!',
  },
  {
    title: 'Nòng Nọc Bug Hunter',
    description: 'Không có bug nào thoát khỏi đôi mắt tinh tường!',
    taunt: 'Nó vừa tìm thấy bug trong tốc độ của bạn!',
  },
  {
    title: 'Nòng Nọc DevOps',
    description: 'Build nhanh, deploy nhanh, về đích nhanh!',
    taunt: 'CI/CD của nó chạy xong trước khi bạn load xong game!',
  },
  {
    title: 'Nòng Nọc Designer Figma',
    description: 'Auto layout chuẩn từng pixel, bơi cũng phải đẹp!',
    taunt: 'Bạn bơi tự do, nó bơi theo đúng grid!',
  },
  {
    title: 'Nòng Nọc Photographer',
    description: 'Bắt đúng khoảnh khắc vàng trong từng chuyển động!',
    taunt: 'Nó đã chụp được khoảnh khắc bạn về nhì!',
  },
  {
    title: 'Nòng Nọc Influencer',
    description: 'Không cần chạy quảng cáo, tự nhiên đã viral!',
    taunt: 'Bạn về đích không ai biết, nó về đích cả server biết!',
  },
  {
    title: 'Nòng Nọc Hoàng Tử',
    description: 'Sinh ra trong nhung lụa, bơi có người mở đường!',
    taunt: 'Bạn tự bơi, hoàng tử có cả đoàn tùy tùng hộ tống!',
  },
  {
    title: 'Nòng Nọc Công Chúa',
    description: 'Không cần chiến đấu, spotlight tự tìm đến!',
    taunt: 'Bạn đang đua tốc độ, công chúa đang đua độ hào nhoáng!',
  },
  {
    title: 'Nòng Nọc Thái Tử',
    description: 'Ngôi vị đã định sẵn, cuộc đua chỉ là thủ tục!',
    taunt: 'Kết quả đã được triều đình phê duyệt từ đầu!',
  },
  {
    title: 'Nòng Nọc Con Nhà Người Ta',
    description: '5 tuổi biết bơi, 6 tuổi biết đầu tư, 7 tuổi mua nhà!',
    taunt: 'Mẹ bạn lại vừa hỏi: “Bao giờ con mới được như người ta?”',
  },
  {
    title: 'Nòng Nọc Nhân Vật Chính',
    description: 'Plot armor dày hơn cả thành hồ!',
    taunt: 'Bạn là NPC mà đòi tranh spotlight với nhân vật chính à?',
  },
  {
    title: 'Nòng Nọc NPC Hệ Thống',
    description: 'Không có cốt truyện nhưng tốc độ thì có thừa!',
    taunt: 'NPC hôm nay quyết định phá game một chút!',
  },
  {
    title: 'Nòng Nọc Main Character',
    description: 'Camera tự động zoom, nhạc nền tự động nổi!',
    taunt: 'Bạn vừa xuất hiện đã thành nhân vật phụ!',
  },
  {
    title: 'Nòng Nọc Có Quý Nhân Phù Trợ',
    description: 'Đi đâu cũng có người nâng đỡ!',
    taunt: 'Bạn tự lực cánh sinh, nó có buff từ vũ trụ!',
  },
  {
    title: 'Nòng Nọc Hệ May Mắn',
    description: 'Không cần kỹ năng, vận may tự lo tất cả!',
    taunt: 'Bạn luyện kỹ năng cả đời, nó quay random vẫn thắng!',
  },
  {
    title: 'Nòng Nọc Hệ Con Ông Cháu Cha',
    description: 'Sinh ra đã có sẵn buff gia thế +999!',
    taunt: 'Bạn cày skill, nó cày từ cây gia phả!',
  },
  {
    title: 'Nòng Nọc Vua Cua Góc',
    description: 'Góc nào cũng cua, đường nào cũng thắng!',
    taunt: 'Bạn ôm tường, nó ôm luôn chức vô địch!',
  },
  {
    title: 'Nòng Nọc Không Có Ping',
    description: 'Phản xạ nhanh hơn cả tốc độ mạng!',
    taunt: 'Bạn đang lag, nó đang sống ở server riêng!',
  },
  {
    title: 'Nòng Nọc Wi-Fi 6',
    description: 'Kết nối siêu tốc, phản hồi gần như bằng 0!',
    taunt: 'Ping thấp thì bơi khác hẳn người thường!',
  },
  {
    title: 'Nòng Nọc 5G',
    description: 'Tốc độ truyền dữ liệu không ai theo kịp!',
    taunt: 'Bạn còn đang loading, nó đã finished!',
  },
  {
    title: 'Nòng Nọc Buff Full',
    description: 'Damage, speed, luck đều max cấp!',
    taunt: 'Bạn vào game bằng tay không, nó vào game bằng full đồ!',
  },
  {
    title: 'Nòng Nọc Cheat Code',
    description: 'Không biết chơi nhưng biết nhập mã!',
    taunt: 'Kỹ năng không quan trọng khi đã có cheat code!',
  },
  {
    title: 'Nòng Nọc Admin Server',
    description: 'Luật chơi là do nó viết!',
    taunt: 'Bạn đang chơi game, nó đang chỉnh config!',
  },
  {
    title: 'Nòng Nọc Chủ Server',
    description: 'Muốn thắng lúc nào thì thắng lúc đó!',
    taunt: 'Bạn nghĩ mình đang đua với người chơi à? Đây là server nhà nó!',
  },
  {
    title: 'Nòng Nọc End Game',
    description: 'Vừa spawn đã max level!',
    taunt: 'Bạn đang farm exp, nó đã đánh boss cuối!',
  },
  {
    title: 'Nòng Nọc Trùm Cuối',
    description: 'Xuất hiện ở cuối đường đua nhưng không ai muốn gặp!',
    taunt: 'Bạn chưa kịp về đích đã gặp boss cuối!',
  },
  {
    title: 'Nòng Nọc DLC',
    description: 'Nội dung đặc biệt, người thường không được trải nghiệm!',
    taunt: 'Tính năng này chưa mở khóa cho người chơi hệ thường!',
  },
  {
    title: 'Nòng Nọc Premium',
    description: 'Không mạnh hơn... chỉ là có nhiều tiền hơn!',
    taunt: 'Bạn chơi miễn phí, nó chơi bản Premium!',
  },
  {
    title: 'Nòng Nọc VIP',
    description: 'Có lối đi riêng, có đặc quyền riêng!',
    taunt: 'Bạn xếp hàng, VIP đã về đích bằng cửa riêng!',
  },
  {
    title: 'Nòng Nọc Quay Gacha',
    description: 'Một phát quay, ra luôn nhân vật SSR!',
    taunt: 'Bạn quay 80 lần chưa ra, nó quay phát đầu đã SSR!',
  },
  {
    title: 'Nòng Nọc SSR',
    description: 'Tỉ lệ xuất hiện cực thấp, nhưng đã xuất hiện là hết game!',
    taunt: 'Bạn là nhân vật thường, gặp SSR thì chịu thôi!',
  },
  {
    title: 'Nòng Nọc Sống Sót Cuối Cùng',
    description: 'Không cần nhanh nhất, chỉ cần không bị bỏ lại!',
    taunt: 'Bạn còn đang chiến đấu, nó đã làm lễ nhận giải!',
  },
];

export const getRandomEliteBotProfile = (): EliteBotProfile => {
  return ELITE_BOT_PROFILES[Math.floor(Math.random() * ELITE_BOT_PROFILES.length)];
};
