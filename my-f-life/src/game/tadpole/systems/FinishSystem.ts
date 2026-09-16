import { TadpoleEntity } from '../entities/Tadpole';
import { TrackPath } from '../TrackPath';

export interface FinishResult {
  winner: TadpoleEntity;
  isPlayerWinner: boolean;
}

export class FinishSystem {
  public checkFinishLine(
    tadpoles: TadpoleEntity[],
    finishY: number
  ): FinishResult | null {
    const eggX = TrackPath.getCenterX(finishY);

    for (const t of tadpoles) {
      const distToEgg = Math.hypot(t.x - eggX, t.y - finishY);
      if ((distToEgg <= 85 || t.y <= finishY + 40) && !t.isFinished) {
        t.isFinished = true;
        return {
          winner: t,
          isPlayerWinner: t.type === 'player',
        };
      }
    }
    return null;
  }
}
