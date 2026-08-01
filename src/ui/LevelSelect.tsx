import { listLevels } from '@levels/LevelLoader';
import { Button } from './Button';
import './ui.css';

interface LevelSelectProps {
  onBack: () => void;
  onPick: (levelId: string) => void;
}

export function LevelSelect({ onBack, onPick }: LevelSelectProps) {
  const levels = listLevels();

  return (
    <div className="menu-screen menu-screen--levels">
      <div className="menu-atmosphere menu-atmosphere--woods" aria-hidden="true" />
      <header className="menu-brand menu-brand--compact">
        <h1 className="menu-title menu-title--sm">Choose a Path</h1>
        <p className="menu-subtitle">Pick a place for Ember to explore.</p>
      </header>
      <ul className="level-list">
        {levels.map((level, index) => (
          <li key={level.id}>
            <button
              type="button"
              className="level-item"
              onClick={() => onPick(level.id)}
            >
              <span className="level-item__index">{index + 1}</span>
              <span className="level-item__copy">
                <strong>{level.name}</strong>
                <span>{level.goal.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
