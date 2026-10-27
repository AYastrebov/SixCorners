/**
 * Seeded PRNG (mulberry32). The state is a plain number so it can live in
 * GameState and make every game replayable from its seed.
 */
export function nextRandom(state: number): [value: number, nextState: number] {
  const next = (state + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

/** Uniform integer in [0, n). */
export function nextInt(state: number, n: number): [value: number, nextState: number] {
  const [value, next] = nextRandom(state);
  return [Math.floor(value * n), next];
}
