import { COLUMNS, ROWS, rowsIn } from '../core/board';
import type { GameState } from '../core/game';
import { pieceCells } from '../core/game';
import { type Hex, fromRow } from '../core/hex';
import type { PieceId } from '../core/pieces';
import { pieceDef } from '../core/pieces';
import type { TileSet } from './tiles';

const SQRT3 = Math.sqrt(3);

/** Where the board sits, in canvas pixels. `r` is the hex radius. */
export interface BoardLayout {
  readonly r: number;
  readonly left: number;
  readonly top: number;
}

export const boardWidth = (r: number): number => r * (1.5 * (COLUMNS - 1) + 2);
export const boardHeight = (r: number): number => r * SQRT3 * ROWS;

export function cellCentre(layout: BoardLayout, h: Hex): [number, number] {
  const rowH = SQRT3 * layout.r;
  return [
    layout.left + layout.r + h.x * 1.5 * layout.r,
    layout.top + ROWS * rowH - (h.y + 1) * (rowH / 2),
  ];
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tiles: TileSet,
  image: CanvasImageSource,
  [cx, cy]: [number, number],
) {
  ctx.drawImage(image, cx - tiles.width / 2, cy - tiles.height / 2, tiles.width, tiles.height);
}

export function drawBoard(
  ctx: CanvasRenderingContext2D,
  layout: BoardLayout,
  tiles: TileSet,
  state: GameState,
) {
  for (let x = 0; x < COLUMNS; x++) {
    for (let row = 0; row < rowsIn(x); row++) {
      drawTile(ctx, tiles, tiles.empty, cellCentre(layout, fromRow(x, row)));
    }
  }
  for (const cell of state.board.filled()) {
    drawTile(ctx, tiles, tiles.locked, cellCentre(layout, cell.hex));
  }
  if (state.piece) {
    const image = tiles.piece(state.piece.id);
    for (const h of pieceCells(state.piece)) drawTile(ctx, tiles, image, cellCentre(layout, h));
  }
}

/** Draws a piece centred on (cx, cy), for the next-piece preview. */
export function drawPiecePreview(
  ctx: CanvasRenderingContext2D,
  tiles: TileSet,
  id: PieceId,
  cx: number,
  cy: number,
  r: number,
) {
  const { cells } = pieceDef(id);
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const scale = r / (tiles.width / 2);
  const w = tiles.width * scale;
  const h = tiles.height * scale;
  for (const c of cells) {
    const x = cx + (c.x - midX) * 1.5 * r;
    const y = cy - (c.y - midY) * ((SQRT3 * r) / 2);
    ctx.drawImage(tiles.piece(id), x - w / 2, y - h / 2, w, h);
  }
}
