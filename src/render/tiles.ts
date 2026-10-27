import { PIECES, type PieceId } from '../core/pieces';
import type { Skin, SkinFont } from '../art/skins';
import { TILE_H, TILE_W } from '../art/svg';

/** A skin's tiles, rasterised for one tile size. */
export interface TileSet {
  readonly skin: Skin;
  readonly width: number;
  readonly height: number;
  readonly empty: CanvasImageSource;
  readonly locked: CanvasImageSource;
  piece(id: PieceId): CanvasImageSource;
}

const fontUrl = (font: SkinFont) => `${import.meta.env.BASE_URL}${font.file}`;

const loaded = new Map<string, Promise<string>>();

/** Registers the skin's font with the page and returns an @font-face rule that embeds it. */
export function loadFont(font: SkinFont): Promise<string> {
  let promise = loaded.get(font.family);
  if (!promise) {
    promise = (async () => {
      const response = await fetch(fontUrl(font));
      const buffer = await response.arrayBuffer();
      const face = new FontFace(font.family, buffer);
      document.fonts.add(await face.load());
      let binary = '';
      for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
      const dataUrl = `data:font/woff2;base64,${btoa(binary)}`;
      return `@font-face{font-family:'${font.family}';src:url(${dataUrl}) format('woff2');}`;
    })();
    loaded.set(font.family, promise);
  }
  return promise;
}

export function svgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error('Could not decode SVG'));
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function rasterise(image: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export interface SkinImages {
  readonly skin: Skin;
  readonly empty: HTMLImageElement;
  readonly locked: HTMLImageElement;
  readonly pieces: readonly HTMLImageElement[];
}

const decoded = new Map<string, Promise<SkinImages>>();

/** Decodes a skin's SVGs once; `tilesAt` then rasterises them for any size. */
export function loadSkin(skin: Skin): Promise<SkinImages> {
  let promise = decoded.get(skin.id);
  if (!promise) {
    promise = decodeSkin(skin);
    decoded.set(skin.id, promise);
  }
  return promise;
}

async function decodeSkin(skin: Skin): Promise<SkinImages> {
  const fontFace = await loadFont(skin.font);
  const [empty, locked, ...pieces] = await Promise.all([
    svgImage(skin.emptyCell()),
    svgImage(skin.locked()),
    ...PIECES.map((p) => svgImage(skin.piece(p.id, fontFace))),
  ]);
  return { skin, empty, locked, pieces };
}

/** Tiles for a hex of radius `r` device pixels. */
export function tilesAt(images: SkinImages, r: number): TileSet {
  const width = (TILE_W / 28) * r;
  const height = (TILE_H / 28) * r;
  const pieces = images.pieces.map((image) => rasterise(image, width, height));
  return {
    skin: images.skin,
    width,
    height,
    empty: rasterise(images.empty, width, height),
    locked: rasterise(images.locked, width, height),
    piece: (id) => pieces[id - 1] ?? pieces[0] ?? rasterise(images.locked, width, height),
  };
}

export async function backgroundImage(skin: Skin, width: number, height: number) {
  return rasterise(await svgImage(skin.background(width, height)), width, height);
}
