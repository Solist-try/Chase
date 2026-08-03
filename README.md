# Chase

A browser-based 2D adventure game for kids (around age 8).  
Built with **React + TypeScript + Canvas**.

Help **Ember** the dragon collect stars, talk to friendly NPCs, and explore sunny meadows and quiet woods.

## Quick start

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build   # production build
npm run lint    # TypeScript check
```

## Controls

| Action | Keys |
| --- | --- |
| Move | Arrow keys or WASD |
| Jump | Space (also Up / W) |
| Dash | Shift (short, safe burst) |
| Talk | E (near an NPC) |
| Pause | Esc or P |
| Next level | N (after all stars are collected) |

On smaller screens, on-screen touch controls appear.

## Project structure

```
src/
  engine/       # GameEngine, physics, movement, collisions, input, camera
  characters/   # Dragon (player), NPC base types
  levels/       # level configs + optional per-level assets
  ui/           # menus, HUD, buttons, dialogue, touch controls
  assets/       # sprites/, backgrounds/, sounds/ placeholders
  game/         # React canvas host (GameCanvas)
```

### Engine (`src/engine`)

- `GameEngine.ts` — rAF loop, `handleInput` / `update` / `render`, kid-tuned physics  
- `controls.ts` — Arrow/WASD, Space jump, Shift dash (buffered & forgiving)  
- `CollisionEngine.ts` — platforms, jump landing, non-harmful enemy bounce  
- `SoundEngine.ts` — jump/collect SFX, looping cheerful music, mute toggle  
- `display.ts` — canvas DPR scaling + responsive stage fitting  
- `physics.ts` — gravity / integration helpers  
- `movement.ts` — top-down + platformer movement  
- `collisions.ts` — AABB overlap + resolution  
- `Input.ts`, `Camera.ts`, `GameLoop.ts`, `Renderer.ts`

### Characters (`src/characters`)

- `Dragon` — playable dragon with stars / hearts  
- `NPC` — patrol + dialogue  
- `Character` — shared base class

### Levels (`src/levels`)

- `themes.ts` — rainbow color themes  
- `Level1.ts` / `Level2.ts` / `Level3.ts` — stage templates  
- Platforms, cute enemies, stars/coins, friendly goals  
- `LevelLoader.ts` — load / list / next-level helpers  

### UI (`src/ui`)

- `HomePage.tsx` — rainbow title, dragon art, Start Game, Settings (sound / difficulty)  
- Level select, HUD, pause menu, dialogue box, buttons, touch controls

## Browser optimizations

- Canvas DPR scaling with a fixed 960×540 logical view  
- Responsive letterboxed stage (phones / tablets / desktop)  
- Asset preloading before the home screen  
- 60 FPS limiter for smooth, battery-friendly play  

## Design notes (age 8)

- Bright, readable colors and large interactive targets  
- Forgiving jumps (coyote time + jump buffer) via `KIDS_DIFFICULTY`  
- Slow NPC / enemy patrol speeds  
- Short goals and friendly NPC dialogue  
- Keyboard + touch support
