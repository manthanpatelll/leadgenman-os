/**
 * Clawd Mascot -- Canvas 2D Renderer
 *
 * Core drawing functions for rendering Clawd at any size, position,
 * color, expression, rotation, scale, and opacity.
 *
 * Designed for reuse across reels, carousels, and animations.
 *
 * Usage:
 *   import { drawClawd, drawClawdCentered, drawClawdAnimated } from '@/lib/clawd/renderer';
 *   drawClawd(ctx, 100, 100, 24);                          // simple
 *   drawClawdCentered(ctx, 540, 960, 32);                   // centered
 *   drawClawdAnimated(ctx, animState);                       // full animation state
 */

import type { ClawdAnimState, ClawdColorTheme, ClawdGrid } from './types';
import { getExpression } from './expressions';
import { getTheme } from './colors';

// ── Core grid renderer ──

/**
 * Draw a Clawd grid at (x, y) with given pixel size.
 * This is the lowest-level draw function.
 */
export function drawClawdGrid(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  grid: ClawdGrid,
  x: number,
  y: number,
  pixelSize: number,
  bodyColor: string,
  eyeColor: string,
  shadowColor: string
): void {
  // Overlap each cell by 0.5px to eliminate sub-pixel gaps after
  // rotation / scaling transforms. The overlap is invisible because
  // adjacent cells share the same fill color.
  const overlap = 0.5;
  for (let row = 0; row < grid.length; row++) {
    const rowData = grid[row];
    for (let col = 0; col < rowData.length; col++) {
      const cell = rowData[col];
      if (cell === 0) continue;
      if (cell === 2) ctx.fillStyle = eyeColor;
      else if (cell === 3) ctx.fillStyle = shadowColor;
      else if (cell === 4) ctx.fillStyle = '#FFFFFF';
      else ctx.fillStyle = bodyColor;
      ctx.fillRect(
        x + col * pixelSize - overlap,
        y + row * pixelSize - overlap,
        pixelSize + overlap * 2,
        pixelSize + overlap * 2
      );
    }
  }
}

// ── Convenience draw functions ──

/**
 * Draw Clawd "Normal" expression at (x, y) top-left.
 * Optional theme override.
 */
export function drawClawd(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pixelSize: number,
  themeId: string = 'claude',
  expressionId: string = 'normal'
): void {
  const theme = getTheme(themeId);
  const expr = getExpression(expressionId as import('./types').ClawdExpression);
  drawClawdGrid(ctx, expr.grid, x, y, pixelSize, theme.body, theme.eye, theme.shadow);
}

/**
 * Draw Clawd centered at (cx, cy).
 */
export function drawClawdCentered(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pixelSize: number,
  themeId: string = 'claude',
  expressionId: string = 'normal'
): void {
  const expr = getExpression(expressionId as import('./types').ClawdExpression);
  const totalW = expr.cols * pixelSize;
  const totalH = expr.rows * pixelSize;
  drawClawd(ctx, cx - totalW / 2, cy - totalH / 2, pixelSize, themeId, expressionId);
}

/**
 * Get total dimensions of a Clawd at given pixel size.
 */
export function getClawdSize(
  pixelSize: number,
  expressionId: string = 'normal'
): { width: number; height: number } {
  const expr = getExpression(expressionId as import('./types').ClawdExpression);
  return {
    width: expr.cols * pixelSize,
    height: expr.rows * pixelSize,
  };
}

// ── Full animation renderer ──

/**
 * Draw Clawd with full animation state: position, scale, rotation, opacity,
 * bounce, squash/stretch. Use this in reel/animation drawScene functions.
 */
export function drawClawdAnimated(
  ctx: CanvasRenderingContext2D,
  state: ClawdAnimState
): void {
  const theme = getTheme(state.theme);
  const expr = getExpression(state.expression);
  const totalW = expr.cols * state.pixelSize;
  const totalH = expr.rows * state.pixelSize;

  ctx.save();

  // Position + bounce
  ctx.translate(state.x, state.y + state.bounceY);

  // Rotation around center
  if (state.rotation !== 0) {
    ctx.rotate(state.rotation);
  }

  // Scale (uniform + squash/stretch)
  const sx = state.scale * state.scaleX;
  const sy = state.scale * state.scaleY;
  if (sx !== 1 || sy !== 1) {
    ctx.scale(sx, sy);
  }

  // Opacity
  if (state.opacity < 1) {
    ctx.globalAlpha = state.opacity;
  }

  // Draw grid centered at origin
  drawClawdGrid(
    ctx,
    expr.grid,
    -totalW / 2,
    -totalH / 2,
    state.pixelSize,
    theme.body,
    theme.eye,
    theme.shadow
  );

  ctx.restore();
}

// ── Animation helpers ──

/**
 * Idle bounce animation. Returns bounceY offset.
 * Use with requestAnimationFrame time.
 */
export function idleBounce(time: number, amplitude: number = 4, speed: number = 2): number {
  return Math.sin(time * speed) * amplitude;
}

/**
 * Squash on land (after a jump/drop).
 * progress: 0 = start squash, 1 = fully recovered
 */
export function squashStretch(progress: number): { scaleX: number; scaleY: number } {
  const t = Math.min(1, progress);
  // Squash then stretch back
  const squash = 1 + 0.3 * Math.exp(-t * 8) * Math.cos(t * 12);
  return {
    scaleX: 2 - squash, // wider when squashed
    scaleY: squash,      // shorter when squashed
  };
}

/**
 * Walk cycle: returns x offset that oscillates side to side.
 */
export function walkCycle(time: number, stride: number = 8, speed: number = 3): number {
  return Math.sin(time * speed) * stride;
}

// ── SVG export ──

/**
 * Generate SVG string for a Clawd expression at given pixel size.
 * Matches the format from claude-code-mascot-generator.replit.app
 */
export function generateClawdSVG(
  pixelSize: number = 20,
  themeId: string = 'claude',
  expressionId: string = 'normal'
): string {
  const theme = getTheme(themeId);
  const expr = getExpression(expressionId as import('./types').ClawdExpression);
  const width = expr.cols * pixelSize;
  const height = expr.rows * pixelSize;

  let rects = '';
  for (let row = 0; row < expr.grid.length; row++) {
    const rowData = expr.grid[row];
    for (let col = 0; col < rowData.length; col++) {
      const cell = rowData[col];
      if (cell === 0) continue;
      let fill: string;
      if (cell === 2) fill = theme.eye;
      else if (cell === 3) fill = theme.shadow;
      else if (cell === 4) fill = '#FFFFFF';
      else fill = theme.body;
      rects += `<rect x="${col * pixelSize}" y="${row * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${fill}"></rect>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="image-rendering: pixelated;">${rects}</svg>`;
}

/**
 * Generate PNG blob of Clawd at high resolution.
 */
export async function generateClawdPNG(
  pixelSize: number = 20,
  scale: number = 8,
  themeId: string = 'claude',
  expressionId: string = 'normal',
  showBackground: boolean = false,
  bgColor: string = '#1a1a2e'
): Promise<Blob> {
  const expr = getExpression(expressionId as import('./types').ClawdExpression);
  const w = expr.cols * pixelSize * scale;
  const h = expr.rows * pixelSize * scale;
  const offscreen = new OffscreenCanvas(w, h);
  const ctx = offscreen.getContext('2d')!;

  if (showBackground) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  const theme = getTheme(themeId);
  drawClawdGrid(ctx, expr.grid, 0, 0, pixelSize * scale, theme.body, theme.eye, theme.shadow);

  return offscreen.convertToBlob({ type: 'image/png' });
}
