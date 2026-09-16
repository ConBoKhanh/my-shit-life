import bgHospital from '../assets/istockphoto-1094626640-612x612.jpg';
import ytaImg from '../assets/yta.png';
import boImg from '../assets/bo.png';
import meImg from '../assets/me.png';

export const ASSET_MAP: Record<string, string> = {
  'asset:bg_hospital': bgHospital,
  'asset:yta': ytaImg,
  'asset:bo': boImg,
  'asset:me': meImg,
};

export function resolveAssetUrl(urlOrKey: string): string {
  if (!urlOrKey) return '';
  if (ASSET_MAP[urlOrKey]) {
    return ASSET_MAP[urlOrKey];
  }
  return urlOrKey;
}
