import { useEffect, useRef, useState } from 'react';
import { Camera } from '@engine/Camera';
import { GameEngine } from '@engine/GameEngine';
import { Renderer } from '@engine/Renderer';
import type { InputManager } from '@engine/Input';
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
  const engineRef = useRef<GameEngine | null>(null);
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
    let renderer: Renderer | null = null;
    dialogueRef.current = null;
    setDialogue(null);
    setPaused(false);
    setLevelName(level.config.name);
    setGoal(level.config.goal);
    setStats({ ...dragon.stats });
    setLevelState(level.getState());

    const engine = new GameEngine({
      canvas,
      clearColor: level.config.background,
      onPauseChange: (value) => setPaused(value),
      onUpdate: (dt, input, eng) => {
        if (dialogueRef.current) return;

        // Kid-tuned platformer physics + dragon animation sync.
        eng.applyPlayerPhysics(dragon.body, input, level.solids, dt);
        dragon.syncFromPhysics(dt, input);
        nearby = level.update(dt, dragon);
        camera.follow(dragon.center);

        if (input.action && nearby && !actionLatch.current) {
          actionLatch.current = true;
          nearby.setTalking(true);
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
        renderer ??= new Renderer(canvas);
        renderer.clear(level.config.background);
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
      engineRef.current = null;
      inputRef.current = null;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dialogueRef.current?.npc.setTalking(false);
    };
  }, [levelId, onLevelChange]);

  const resume = () => {
    engineRef.current?.setPaused(false);
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
      {paused ? <PauseMenu onResume={resume} onQuit={onQuit} /> : null}
      <TouchControls
        onChange={(partial) => inputRef.current?.setVirtual(partial)}
      />
    </div>
  );
}
