import { type Hex, hex } from './hex';

export type PieceId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PieceDef {
  readonly id: PieceId;
  /** Offsets from the pivot, which is the centre of rotation. */
  readonly cells: readonly Hex[];
}

/**
 * The ten one-sided tetrahexes, numbered and pivoted as in the 2011 game
 * (Figure.m). Pairs 3/4, 5/6 and 7/8 are mirror images; 1, 2, 9 and 10 are
 * their own mirror images. Piece 9 rotates around an empty cell.
 */
export const PIECES: readonly PieceDef[] = [
  { id: 1, cells: [hex(0, 2), hex(0, 0), hex(0, -2), hex(0, -4)] },
  { id: 2, cells: [hex(0, 2), hex(0, 0), hex(-1, -1), hex(1, -1)] },
  { id: 3, cells: [hex(0, 2), hex(0, 0), hex(0, -2), hex(1, -1)] },
  { id: 4, cells: [hex(0, 2), hex(0, 0), hex(0, -2), hex(-1, -1)] },
  { id: 5, cells: [hex(0, 2), hex(0, 0), hex(-1, -1), hex(-1, -3)] },
  { id: 6, cells: [hex(0, 2), hex(0, 0), hex(1, -1), hex(1, -3)] },
  { id: 7, cells: [hex(0, 4), hex(0, 2), hex(0, 0), hex(1, -1)] },
  { id: 8, cells: [hex(0, 4), hex(0, 2), hex(0, 0), hex(-1, -1)] },
  { id: 9, cells: [hex(0, 2), hex(-1, 1), hex(1, 1), hex(1, -1)] },
  { id: 10, cells: [hex(0, 2), hex(0, 0), hex(1, 1), hex(1, -1)] },
];

export function pieceDef(id: PieceId): PieceDef {
  const def = PIECES[id - 1];
  if (!def) throw new RangeError(`Unknown piece ${String(id)}`);
  return def;
}
