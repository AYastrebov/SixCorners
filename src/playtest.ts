/**
 * Temporary Canvas 2D view for play-testing the rules engine. The real board
 * (PixiJS, redrawn art) replaces this; keep it simple rather than pretty.
 */
import {
  type Action,
  COLUMNS,
  type GameEvent,
  type Hex,
  type Mode,
  ORIGINAL_RULES,
  ROWS,
  type Rules,
  act,
  hex,
  newGame,
  pieceCells,
  pieceDef,
  tick,
} from './core';

// Piece colours sampled from the 2011 glossy skin (Skin_1).
const COLORS = [
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
const INK = '#14213d';
const SQRT3 = Math.sqrt(3);
const MAX_FRAME_MS = 250;
const SWIPE_PX = 40;
const FLASH_MS = 180;

interface Options {
  readonly mode: Mode;
  readonly rules: Rules;
  readonly seed: number;
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
  return { mode, rules, seed };
}

export function startPlaytest(root: HTMLElement): void {
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

  // Layout, recomputed on resize. R is the hex radius in CSS pixels.
  let R = 16;
  let originX = 0;
  let originY = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${String(width)}px`;
    canvas.style.height = `${String(height)}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Board is 17R wide and 20·√3·R tall; the sidebar takes 6R more.
    R = Math.min((width - 32) / 23, (height - 32) / (ROWS * SQRT3 + 1));
    originX = (width - 23 * R) / 2;
    originY = (height - ROWS * SQRT3 * R) / 2;
  }

  const rowH = () => SQRT3 * R;
  const centre = (h: Hex): [number, number] => [
    originX + R + h.x * 1.5 * R,
    originY + ROWS * rowH() - (h.y + 1) * (rowH() / 2),
  ];

  function hexPath(cx: number, cy: number, radius: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    }
    ctx.closePath();
  }

  function drawHex(at: [number, number], fill: string, alpha = 1) {
    hexPath(at[0], at[1], R * 0.92);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = Math.max(1.5, R * 0.12);
    ctx.strokeStyle = INK;
    ctx.stroke();
  }

  const colorOf = (id: number) => COLORS[id - 1] ?? '#ccc';

  function draw(now: number) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, '#75c2ed');
    bg.addColorStop(0.5, '#9ad7f8');
    bg.addColorStop(1, '#76c3ed');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Empty cells.
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    for (let x = 0; x < COLUMNS; x++) {
      for (let row = 0; row < (x % 2 === 0 ? ROWS : ROWS - 1); row++) {
        const [cx, cy] = centre(hex(x, 2 * row + (x & 1)));
        hexPath(cx, cy, R * 0.92);
        ctx.stroke();
      }
    }

    for (const cell of state.board.filled()) drawHex(centre(cell.hex), colorOf(cell.id), 0.85);
    if (flash && now < flash.until) {
      for (const h of flash.cells) drawHex(centre(h), '#ffffff');
    }
    if (state.piece) {
      for (const h of pieceCells(state.piece)) drawHex(centre(h), colorOf(state.piece.id));
    }
    drawSidebar();
    if (paused || state.status !== 'playing') drawBanner();
  }

  function drawSidebar() {
    const left = originX + 18 * R;
    let y = originY + R;
    const label = (text: string, value: string) => {
      ctx.fillStyle = INK;
      ctx.font = `600 ${String(Math.round(R * 0.8))}px system-ui, sans-serif`;
      ctx.fillText(text, left, y);
      y += R * 1.4;
      ctx.font = `800 ${String(Math.round(R * 1.3))}px system-ui, sans-serif`;
      ctx.fillText(value, left, y);
      y += R * 1.6;
    };
    label('SCORE', String(state.score));
    label('LINES', String(state.lines));
    label(
      mode.kind === 'levels' ? 'LEVEL' : 'SPEED',
      String(mode.kind === 'levels' ? mode.level : mode.speed),
    );

    ctx.fillStyle = INK;
    ctx.font = `600 ${String(Math.round(R * 0.8))}px system-ui, sans-serif`;
    ctx.fillText('NEXT', left, y);
    const next = pieceDef(state.next);
    const scale = 0.6;
    for (const offset of next.cells) {
      const cx = left + 2 * R + offset.x * 1.5 * R * scale;
      const cy = y + 4 * R - offset.y * (rowH() / 2) * scale;
      hexPath(cx, cy, R * 0.92 * scale);
      ctx.fillStyle = colorOf(next.id);
      ctx.fill();
      ctx.lineWidth = Math.max(1, R * 0.08);
      ctx.strokeStyle = INK;
      ctx.stroke();
    }
  }

  function drawBanner() {
    const text = paused
      ? 'Paused'
      : state.status === 'won'
        ? 'Level complete! Tap for next'
        : 'Game over. Tap to retry';
    const cx = originX + 8.5 * R;
    const cy = originY + (ROWS * rowH()) / 2;
    ctx.fillStyle = 'rgba(20,33,61,0.8)';
    ctx.fillRect(originX, cy - 1.6 * R, 17 * R, 3.2 * R);
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${String(Math.round(R * 0.9))}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy);
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

  // Keyboard.
  window.addEventListener('keydown', (e) => {
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
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, moved: false };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const step = 1.5 * R;
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
  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(frame);
}
