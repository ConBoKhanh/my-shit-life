import { TadpoleEntity } from '../entities/Tadpole';

export class TadpoleRenderer {
  public renderTadpole(ctx: CanvasRenderingContext2D, tadpole: TadpoleEntity) {
    ctx.save();
    ctx.translate(tadpole.x, tadpole.y);
    ctx.rotate(tadpole.angle);

    const isPlayer = tadpole.type === 'player';
    const r = tadpole.radius;

    // 1. Slow penalty effect visual (red warning aura)
    if (tadpole.isSlowed) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
    }

    // 2. Player distinct aura glow
    if (isPlayer) {
      const glowGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.4);
      glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.55)');
      glowGrad.addColorStop(0.5, 'rgba(0, 242, 254, 0.35)');
      glowGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');

      ctx.beginPath();
      ctx.arc(0, 0, r * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }

    // 3. Render Undulating Tail using multi-joint Bezier curve
    this.renderTail(ctx, tadpole, isPlayer);

    // 4. Render Head Body (Streamlined Oval/Egg shape)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.25, r * 0.95, 0, 0, Math.PI * 2);

    const headGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r * 1.3);
    if (isPlayer) {
      headGrad.addColorStop(0, '#FFFFFF');
      headGrad.addColorStop(0.4, '#FFE57F');
      headGrad.addColorStop(1, '#FFB300');
    } else {
      headGrad.addColorStop(0, '#FFFFFF');
      headGrad.addColorStop(0.5, tadpole.color);
      headGrad.addColorStop(1, tadpole.glowColor);
    }
    ctx.fillStyle = headGrad;
    ctx.fill();

    // Outline
    ctx.lineWidth = isPlayer ? 2.5 : 1.5;
    ctx.strokeStyle = isPlayer ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();
    ctx.restore();

    // 5. Render Expressive Eyes
    this.renderEyes(ctx, r, isPlayer);

    // 6. Name / Indicator Plate
    if (isPlayer) {
      ctx.save();
      // Rotate back to stay upright
      ctx.rotate(-tadpole.angle);

      // Glowing pointer triangle
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.5);
      ctx.lineTo(-7, -r * 2.3);
      ctx.lineTo(7, -r * 2.3);
      ctx.closePath();
      ctx.fillStyle = '#00F2FE';
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Text Badge
      ctx.font = '900 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FACC15';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText('BẠN', 0, -r * 2.7);
      ctx.restore();
    }

    ctx.restore();
  }

  private renderTail(ctx: CanvasRenderingContext2D, tadpole: TadpoleEntity, isPlayer: boolean) {
    ctx.save();
    ctx.beginPath();

    const segCount = 6;
    const totalLength = tadpole.radius * (isPlayer ? 4.2 : 3.6);
    const segLen = totalLength / segCount;
    const waveFreq = 1.3;
    const waveAmp = tadpole.radius * 0.85;

    ctx.moveTo(-tadpole.radius * 0.8, 0);

    let prevX = -tadpole.radius * 0.8;
    let prevY = 0;

    for (let i = 1; i <= segCount; i++) {
      const segX = -tadpole.radius * 0.8 - i * segLen;
      const progress = i / segCount;
      const amp = waveAmp * progress;
      const segY = Math.sin(tadpole.tailPhase - i * waveFreq) * amp;

      const cpX = (prevX + segX) / 2;
      const cpY = (prevY + segY) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);

      prevX = segX;
      prevY = segY;
    }
    ctx.lineTo(prevX, prevY);

    ctx.lineWidth = isPlayer ? 4.5 : 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const tailGrad = ctx.createLinearGradient(0, 0, -totalLength, 0);
    if (isPlayer) {
      tailGrad.addColorStop(0, 'rgba(255, 215, 0, 0.95)');
      tailGrad.addColorStop(1, 'rgba(0, 242, 254, 0.1)');
    } else {
      tailGrad.addColorStop(0, tadpole.color);
      tailGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    }
    ctx.strokeStyle = tailGrad;
    ctx.stroke();

    ctx.restore();
  }

  private renderEyes(ctx: CanvasRenderingContext2D, r: number, isPlayer: boolean) {
    const eyeOffsetX = r * 0.45;
    const eyeOffsetY = r * 0.42;
    const eyeR = isPlayer ? r * 0.28 : r * 0.22;

    // Left Eye
    ctx.beginPath();
    ctx.arc(eyeOffsetX, -eyeOffsetY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeOffsetX + eyeR * 0.35, -eyeOffsetY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = isPlayer ? '#0F172A' : '#1E293B';
    ctx.fill();

    // Left Eye Shine
    ctx.beginPath();
    ctx.arc(eyeOffsetX + eyeR * 0.5, -eyeOffsetY - eyeR * 0.2, eyeR * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Right Eye
    ctx.beginPath();
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(eyeOffsetX + eyeR * 0.35, eyeOffsetY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = isPlayer ? '#0F172A' : '#1E293B';
    ctx.fill();

    // Right Eye Shine
    ctx.beginPath();
    ctx.arc(eyeOffsetX + eyeR * 0.5, eyeOffsetY - eyeR * 0.2, eyeR * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
}
