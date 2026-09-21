/**
 * Vector macOS Finder folder, drawn on Canvas 2D.
 *
 * Crisp at any scale (no source PNG). Recolorable via a single base hex.
 * Matches the modern macOS (Big Sur+) folder: rounded rear panel with a raised
 * tab, a rounded front pocket, a subtle top-edge highlight, a soft inner seam,
 * and a lift-off drop shadow. Colors are derived from the base with luminance
 * shifts so any hue looks like a real macOS folder.
 *
 * Coordinate model: you pass a target box {x,y,w} and the folder is drawn with
 * a fixed 4:3.2 aspect inside it. All internal metrics scale with w.
 */

export interface FolderColors {
  /** front pocket fill (the dominant folder color) */
  base: string;
  /** rear panel / tab (slightly darker) */
  rear: string;
  /** top highlight edge (slightly lighter) */
  highlight: string;
  /** inner seam shadow line */
  seam: string;
}

/** Parse #rrggbb -> [r,g,b]. */
function hex2rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgb2hex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Shift a color's lightness by factor k (>1 lighter, <1 darker). */
function shade(hex: string, k: number): string {
  const [r, g, b] = hex2rgb(hex);
  return rgb2hex(r * k, g * k, b * k);
}

/** Derive the 4-tone folder palette from a single base color. */
export function folderColors(base: string): FolderColors {
  return {
    base,
    rear: shade(base, 0.86),
    highlight: shade(base, 1.1),
    seam: shade(base, 0.78),
  };
}

/** Rounded-rect path helper. */
function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | { tl: number; tr: number; br: number; bl: number },
) {
  const rad = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r;
  ctx.beginPath();
  ctx.moveTo(x + rad.tl, y);
  ctx.lineTo(x + w - rad.tr, y);
  ctx.arcTo(x + w, y, x + w, y + rad.tr, rad.tr);
  ctx.lineTo(x + w, y + h - rad.br);
  ctx.arcTo(x + w, y + h, x + w - rad.br, y + h, rad.br);
  ctx.lineTo(x + rad.bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - rad.bl, rad.bl);
  ctx.lineTo(x, y + rad.tl);
  ctx.arcTo(x, y, x + rad.tl, y, rad.tl);
  ctx.closePath();
}

/**
 * Draw a folder. Origin (x,y) is the TOP-LEFT of the folder body box.
 * `w` is the folder width; height is derived (0.80 * w -> classic macOS ratio).
 * `shadow` toggles the lift-off drop shadow (default true).
 */
export function drawFolder(
  ctx: CanvasRenderingContext2D,
  base: string,
  x: number,
  y: number,
  w: number,
  shadow = true,
) {
  const col = folderColors(base);
  const h = w * 0.8;

  // Geometry (fractions of w). Authentic macOS Big Sur+ folder:
  //  - rear panel is a rounded rect whose TOP edge has a raised tab on the left
  //  - tab top is flat, joins the back-panel top via a short diagonal on its right
  //  - front pocket is a plain rounded rect, its top ~1 tab-height below the tab top
  const bodyRadius = w * 0.06;
  const tabCornerR = w * 0.03; // rounded tab corners
  const tabRise = h * 0.12; // tab height above the rear-panel top edge
  const rearTop = y + tabRise; // FLAT top edge of the rear panel (below the tab)
  const tabTop = y; // top of the raised tab
  const tabLeft = x + w * 0.05;
  const tabRight = x + w * 0.36; // tab spans ~left third
  const tabSlope = w * 0.05; // horizontal run of the short diagonal after the tab
  const frontTop = rearTop + tabRise * 0.72; // front pocket starts a bit below rear top
  const frontH = y + h - frontTop;

  ctx.save();

  // ---- lift-off drop shadow (soft, cast by the whole folder body) ----
  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(40,30,25,0.22)';
    ctx.shadowBlur = w * 0.05;
    ctx.shadowOffsetY = w * 0.03;
    ctx.fillStyle = col.rear;
    rr(ctx, x, rearTop, w, y + h - rearTop, bodyRadius);
    ctx.fill();
    ctx.restore();
  }

  // ---- rear panel + raised tab (one shape, behind the front pocket) ----
  // The panel top is FLAT (horizontal). The tab rises on the left, has a flat top
  // with rounded corners, then a SHORT diagonal drops back to the flat panel top.
  ctx.fillStyle = col.rear;
  ctx.beginPath();
  // start bottom-left, go up the left edge
  ctx.moveTo(x, y + h - bodyRadius);
  ctx.lineTo(x, y + tabCornerR);
  // top-left corner of the TAB (tab left edge = folder left edge)
  ctx.arcTo(x, tabTop, x + tabCornerR, tabTop, tabCornerR);
  // flat tab top
  ctx.lineTo(tabRight - tabCornerR, tabTop);
  // rounded tab top-right corner, then short diagonal down to the panel top
  ctx.arcTo(tabRight, tabTop, tabRight + tabSlope, rearTop, tabCornerR);
  ctx.lineTo(tabRight + tabSlope, rearTop - tabCornerR * 0.2);
  // FLAT panel top across to the right
  ctx.lineTo(x + w - bodyRadius, rearTop);
  // top-right corner of the rear panel
  ctx.arcTo(x + w, rearTop, x + w, rearTop + bodyRadius, bodyRadius);
  // down the right edge
  ctx.lineTo(x + w, y + h - bodyRadius);
  ctx.arcTo(x + w, y + h, x + w - bodyRadius, y + h, bodyRadius);
  // bottom edge
  ctx.lineTo(x + bodyRadius, y + h);
  ctx.arcTo(x, y + h, x, y + h - bodyRadius, bodyRadius);
  ctx.closePath();
  ctx.fill();

  // ---- front pocket ----
  const grad = ctx.createLinearGradient(0, frontTop, 0, frontTop + frontH);
  grad.addColorStop(0, col.highlight);
  grad.addColorStop(0.12, col.base);
  grad.addColorStop(1, shade(base, 0.94));
  ctx.fillStyle = grad;
  rr(ctx, x, frontTop, w, frontH, bodyRadius);
  ctx.fill();

  // ---- top highlight edge on the front pocket ----
  ctx.save();
  rr(ctx, x, frontTop, w, frontH, bodyRadius);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, w * 0.006);
  ctx.beginPath();
  ctx.moveTo(x + bodyRadius, frontTop + ctx.lineWidth / 2);
  ctx.lineTo(x + w - bodyRadius, frontTop + ctx.lineWidth / 2);
  ctx.stroke();

  // ---- subtle inner seam near the bottom (macOS folder detail) ----
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = Math.max(1, w * 0.006);
  const seamY = frontTop + frontH * 0.9;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.04, seamY);
  ctx.lineTo(x + w * 0.96, seamY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.04, seamY + w * 0.012);
  ctx.lineTo(x + w * 0.96, seamY + w * 0.012);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/** Folder box height for a given width (front pocket top-left origin ignored). */
export function folderHeight(w: number): number {
  return w * 0.8;
}
