import { type Hex, fromRow, isAligned, rowOf } from './hex';

export const COLUMNS = 11;
/** Rows in even columns; odd columns sit half a cell higher and have one fewer. */
export const ROWS = 20;

export const rowsIn = (x: number): number => (x % 2 === 0 ? ROWS : ROWS - 1);

/**
 * A line holds one cell per column.
 * - `rising`: every column's cell in row `n`, zig-zagging up into odd columns.
 *   This is the only line shape the 2011 game cleared.
 * - `falling`: even columns at row `n`, odd columns at row `n - 1`.
 */
export type LineShape = 'rising' | 'falling';

export interface Line {
  readonly shape: LineShape;
  readonly n: number;
  readonly cells: readonly Hex[];
}

export function lineCells(shape: LineShape, n: number): Hex[] {
  return Array.from({ length: COLUMNS }, (_, x) =>
    fromRow(x, shape === 'falling' && x % 2 === 1 ? n - 1 : n),
  );
}

/** All lines on the board, lowest first. */
export function allLines(shapes: readonly LineShape[]): Line[] {
  const lines: Line[] = [];
  for (let n = 0; n < ROWS; n++) {
    // A falling line reaches one row lower than the rising line with the same n.
    if (shapes.includes('falling') && n >= 1) {
      lines.push({ shape: 'falling', n, cells: lineCells('falling', n) });
    }
    if (shapes.includes('rising') && n < ROWS - 1) {
      lines.push({ shape: 'rising', n, cells: lineCells('rising', n) });
    }
  }
  return lines;
}

export interface FilledCell {
  readonly hex: Hex;
  /** Id of the piece that left this cell, 1–10. */
  readonly id: number;
}

/** Locked cells. Immutable: every change returns a new board. */
export class Board {
  private constructor(private readonly cells: Uint8Array) {}

  static empty(): Board {
    return new Board(new Uint8Array(COLUMNS * ROWS));
  }

  static fromCells(cells: Iterable<Hex>, id = 1): Board {
    return Board.empty().place(cells, id);
  }

  static isInside(h: Hex): boolean {
    if (!isAligned(h) || h.x < 0 || h.x >= COLUMNS) return false;
    const row = rowOf(h);
    return row >= 0 && row < rowsIn(h.x);
  }

  /** Piece id at `h`, or 0 when the cell is empty or outside the board. */
  get(h: Hex): number {
    return Board.isInside(h) ? (this.cells[index(h)] ?? 0) : 0;
  }

  place(cells: Iterable<Hex>, id: number): Board {
    const next = this.cells.slice();
    for (const h of cells) {
      if (!Board.isInside(h))
        throw new RangeError(`Cell ${String(h.x)},${String(h.y)} is off the board`);
      next[index(h)] = id;
    }
    return new Board(next);
  }

  isFull(line: Line): boolean {
    return line.cells.every((h) => this.get(h) !== 0);
  }

  /** Removes the line's cell from each column and drops everything above it by one row. */
  clear(line: Line): Board {
    const next = this.cells.slice();
    for (const h of line.cells) {
      const base = h.x * ROWS;
      const top = rowsIn(h.x) - 1;
      for (let row = rowOf(h); row < top; row++) next[base + row] = next[base + row + 1] ?? 0;
      next[base + top] = 0;
    }
    return new Board(next);
  }

  filled(): FilledCell[] {
    const result: FilledCell[] = [];
    for (let x = 0; x < COLUMNS; x++) {
      for (let row = 0; row < rowsIn(x); row++) {
        const id = this.cells[x * ROWS + row] ?? 0;
        if (id !== 0) result.push({ hex: fromRow(x, row), id });
      }
    }
    return result;
  }
}

const index = (h: Hex): number => h.x * ROWS + rowOf(h);
