import { sounds } from '@assets/manifest';

let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

/** Play a short UI / game blip when sound is on. */
export function playSound(
  key: keyof typeof sounds,
  volume = 0.35,
): void {
  if (!enabled) return;
  try {
    const audio = new Audio(sounds[key]);
    audio.volume = volume;
    void audio.play();
  } catch {
    // Autoplay / missing asset — ignore quietly for kids UX
  }
}
