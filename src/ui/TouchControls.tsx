import type { InputState } from '@engine/types';
import './ui.css';

type TouchKey = 'left' | 'right' | 'jump' | 'dash' | 'action';

interface TouchControlsProps {
  onChange: (partial: Partial<InputState>) => void;
}

/** Large on-screen controls for tablets / younger players. */
export function TouchControls({ onChange }: TouchControlsProps) {
  const press = (key: TouchKey, value: boolean) => () => {
    onChange({ [key]: value });
  };

  return (
    <div className="touch-controls" aria-hidden="true">
      <div className="touch-pad">
        <div className="touch-pad__mid">
          <button
            type="button"
            className="touch-btn"
            onPointerDown={press('left', true)}
            onPointerUp={press('left', false)}
            onPointerLeave={press('left', false)}
          >
            ◀
          </button>
          <button
            type="button"
            className="touch-btn"
            onPointerDown={press('right', true)}
            onPointerUp={press('right', false)}
            onPointerLeave={press('right', false)}
          >
            ▶
          </button>
        </div>
      </div>
      <div className="touch-actions">
        <button
          type="button"
          className="touch-btn touch-btn--dash"
          onPointerDown={press('dash', true)}
          onPointerUp={press('dash', false)}
          onPointerLeave={press('dash', false)}
        >
          Dash
        </button>
        <button
          type="button"
          className="touch-btn touch-btn--action"
          onPointerDown={press('jump', true)}
          onPointerUp={press('jump', false)}
          onPointerLeave={press('jump', false)}
        >
          Jump
        </button>
        <button
          type="button"
          className="touch-btn touch-btn--talk"
          onPointerDown={press('action', true)}
          onPointerUp={press('action', false)}
          onPointerLeave={press('action', false)}
        >
          Talk
        </button>
      </div>
    </div>
  );
}
