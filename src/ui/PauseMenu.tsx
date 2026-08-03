import './ui.css';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onBackHome: () => void;
}

const ACTIONS = [
  {
    key: 'resume',
    label: 'Resume',
    className: 'pause-btn pause-btn--resume',
    handler: 'onResume' as const,
  },
  {
    key: 'restart',
    label: 'Restart Level',
    className: 'pause-btn pause-btn--restart',
    handler: 'onRestart' as const,
  },
  {
    key: 'home',
    label: 'Back to Home',
    className: 'pause-btn pause-btn--home',
    handler: 'onBackHome' as const,
  },
] as const;

export function PauseMenu({ onResume, onRestart, onBackHome }: PauseMenuProps) {
  const handlers = {
    onResume,
    onRestart,
    onBackHome,
  };

  return (
    <div className="overlay pause-overlay">
      <div
        className="pause-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
      >
        <p className="pause-kicker">Take a breath</p>
        <h2 id="pause-title" className="pause-title">
          Paused!
        </h2>
        <p className="pause-copy">Ember is resting. What next?</p>

        <div className="pause-actions">
          {ACTIONS.map((action) => (
            <button
              key={action.key}
              type="button"
              className={action.className}
              onClick={handlers[action.handler]}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
