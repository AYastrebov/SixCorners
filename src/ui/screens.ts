import { SKINS, SKIN_IDS, type SkinId } from '../art/skins';
import { MAX_SPEED, type Mode } from '../core';
import { drawSkinPreview } from '../render/preview';
import { button, h } from './dom';
import type { Settings } from './settings';

/** What screens can ask the app to do. */
export interface Nav {
  readonly settings: () => Settings;
  readonly update: (change: Partial<Settings>) => void;
  readonly mainMenu: () => void;
  readonly levels: () => void;
  readonly skins: () => void;
  readonly about: () => void;
  readonly play: (mode: Mode) => void;
}

export interface Screen {
  readonly el: HTMLElement;
  /** Element to focus when the screen opens. */
  readonly focus?: HTMLElement;
  readonly dispose?: () => void;
}

const screen = (name: string, ...children: (Node | false)[]) =>
  h('section', { class: `screen screen-${name}` }, ...children);

function logo(skin: SkinId): HTMLElement {
  return skin === 'comic'
    ? h('img', {
        class: 'logo-art',
        src: `${import.meta.env.BASE_URL}art/splash.svg`,
        alt: '6 corners',
      })
    : h('h1', { class: 'logo' }, '6 corners');
}

export function mainMenu(nav: Nav): Screen {
  const play = button('New game', () => {
    nav.play({ kind: 'levels', level: 1 });
  });
  const el = screen(
    'main',
    logo(nav.settings().skin),
    h(
      'nav',
      { class: 'menu' },
      play,
      button('Levels', nav.levels),
      button('Skins', nav.skins),
      button('About', nav.about, { class: 'btn small' }),
    ),
  );
  return { el, focus: play };
}

export function levelsMenu(nav: Nav): Screen {
  const { best } = nav.settings();
  const levels = Array.from({ length: 10 }, (_, i) => {
    const level = i + 1;
    const score = best[`level-${String(level)}`];
    return button(
      `Level ${String(level)}`,
      () => {
        nav.play({ kind: 'levels', level });
      },
      { title: score === undefined ? undefined : `Best: ${String(score)}` },
    );
  });
  const first = levels[0];
  const el = screen(
    'levels',
    h('h2', { class: 'title' }, 'Levels'),
    h('nav', { class: 'menu grid' }, ...levels),
    h(
      'nav',
      { class: 'menu' },
      button('Endless', () => {
        el.append(speedPanel(nav));
      }),
      button('Go back', nav.mainMenu, { class: 'btn small' }),
    ),
  );
  return first ? { el, focus: first } : { el };
}

function speedPanel(nav: Nav): HTMLElement {
  let speed = nav.settings().speed;
  const value = h('output', { class: 'big-number' }, String(speed));
  const slider = h('input', {
    type: 'range',
    min: 1,
    max: MAX_SPEED,
    step: 1,
    value: speed,
    'aria-label': 'Speed',
  });
  slider.addEventListener('input', () => {
    speed = Number(slider.value);
    value.textContent = String(speed);
  });
  const overlay = h(
    'div',
    { class: 'overlay' },
    h(
      'div',
      { class: 'panel', role: 'dialog', 'aria-label': 'Endless mode speed' },
      h('h2', { class: 'panel-title' }, 'Speed'),
      value,
      slider,
      h(
        'nav',
        { class: 'menu' },
        button('Play', () => {
          nav.update({ speed });
          nav.play({ kind: 'endless', speed });
        }),
        button(
          'Close',
          () => {
            overlay.remove();
          },
          { class: 'btn small' },
        ),
      ),
    ),
  );
  queueMicrotask(() => {
    slider.focus();
  });
  return overlay;
}

export function skinsMenu(nav: Nav): Screen {
  let index = Math.max(0, SKIN_IDS.indexOf(nav.settings().skin));
  const canvas = h('canvas', { class: 'skin-preview', 'aria-hidden': 'true' });
  const name = h('h2', { class: 'title' });
  const current = () => SKIN_IDS[index] ?? 'comic';

  const show = () => {
    const skin = SKINS[current()];
    name.textContent = skin.name;
    nav.update({ skin: skin.id });
    void drawSkinPreview(canvas, skin, 220, 330);
  };
  const step = (delta: number) => {
    index = (index + delta + SKIN_IDS.length) % SKIN_IDS.length;
    show();
  };

  const select = button('Select', nav.mainMenu);
  const el = screen(
    'skins',
    name,
    h('div', { class: 'skin-frame' }, canvas),
    h(
      'nav',
      { class: 'menu row' },
      button(
        '◀',
        () => {
          step(-1);
        },
        { class: 'btn arrow', 'aria-label': 'Previous skin' },
      ),
      select,
      button(
        '▶',
        () => {
          step(1);
        },
        { class: 'btn arrow', 'aria-label': 'Next skin' },
      ),
    ),
  );
  show();
  return { el, focus: select };
}

export function aboutScreen(nav: Nav): Screen {
  const back = button('Go back', nav.mainMenu);
  const el = screen(
    'about',
    h(
      'div',
      { class: 'panel about' },
      h('h2', { class: 'panel-title' }, 'About'),
      h('p', {}, 'Game developed by Andrey Yastrebov and Konstantin Zubanov, 2011.'),
      h('p', {}, 'Rebuilt for the web in 2026.'),
      h('p', { class: 'fine' }, 'Fonts: Righteous, Tektur, Shadows Into Light Two (SIL OFL).'),
    ),
    h('nav', { class: 'menu' }, back),
  );
  return { el, focus: back };
}
