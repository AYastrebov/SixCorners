/**
 * Hex coordinates for a flat-top grid where odd columns sit half a cell higher.
 *
 * We use "doubled height" coordinates: `x` is the column, `y` counts half-rows
 * from the bottom. A cell's neighbours are (x, y±2) and (x±1, y±1), and every
 * valid cell has `x + y` even. See docs/rules.md for a picture.
 */
export interface Hex {
  readonly x: number;
  readonly y: number;
}

export type Rotation = 'ccw' | 'cw';

// `+ 0` turns -0 into 0 so equal cells compare equal under Object.is.
export const hex = (x: number, y: number): Hex => ({ x: x + 0, y: y + 0 });

export const add = (a: Hex, b: Hex): Hex => hex(a.x + b.x, a.y + b.y);

export const isAligned = (h: Hex): boolean => ((h.x + h.y) & 1) === 0;

/** Row index of a board cell; odd columns' rows sit half a cell above even ones. */
export const rowOf = (h: Hex): number => (h.y - (h.x & 1)) / 2;

export const fromRow = (x: number, row: number): Hex => hex(x, 2 * row + (x & 1));

/** Rotates an offset by 60° around the origin. */
export function rotate(offset: Hex, direction: Rotation): Hex {
  const q = offset.x;
  const r = (offset.y - offset.x) / 2;
  const s = -q - r;
  const [nq, nr] = direction === 'ccw' ? [-r, -s] : [-s, -q];
  return hex(nq, 2 * nr + nq);
}

export const sameHex = (a: Hex, b: Hex): boolean => a.x === b.x && a.y === b.y;
