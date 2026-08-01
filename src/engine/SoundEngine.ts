import { sounds } from '@assets/manifest';

export type SfxName =
  | 'jump'
  | 'collect'
  | 'collectStar'
  | 'collectGem'
  | 'collectHeart'
  | 'uiClick'
  | 'talkBlip';

export type MusicTrack = 'cheerful' | 'meadow' | 'forest';

const SFX_URLS: Record<SfxName, string> = {
  jump: sounds.jump,
  collect: sounds.collectStar,
  collectStar: sounds.collectStar,
  collectGem: sounds.collectGem,
  collectHeart: sounds.collectHeart,
  uiClick: sounds.uiClick,
  talkBlip: sounds.talkBlip,
};

const MUSIC_URLS: Record<MusicTrack, string> = {
  cheerful: sounds.cheerfulLoop,
  meadow: sounds.meadowTheme,
  forest: sounds.forestTheme,
};

const SFX_VOLUME: Partial<Record<SfxName, number>> = {
  jump: 0.38,
  collect: 0.42,
  collectStar: 0.42,
  collectGem: 0.42,
  collectHeart: 0.4,
  uiClick: 0.35,
  talkBlip: 0.35,
};

/**
 * Central audio helper for the kids adventure:
 * jump / collect SFX, looping cheerful music, mute toggle.
 */
export class SoundEngine {
  private muted = false;
  private music: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack | null = null;
  private musicVolume = 0.28;
  private unlocked = false;

  /** Whether sound is currently audible. */
  isMuted(): boolean {
    return this.muted;
  }

  isEnabled(): boolean {
    return !this.muted;
  }

  /** Mute or unmute all SFX + music. */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.music) {
      this.music.muted = muted;
      if (!muted && this.unlocked) {
        void this.music.play().catch(() => undefined);
      }
    }
  }

  /** Convenience alias used by settings UI. */
  setEnabled(enabled: boolean): void {
    this.setMuted(!enabled);
  }

  mute(): void {
    this.setMuted(true);
  }

  unmute(): void {
    this.setMuted(false);
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Call from a user gesture so browsers allow audio playback.
   * Safe to call multiple times.
   */
  unlock(): void {
    this.unlocked = true;
    if (this.music && !this.muted) {
      void this.music.play().catch(() => undefined);
    }
  }

  /** Play a one-shot sound effect. */
  play(name: SfxName, volume?: number): void {
    if (this.muted) return;
    const url = SFX_URLS[name];
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.volume = volume ?? SFX_VOLUME[name] ?? 0.35;
      void audio.play();
      this.unlocked = true;
    } catch {
      // Ignore autoplay / decode failures for kids UX
    }
  }

  playJump(): void {
    this.play('jump');
  }

  /** Generic collectible pickup (stars / gems). */
  playCollect(kind: 'star' | 'gem' | 'heart' | 'coin' = 'star'): void {
    if (kind === 'heart') {
      this.play('collectHeart');
      return;
    }
    if (kind === 'gem' || kind === 'coin') {
      this.play('collectGem');
      return;
    }
    this.play('collectStar');
  }

  /**
   * Start looping background music.
   * Defaults to the cheerful adventure loop.
   */
  playMusic(track: MusicTrack = 'cheerful'): void {
    if (this.currentTrack === track && this.music) {
      this.music.loop = true;
      this.music.muted = this.muted;
      if (!this.muted) void this.music.play().catch(() => undefined);
      return;
    }

    this.stopMusic();
    const audio = new Audio(MUSIC_URLS[track]);
    audio.loop = true;
    audio.volume = this.musicVolume;
    audio.muted = this.muted;
    this.music = audio;
    this.currentTrack = track;
    if (!this.muted) {
      void audio.play().catch(() => undefined);
    }
  }

  stopMusic(): void {
    if (!this.music) return;
    this.music.pause();
    this.music.src = '';
    this.music = null;
    this.currentTrack = null;
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) this.music.volume = this.musicVolume;
  }

  dispose(): void {
    this.stopMusic();
  }
}

/** Shared singleton used across UI + engine. */
export const soundEngine = new SoundEngine();
