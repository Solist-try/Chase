// ---------------------------------------------------------
// Dragon Adventure – Level 2 screen boot
// Loads the shared game starter, then starts Level 2.
// ---------------------------------------------------------

import './game.js';
import { Level2 } from './Level2.js';

// Start Level 2 as soon as this screen is ready
if (document.getElementById('gameCanvas')) {
  window.startDragonGame(Level2);
}
