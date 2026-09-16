export class TrackPath {
  public static readonly TOTAL_LENGTH = 5200;
  public static readonly DEFAULT_WIDTH = 700;

  /**
   * Returns the center X coordinate of the track at distance Y (Y <= 0)
   * Creates a dynamic F1-style circuit with chicanes, high-speed sweepers, and hairpin turns.
   */
  public static getCenterX(y: number): number {
    if (y > 0) return 0;
    const progress = Math.min(1, Math.max(0, -y / TrackPath.TOTAL_LENGTH));

    // Composite harmonic spline:
    // 1. Primary macro curves (left & right grand turns)
    const macro = Math.sin(progress * Math.PI * 2.2) * 260;
    // 2. High-speed chicane & S-bends
    const chicane = Math.sin(progress * Math.PI * 5) * 150;
    // 3. Technical twist in mid-sector
    const technical = Math.sin(progress * Math.PI * 9) * 65 * (progress > 0.3 && progress < 0.85 ? 1 : 0.3);

    // Smooth envelope: keeps starting grid straight (0 to 0.08) and straightens final approach to egg (0.92 to 1)
    let envelope = 1;
    if (progress < 0.08) {
      envelope = Math.sin((progress / 0.08) * (Math.PI / 2));
    } else if (progress > 0.92) {
      envelope = Math.sin(((1 - progress) / 0.08) * (Math.PI / 2));
    }

    return (macro + chicane + technical) * envelope;
  }

  /**
   * Returns track width at distance Y
   */
  public static getWidth(y: number): number {
    if (y > 0) return TrackPath.DEFAULT_WIDTH;
    const progress = Math.min(1, Math.max(0, -y / TrackPath.TOTAL_LENGTH));
    // Narrowing in technical hairpins, widening at start and finish
    const variation = Math.cos(progress * Math.PI * 6) * 55;
    return Math.max(560, Math.min(780, TrackPath.DEFAULT_WIDTH + variation));
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
