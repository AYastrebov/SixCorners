/**
 * Temporary play-test screen: the real board and art, but no menus yet.
 * The HTML/CSS menus and score panels replace the sidebar text drawn here.
 */
import { SKINS, SKIN_IDS, type SkinId } from './art/skins';
import {
  type Action,
  type GameEvent,
  type Hex,
  type Mode,
  ORIGINAL_RULES,
  type Rules,
  act,
  newGame,
  tick,
} from './core';
import {
  type BoardLayout,
  boardHeight,
  boardWidth,
  cellCentre,
  drawBoard,
  drawPiecePreview,
} from './render/board';
import { type SkinImages, type TileSet, backgroundImage, loadSkin, tilesAt } from './render/tiles';

const MAX_FRAME_MS = 250;
const SWIPE_PX = 40;
const FLASH_MS = 180;
/** Sidebar width in hex radii. */
const SIDEBAR_R = 6;

interface Options {
  readonly mode: Mode;
  readonly rules: Rules;
  readonly seed: number;
  readonly skin: SkinId;
}

function optionsFromUrl(): Options {
  const params = new URLSearchParams(location.search);
  const num = (name: string) => {
    const value = Number(params.get(name));
    return Number.isInteger(value) && value >= 1 && value <= 10 ? value : undefined;
  };
  const endless = num('endless');
  const mode: Mode =
    endless !== undefined
      ? { kind: 'endless', speed: endless }
      : { kind: 'levels', level: num('level') ?? 1 };
  const rules: Rules =
    params.get('falling') === '1' ? { lineShapes: ['rising', 'falling'] } : ORIGINAL_RULES;
  const seed = Number(params.get('seed')) || Math.floor(Math.random() * 2 ** 31);
  const skinParam = params.get('skin');
  const skin = SKIN_IDS.find((id) => id === skinParam) ?? 'comic';
  return { mode, rules, seed, skin };
}

export async function startPlaytest(root: HTMLElement): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.className = 'playtest';
  root.replaceChildren(canvas);
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) throw new Error('Canvas 2D is not available');
  const ctx = maybeCtx;

  const options = optionsFromUrl();
  let mode = options.mode;
  let seed = options.seed;
  let state = newGame({ mode, rules: options.rules, seed }).state;
  let paused = false;
  let flash: { cells: Hex[]; until: number } | null = null;
  let last = performance.now();

  let skinId = options.skin;
  let images: SkinImages = await loadSkin(SKINS[skinId]);
  let tiles: TileSet = tilesAt(images, 16);
  let background: CanvasImageSource | null = null;
  let layout: BoardLayout = { r: 16, left: 0, top: 0 };

  /** Everything is laid out in device pixels so tiles stay sharp. */
  async function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${String(window.innerWidth)}px`;
    canvas.style.height = `${String(window.innerHeight)}px`;
    const margin = 16 * dpr;
    const r = Math.min(
      (canvas.width - 2 * margin) / (boardWidth(1) + SIDEBAR_R),
      (canvas.height - 2 * margin) / boardHeight(1),
    );
    layout = {
      r,
      left: (canvas.width - (boardWidth(r) + SIDEBAR_R * r)) / 2,
      top: (canvas.height - boardHeight(r)) / 2,
    };
    tiles = tilesAt(images, r);
    background = await backgroundImage(images.skin, canvas.width, canvas.height);
  }

  async function switchSkin(next: SkinId) {
    skinId = next;
    images = await loadSkin(SKINS[next]);
    const url = new URL(location.href);
    url.searchParams.set('skin', next);
    history.replaceState(null, '', url);
    await resize();
  }

  function text(value: string, x: number, y: number, size: number) {
    const { font, hud } = images.skin;
    ctx.font = `${String(Math.round(size))}px '${font.family}', system-ui, sans-serif`;
    const shown = font.uppercase ? value.toUpperCase() : value;
    if (hud.outline) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = size * 0.16;
      ctx.strokeStyle = hud.outline;
      ctx.strokeText(shown, x, y);
    }
    ctx.fillStyle = hud.text;
    ctx.fillText(shown, x, y);
  }

  function draw(now: number) {
    if (background) ctx.drawImage(background, 0, 0);
    drawBoard(ctx, layout, tiles, state);

    if (flash && now < flash.until) {
      ctx.globalAlpha = (flash.until - now) / FLASH_MS;
      for (const h of flash.cells) {
        const [cx, cy] = cellCentre(layout, h);
        ctx.beginPath();
        ctx.arc(cx, cy, layout.r * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    drawSidebar();
    if (paused || state.status !== 'playing') drawBanner();
  }

  function drawSidebar() {
    const { r } = layout;
    const x = layout.left + boardWidth(r) + r;
    let y = layout.top + 1.2 * r;
    const stat = (label: string, value: string) => {
      text(`${label}:`, x, y, r * 1.1);
      y += r * 1.6;
      text(value, x + 0.2 * r, y, r * 1.3);
      y += r * 2;
    };
    stat('score', String(state.score));
    stat('lines', String(state.lines));
    stat(
      mode.kind === 'levels' ? 'level' : 'speed',
      String(mode.kind === 'levels' ? mode.level : mode.speed),
    );
    drawPiecePreview(ctx, tiles, state.next, x + 2.2 * r, y + 2.5 * r, r * 0.75);
    text(images.skin.name, x, layout.top + boardHeight(r) - 0.5 * r, r * 0.8);
  }

  function drawBanner() {
    const message = paused
      ? 'Paused'
      : state.status === 'won'
        ? 'Level complete! Tap for next'
        : 'Game over. Tap to retry';
    const { r } = layout;
    const cy = layout.top + boardHeight(r) / 2;
    ctx.fillStyle = 'rgba(20,20,20,0.75)';
    ctx.fillRect(layout.left, cy - 1.8 * r, boardWidth(r), 3.6 * r);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${String(Math.round(r * 1.1))}px '${images.skin.font.family}', system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(message, layout.left + boardWidth(r) / 2, cy);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }

  function handle(events: readonly GameEvent[], now: number) {
    for (const event of events) {
      if (event.type === 'lines') {
        flash = { cells: event.cleared.flatMap((line) => line.cells), until: now + FLASH_MS };
      }
    }
  }

  function send(action: Action) {
    if (paused) return;
    state = act(state, action).state;
  }

  function restartOrContinue() {
    if (state.status === 'won' && mode.kind === 'levels' && mode.level < 10) {
      mode = { kind: 'levels', level: mode.level + 1 };
    }
    seed += 1;
    state = newGame({ mode, rules: options.rules, seed }).state;
  }

  function frame(now: number) {
    const dt = Math.min(now - last, MAX_FRAME_MS);
    last = now;
    if (!paused) {
      const result = tick(state, dt);
      state = result.state;
      handle(result.events, now);
    }
    draw(now);
    requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'k') {
      const next = SKIN_IDS[(SKIN_IDS.indexOf(skinId) + 1) % SKIN_IDS.length] ?? 'comic';
      void switchSkin(next);
      return;
    }
    if (state.status !== 'playing') {
      if (e.key === 'Enter' || e.key === ' ') restartOrContinue();
      return;
    }
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        send({ type: 'left' });
        break;
      case 'ArrowRight':
      case 'd':
        send({ type: 'right' });
        break;
      case 'ArrowUp':
      case 'w':
      case 'x':
        send({ type: 'rotate', direction: 'ccw' });
        break;
      case 'z':
        send({ type: 'rotate', direction: 'cw' });
        break;
      case 'ArrowDown':
      case 's':
        if (!e.repeat) send({ type: 'softDrop', on: true });
        break;
      case 'p':
      case 'Escape':
        paused = !paused;
        break;
      default:
        return;
    }
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown' || e.key === 's') send({ type: 'softDrop', on: false });
  });

  // Touch and mouse: drag sideways one column at a time, swipe down to drop, tap to rotate.
  let drag: { x: number; y: number; moved: boolean } | null = null;
  const columnPx = () => (1.5 * layout.r) / (window.devicePixelRatio || 1);
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, moved: false };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const step = columnPx();
    while (e.clientX - drag.x >= step) {
      send({ type: 'right' });
      drag = { ...drag, x: drag.x + step, moved: true };
    }
    while (drag.x - e.clientX >= step) {
      send({ type: 'left' });
      drag = { ...drag, x: drag.x - step, moved: true };
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    const dx = Math.abs(e.clientX - drag.x);
    const wasDrag = drag.moved;
    drag = null;
    if (state.status !== 'playing') {
      restartOrContinue();
    } else if (dy > SWIPE_PX && dy > dx) {
      send({ type: 'softDrop', on: true });
    } else if (!wasDrag && dx < SWIPE_PX / 2 && Math.abs(dy) < SWIPE_PX / 2) {
      send({ type: 'rotate', direction: 'ccw' });
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) paused = true;
  });
  window.addEventListener('resize', () => void resize());

  await resize();
  requestAnimationFrame(frame);
}
