import { SKIN_IDS, type SkinId } from '../art/skins';
import type { Mode } from '../core';

/** Per-viewer preferences and best scores, kept in localStorage. */
export interface Settings {
  readonly skin: SkinId;
  /** Last speed picked for endless mode, 1–10. */
  readonly speed: number;
  /** Best score per mode, keyed by `modeKey`. */
  readonly best: Readonly<Record<string, number>>;
}

const KEY = 'sixcorners.settings.v1';
const DEFAULTS: Settings = { skin: 'comic', speed: 1, best: {} };

export const modeKey = (mode: Mode): string =>
  mode.kind === 'levels' ? `level-${String(mode.level)}` : `endless-${String(mode.speed)}`;

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      skin: SKIN_IDS.find((id) => id === parsed.skin) ?? DEFAULTS.skin,
      speed:
        Number.isInteger(parsed.speed) && (parsed.speed ?? 0) >= 1 && (parsed.speed ?? 0) <= 10
          ? (parsed.speed ?? 1)
          : DEFAULTS.speed,
      best: typeof parsed.best === 'object' ? parsed.best : {},
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Private mode or storage disabled: settings last for this visit only.
  }
}
