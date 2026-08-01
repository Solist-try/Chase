# Assets

Shared game media for Chase.

```
src/assets/
  sprites/       # character & collectible placeholders (SVG)
  backgrounds/   # level & menu backdrop placeholders (SVG)
  sounds/        # SFX + music bed stubs (WAV)
  manifest.ts    # stable import map for the files above
```

Level configs under `src/levels/` reference these paths via `LevelConfig.assets`.
Replace placeholders in place (same filenames) when final art/audio is ready.
