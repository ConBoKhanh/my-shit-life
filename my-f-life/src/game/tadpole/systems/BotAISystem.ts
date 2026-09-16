import { TadpoleEntity } from '../entities/Tadpole';
import { SpikeObstacle } from '../entities/SpikeObstacle';
import { TrackPath } from '../TrackPath';

export class BotAISystem {
  public calculateBotDirection(
    bot: TadpoleEntity,
    allTadpoles: TadpoleEntity[],
    _trackWidth?: number,
    finishY: number = -TrackPath.TOTAL_LENGTH,
    spikes: SpikeObstacle[] = []
  ): { x: number; y: number } {
    // 1. Lookahead Target on Track (Anticipating curves ahead like an F1 driver)
    const lookaheadDistance = 110;
    const targetY = bot.y - lookaheadDistance;
    const { centerX: lookaheadCenterX, width: lookaheadWidth } = TrackPath.getBoundaries(targetY);

    // Desired X position in the lane
    const laneOffset = bot.lanePreference * (lookaheadWidth * 0.32);
    const targetX = lookaheadCenterX + laneOffset;

    // Vector toward lookahead target
    const toTargetDx = targetX - bot.x;

    // 2. Track Curvature Tangent at current position
    const tangent = TrackPath.getTangent(bot.y);

    // 3. Blend lookahead steering with track tangent
    let dirX = tangent.x * 0.45 + (toTargetDx / lookaheadDistance) * 0.55;
    let dirY = tangent.y; // predominantly forward/upward

    // 4. Subtle multi-frequency organic swimming wobble
    const isSharpTurn = Math.abs(tangent.x) > 0.2;
    // Dampen wobble in sharp corners so bots maintain racing line discipline
    const wobbleDamping = isSharpTurn ? 0.25 : 1.0;
    const wobble = (Math.sin(bot.wobbleTimer * 2.8) * 0.22 + Math.cos(bot.wobbleTimer * 1.3) * 0.12) * wobbleDamping;
    dirX += wobble;

    // 5. Active Boundary Repulsion (Keeps BOTs safely inside the track on tight corners)
    const { leftX, rightX } = TrackPath.getBoundaries(bot.y);
    const wallMargin = 75;
    const distToLeft = bot.x - bot.radius - leftX;
    const distToRight = rightX - (bot.x + bot.radius);

    if (distToLeft < wallMargin) {
      const push = Math.max(0, (wallMargin - distToLeft) / wallMargin);
      dirX += push * push * 2.4;
    } else if (distToRight < wallMargin) {
      const push = Math.max(0, (wallMargin - distToRight) / wallMargin);
      dirX -= push * push * 2.4;
    }

    // 6. Spike Obstacle Avoidance (Avoid getting stunned if detected ahead)
    const spikeVisionAhead = 120;
    for (const spike of spikes) {
      const dy = spike.y - bot.y;
      if (dy < 0 && dy > -spikeVisionAhead) {
        const dx = spike.x - bot.x;
        if (Math.abs(dx) < spike.radius + bot.radius + 35) {
          // Steer away from the spike side
          const steerAway = dx >= 0 ? -1.8 : 1.8;
          const urgency = 1 - Math.abs(dy) / spikeVisionAhead;
          dirX += steerAway * urgency;
        }
      }
    }

    // 7. Intelligent Overtaking (Avoid drafting directly into competitors)
    const visionRange = 85;
    for (const other of allTadpoles) {
      if (other.id === bot.id) continue;

      const dx = other.x - bot.x;
      const dy = other.y - bot.y;

      // If competitor is ahead in close proximity
      if (dy < 0 && dy > -visionRange && Math.abs(dx) < 38) {
        // Steer toward the side that has more track clearance
        const currentCenterX = (leftX + rightX) / 2;
        const steerSide = bot.x < currentCenterX ? -1 : 1;
        const urgency = (1 - Math.hypot(dx, dy) / visionRange) * 0.7;
        dirX += steerSide * urgency;
      }
    }

    // 7. Convergence to Egg at Final Stretch
    const distToFinish = bot.y - finishY;
    if (distToFinish < 800 && distToFinish > 0) {
      const finishCenterX = TrackPath.getCenterX(finishY);
      const finishFactor = 1 - distToFinish / 800;
      dirX += (finishCenterX - bot.x) * 0.005 * finishFactor;
    }

    // 8. Normalize direction vector
    const length = Math.hypot(dirX, dirY);
    if (length > 0.001) {
      dirX /= length;
      dirY /= length;
    }

    return { x: dirX, y: dirY };
  }
}
