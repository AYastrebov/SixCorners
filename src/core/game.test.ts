import { describe, expect, it } from 'vitest';
import { Board, COLUMNS, ROWS, lineCells } from './board';
import {
  type Action,
  type GameState,
  act,
  currentIntervalMs,
  newGame,
  pieceCells,
  tick,
} from './game';
import { type Hex, fromRow, hex, rowOf } from './hex';
import { PIECES, type PieceId, pieceDef } from './pieces';
import { type Mode, ORIGINAL_RULES, SOFT_DROP_INTERVAL_MS, type Rules } from './rules';

const LEVEL_1: Mode = { kind: 'levels', level: 1 };

function game(overrides: Partial<GameState> = {}, mode: Mode = LEVEL_1): GameState {
  return { ...newGame({ mode, seed: 42 }).state, ...overrides };
}

function withPiece(state: GameState, id: PieceId, pivot: Hex): GameState {
  return { ...state, piece: { id, pivot, offsets: pieceDef(id).cells } };
}

const step = (state: GameState) => tick(state, currentIntervalMs(state));

function dropUntilLocked(state: GameState) {
  for (let i = 0; i < 100; i++) {
    const result = step(state);
    if (result.events.some((e) => e.type === 'lock')) return result;
    state = result.state;
  }
  throw new Error('piece never locked');
}

const run = (state: GameState, ...actions: Action[]) =>
  actions.reduce((s, a) => act(s, a).state, state);

/** Every cell of a line except column `gap`. */
const lineWithGap = (cells: readonly Hex[], gap: number) => cells.filter((h) => h.x !== gap);

describe('new game', () => {
  it('is deterministic for a seed', () => {
    const sequence = (seed: number) => {
      let state = newGame({ mode: LEVEL_1, seed }).state;
      const ids: PieceId[] = [];
      for (let i = 0; i < 20; i++) {
        ids.push(state.next);
        state = withPiece({ ...state, board: Board.empty() }, 1, hex(4, 10));
        state = dropUntilLocked(state).state;
      }
      return ids;
    };
    expect(sequence(7)).toEqual(sequence(7));
    expect(sequence(7)).not.toEqual(sequence(8));
  });

  it('rejects speeds outside 1–10', () => {
    expect(() => newGame({ mode: { kind: 'levels', level: 11 }, seed: 1 })).toThrow(RangeError);
    expect(() => newGame({ mode: { kind: 'endless', speed: 0 }, seed: 1 })).toThrow(RangeError);
  });
});

describe('spawning', () => {
  it.each(PIECES)('puts piece $id in column 4 with its top cell on the top row', ({ id }) => {
    const state = game({ next: id });
    const { state: spawned } = dropUntilLocked(withPiece(state, 1, hex(0, 10)));
    const cells = pieceCells(spawned.piece ?? fail());
    expect(spawned.piece?.id).toBe(id);
    expect(Math.max(...cells.map((h) => h.y))).toBe(2 * (ROWS - 1));
    expect(cells.every((h) => Board.isInside(h))).toBe(true);
  });

  it('loses when the new piece overlaps locked cells', () => {
    const blocked = Board.fromCells([fromRow(4, ROWS - 1), fromRow(4, ROWS - 2)]);
    const state = withPiece(game({ board: blocked }), 1, hex(0, 6));
    const { state: after, events } = dropUntilLocked(state);
    expect(after.status).toBe('lost');
    expect(events.map((e) => e.type)).toEqual(['lock', 'spawn', 'lost']);
  });
});

describe('moving', () => {
  it('zig-zags sideways and returns to the same place', () => {
    const start = withPiece(game(), 2, hex(4, 20));
    const right = run(start, { type: 'right' });
    expect(right.piece?.pivot).toEqual(hex(5, 21));
    expect(run(right, { type: 'right' }).piece?.pivot).toEqual(hex(6, 20));
    expect(run(right, { type: 'left' }).piece?.pivot).toEqual(start.piece?.pivot);
  });

  it('stops at the walls', () => {
    let state = withPiece(game(), 1, hex(4, 20));
    for (let i = 0; i < 20; i++) state = run(state, { type: 'left' });
    expect(state.piece?.pivot.x).toBe(0);
    for (let i = 0; i < 20; i++) state = run(state, { type: 'right' });
    expect(state.piece?.pivot.x).toBe(COLUMNS - 1);
  });

  it('steps down instead of up when the upward diagonal is blocked', () => {
    const board = Board.fromCells([fromRow(5, 9)]);
    const state = withPiece(game({ board }), 1, fromRow(4, 8));
    // Upward step would put the bar's top cell on (5, row 9).
    expect(run(state, { type: 'right' }).piece?.pivot).toEqual(hex(5, 15));
  });

  it('never climbs when stepping out of an odd column is blocked', () => {
    const board = Board.fromCells([fromRow(6, 4)]);
    const state = withPiece(game({ board }), 1, fromRow(5, 6));
    expect(run(state, { type: 'right' }).piece?.pivot).toEqual(fromRow(5, 6));
  });
});

describe('rotating', () => {
  it('turns the piece around its pivot', () => {
    const state = withPiece(game(), 2, hex(4, 20));
    const turned = run(state, { type: 'rotate', direction: 'ccw' });
    expect(turned.piece?.pivot).toEqual(hex(4, 20));
    expect(turned.piece?.offsets).toEqual([hex(-1, 1), hex(0, 0), hex(0, -2), hex(1, 1)]);
  });

  it('nudges the piece back inside when it turns through a wall', () => {
    const state = withPiece(game(), 1, hex(0, 20));
    const turned = run(state, { type: 'rotate', direction: 'ccw' });
    expect(turned.piece?.pivot).toEqual(hex(1, 19));
    expect(pieceCells(turned.piece ?? fail()).every((h) => Board.isInside(h))).toBe(true);
  });

  it('refuses to turn into locked cells', () => {
    const state = withPiece(game({ board: Board.fromCells([hex(3, 21)]) }), 1, hex(4, 20));
    expect(run(state, { type: 'rotate', direction: 'ccw' }).piece).toEqual(state.piece);
  });
});

describe('gravity', () => {
  it('drops one row per interval and catches up on long frames', () => {
    const state = withPiece(game(), 1, hex(4, 30));
    expect(step(state).state.piece?.pivot).toEqual(hex(4, 28));
    expect(tick(state, 3 * currentIntervalMs(state)).state.piece?.pivot).toEqual(hex(4, 24));
    expect(tick(state, currentIntervalMs(state) - 1).state.piece?.pivot).toEqual(hex(4, 30));
  });

  it('locks a piece that cannot fall and spawns the next one', () => {
    const state = withPiece(game({ next: 9 }), 1, hex(4, 20));
    const { state: after, events } = dropUntilLocked(state);
    expect(after.board.filled().map((c) => rowOf(c.hex))).toEqual([0, 1, 2, 3]);
    expect(after.piece?.id).toBe(9);
    expect(events.map((e) => e.type)).toEqual(['lock', 'spawn']);
  });

  it('loses when a piece locks above the board', () => {
    const column = Array.from({ length: ROWS - 2 }, (_, row) => fromRow(4, row));
    const state = withPiece(game({ board: Board.fromCells(column) }), 1, hex(4, 40));
    const { state: after, events } = step(state);
    expect(after.status).toBe('lost');
    expect(events.map((e) => e.type)).toEqual(['lock', 'lost']);
  });
});

describe('soft drop', () => {
  it('falls fast and scores a point per row', () => {
    const state = run(withPiece(game(), 1, hex(4, 30)), { type: 'softDrop', on: true });
    const { state: after } = tick(state, 3 * SOFT_DROP_INTERVAL_MS);
    expect(after.piece?.pivot).toEqual(hex(4, 24));
    expect(after.score).toBe(3);
  });

  it('ends on any other input, like the original', () => {
    const state = run(
      withPiece(game(), 1, hex(4, 30)),
      { type: 'softDrop', on: true },
      { type: 'left' },
    );
    expect(state.softDrop).toBe(false);
  });

  it('ends when the next piece spawns', () => {
    const state = run(withPiece(game(), 1, hex(4, 10)), { type: 'softDrop', on: true });
    expect(dropUntilLocked(state).state.softDrop).toBe(false);
  });
});

describe('lines', () => {
  const fillGap = (rules: Rules, cells: readonly Hex[], pivot: Hex) =>
    dropUntilLocked(withPiece(game({ rules, board: Board.fromCells(cells) }), 1, pivot));

  it('clears a full rising line and drops the cells above it', () => {
    const marker = fromRow(0, 2);
    const { state, events } = fillGap(
      ORIGINAL_RULES,
      [...lineWithGap(lineCells('rising', 0), 4), marker],
      hex(4, 20),
    );
    expect(state.lines).toBe(1);
    expect(events.find((e) => e.type === 'lines')).toMatchObject({
      cleared: [{ shape: 'rising', n: 0 }],
    });
    expect(state.board.filled().map((c) => c.hex)).toEqual([
      fromRow(0, 1),
      fromRow(4, 0),
      fromRow(4, 1),
      fromRow(4, 2),
    ]);
  });

  it('ignores falling lines under the original rules', () => {
    const cells = [...lineWithGap(lineCells('falling', 1), 4), fromRow(4, 0)];
    expect(fillGap(ORIGINAL_RULES, cells, hex(4, 20)).state.lines).toBe(0);
  });

  it('clears falling lines when the rules turn them on', () => {
    const cells = [...lineWithGap(lineCells('falling', 1), 4), fromRow(4, 0)];
    const { state } = fillGap({ lineShapes: ['rising', 'falling'] }, cells, hex(4, 20));
    expect(state.lines).toBe(1);
  });

  it('wins a level after 9 + level lines', () => {
    const cells = lineWithGap(lineCells('rising', 0), 4);
    const state = withPiece(game({ lines: 9, board: Board.fromCells(cells) }), 1, hex(4, 20));
    const { state: after, events } = dropUntilLocked(state);
    expect(after.status).toBe('won');
    expect(events.map((e) => e.type)).toEqual(['lock', 'lines', 'won']);
    expect(act(after, { type: 'left' }).state).toBe(after);
  });

  it('never wins in endless mode', () => {
    const cells = lineWithGap(lineCells('rising', 0), 4);
    const base = game({ lines: 99, board: Board.fromCells(cells) }, { kind: 'endless', speed: 10 });
    const { state } = dropUntilLocked(withPiece(base, 1, hex(4, 20)));
    expect(state.status).toBe('playing');
    expect(state.lines).toBe(100);
  });
});

function fail(): never {
  throw new Error('expected a piece');
}
