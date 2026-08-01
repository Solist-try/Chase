import { useState } from 'react';
import { Level1 } from '@levels/Level1';
import { GameCanvas } from './game/GameCanvas';
import {
  HomePage,
  LevelSelect,
  type GameSettings,
} from './ui';
import { playSound, setSoundEnabled } from './ui/sound';

type Screen = 'home' | 'levels' | 'play';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  difficulty: 'easy',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [levelId, setLevelId] = useState(Level1.id);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  const updateSettings = (next: GameSettings) => {
    setSoundEnabled(next.soundEnabled);
    setSettings(next);
  };

  if (screen === 'home') {
    return (
      <HomePage
        settings={settings}
        onSettingsChange={updateSettings}
        onStart={() => {
          playSound('uiClick');
          setLevelId(Level1.id);
          setScreen('play');
        }}
        onChooseLevel={() => {
          playSound('uiClick');
          setScreen('levels');
        }}
      />
    );
  }

  if (screen === 'levels') {
    return (
      <LevelSelect
        onBack={() => setScreen('home')}
        onPick={(id) => {
          setLevelId(id);
          setScreen('play');
        }}
      />
    );
  }

  return (
    <GameCanvas
      levelId={levelId}
      settings={settings}
      onQuit={() => setScreen('home')}
      onLevelChange={(id) => setLevelId(id)}
    />
  );
}
