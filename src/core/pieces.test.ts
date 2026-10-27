import { describe, expect, it } from 'vitest';
import { type Hex, add, hex, isAligned, rotate, sameHex } from './hex';
import { PIECES, type PieceId, pieceDef } from './pieces';

const key = (cells: readonly Hex[]): string => {
  const sorted = [...cells].sort((a, b) => a.y - b.y || a.x - b.x);
  const first = sorted[0] ?? hex(0, 0);
  return sorted.map((c) => `${String(c.x - first.x)},${String(c.y - first.y)}`).join(' ');
};

/** Same string for two pieces iff one is a rotation and translation of the other. */
const shapeKey = (cells: readonly Hex[]): string => {
  const keys: string[] = [];
  let turned = [...cells];
  for (let i = 0; i < 6; i++) {
    keys.push(key(turned));
    turned = turned.map((c) => rotate(c, 'ccw'));
  }
  return keys.sort()[0] ?? '';
};

const mirror = (cells: readonly Hex[]): Hex[] => cells.map((c) => hex(-c.x, c.y));

const NEIGHBOURS = [hex(0, 2), hex(-1, 1), hex(-1, -1), hex(0, -2), hex(1, -1), hex(1, 1)];

const isConnected = (cells: readonly Hex[]): boolean => {
  const seen = cells.slice(0, 1);
  // for-of also visits cells pushed during the loop, which makes this a BFS.
  for (const current of seen) {
    for (const n of NEIGHBOURS.map((d) => add(current, d))) {
      if (cells.some((c) => sameHex(c, n)) && !seen.some((s) => sameHex(s, n))) seen.push(n);
    }
  }
  return seen.length === cells.length;
};

describe('pieces', () => {
  it.each(PIECES)('piece $id is four aligned, connected, distinct hexes', ({ cells }) => {
    expect(cells).toHaveLength(4);
    expect(cells.every(isAligned)).toBe(true);
    expect(new Set(cells.map((c) => `${String(c.x)},${String(c.y)}`)).size).toBe(4);
    expect(isConnected(cells)).toBe(true);
  });

  it('are the ten one-sided tetrahexes, each once', () => {
    expect(new Set(PIECES.map((p) => shapeKey(p.cells))).size).toBe(10);
  });

  it.each([
    [3, 4],
    [5, 6],
    [7, 8],
  ] as [PieceId, PieceId][])('pieces %i and %i are mirror images', (a, b) => {
    expect(shapeKey(mirror(pieceDef(a).cells))).toBe(shapeKey(pieceDef(b).cells));
    expect(shapeKey(pieceDef(a).cells)).not.toBe(shapeKey(pieceDef(b).cells));
  });

  it.each([1, 2, 9, 10] as PieceId[])('piece %i is its own mirror image', (id) => {
    const { cells } = pieceDef(id);
    expect(shapeKey(mirror(cells))).toBe(shapeKey(cells));
  });
});
