import type { Skin } from '../art/skins';
import { Board, type GameState, fromRow, hex, newGame, pieceDef } from '../core';
import { nextRandom } from '../core/rng';
import { boardHeight, boardWidth, drawBoard, drawPiecePreview } from './board';
import { loadSkin, tilesAt } from './tiles';

/** A mid-game board, like the 2011 skin previews. */
export function sampleState(): GameState {
  let rng = 4;
  const cells = [];
  for (let x = 0; x < 11; x++) {
    const height = 3 + ((x * 5) % 4);
    for (let row = 0; row < height; row++) {
      const [value, next] = nextRandom(rng);
      rng = next;
      if (row < 2 || value < 0.7) cells.push(fromRow(x, row));
    }
  }
  const base = newGame({ mode: { kind: 'levels', level: 1 }, seed: 3 }).state;
  return {
    ...base,
    board: Board.fromCells(cells),
    piece: { id: 7, pivot: hex(3, 28), offsets: pieceDef(7).cells },
    next: 2,
  };
}

/** Draws the sample board and next piece onto a transparent canvas of the given CSS size. */
export async function drawSkinPreview(
  canvas: HTMLCanvasElement,
  skin: Skin,
  width: number,
  height: number,
): Promise<void> {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${String(width)}px`;
  canvas.style.height = `${String(height)}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const r = Math.min(canvas.width / (boardWidth(1) + 5), canvas.height / boardHeight(1));
  const tiles = tilesAt(await loadSkin(skin), r);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard(ctx, { r, left: 0, top: (canvas.height - boardHeight(r)) / 2 }, tiles, sampleState());
  drawPiecePreview(ctx, tiles, 2, boardWidth(r) + 2.5 * r, canvas.height * 0.4, r * 0.7);
}
