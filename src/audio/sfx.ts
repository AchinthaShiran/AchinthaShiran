/**
 * Tiny procedural WebAudio sound kit — no audio files to download. Muted by default (plan §14);
 * every call is a no-op while muted or when WebAudio is unavailable.
 */
import { useSettings } from '@/state/settings';

export type Sfx = 'open' | 'close' | 'select' | 'nearby' | 'collect' | 'travel' | 'step';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambient: { stop: () => void } | null = null;

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (useSettings.getState().muted) return null;
  try {
    if (!ctx) {
      const Ctor = globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return master ? { ctx, out: master } : null;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; gain?: number; delay?: number; slideTo?: number } = {}) {
  const a = audio();
  if (!a) return;
  const t0 = a.ctx.currentTime + (opts.delay ?? 0);
  const osc = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.12, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, freq: number, gain: number, sweepTo?: number) {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.ctx.sampleRate * dur);
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.ctx.createBufferSource();
  src.buffer = buf;
  const filter = a.ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, a.ctx.currentTime + dur);
  const g = a.ctx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(a.out);
  src.start();
}

export function playSfx(name: Sfx): void {
  switch (name) {
    case 'open':
      tone(660, 0.18, { gain: 0.1 });
      tone(990, 0.25, { gain: 0.08, delay: 0.07 });
      break;
    case 'close':
      tone(620, 0.15, { gain: 0.07, slideTo: 420 });
      break;
    case 'select':
      tone(880, 0.1, { type: 'triangle', gain: 0.07 });
      break;
    case 'nearby':
      tone(1320, 0.08, { gain: 0.025 });
      break;
    case 'collect':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', gain: 0.08, delay: i * 0.07 }));
      break;
    case 'travel':
      noise(0.6, 400, 0.25, 3000);
      break;
    case 'step':
      noise(0.05, 900, 0.05);
      break;
  }
}

/** Gentle wind bed + occasional bird chirps. */
export function startAmbient(): void {
  const a = audio();
  if (!a || ambient) return;
  const { ctx: c, out } = a;
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.02) * 0.998;
    d[i] = last * 6;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  const g = c.createGain();
  g.gain.value = 0.05;
  src.connect(filter).connect(g).connect(out);
  src.start();
  const chirp = window.setInterval(() => {
    if (Math.random() < 0.6) {
      const f = 2200 + Math.random() * 900;
      tone(f, 0.09, { gain: 0.02, slideTo: f * 1.3 });
      tone(f * 1.1, 0.08, { gain: 0.015, delay: 0.12, slideTo: f * 1.4 });
    }
  }, 5200);
  ambient = {
    stop: () => {
      window.clearInterval(chirp);
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

export function stopAmbient(): void {
  ambient?.stop();
  ambient = null;
}
