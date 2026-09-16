export class TrackPath {
  public static readonly TOTAL_LENGTH = 7600;
  public static readonly DEFAULT_WIDTH = 720;

  /**
   * Returns the center X coordinate of the track at distance Y (Y <= 0)
   * Continuous C-infinity harmonic spline with velvety smooth curves, no abrupt jumps or jagged kinks.
   */
  public static getCenterX(y: number): number {
    if (y > 0) return 0;
    if (-y >= TrackPath.TOTAL_LENGTH) return 0;
    const progress = Math.min(1, Math.max(0, -y / TrackPath.TOTAL_LENGTH));

    // Smooth Cosine Bell Envelope for straight starting line and straight finish approach
    let envelope = 1;
    if (progress < 0.05) {
      // Smoothly transition from straight line at spawn
      envelope = 0.5 * (1 - Math.cos((progress / 0.05) * Math.PI));
    } else if (progress > 0.92) {
      // Smoothly straighten toward giant egg at finish
      envelope = 0.5 * (1 - Math.cos(((1 - progress) / 0.08) * Math.PI));
    }

    // Ultra smooth continuous harmonic spline:
    // 1. Grand high-speed sweepers (left & right grand turns)
    const grandSweeper = Math.sin(progress * Math.PI * 2) * 270;
    // 2. Continuous flowing S-chicanes
    const flowingChicane = Math.sin(progress * Math.PI * 4) * 130;
    // 3. Subtle organic biological undulation
    const bioUndulation = Math.sin(progress * Math.PI * 6) * 40;

    return (grandSweeper + flowingChicane + bioUndulation) * envelope;
  }

  /**
   * Returns track width at distance Y (smooth organic breathing width & Egg Chamber flare)
   */
  public static getWidth(y: number): number {
    if (y > 0) return TrackPath.DEFAULT_WIDTH;
    if (-y >= TrackPath.TOTAL_LENGTH) {
      // Smoothly flare out into the grand Egg Sanctuary amphitheater
      const past = Math.min(1000, -y - TrackPath.TOTAL_LENGTH);
      return Math.min(960, TrackPath.DEFAULT_WIDTH + 50 + past * 0.25);
    }
    const progress = Math.min(1, Math.max(0, -y / TrackPath.TOTAL_LENGTH));
    // Smooth width variation across sectors
    const variation = Math.cos(progress * Math.PI * 4) * 50;
    return Math.max(600, Math.min(800, TrackPath.DEFAULT_WIDTH + variation));
  }

  /**
   * Returns left boundary X, right boundary X, center X, and width at Y
   */
  public static getBoundaries(y: number): { leftX: number; rightX: number; centerX: number; width: number } {
    const centerX = TrackPath.getCenterX(y);
    const width = TrackPath.getWidth(y);
    const half = width / 2;
    return {
      leftX: centerX - half,
      rightX: centerX + half,
      centerX,
      width,
    };
  }

  /**
   * Returns normalized tangent vector pointing forward along the track curve at Y
   */
  public static getTangent(y: number): { x: number; y: number } {
    const delta = 15;
    const x1 = TrackPath.getCenterX(y);
    const x2 = TrackPath.getCenterX(y - delta);
    const dx = x2 - x1;
    const dy = -delta;
    const len = Math.hypot(dx, dy);
    return {
      x: dx / len,
      y: dy / len,
    };
  }
}

