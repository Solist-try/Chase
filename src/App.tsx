import { useState } from 'react';
import { soundEngine } from '@engine/SoundEngine';
import { Level1 } from '@levels/Level1';
import { GameCanvas } from './game/GameCanvas';
import {
  HomePage,
  LevelSelect,
  type GameSettings,
} from './ui';

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
    soundEngine.setEnabled(next.soundEnabled);
    if (next.soundEnabled) {
      soundEngine.unlock();
    }
    setSettings(next);
  };

  if (screen === 'home') {
    return (
      <HomePage
        settings={settings}
        onSettingsChange={updateSettings}
        onStart={() => {
          soundEngine.unlock();
          soundEngine.play('uiClick');
          setLevelId(Level1.id);
          setScreen('play');
        }}
        onChooseLevel={() => {
          soundEngine.unlock();
          soundEngine.play('uiClick');
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
          soundEngine.unlock();
          soundEngine.play('uiClick');
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
      onQuit={() => {
        soundEngine.stopMusic();
        setScreen('home');
      }}
      onLevelChange={(id) => setLevelId(id)}
    />
  );
}
