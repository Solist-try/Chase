// ---------------------------------------------------------
// Dragon Adventure – Controls
// Keyboard + on-screen touch buttons for phones/tablets
// ---------------------------------------------------------

export class Controls {
  constructor() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.dash = false;

    this._touchCleanups = [];
    this.#addListeners();
    this.#wireTouchPad();
  }

  #addListeners() {
    this._onKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.left = true;
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          this.right = true;
          break;

        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
        case 'Spacebar':
          this.jump = true;
          e.preventDefault();
          break;

        case 'Shift':
          this.dash = true;
          break;
      }

      // Some browsers / tools report Space via event.code only.
      if (e.code === 'Space') {
        this.jump = true;
        e.preventDefault();
      }
    };

    this._onKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.left = false;
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          this.right = false;
          break;

        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
        case 'Spacebar':
          this.jump = false;
          break;

        case 'Shift':
          this.dash = false;
          break;
      }

      if (e.code === 'Space') {
        this.jump = false;
      }
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * Wire big on-screen Left / Right / Jump buttons.
   * Uses pointer events so mouse, touch, and pen all work.
   */
  #wireTouchPad() {
    const pad = document.getElementById('touchControls');
    if (!pad) return;

    pad.hidden = false;

    const bind = (id, prop) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const press = (event) => {
        event.preventDefault();
        this[prop] = true;
        btn.classList.add('is-pressed');
      };
      const release = (event) => {
        if (event) event.preventDefault();
        this[prop] = false;
        btn.classList.remove('is-pressed');
      };

      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('pointercancel', release);
      // Avoid the 300ms click delay / accidental double-fire on some mobiles
      btn.addEventListener('contextmenu', (e) => e.preventDefault());

      this._touchCleanups.push(() => {
        btn.removeEventListener('pointerdown', press);
        btn.removeEventListener('pointerup', release);
        btn.removeEventListener('pointerleave', release);
        btn.removeEventListener('pointercancel', release);
        release();
      });
    };

    bind('touchLeft', 'left');
    bind('touchRight', 'right');
    bind('touchJump', 'jump');
  }

  /** Clear keys and remove listeners (when leaving the game screen). */
  dispose() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.dash = false;

    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
    }
    if (this._onKeyUp) {
      window.removeEventListener('keyup', this._onKeyUp);
    }

    this._touchCleanups.forEach((fn) => fn());
    this._touchCleanups = [];

    const pad = document.getElementById('touchControls');
    if (pad) pad.hidden = true;
  }
}

export default Controls;
