/** Canvas-generated textures for in-world text (signs, plaques). No font files or network needed. */
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

export interface LabelStyle {
  background: string;
  color: string;
  border?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  font?: string;
}

const cache = new Map<string, CanvasTexture>();

export function labelTexture(text: string, style: LabelStyle): CanvasTexture {
  const key = `${text}|${JSON.stringify(style)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const width = style.width ?? 512;
  const height = style.height ?? 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');

  ctx.fillStyle = style.background;
  roundRect(ctx, 4, 4, width - 8, height - 8, 22);
  ctx.fill();
  if (style.border) {
    ctx.lineWidth = 8;
    ctx.strokeStyle = style.border;
    ctx.stroke();
  }
  ctx.fillStyle = style.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = style.fontSize ?? 56;
  const family = style.font ?? '"Fredoka", "Nunito", system-ui, sans-serif';
  ctx.font = `700 ${size}px ${family}`;
  while (ctx.measureText(text).width > width - 48 && size > 18) {
    size -= 2;
    ctx.font = `700 ${size}px ${family}`;
  }
  ctx.fillText(text, width / 2, height / 2 + 2);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
