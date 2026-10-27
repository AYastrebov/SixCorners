import type { Mode } from './core';
import { gameScreen } from './ui/game';
import { type Nav, type Screen, aboutScreen, levelsMenu, mainMenu, skinsMenu } from './ui/screens';
import { type Settings, loadSettings, saveSettings } from './ui/settings';
import { applySkin } from './ui/theme';

/** Owns the current screen and the saved settings. */
export async function startApp(root: HTMLElement): Promise<void> {
  let settings = loadSettings();
  let current: Screen | null = null;

  function show(next: Screen) {
    current?.dispose?.();
    current = next;
    root.replaceChildren(next.el);
    next.focus?.focus();
  }

  const nav: Nav = {
    settings: () => settings,
    update: (change: Partial<Settings>) => {
      const skinChanged = change.skin !== undefined && change.skin !== settings.skin;
      settings = { ...settings, ...change };
      saveSettings(settings);
      if (skinChanged) void applySkin(settings.skin);
    },
    mainMenu: () => {
      show(mainMenu(nav));
    },
    levels: () => {
      show(levelsMenu(nav));
    },
    skins: () => {
      show(skinsMenu(nav));
    },
    about: () => {
      show(aboutScreen(nav));
    },
    play: (mode: Mode) => {
      void gameScreen(nav, mode).then(show);
    },
  };

  await applySkin(settings.skin);
  nav.mainMenu();
}
