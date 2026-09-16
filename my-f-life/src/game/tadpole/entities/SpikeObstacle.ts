export interface SpikeObstacleProps {
  id: string;
  x: number;
  y: number;
  radius?: number;
  rotation?: number;
  rotationSpeed?: number;
}

export class SpikeObstacle {
  public id: string;
  public x: number;
  public y: number;
  public radius: number;
  public rotation: number;
  public rotationSpeed: number;
  public pulsePhase: number;

  constructor(props: SpikeObstacleProps) {
    this.id = props.id;
    this.x = props.x;
    this.y = props.y;
    this.radius = props.radius || 26;
    this.rotation = props.rotation || Math.random() * Math.PI * 2;
    this.rotationSpeed = props.rotationSpeed || (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8);
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  public update(dt: number) {
    this.rotation += this.rotationSpeed * dt;
    this.pulsePhase += dt * 3.5;
  }
}
