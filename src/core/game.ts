import { Board, COLUMNS, type Line, ROWS, allLines, rowsIn } from './board';
import { type Hex, type Rotation, add, hex, rotate, rowOf } from './hex';
import { PIECES, type PieceId, pieceDef } from './pieces';
import { nextInt } from './rng';
import {
  type Mode,
  ORIGINAL_RULES,
  type Rules,
  SOFT_DROP_INTERVAL_MS,
  SPAWN_COLUMN,
  dropIntervalMs,
  linesToWin,
  speedOf,
} from './rules';

export type Status = 'playing' | 'won' | 'lost';

export interface ActivePiece {
  readonly id: PieceId;
  readonly pivot: Hex;
  /** Offsets from the pivot, already rotated. */
  readonly offsets: readonly Hex[];
}

export interface GameState {
  readonly rules: Rules;
  readonly mode: Mode;
  readonly board: Board;
  readonly piece: ActivePiece | null;
  readonly next: PieceId;
  readonly rng: number;
  readonly score: number;
  readonly lines: number;
  readonly status: Status;
  readonly softDrop: boolean;
  /** Time since the last gravity step. */
  readonly elapsedMs: number;
}

export type Action =
  | { readonly type: 'left' }
  | { readonly type: 'right' }
  | { readonly type: 'rotate'; readonly direction: Rotation }
  | { readonly type: 'softDrop'; readonly on: boolean };

export type GameEvent =
  | { readonly type: 'spawn'; readonly piece: ActivePiece }
  | { readonly type: 'lock'; readonly cells: readonly Hex[] }
  | { readonly type: 'lines'; readonly cleared: readonly Line[] }
  | { readonly type: 'won' }
  | { readonly type: 'lost' };

export interface StepResult {
  readonly state: GameState;
  readonly events: readonly GameEvent[];
}

export interface NewGameOptions {
  readonly mode: Mode;
  readonly seed: number;
  readonly rules?: Rules;
}

export function newGame({ mode, seed, rules = ORIGINAL_RULES }: NewGameOptions): StepResult {
  dropIntervalMs(speedOf(mode)); // validates the speed
  const [first, rng] = drawPiece(seed);
  const events: GameEvent[] = [];
  const state = spawn(
    {
      rules,
      mode,
      board: Board.empty(),
      piece: null,
      next: first,
      rng,
      score: 0,
      lines: 0,
      status: 'playing',
      softDrop: false,
      elapsedMs: 0,
    },
    events,
  );
  return { state, events };
}

export const pieceCells = (piece: ActivePiece): Hex[] =>
  piece.offsets.map((offset) => add(piece.pivot, offset));

export function currentIntervalMs(state: GameState): number {
  return state.softDrop ? SOFT_DROP_INTERVAL_MS : dropIntervalMs(speedOf(state.mode));
}

export function act(state: GameState, action: Action): StepResult {
  const { piece } = state;
  if (state.status !== 'playing' || !piece) return { state, events: [] };

  if (action.type === 'softDrop') {
    if (action.on === state.softDrop) return { state, events: [] };
    return { state: { ...state, softDrop: action.on, elapsedMs: 0 }, events: [] };
  }

  // Like the original, any other input ends a soft drop.
  const base: GameState = state.softDrop ? { ...state, softDrop: false, elapsedMs: 0 } : state;
  const moved =
    action.type === 'rotate'
      ? rotated(base, piece, action.direction)
      : shifted(base, piece, action.type === 'left' ? -1 : 1);
  return { state: moved ? { ...base, piece: moved } : base, events: [] };
}

/** Advances time by `dtMs`, applying as many gravity steps as are due. */
export function tick(state: GameState, dtMs: number): StepResult {
  const events: GameEvent[] = [];
  let current: GameState = { ...state, elapsedMs: state.elapsedMs + dtMs };
  while (current.status === 'playing' && current.elapsedMs >= currentIntervalMs(current)) {
    current = gravity(
      { ...current, elapsedMs: current.elapsedMs - currentIntervalMs(current) },
      events,
    );
  }
  return { state: current, events };
}

function fits(board: Board, cells: readonly Hex[]): boolean {
  return cells.every((h) => {
    // Cells above the board are allowed while the piece is falling.
    if (h.x >= 0 && h.x < COLUMNS && rowOf(h) >= rowsIn(h.x)) return true;
    return Board.isInside(h) && board.get(h) === 0;
  });
}

const withPivot = (piece: ActivePiece, pivot: Hex): ActivePiece => ({ ...piece, pivot });

/**
 * Moves one column sideways, keeping the pivot in the same row: the piece
 * steps half a cell up into an odd column and half a cell down out of one.
 * When the upward step is blocked it tries the downward diagonal instead,
 * never the reverse, so sideways moves can't make a piece climb.
 */
function shifted(state: GameState, piece: ActivePiece, dx: -1 | 1): ActivePiece | null {
  const steps = piece.pivot.x % 2 === 0 ? [1, -1] : [-1];
  for (const dy of steps) {
    const candidate = withPivot(piece, add(piece.pivot, hex(dx, dy)));
    if (fits(state.board, pieceCells(candidate))) return candidate;
  }
  return null;
}

/**
 * Rotates 60° around the pivot. If that pushes cells through a side wall,
 * the piece is nudged back inside (as the original did); if it overlaps
 * locked cells or the floor, the rotation is refused.
 */
function rotated(state: GameState, piece: ActivePiece, direction: Rotation): ActivePiece | null {
  const turned: ActivePiece = { ...piece, offsets: piece.offsets.map((o) => rotate(o, direction)) };
  const xs = pieceCells(turned).map((h) => h.x);
  const overflow = Math.min(0, Math.min(...xs)) || Math.max(0, Math.max(...xs) - (COLUMNS - 1));
  const kicks = overflow === 0 ? [hex(0, 0)] : wallKicks(-overflow);
  for (const kick of kicks) {
    const candidate = withPivot(turned, add(turned.pivot, kick));
    if (fits(state.board, pieceCells(candidate))) return candidate;
  }
  return null;
}

/** Offsets that move `dx` columns sideways, lowest first. */
function wallKicks(dx: number): Hex[] {
  return Math.abs(dx) % 2 === 0 ? [hex(dx, 0)] : [hex(dx, -1), hex(dx, 1)];
}

function gravity(state: GameState, events: GameEvent[]): GameState {
  const piece = state.piece;
  if (!piece) return state;
  const fallen = withPivot(piece, add(piece.pivot, hex(0, -2)));
  if (fits(state.board, pieceCells(fallen))) {
    return { ...state, piece: fallen, score: state.score + (state.softDrop ? 1 : 0) };
  }
  return lock(state, piece, events);
}

function lock(state: GameState, piece: ActivePiece, events: GameEvent[]): GameState {
  const cells = pieceCells(piece);
  events.push({ type: 'lock', cells });
  if (!cells.every((h) => Board.isInside(h))) {
    events.push({ type: 'lost' });
    return { ...state, piece: null, status: 'lost' };
  }

  let board = state.board.place(cells, piece.id);
  const cleared: Line[] = [];
  for (let line = findFullLine(board, state.rules); line; line = findFullLine(board, state.rules)) {
    cleared.push(line);
    board = board.clear(line);
  }
  if (cleared.length > 0) events.push({ type: 'lines', cleared });

  const lines = state.lines + cleared.length;
  const after: GameState = { ...state, board, lines, piece: null };
  if (state.mode.kind === 'levels' && lines >= linesToWin(state.mode.level)) {
    events.push({ type: 'won' });
    return { ...after, status: 'won' };
  }
  return spawn(after, events);
}

function findFullLine(board: Board, rules: Rules): Line | undefined {
  return allLines(rules.lineShapes).find((line) => board.isFull(line));
}

/** Places `next` with its top cell on the top row of the spawn column. */
function spawn(state: GameState, events: GameEvent[]): GameState {
  const def = pieceDef(state.next);
  const top = Math.max(...def.cells.map((c) => c.y));
  const piece: ActivePiece = {
    id: def.id,
    pivot: hex(SPAWN_COLUMN, 2 * (ROWS - 1) - top),
    offsets: def.cells,
  };
  const [next, rng] = drawPiece(state.rng);
  const spawned: GameState = { ...state, piece, next, rng, softDrop: false, elapsedMs: 0 };
  events.push({ type: 'spawn', piece });
  if (!fits(state.board, pieceCells(piece))) {
    events.push({ type: 'lost' });
    return { ...spawned, status: 'lost' };
  }
  return spawned;
}

function drawPiece(rng: number): [PieceId, number] {
  const [index, next] = nextInt(rng, PIECES.length);
  return [(index + 1) as PieceId, next];
}
