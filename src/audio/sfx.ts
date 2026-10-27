/**
 * Sound effects, synthesised with Web Audio as short 8-bit style blips so
 * there are no sample files to license.
 */
let ctx: AudioContext | null = null;
let volume = 0.8;

export function setSfxVolume(value: number): void {
  volume = value;
}

function context(): AudioContext | null {
  if (volume === 0) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Tone {
  readonly freq: number;
  readonly to?: number;
  readonly ms: number;
  readonly type?: OscillatorType;
  readonly at?: number;
  readonly gain?: number;
}

function play(...tones: Tone[]) {
  const ac = context();
  if (!ac) return;
  const now = ac.currentTime;
  for (const { freq, to, ms, type = 'square', at = 0, gain = 0.12 } of tones) {
    const start = now + at / 1000;
    const end = start + ms / 1000;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, end);
    amp.gain.setValueAtTime(gain * volume, start);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(amp).connect(ac.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

const NOTES = [523.25, 659.25, 783.99, 1046.5, 1318.5];

export const sfx = {
  move: () => {
    play({ freq: 330, ms: 35, gain: 0.06 });
  },
  rotate: () => {
    play({ freq: 520, to: 780, ms: 60, gain: 0.07 });
  },
  softDrop: () => {
    play({ freq: 260, to: 180, ms: 60, gain: 0.05 });
  },
  lock: () => {
    play({ freq: 140, to: 90, ms: 90, type: 'triangle', gain: 0.25 });
  },
  lines: (count: number) => {
    const notes = NOTES.slice(0, Math.min(NOTES.length, count + 2));
    play(...notes.map((freq, i) => ({ freq, ms: 90, at: i * 60, gain: 0.09 })));
  },
  won: () => {
    play(...[...NOTES, 1568].map((freq, i) => ({ freq, ms: 160, at: i * 110, gain: 0.1 })));
  },
  lost: () => {
    play(
      { freq: 440, to: 220, ms: 300, type: 'sawtooth', gain: 0.08 },
      { freq: 220, to: 70, ms: 600, type: 'sawtooth', at: 300, gain: 0.08 },
    );
  },
};
