export class SoundEffects {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playCountdownBeep(highPitch: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const freq = highPitch ? 880 : 440; // A5 for GO!, A4 for 3-2-1
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (highPitch ? 0.4 : 0.2));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (highPitch ? 0.45 : 0.25));
    } catch {
      // Safe fallback
    }
  }

  public playBoundaryHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.15);
      osc.type = 'triangle';

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Safe fallback
    }
  }

  public playSpikeStunSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // 1. Harsh impact pop
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.18);
      osc1.type = 'sawtooth';

      gain1.gain.setValueAtTime(0.24, this.ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start();
      osc1.stop(this.ctx.currentTime + 0.2);

      // 2. Dizzy warble chirp
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.frequency.setValueAtTime(650, this.ctx.currentTime + 0.05);
      osc2.frequency.linearRampToValueAtTime(320, this.ctx.currentTime + 0.35);
      osc2.type = 'sine';

      gain2.gain.setValueAtTime(0.18, this.ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(this.ctx.currentTime + 0.05);
      osc2.stop(this.ctx.currentTime + 0.4);
    } catch {
      // Safe fallback
    }
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          osc.type = 'triangle';

          gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.4);
        } catch {
          // Safe fallback
        }
      }, index * 120);
    });
  }

  public playDefeatSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
    notes.forEach((freq, index) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          osc.type = 'sawtooth';

          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.3);
        } catch {
          // Safe fallback
        }
      }, index * 140);
    });
  }
}

export const soundEffects = new SoundEffects();
