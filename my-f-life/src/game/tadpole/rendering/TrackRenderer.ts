import { TrackPath } from '../TrackPath';
import { SpikeObstacle } from '../entities/SpikeObstacle';

export class TrackRenderer {
  public renderTrack(
    ctx: CanvasRenderingContext2D,
    _trackWidth: number,
    trackLength: number,
    finishY: number,
    time: number,
    cameraY: number = 0,
    spikes: SpikeObstacle[] = []
  ) {
    // Determine visible slice range to cover entire camera viewport seamlessly
    const viewMargin = 1200;
    const startY = cameraY + viewMargin;
    const endY = cameraY - viewMargin;
    const step = 32; // 32px slice resolution for ultra smooth curves

    // 0. Grand Egg Sanctuary Dome Background (When near finish)
    if (endY < finishY + 800) {
      this.renderEggSanctumDome(ctx, finishY, time);
    }

    // 1. Render Track Surface Polygons
    ctx.save();
    for (let y = startY; y > endY; y -= step) {
      const y1 = y;
      const y2 = y - step;

      const b1 = TrackPath.getBoundaries(y1);
      const b2 = TrackPath.getBoundaries(y2);

      // Warm organic biological amniotic fluid floor for each slice
      const sliceGrad = ctx.createLinearGradient(b1.leftX, y1, b1.rightX, y1);
      sliceGrad.addColorStop(0, 'rgba(159, 18, 57, 0.65)'); // deep rose red boundary
      sliceGrad.addColorStop(0.25, 'rgba(80, 7, 36, 0.85)'); // rich womb fluid
      sliceGrad.addColorStop(0.5, 'rgba(112, 10, 48, 0.9)'); // glowing magenta core
      sliceGrad.addColorStop(0.75, 'rgba(80, 7, 36, 0.85)');
      sliceGrad.addColorStop(1, 'rgba(159, 18, 57, 0.65)');

      ctx.beginPath();
      ctx.moveTo(b1.leftX, y1);
      ctx.lineTo(b1.rightX, y1);
      ctx.lineTo(b2.rightX, y2);
      ctx.lineTo(b2.leftX, y2);
      ctx.closePath();
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Subtle biological membrane cross ribs
      if (Math.floor(Math.abs(y1) / 100) % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(b1.leftX + 20, y1);
        ctx.lineTo(b1.rightX - 20, y1);
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.14)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    ctx.restore();

    // 2. Render Center Racing Guide Line (Soft Glowing Pearl Pink)
    ctx.save();
    ctx.beginPath();
    let isFirst = true;
    for (let y = startY; y > endY; y -= step) {
      const cx = TrackPath.getCenterX(y);
      if (isFirst) {
        ctx.moveTo(cx, y);
        isFirst = false;
      } else {
        ctx.lineTo(cx, y);
      }
    }
    ctx.setLineDash([16, 20]);
    ctx.strokeStyle = 'rgba(254, 205, 211, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // 3. Render Distance Markers (Up to 100%)
    ctx.save();
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 228, 230, 0.6)';
    for (let y = -600; y >= finishY; y -= 600) {
      if (y < startY && y > endY) {
        const b = TrackPath.getBoundaries(y);
        ctx.beginPath();
        ctx.moveTo(b.leftX + 40, y);
        ctx.lineTo(b.rightX - 40, y);
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 12]);
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.25)';
        ctx.stroke();

        const progressPercent = Math.min(100, Math.round((Math.abs(y) / trackLength) * 100));
        ctx.fillText(`CỘT MỐC ${progressPercent}%`, b.centerX, y - 8);
      }
    }
    ctx.restore();

    // 4. Render Biological Spike Obstacles (Gai Chướng Ngại Vật)
    this.renderSpikes(ctx, spikes, time, cameraY, viewMargin);

    // 5. Render Left and Right Bioluminescent Boundary Walls & F1 Kerbs
    this.renderCurvedWall(ctx, startY, endY, step, time, true);
    this.renderCurvedWall(ctx, startY, endY, step, time, false);

    // 6. Start Line
    if (100 < startY && 100 > endY) {
      const bStart = TrackPath.getBoundaries(100);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bStart.leftX, 100);
      ctx.lineTo(bStart.rightX, 100);
      ctx.lineWidth = 5;
      ctx.setLineDash([14, 14]);
      ctx.strokeStyle = 'rgba(254, 205, 211, 0.75)';
      ctx.stroke();

      ctx.font = '900 13px Inter, sans-serif';
      ctx.fillStyle = 'rgba(254, 205, 211, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('VẠCH XUẤT PHÁT', bStart.centerX, 130);
      ctx.restore();
    }

    // 7. Grand Glowing Ovum / Egg at Finish Line
    const eggX = TrackPath.getCenterX(finishY);
    this.renderEgg(ctx, eggX, finishY, time);
  }

  public renderSpikes(
    ctx: CanvasRenderingContext2D,
    spikes: SpikeObstacle[],
    _time: number,
    cameraY: number,
    viewMargin: number
  ) {
    if (!spikes || spikes.length === 0) return;

    for (const spike of spikes) {
      // Cull offscreen spikes
      if (spike.y > cameraY + viewMargin || spike.y < cameraY - viewMargin) continue;

      ctx.save();
      ctx.translate(spike.x, spike.y);

      const r = spike.radius;
      const pulse = Math.sin(spike.pulsePhase) * 2;
      const effectiveRadius = r + pulse;

      // 1. Pulsating Hazard Glow Aura
      const auraGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.2);
      auraGrad.addColorStop(0, 'rgba(225, 29, 72, 0.55)');
      auraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
      auraGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.beginPath();
      ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = auraGrad;
      ctx.fill();

      // 2. Rotating Biological Thorn Spines (8 sharp thorn blades)
      ctx.save();
      ctx.rotate(spike.rotation);
      const spineCount = 8;
      for (let i = 0; i < spineCount; i++) {
        const spineAngle = (i / spineCount) * Math.PI * 2;
        const outerLen = effectiveRadius * 1.35;
        const baseWidth = 7;

        ctx.save();
        ctx.rotate(spineAngle);

        ctx.beginPath();
        ctx.moveTo(0, -outerLen);
        ctx.lineTo(-baseWidth, -r * 0.4);
        ctx.lineTo(baseWidth, -r * 0.4);
        ctx.closePath();

        const spineGrad = ctx.createLinearGradient(0, -outerLen, 0, 0);
        spineGrad.addColorStop(0, '#FFA8A8');
        spineGrad.addColorStop(0.3, '#E11D48');
        spineGrad.addColorStop(1, '#4C0519');
        ctx.fillStyle = spineGrad;
        ctx.fill();

        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();

      // 3. Central Poisonous Urchin Core
      const coreGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r * 0.85);
      coreGrad.addColorStop(0, '#FFE4E6');
      coreGrad.addColorStop(0.4, '#BE123C');
      coreGrad.addColorStop(1, '#4C0519');

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = '#F43F5E';
      ctx.shadowBlur = 12;
      ctx.fill();

      // Core inner ring
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Pulsing toxic eye center
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3 + pulse * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FACC15';
      ctx.fill();

      ctx.restore();
    }
  }

  private renderEggSanctumDome(ctx: CanvasRenderingContext2D, finishY: number, time: number) {
    ctx.save();
    ctx.translate(0, finishY);

    // 1. Giant Egg Sanctuary Dome Chamber Background
    const domeGrad = ctx.createRadialGradient(0, -50, 80, 0, -50, 680);
    domeGrad.addColorStop(0, 'rgba(159, 18, 57, 0.75)');
    domeGrad.addColorStop(0.4, 'rgba(80, 7, 36, 0.9)');
    domeGrad.addColorStop(0.75, 'rgba(40, 4, 18, 0.95)');
    domeGrad.addColorStop(1, 'rgba(32, 6, 20, 0)');

    ctx.beginPath();
    ctx.arc(0, -50, 680, 0, Math.PI * 2);
    ctx.fillStyle = domeGrad;
    ctx.fill();

    // 2. Concentric Sacred Bio-luminescent Ribs
    const ringCount = 5;
    for (let i = 1; i <= ringCount; i++) {
      const ringRadius = 150 + i * 95;
      const pulse = Math.sin(time * 2 + i * 0.8) * 4;
      ctx.beginPath();
      ctx.arc(0, -50, ringRadius + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(254, 205, 211, ${0.28 - i * 0.04})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 16]);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderCurvedWall(
    ctx: CanvasRenderingContext2D,
    startY: number,
    endY: number,
    step: number,
    time: number,
    isLeft: boolean
  ) {
    ctx.save();

    // 1. Wall Glow Ribbons (Warm Coral / Rose Glow)
    for (let y = startY; y > endY; y -= step) {
      const y1 = y;
      const y2 = y - step;
      const b1 = TrackPath.getBoundaries(y1);
      const b2 = TrackPath.getBoundaries(y2);

      const x1 = isLeft ? b1.leftX : b1.rightX;
      const x2 = isLeft ? b2.leftX : b2.rightX;
      const glowWidth = 38;

      const glowGrad = ctx.createLinearGradient(
        x1 + (isLeft ? 0 : -glowWidth),
        y1,
        x1 + (isLeft ? glowWidth : 0),
        y1
      );
      if (isLeft) {
        glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.75)');
        glowGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
        glowGrad.addColorStop(1, 'rgba(244, 63, 94, 0.75)');
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(isLeft ? x1 + glowWidth : x1 - glowWidth, y1);
      ctx.lineTo(isLeft ? x2 + glowWidth : x2 - glowWidth, y2);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // F1-Style Bioluminescent Kerb Blocks on wall edge (Warm Rose & Pearl White)
      const kerbCycle = Math.floor(Math.abs(y1) / 30) % 2 === 0;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = kerbCycle ? '#F43F5E' : '#FFE4E6';
      ctx.stroke();
    }

    // 2. High-Tech Pulsating Boundary Laser Line
    ctx.beginPath();
    let first = true;
    for (let y = startY; y > endY; y -= step) {
      const b = TrackPath.getBoundaries(y);
      const pulse = Math.sin(time * 3 + y * 0.01) * 2;
      const wx = isLeft ? b.leftX + pulse : b.rightX - pulse;
      if (first) {
        ctx.moveTo(wx, y);
        first = false;
      } else {
        ctx.lineTo(wx, y);
      }
    }
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#FB7185';
    ctx.shadowColor = '#FDA4AF';
    ctx.shadowBlur = 10;
    ctx.stroke();

    ctx.restore();
  }

  private renderEgg(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
    ctx.save();
    ctx.translate(x, y);

    const baseRadius = 84;
    const pulse = Math.sin(time * 2.5) * 6;
    const r = baseRadius + pulse;

    // 1. Giant Outer Radiance Corona
    const outerGrad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.8);
    outerGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    outerGrad.addColorStop(0.3, 'rgba(251, 113, 133, 0.55)');
    outerGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.25)');
    outerGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, r * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = outerGrad;
    ctx.fill();

    // 2. Coronal Rays
    ctx.save();
    ctx.rotate(time * 0.4);
    const rayCount = 14;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayLen = r * 1.6 + Math.sin(time * 4 + i) * 15;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r * 0.8, Math.sin(angle) * r * 0.8);
      ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.stroke();
    }
    ctx.restore();

    // 3. Main Ovum Body
    const eggGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    eggGrad.addColorStop(0, '#FFFFFF');
    eggGrad.addColorStop(0.3, '#FED7AA');
    eggGrad.addColorStop(0.7, '#FB7185');
    eggGrad.addColorStop(1, '#E11D48');

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = eggGrad;
    ctx.shadowColor = '#FDA4AF';
    ctx.shadowBlur = 30;
    ctx.fill();

    // Inner Nucleus
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();

    // Finish Text Label
    ctx.font = '900 14px Inter, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText('ĐÍCH ĐẾN', 0, r + 30);
    ctx.fillText('NOÃN BÀO (TRỨNG)', 0, r + 48);

    ctx.restore();
  }
}
