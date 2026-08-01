import { useState } from 'react';
import { level1 } from '@levels/level1';
import { GameCanvas } from './game/GameCanvas';
import { LevelSelect, MainMenu } from './ui';

type Screen = 'menu' | 'levels' | 'play';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [levelId, setLevelId] = useState(level1.id);

  if (screen === 'menu') {
    return (
      <MainMenu
        onStart={() => {
          setLevelId(level1.id);
          setScreen('play');
        }}
        onSelectLevel={() => setScreen('levels')}
      />
    );
  }

  if (screen === 'levels') {
    return (
      <LevelSelect
        onBack={() => setScreen('menu')}
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
      onQuit={() => setScreen('menu')}
      onLevelChange={(id) => setLevelId(id)}
    />
  );
}
