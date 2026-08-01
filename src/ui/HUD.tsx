import type { DragonStats } from '@characters/Dragon';
import type { LevelRuntimeState } from '@levels/Level';
import './ui.css';

interface HUDProps {
  levelName: string;
  goal: string;
  stats: DragonStats;
  levelState: LevelRuntimeState;
  nearbyHint?: string | null;
}

/** Always-full heart count for kids — no damage UI. */
const FULL_HEARTS = 3;

export function HUD({
  levelName,
  goal,
  levelState,
  nearbyHint,
}: HUDProps) {
  const hearts = FULL_HEARTS;

  return (
    <div className="hud" aria-live="polite">
      <div className="hud__top">
        <div className="hud__level">
          <span className="hud__label">{levelName}</span>
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

          <div className="hud__stat" title="Coins collected">
            <CoinIcon />
            <span className="hud__stat-value">
              {levelState.coinsCollected}
              <span className="hud__stat-total">/{levelState.coinsTotal}</span>
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

function CoinIcon() {
  return (
    <svg
      className="hud__icon hud__icon--coin"
      viewBox="0 0 48 48"
      width="40"
      height="40"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="18" fill="#FFD166" stroke="#1B2A4A" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="12" fill="#FFE566" stroke="#E85D04" strokeWidth="2" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fontFamily="Fredoka, Nunito, sans-serif"
        fill="#E85D04"
      >
        ★
      </text>
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
