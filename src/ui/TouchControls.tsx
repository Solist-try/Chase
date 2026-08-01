import type { InputState } from '@engine/types';
import './ui.css';

interface TouchControlsProps {
  onChange: (partial: Partial<InputState>) => void;
}

/** Large on-screen controls for tablets / younger players. */
export function TouchControls({ onChange }: TouchControlsProps) {
  const press = (key: keyof InputState, value: boolean) => () => {
    onChange({ [key]: value });
  };

  return (
    <div className="touch-controls" aria-hidden="true">
      <div className="touch-pad">
        <button
          type="button"
          className="touch-btn"
          onPointerDown={press('up', true)}
          onPointerUp={press('up', false)}
          onPointerLeave={press('up', false)}
        >
          ▲
        </button>
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
        <button
          type="button"
          className="touch-btn"
          onPointerDown={press('down', true)}
          onPointerUp={press('down', false)}
          onPointerLeave={press('down', false)}
        >
          ▼
        </button>
      </div>
      <button
        type="button"
        className="touch-btn touch-btn--action"
        onPointerDown={press('action', true)}
        onPointerUp={press('action', false)}
        onPointerLeave={press('action', false)}
      >
        Talk
      </button>
    </div>
  );
}
