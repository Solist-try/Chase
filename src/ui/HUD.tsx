import type { DragonStats } from '@characters/Dragon';
import type { LevelRuntimeState } from '@levels/Level';
import './ui.css';

interface HUDProps {
  levelName: string;
  goal: string;
  stats: DragonStats;
  levelState: LevelRuntimeState;
  dragonName?: string;
  nearbyHint?: string | null;
}

/** Always-full heart count for kids — no damage UI. */
const FULL_HEARTS = 3;

export function HUD({
  levelName,
  goal,
  levelState,
  dragonName,
  nearbyHint,
}: HUDProps) {
  const hearts = FULL_HEARTS;

  return (
    <div className="hud" aria-live="polite">
      <div className="hud__top">
        <div className="hud__level">
          <span className="hud__label">{levelName}</span>
          {dragonName ? (
            <span className="hud__dragon-name">{dragonName}</span>
          ) : null}
          <span className="hud__goal">{goal}</span>
        </div>

        <div className="hud__meters">
          <div className="hud__stat" title="Stars collected">
            <StarIcon />
            <span className="hud__stat-value">
              {levelState.starsCollected}
              <span className="hud__stat-total">/{levelState.starsTotal}</span>
            </span>
          </div>

          <div className="hud__stat" title="Rainbow gems collected">
            <GemIcon />
            <span className="hud__stat-value">
              {levelState.gemsCollected}
              <span className="hud__stat-total">/{levelState.gemsTotal}</span>
            </span>
          </div>

          <div
            className="hud__stat hud__stat--hearts"
            title="Dragon health — always full and happy!"
            aria-label={`${hearts} full hearts`}
          >
            {Array.from({ length: hearts }, (_, i) => (
              <HeartIcon key={i} />
            ))}
          </div>
        </div>
      </div>

      {nearbyHint ? <p className="hud__hint">{nearbyHint}</p> : null}
      {levelState.goalComplete ? (
        <p className="hud__complete">You did it! Press N for the next path.</p>
      ) : null}
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      className="hud__icon hud__icon--star"
      viewBox="0 0 48 48"
      width="40"
      height="40"
      aria-hidden="true"
    >
      <polygon
        points="24,4 29.5,18 44,18.5 32.5,28 36.5,42 24,33.5 11.5,42 15.5,28 4,18.5 18.5,18"
        fill="#FFD166"
        stroke="#1B2A4A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="22" r="3" fill="#FFF8DC" />
    </svg>
  );
}

function GemIcon() {
  return (
    <svg
      className="hud__icon hud__icon--gem"
      viewBox="0 0 48 48"
      width="40"
      height="40"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hudGemGrad" x1="8" y1="6" x2="40" y2="42">
          <stop offset="0%" stopColor="#FF4D6D" />
          <stop offset="35%" stopColor="#FFE566" />
          <stop offset="70%" stopColor="#00BBF9" />
          <stop offset="100%" stopColor="#B5179E" />
        </linearGradient>
      </defs>
      <polygon
        points="24,4 40,24 24,44 8,24"
        fill="url(#hudGemGrad)"
        stroke="#1B2A4A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon points="24,10 30,24 24,24 18,24" fill="rgba(255,250,240,0.45)" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      className="hud__icon hud__icon--heart"
      viewBox="0 0 48 48"
      width="36"
      height="36"
      aria-hidden="true"
    >
      <path
        d="M24 42 C24 42 6 30 6 18 C6 11 11 7 16.5 7 C20 7 22.5 9 24 11.5 C25.5 9 28 7 31.5 7 C37 7 42 11 42 18 C42 30 24 42 24 42Z"
        fill="#FF6B8A"
        stroke="#1B2A4A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="17" r="3" fill="#FFB3C6" />
    </svg>
  );
}
