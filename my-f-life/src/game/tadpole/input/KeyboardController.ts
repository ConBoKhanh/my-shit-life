import type { InputState } from './InputState';
export type { InputState };

export class KeyboardController {
  private keys: Record<string, boolean> = {};
  private active = false;

  private handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in inputs
    const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'select' || targetTag === 'textarea') {
      return;
    }

    if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      this.keys[e.code] = true;
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      this.keys[e.code] = false;
      e.preventDefault();
    }
  };

  public attach() {
    if (this.active) return;
    this.active = true;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public detach() {
    if (!this.active) return;
    this.active = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.keys = {};
  }

  public getInput(): InputState {
    let dx = 0;
    let dy = 0;

    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;

    let magnitude = Math.hypot(dx, dy);
    if (magnitude > 1) {
      dx /= magnitude;
      dy /= magnitude;
      magnitude = 1;
    }

    return {
      x: dx,
      y: dy,
      magnitude,
    };
  }
}
