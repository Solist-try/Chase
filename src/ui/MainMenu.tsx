import { Button } from './Button';
import './ui.css';

interface MainMenuProps {
  onStart: () => void;
  onSelectLevel: () => void;
}

export function MainMenu({ onStart, onSelectLevel }: MainMenuProps) {
  return (
    <div className="menu-screen menu-screen--main">
      <div className="menu-atmosphere" aria-hidden="true" />
      <header className="menu-brand">
        <p className="menu-kicker">A cozy flight for young explorers</p>
        <h1 className="menu-title">Chase</h1>
        <p className="menu-subtitle">
          Help Ember the dragon gather stars across sunny meadows and quiet woods.
        </p>
      </header>
      <div className="menu-actions">
        <Button size="lg" onClick={onStart}>
          Start Adventure
        </Button>
        <Button variant="secondary" size="lg" onClick={onSelectLevel}>
          Choose Level
        </Button>
      </div>
      <p className="menu-hint">Move with arrows / WASD · Talk with E or Space</p>
    </div>
  );
}
