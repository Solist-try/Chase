/**
 * Production bundle entry for the static adventure engine.
 * Vite builds this into dist/assets/static-adventure.js after the main build.
 * public/js/game.js dynamically imports it in production.
 */
export { startStaticAdventure } from './adventureApp';
