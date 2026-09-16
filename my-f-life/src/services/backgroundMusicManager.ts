// Background Music Manager for Game & Story Mode
// Handles continuous background playlist playback, smart pausing when custom dialogue audio/SFX plays,
// and resuming playback seamlessly when custom audio finishes.

import bgTrack1 from '../assets/backgroud-music/allicante-calm-gaming-vibes-332207.mp3';
import bgTrack2 from '../assets/backgroud-music/allicante-chill-gaming-vibes-332248.mp3';
import bgTrack3 from '../assets/backgroud-music/apalonbeats-chill-chill-music-566601.mp3';
import bgTrack4 from '../assets/backgroud-music/apalonbeats-chill-chill-music-566664.mp3';
import bgTrack5 from '../assets/backgroud-music/arpmedia-chill-569454.mp3';
import bgTrack6 from '../assets/backgroud-music/ikoliks_aj-chill-chill-background-music-363286.mp3';
import bgTrack7 from '../assets/backgroud-music/joyinsound-chill-background-music-403419.mp3';
import bgTrack8 from '../assets/backgroud-music/mirostar-chill-chill-music-560294.mp3';
import bgTrack9 from '../assets/backgroud-music/monume-chill-chill-music-2-570659.mp3';
import bgTrack10 from '../assets/backgroud-music/paulyudin-chill-silent-bloom-chill-481864.mp3';
import bgTrack11 from '../assets/backgroud-music/prettyjohn1-chill-chill-music-520383.mp3';

export interface BackgroundTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export const BACKGROUND_PLAYLIST: BackgroundTrack[] = [
  { id: 'track_1', title: 'Calm Gaming Vibes', artist: 'Allicante', src: bgTrack1 },
  { id: 'track_2', title: 'Chill Gaming Vibes', artist: 'Allicante', src: bgTrack2 },
  { id: 'track_3', title: 'Chill Chill Beats 1', artist: 'Apalonbeats', src: bgTrack3 },
  { id: 'track_4', title: 'Chill Chill Beats 2', artist: 'Apalonbeats', src: bgTrack4 },
  { id: 'track_5', title: 'Chill Horizon', artist: 'Arpmedia', src: bgTrack5 },
  { id: 'track_6', title: 'Chill Background Harmony', artist: 'Ikoliks Aj', src: bgTrack6 },
  { id: 'track_7', title: 'Joyful Ambient Chill', artist: 'Joyinsound', src: bgTrack7 },
  { id: 'track_8', title: 'Mirostar Chill Lounge', artist: 'Mirostar', src: bgTrack8 },
  { id: 'track_9', title: 'Monume Chill Beat', artist: 'Monume', src: bgTrack9 },
  { id: 'track_10', title: 'Silent Bloom Chill', artist: 'Paul Yudin', src: bgTrack10 },
  { id: 'track_11', title: 'Pretty John Chill Vibes', artist: 'Pretty John', src: bgTrack11 },
];

type AudioStateListener = () => void;

class BackgroundMusicManager {
  private currentTrackIndex: number = Math.floor(Math.random() * BACKGROUND_PLAYLIST.length);
  private bgAudio: HTMLAudioElement | null = null;
  private customAudio: HTMLAudioElement | null = null;

  public isMuted: boolean = false;
  public isPlaying: boolean = false;
  public isPausedForCustom: boolean = false;
  public bgVolume: number = 0.35; // Luôn luôn nhỏ hơn 50% theo yêu cầu

  private listeners: Set<AudioStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (this.isPlaying && this.bgAudio && this.bgAudio.paused && !this.isPausedForCustom) {
          this.bgAudio.play().catch(() => {});
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
    }
  }

  public subscribe(listener: AudioStateListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getCurrentTrack(): BackgroundTrack {
    return BACKGROUND_PLAYLIST[this.currentTrackIndex] || BACKGROUND_PLAYLIST[0];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  // Khởi chạy hoặc tiếp tục phát playlist background music
  public startBackgroundMusic(trackIndex?: number) {
    if (typeof window === 'undefined') return;

    if (typeof trackIndex === 'number' && trackIndex >= 0 && trackIndex < BACKGROUND_PLAYLIST.length) {
      this.currentTrackIndex = trackIndex;
    }

    const track = this.getCurrentTrack();

    if (!this.bgAudio) {
      this.bgAudio = new Audio(track.src);
      this.bgAudio.volume = this.isMuted ? 0 : this.bgVolume;
      this.bgAudio.muted = this.isMuted;

      // Khi phát hết bài -> Tự động chuyển sang bài tiếp theo và lặp lại danh sách
      this.bgAudio.addEventListener('ended', () => {
        this.playNextTrack();
      });
    } else if (this.bgAudio.src !== track.src) {
      this.bgAudio.src = track.src;
      this.bgAudio.load();
    }

    this.isPlaying = true;
    this.isPausedForCustom = false;

    this.bgAudio.volume = this.isMuted ? 0 : this.bgVolume;
    this.bgAudio.muted = this.isMuted;

    const playPromise = this.bgAudio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay may wait for user interaction
      });
    }

    this.notify();
  }

  // Chọn và phát một bài ngẫu nhiên trong playlist
  public playRandomTrack() {
    let nextIndex = Math.floor(Math.random() * BACKGROUND_PLAYLIST.length);
    if (BACKGROUND_PLAYLIST.length > 1 && nextIndex === this.currentTrackIndex) {
      nextIndex = (nextIndex + 1) % BACKGROUND_PLAYLIST.length;
    }
    this.currentTrackIndex = nextIndex;
    if (this.bgAudio) {
      const track = this.getCurrentTrack();
      this.bgAudio.src = track.src;
      this.bgAudio.load();
      if (this.isPlaying && !this.isPausedForCustom) {
        this.bgAudio.play().catch(() => {});
      }
    } else {
      this.startBackgroundMusic();
    }
    this.notify();
  }

  // Chuyển bài kế tiếp (và vòng ngược lại đầu danh sách khi hết)
  public playNextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % BACKGROUND_PLAYLIST.length;
    if (this.bgAudio) {
      const track = this.getCurrentTrack();
      this.bgAudio.src = track.src;
      this.bgAudio.load();
      if (this.isPlaying && !this.isPausedForCustom) {
        this.bgAudio.play().catch(() => {});
      }
    } else {
      this.startBackgroundMusic();
    }
    this.notify();
  }

  // Quay lại bài trước (và vòng ngược lại cuối danh sách khi ở đầu)
  public playPrevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + BACKGROUND_PLAYLIST.length) % BACKGROUND_PLAYLIST.length;
    if (this.bgAudio) {
      const track = this.getCurrentTrack();
      this.bgAudio.src = track.src;
      this.bgAudio.load();
      if (this.isPlaying && !this.isPausedForCustom) {
        this.bgAudio.play().catch(() => {});
      }
    } else {
      this.startBackgroundMusic();
    }
    this.notify();
  }

  // Tạm dừng background music khi có âm thanh hội thoại / SFX / BGM riêng
  public pauseForCustomAudio() {
    if (this.bgAudio && !this.bgAudio.paused) {
      this.bgAudio.pause();
    }
    this.isPausedForCustom = true;
    this.notify();
  }

  // Khôi phục background music tiếp tục phát từ vị trí tạm dừng
  public resumeFromCustomAudio() {
    this.isPausedForCustom = false;

    // Dừng custom audio nếu còn đang phát
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }

    if (this.isPlaying && this.bgAudio) {
      this.bgAudio.volume = this.isMuted ? 0 : this.bgVolume;
      this.bgAudio.muted = this.isMuted;
      this.bgAudio.play().catch(() => {});
    }
    this.notify();
  }

  // Phát âm thanh riêng của hội thoại / SFX và tự động khôi phục BGM khi phát xong
  public playDialogueAudio(audioSrc: string, volume: number = 0.85, onEndCallback?: () => void) {
    if (!audioSrc) return;

    // Nếu đang phát cùng 1 audio source và chưa kết thúc, giữ nguyên cho phát tiếp không bị giật
    const cleanSrc = audioSrc.split('?')[0].split('#')[0];
    const fileName = cleanSrc.split('/').pop() || '';
    if (
      this.customAudio &&
      !this.customAudio.paused &&
      fileName &&
      (this.customAudio.src.includes(fileName) || this.customAudio.src.includes(encodeURIComponent(fileName)))
    ) {
      return;
    }

    // 1. Tạm dừng Background Music
    this.pauseForCustomAudio();

    // 2. Dọn dẹp custom audio cũ
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }

    // 3. Khởi tạo custom audio mới
    const audio = new Audio(audioSrc);
    audio.volume = this.isMuted ? 0 : volume;
    audio.muted = this.isMuted;
    this.customAudio = audio;

    const handleEnded = () => {
      if (this.customAudio === audio) {
        this.customAudio = null;
        onEndCallback?.();
        // 4. Khi âm thanh riêng chạy hết -> Tiếp tục phát Background Music từ chỗ vừa dừng
        this.resumeFromCustomAudio();
      }
    };

    audio.addEventListener('ended', handleEnded, { once: true });
    audio.addEventListener('error', handleEnded, { once: true });

    audio.play().catch(() => {
      // Safe fallback
      handleEnded();
    });
  }

  // Dừng hoàn toàn BGM (ví dụ khi sang minigame đua nòng nọc có nhạc riêng)
  public pauseBackgroundMusic() {
    this.isPlaying = false;
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
    this.notify();
  }

  // Bật/Tắt Mute toàn bộ âm thanh
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgAudio) {
      this.bgAudio.muted = muted;
      this.bgAudio.volume = muted ? 0 : this.bgVolume;
      if (!muted && this.isPlaying && this.bgAudio.paused && !this.isPausedForCustom) {
        this.bgAudio.play().catch(() => {});
      }
    }
    if (this.customAudio) {
      this.customAudio.muted = muted;
    }
    this.notify();
  }

  // Đảo trạng thái mute
  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Điều chỉnh âm lượng (Luôn giới hạn tối đa 45% < 50%)
  public setVolume(volume: number) {
    this.bgVolume = Math.max(0, Math.min(0.45, volume));
    if (this.bgAudio && !this.isMuted) {
      this.bgAudio.volume = this.bgVolume;
    }
    this.notify();
  }
}

export const backgroundMusicManager = new BackgroundMusicManager();
