import { TadpoleEntity } from '../entities/Tadpole';
import type { InputState } from '../input/InputState';
import { GAME_CONFIG } from '../GameConfig';
import { TrackPath } from '../TrackPath';

export class MovementSystem {
  public updatePlayer(player: TadpoleEntity, input: InputState, dt: number) {
    if (player.isFinished) {
      player.vx *= 0.92;
      player.vy *= 0.92;
      player.x += player.vx * dt;
      player.y += player.vy * dt;
      player.update(dt);
      return;
    }

    // If user is NOT providing any input, tadpole quickly decelerates to a complete stop!
    if (input.magnitude < 0.08) {
      const friction = Math.min(1, dt * 12);
      player.vx += (0 - player.vx) * friction;
      player.vy += (0 - player.vy) * friction;
      player.x += player.vx * dt;
      player.y += player.vy * dt;
      player.update(dt);
      return;
    }

    let speed = player.baseSpeed;
    if (player.isSlowed) {
      speed *= GAME_CONFIG.BOUNDARY_SLOW_FACTOR;
    }

    // Direct user-driven velocity
    let targetVx = input.x * speed;
    let targetVy = input.y * speed;

    // If user is pressing only horizontal steer (A/D or left/right key),
    // provide a slight forward drive only while the key/joystick is actively held
    if (Math.abs(input.y) < 0.1 && Math.abs(input.x) > 0.1) {
      targetVy = -speed * 0.5;
    }

    // Acceleration & responsive steering
    const accel = 16;
    player.vx += (targetVx - player.vx) * Math.min(1, dt * accel);
    player.vy += (targetVy - player.vy) * Math.min(1, dt * accel);

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    player.update(dt);
  }

  public updateBot(bot: TadpoleEntity, targetDirection: { x: number; y: number }, dt: number) {
    if (bot.isFinished) {
      bot.vx *= 0.92;
      bot.vy *= 0.92;
      bot.x += bot.vx * dt;
      bot.y += bot.vy * dt;
      bot.update(dt);
      return;
    }

    let speed = bot.baseSpeed;
    if (bot.isSlowed) {
      speed *= GAME_CONFIG.BOUNDARY_SLOW_FACTOR;
    }

    const targetVx = targetDirection.x * speed;
    const targetVy = targetDirection.y * speed;

    const accel = 10;
    bot.vx += (targetVx - bot.vx) * Math.min(1, dt * accel);
    bot.vy += (targetVy - bot.vy) * Math.min(1, dt * accel);

    bot.x += bot.vx * dt;
    bot.y += bot.vy * dt;

    bot.update(dt);
  }
}
