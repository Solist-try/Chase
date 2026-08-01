import { useEffect, useState } from 'react';
import { preloadAssets } from '@assets/preload';
import {
  DEFAULT_DRAGON_LOOK,
  type DragonLook,
} from '@characters/dragonLooks';
import { soundEngine } from '@engine/SoundEngine';
import { Level1 } from '@levels/Level1';
import { GameCanvas } from './game/GameCanvas';
import {
  CustomizeScreen,
  HomePage,
  LevelSelect,
  LoadingScreen,
  type GameSettings,
} from './ui';

type Screen = 'loading' | 'home' | 'customize' | 'levels' | 'play';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  difficulty: 'easy',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [levelId, setLevelId] = useState(Level1.id);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [dragonLook, setDragonLook] = useState<DragonLook>(DEFAULT_DRAGON_LOOK);
  const [afterCustomize, setAfterCustomize] = useState<'play' | 'home'>('play');

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
          setAfterCustomize('play');
          setScreen('customize');
        }}
        onCustomize={() => {
          soundEngine.unlock();
          soundEngine.play('uiClick');
          setAfterCustomize('home');
          setScreen('customize');
        }}
        onChooseLevel={() => {
          soundEngine.unlock();
          soundEngine.play('uiClick');
          setScreen('levels');
        }}
      />
    );
  }

  if (screen === 'customize') {
    return (
      <CustomizeScreen
        initialLook={dragonLook}
        onBack={() => setScreen('home')}
        onConfirm={(look) => {
          soundEngine.play('uiClick');
          setDragonLook(look);
          if (afterCustomize === 'play') {
            setScreen('play');
          } else {
            setScreen('home');
          }
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
      dragonLook={dragonLook}
      onQuit={() => {
        soundEngine.stopMusic();
        setScreen('home');
      }}
      onLevelChange={(id) => setLevelId(id)}
    />
  );
}
