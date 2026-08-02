/**
 * Planet glyph sheet — the DOM-side half of planet rendering.
 *
 * Kept out of `render.ts` on purpose. That module is deliberately DOM-blind so
 * `scripts/verify-sky.mjs` can import it under Node to run the physical
 * invariants; an `Image()` at its module scope would break the suite. So the
 * sheet is loaded here, by SkyField, and handed to `drawFull` as data.
 *
 * One 384x128 WebP, 23KB, six 64px cells wide and two rows tall:
 *   row 0  monochrome outline  — tinted at runtime, dark mode
 *   row 1  lineal colour       — used as-is, light mode
 *
 * 64px is sized for the job: the largest body (Saturn) paints at 24px, so 2x
 * DPR needs 48. 3x DPR only exists on phones, where the whole instrument is
 * hidden below 768px anyway.
 */
import sheetUrl from '../../assets/planets.webp';

export const SPRITE_CELL = 64;

/** Column order in the sheet. The Moon is absent on purpose — its identity is
 *  a live terminator computed from real geometry, which a fixed raster cannot
 *  show, so it stays a canvas path. */
const COLUMN: Record<string, number> = {
  Mercury: 0,
  Venus: 1,
  Mars: 2,
  Jupiter: 3,
  Saturn: 4,
  Sun: 5,
};

export interface PlanetSprite {
  /** Ready-to-blit source: the raw sheet in light mode, a tinted copy in dark. */
  image: CanvasImageSource;
  /** Which row of the source to sample. */
  row: number;
  column: (name: string) => number | undefined;
}

let raw: HTMLImageElement | null = null;
let rawReady = false;
/** Tinted copies, keyed by colour, so the source-in composite runs once per
 *  palette rather than once per frame. */
const tinted = new Map<string, HTMLCanvasElement>();

/** Kick off the one network fetch. Safe to call repeatedly. */
export function loadPlanetSprite(onReady: () => void): void {
  if (raw) return;
  raw = new Image();
  raw.decoding = 'async';
  raw.src = sheetUrl.src ?? (sheetUrl as unknown as string);
  raw.onload = () => {
    rawReady = true;
    onReady();
  };
  raw.onerror = () => {
    // Leave rawReady false: drawFull falls back to the computed paths, so a
    // failed fetch degrades to the old rendering rather than to empty sky.
    raw = null;
  };
}

function tint(colour: string): HTMLCanvasElement | null {
  if (!raw || !rawReady) return null;
  const hit = tinted.get(colour);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = raw.naturalWidth;
  c.height = raw.naturalHeight;
  const g = c.getContext('2d');
  if (!g) return null;
  g.drawImage(raw, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = colour;
  g.fillRect(0, 0, c.width, c.height);
  tinted.set(colour, c);
  return c;
}

/** The sheet ready for this palette, or null while it is still loading. */
export function planetSprite(engraved: boolean, colour: string): PlanetSprite | null {
  if (!raw || !rawReady) return null;
  if (engraved) {
    return { image: raw, row: 1, column: (n) => COLUMN[n] };
  }
  const t = tint(colour);
  if (!t) return null;
  return { image: t, row: 0, column: (n) => COLUMN[n] };
}
