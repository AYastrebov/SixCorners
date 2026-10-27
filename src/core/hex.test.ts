import { describe, expect, it } from 'vitest';
import { fromRow, hex, isAligned, rotate, rowOf } from './hex';

const NEIGHBOURS = [hex(0, 2), hex(-1, 1), hex(-1, -1), hex(0, -2), hex(1, -1), hex(1, 1)];

describe('hex', () => {
  it('rotates counter-clockwise through the six neighbours in order', () => {
    NEIGHBOURS.forEach((h, i) => {
      expect(rotate(h, 'ccw')).toEqual(NEIGHBOURS[(i + 1) % 6]);
    });
  });

  it('undoes a ccw turn with a cw turn and comes back after six turns', () => {
    const h = hex(3, -5);
    expect(rotate(rotate(h, 'ccw'), 'cw')).toEqual(h);
    let turned = h;
    for (let i = 0; i < 6; i++) turned = rotate(turned, 'cw');
    expect(turned).toEqual(h);
  });

  it('keeps cells aligned when rotating', () => {
    const h = hex(2, 4);
    expect(isAligned(rotate(h, 'ccw'))).toBe(true);
    expect(isAligned(rotate(h, 'cw'))).toBe(true);
  });

  it('puts odd columns half a cell above even ones', () => {
    expect(fromRow(0, 3)).toEqual(hex(0, 6));
    expect(fromRow(1, 3)).toEqual(hex(1, 7));
    expect(rowOf(hex(1, 7))).toBe(3);
    expect(rowOf(hex(4, 6))).toBe(3);
  });
});
