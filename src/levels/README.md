# Levels

Declarative level configuration for Chase.

## Shape of a level (`LevelConfig`)

| Field | Purpose |
| --- | --- |
| `theme` | Rainbow palette id (`lime`, `sky`, `cotton`, …) |
| `platforms` | Ground, walls, clouds, bridges |
| `enemies` | Slow cute patrols (`blob`, `bumble`, `sprout`) |
| `collectibles` | `star`, `coin`, or `heart` |
| `npcs` | Friendly talk partners |
| `goal` | Warm win condition (collect / find friend / reach tree) |

## Templates

| Export | Theme | Goal |
| --- | --- | --- |
| `Level1` | Lime Meadow | Collect 3 stars |
| `Level2` | Sky Parade | Find Oakley by the tree |
| `Level3` | Cotton Candy Cliffs | Collect 5 coins, reach the candy tree |

```ts
import { Level1, Level2, Level3, loadLevel } from '@levels';

const runtime = loadLevel(Level1.id);
```

Themes live in `themes.ts`. Helpers like `makeBounds()` frame a stage with floor + walls.
