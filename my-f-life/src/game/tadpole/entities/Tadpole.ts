import { GAME_CONFIG } from '../GameConfig';

export type TadpoleType = 'player' | 'bot';

export interface TadpoleProps {
  id: string;
  name: string;
  type: TadpoleType;
  x: number;
  y: number;
  color: string;
  glowColor?: string;
  speedMultiplier?: number;
  lanePreference?: number;
  wobbleFrequency?: number;
}

export class TadpoleEntity {
  public id: string;
  public name: string;
  public type: TadpoleType;
  
  public x: number;
  public y: number;
  
  public vx: number = 0;
  public vy: number = 0;
  
  public angle: number = -Math.PI / 2; // Face UP by default (-90 deg)
  public targetAngle: number = -Math.PI / 2;
  
  public radius: number = GAME_CONFIG.TADPOLE_RADIUS;
  public baseSpeed: number;
  public speedMultiplier: number;
  
  public isSlowed: boolean = false;
  public slowTimer: number = 0; // in milliseconds
  public isFinished: boolean = false;
  public finishTime: number = 0;
  
  public color: string;
  public glowColor: string;
  
  // Animation properties
  public tailPhase: number = Math.random() * Math.PI * 2;
  public tailWagSpeed: number = 18;
  public lanePreference: number;
  public wobbleFrequency: number;
  public wobbleTimer: number = Math.random() * 100;

  constructor(props: TadpoleProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.x = props.x;
    this.y = props.y;
    this.color = props.color;
    this.glowColor = props.glowColor || props.color;
    
    this.speedMultiplier = props.speedMultiplier || 1;
    this.lanePreference = props.lanePreference ?? 0;
    this.wobbleFrequency = props.wobbleFrequency || 1;
    
    if (this.type === 'player') {
      this.baseSpeed = GAME_CONFIG.BOT_BASE_SPEED * GAME_CONFIG.PLAYER_SPEED_MULTIPLIER;
    } else {
      this.baseSpeed = GAME_CONFIG.BOT_BASE_SPEED * this.speedMultiplier;
    }
  }

  public applyBoundarySlow() {
    this.isSlowed = true;
    this.slowTimer = GAME_CONFIG.BOUNDARY_SLOW_DURATION;
  }

  public update(dt: number) {
    // Update slow effect timer
    if (this.isSlowed) {
      this.slowTimer -= dt * 1000;
      if (this.slowTimer <= 0) {
        this.isSlowed = false;
        this.slowTimer = 0;
      }
    }

    // Tail wave animation
    const currentSpeed = Math.hypot(this.vx, this.vy);
    const speedRatio = Math.max(0.4, currentSpeed / this.baseSpeed);
    this.tailPhase += dt * this.tailWagSpeed * speedRatio;
    this.wobbleTimer += dt * this.wobbleFrequency;

    // Angle interpolation toward movement direction
    if (currentSpeed > 5) {
      this.targetAngle = Math.atan2(this.vy, this.vx);
    }
    
    // Smooth angle lerp with circular wrapping
    let diff = this.targetAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.angle += diff * Math.min(1, dt * 12);
  }
}
