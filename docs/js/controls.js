// ---------------------------------------------------------
// Dragon Adventure – Controls
// Simple, readable keyboard input for kids
// ---------------------------------------------------------

export class Controls {
  constructor() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.dash = false;

    this.#addListeners();
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
  }
}

export default Controls;
