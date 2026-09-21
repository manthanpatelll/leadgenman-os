'use client';

/**
 * /claude-code-folders -- "Claude Code -- Finder Folders" 3-slide carousel (1:1)
 *
 * Original macOS-Finder folder carousel, Claude Code themed. Authentic macOS
 * light-gray bg (#ECECEC), crisp vector folders (./folder.ts), recolorable +
 * sharp at 4x. Directional inspo only (Finder editorial layout) -- original copy,
 * palette, structure.
 *
 * Follows the established seamless-sheet pattern from /claude-skill-folders:
 * drawSlide(ctx, ox, oy, idx) + a GAP between slides on the sheet (the black
 * divider between pages), Export Sheet PNG / ZIP 4x / PDF 4x (SLOW).
 *
 *   Slide 1  single hero coral folder + "Claude Code course"          [FINAL]
 *   Slide 2  folder + pixel-perfect macOS right-click menu (CTA row)  [draft]
 *   Slide 3  three scattered colored folders -> Claude Code features  [draft]
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { drawFolder, folderHeight } from './folder';
import { drawClawdGrid, getClawdSize, getExpression, getTheme } from '@/lib/clawd';

const CW = 1080; // 1:1
const CH = 1080;
const SLIDE_COUNT = 3;
const BG = '#ECECEC'; // authentic macOS Finder light gray -- never plain white
const CORAL = '#D97757'; // Claude coral
const TEAL = '#00D4AA';
const AMBER = '#F5B841'; // distinct warm gold for the "hooks" folder (macOS-tag feel)
const PURPLE = '#8E7BEF';

const UI =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif';

// Clawd mascot (Claude) -- drawn inside the Slide 1 hero folder pocket.
// Module-scoped so it loads once; the component re-renders when it's ready.
let clawdImg: HTMLImageElement | null = null;
function loadClawd(onReady: () => void) {
  if (typeof window === 'undefined' || clawdImg) return;
  const img = new window.Image();
  img.onload = () => {
    clawdImg = img;
    onReady();
  };
  img.src = '/clawd.png';
}

function drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const p: [number, number][] = [
    [0, 0], [0, 1.0], [0.28, 0.74], [0.46, 1.14], [0.62, 1.07], [0.44, 0.68], [0.8, 0.68],
  ];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.12;
  ctx.stroke();
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a Clawd mascot CENTERED at (cx,cy) with a chunky white pixel-outline
 * (matches the slide-1 clawd.png look) and a given expression.
 * The outline is a white silhouette drawn in 8 offset directions behind the body.
 */
function drawClawdOutlined(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  px: number,
  expressionId: string,
) {
  const expr = getExpression(expressionId as never);
  const theme = getTheme('claude');
  const { width, height } = getClawdSize(px, expressionId);
  const x = cx - width / 2;
  const y = cy - height / 2;

  // white outline: draw the grid as an all-white silhouette, offset around
  const o = Math.max(2, px * 0.5);
  const whiteGrid = expr.grid.map((r) => r.map((c) => (c === 0 ? 0 : 1)));
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    drawClawdGrid(
      ctx,
      whiteGrid,
      x + Math.cos(ang) * o,
      y + Math.sin(ang) * o,
      px,
      '#FFFFFF',
      '#FFFFFF',
      '#FFFFFF',
    );
  }
  // body on top (coral + real eyes)
  drawClawdGrid(ctx, expr.grid, x, y, px, theme.body, theme.eye, theme.shadow);
}

function label(ctx: CanvasRenderingContext2D, text: string, cx: number, baseline: number, size: number) {
  ctx.fillStyle = '#1c1c1e';
  ctx.font = `500 ${size}px ${UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, cx, baseline);
}

/** SLIDE 1 -- single hero folder with the Clawd mascot inside + label. */
function drawSlide1(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  const fw = 520;
  const fx = ox + (CW - fw) / 2;
  const fh = folderHeight(fw);
  const fy = oy + (CH - fh) / 2 - 70;
  drawFolder(ctx, CORAL, fx, fy, fw);

  // Clawd mascot centered in the folder's front pocket (topic IS Claude Code).
  if (clawdImg) {
    const pocketTop = fy + fh * 0.24; // below the tab, in the front pocket
    const pocketH = fh * 0.72;
    const targetH = pocketH * 0.66;
    const ar = clawdImg.width / clawdImg.height;
    const cw = targetH * ar;
    ctx.drawImage(clawdImg, fx + fw / 2 - cw / 2, pocketTop + pocketH / 2 - targetH / 2, cw, targetH);
  }

  label(ctx, 'Claude Code course', ox + CW / 2, fy + fh + 110, 56);
  drawCursor(ctx, fx + fw * 0.86, fy + fh * 0.72, 74);
}

/** Draw a Clawd (white-outlined, given expression) centered in a folder pocket. */
function folderClawd(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  fw: number,
  expr: string,
) {
  const fh = folderHeight(fw);
  const cx = fx + fw / 2;
  const cy = fy + fh * 0.24 + (fh * 0.72) / 2; // center of front pocket
  const px = Math.round((fw * 0.38) / 13); // ~13 cols wide -> pixel size (slightly smaller)
  drawClawdOutlined(ctx, cx, cy, px, expr);
}

/** SLIDE 2 -- three scattered colored folders (each with a Clawd) -> features. */
function drawSlide2(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  const fw = 280;
  const fh = folderHeight(fw);

  drawFolder(ctx, AMBER, ox + 640, oy + 150, fw);
  folderClawd(ctx, ox + 640, oy + 150, fw, 'wink');
  label(ctx, 'hooks', ox + 640 + fw / 2, oy + 150 + fh + 66, 42);

  drawFolder(ctx, TEAL, ox + 120, oy + 400, fw);
  folderClawd(ctx, ox + 120, oy + 400, fw, 'happy');
  label(ctx, 'subagents', ox + 120 + fw / 2, oy + 400 + fh + 66, 42);

  drawFolder(ctx, PURPLE, ox + 420, oy + 680, fw);
  folderClawd(ctx, ox + 420, oy + 680, fw, 'cool');
  label(ctx, 'skills & MCP', ox + 420 + fw / 2, oy + 680 + fh + 66, 42);

  drawCursor(ctx, ox + 780, oy + 600, 66);
}

// ── macOS right-click context menu (pixel-authentic) ─────────────────────
// Metrics are native @1x points; the whole menu is scaled by `s` at draw time.
const MENU_SELECT_BLUE = '#0A65FF'; // menu-item selection blue (NOT #007AFF button blue)
const TAG_COLORS = ['#FC5C57', '#F7A64B', '#F7CE46', '#7AC756', '#54A0F4', '#C86EDF', '#B4B4BE'];

type MenuItem =
  | { type: 'item'; text: string; chevron?: boolean; highlight?: boolean }
  | { type: 'sep' }
  | { type: 'tags' };

function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draw a macOS context menu. (mx,my) = top-left. `s` = point->px scale.
 * Returns the highlighted row's center y (for cursor placement).
 */
function drawContextMenu(
  ctx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  s: number,
  widthPt: number,
  items: MenuItem[],
): { highlightY: number; width: number; height: number } {
  const rowH = 22 * s;
  const sepH = 11 * s;
  const tagsH = 30 * s;
  const padY = 5 * s;
  const radius = 10 * s;
  const textInset = 21 * s;
  const fontSize = 13 * s;

  // Auto-size width to the longest item text (authentic macOS: menu grows to fit),
  // with a floor of widthPt. Right inset leaves room for a chevron.
  ctx.font = `400 ${fontSize}px ${UI}`;
  let maxTextW = 0;
  for (const it of items) {
    if (it.type === 'item') maxTextW = Math.max(maxTextW, ctx.measureText(it.text).width);
  }
  const w = Math.max(widthPt * s, maxTextW + textInset + 20 * s);

  // total height
  let h = padY * 2;
  for (const it of items) h += it.type === 'sep' ? sepH : it.type === 'tags' ? tagsH : rowH;

  // shadow + frosted-glass container (macOS vibrancy material).
  // Real menus are translucent: the backdrop bleeds through and picks up
  // subtle cool-at-top / warm-greenish-toward-bottom tints. We fake that with
  // a base light fill + a soft vertical tint gradient overlay.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.30)';
  ctx.shadowBlur = 30 * s;
  ctx.shadowOffsetY = 12 * s;
  rrPath(ctx, mx, my, w, h, radius);
  ctx.fillStyle = 'rgba(244,244,246,0.92)'; // frosted base (slightly translucent)
  ctx.fill();
  ctx.restore();

  // vibrancy tint: cool gray up top -> faint green/warm lower (like the reference)
  ctx.save();
  rrPath(ctx, mx, my, w, h, radius);
  ctx.clip();
  const vg = ctx.createLinearGradient(mx, my, mx + w * 0.2, my + h);
  vg.addColorStop(0, 'rgba(200,204,214,0.75)'); // cool gray top (stronger)
  vg.addColorStop(0.25, 'rgba(224,226,230,0.34)');
  vg.addColorStop(0.5, 'rgba(214,226,198,0.42)'); // greener mid
  vg.addColorStop(0.75, 'rgba(210,222,190,0.52)'); // warm green-gray lower
  vg.addColorStop(1, 'rgba(200,214,180,0.62)'); // deepest green-gray bottom
  ctx.fillStyle = vg;
  ctx.fillRect(mx, my, w, h);
  // soft inner top highlight (glass edge catching light)
  const hg = ctx.createLinearGradient(mx, my, mx, my + 14 * s);
  hg.addColorStop(0, 'rgba(255,255,255,0.55)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(mx, my, w, 14 * s);
  ctx.restore();

  // hairline border
  rrPath(ctx, mx + 0.25, my + 0.25, w - 0.5, h - 0.5, radius);
  ctx.strokeStyle = 'rgba(0,0,0,0.14)';
  ctx.lineWidth = Math.max(1, 0.5 * s);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  let y = my + padY;
  let highlightY = my + h / 2;

  for (const it of items) {
    if (it.type === 'sep') {
      ctx.strokeStyle = 'rgba(0,0,0,0.11)';
      ctx.lineWidth = Math.max(1, 1 * s);
      ctx.beginPath();
      ctx.moveTo(mx + 12 * s, Math.round(y + sepH / 2) + 0.5);
      ctx.lineTo(mx + w - 12 * s, Math.round(y + sepH / 2) + 0.5);
      ctx.stroke();
      y += sepH;
      continue;
    }
    if (it.type === 'tags') {
      const dotR = 6 * s;
      const gap = 20 * s;
      let dx = mx + textInset + dotR;
      const cy = y + tagsH / 2;
      for (const c of TAG_COLORS) {
        ctx.beginPath();
        ctx.arc(dx, cy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = Math.max(1, 0.5 * s);
        ctx.stroke();
        dx += dotR * 2 + gap;
      }
      y += tagsH;
      continue;
    }
    // regular item
    if (it.highlight) {
      const inset = 5 * s;
      rrPath(ctx, mx + inset, y, w - inset * 2, rowH, 5 * s);
      ctx.fillStyle = MENU_SELECT_BLUE;
      ctx.fill();
      highlightY = y + rowH / 2;
    }
    ctx.fillStyle = it.highlight ? '#FFFFFF' : 'rgba(0,0,0,0.85)';
    ctx.font = `400 ${fontSize}px ${UI}`;
    ctx.fillText(it.text, mx + textInset, y + rowH / 2 + 1 * s);

    if (it.chevron) {
      const cxp = mx + w - 14 * s;
      const cyp = y + rowH / 2;
      const ch = 4 * s;
      ctx.strokeStyle = it.highlight ? '#FFFFFF' : 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1.6 * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cxp - ch * 0.5, cyp - ch);
      ctx.lineTo(cxp + ch * 0.5, cyp);
      ctx.lineTo(cxp - ch * 0.5, cyp + ch);
      ctx.stroke();
    }
    y += rowH;
  }

  return { highlightY, width: w, height: h };
}

/** SLIDE 3 -- folder + macOS right-click context menu with our CTA row. */
function drawSlide3(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  // folder top-left, its label peeking out behind the menu (like the reference)
  const fw = 360;
  const fx = ox + 140;
  const fh = folderHeight(fw);
  const fy = oy + 70;
  drawFolder(ctx, CORAL, fx, fy, fw);
  label(ctx, 'Claude Code course', fx + fw / 2, fy + fh + 58, 34);

  // context menu overlapping the folder's lower-right
  const items: MenuItem[] = [
    { type: 'item', text: 'Open' },
    { type: 'item', text: 'Move to Bin' },
    { type: 'sep' },
    { type: 'item', text: 'Comment "COURSE" for 30-day series', highlight: true },
    { type: 'item', text: 'Rename' },
    { type: 'item', text: 'Compress "Claude Code course"' },
    { type: 'item', text: 'Duplicate' },
    { type: 'item', text: 'Make Alias' },
    { type: 'sep' },
    { type: 'item', text: 'Copy' },
    { type: 'item', text: 'Share...' },
    { type: 'sep' },
    { type: 'tags' },
    { type: 'item', text: 'Tags...' },
    { type: 'sep' },
    { type: 'item', text: 'Import from iPhone', chevron: true },
    { type: 'item', text: 'Quick Actions', chevron: true },
    { type: 'sep' },
    { type: 'item', text: 'New Terminal at Folder' },
    { type: 'item', text: 'New Terminal Tab at Folder' },
  ];

  // Menu spawns from the click point: its top-left OVERLAPS the folder's
  // lower-right corner (like a real macOS right-click), not floating apart.
  const menuWpt = 244;
  const s = 2.05; // sized so the overlapping menu still fits inside 1080
  const mx = fx + fw * 0.62; // start inside the folder's right portion
  const my = fy + fh * 0.5; // start over the folder's lower area
  const { highlightY, width } = drawContextMenu(ctx, mx, my, s, menuWpt, items);

  // cursor sitting on the highlighted (blue) CTA row, right side (+15px right)
  drawCursor(ctx, mx + width - 44 + 15, highlightY + 6, 56);
}

const SLIDE_DRAW = [drawSlide1, drawSlide2, drawSlide3];

/** Paint one slide (background + content) at (ox,oy). */
function drawSlide(ctx: CanvasRenderingContext2D, ox: number, oy: number, idx: number) {
  ctx.save();
  ctx.fillStyle = BG;
  ctx.fillRect(ox, oy, CW, CH);
  SLIDE_DRAW[idx](ctx, ox, oy);
  ctx.restore();
}

export default function ClaudeCodeFoldersPage() {
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const [exporting, setExporting] = useState(false);
  const [clawdTick, setClawdTick] = useState(0);

  // GAP between slides on the sheet = the BLACK divider between pages.
  const GAP = 40;
  const SHEET_W = CW * SLIDE_COUNT + GAP * (SLIDE_COUNT - 1);
  const SHEET_H = CH;

  const drawSheet = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.fillStyle = '#000000'; // black divider background shows through the GAPs
      ctx.fillRect(0, 0, SHEET_W, SHEET_H);
      for (let i = 0; i < SLIDE_COUNT; i++) drawSlide(ctx, i * (CW + GAP), 0, i);
      ctx.restore();
    },
    [SHEET_W],
  );

  useEffect(() => {
    loadClawd(() => setClawdTick((t) => t + 1));
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    canvas.width = SHEET_W;
    canvas.height = SHEET_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawSheet(ctx);
  }, [drawSheet, SHEET_W, clawdTick]);

  const renderSlideAtScale = useCallback((idx: number, SCALE: number): HTMLCanvasElement => {
    const off = document.createElement('canvas');
    off.width = CW * SCALE;
    off.height = CH * SCALE;
    const ctx = off.getContext('2d')!;
    ctx.scale(SCALE, SCALE);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawSlide(ctx, 0, 0, idx);
    return off;
  }, []);

  const exportSheet = useCallback(() => {
    setExporting(true);
    const SCALE = 4;
    const off = document.createElement('canvas');
    off.width = SHEET_W * SCALE;
    off.height = SHEET_H * SCALE;
    const ctx = off.getContext('2d')!;
    ctx.scale(SCALE, SCALE);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawSheet(ctx);
    off.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'claude-code-folders-sheet-4x.png';
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 'image/png');
  }, [drawSheet, SHEET_W, SHEET_H]);

  const exportZip = useCallback(async () => {
    setExporting(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      for (let i = 0; i < SLIDE_COUNT; i++) {
        const cnv = renderSlideAtScale(i, 4);
        const blob: Blob = await new Promise((res) => cnv.toBlob((b) => res(b!), 'image/png'));
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);
        await new Promise((r) => setTimeout(r, 0));
      }
      const out = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(out);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'claude-code-folders-slides-4x.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [renderSlideAtScale]);

  const exportPdf = useCallback(async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [CW, CH], compress: true });
      for (let i = 0; i < SLIDE_COUNT; i++) {
        const cnv = renderSlideAtScale(i, 4);
        const dataUrl = cnv.toDataURL('image/jpeg', 0.92);
        if (i > 0) pdf.addPage([CW, CH], 'portrait');
        pdf.addImage(dataUrl, 'JPEG', 0, 0, CW, CH, undefined, 'SLOW');
        await new Promise((r) => setTimeout(r, 0));
      }
      pdf.save('claude-code-folders.pdf');
    } finally {
      setExporting(false);
    }
  }, [renderSlideAtScale]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1A1714',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        fontFamily: UI,
        color: '#FFFFFF',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <Link href="/" style={{ color: CORAL, fontSize: 13, textDecoration: 'none', opacity: 0.8 }}>
            &larr; carousels
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Claude Code -- Finder Folders</h1>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>3 slides &middot; 1080x1080 each</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportSheet} disabled={exporting} style={btn}>Export Sheet PNG</button>
          <button onClick={exportZip} disabled={exporting} style={btn}>Export ZIP (4x)</button>
          <button onClick={exportPdf} disabled={exporting} style={btn}>Export PDF (4x)</button>
        </div>
      </div>

      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          background: '#000',
        }}
      >
        <canvas
          ref={sheetCanvasRef}
          style={{
            display: 'block',
            height: 'min(80vh, 720px)',
            width: 'auto',
            aspectRatio: `${SHEET_W} / ${SHEET_H}`,
          }}
        />
      </div>

      <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 760 }}>
        Slide 1 hero folder (&ldquo;Claude Code course&rdquo;) &rarr; Slide 2 macOS right-click menu (CTA row,
        building next) &rarr; Slide 3 three feature folders (subagents / hooks / skills). Black divider between
        pages. Authentic macOS light-gray #ECECEC, coral Finder folders.
      </p>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: CORAL,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};
