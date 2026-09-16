import { GAME_CONFIG, getRandomEliteBotProfile, ELITE_BOT_PROFILES, type EliteBotProfile } from './GameConfig';
import { TadpoleEntity } from './entities/Tadpole';
import { KeyboardController } from './input/KeyboardController';
import type { InputState } from './input/InputState';
import { MovementSystem } from './systems/MovementSystem';
import { BotAISystem } from './systems/BotAISystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { FinishSystem } from './systems/FinishSystem';
import type { FinishResult } from './systems/FinishSystem';
import { TadpoleRenderer } from './rendering/TadpoleRenderer';
import { TrackRenderer } from './rendering/TrackRenderer';
import { soundEffects } from './audio/SoundEffects';
import { TrackPath } from './TrackPath';

export type GameStateStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'finished';

export interface WinnerInfo {
  tadpoleId: string;
  isPlayer: boolean;
  name: string;
  botProfile?: EliteBotProfile;
}

export interface GameEngineCallbacks {
  onStatusChange: (status: GameStateStatus) => void;
  onCountdownTick: (count: number | string) => void;
  onRankChange: (rank: number, total: number, distancePercent: number) => void;
  onFinish: (winner: WinnerInfo) => void;
  onPlayerHitBoundary?: () => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  public status: GameStateStatus = 'idle';
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private totalElapsedTime: number = 0;

  // Entities
  public player!: TadpoleEntity;
  public bots: TadpoleEntity[] = [];
  public allTadpoles: TadpoleEntity[] = [];

  // Systems
  private keyboardController = new KeyboardController();
  private movementSystem = new MovementSystem();
  private botAISystem = new BotAISystem();
  private collisionSystem = new CollisionSystem();
  private finishSystem = new FinishSystem();
  
  // Renderers
  private tadpoleRenderer = new TadpoleRenderer();
  private trackRenderer = new TrackRenderer();

  // Track Dimensions
  public trackWidth = GAME_CONFIG.TRACK_WIDTH;
  public trackLength = GAME_CONFIG.TRACK_LENGTH;
  public finishY = -GAME_CONFIG.TRACK_LENGTH;

  // External input override (from Virtual Joystick)
  public customInput: InputState | null = null;

  // Viewport & Screen Dimensions
  public cssWidth: number = typeof window !== 'undefined' ? window.innerWidth : 800;
  public cssHeight: number = typeof window !== 'undefined' ? window.innerHeight : 600;
  public dpr: number = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Camera
  private cameraX: number = 0;
  private cameraY: number = 0;

  // Background floating particles
  private bgParticles: Array<{ x: number; y: number; r: number; alpha: number; speed: number; colorString: string }> = [];

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.callbacks = callbacks;

    if (typeof window !== 'undefined') {
      this.cssWidth = window.innerWidth;
      this.cssHeight = window.innerHeight;
      this.dpr = window.devicePixelRatio || 1;
    }

    this.initBackgroundParticles();
    this.reset();
  }

  public handleResize(w: number, h: number, dpr: number) {
    this.cssWidth = w;
    this.cssHeight = h;
    this.dpr = dpr;
    this.render();
  }

  private initBackgroundParticles() {
    this.bgParticles = [];
    const colors = ['rgba(251, 113, 133,', 'rgba(244, 63, 94,', 'rgba(254, 205, 211,', 'rgba(251, 191, 36,'];
    for (let i = 0; i < 90; i++) {
      const y = (Math.random() - 1) * (this.trackLength + 800);
      const cx = TrackPath.getCenterX(y);
      const baseColor = colors[i % colors.length];
      const alpha = Math.random() * 0.45 + 0.15;
      this.bgParticles.push({
        x: cx + (Math.random() - 0.5) * (this.trackWidth + 600),
        y,
        r: Math.random() * 3.5 + 1.2,
        alpha,
        speed: Math.random() * 20 + 10,
        colorString: `${baseColor} ${alpha})`,
      });
    }
  }

  public reset() {
    this.stop();
    this.status = 'idle';
    this.callbacks.onStatusChange('idle');

    const botColors = [
      '#38BDF8', '#818CF8', '#A78BFA', '#F472B6', '#FB7185',
      '#34D399', '#4ADE80', '#2DD4BF', '#60A5FA', '#C084FC',
      '#F87171', '#FBBF24', '#22D3EE', '#A3E635', '#E879F9',
      '#38BDF8', '#818CF8', '#FB7185', '#34D399', '#60A5FA'
    ];

    // Pick 20 distinct hilarious bot personalities from ELITE_BOT_PROFILES
    const shuffledProfiles = [...ELITE_BOT_PROFILES].sort(() => Math.random() - 0.5);

    // 1. Create Player
    this.player = new TadpoleEntity({
      id: 'player_tadpole',
      name: 'Bạn',
      type: 'player',
      x: 0,
      y: 0,
      color: '#FACC15',
      glowColor: '#00F2FE',
    });

    // 2. Create 20 BOTs evenly distributed at spawn area
    this.bots = [];
    const botCount = GAME_CONFIG.BOT_COUNT;
    for (let i = 0; i < botCount; i++) {
      const col = (i % 5) - 2; // -2, -1, 0, 1, 2
      const row = Math.floor(i / 5);
      
      const spawnX = col * 120 + (Math.random() - 0.5) * 30;
      const spawnY = (row * 60 + 20) + (Math.random() - 0.5) * 20;

      const speedVar = 0.92 + Math.random() * 0.16; // 0.92 to 1.08
      const profile = shuffledProfiles[i % shuffledProfiles.length];

      const bot = new TadpoleEntity({
        id: `bot_${i + 1}`,
        name: profile.title,
        type: 'bot',
        x: spawnX,
        y: spawnY,
        color: botColors[i % botColors.length],
        speedMultiplier: speedVar,
        lanePreference: (Math.random() - 0.5) * 1.6,
        wobbleFrequency: 0.8 + Math.random() * 0.8,
      });

      this.bots.push(bot);
    }

    this.allTadpoles = [this.player, ...this.bots];
    this.cameraX = 0;
    this.cameraY = -120;

    this.updateRank();
    this.render();
  }

  public startRace() {
    this.reset();
    this.keyboardController.attach();
    this.status = 'countdown';
    this.callbacks.onStatusChange('countdown');

    let count = GAME_CONFIG.COUNTDOWN_SECONDS;
    this.callbacks.onCountdownTick(count);
    soundEffects.playCountdownBeep(false);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        this.callbacks.onCountdownTick(count);
        soundEffects.playCountdownBeep(false);
      } else if (count === 0) {
        this.callbacks.onCountdownTick('GO!');
        soundEffects.playCountdownBeep(true);
      } else {
        clearInterval(interval);
        this.callbacks.onCountdownTick('');
        this.status = 'running';
        this.callbacks.onStatusChange('running');
        this.lastTimestamp = performance.now();
        this.loop(this.lastTimestamp);
      }
    }, 1000);
  }

  public pause() {
    if (this.status !== 'running') return;
    this.status = 'paused';
    this.callbacks.onStatusChange('paused');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resume() {
    if (this.status !== 'paused') return;
    this.status = 'running';
    this.callbacks.onStatusChange('running');
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.keyboardController.detach();
  }

  private loop = (timestamp: number) => {
    if (this.status !== 'running' && this.status !== 'finished') return;

    const dt = Math.min(0.06, (timestamp - this.lastTimestamp) / 1000);
    this.lastTimestamp = timestamp;
    this.totalElapsedTime += dt;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    if (this.status !== 'running' && this.status !== 'finished') return;

    // 1. Get input
    const input = this.customInput && this.customInput.magnitude > 0.05
      ? this.customInput
      : this.keyboardController.getInput();

    // 2. Update Player
    this.movementSystem.updatePlayer(this.player, input, dt);
    this.collisionSystem.checkBoundaries(this.player, this.trackWidth, () => {
      this.callbacks.onPlayerHitBoundary?.();
    });

    // 3. Update BOTs
    for (const bot of this.bots) {
      const botDir = this.botAISystem.calculateBotDirection(
        bot,
        this.allTadpoles,
        this.trackWidth,
        this.finishY
      );
      this.movementSystem.updateBot(bot, botDir, dt);
      this.collisionSystem.checkBoundaries(bot, this.trackWidth);
    }

    // 4. Soft separation between tadpoles
    this.collisionSystem.checkTadpoleSeparation(this.allTadpoles);

    // 5. Update Background Particles
    for (const p of this.bgParticles) {
      p.y -= p.speed * dt;
      if (p.y < this.finishY - 200) {
        p.y = 200;
        p.x = TrackPath.getCenterX(p.y) + (Math.random() - 0.5) * (this.trackWidth + 600);
      }
    }

    // 6. Camera Follow Player & Track Curvature Smoothly
    const isMobile = this.cssWidth < 768;
    const currentTrackCenterX = TrackPath.getCenterX(this.player.y);
    const lookaheadTrackCenterX = TrackPath.getCenterX(this.player.y - (isMobile ? 220 : 150));
    
    // Smoothly blend player position with upcoming track curve center
    const targetCamX = this.player.x * 0.4 + currentTrackCenterX * 0.3 + lookaheadTrackCenterX * 0.3;
    const targetCamY = this.player.y - (isMobile ? 200 : 140); // lookahead ahead of player
    this.cameraX += (targetCamX - this.cameraX) * Math.min(1, dt * 8.5);
    this.cameraY += (targetCamY - this.cameraY) * Math.min(1, dt * 8.5);

    // 7. Calculate Rank & Distance
    this.updateRank();

    // 8. Check Finish Line
    if (this.status === 'running') {
      const result: FinishResult | null = this.finishSystem.checkFinishLine(this.allTadpoles, this.finishY);
      if (result) {
        this.status = 'finished';
        this.callbacks.onStatusChange('finished');
        
        let botProfile: EliteBotProfile | undefined;
        if (!result.isPlayerWinner) {
          botProfile = ELITE_BOT_PROFILES.find((p) => p.title === result.winner.name) || getRandomEliteBotProfile();
        }

        const winnerInfo: WinnerInfo = {
          tadpoleId: result.winner.id,
          isPlayer: result.isPlayerWinner,
          name: result.isPlayerWinner ? 'Bạn (Nòng Nọc Người Thường)' : (botProfile?.title || result.winner.name),
          botProfile,
        };

        if (result.isPlayerWinner) {
          soundEffects.playVictoryFanfare();
        } else {
          soundEffects.playDefeatSound();
        }

        this.callbacks.onFinish(winnerInfo);
      }
    }
  }

  private updateRank() {
    // Sort all tadpoles by progress (smallest Y is closest to finish)
    const sorted = [...this.allTadpoles].sort((a, b) => a.y - b.y);
    const playerRank = sorted.findIndex((t) => t.type === 'player') + 1;

    // Distance percent to egg (0% at start, 100% at finish)
    const currentDistance = Math.max(0, -this.player.y);
    const distancePercent = Math.min(100, Math.round((currentDistance / this.trackLength) * 100));

    this.callbacks.onRankChange(playerRank, this.allTadpoles.length, distancePercent);
  }

  public render() {
    const ctx = this.ctx;
    const dpr = this.dpr || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
    const cssW = this.cssWidth || (this.canvas.width / dpr) || 800;
    const cssH = this.cssHeight || (this.canvas.height / dpr) || 600;
    if (!cssW || !cssH) return;

    // Reset transform to identity
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 1. Organic Warm Pink Amniotic Fluid Background (covers full physical canvas)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGrad.addColorStop(0, '#270818');
    bgGrad.addColorStop(0.5, '#3b1026');
    bgGrad.addColorStop(1, '#200614');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    // Scale by DPR to work in CSS pixels
    ctx.scale(dpr, dpr);

    // 2. Responsive Viewport Scaling
    // On mobile / narrow screens, zoom out so the full 700px track + grand curves (±260px) fit comfortably
    const isMobile = cssW < 768;
    const targetVisibleWorldWidth = isMobile ? 1320 : 1000;
    const zoomScale = Math.min(1.0, cssW / targetVisibleWorldWidth);

    // Viewport Center:
    // Horizontal center = cssW / 2 (centers the race right in the middle of phone screen)
    // Vertical center = on mobile place player at 65% height so player has an expansive view of upcoming bends
    const viewportCenterY = isMobile ? cssH * 0.65 : cssH * 0.54;

    ctx.translate(cssW / 2, viewportCenterY);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-this.cameraX, -this.cameraY);

    // 3. Background Floating Bio-luminescent Particles
    ctx.save();
    for (const p of this.bgParticles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.colorString;
      ctx.fill();
    }
    ctx.restore();

    // 4. Render Race Track, Boundaries, & Giant Ovum Egg
    this.trackRenderer.renderTrack(
      ctx,
      this.trackWidth,
      this.trackLength,
      this.finishY,
      this.totalElapsedTime,
      this.cameraY
    );

    // 5. Render All Tadpoles (BOTs first, Player on top)
    for (const bot of this.bots) {
      this.tadpoleRenderer.renderTadpole(ctx, bot);
    }
    this.tadpoleRenderer.renderTadpole(ctx, this.player);

    ctx.restore();
  }
}
