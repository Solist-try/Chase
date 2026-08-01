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

export function HUD({
  levelName,
  goal,
  stats,
  levelState,
  nearbyHint,
}: HUDProps) {
  return (
    <div className="hud" aria-live="polite">
      <div className="hud__top">
        <div className="hud__level">
          <span className="hud__label">{levelName}</span>
          <span className="hud__goal">{goal}</span>
        </div>
        <div className="hud__meters">
          <span className="hud__pill" title="Stars">
            ★ {levelState.starsCollected}/{levelState.starsTotal}
          </span>
          <span className="hud__pill" title="Coins">
            ● {levelState.coinsCollected}/{levelState.coinsTotal}
          </span>
          <span className="hud__pill hud__pill--hearts" title="Hearts">
            {'♥'.repeat(stats.health)}
            <span className="hud__hearts-empty">
              {'♡'.repeat(Math.max(0, stats.maxHealth - stats.health))}
            </span>
          </span>
        </div>
      </div>
      {nearbyHint ? <p className="hud__hint">{nearbyHint}</p> : null}
      {levelState.goalComplete ? (
        <p className="hud__complete">You did it! Press N for the next path.</p>
      ) : null}
    </div>
  );
}
