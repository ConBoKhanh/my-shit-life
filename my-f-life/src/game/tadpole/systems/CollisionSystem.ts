import { TadpoleEntity } from '../entities/Tadpole';
import { soundEffects } from '../audio/SoundEffects';
import { TrackPath } from '../TrackPath';

export class CollisionSystem {
  public checkBoundaries(
    tadpole: TadpoleEntity,
    _trackWidth?: number,
    onPlayerHitBoundary?: () => void
  ) {
    const { leftX, rightX, centerX } = TrackPath.getBoundaries(tadpole.y);

    let hit = false;

    // Left curved wall collision
    if (tadpole.x - tadpole.radius < leftX) {
      tadpole.x = leftX + tadpole.radius;
      // Deflect velocity inward towards track center
      const inwardX = centerX - tadpole.x;
      tadpole.vx = Math.abs(tadpole.vx) * 0.4 + inwardX * 0.05;
      hit = true;
    }

    // Right curved wall collision
    if (tadpole.x + tadpole.radius > rightX) {
      tadpole.x = rightX - tadpole.radius;
      // Deflect velocity inward towards track center
      const inwardX = centerX - tadpole.x;
      tadpole.vx = -Math.abs(tadpole.vx) * 0.4 + inwardX * 0.05;
      hit = true;
    }

    if (hit) {
      if (!tadpole.isSlowed) {
        tadpole.applyBoundarySlow();
        if (tadpole.type === 'player') {
          soundEffects.playBoundaryHit();
          onPlayerHitBoundary?.();
        }
      }
    }
  }

  public checkTadpoleSeparation(tadpoles: TadpoleEntity[]) {
    const count = tadpoles.length;
    for (let i = 0; i < count; i++) {
      const a = tadpoles[i];
      for (let j = i + 1; j < count; j++) {
        const b = tadpoles[j];
        
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist && dist > 0.0001) {
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;

          a.x -= nx * overlap * 0.6;
          a.y -= ny * overlap * 0.6;
          b.x += nx * overlap * 0.6;
          b.y += ny * overlap * 0.6;
        }
      }
    }
  }
}
