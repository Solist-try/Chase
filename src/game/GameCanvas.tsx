import { useEffect, useRef, useState } from 'react';
import { Camera } from '@engine/Camera';
import {
  applyCanvasScale,
  fitStageSize,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from '@engine/display';
import { GameEngine } from '@engine/GameEngine';
import { Renderer } from '@engine/Renderer';
import type { InputManager } from '@engine/Input';
import { soundEngine } from '@engine/SoundEngine';
import { Dragon } from '@characters/Dragon';
import type { NPC } from '@characters/NPC';
import { getNextLevelId, loadLevel } from '@levels/LevelLoader';
import type { LevelRuntimeState } from '@levels/Level';
import { getTheme } from '@levels/themes';
import type { GameSettings } from '@ui/HomePage';
import { DialogueBox } from '@ui/DialogueBox';
import { HUD } from '@ui/HUD';
import { PauseMenu } from '@ui/PauseMenu';
import { TouchControls } from '@ui/TouchControls';

interface GameCanvasProps {
  levelId: string;
  settings: GameSettings;
  onQuit: () => void;
  onLevelChange: (levelId: string) => void;
}

function difficultyOverrides(settings: GameSettings) {
  if (settings.difficulty === 'easy') {
    return {
      moveSpeed: 175,
      jumpForce: 620,
      gravity: 1200,
      enemySpeed: 32,
      coyoteTime: 0.18,
      jumpBuffer: 0.18,
    };
  }
  return {
    moveSpeed: 190,
    jumpForce: 580,
    gravity: 1350,
    enemySpeed: 45,
    coyoteTime: 0.14,
    jumpBuffer: 0.14,
  };
}

interface DialogueState {
  lines: NPC['dialogue'];
  index: number;
  npc: NPC;
}

const EMPTY_LEVEL_STATE: LevelRuntimeState = {
  starsCollected: 0,
  starsTotal: 0,
  gemsCollected: 0,
  gemsTotal: 0,
  coinsCollected: 0,
  coinsTotal: 0,
  goalComplete: false,
  goalDescription: '',
};

export function GameCanvas({
  levelId,
  settings,
  onQuit,
  onLevelChange,
}: GameCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<InputManager | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const dialogueRef = useRef<DialogueState | null>(null);
  const levelRef = useRef<ReturnType<typeof loadLevel> | null>(null);
  const actionLatch = useRef(false);
  const nextLatch = useRef(false);

  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({
    stars: 0,
    coins: 0,
    health: 3,
    maxHealth: 3,
  });
  const [levelState, setLevelState] =
    useState<LevelRuntimeState>(EMPTY_LEVEL_STATE);
  const [levelName, setLevelName] = useState('');
  const [goal, setGoal] = useState('');
  const [nearbyName, setNearbyName] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<DialogueState | null>(null);
  const [restartToken, setRestartToken] = useState(0);
  const [stageSize, setStageSize] = useState({ width: VIEW_WIDTH, height: VIEW_HEIGHT });

  // Responsive letterboxed stage
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const layout = () => {
      const size = fitStageSize(stage.clientWidth, stage.clientHeight);
      setStageSize(size);
      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (canvas) {
        applyCanvasScale(canvas, VIEW_WIDTH, VIEW_HEIGHT);
        engine?.syncCanvasScale();
      }
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    window.addEventListener('orientationchange', layout);
    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', layout);
    };
  }, [levelId, restartToken]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    applyCanvasScale(canvas, VIEW_WIDTH, VIEW_HEIGHT);

    const level = loadLevel(levelId);
    levelRef.current = level;
    const theme = getTheme(level.config.theme);
    const dragon = new Dragon({
      x: level.config.spawn.x,
      y: level.config.spawn.y,
    });
    const camera = new Camera(
      { width: VIEW_WIDTH, height: VIEW_HEIGHT },
      { width: level.config.width, height: level.config.height },
    );

    let nearby: NPC | null = null;
    let renderer: Renderer | null = null;
    dialogueRef.current = null;
    setDialogue(null);
    setPaused(false);
    setLevelName(level.config.name);
    setGoal(level.config.goal.description);
    setStats({ ...dragon.stats });
    setLevelState(level.getState());

    soundEngine.setEnabled(settings.soundEnabled);
    soundEngine.unlock();
    soundEngine.playMusic('cheerful');

    const engine = new GameEngine({
      canvas,
      clearColor: theme.background,
      logicalWidth: VIEW_WIDTH,
      logicalHeight: VIEW_HEIGHT,
      targetFps: 60,
      difficulty: difficultyOverrides(settings),
      onPauseChange: (value) => {
        setPaused(value);
        if (value) {
          soundEngine.stopMusic();
        } else if (settings.soundEnabled) {
          soundEngine.playMusic('cheerful');
        }
      },
      onUpdate: (dt, input, eng) => {
        if (dialogueRef.current) return;

        eng.applyPlayerPhysics(dragon.body, input, level.solids, dt);
        dragon.syncFromPhysics(
          dt,
          input,
          eng.lastPlatformCollision?.landed ?? false,
        );
        nearby = level.update(dt, dragon);
        camera.follow(dragon.center);

        if (input.action && nearby && !actionLatch.current) {
          actionLatch.current = true;
          nearby.setTalking(true);
          level.noteTalkedTo(nearby.id);
          const nextDialogue = { lines: nearby.dialogue, index: 0, npc: nearby };
          dialogueRef.current = nextDialogue;
          setDialogue(nextDialogue);
        }
        if (!input.action) {
          actionLatch.current = false;
        }

        setStats({ ...dragon.stats });
        setLevelState(level.getState());
        setNearbyName(nearby?.name ?? null);
      },
      onRender: (ctx) => {
        renderer ??= new Renderer(canvas, VIEW_WIDTH, VIEW_HEIGHT);
        renderer.syncDpr(canvas);
        renderer.clear(theme.background);
        ctx.save();
        camera.apply(ctx);
        level.draw(renderer);
        dragon.draw(renderer);
        ctx.restore();
      },
    });

    engineRef.current = engine;
    inputRef.current = engine.input;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyN' || nextLatch.current) return;
      nextLatch.current = true;
      if (!level.getState().goalComplete) return;
      const next = getNextLevelId(level.config.id);
      if (next) onLevelChange(next);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'KeyN') nextLatch.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    engine.start();

    return () => {
      engine.stop();
      soundEngine.stopMusic();
      engineRef.current = null;
      inputRef.current = null;
      levelRef.current = null;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dialogueRef.current?.npc.setTalking(false);
    };
  }, [levelId, onLevelChange, settings, restartToken]);

  const resume = () => {
    engineRef.current?.setPaused(false);
    setPaused(false);
  };

  const restartLevel = () => {
    engineRef.current?.setPaused(false);
    setPaused(false);
    setDialogue(null);
    dialogueRef.current = null;
    setRestartToken((token) => token + 1);
  };

  const advanceDialogue = () => {
    setDialogue((current) => {
      if (!current) return null;
      const updated = { ...current, index: current.index + 1 };
      dialogueRef.current = updated;
      return updated;
    });
  };

  const closeDialogue = () => {
    dialogueRef.current?.npc.setTalking(false);
    dialogueRef.current = null;
    setDialogue(null);
  };

  return (
    <div className="game-stage" ref={stageRef}>
      <div
        className="game-shell"
        ref={shellRef}
        style={{ width: stageSize.width, height: stageSize.height }}
      >
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          aria-label={`${levelName} game view`}
        />
        <HUD
          levelName={levelName}
          goal={goal}
          stats={stats}
          levelState={levelState}
          nearbyHint={
            nearbyName && !dialogue
              ? `Near ${nearbyName} — press E to talk`
              : null
          }
        />
        {dialogue ? (
          <DialogueBox
            lines={dialogue.lines}
            index={dialogue.index}
            onNext={advanceDialogue}
            onClose={closeDialogue}
          />
        ) : null}
        {paused ? (
          <PauseMenu
            onResume={resume}
            onRestart={restartLevel}
            onBackHome={onQuit}
          />
        ) : null}
        <TouchControls
          onChange={(partial) => inputRef.current?.setVirtual(partial)}
        />
      </div>
    </div>
  );
}
