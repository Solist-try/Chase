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
| Talk | E or Space (near an NPC) |
| Pause | Esc or P |
| Next level | N (after all stars are collected) |

On smaller screens, on-screen touch controls appear.

## Project structure

```
src/
  engine/       # physics, movement, collisions, camera, input, game loop
  characters/   # Dragon (player), NPC base types
  levels/       # level configs, runtime Level, level art placeholders
    assets/     # per-level background SVGs
  ui/           # menus, HUD, buttons, dialogue, touch controls
  assets/       # shared images/ and sounds/
  game/         # React canvas host (GameCanvas)
```

### Engine (`src/engine`)

- `physics.ts` — gravity / integration helpers  
- `movement.ts` — top-down + platformer movement  
- `collisions.ts` — AABB overlap + resolution  
- `Input.ts`, `Camera.ts`, `GameLoop.ts`, `Renderer.ts`

### Characters (`src/characters`)

- `Dragon` — playable dragon with stars / hearts  
- `NPC` — patrol + dialogue  
- `Character` — shared base class

### Levels (`src/levels`)

- `level1.ts` — Sunny Meadow  
- `level2.ts` — Whispering Woods  
- `LevelLoader.ts` — load / list / next-level helpers  
- `assets/` — background placeholders referenced by configs

### UI (`src/ui`)

- Main menu, level select, HUD, pause menu, dialogue box, buttons, touch controls

## Design notes (age 8)

- Bright, readable colors and large interactive targets  
- Forgiving top-down movement (no precision platforming required)  
- Short goals and friendly NPC dialogue  
- Keyboard + touch support
