/** Small helpers for building SVG markup as strings. */

export const SQRT3 = Math.sqrt(3);

/** Tile size: one flat-top hex with radius 28, as in the 2011 `-hd` sprites (56×48). */
export const TILE_R = 28;
export const TILE_W = 2 * TILE_R;
export const TILE_H = SQRT3 * TILE_R;

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** Corners of a flat-top hex, clockwise from the right-hand corner (SVG y points down). */
export function hexCorners(r: number, cx = 0, cy = 0): [number, number][] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

export const points = (corners: readonly [number, number][]): string =>
  corners.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ');

export const hexPoints = (r: number): string => points(hexCorners(r));

/** Wraps tile content in an SVG centred on the hex. */
export function tileSvg(body: string, defs = ''): string {
  const vb = `${fmt(-TILE_W / 2)} ${fmt(-TILE_H / 2)} ${fmt(TILE_W)} ${fmt(TILE_H)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${fmt(TILE_W)}" height="${fmt(TILE_H)}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

export function pageSvg(width: number, height: number, body: string, defs = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(width)} ${String(height)}" width="${String(width)}" height="${String(height)}" preserveAspectRatio="xMidYMid slice">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

/** Mixes a #rrggbb colour with white (amount > 0) or black (amount < 0). */
export function shade(color: string, amount: number): string {
  const n = parseInt(color.slice(1), 16);
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const channel = (shift: number) => {
    const c = (n >> shift) & 0xff;
    return Math.round(c + (target - c) * t)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(16)}${channel(8)}${channel(0)}`;
}

export const escapeXml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export { fmt };
