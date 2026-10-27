type Child = Node | string | false | null | undefined;

/** Creates an element with attributes and children. `class` and `data-*` work as attributes. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | undefined> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    el.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children) {
    if (child !== false && child !== null && child !== undefined) el.append(child);
  }
  return el;
}

export function button(
  label: string,
  onClick: () => void,
  attrs: Record<string, string | number | boolean | undefined> = {},
): HTMLButtonElement {
  const el = h('button', { type: 'button', class: 'btn', ...attrs }, label);
  el.addEventListener('click', onClick);
  return el;
}
