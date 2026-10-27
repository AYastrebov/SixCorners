import { SKINS, type SkinId } from '../art/skins';
import { loadFont } from '../render/tiles';

let current: SkinId = 'comic';

function paintBackground() {
  const svg = SKINS[current].background(window.innerWidth, window.innerHeight);
  document.body.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
}

/** Switches the page to a skin: fonts, CSS (via data-skin) and background. */
export async function applySkin(id: SkinId): Promise<void> {
  current = id;
  await loadFont(SKINS[id].font);
  document.documentElement.dataset.skin = id;
  paintBackground();
}

window.addEventListener('resize', paintBackground);
