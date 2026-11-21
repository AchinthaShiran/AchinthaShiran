// Generates hero.svg (README banner): a 16-bit style platformer loop. Run: node assets-readme/generate-hero.mjs
import { writeFileSync } from 'node:fs';

const VW = 320;
const VH = 112;
const GROUND = 88;
const L = 14; // loop seconds
const SPEED = 40; // world px / s
const HERO_X = 70;

/* ------------------------------------------------------------------ pixel grid */
class Grid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.c = Array.from({ length: h }, () => Array(w).fill(null));
  }
  px(x, y, c) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.c[y][x] = c;
  }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
  }
  outline(color = '#1a1020') {
    const src = this.c.map((r) => r.slice());
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        if (src[y][x]) continue;
        const n = [src[y - 1]?.[x], src[y + 1]?.[x], src[y]?.[x - 1], src[y]?.[x + 1]];
        if (n.some((v) => v && v !== color)) this.c[y][x] = color;
      }
    return this;
  }
  paths() {
    const byColor = new Map();
    for (let y = 0; y < this.h; y++) {
      let x = 0;
      while (x < this.w) {
        const col = this.c[y][x];
        if (!col) {
          x++;
          continue;
        }
        let e = x;
        while (e < this.w && this.c[y][e] === col) e++;
        if (!byColor.has(col)) byColor.set(col, []);
        byColor.get(col).push(`M${x} ${y}h${e - x}v1h-${e - x}z`);
        x = e;
      }
    }
    return [...byColor].map(([c, d]) => `<path fill="${c}" d="${d.join('')}"/>`).join('');
  }
}

/* ------------------------------------------------------------------ 3x5 pixel font */
const FONT = {
  0: '111101101101111',
  1: '010110010010111',
  2: '111001111100111',
  3: '111001111001111',
  4: '101101111001001',
  5: '111100111001111',
  6: '111100111101111',
  7: '111001001001001',
  8: '111101111101111',
  9: '111101111001111',
  S: '111100111001111',
  C: '111100100100111',
  O: '111101101101111',
  R: '110101110101101',
  E: '111100110100111',
  B: '110101110101110',
  U: '101101101101111',
  G: '111100101101111',
  F: '111100110100100',
  I: '111010010010111',
  X: '101101010101101',
  D: '110101101101110',
  P: '111101111100100',
  N: '111101101101101',
  M: '101111111101101',
  T: '111010010010010',
  ':': '000010000010000',
  '!': '010010010000010',
  '+': '000010111010000',
  x: '000101010101000',
  '<': '001010100010001',
  '/': '001001010100100',
  '>': '100010001010100',
  '{': '011010110010011',
  '}': '110010011010110',
  ' ': '000000000000000',
};
const textWidth = (s) => s.length * 4 - 1;
function glyphRects(s, x, y, color) {
  let d = '';
  [...s].forEach((ch, i) => {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph ${ch}`);
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++) if (g[r * 3 + c] === '1') d += `M${x + i * 4 + c} ${y + r}h1v1h-1z`;
  });
  return d;
}
const pixText = (s, x, y, color = '#fff', shadow = '#1a1020') =>
  `<path fill="${shadow}" d="${glyphRects(s, x + 1, y + 1)}"/><path fill="${color}" d="${glyphRects(s, x, y)}"/>`;

/* ------------------------------------------------------------------ timeline helpers */
const css = [];
const pct = (t) => `${((t / L) * 100).toFixed(3)}%`;
const initial = new Map();

/** Keyframes where each [t, decl] holds until the next one (steps). */
function stepKf(name, keys) {
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  if (ks[0][0] > 0) ks.unshift([0, ks[0][1]]);
  ks.push([L, ks[ks.length - 1][1]]);
  css.push(`@keyframes ${name}{${ks.map(([t, d]) => `${pct(t)}{${d}}`).join('')}}`);
}
/** Show an element only during the given [start,end] windows. */
function showWindows(cls, windows, extra = '') {
  const keys = [[0, 'opacity:0']];
  for (const [a, b] of windows) {
    keys.push([a, 'opacity:1']);
    keys.push([b, 'opacity:0']);
  }
  stepKf(cls, keys);
  const on0 = windows.some(([a]) => a === 0);
  css.push(`.${cls}{opacity:${on0 ? 1 : 0};animation:${cls} ${L}s steps(1,end) infinite;${extra}}`);
}
/** Hide an element during the given windows (visible otherwise). */
function hideWindows(cls, windows) {
  const keys = [[0, 'opacity:1']];
  for (const [a, b] of windows) {
    keys.push([a, 'opacity:0']);
    keys.push([b, 'opacity:1']);
  }
  stepKf(cls, keys);
  css.push(`.${cls}{animation:${cls} ${L}s steps(1,end) infinite}`);
}
/** Sprite-sheet style frame cycle: N frames over `dur` seconds. */
function cycleClasses(prefix, n, dur) {
  for (let i = 0; i < n; i++) {
    const keys = [[0, `opacity:${i === 0 ? 1 : 0}`]];
    if (i > 0) keys.push([(i / n) * dur, 'opacity:1']);
    if (i < n - 1) keys.push([((i + 1) / n) * dur, 'opacity:0']);
    const ks = keys.map(([t, d]) => `${((t / dur) * 100).toFixed(2)}%{${d}}`).join('');
    css.push(`@keyframes ${prefix}${i}{${ks}100%{opacity:${i === n - 1 ? 1 : 0}}}`);
    css.push(
      `.${prefix}${i}{opacity:${i === 0 ? 1 : 0};animation:${prefix}${i} ${dur}s steps(1,end) infinite}`,
    );
  }
}
/** Linear keyframes from [t, decl] points. */
function linKf(name, keys, cls, timing = 'linear') {
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  if (ks[0][0] > 0) ks.unshift([0, ks[0][1]]);
  if (ks[ks.length - 1][0] < L) ks.push([L, ks[ks.length - 1][1]]);
  css.push(`@keyframes ${name}{${ks.map(([t, d]) => `${pct(t)}{${d}}`).join('')}}`);
  css.push(`.${cls}{animation:${name} ${L}s ${timing} infinite}`);
}
const tr = (x, y, extra = '') => `transform:translate(${x}px,${y}px)${extra}`;
/** Sample a jump arc: x0,y0 -> x1,y1 over [t0,t1] with apex lift h. */
function arc(t0, t1, x0, y0, x1, y1, h, step = 0.1) {
  const out = [];
  const n = Math.max(2, Math.round((t1 - t0) / step));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    out.push([t0 + u * (t1 - t0), x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - 4 * h * u * (1 - u)]);
  }
  return out;
}

/* ------------------------------------------------------------------ palette */
const K = '#1a1020';
const WHITE = '#ffffff';
const SKIN = '#ffc99b';
const HAIR = '#4a2e1a';
const HOOD = '#ff7a2f';
const HOOD_D = '#c9501a';
const JEANS = '#3a4fb0';
const SHOE = '#7a3f1d';
const RED = '#e8392f';
const RED_D = '#a8201a';
const RED_L = '#ff8a7e';
const GOLD = '#ffd23f';
const GOLD_D = '#d98d12';
const GOLD_L = '#fff2a0';

/* ------------------------------------------------------------------ sprites */
const defs = [];
const def = (id, grid) => defs.push(`<g id="${id}">${grid.paths()}</g>`);

function hero({ legs, arms, bob = 0, mouth = 'smile', eyes = 'normal', sweat = false }) {
  const g = new Grid(20, 25);
  const o = 1; // outline margin
  const y = (v) => v + o + bob;
  const x = (v) => v + o;
  // back arm
  if (arms === 'up') g.rect(x(1), y(5), 3, 7, HOOD_D);
  else if (arms === 'fwd') g.rect(x(3), y(12), 3, 4, HOOD_D);
  else g.rect(x(2), y(12), 3, 4, HOOD_D);
  // legs (drawn without bob so feet touch the ground)
  for (const l of legs) {
    g.rect(l.x + o, l.y + o, 3, l.h, JEANS);
    g.rect(l.x + o - 1, l.y + o + l.h, 4, 2, SHOE);
  }
  // torso (hoodie)
  g.rect(x(5), y(12), 9, 6, HOOD);
  g.rect(x(4), y(10), 11, 2, HOOD_D);
  g.rect(x(8), y(15), 4, 2, HOOD_D);
  g.px(x(9), y(12), WHITE);
  g.px(x(11), y(12), WHITE);
  // head (oversized)
  g.rect(x(4), y(1), 10, 3, HAIR);
  g.rect(x(3), y(3), 3, 7, HAIR);
  g.rect(x(5), y(4), 9, 6, SKIN);
  g.px(x(14), y(6), SKIN);
  // eyes
  if (eyes === 'wide') {
    g.rect(x(7), y(4), 3, 4, WHITE);
    g.rect(x(11), y(4), 3, 4, WHITE);
    g.rect(x(8), y(5), 2, 2, K);
    g.rect(x(12), y(5), 2, 2, K);
  } else {
    g.rect(x(7), y(5), 2, 3, K);
    g.rect(x(11), y(5), 2, 3, K);
    g.px(x(7), y(5), WHITE);
    g.px(x(11), y(5), WHITE);
  }
  // mouth
  if (mouth === 'open') g.rect(x(9), y(8), 3, 2, '#8a1f1f');
  else if (mouth === 'wide') g.rect(x(8), y(8), 5, 2, '#8a1f1f');
  else g.rect(x(9), y(8), 3, 1, '#c0392b');
  if (sweat) {
    g.px(x(15), y(3), '#7fd8ff');
    g.px(x(15), y(4), '#7fd8ff');
  }
  // front arm
  if (arms === 'up') {
    g.rect(x(15), y(5), 3, 7, HOOD);
    g.rect(x(15), y(3), 3, 2, SKIN);
    g.rect(x(1), y(3), 3, 2, SKIN);
  } else if (arms === 'fwd') g.rect(x(12), y(12), 5, 3, HOOD);
  else g.rect(x(10), y(12), 3, 5, HOOD);
  if (arms !== 'up')
    g.rect(
      x(arms === 'fwd' ? 16 : 10),
      y(arms === 'fwd' ? 12 : 17),
      arms === 'fwd' ? 2 : 3,
      arms === 'fwd' ? 3 : 2,
      SKIN,
    );
  return g.outline(K);
}
const L0 = { y: 18, h: 3 };
def(
  'h0',
  hero({
    arms: 'fwd',
    legs: [
      { x: 4, ...L0, h: 4 },
      { x: 11, y: 18, h: 2 },
    ],
  }),
);
def(
  'h1',
  hero({
    arms: 'down',
    bob: -1,
    legs: [
      { x: 7, y: 18, h: 4 },
      { x: 10, y: 18, h: 3 },
    ],
  }),
);
def(
  'h2',
  hero({
    arms: 'fwd',
    legs: [
      { x: 11, y: 18, h: 4 },
      { x: 4, y: 18, h: 2 },
    ],
  }),
);
def(
  'h3',
  hero({
    arms: 'down',
    bob: -1,
    legs: [
      { x: 9, y: 18, h: 4 },
      { x: 6, y: 18, h: 3 },
    ],
  }),
);
def(
  'hjump',
  hero({
    arms: 'up',
    mouth: 'open',
    eyes: 'wide',
    legs: [
      { x: 3, y: 18, h: 2 },
      { x: 13, y: 18, h: 3 },
    ],
  }),
);
def(
  'hfall',
  hero({
    arms: 'up',
    mouth: 'wide',
    eyes: 'wide',
    sweat: true,
    legs: [
      { x: 5, y: 18, h: 2 },
      { x: 12, y: 18, h: 2 },
    ],
  }),
);

function bug(frame) {
  const g = new Grid(16, 12);
  for (let yy = 0; yy < 6; yy++) {
    const hw = [3, 5, 6, 7, 7, 7][yy];
    g.rect(8 - hw, 2 + yy, hw * 2, 1, yy < 2 ? RED_L : RED);
  }
  g.rect(2, 7, 12, 1, RED_D);
  g.rect(3, 4, 3, 3, WHITE); // eyes (facing left)
  g.rect(7, 4, 3, 3, WHITE);
  g.px(3, 5, K);
  g.px(3, 6, K);
  g.px(7, 5, K);
  g.px(7, 6, K);
  g.px(10, 3, RED_D);
  g.px(11, 5, RED_D);
  g.px(9, 6, RED_D);
  // antennae
  g.px(4, 1, K);
  g.px(3, 0, K);
  g.px(9, 1, K);
  g.px(10, 0, K);
  // legs
  const lx = frame === 0 ? [2, 5, 8, 11] : [3, 6, 9, 12];
  lx.forEach((l) => g.rect(l, 8, 1, 2, RED_D));
  return g.outline(K);
}
def('bug0', bug(0));
def('bug1', bug(1));

function boss(frame, white = false) {
  const g = new Grid(54, 42);
  const c = (v) => (white ? WHITE : v);
  const cx = 27;
  const bottom = 33;
  const ry = 25;
  const rx = 24;
  for (let yy = bottom - ry; yy <= bottom; yy++) {
    const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - ((yy - bottom) / ry) ** 2)));
    g.rect(cx - hw, yy + 4, hw * 2, 1, yy < bottom - ry + 5 ? c(RED_L) : c(RED));
  }
  g.rect(cx - rx + 1, bottom + 4, rx * 2 - 2, 2, c(RED_D));
  // spots
  [
    [10, 24],
    [40, 22],
    [18, 12],
    [36, 14],
  ].forEach(([sx, sy]) => g.rect(sx, sy, 3, 3, c(RED_D)));
  // angry eyes
  g.rect(12, 16, 9, 7, WHITE);
  g.rect(33, 16, 9, 7, WHITE);
  g.rect(16, 18, 4, 5, K);
  g.rect(33, 18, 4, 5, K);
  for (let i = 0; i < 9; i++) g.px(12 + i, 14 + Math.floor(i / 3), K); // brows slope down toward middle
  for (let i = 0; i < 9; i++) g.px(41 - i, 14 + Math.floor(i / 3), K);
  // teeth
  for (let i = 0; i < 10; i++) g.rect(11 + i * 3, 31, 2, 2, WHITE);
  // label
  g.rect(5, 24, 44, 7, K);
  const label = 'PRODUCTION';
  [...label].forEach((ch, i) => {
    const gl = FONT[ch];
    for (let r = 0; r < 5; r++)
      for (let cc = 0; cc < 3; cc++) if (gl[r * 3 + cc] === '1') g.px(7 + i * 4 + cc, 25 + r, '#ffe14a');
  });
  // antennae
  g.rect(12, 0, 3, 5, c(RED_D));
  g.rect(39, 0, 3, 5, c(RED_D));
  g.rect(11, 0, 2, 2, c(RED_L));
  g.rect(41, 0, 2, 2, c(RED_L));
  // legs
  const lx = frame === 0 ? [6, 17, 31, 42] : [9, 20, 28, 39];
  lx.forEach((l) => g.rect(l, bottom + 7, 4, 3, c(RED_D)));
  return g.outline(K);
}
def('boss0', boss(0));
def('boss1', boss(1));
def('bossW0', boss(0, true));
def('bossW1', boss(1, true));

function coin(rx, sym) {
  const g = new Grid(15, 15);
  const cx = 7;
  const cy = 7;
  for (let yy = 0; yy < 15; yy++)
    for (let xx = 0; xx < 15; xx++) {
      const dx = (xx - cx) / Math.max(rx, 0.5);
      const dy = (yy - cy) / 6.4;
      const d = dx * dx + dy * dy;
      if (d <= 1.02) g.px(xx, yy, d > 0.62 ? GOLD_D : GOLD);
    }
  if (rx >= 6) {
    g.px(cx - 4, cy - 3, GOLD_L);
    g.px(cx - 3, cy - 4, GOLD_L);
    const text = sym;
    const w = textWidth(text);
    const gx = cx - Math.floor(w / 2);
    [...text].forEach((ch, i) => {
      const gl = FONT[ch];
      for (let r = 0; r < 5; r++)
        for (let cc = 0; cc < 3; cc++)
          if (gl[r * 3 + cc] === '1') g.px(gx + i * 4 + cc, cy - 2 + r, '#8a4b06');
    });
  }
  return g.outline(K);
}
def('cA0', coin(6.4, '</>'));
def('cB0', coin(6.4, '{}'));
for (const n of ['A', 'B']) {
  def(`c${n}1`, coin(3.6));
  def(`c${n}2`, coin(1.2));
  def(`c${n}3`, coin(3.6));
}

function cup(steam) {
  const g = new Grid(14, 16);
  g.rect(2, 7, 8, 7, WHITE);
  g.rect(3, 7, 6, 2, '#6b3b1d');
  g.rect(10, 8, 2, 4, WHITE);
  g.rect(11, 9, 2, 2, K);
  g.rect(2, 13, 8, 1, '#c8c8d8');
  g.rect(4, 10, 4, 2, '#e9a23b'); // logo
  if (steam) {
    g.px(4, 4, '#ddeeff');
    g.px(5, 3, '#ddeeff');
    g.px(4, 2, '#ddeeff');
    g.px(7, 3, '#ddeeff');
    g.px(8, 2, '#ddeeff');
    g.px(7, 1, '#ddeeff');
  } else {
    g.px(5, 4, '#ddeeff');
    g.px(4, 3, '#ddeeff');
    g.px(5, 2, '#ddeeff');
    g.px(8, 3, '#ddeeff');
    g.px(7, 2, '#ddeeff');
    g.px(8, 1, '#ddeeff');
  }
  return g.outline(K);
}
def('cup0', cup(false));
def('cup1', cup(true));

function tree() {
  const g = new Grid(30, 40);
  g.rect(12, 26, 6, 13, '#8a5a2b');
  g.rect(12, 26, 2, 13, '#a8703a');
  const tiers = [
    [4, 14, 22],
    [7, 6, 18],
    [10, 0, 12],
  ];
  tiers.forEach(([x, y, w], i) => {
    g.rect(x, y + 6, w, 12 - i, '#2f9e44');
    g.rect(x + 2, y + 2, w - 4, 6, '#2f9e44');
    g.rect(x + 3, y + 7, 4, 3, '#57c26a');
  });
  g.rect(8, 22, 14, 4, '#2f9e44');
  g.rect(9, 22, 3, 2, '#57c26a');
  return g.outline(K);
}
function bush() {
  const g = new Grid(20, 12);
  g.rect(3, 5, 14, 6, '#2f9e44');
  g.rect(5, 2, 6, 5, '#2f9e44');
  g.rect(10, 3, 6, 4, '#2f9e44');
  g.rect(6, 3, 3, 2, '#57c26a');
  g.rect(12, 4, 3, 2, '#57c26a');
  return g.outline(K);
}
function rock() {
  const g = new Grid(16, 11);
  g.rect(2, 5, 12, 5, '#8c93a8');
  g.rect(4, 2, 8, 4, '#a7aec2');
  g.rect(5, 3, 3, 2, '#d3d8e6');
  g.rect(9, 7, 4, 2, '#6f768c');
  return g.outline(K);
}
function mushroom() {
  const g = new Grid(14, 13);
  g.rect(5, 6, 4, 6, '#f4e6c8');
  g.rect(2, 2, 10, 5, RED);
  g.rect(4, 0, 6, 3, RED);
  g.rect(3, 3, 2, 2, WHITE);
  g.rect(8, 2, 2, 2, WHITE);
  g.rect(6, 4, 1, 1, WHITE);
  return g.outline(K);
}
function sign(glyph) {
  const g = new Grid(20, 22);
  g.rect(9, 12, 3, 9, '#8a5a2b');
  g.rect(2, 2, 16, 11, '#d79a4a');
  g.rect(2, 2, 16, 1, '#f0bd72');
  g.rect(3, 4, 14, 1, '#b57a32');
  const gl = FONT[glyph];
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 3; c++) if (gl[r * 3 + c] === '1') g.rect(8 + c * 1, 5 + r, 1, 1, '#3a2410');
  g.px(3, 3, K);
  g.px(16, 3, K);
  g.px(3, 11, K);
  g.px(16, 11, K);
  return g.outline(K);
}
function plank(w) {
  const g = new Grid(w, 8);
  g.rect(0, 0, w, 5, '#d79a4a');
  g.rect(0, 0, w, 1, '#f0bd72');
  for (let x = 6; x < w; x += 8) g.rect(x, 1, 1, 4, '#b57a32');
  g.rect(0, 5, w, 2, '#8a5a2b');
  return g.outline(K);
}
function cloud(big) {
  const g = new Grid(big ? 40 : 28, big ? 16 : 12);
  const w = g.w;
  g.rect(4, g.h - 5, w - 8, 4, WHITE);
  g.rect(8, g.h - 8, w - 18, 4, WHITE);
  g.rect(Math.floor(w / 3), 1, Math.floor(w / 3), g.h - 6, WHITE);
  g.rect(4, g.h - 4, w - 8, 2, '#d6e6ff');
  return g.outline('#b9d0f5');
}
def('tree', tree());
def('bush', bush());
def('rock', rock());
def('mush', mushroom());
def('signGo', sign('>'));
def('signWarn', sign('!'));
def('plank', plank(36));
def('cloudA', cloud(true));
def('cloudB', cloud(false));

function heart(full) {
  const g = new Grid(9, 8);
  const rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  rows.forEach((r, yy) =>
    [...r].forEach((ch, xx) => ch === 'X' && g.px(xx + 1, yy + 1, full ? '#ff3b4f' : '#5a5668')),
  );
  if (full) g.px(2, 2, '#ffb3bb');
  return g.outline(K);
}
def('heartF', heart(true));
def('heartE', heart(false));
function smallCoin() {
  const g = new Grid(9, 9);
  for (let yy = 0; yy < 9; yy++)
    for (let xx = 0; xx < 9; xx++) {
      const d = ((xx - 4) / 3.4) ** 2 + ((yy - 4) / 3.4) ** 2;
      if (d <= 1.05) g.px(xx, yy, d > 0.6 ? GOLD_D : GOLD);
    }
  g.px(3, 3, GOLD_L);
  return g.outline(K);
}
def('coinHud', smallCoin());

/* ------------------------------------------------------------------ background layers */
const sky = `<rect width="${VW}" height="${VH}" fill="#4f8ff7"/><rect y="28" width="${VW}" height="22" fill="#5c9aff"/><rect y="50" width="${VW}" height="38" fill="#74adff"/><rect y="68" width="${VW}" height="20" fill="#8fc0ff"/>`;

function mountains(copies, period) {
  let s = '';
  for (let c = 0; c < copies; c++) {
    const ox = c * period;
    const peaks = [
      [36, 52],
      [104, 34],
    ];
    peaks.forEach(([px, h]) => {
      for (let step = 0; step * 2 < h; step++) {
        const w = step * 3 + 4;
        const yy = GROUND - h + step * 2;
        const snow = step < 5 && h > 40;
        s += `<rect x="${ox + px - w / 2}" y="${yy}" width="${w}" height="2" fill="${snow ? '#eaf2ff' : '#7a8fe0'}"/>`;
      }
    });
    s += `<rect x="${ox}" y="${GROUND - 14}" width="${period}" height="14" fill="#7a8fe0"/>`;
  }
  return s;
}
function hills(copies, period) {
  let s = '';
  for (let c = 0; c < copies; c++) {
    for (let col = 0; col < period / 4; col++) {
      const x = c * period + col * 4;
      const h =
        12 +
        Math.round(
          (Math.sin((col / (period / 4)) * Math.PI * 2) * 6 +
            Math.sin((col / (period / 4)) * Math.PI * 4) * 3) /
            2,
        ) *
          2;
      s += `<rect x="${x}" y="${GROUND - h}" width="4" height="${h}" fill="#3aa650"/><rect x="${x}" y="${GROUND - h}" width="4" height="2" fill="#5ed06f"/>`;
    }
  }
  return s;
}
function cloudsLayer(copies, period) {
  let s = '';
  for (let c = 0; c < copies; c++) {
    const ox = c * period;
    s += `<use href="#cloudA" x="${ox + 20}" y="10"/><use href="#cloudB" x="${ox + 105}" y="30"/>`;
  }
  return s;
}

/* ------------------------------------------------------------------ world (period 560) */
const PERIOD = SPEED * L; // 560
const PIT1 = [304, 332];
const PIT2 = [420, 476];

function groundSeg(x0, x1) {
  let s = `<rect x="${x0}" y="${GROUND}" width="${x1 - x0}" height="3" fill="#58cf5f"/><rect x="${x0}" y="${GROUND + 3}" width="${x1 - x0}" height="2" fill="#2e8f3c"/>`;
  s += `<rect x="${x0}" y="${GROUND + 5}" width="${x1 - x0}" height="${VH - GROUND - 5}" fill="#b5702f"/>`;
  for (let y = GROUND + 5; y < VH; y += 8) {
    s += `<rect x="${x0}" y="${y + 7}" width="${x1 - x0}" height="1" fill="#8a4f1d"/>`;
    const off = ((y - GROUND) / 8) % 2 ? 8 : 0;
    for (let x = Math.ceil((x0 - off) / 16) * 16 + off; x < x1; x += 16)
      s += `<rect x="${x}" y="${y}" width="1" height="7" fill="#8a4f1d"/>`;
  }
  for (let x = x0 + 3; x < x1; x += 11)
    s += `<rect x="${x}" y="${GROUND - 1}" width="1" height="1" fill="#2e8f3c"/>`;
  return s;
}
function pit(x0, x1) {
  let s = `<rect x="${x0}" y="${GROUND}" width="${x1 - x0}" height="${VH - GROUND}" fill="#0c0616"/>`;
  s += `<rect x="${x0}" y="${GROUND + 6}" width="${x1 - x0}" height="2" fill="#160c26"/><rect x="${x0}" y="${GROUND + 14}" width="${x1 - x0}" height="3" fill="#160c26"/>`;
  s += `<rect x="${x0}" y="${GROUND}" width="2" height="${VH - GROUND}" fill="#6b3d1a"/><rect x="${x1 - 2}" y="${GROUND}" width="2" height="${VH - GROUND}" fill="#6b3d1a"/>`;
  return s;
}
const gy = (h) => GROUND - h;
const use = (id, x, y, extra = '') => `<use href="#${id}" x="${x}" y="${y}"${extra}/>`;

const scenery = [
  ['signGo', 28, gy(21)],
  ['tree', 8, gy(39)],
  ['bush', 58, gy(11)],
  ['mush', 84, gy(12)],
  ['rock', 108, gy(10)],
  ['tree', 132, gy(39)],
  ['bush', 224, gy(11)],
  ['plank', 236, gy(52)],
  ['tree', 252, gy(39)],
  ['mush', 270, gy(12)],
  ['rock', 288, gy(10)],
  ['tree', 342, gy(39)],
  ['signWarn', 376, gy(21)],
  ['rock', 486, gy(10)],
  ['plank', 480, gy(44)],
  ['bush', 504, gy(11)],
];

// timeline of the hero's world x = HERO_X + SPEED * t
const T = {
  coin: [2.5, 2.8, 3.1],
  bug1: 3.2,
  coffee: 6.2,
  bug2: 8.15,
};
const bug1X = HERO_X + SPEED * T.bug1; // 198
const bug2X = HERO_X + SPEED * T.bug2; // 396
const coinX = T.coin.map((t) => HERO_X + SPEED * t);
const coinY = [gy(21), gy(36), gy(21)];

function explosionAt(cls, cx, cy, t0, n, spread) {
  const cols = [GOLD, '#ff9a2f', WHITE, RED, '#ffe14a'];
  let out = '';
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const vx = Math.cos(ang) * spread;
    const vy = Math.sin(ang) * spread * 0.9;
    const name = `${cls}${i}`;
    const keys = [[0, 'opacity:0']];
    for (let s = 0; s <= 4; s++)
      keys.push([
        t0 + s * 0.1,
        `opacity:1;transform:translate(${(vx * s).toFixed(1)}px,${(vy * s + s * s * 1.2).toFixed(1)}px)`,
      ]);
    keys.push([t0 + 0.5, 'opacity:0']);
    stepKf(name, keys);
    css.push(`.${name}{opacity:0;animation:${name} ${L}s steps(1,end) infinite}`);
    out += `<g class="${name}"><rect x="${cx - 1}" y="${cy - 1}" width="${i % 2 ? 3 : 2}" height="${i % 2 ? 3 : 2}" fill="${cols[i % cols.length]}"/></g>`;
  }
  return out;
}

function worldContent(dup) {
  let s = '';
  // ground + pits
  s += groundSeg(0, PIT1[0]);
  s += pit(PIT1[0], PIT1[1]);
  if (!dup) {
    s += groundSeg(PIT1[1], PIT2[0]);
    s += pit(PIT2[0], PIT2[1]);
    s += groundSeg(PIT2[1], PERIOD);
  } else s += groundSeg(PIT1[1], 340);
  // scenery
  for (const [id, x, y] of scenery) if (!dup || x < 340) s += use(id, x, y);
  // coins
  coinX.forEach((cx, i) => {
    const sym = i === 1 ? 'B' : 'A';
    const delay = `style="animation-delay:-${(i * 0.2).toFixed(1)}s"`;
    const frames = [0, 1, 2, 3]
      .map((f) => `<g class="cf${f}" ${delay}>${use(`c${sym}${f}`, cx - 7, coinY[i] - 7)}</g>`)
      .join('');
    s += dup ? `<g>${frames}</g>` : `<g class="coin${i}">${frames}</g>`;
  });
  // coffee power-up
  const cupG = `<g class="cupb">${use('cup0', 318 - 7, gy(48) - 8)}${use('cup1', 318 - 7, gy(48) - 8, ' class="cupsteam"')}</g>`;
  s += dup ? cupG : `<g class="cupgone">${cupG}</g>`;
  // bugs
  const bugG = (x, cls) =>
    `<g class="${cls}"><g class="bugbob"><g class="bf0">${use('bug0', x - 8, gy(10))}</g><g class="bf1">${use('bug1', x - 8, gy(10))}</g></g></g>`;
  s += dup ? bugG(bug1X, 'bugstatic') : bugG(bug1X, 'bug1gone');
  if (!dup) s += bugG(bug2X, 'bug2gone');
  if (!dup) {
    s += explosionAt('e1_', bug1X, GROUND - 8, T.bug1, 8, 4);
    s += explosionAt('e2_', bug2X, GROUND - 8, T.bug2, 8, 4);
  }
  return s;
}

/* ------------------------------------------------------------------ hero timeline */
const JUMPS = [
  [2.4, 3.2],
  [5.75, 6.65],
  [7.35, 8.15],
  [8.5, 8.95],
];
const BOSS_ARCS = [
  [12.0, 12.6, 0, 0, 42, -30, 44],
  [12.6, 13.0, 42, -30, 42, -30, 28],
  [13.0, 13.4, 42, -30, 42, -30, 26],
  [13.4, 14.0, 42, -30, 0, 0, 22],
];
const hpts = [[0, 0, 0, 0]];
const jumpHeights = [30, 26, 30, 14];
JUMPS.forEach(([a, b], i) =>
  arc(a, b, 0, 0, 0, 0, jumpHeights[i]).forEach(([t, x, y]) => hpts.push([t, x, y, 0])),
);
// fall into pit 2
[
  [8.95, 0, 0, 0],
  [9.05, 0, -12, 90],
  [9.2, 0, 2, 220],
  [9.4, 0, 28, 420],
  [9.6, 0, 62, 720],
  [9.62, 0, -110, 0],
  [10.4, 0, -110, 0],
  [10.9, 0, 0, 0],
].forEach((p) => hpts.push(p));
BOSS_ARCS.forEach(([a, b, x0, y0, x1, y1, h]) =>
  arc(a, b, x0, y0, x1, y1, h).forEach(([t, x, y]) => hpts.push([t, x, y, 0])),
);
hpts.sort((p, q) => p[0] - q[0]);
// de-duplicate identical timestamps (keep last)
const uniq = [];
for (const p of hpts) {
  if (uniq.length && Math.abs(uniq[uniq.length - 1][0] - p[0]) < 1e-6) uniq[uniq.length - 1] = p;
  else uniq.push(p);
}
linKf(
  'hmove',
  uniq.map(([t, x, y, r]) => [t, `transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r}deg)`]),
  'hmove',
);
css.push('.hmove{transform-box:fill-box;transform-origin:center}');

const RUN_OFF = [
  [2.4, 3.2],
  [5.75, 6.65],
  [7.35, 8.15],
  [8.5, 10.9],
  [12.0, 14.0],
];
hideWindows('hrun', RUN_OFF);
showWindows('hjump', [
  [2.4, 3.2],
  [5.75, 6.65],
  [7.35, 8.15],
  [8.5, 8.95],
  [10.4, 10.5],
  [10.6, 10.7],
  [10.8, 10.9],
  [12.0, 14.0],
]);
showWindows('hfall', [[8.95, 9.6]]);

cycleClasses('rf', 4, 0.4);
cycleClasses('cf', 4, 0.8);
cycleClasses('bf', 2, 0.3);
cycleClasses('bossf', 2, 0.5);
css.push(
  '.cupsteam{animation:steam 0.8s steps(1,end) infinite}@keyframes steam{0%{opacity:0}50%{opacity:1}100%{opacity:1}}',
);
css.push(
  '.bugbob{animation:bob 0.3s steps(1,end) infinite}@keyframes bob{0%{transform:translateY(0)}50%{transform:translateY(-1px)}100%{transform:translateY(-1px)}}',
);
css.push('.bugstatic .bugbob{animation:bob 0.3s steps(1,end) infinite}');
css.push(
  '.cupb{animation:cupbob 1s steps(1,end) infinite}@keyframes cupbob{0%{transform:translateY(0)}50%{transform:translateY(-2px)}100%{transform:translateY(-2px)}}',
);

hideWindows('coin0', [[T.coin[0], L]]);
hideWindows('coin1', [[T.coin[1], L]]);
hideWindows('coin2', [[T.coin[2], L]]);
hideWindows('cupgone', [[T.coffee, L]]);
hideWindows('bug1gone', [[T.bug1, L]]);
hideWindows('bug2gone', [[T.bug2, L]]);

// scrolling layers
css.push(
  `.world{animation:wscroll ${L}s linear infinite}@keyframes wscroll{to{transform:translateX(-${PERIOD}px)}}`,
);
css.push(
  `.hills{animation:hscroll ${L}s linear infinite}@keyframes hscroll{to{transform:translateX(-280px)}}`,
);
css.push(
  `.mnts{animation:mscroll ${L}s linear infinite}@keyframes mscroll{to{transform:translateX(-140px)}}`,
);
css.push(
  `.clouds{animation:cscroll ${L}s linear infinite}@keyframes cscroll{to{transform:translateX(-168px)}}`,
);

// boss
const BOSS_X = 112;
linKf(
  'bossmove',
  [
    [0, tr(360, 0)],
    [9.8, tr(360, 0)],
    [12.0, tr(BOSS_X, 0)],
    [L, tr(BOSS_X, 0)],
  ],
  'bossmove',
);
showWindows('bossvis', [[9.8, 13.4]]);
showWindows('bossflash', [
  [12.6, 12.75],
  [13.0, 13.15],
]);
// explosion for the boss (screen space)
const bossExplosion = explosionAt('eb_', BOSS_X, GROUND - 18, 13.4, 22, 8);

/* floating messages */
function floatMsg(cls, text, x, y, windows) {
  const [a, b] = windows;
  stepKf(`${cls}o`, [
    [0, 'opacity:0'],
    [a, 'opacity:1'],
    [b, 'opacity:0'],
  ]);
  linKf(
    `${cls}t`,
    [
      [0, tr(0, 0)],
      [a, tr(0, 0)],
      [b, tr(0, -10)],
      [L, tr(0, -10)],
    ],
    `${cls}t`,
  );
  css.push(`.${cls}o{opacity:0;animation:${cls}o ${L}s steps(1,end) infinite}`);
  return `<g class="${cls}o"><g class="${cls}t">${pixText(text, x, y, '#ffe14a')}</g></g>`;
}
const msgs =
  floatMsg('m1', 'BUG FIXED!', HERO_X - 20, 52, [T.bug1, 4.2]) +
  floatMsg('m2', 'NICE COMMIT!', HERO_X - 24, 52, [6.3, 7.4]) +
  floatMsg('m3', '+100 XP', HERO_X - 13, 52, [T.bug2, 9.0]) +
  floatMsg('m4', 'BUG FIXED!', BOSS_X - 20, 36, [13.4, 14.0]);

/* HUD */
function hudValues(prefix, values, x, y, color) {
  let out = '';
  values.forEach(([t0, t1, text], i) => {
    const cls = `${prefix}${i}`;
    stepKf(cls, [
      [0, `opacity:${t0 === 0 ? 1 : 0}`],
      [t0, 'opacity:1'],
      [t1, 'opacity:0'],
    ]);
    css.push(`.${cls}{opacity:${t0 === 0 ? 1 : 0};animation:${cls} ${L}s steps(1,end) infinite}`);
    out += `<g class="${cls}">${pixText(text, x, y, color)}</g>`;
  });
  return out;
}
const hud =
  pixText('SCORE:', 6, 5, '#ffe14a') +
  hudValues(
    'sc',
    [
      [0, 3.2, '000420'],
      [3.2, 8.15, '000520'],
      [8.15, 13.4, '000620'],
      [13.4, L, '001620'],
    ],
    30,
    5,
    '#fff',
  ) +
  `<g>${[0, 1].map((i) => use('heartF', 5 + i * 10, 12)).join('')}</g>` +
  `<g class="h3full">${use('heartF', 25, 12)}</g><g class="hlost">${use('heartE', 25, 12)}</g>` +
  use('coinHud', 38, 12) +
  pixText('x', 49, 15, '#fff') +
  hudValues(
    'cn',
    [
      [0, 2.5, '02'],
      [2.5, 2.8, '03'],
      [2.8, 3.1, '04'],
      [3.1, L, '05'],
    ],
    54,
    15,
    '#fff',
  );
css.push(
  '.hlost{animation:lose 14s steps(1,end) infinite;opacity:0}@keyframes lose{0%{opacity:0}' +
    pct(9.0) +
    '{opacity:1}100%{opacity:1}}',
);
css.push(
  '.h3full{animation:h3 14s steps(1,end) infinite}@keyframes h3{0%{opacity:1}' +
    pct(9.0) +
    '{opacity:0}100%{opacity:0}}',
);

/* ------------------------------------------------------------------ assemble */
const runFrames = [0, 1, 2, 3].map((i) => `<g class="rf${i}">${use(`h${i}`, -10, -24)}</g>`).join('');
const bossFrames =
  [0, 1].map((i) => `<g class="bossf${i}">${use(`boss${i}`, -27, -42)}</g>`).join('') +
  `<g class="bossflash"><g class="bossf0">${use('bossW0', -27, -42)}</g><g class="bossf1">${use('bossW1', -27, -42)}</g></g>`;

const worldA = worldContent(false);
const worldB = worldContent(true);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW * 3}" height="${VH * 3}" shape-rendering="crispEdges" role="img" aria-label="A pixel-art platformer: a tiny developer runs, jumps over bugs, collects coins and defeats a boss bug labelled PRODUCTION">
<style>
${css.join('\n')}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
<defs>${defs.join('')}<clipPath id="view"><rect width="${VW}" height="${VH}"/></clipPath></defs>
<g clip-path="url(#view)">
${sky}
<g class="clouds">${cloudsLayer(3, 168)}</g>
<g class="mnts">${mountains(4, 140)}</g>
<g class="hills">${hills(5, 140)}</g>
<g class="world"><g>${worldA}</g><g transform="translate(${PERIOD} 0)">${worldB}</g></g>
<g class="bossvis"><g transform="translate(0 ${GROUND})"><g class="bossmove">${bossFrames}</g></g></g>
<g transform="translate(${HERO_X} ${GROUND})"><g class="hmove">
<g class="hrun">${runFrames}</g>
<g class="hjump">${use('hjump', -10, -24)}</g>
<g class="hfall">${use('hfall', -10, -24)}</g>
</g></g>
${bossExplosion}
${msgs}
${hud}
</g>
</svg>
`;
writeFileSync(new URL('./hero.svg', import.meta.url), svg);
console.log('bytes', svg.length);
