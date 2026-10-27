import type { LineShape } from './board';

/** Gravity interval per speed (level 1–10), from the 2011 game. */
export const DROP_INTERVALS_MS = [2250, 2000, 1750, 1500, 1250, 1000, 750, 500, 250, 200] as const;

export const SOFT_DROP_INTERVAL_MS = 50;

export const SPAWN_COLUMN = 4;

export const MAX_SPEED = DROP_INTERVALS_MS.length;

/** Lines needed to finish a level. */
export const linesToWin = (level: number): number => 9 + level;

/**
 * `levels`: clear `linesToWin(level)` lines to win.
 * `endless`: play at a fixed speed until the board fills up.
 */
export type Mode =
  | { readonly kind: 'levels'; readonly level: number }
  | { readonly kind: 'endless'; readonly speed: number };

export interface Rules {
  readonly lineShapes: readonly LineShape[];
}

export const ORIGINAL_RULES: Rules = { lineShapes: ['rising'] };

export function speedOf(mode: Mode): number {
  return mode.kind === 'levels' ? mode.level : mode.speed;
}

export function dropIntervalMs(speed: number): number {
  const interval = DROP_INTERVALS_MS[speed - 1];
  if (interval === undefined) throw new RangeError(`Speed must be 1–${String(MAX_SPEED)}`);
  return interval;
}
