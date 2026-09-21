/**
 * Shared constants and helpers for "My Claude Code setup that replaced a 5-person team" carousel
 * Design reference: @espaciocreator -- Finder/file-manager UI with colored folders
 */

import { drawClawdGrid } from '@/lib/clawd/renderer';
import { getExpression } from '@/lib/clawd/expressions';
import { getTheme } from '@/lib/clawd/colors';

export const CW = 1080;
export const CH = 1350; // 1080x1350 (4:5 IG carousel)
export const TOTAL_SLIDES = 8; // 1 cover + 6 folder slides + 1 CTA

export const SF = '-apple-system, SF Pro Display, SF Pro Text, system-ui, sans-serif';

// Colors -- matching reference cream bg
export const BG = '#F5F3EE';

// Folder colors -- saturated, bold, pop against cream bg
export const FOLDER_COLORS = {
  content:  { body: '#818CF8', shadow: '#6366F1', label: 'Content' },
  code:     { body: '#F5A623', shadow: '#CC8A10', label: 'Code' },
  deploy:   { body: '#5CC93E', shadow: '#44A82B', label: 'Deploy' },
  research: { body: '#F43F5E', shadow: '#D1293F', label: 'Research' },
  design:   { body: '#FF8F6B', shadow: '#D96E4A', label: 'Design' },
  automate: { body: '#38C9BE', shadow: '#2AA89E', label: 'Automate' },
} as const;

// Window chrome colors (macOS style)
export const DOT_RED = '#FF5F57';
export const DOT_YELLOW = '#FEBC2E';
export const DOT_GREEN = '#28C840';

/**
 * Draw macOS-style window chrome at the top of the canvas.
 * Bigger, bolder, clearly visible.
 * Returns the y position where content area starts.
 */
export function drawWindowChrome(
  ctx: CanvasRenderingContext2D,
  title: string = 'claude_setup.workspace',
  subtitle: string = 'leadgenman 2026',
  accentColor?: string
): number {
  const chromeH = 78;

  // Chrome background -- slightly distinct from canvas bg
  ctx.fillStyle = '#FEFEFC';
  ctx.fillRect(0, 0, CW, chromeH);

  // Strong bottom border
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(0, chromeH - 1.5, CW, 1.5);

  // Accent color line below chrome (if provided)
  if (accentColor) {
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, chromeH, CW, 3);
  }

  // Traffic light dots -- bigger
  const dotY = chromeH / 2;
  const dotR = 8;
  const dotStartX = 32;
  const dotGap = 24;

  [DOT_RED, DOT_YELLOW, DOT_GREEN].forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(dotStartX + i * dotGap, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Title text -- bigger, bold
  ctx.font = `700 18px ${SF}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 105, dotY - 10);

  // Subtitle -- visible
  ctx.font = `500 13px ${SF}`;
  ctx.fillStyle = '#888888';
  ctx.fillText(subtitle, 105, dotY + 12);

  // Right-side Finder icons (search, grid, share, nav)
  const iconColor = 'rgba(0,0,0,0.35)';
  const iconY = dotY;
  const rightPad = 28;

  // Draw 4 small icon circles
  ctx.strokeStyle = iconColor;
  ctx.lineWidth = 1.8;
  const iconPositions = [CW - rightPad - 100, CW - rightPad - 70, CW - rightPad - 40, CW - rightPad];

  // Search icon
  const sX = iconPositions[0];
  ctx.beginPath();
  ctx.arc(sX, iconY - 2, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sX + 4.5, iconY + 3);
  ctx.lineTo(sX + 7, iconY + 6);
  ctx.stroke();

  // Grid icon (4 dots)
  const gX = iconPositions[1];
  ctx.fillStyle = iconColor;
  [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(gX + dx, iconY + dy, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Share icon
  const shX = iconPositions[2];
  ctx.strokeStyle = iconColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(shX - 5, iconY);
  ctx.lineTo(shX + 5, iconY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shX + 2, iconY - 4);
  ctx.lineTo(shX + 6, iconY);
  ctx.lineTo(shX + 2, iconY + 4);
  ctx.stroke();

  // Refresh icon (circular arrow)
  const rX = iconPositions[3];
  ctx.beginPath();
  ctx.arc(rX, iconY, 6, -Math.PI * 0.3, Math.PI * 1.3);
  ctx.stroke();

  return chromeH;
}

/**
 * Draw a macOS-style folder icon at (x, y) with given size.
 * Includes drop shadow for depth and clear separation.
 */
export function drawFolder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  bodyColor: string,
  shadowColor: string
): void {
  const w = size;
  const h = size * 0.78;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = size * 0.1;
  const tabW = w * 0.38;
  const tabH = h * 0.18;

  ctx.save();

  // ── Realistic floating shadow (3 layers for depth) ──
  // Layer 1: soft spread shadow (ambient occlusion)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Layer 2: tight contact shadow (makes it feel lifted)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.restore();

  // Tab (behind the body, top-left)
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.roundRect(x, y - tabH * 0.6, tabW, tabH + r, [r, r, 0, 0]);
  ctx.fill();

  // Main folder body -- darker shade for depth
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.roundRect(x, y + 3, w, h, r);
  ctx.fill();

  // Main folder body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  // White highlight line at top for 3D feel
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + r, y + h * 0.06);
  ctx.lineTo(x + w - r, y + h * 0.06);
  ctx.stroke();

  // Thin border for crisp edges
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Clawd with a thin black outline for contrast against light backgrounds.
 * Draws a 1px black border around each filled pixel.
 */
export function drawClawdOutlined(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pixelSize: number,
  themeId: string = 'claude',
  expressionId: string = 'normal',
  outlineWidth: number = 1,
  outlineColor: string = 'rgba(0,0,0,0.25)'
): void {
  const expr = getExpression(expressionId as import('@/lib/clawd/types').ClawdExpression);
  const theme = getTheme(themeId);
  const totalW = expr.cols * pixelSize;
  const totalH = expr.rows * pixelSize;
  const x = cx - totalW / 2;
  const y = cy - totalH / 2;
  const ow = outlineWidth;

  // First pass: draw expanded black silhouette behind each filled pixel
  ctx.save();
  ctx.fillStyle = outlineColor;
  for (let row = 0; row < expr.grid.length; row++) {
    const rowData = expr.grid[row];
    for (let col = 0; col < rowData.length; col++) {
      if (rowData[col] === 0) continue;
      ctx.fillRect(
        x + col * pixelSize - ow,
        y + row * pixelSize - ow,
        pixelSize + ow * 2,
        pixelSize + ow * 2
      );
    }
  }
  ctx.restore();

  // Second pass: draw the actual Clawd on top (covers the inner parts of the outline)
  drawClawdGrid(ctx, expr.grid, x, y, pixelSize, theme.body, theme.eye, theme.shadow);
}

/**
 * Draw a cursor icon at (x, y).
 * Classic macOS arrow cursor.
 */
export function drawCursor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 28
): void {
  ctx.save();
  const scale = size / 28;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  // Black arrow outline
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 24);
  ctx.lineTo(6.5, 18.5);
  ctx.lineTo(11, 27);
  ctx.lineTo(15, 25.5);
  ctx.lineTo(10.5, 16.5);
  ctx.lineTo(18, 16.5);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // White inner fill
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(2, 3);
  ctx.lineTo(2, 20.5);
  ctx.lineTo(6.8, 16.2);
  ctx.lineTo(11.2, 24.5);
  ctx.lineTo(13, 23.8);
  ctx.lineTo(8.8, 15);
  ctx.lineTo(15, 15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draw search bar
 */
export function drawSearchBar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  text: string,
  accentColor?: string
): void {
  const h = 52;
  const x = cx - width / 2;
  const y = cy - h / 2;
  const r = h / 2;

  // White fill for contrast
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x, y, width, h, r);
  ctx.fill();

  // Strong border (accent tinted if provided)
  ctx.strokeStyle = accentColor ? accentColor + '40' : 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(x, y, width, h, r);
  ctx.stroke();

  // Text -- dark and readable
  ctx.font = `500 18px ${SF}`;
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 28, cy);

  // Search icon (magnifying glass) -- dark
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2.2;
  const iconX = x + width - 34;
  const iconY = cy;
  const iconR = 9;
  ctx.beginPath();
  ctx.arc(iconX, iconY - 1, iconR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(iconX + iconR * 0.7, iconY + iconR * 0.7 - 1);
  ctx.lineTo(iconX + iconR * 1.3, iconY + iconR * 1.3 - 1);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw slide indicators as mini Clawd mascots.
 * Active slide Clawd is bigger + full color, inactive are smaller + grayed out.
 */
export function drawSlideDots(
  ctx: CanvasRenderingContext2D,
  current: number,
  total: number,
  y: number
): void {
  const activeSize = 5;
  const inactiveSize = 3;
  const gap = 50;
  const totalW = (total - 1) * gap;
  const startX = (CW - totalW) / 2;

  // Different expression for each slide indicator
  const expressions: import('@/lib/clawd/types').ClawdExpression[] = [
    'surprised',      // slide 1: cover (main Clawd)
    'cool',           // slide 2: Content
    'happy',          // slide 3: Code
    'raising-arm',    // slide 4: Deploy
    'pointing-right', // slide 5: Research
    'wink',           // slide 6: Design
    'dancing',        // slide 7: Automate
    'happy',          // slide 8: CTA
  ];

  for (let i = 0; i < total; i++) {
    const isActive = i === current;
    const ps = isActive ? activeSize : inactiveSize;
    const exprId = expressions[i] || 'normal';
    const expr = getExpression(exprId);
    const clawdW = expr.cols * ps;
    const clawdH = expr.rows * ps;
    const cx = startX + i * gap;

    ctx.save();

    if (isActive) {
      const theme = getTheme('claude');
      drawClawdGrid(ctx, expr.grid, cx - clawdW / 2, y - clawdH / 2, ps, theme.body, theme.eye, theme.shadow);
    } else {
      ctx.globalAlpha = 0.3;
      drawClawdGrid(ctx, expr.grid, cx - clawdW / 2, y - clawdH / 2, ps, '#999', '#666', '#888');
    }

    ctx.restore();
  }
}
