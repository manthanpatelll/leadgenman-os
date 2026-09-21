/**
 * Canvas 2D drawing helper shared by the carousel pages.
 */
export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl: number; tr: number; br: number; bl: number }
): void {
  // Clamp radii so they never exceed half the shorter side (otherwise quadratic curves
  // extend far outside the rect -- showed up as giant cone artifacts when pill radius 999
  // was passed on a 44px-tall pill).
  const max = Math.max(0, Math.min(width, height) / 2);
  const clamp = (v: number) => Math.max(0, Math.min(v, max));
  const r =
    typeof radius === "number"
      ? { tl: clamp(radius), tr: clamp(radius), br: clamp(radius), bl: clamp(radius) }
      : { tl: clamp(radius.tl), tr: clamp(radius.tr), br: clamp(radius.br), bl: clamp(radius.bl) };

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
}
