'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawFolder, drawCursor, drawSearchBar, drawSlideDots,
  drawClawdOutlined, FOLDER_COLORS,
} from '../_shared';
import { roundedRect } from '@/lib/drawing-utils';

const SLIDE_NUM = 6;
const FILENAME = 'claude-replaced-team-06.png';
const FOLDER = FOLDER_COLORS.design;
const MONO = 'Menlo, Monaco, Consolas, monospace';

// ── Card 1: Canvas 2D Code ──

function drawCanvas2DCode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Dark editor background
  ctx.fillStyle = '#1E1E2E';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const headerH = 38;
  ctx.fillStyle = '#181825';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  // Title bar dots
  const dotColors = ['#FF5F57', '#FEBC2E', '#28C840'];
  dotColors.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(x + 18 + i * 16, y + headerH / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  // File name
  ctx.font = `500 13px ${SF}`;
  ctx.fillStyle = '#CDD6F4';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Animation.tsx', x + w / 2, y + headerH / 2);
  ctx.textAlign = 'left';

  // Code lines
  const pad = 16;
  const lineH = 20;
  let lineY = y + headerH + 14;
  ctx.textBaseline = 'top';

  const lines: Array<Array<[string, string]>> = [
    [['import', '#C792EA'], [' { useCurrentFrame }', '#89DDFF'], [' from', '#C792EA'], [" 'remotion'", '#C3E88D']],
    [['import', '#C792EA'], [' { spring }', '#89DDFF'], [' from', '#C792EA'], [" 'remotion'", '#C3E88D']],
    [['', '#666']],
    [['export', '#C792EA'], [' const', '#82AAFF'], [' Animation', '#DCDCAA'], [' = () => {', '#89DDFF']],
    [['  const', '#82AAFF'], [' frame', '#9CDCFE'], [' = useCurrentFrame()', '#DCDCAA']],
    [['  const', '#82AAFF'], [' scale', '#9CDCFE'], [' = spring({', '#89DDFF']],
    [['    frame,', '#9CDCFE'], [' fps: ', '#89DDFF'], ['30', '#F78C6C'], [',', '#89DDFF']],
    [['    config: {', '#89DDFF'], [' damping: ', '#9CDCFE'], ['200', '#F78C6C'], [' }', '#89DDFF']],
    [['  })', '#89DDFF']],
    [['  return', '#C792EA'], [' <AbsoluteFill>', '#4EC9B0']],
    [['    <Sequence', '#4EC9B0'], [' from={', '#89DDFF'], ['15', '#F78C6C'], ['}>', '#89DDFF']],
    [['      <Logo', '#4EC9B0'], [' scale={scale} />', '#89DDFF']],
  ];

  ctx.font = `400 13px ${MONO}`;

  lines.forEach((tokens) => {
    if (lineY > y + h - 14) return;
    let curX = x + pad;

    // Line number gutter
    const lineIdx = lines.indexOf(tokens) + 1;
    ctx.fillStyle = '#45475A';
    ctx.font = `400 12px ${MONO}`;
    ctx.fillText(String(lineIdx).padStart(2, ' '), x + 6, lineY);
    ctx.font = `400 13px ${MONO}`;
    curX = x + pad + 24;

    tokens.forEach(([text, color]) => {
      ctx.fillStyle = color;
      ctx.fillText(text, curX, lineY);
      curX += ctx.measureText(text).width;
    });

    lineY += lineH;
  });
}

// ── Card 2: Logo Registry Grid ──

function drawLogoRegistry(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Header bar
  const headerH = 44;
  ctx.fillStyle = '#1A1A24';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#E6EDF3';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Logo Registry', x + 18, y + headerH / 2);

  ctx.font = `400 12px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.textAlign = 'right';
  ctx.fillText('47 SVG + 13 PNG', x + w - 18, y + headerH / 2);
  ctx.textAlign = 'left';

  // Logo grid -- 4 columns x 4 rows
  const gridPad = 18;
  const cols = 4;
  const rows = 4;
  const cellW = (w - gridPad * 2) / cols;
  const cellH = 68;
  const gridStartY = y + headerH + 16;

  const logos = [
    { name: 'Claude', color: '#D97757', shape: 'circle' },
    { name: 'Slack', color: '#E01E5A', shape: 'square' },
    { name: 'GitHub', color: '#FFFFFF', shape: 'circle' },
    { name: 'Stripe', color: '#635BFF', shape: 'square' },
    { name: 'Vercel', color: '#FFFFFF', shape: 'triangle' },
    { name: 'OpenAI', color: '#10A37F', shape: 'circle' },
    { name: 'Discord', color: '#5865F2', shape: 'circle' },
    { name: 'Spotify', color: '#1DB954', shape: 'circle' },
    { name: 'Netflix', color: '#E50914', shape: 'square' },
    { name: 'YouTube', color: '#FF0000', shape: 'square' },
    { name: 'X', color: '#FFFFFF', shape: 'circle' },
    { name: 'Figma', color: '#A259FF', shape: 'circle' },
    { name: 'Instagram', color: '#E4405F', shape: 'square' },
    { name: 'WhatsApp', color: '#25D366', shape: 'circle' },
    { name: 'TikTok', color: '#00F2EA', shape: 'circle' },
    { name: 'Notion', color: '#FFFFFF', shape: 'square' },
  ];

  logos.forEach((logo, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    if (row >= rows) return;

    const cx = x + gridPad + col * cellW + cellW / 2;
    const cy = gridStartY + row * cellH + 20;

    // Logo shape
    ctx.fillStyle = logo.color;
    if (logo.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (logo.shape === 'square') {
      ctx.beginPath();
      ctx.roundRect(cx - 13, cy - 13, 26, 26, 5);
      ctx.fill();
    } else if (logo.shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx + 14, cy + 10);
      ctx.lineTo(cx - 14, cy + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Subtle outline for white logos
    if (logo.color === '#FFFFFF') {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      if (logo.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.stroke();
      } else if (logo.shape === 'square') {
        ctx.beginPath();
        ctx.roundRect(cx - 13, cy - 13, 26, 26, 5);
        ctx.stroke();
      }
    }

    // Label
    ctx.font = `400 10px ${SF}`;
    ctx.fillStyle = '#8B949E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(logo.name, cx, cy + 18);
    ctx.textAlign = 'left';
  });
}

// ── Card 3: Color Palette / Design System ──

function drawColorPalette(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Header bar
  const headerH = 44;
  ctx.fillStyle = '#1A1A24';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `600 14px ${MONO}`;
  ctx.fillStyle = '#CDD6F4';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('DESIGN-SYSTEM.md', x + 18, y + headerH / 2);

  // Color swatches
  const pad = 22;
  const swatchH = 44;
  const swatchW = w - pad * 2;
  const gap = 12;
  let swatchY = y + headerH + 20;

  const colors = [
    { name: 'Primary', hex: '#FF6B35', color: '#FF6B35' },
    { name: 'Light', hex: '#FF8F6B', color: '#FF8F6B' },
    { name: 'Soft', hex: '#FFB088', color: '#FFB088' },
    { name: 'Teal', hex: '#00D4AA', color: '#00D4AA' },
  ];

  colors.forEach((swatch) => {
    if (swatchY > y + h - 80) return;

    // Swatch rectangle
    const swatchRectW = 50;
    ctx.fillStyle = swatch.color;
    ctx.beginPath();
    ctx.roundRect(x + pad, swatchY, swatchRectW, swatchH, 8);
    ctx.fill();

    // Name
    ctx.font = `600 14px ${SF}`;
    ctx.fillStyle = '#E6EDF3';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(swatch.name, x + pad + swatchRectW + 14, swatchY + 6);

    // Hex code
    ctx.font = `400 13px ${MONO}`;
    ctx.fillStyle = '#8B949E';
    ctx.fillText(swatch.hex, x + pad + swatchRectW + 14, swatchY + 24);

    swatchY += swatchH + gap;
  });

  // Gradient bar at bottom
  const barY = y + h - 38;
  const barH = 14;
  const gradient = ctx.createLinearGradient(x + pad, barY, x + w - pad, barY);
  gradient.addColorStop(0, '#FF6B35');
  gradient.addColorStop(0.4, '#FF8F6B');
  gradient.addColorStop(0.7, '#FFB088');
  gradient.addColorStop(1, '#00D4AA');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x + pad, barY, w - pad * 2, barH, 7);
  ctx.fill();
}

// ── Card 4: PNG Export Modal ──

function drawExportModal(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Header bar
  const headerH = 44;
  ctx.fillStyle = '#1A1A24';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `700 16px ${SF}`;
  ctx.fillStyle = '#E6EDF3';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Export', x + 18, y + headerH / 2);

  // Close X button
  ctx.strokeStyle = '#8B949E';
  ctx.lineWidth = 2;
  const closeX = x + w - 28;
  const closeY = y + headerH / 2;
  ctx.beginPath();
  ctx.moveTo(closeX - 5, closeY - 5);
  ctx.lineTo(closeX + 5, closeY + 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(closeX + 5, closeY - 5);
  ctx.lineTo(closeX - 5, closeY + 5);
  ctx.stroke();

  const pad = 22;
  let contentY = y + headerH + 22;

  // Format selection
  ctx.font = `600 13px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.textBaseline = 'top';
  ctx.fillText('Format', x + pad, contentY);
  contentY += 22;

  // Format pills
  const formats = [
    { name: 'PNG', active: true },
    { name: 'MP4', active: false },
    { name: 'GIF', active: false },
  ];

  let pillX = x + pad;
  formats.forEach((fmt) => {
    const tw = ctx.measureText(fmt.name).width + 30;
    const pillH = 32;

    if (fmt.active) {
      ctx.fillStyle = '#FF6B35';
      ctx.beginPath();
      ctx.roundRect(pillX, contentY, tw, pillH, 8);
      ctx.fill();
      ctx.font = `700 14px ${SF}`;
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = '#2A2A35';
      ctx.beginPath();
      ctx.roundRect(pillX, contentY, tw, pillH, 8);
      ctx.fill();
      ctx.font = `500 14px ${SF}`;
      ctx.fillStyle = '#555';
    }
    ctx.textBaseline = 'middle';
    ctx.fillText(fmt.name, pillX + 15, contentY + pillH / 2);
    pillX += tw + 10;
  });

  contentY += 50;

  // Resolution
  ctx.font = `600 13px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.textBaseline = 'top';
  ctx.fillText('Resolution', x + pad, contentY);
  contentY += 22;

  ctx.font = `600 20px ${MONO}`;
  ctx.fillStyle = '#3FB950';
  ctx.fillText('4320 x 5400', x + pad, contentY);

  // Quality badge
  const qualBadgeX = x + pad + ctx.measureText('4320 x 5400').width + 14;
  ctx.fillStyle = 'rgba(255, 107, 53, 0.15)';
  ctx.beginPath();
  ctx.roundRect(qualBadgeX, contentY - 2, 36, 26, 6);
  ctx.fill();
  ctx.font = `700 14px ${SF}`;
  ctx.fillStyle = '#FF6B35';
  ctx.fillText('4x', qualBadgeX + 9, contentY + 3);

  contentY += 42;

  // Progress bar
  ctx.font = `600 13px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.textBaseline = 'top';
  ctx.fillText('Progress', x + pad, contentY);
  ctx.fillStyle = '#3FB950';
  ctx.textAlign = 'right';
  ctx.fillText('100%', x + w - pad, contentY);
  ctx.textAlign = 'left';
  contentY += 22;

  const barW = w - pad * 2;
  const barH = 10;
  ctx.fillStyle = '#2A2A35';
  ctx.beginPath();
  ctx.roundRect(x + pad, contentY, barW, barH, 5);
  ctx.fill();
  ctx.fillStyle = '#3FB950';
  ctx.beginPath();
  ctx.roundRect(x + pad, contentY, barW, barH, 5);
  ctx.fill();

  contentY += 26;

  // File size
  ctx.font = `400 13px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.fillText('File size: ', x + pad, contentY);
  ctx.fillStyle = '#CDD6F4';
  ctx.fillText('2.4 MB', x + pad + ctx.measureText('File size: ').width, contentY);

  contentY += 34;

  // Export button
  const btnW = w - pad * 2;
  const btnH = 44;
  ctx.fillStyle = '#FF6B35';
  ctx.beginPath();
  ctx.roundRect(x + pad, contentY, btnW, btnH, 10);
  ctx.fill();
  ctx.font = `700 16px ${SF}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Export PNG', x + pad + btnW / 2, contentY + btnH / 2);
  ctx.textAlign = 'left';
}

// ── Tile definitions ──

const TILES = [
  { label: 'Remotion animations', draw: drawCanvas2DCode },
  { label: '47+ brand logos', draw: drawLogoRegistry },
  { label: 'Brand color system', draw: drawColorPalette },
  { label: '4x resolution export', draw: drawExportModal },
];

// ── Main render ──

function renderSlide(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CW, CH);

  drawWindowChrome(ctx, undefined, undefined, FOLDER.body);

  // ── Row 1: Folder (LEFT) + Cursor + Search bar ──
  const folderX = 130;
  const folderY = 170;
  const folderSize = 130;
  drawFolder(ctx, folderX, folderY, folderSize, FOLDER.body, FOLDER.shadow);

  ctx.save();
  ctx.font = `600 20px ${SF}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Design/', folderX, folderY + folderSize * 0.78 / 2 + 14);
  ctx.restore();

  drawCursor(ctx, 208, 200, 38);
  drawClawdOutlined(ctx, folderX, folderY, 4, 'claude', 'wink', 1, 'rgba(0,0,0,0.35)');

  drawSearchBar(ctx, 512, 174, 520, 'Designing without Figma', FOLDER.body);

  // ── 2x2 card grid ──
  const gridStartX = 55;
  const gridStartY = 309;
  const gapX = 24;
  const gapY = 95;
  const tileW = 478;
  const tileH = 390;

  TILES.forEach((tile, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = gridStartX + col * (tileW + gapX);
    const ty = gridStartY + row * (tileH + gapY);

    // Card shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#1A1A2E';
    ctx.beginPath();
    ctx.roundRect(tx, ty, tileW, tileH, 14);
    ctx.fill();
    ctx.restore();

    // Card border
    ctx.strokeStyle = FOLDER.body + '70';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tx, ty, tileW, tileH, 14);
    ctx.stroke();

    // Draw the mockup clipped inside the card
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(tx + 1, ty + 1, tileW - 2, tileH - 2, 13);
    ctx.clip();
    tile.draw(ctx, tx, ty, tileW, tileH);
    ctx.restore();

    // Label below card
    ctx.save();
    ctx.font = `700 20px ${SF}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(tile.label, tx + tileW / 2, ty + tileH + 12);
    ctx.restore();
  });

  // Slide dots (index 5 for slide 6)
  drawSlideDots(ctx, 5, TOTAL_SLIDES, CH - 75);
}

export default function Slide6() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    renderSlide(ctx);
  }, []);

  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const dpr = 8;
      const offscreen = new OffscreenCanvas(CW * dpr, CH * dpr);
      const offCtx = offscreen.getContext('2d') as unknown as CanvasRenderingContext2D;
      offCtx.scale(dpr, dpr);
      renderSlide(offCtx);
      const blob = await offscreen.convertToBlob({ type: 'image/png' });
      await downloadBlob(blob, FILENAME);
    } catch (err) {
      console.error('[PNG export]', err);
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #F5F3EE 0%, #E8E4DB 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 56, paddingBottom: 48,
    }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{
          fontSize: 11, textTransform: 'uppercase', letterSpacing: 2,
          color: '#FF8F6B', fontFamily: SF, fontWeight: 600,
        }}>
          Claude Replaced Team -- Slide {SLIDE_NUM} of {TOTAL_SLIDES}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        style={{
          width: '100%', maxWidth: 500, height: 'auto',
          borderRadius: 16, display: 'block',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)',
        }}
      />

      <div style={{ marginTop: 24, width: '100%', maxWidth: 500, padding: '0 20px' }}>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            width: '100%', height: 52, borderRadius: 12, border: 'none',
            background: '#FF6B35', color: '#FFF',
            fontSize: 15, fontWeight: 700, fontFamily: SF,
            cursor: exporting ? 'default' : 'pointer',
          }}
        >
          {exporting ? 'Exporting PNG...' : `Export PNG  ${CW * 8} x ${CH * 8}`}
        </button>
      </div>

      <p style={{ marginTop: 14, fontSize: 11, color: 'rgba(0,0,0,0.3)', fontFamily: SF }}>
        <a href="/claude-replaced-team" style={{ color: 'inherit', textDecoration: 'none' }}>
          &larr; All slides
        </a>
        &nbsp; &middot; &nbsp; {CW} x {CH}
      </p>
    </div>
  );
}
