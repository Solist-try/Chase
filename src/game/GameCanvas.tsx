import { useEffect, useRef, useState } from 'react';
import { Camera } from '@engine/Camera';
import { GameLoop } from '@engine/GameLoop';
import { InputManager } from '@engine/Input';
import { Renderer } from '@engine/Renderer';
import { Dragon } from '@characters/Dragon';
import type { NPC } from '@characters/NPC';
import { getNextLevelId, loadLevel } from '@levels/LevelLoader';
import type { LevelRuntimeState } from '@levels/Level';
import { DialogueBox } from '@ui/DialogueBox';
import { HUD } from '@ui/HUD';
import { PauseMenu } from '@ui/PauseMenu';
import { TouchControls } from '@ui/TouchControls';

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;

interface GameCanvasProps {
  levelId: string;
  onQuit: () => void;
  onLevelChange: (levelId: string) => void;
}

interface DialogueState {
  lines: NPC['dialogue'];
  index: number;
  npc: NPC;
}

export function GameCanvas({ levelId, onQuit, onLevelChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<InputManager | null>(null);
  const pausedRef = useRef(false);
  const dialogueRef = useRef<DialogueState | null>(null);
  const actionLatch = useRef(false);
  const nextLatch = useRef(false);

  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState({ stars: 0, health: 3, maxHealth: 3 });
  const [levelState, setLevelState] = useState<LevelRuntimeState>({
    starsCollected: 0,
    starsTotal: 0,
    goalComplete: false,
  });
  const [levelName, setLevelName] = useState('');
  const [goal, setGoal] = useState('');
  const [nearbyName, setNearbyName] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<DialogueState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new Renderer(canvas);
    const input = new InputManager();
    inputRef.current = input;

    const level = loadLevel(levelId);
    const dragon = new Dragon({
      x: level.config.spawn.x,
      y: level.config.spawn.y,
    });
    const camera = new Camera(
      { width: VIEW_WIDTH, height: VIEW_HEIGHT },
      { width: level.config.width, height: level.config.height },
    );

    let nearby: NPC | null = null;
    pausedRef.current = false;
    dialogueRef.current = null;
    setPaused(false);
    setDialogue(null);
    setLevelName(level.config.name);
    setGoal(level.config.goal);
    setStats({ ...dragon.stats });
    setLevelState(level.getState());

    const loop = new GameLoop(
      (dt) => {
        const state = input.getState();

        if (state.pause) {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }

        if (pausedRef.current || dialogueRef.current) {
          return;
        }

        dragon.update(dt, state, level.solids);
        nearby = level.update(dt, dragon);
        camera.follow(dragon.center);

        if (state.action && nearby && !actionLatch.current) {
          actionLatch.current = true;
          nearby.setTalking(true);
          const nextDialogue = { lines: nearby.dialogue, index: 0, npc: nearby };
          dialogueRef.current = nextDialogue;
          setDialogue(nextDialogue);
        }
        if (!state.action) {
          actionLatch.current = false;
        }

        setStats({ ...dragon.stats });
        setLevelState(level.getState());
        setNearbyName(nearby?.name ?? null);
      },
      () => {
        renderer.clear(level.config.background);
        renderer.ctx.save();
        camera.apply(renderer.ctx);
        level.draw(renderer);
        dragon.draw(renderer);
        renderer.ctx.restore();
      },
    );

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
    loop.start();

    return () => {
      loop.stop();
      input.dispose();
      inputRef.current = null;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dialogueRef.current?.npc.setTalking(false);
    };
  }, [levelId, onLevelChange]);

  const resume = () => {
    pausedRef.current = false;
    setPaused(false);
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
    <div className="game-shell">
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
            ? `Near ${nearbyName} — press E / Space to talk`
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
      {paused ? <PauseMenu onResume={resume} onQuit={onQuit} /> : null}
      <TouchControls
        onChange={(partial) => inputRef.current?.setVirtual(partial)}
      />
    </div>
  );
}
