import { soundEngine, type SfxName } from '@engine/SoundEngine';

/** Mirror mute state into the shared SoundEngine. */
export function setSoundEnabled(value: boolean): void {
  soundEngine.setEnabled(value);
}

export function isSoundEnabled(): boolean {
  return soundEngine.isEnabled();
}

/** Play a short UI / game blip when sound is on. */
export function playSound(key: SfxName | 'collect', volume = 0.35): void {
  soundEngine.unlock();
  soundEngine.play(key, volume);
}

export { soundEngine };
