import { useState } from 'react';
import { Button } from './Button';
import './HomePage.css';

export type Difficulty = 'easy' | 'normal';

export interface GameSettings {
  soundEnabled: boolean;
  difficulty: Difficulty;
}

interface HomePageProps {
  settings: GameSettings;
  onSettingsChange: (next: GameSettings) => void;
  onStart: () => void;
  onCustomize?: () => void;
  onChooseLevel?: () => void;
}

const TITLE = 'Dragon Adventure!';

const RAINBOW = [
  '#FF4D6D',
  '#FF9F1C',
  '#FFE566',
  '#80ED99',
  '#00BBF9',
  '#B5179E',
  '#F72585',
];

export function HomePage({
  settings,
  onSettingsChange,
  onStart,
  onCustomize,
  onChooseLevel,
}: HomePageProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="home">
      <div className="home__sky" aria-hidden="true">
        <span className="home__cloud home__cloud--a" />
        <span className="home__cloud home__cloud--b" />
        <span className="home__cloud home__cloud--c" />
        <span className="home__hill home__hill--left" />
        <span className="home__hill home__hill--right" />
      </div>

      <header className="home__hero">
        <h1 className="home__title" aria-label={TITLE}>
          {TITLE.split('').map((char, index) =>
            char === ' ' ? (
              <span key={`sp-${index}`} className="home__title-space">
                {' '}
              </span>
            ) : (
              <span
                key={`${char}-${index}`}
                className="home__title-letter"
                style={{
                  color: RAINBOW[index % RAINBOW.length],
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {char}
              </span>
            ),
          )}
        </h1>
        <p className="home__tagline">A bright little quest for young explorers</p>
      </header>

      <div className="home__dragon-wrap" aria-hidden="true">
        <CuteDragonIllustration />
      </div>

      <div className="home__actions">
        <Button size="lg" className="home__btn home__btn--start" onClick={onStart}>
          Start Game
        </Button>
        {onCustomize ? (
          <Button
            size="lg"
            variant="secondary"
            className="home__btn home__btn--customize"
            onClick={onCustomize}
          >
            Dress Up
          </Button>
        ) : null}
        <Button
          size="lg"
          variant="secondary"
          className="home__btn home__btn--settings"
          onClick={() => setSettingsOpen((open) => !open)}
          aria-expanded={settingsOpen}
          aria-controls="home-settings"
        >
          Settings
        </Button>
      </div>

      {onChooseLevel ? (
        <button type="button" className="home__level-link" onClick={onChooseLevel}>
          Choose a level
        </button>
      ) : null}

      {settingsOpen ? (
        <section
          id="home-settings"
          className="home__settings"
          role="dialog"
          aria-label="Game settings"
        >
          <h2 className="home__settings-title">Settings</h2>

          <div className="home__setting-row">
            <span className="home__setting-label">Sound</span>
            <div className="home__toggle-group" role="group" aria-label="Sound">
              <button
                type="button"
                className={`home__chip${settings.soundEnabled ? ' is-active' : ''}`}
                onClick={() =>
                  onSettingsChange({ ...settings, soundEnabled: true })
                }
              >
                Unmute
              </button>
              <button
                type="button"
                className={`home__chip${!settings.soundEnabled ? ' is-active' : ''}`}
                onClick={() =>
                  onSettingsChange({ ...settings, soundEnabled: false })
                }
              >
                Mute
              </button>
            </div>
          </div>

          <div className="home__setting-row">
            <span className="home__setting-label">Difficulty</span>
            <div className="home__toggle-group" role="group" aria-label="Difficulty">
              <button
                type="button"
                className={`home__chip${settings.difficulty === 'easy' ? ' is-active' : ''}`}
                onClick={() =>
                  onSettingsChange({ ...settings, difficulty: 'easy' })
                }
              >
                Easy
              </button>
              <button
                type="button"
                className={`home__chip${settings.difficulty === 'normal' ? ' is-active' : ''}`}
                onClick={() =>
                  onSettingsChange({ ...settings, difficulty: 'normal' })
                }
              >
                Normal
              </button>
            </div>
          </div>

          <p className="home__settings-hint">
            Easy = slower enemies and floatier jumps. Perfect for first flights!
          </p>

          <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
            Done
          </Button>
        </section>
      ) : null}
    </div>
  );
}

/** Inline cute dragon — rounded shapes, soft colors, gentle bob. */
function CuteDragonIllustration() {
  return (
    <svg
      className="home__dragon"
      viewBox="0 0 280 220"
      width="280"
      height="220"
      role="img"
      aria-label="Cute dragon"
    >
      <ellipse cx="140" cy="198" rx="70" ry="12" fill="rgba(27,42,74,0.12)" />
      {/* Wings */}
      <path
        className="home__dragon-wing home__dragon-wing--left"
        d="M88 110 C40 70 36 40 70 36 C86 56 92 82 96 108 Z"
        fill="#00BBF9"
      />
      <path
        className="home__dragon-wing home__dragon-wing--right"
        d="M192 110 C240 70 244 40 210 36 C194 56 188 82 184 108 Z"
        fill="#80ED99"
      />
      {/* Body */}
      <ellipse cx="130" cy="120" rx="58" ry="52" fill="#FF4D6D" />
      <ellipse cx="140" cy="130" rx="42" ry="36" fill="#FFE566" />
      {/* Head */}
      <ellipse cx="188" cy="88" rx="36" ry="30" fill="#FF4D6D" />
      <ellipse cx="210" cy="96" rx="18" ry="12" fill="#FF9F1C" />
      {/* Horn */}
      <path d="M178 66 L186 38 L198 66 Z" fill="#B5179E" />
      {/* Eyes */}
      <circle cx="180" cy="84" r="7" fill="#FFFAF0" />
      <circle cx="198" cy="82" r="7" fill="#FFFAF0" />
      <circle cx="182" cy="84" r="3.2" fill="#1B2A4A" />
      <circle cx="200" cy="82" r="3.2" fill="#1B2A4A" />
      {/* Cheeks + smile */}
      <circle cx="172" cy="96" r="5" fill="#FF85A1" />
      <circle cx="208" cy="94" r="5" fill="#FF85A1" />
      <path
        d="M186 100 Q198 110 210 98"
        stroke="#1B2A4A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Spines */}
      <path d="M110 96 L118 72 L128 96 Z" fill="#F72585" />
      <path d="M128 90 L136 68 L146 92 Z" fill="#F72585" />
      <path d="M148 88 L156 70 L164 92 Z" fill="#F72585" />
      {/* Feet */}
      <ellipse cx="112" cy="168" rx="16" ry="10" fill="#FF9F1C" />
      <ellipse cx="168" cy="168" rx="16" ry="10" fill="#FF9F1C" />
      {/* Sparkles */}
      <circle className="home__sparkle" cx="64" cy="56" r="4" fill="#FFFF66" />
      <circle className="home__sparkle home__sparkle--b" cx="230" cy="48" r="3" fill="#FFF" />
      <circle className="home__sparkle home__sparkle--c" cx="248" cy="96" r="3.5" fill="#FFE566" />
    </svg>
  );
}
