/** Dev-only page (art.html): the 2011 sprites next to the SVG redraw. */
import { SKINS, SKIN_IDS, type Skin } from './art/skins';
import { PIECES, type PieceId } from './core';
import { sampleState } from './render/preview';
import { boardHeight, boardWidth, drawBoard, drawPiecePreview } from './render/board';
import { backgroundImage, loadFont, loadSkin, svgImage, tilesAt } from './render/tiles';

const LEGACY = '/legacy-art/Resources';
const SKIN_INDEX: Record<string, number> = { comic: 0, digital: 1, notebook: 2 };

async function screen(skin: Skin): Promise<HTMLCanvasElement> {
  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement('canvas');
  canvas.className = 'screen';
  canvas.width = 320 * dpr;
  canvas.height = 480 * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const images = await loadSkin(skin);
  const r = Math.min(
    (canvas.width - 8) / (boardWidth(1) + 5),
    (canvas.height - 8) / boardHeight(1),
  );
  const tiles = tilesAt(images, r);
  ctx.drawImage(await backgroundImage(skin, canvas.width, canvas.height), 0, 0);
  const layout = { r, left: 4, top: (canvas.height - boardHeight(r)) / 2 };
  drawBoard(ctx, layout, tiles, sampleState());
  drawPiecePreview(ctx, tiles, 2, boardWidth(r) + 3 * r, canvas.height * 0.45, r * 0.7);
  return canvas;
}

function figure(child: HTMLElement, caption: string): HTMLElement {
  const fig = document.createElement('figure');
  const cap = document.createElement('figcaption');
  cap.textContent = caption;
  fig.append(child, cap);
  return fig;
}

function img(src: string): HTMLImageElement {
  const image = document.createElement('img');
  image.src = src;
  image.alt = '';
  return image;
}

function tileRow(label: string, sources: string[]): HTMLElement[] {
  const span = document.createElement('span');
  span.textContent = label;
  return [span, ...sources.map(img)];
}

async function section(skin: Skin): Promise<HTMLElement> {
  const n = SKIN_INDEX[skin.id] ?? 0;
  const root = document.createElement('section');
  const title = document.createElement('h2');
  title.textContent = skin.name;

  const pair = document.createElement('div');
  pair.className = 'pair';
  const old = img(`${LEGACY}/SkinPreview_${String(n)}-hd.png`);
  old.className = 'screen';
  pair.append(figure(old, '2011'), figure(await screen(skin), 'new'));

  const fontFace = await loadFont(skin.font);
  const svgUrl = async (svg: string) => (await svgImage(svg)).src;
  const ids = PIECES.map((p) => p.id);
  const oldTiles = [
    `${LEGACY}/hexmapbg_${String(n)}-hd.png`,
    `${LEGACY}/hex_freeze_${String(n)}-hd.png`,
    ...ids.map((id) => `${LEGACY}/Skin_${String(n)}_en.bundle/Figures/hex_${String(id)}-hd.png`),
  ];
  const newTiles = await Promise.all([
    svgUrl(skin.emptyCell()),
    svgUrl(skin.locked()),
    ...ids.map((id: PieceId) => svgUrl(skin.piece(id, fontFace))),
  ]);

  const grid = document.createElement('div');
  grid.className = 'tiles';
  const header = ['', 'empty', 'locked', ...ids.map(String)].map((t) => {
    const s = document.createElement('span');
    s.textContent = t;
    return s;
  });
  grid.append(...header, ...tileRow('2011', oldTiles), ...tileRow('new', newTiles));

  root.append(title, pair, grid);
  return root;
}

function splash(): HTMLElement {
  const root = document.createElement('section');
  const title = document.createElement('h2');
  title.textContent = 'Title screen';
  const pair = document.createElement('div');
  pair.className = 'pair';
  const old = img(`${LEGACY}/Default@2x.png`);
  old.className = 'screen';
  const traced = img('/art/splash.svg');
  traced.className = 'screen';
  traced.style.background = '#d7c988';
  pair.append(figure(old, '2011'), figure(traced, 'traced SVG'));
  root.append(title, pair);
  return root;
}

const gallery = document.querySelector('#gallery');
gallery?.append(splash());
for (const id of SKIN_IDS) gallery?.append(await section(SKINS[id]));
