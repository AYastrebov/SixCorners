import { describe, expect, it } from 'vitest';
import { Board, COLUMNS, ROWS, allLines, lineCells, rowsIn } from './board';
import { fromRow, hex, rowOf } from './hex';

describe('board', () => {
  it('has 215 cells, like the 2011 board', () => {
    let count = 0;
    for (let x = 0; x < COLUMNS; x++) count += rowsIn(x);
    expect(count).toBe(215);
  });

  it('knows which cells are inside', () => {
    expect(Board.isInside(fromRow(0, ROWS - 1))).toBe(true);
    expect(Board.isInside(fromRow(1, ROWS - 1))).toBe(false);
    expect(Board.isInside(hex(-1, 1))).toBe(false);
    expect(Board.isInside(hex(COLUMNS, 0))).toBe(false);
    expect(Board.isInside(hex(0, 1))).toBe(false); // misaligned
  });

  it('builds rising and falling lines with one cell per column', () => {
    const rising = lineCells('rising', 3);
    const falling = lineCells('falling', 3);
    expect(rising.map((h) => h.x)).toEqual([...Array(COLUMNS).keys()]);
    expect(rising.map(rowOf)).toEqual(Array<number>(COLUMNS).fill(3));
    expect(falling.map(rowOf)).toEqual([3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3]);
  });

  it('lists only lines that fit on the board', () => {
    expect(allLines(['rising'])).toHaveLength(ROWS - 1);
    expect(allLines(['falling'])).toHaveLength(ROWS - 1);
    for (const line of allLines(['rising', 'falling'])) {
      expect(line.cells.every((h) => Board.isInside(h))).toBe(true);
    }
  });

  it('clears a line and drops each column above it', () => {
    const line = allLines(['rising'])[0];
    if (!line) throw new Error('no line');
    const board = Board.fromCells(line.cells).place([fromRow(0, 1), fromRow(1, 3)], 7);
    expect(board.isFull(line)).toBe(true);

    const cleared = board.clear(line);
    expect(cleared.isFull(line)).toBe(false);
    expect(cleared.filled()).toEqual([
      { hex: fromRow(0, 0), id: 7 },
      { hex: fromRow(1, 2), id: 7 },
    ]);
  });

  it('does not change the original board', () => {
    const empty = Board.empty();
    empty.place([hex(0, 0)], 1);
    expect(empty.filled()).toEqual([]);
  });
});
