import { TadpoleEntity } from '../entities/Tadpole';
import { SpikeObstacle } from '../entities/SpikeObstacle';
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
      if (!tadpole.isSlowed && !tadpole.isStunned) {
        tadpole.applyBoundarySlow();
        if (tadpole.type === 'player') {
          soundEffects.playBoundaryHit();
          onPlayerHitBoundary?.();
        }
      }
    }
  }

  public checkSpikeCollisions(
    tadpole: TadpoleEntity,
    spikes: SpikeObstacle[],
    onPlayerHitSpike?: () => void
  ) {
    // If tadpole is stunned or in post-spike immunity grace period, ignore spike collisions
    if (tadpole.isStunned || tadpole.spikeImmunityTimer > 0) return;

    for (const spike of spikes) {
      // Quick bounding box check before hypot
      const dy = Math.abs(tadpole.y - spike.y);
      if (dy > tadpole.radius + spike.radius) continue;

      const dx = Math.abs(tadpole.x - spike.x);
      if (dx > tadpole.radius + spike.radius) continue;

      const dist = Math.hypot(tadpole.x - spike.x, tadpole.y - spike.y);
      const hitDistance = tadpole.radius + spike.radius;

      if (dist < hitDistance) {
        // Gently bounce / repel tadpole out of the spike body so it doesn't overlap
        const nx = dist > 0.001 ? (tadpole.x - spike.x) / dist : 0;
        const ny = dist > 0.001 ? (tadpole.y - spike.y) / dist : 1;
        tadpole.x = spike.x + nx * (hitDistance + 10);
        tadpole.y = spike.y + ny * (hitDistance + 10);

        // Trigger 1.0s stun (plus grace period)
        tadpole.applyStun(1000);

        if (tadpole.type === 'player') {
          soundEffects.playSpikeStunSound();
          onPlayerHitSpike?.();
        }
        break;
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
