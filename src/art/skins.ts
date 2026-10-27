/**
 * The three 2011 skins, redrawn as SVG. Colours are sampled from the original
 * `-hd` sprites (tag v0-ios-legacy, Resources/Skin_N_en.bundle).
 */
import { nextRandom } from '../core/rng';
import type { PieceId } from '../core/pieces';
import {
  TILE_R,
  escapeXml,
  fmt,
  hexCorners,
  hexPoints,
  pageSvg,
  points,
  shade,
  tileSvg,
} from './svg';

export type SkinId = 'comic' | 'digital' | 'notebook';

export interface SkinFont {
  readonly family: string;
  /** Path under public/. */
  readonly file: string;
  readonly uppercase: boolean;
}

/** Colours for text drawn over the background (score, lines, level). */
export interface SkinHud {
  readonly text: string;
  readonly outline?: string;
}

export interface Skin {
  readonly id: SkinId;
  readonly name: string;
  readonly font: SkinFont;
  readonly hud: SkinHud;
  background(width: number, height: number): string;
  emptyCell(): string;
  /**
   * `fontFaceCss` is an @font-face rule to embed, needed when the SVG is
   * rasterised as an image (images can't see the page's fonts).
   */
  piece(id: PieceId, fontFaceCss?: string): string;
  locked(): string;
}

const colorAt = (colors: readonly string[], id: PieceId): string => colors[id - 1] ?? '#888888';

// ── Comic (Skin_0): translucent colours, thick black outlines, khaki halftone ──

const COMIC_COLORS = [
  '#f3001b',
  '#f600f0',
  '#2e00fc',
  '#3a95fc',
  '#4ffff9',
  '#43ff0f',
  '#e7ff1b',
  '#f6951b',
  '#b300fc',
  '#73d84f',
];

const comicHex = (fill: string, opacity: number, strokeWidth: number) =>
  tileSvg(
    `<polygon points="${hexPoints(TILE_R - strokeWidth / 2 - 0.5)}" fill="${fill}" fill-opacity="${String(opacity)}" stroke="#000" stroke-width="${String(strokeWidth)}" stroke-linejoin="round"/>`,
  );

const comic: Skin = {
  id: 'comic',
  name: 'Comic',
  font: { family: 'Righteous', file: 'fonts/Righteous.woff2', uppercase: false },
  hud: { text: '#e9e9e9', outline: '#1a1a1a' },
  background: (w, h) =>
    pageSvg(
      w,
      h,
      `<rect width="${String(w)}" height="${String(h)}" fill="#c7be9d"/><rect width="${String(w)}" height="${String(h)}" fill="url(#halftone)"/>`,
      `<pattern id="halftone" width="8" height="8" patternUnits="userSpaceOnUse">` +
        `<circle cx="2" cy="2" r="2.4" fill="#b8b19d"/><circle cx="6" cy="6" r="2.4" fill="#b8b19d"/>` +
        `<circle cx="6" cy="2" r="2" fill="#cdc4a0"/><circle cx="2" cy="6" r="2" fill="#cdc4a0"/></pattern>`,
    ),
  emptyCell: () => comicHex('#f8c900', 0.15, 2),
  piece: (id) => comicHex(colorAt(COMIC_COLORS, id), 0.33, 3),
  locked: () => comicHex('#2b2200', 0.5, 3),
};

// ── Digital (Skin_1): bevelled gems on a sky gradient ──

const DIGITAL_COLORS = [
  '#d03c3c',
  '#d03cc7',
  '#3338f3',
  '#3da5d1',
  '#33f3f1',
  '#53da3f',
  '#c7d13d',
  '#d07e3c',
  '#9b3dd1',
  '#87d13d',
];

// Facet i joins corner i and i+1, starting at lower-right; light comes from the upper right.
const FACET_SHADES = [0.45, -0.25, -0.25, -0.25, 0.45, 0.45];

function gem(color: string): string {
  const outer = hexCorners(TILE_R - 1);
  const inner = hexCorners(TILE_R * 0.66, -1.5, 1);
  const facets = outer
    .map((corner, i) => {
      const next = outer[(i + 1) % 6] ?? corner;
      const innerA = inner[i] ?? corner;
      const innerB = inner[(i + 1) % 6] ?? corner;
      return `<polygon points="${points([corner, next, innerB, innerA])}" fill="${shade(color, FACET_SHADES[i] ?? 0)}"/>`;
    })
    .join('');
  return tileSvg(
    `${facets}<polygon points="${points(inner)}" fill="${color}"/>` +
      `<polygon points="${points(outer)}" fill="none" stroke="#ffffff" stroke-opacity="0.75" stroke-width="1.2"/>`,
  );
}

const DIGITAL_DECOR: [x: number, y: number, r: number, turn: number][] = [
  [0.1, 0.06, 0.04, 0],
  [0.33, 0.25, 0.17, -10],
  [0.4, 0.55, 0.05, 8],
  [0.77, 0.72, 0.09, 12],
];

const digital: Skin = {
  id: 'digital',
  name: 'Digital',
  font: { family: 'Tektur', file: 'fonts/Tektur.woff2', uppercase: true },
  hud: { text: '#19f08a' },
  background: (w, h) => {
    const decor = DIGITAL_DECOR.map(([x, y, r, turn]) => {
      const radius = r * w;
      return `<polygon points="${hexPoints(radius)}" transform="translate(${fmt(x * w)} ${fmt(y * h)}) rotate(${String(turn)})" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="${fmt(Math.max(2, radius * 0.08))}"/>`;
    }).join('');
    return pageSvg(
      w,
      h,
      `<rect width="${String(w)}" height="${String(h)}" fill="url(#sky)"/>${decor}<circle cx="${fmt(0.87 * w)}" cy="${fmt(0.37 * h)}" r="${fmt(0.012 * w)}" fill="#ffffff" fill-opacity="0.7"/>`,
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cb3e5"/><stop offset="0.5" stop-color="#9ad7f8"/><stop offset="1" stop-color="#5cb3e5"/></linearGradient>`,
    );
  },
  emptyCell: () =>
    tileSvg(
      `<polygon points="${hexPoints(TILE_R - 1.5)}" fill="#24a5ff" fill-opacity="0.54" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1"/>`,
    ),
  piece: (id) => gem(colorAt(DIGITAL_COLORS, id)),
  locked: () => gem('#d1d1d1'),
};

// ── Notebook (Skin_2): ballpoint pen on graph paper ──

const PEN = '#1c2a91';

/** The 2011 skin labels each piece with the wrong colour name. Keep the joke. */
const NOTEBOOK_LABELS = [
  'BLACK',
  'ORANGE',
  'GREY',
  'BLUE',
  'CYAN',
  'MAGENTA',
  'WHITE',
  'GREEN',
  'YELLOW',
  'RED',
];

/** Fits a label inside the hex: short words get bigger letters. */
const labelSize = (label: string) => Math.min(16, 88 / Math.max(1, label.length));

/** Displacement filter that makes straight lines look hand-drawn. */
const wobble = (id: string, seed: number, scale: number) =>
  `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="${String(seed)}"/><feDisplacementMap in="SourceGraphic" scale="${String(scale)}"/></filter>`;

const penHex = (filterId: string, opacity = 1) =>
  `<polygon points="${hexPoints(TILE_R - 3)}" fill="none" stroke="${PEN}" stroke-opacity="${String(opacity)}" stroke-width="1.9" stroke-linejoin="round" filter="url(#${filterId})"/>`;

/** Back-and-forth pen strokes filling the hex, from lower left to upper right. */
function scribble(seed: number): string {
  let rng = seed;
  const jitter = (amount: number) => {
    const [value, next] = nextRandom(rng);
    rng = next;
    return (value - 0.5) * amount;
  };
  const pts: [number, number][] = [];
  for (let x = -TILE_R - 14; x <= TILE_R + 2; x += 1.9) {
    pts.push([x + jitter(3), TILE_R + jitter(4)], [x + 16 + jitter(3), -TILE_R + jitter(4)]);
  }
  return `<polyline points="${points(pts)}" fill="none" stroke="${PEN}" stroke-width="1.5" stroke-opacity="0.9" stroke-linejoin="round" clip-path="url(#nb-clip)"/>`;
}

const notebook: Skin = {
  id: 'notebook',
  name: 'Notebook',
  font: {
    family: 'Shadows Into Light Two',
    file: 'fonts/ShadowsIntoLightTwo.woff2',
    uppercase: false,
  },
  hud: { text: PEN },
  background: (w, h) => {
    const step = 15;
    const lines: string[] = [];
    for (let x = step; x < w; x += step) lines.push(`M${String(x)} 0V${String(h)}`);
    for (let y = step; y < h; y += step) lines.push(`M0 ${String(y)}H${String(w)}`);
    const margin = Math.round(w * 0.82);
    return pageSvg(
      w,
      h,
      `<rect width="${String(w)}" height="${String(h)}" fill="#fdfeff"/><path d="${lines.join('')}" stroke="#d4e7ff" stroke-width="1"/><path d="M${String(margin)} 0V${String(h)}" stroke="#f2b8b8" stroke-width="1.2"/>`,
    );
  },
  emptyCell: () => tileSvg(penHex('nb-wob-0', 0.9), wobble('nb-wob-0', 3, 1.6)),
  piece: (id, fontFaceCss = '') =>
    tileSvg(
      `${penHex(`nb-wob-${String(id)}`)}<text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-family="'Shadows Into Light Two', cursive" font-size="${fmt(labelSize(NOTEBOOK_LABELS[id - 1] ?? ''))}" fill="${PEN}" filter="url(#nb-wob-${String(id)})">${escapeXml(NOTEBOOK_LABELS[id - 1] ?? '')}</text>`,
      `${fontFaceCss ? `<style>${fontFaceCss}</style>` : ''}${wobble(`nb-wob-${String(id)}`, id * 7, 1.4)}`,
    ),
  locked: () =>
    tileSvg(
      `${scribble(11)}${penHex('nb-wob-l')}`,
      `<clipPath id="nb-clip"><polygon points="${hexPoints(TILE_R - 3)}"/></clipPath>${wobble('nb-wob-l', 5, 1.6)}`,
    ),
};

export const SKINS: Readonly<Record<SkinId, Skin>> = { comic, digital, notebook };

export const SKIN_IDS = Object.keys(SKINS) as SkinId[];
