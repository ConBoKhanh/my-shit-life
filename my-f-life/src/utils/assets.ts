import bgHospital from '../assets/istockphoto-1094626640-612x612.jpg';
import bgHospitalModern from '../assets/bg_hospital_modern.jpg';
import bgHospitalSunset from '../assets/bg_hospital_sunset.jpg';
import bgLivingRoom from '../assets/bg_cozy_livingroom.jpg';
import ytaImg from '../assets/yta.png';
import boImg from '../assets/bo.png';
import meImg from '../assets/me.png';

// Baby Avatars (1+ years) - All 10 avatars
import baby1 from '../assets/user/baby 1+/1.png';
import baby2 from '../assets/user/baby 1+/2.png';
import baby3 from '../assets/user/baby 1+/3.png';
import baby4 from '../assets/user/baby 1+/4.png';
import baby5 from '../assets/user/baby 1+/5.png';
import baby6 from '../assets/user/baby 1+/6.png';
import baby7 from '../assets/user/baby 1+/7.png';
import baby8 from '../assets/user/baby 1+/8.png';
import baby9 from '../assets/user/baby 1+/9.png';
import baby10 from '../assets/user/baby 1+/10.png';

// SFX Audio
import sfxSiuu from '../assets/gabbe-suii-by-cristiano-ronaldo-123253.mp3';
import sfxBabyMama from '../assets/baby-says-mama-02-sound-effect-039570495_nw_prev.m4a';
import sfxBabyPapa from '../assets/baby-says-papa.mp3';
import sfxBabyCucucaca from '../assets/snaptik.vn_7647952028907343122.mp3';
import sfxMessiWowo from '../assets/lionel-messi-s-camera-wowo-sound-effectmp3-320k-1-made-with-Voicemod.mp3';
import sfxChui from '../assets/chửi.mp3';

export const HOSPITAL_BACKGROUNDS = [
  bgHospitalModern,
  bgHospitalSunset,
  bgHospital,
];

export const BABY_AVATARS = [
  { id: 'baby_1', name: 'Bé Mũ Xanh Năng Động', src: baby1 },
  { id: 'baby_2', name: 'Bé Tóc Vàng Đáng Yêu', src: baby2 },
  { id: 'baby_3', name: 'Bé Nơ Hồng Dịu Dàng', src: baby3 },
  { id: 'baby_4', name: 'Bé Kháu Khỉnh Tươi Tắn', src: baby4 },
  { id: 'baby_5', name: 'Bé Tinh Nghịch Tinh Anh', src: baby5 },
  { id: 'baby_6', name: 'Bé Thiên Thần Bẽn Lẽn', src: baby6 },
  { id: 'baby_7', name: 'Bé Nụ Cười Toả Nắng', src: baby7 },
  { id: 'baby_8', name: 'Bé Mắt Tròn Xoe Thơ Ngây', src: baby8 },
  { id: 'baby_9', name: 'Bé Tinh Khôi Hồn Nhiên', src: baby9 },
  { id: 'baby_10', name: 'Bé Hóm Hỉnh Thông Minh', src: baby10 },
];

export const ASSET_MAP: Record<string, string> = {
  'asset:bg_hospital': bgHospital,
  'asset:bg_hospital_modern': bgHospitalModern,
  'asset:bg_hospital_sunset': bgHospitalSunset,
  'asset:bg_livingroom': bgLivingRoom,
  'asset:yta': ytaImg,
  'asset:bo': boImg,
  'asset:me': meImg,
  'asset:baby_1': baby1,
  'asset:baby_2': baby2,
  'asset:baby_3': baby3,
  'asset:baby_4': baby4,
  'asset:baby_5': baby5,
  'asset:baby_6': baby6,
  'asset:baby_7': baby7,
  'asset:baby_8': baby8,
  'asset:baby_9': baby9,
  'asset:baby_10': baby10,
  'asset:sfx_siuu': sfxSiuu,
  'asset:sfx_baby_mama': sfxBabyMama,
  'asset:sfx_baby_papa': sfxBabyPapa,
  'asset:sfx_baby_cucucaca': sfxBabyCucucaca,
  'asset:sfx_messi_wowo': sfxMessiWowo,
  'asset:sfx_chui': sfxChui,
};

export function getRandomHospitalBackground(): string {
  const index = Math.floor(Math.random() * HOSPITAL_BACKGROUNDS.length);
  return HOSPITAL_BACKGROUNDS[index];
}

export function resolveAssetUrl(urlOrKey: string): string {
  if (!urlOrKey) return '';
  if (ASSET_MAP[urlOrKey]) {
    return ASSET_MAP[urlOrKey];
  }
  return urlOrKey;
}
