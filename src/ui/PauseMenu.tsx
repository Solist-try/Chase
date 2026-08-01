import { Button } from './Button';
import './ui.css';

interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  return (
    <div className="overlay">
      <div className="overlay__panel" role="dialog" aria-labelledby="pause-title">
        <h2 id="pause-title">Paused</h2>
        <p>Ember is resting. Ready to fly again?</p>
        <div className="overlay__actions">
          <Button size="lg" onClick={onResume}>
            Resume
          </Button>
          <Button variant="secondary" onClick={onQuit}>
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
