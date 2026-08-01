/**
 * Central map of placeholder assets under src/assets.
 * Import from here so paths stay stable when art is replaced.
 */

import dragonSprite from './sprites/dragon.svg';
import pipSprite from './sprites/npc-pip.svg';
import oakleySprite from './sprites/npc-oakley.svg';
import starSprite from './sprites/star.svg';
import heartSprite from './sprites/heart.svg';

import meadowBackground from './backgrounds/meadow.svg';
import forestBackground from './backgrounds/forest.svg';
import menuBackground from './backgrounds/menu.svg';

import collectStarSound from './sounds/collect-star.wav';
import collectGemSound from './sounds/collect-gem.wav';
import collectHeartSound from './sounds/collect-heart.wav';
import talkBlipSound from './sounds/talk-blip.wav';
import uiClickSound from './sounds/ui-click.wav';
import meadowTheme from './sounds/meadow-theme.wav';
import forestTheme from './sounds/forest-theme.wav';

export const sprites = {
  dragon: dragonSprite,
  pip: pipSprite,
  oakley: oakleySprite,
  star: starSprite,
  heart: heartSprite,
} as const;

export const backgrounds = {
  meadow: meadowBackground,
  forest: forestBackground,
  menu: menuBackground,
} as const;

export const sounds = {
  collectStar: collectStarSound,
  collectGem: collectGemSound,
  collectHeart: collectHeartSound,
  talkBlip: talkBlipSound,
  uiClick: uiClickSound,
  meadowTheme,
  forestTheme,
} as const;

export const assets = {
  sprites,
  backgrounds,
  sounds,
} as const;

export default assets;
