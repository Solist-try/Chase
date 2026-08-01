import { assets } from './manifest';

export interface PreloadProgress {
  loaded: number;
  total: number;
  /** 0–1 */
  ratio: number;
}

type ProgressFn = (progress: PreloadProgress) => void;

let preloadPromise: Promise<void> | null = null;
let lastProgress: PreloadProgress = { loaded: 0, total: 0, ratio: 0 };

function collectUrls(): string[] {
  return [
    ...Object.values(assets.sprites),
    ...Object.values(assets.backgrounds),
    ...Object.values(assets.sounds),
  ];
}

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function loadAudio(url: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const done = () => resolve();
    audio.addEventListener('canplaythrough', done, { once: true });
    audio.addEventListener('error', done, { once: true });
    // iOS / strict browsers may never fire canplaythrough without a gesture
    window.setTimeout(done, 2500);
    audio.preload = 'auto';
    audio.src = url;
    audio.load();
  });
}

function isAudio(url: string): boolean {
  return /\.(wav|mp3|ogg|m4a)(\?|$)/i.test(url);
}

/**
 * Preload sprites, backgrounds, and sounds so gameplay starts smoothly.
 * Safe to call multiple times — shares one in-flight promise.
 */
export function preloadAssets(onProgress?: ProgressFn): Promise<void> {
  if (preloadPromise) {
    onProgress?.(lastProgress);
    return preloadPromise;
  }

  const urls = collectUrls();
  let loaded = 0;
  const total = urls.length;

  const report = () => {
    lastProgress = {
      loaded,
      total,
      ratio: total === 0 ? 1 : loaded / total,
    };
    onProgress?.(lastProgress);
  };

  report();

  preloadPromise = Promise.all(
    urls.map(async (url) => {
      if (isAudio(url)) await loadAudio(url);
      else await loadImage(url);
      loaded += 1;
      report();
    }),
  ).then(() => undefined);

  return preloadPromise;
}

export function getPreloadProgress(): PreloadProgress {
  return lastProgress;
}
