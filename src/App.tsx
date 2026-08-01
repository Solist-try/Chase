import { useEffect, useState } from 'react';
import { preloadAssets } from '@assets/preload';
import { soundEngine } from '@engine/SoundEngine';
import { Level1 } from '@levels/Level1';
import { GameCanvas } from './game/GameCanvas';
import {
  HomePage,
  LevelSelect,
  LoadingScreen,
  type GameSettings,
} from './ui';

type Screen = 'loading' | 'home' | 'levels' | 'play';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  difficulty: 'easy',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [levelId, setLevelId] = useState(Level1.id);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let active = true;
    void preloadAssets((progress) => {
      if (!active) return;
      setLoadProgress(progress.ratio);
    }).then(() => {
      if (!active) return;
      setLoadProgress(1);
      setScreen('home');
    });
    return () => {
      active = false;
    };
  }, []);

  const updateSettings = (next: GameSettings) => {
    soundEngine.setEnabled(next.soundEnabled);
    if (next.soundEnabled) {
      soundEngine.unlock();
    }
    setSettings(next);
  };

  if (screen === 'loading') {
    return <LoadingScreen progress={loadProgress} />;
  }

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
