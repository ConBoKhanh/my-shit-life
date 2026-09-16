import { TadpoleEntity } from '../entities/Tadpole';

export class TadpoleRenderer {
  public renderTadpole(ctx: CanvasRenderingContext2D, tadpole: TadpoleEntity) {
    ctx.save();
    ctx.translate(tadpole.x, tadpole.y);
    ctx.rotate(tadpole.angle);

    const isPlayer = tadpole.type === 'player';
    const r = tadpole.radius;

    // Post-stun immunity grace period flicker (invulnerability visual feedback)
    if (tadpole.spikeImmunityTimer > 0 && !tadpole.isStunned) {
      const flicker = Math.sin(tadpole.spikeImmunityTimer * 0.035);
      if (flicker < 0) {
        ctx.globalAlpha = 0.5;
      }
    }

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

    // 6. Stun Visual Effect (3 Orbiting Dizzy Stars + Stun Ring)
    if (tadpole.isStunned) {
      this.renderStunEffect(ctx, r, tadpole.stunRotation);
    }

    // 7. Name / Indicator Plate (High-Contrast Capsule Badges)
    this.renderNameBadge(ctx, tadpole, isPlayer, r);

    ctx.restore();
  }

  private renderStunEffect(ctx: CanvasRenderingContext2D, r: number, stunRot: number) {
    ctx.save();
    // Rotate upright
    ctx.rotate(0);

    // Dizziness spiral halo
    ctx.beginPath();
    ctx.arc(0, -r * 0.8, r * 1.4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.stroke();

    // 3 Orbiting Dizzy Stars
    const starCount = 3;
    const orbitRadius = r * 1.5;
    for (let i = 0; i < starCount; i++) {
      const angle = stunRot + (i / starCount) * Math.PI * 2;
      const sx = Math.cos(angle) * orbitRadius;
      const sy = -r * 0.8 + Math.sin(angle) * (orbitRadius * 0.45); // squished 3D ellipse orbit

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(stunRot * 2);

      // Draw 4-point golden star
      ctx.beginPath();
      const starR = 5.5;
      for (let s = 0; s < 8; s++) {
        const rad = s % 2 === 0 ? starR : starR * 0.4;
        const sa = (s / 8) * Math.PI * 2;
        const px = Math.cos(sa) * rad;
        const py = Math.sin(sa) * rad;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#FACC15';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 8;
      ctx.fill();

      ctx.restore();
    }

    // "CHOÁNG!" Alert Tag
    ctx.font = '900 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F43F5E';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText('CHOÁNG 1s!', 0, -r * 2.8);

    ctx.restore();
  }

  private renderNameBadge(
    ctx: CanvasRenderingContext2D,
    tadpole: TadpoleEntity,
    isPlayer: boolean,
    r: number
  ) {
    ctx.save();
    // Rotate back to stay upright regardless of tadpole swimming direction
    ctx.rotate(-tadpole.angle);

    if (isPlayer) {
      // 1. Player Glowing Pointer Triangle
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.4);
      ctx.lineTo(-6, -r * 2.1);
      ctx.lineTo(6, -r * 2.1);
      ctx.closePath();
      ctx.fillStyle = '#00F2FE';
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 8;
      ctx.fill();

      // 2. High-Contrast Golden Pill Badge
      const text = 'BẠN';
      ctx.font = '900 12px Inter, sans-serif';
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const padX = 8;
      const boxW = textWidth + padX * 2;
      const boxH = 18;
      const boxY = -r * 3.4;

      // Badge Box Background (Dark slate with blur effect)
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, boxY - boxH / 2, boxW, boxH, 9);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Gold / Cyan Accent Border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#FACC15';
      ctx.shadowColor = '#FACC15';
      ctx.shadowBlur = 4;
      ctx.stroke();

      // Text inside Badge (Bright Gold)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FACC15';
      ctx.shadowBlur = 0;
      ctx.fillText(text, 0, boxY + 1);
    } else {
      // For Bots: Render sleek mini badge with vibrant neon color (no plain white text!)
      const shortName = tadpole.name.replace(/^Nòng Nọc\s*/i, ''); // e.g. "Tỷ Phú Đô La", "Chủ Tịch", "Bác Sĩ"
      ctx.font = 'bold 10px Inter, sans-serif';
      const textMetrics = ctx.measureText(shortName);
      const textWidth = textMetrics.width;
      const padX = 6;
      const boxW = textWidth + padX * 2;
      const boxH = 15;
      const boxY = -r * 2.2;

      // Dark capsule background
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, boxY - boxH / 2, boxW, boxH, 7);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fill();

      // Subtle bot color border
      ctx.lineWidth = 1;
      ctx.strokeStyle = tadpole.color || 'rgba(255, 255, 255, 0.35)';
      ctx.stroke();

      // Text (Vibrant matching bot color or warm neon)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = tadpole.color || '#FACC15';
      ctx.fillText(shortName, 0, boxY);
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
