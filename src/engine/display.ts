/** Logical gameplay resolution (16:9). */
export const VIEW_WIDTH = 960;
export const VIEW_HEIGHT = 540;

export interface CanvasScale {
  /** CSS / layout width in CSS pixels. */
  cssWidth: number;
  /** CSS / layout height in CSS pixels. */
  cssHeight: number;
  /** Device pixel ratio used for the backing store (capped). */
  dpr: number;
  logicalWidth: number;
  logicalHeight: number;
}

/**
 * Scale the canvas backing store for crisp rendering while keeping
 * a fixed logical resolution for gameplay math.
 */
export function applyCanvasScale(
  canvas: HTMLCanvasElement,
  logicalWidth = VIEW_WIDTH,
  logicalHeight = VIEW_HEIGHT,
  maxDpr = 2,
): CanvasScale {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(1, rect.width || logicalWidth);
  const cssHeight = Math.max(1, rect.height || logicalHeight);

  const nextW = Math.floor(logicalWidth * dpr);
  const nextH = Math.floor(logicalHeight * dpr);
  if (canvas.width !== nextW) canvas.width = nextW;
  if (canvas.height !== nextH) canvas.height = nextH;

  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  return { cssWidth, cssHeight, dpr, logicalWidth, logicalHeight };
}

/**
 * Fit a 16:9 stage inside a parent box (letterbox / pillarbox).
 * Returns the CSS pixel size to apply to the stage element.
 */
export function fitStageSize(
  parentWidth: number,
  parentHeight: number,
  aspect = VIEW_WIDTH / VIEW_HEIGHT,
  padding = 16,
): { width: number; height: number } {
  const availW = Math.max(0, parentWidth - padding * 2);
  const availH = Math.max(0, parentHeight - padding * 2);

  let width = availW;
  let height = width / aspect;
  if (height > availH) {
    height = availH;
    width = height * aspect;
  }

  return {
    width: Math.max(240, Math.floor(width)),
    height: Math.max(135, Math.floor(height)),
  };
}
