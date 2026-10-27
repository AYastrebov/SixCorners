import { SKINS } from '../art/skins';
import {
  type Action,
  type GameEvent,
  type GameState,
  type Hex,
  type Mode,
  act,
  newGame,
  tick,
} from '../core';
import {
  type BoardLayout,
  boardHeight,
  boardWidth,
  cellCentre,
  drawBoard,
  drawPiecePreview,
} from '../render/board';
import { type TileSet, loadSkin, tilesAt } from '../render/tiles';
import { button, h } from './dom';
import type { Nav, Screen } from './screens';
import { modeKey } from './settings';

const MAX_FRAME_MS = 250;
const SWIPE_PX = 40;
const FLASH_MS = 180;
/** HUD width in hex radii. */
const HUD_R = 6;
const SCREEN_MARGIN = 12;

export async function gameScreen(nav: Nav, startMode: Mode): Promise<Screen> {
  let mode = startMode;
  const skin = SKINS[nav.settings().skin];
  const images = await loadSkin(skin);

  const board = h('canvas', { class: 'board', 'aria-label': 'Game board', role: 'img' });
  const next = h('canvas', { class: 'next', 'aria-hidden': 'true' });
  const score = h('output', { class: 'value' });
  const lines = h('output', { class: 'value' });
  const level = h('output', { class: 'value' });
  const levelLabel = h('span', { class: 'label' });
  const pause = button(
    'pause',
    () => {
      setPaused(true);
    },
    { class: 'btn round pause', 'aria-label': 'Pause' },
  );
  const hud = h(
    'aside',
    { class: 'hud' },
    h('div', { class: 'stat' }, h('span', { class: 'label' }, 'score:'), score),
    h('div', { class: 'stat' }, h('span', { class: 'label' }, 'lines:'), lines),
    h('div', { class: 'stat' }, levelLabel, level),
    next,
    pause,
  );
  const el = h('section', { class: 'screen screen-game' }, h('div', { class: 'game' }, board, hud));

  const ctx = board.getContext('2d');
  const nextCtx = next.getContext('2d');
  if (!ctx || !nextCtx) throw new Error('Canvas 2D is not available');

  let state: GameState = newGame({ mode, seed: Date.now() >>> 0 }).state;
  let paused = false;
  let overlay: HTMLElement | null = null;
  let flash: { cells: Hex[]; until: number } | null = null;
  let last = performance.now();
  let frameId = 0;
  let layout: BoardLayout = { r: 16, left: 0, top: 0 };
  let tiles: TileSet = tilesAt(images, 16);
  let nextTiles: TileSet = tiles;
  let shownNext = -1;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth - 2 * SCREEN_MARGIN;
    const height = window.innerHeight - 2 * SCREEN_MARGIN;
    const r = Math.min(width / (boardWidth(1) + HUD_R), height / boardHeight(1));
    el.style.setProperty('--r', `${String(r)}px`);
    board.width = Math.round(boardWidth(r) * dpr);
    board.height = Math.round(boardHeight(r) * dpr);
    board.style.width = `${String(boardWidth(r))}px`;
    board.style.height = `${String(boardHeight(r))}px`;
    layout = { r: r * dpr, left: 0, top: 0 };
    tiles = tilesAt(images, layout.r);
    next.width = Math.round(4 * r * dpr);
    next.height = Math.round(4.5 * r * dpr);
    nextTiles = tilesAt(images, layout.r * 0.7);
    shownNext = -1;
  }

  function render(now: number) {
    ctx?.clearRect(0, 0, board.width, board.height);
    if (!ctx) return;
    drawBoard(ctx, layout, tiles, state);
    if (flash && now < flash.until) {
      ctx.globalAlpha = (flash.until - now) / FLASH_MS;
      ctx.fillStyle = '#ffffff';
      for (const c of flash.cells) {
        const [cx, cy] = cellCentre(layout, c);
        ctx.beginPath();
        ctx.arc(cx, cy, layout.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (shownNext !== state.next) {
      shownNext = state.next;
      nextCtx?.clearRect(0, 0, next.width, next.height);
      if (nextCtx) {
        drawPiecePreview(
          nextCtx,
          nextTiles,
          state.next,
          next.width / 2,
          next.height / 2,
          layout.r * 0.7,
        );
      }
    }
    score.textContent = String(state.score);
    lines.textContent = String(state.lines);
    levelLabel.textContent = mode.kind === 'levels' ? 'level:' : 'speed:';
    level.textContent = String(mode.kind === 'levels' ? mode.level : mode.speed);
  }

  function frame(now: number) {
    const dt = Math.min(now - last, MAX_FRAME_MS);
    last = now;
    if (!paused && state.status === 'playing') {
      const result = tick(state, dt);
      state = result.state;
      handle(result.events, now);
    }
    render(now);
    frameId = requestAnimationFrame(frame);
  }

  function handle(events: readonly GameEvent[], now: number) {
    for (const event of events) {
      if (event.type === 'lines') {
        flash = { cells: event.cleared.flatMap((line) => line.cells), until: now + FLASH_MS };
      } else if (event.type === 'won' || event.type === 'lost') {
        finish(event.type === 'won');
      }
    }
  }

  function send(action: Action) {
    if (paused || overlay) return;
    state = act(state, action).state;
  }

  function restart(nextMode: Mode) {
    mode = nextMode;
    state = newGame({ mode, seed: Date.now() >>> 0 }).state;
    closeOverlay();
    paused = false;
    shownNext = -1;
  }

  function closeOverlay() {
    overlay?.remove();
    overlay = null;
    pause.disabled = false;
  }

  function showOverlay(panel: HTMLElement, focus: HTMLElement) {
    closeOverlay();
    overlay = h('div', { class: 'overlay' }, panel);
    pause.disabled = true;
    el.append(overlay);
    focus.focus();
  }

  function setPaused(value: boolean) {
    if (state.status !== 'playing') return;
    paused = value;
    if (!value) {
      closeOverlay();
      last = performance.now();
      return;
    }
    const resume = button('Resume', () => {
      setPaused(false);
    });
    showOverlay(
      h(
        'div',
        { class: 'panel', role: 'dialog', 'aria-label': 'Paused' },
        h('h2', { class: 'panel-title' }, 'Pause'),
        h(
          'nav',
          { class: 'menu' },
          resume,
          button('Retry', () => {
            restart(mode);
          }),
          button('Menu', nav.mainMenu),
        ),
      ),
      resume,
    );
  }

  function finish(won: boolean) {
    const key = modeKey(mode);
    const { best } = nav.settings();
    const previous = best[key] ?? 0;
    const record = state.score > previous;
    if (record) nav.update({ best: { ...best, [key]: state.score } });

    const nextLevel: Mode | null =
      won && mode.kind === 'levels'
        ? { kind: 'levels', level: Math.min(10, mode.level + 1) }
        : null;
    const primary = nextLevel
      ? button(mode.kind === 'levels' && mode.level === 10 ? 'Play again' : 'Next', () => {
          restart(nextLevel);
        })
      : button('Retry', () => {
          restart(mode);
        });
    const row = (label: string, value: string | number) =>
      h(
        'div',
        { class: 'stat' },
        h('span', { class: 'label' }, label),
        h('span', { class: 'value' }, String(value)),
      );
    showOverlay(
      h(
        'div',
        {
          class: `panel ${won ? 'won' : 'lost'}`,
          role: 'dialog',
          'aria-label': won ? 'You win' : 'Game over',
        },
        h('h2', { class: 'panel-title' }, won ? 'Win!' : 'Lose...'),
        row(
          mode.kind === 'levels' ? 'level:' : 'speed:',
          mode.kind === 'levels' ? mode.level : mode.speed,
        ),
        row('lines:', state.lines),
        row('score:', state.score),
        row(record ? 'new best!' : 'best:', Math.max(previous, state.score)),
        h('nav', { class: 'menu' }, primary, button('Menu', nav.mainMenu, { class: 'btn small' })),
      ),
      primary,
    );
  }

  // Keyboard.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'p') {
      setPaused(!paused);
      e.preventDefault();
      return;
    }
    if (overlay) return;
    const actions: Record<string, Action> = {
      ArrowLeft: { type: 'left' },
      a: { type: 'left' },
      ArrowRight: { type: 'right' },
      d: { type: 'right' },
      ArrowUp: { type: 'rotate', direction: 'ccw' },
      w: { type: 'rotate', direction: 'ccw' },
      x: { type: 'rotate', direction: 'ccw' },
      z: { type: 'rotate', direction: 'cw' },
      ArrowDown: { type: 'softDrop', on: true },
      s: { type: 'softDrop', on: true },
    };
    const action = actions[e.key];
    if (!action) return;
    e.preventDefault();
    if (action.type === 'softDrop' && e.repeat) return;
    send(action);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 's') send({ type: 'softDrop', on: false });
  };

  // Touch and mouse: drag sideways one column at a time, swipe down to drop, tap to rotate.
  let drag: { x: number; y: number; moved: boolean } | null = null;
  board.addEventListener('pointerdown', (e) => {
    board.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, moved: false };
  });
  board.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const step = (1.5 * layout.r) / (window.devicePixelRatio || 1);
    while (e.clientX - drag.x >= step) {
      send({ type: 'right' });
      drag = { ...drag, x: drag.x + step, moved: true };
    }
    while (drag.x - e.clientX >= step) {
      send({ type: 'left' });
      drag = { ...drag, x: drag.x - step, moved: true };
    }
  });
  board.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.y;
    const dx = Math.abs(e.clientX - drag.x);
    const wasDrag = drag.moved;
    drag = null;
    if (dy > SWIPE_PX && dy > dx) {
      send({ type: 'softDrop', on: true });
    } else if (!wasDrag && dx < SWIPE_PX / 2 && Math.abs(dy) < SWIPE_PX / 2) {
      send({ type: 'rotate', direction: 'ccw' });
    }
  });

  const onHidden = () => {
    if (document.hidden) setPaused(true);
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onHidden);
  resize();
  frameId = requestAnimationFrame(frame);

  return {
    el,
    dispose: () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onHidden);
    },
  };
}
