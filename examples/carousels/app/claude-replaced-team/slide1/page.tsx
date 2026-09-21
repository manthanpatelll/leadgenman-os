'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import { getClawdSize } from '@/lib/clawd';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawFolder, drawCursor, drawSlideDots,
  drawClawdOutlined, FOLDER_COLORS,
} from '../_shared';

const SLIDE_NUM = 1;
const FILENAME = 'claude-replaced-team-01.png';

// Layout math:
// Chrome: 78px. Dots: y=1310. Available = 1232px.
// Shift everything ~30px up from perfect center for visual balance
// Row 1 (top folders):     cy = 280
// Row 2 (Clawd + mid):    cy = 540
// Row 3 (bottom folders):  cy = 920
// Folders are BIG (140-160px) to fill space and feel dominant
// Each folder has a Clawd mascot with a matching expression
const FOLDERS = [
  { key: 'content',  cx: 250, cy: 276, size: 140, clawd: 'cool' },         // coder with sunglasses
  { key: 'code',     cx: 772, cy: 249, size: 150, clawd: 'happy' },        // content creator vibes
  { key: 'deploy',   cx: 212, cy: 609, size: 130, clawd: 'raising-arm' },  // shipping celebration
  { key: 'research', cx: 870, cy: 561, size: 138, clawd: 'pointing-right' }, // pointing
  { key: 'design',   cx: 256, cy: 1047, size: 142, clawd: 'wink' },       // design finesse
  { key: 'automate', cx: 878, cy: 987, size: 135, clawd: 'dancing' },     // automation joy
] as const;

function renderSlide(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH);

  // Cream background (matching reference)
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CW, CH);

  // macOS window chrome
  const contentY = drawWindowChrome(ctx, undefined, undefined, '#CD7B5A');

  // Draw folders with labels + a tiny Clawd mascot centered on each folder
  const miniClawdSize = 4;
  FOLDERS.forEach(({ key, cx, cy, size, clawd }) => {
    const folder = FOLDER_COLORS[key as keyof typeof FOLDER_COLORS];

    drawFolder(ctx, cx, cy, size, folder.body, folder.shadow);

    // Label below folder
    ctx.save();
    ctx.font = `600 20px ${SF}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(folder.label + '/', cx, cy + size * 0.78 / 2 + 14);
    ctx.restore();

    // Tiny Clawd centered on the folder
    drawClawdOutlined(ctx, cx, cy, miniClawdSize, 'claude', clawd, 1, 'rgba(0,0,0,0.35)');
  });

  // Main Clawd mascot in the center -- big and dominant
  const clawdX = 540;
  const clawdY = 525;
  const clawdPixelSize = 24;
  drawClawdOutlined(ctx, clawdX, clawdY, clawdPixelSize, 'claude', 'surprised', 2, 'rgba(0,0,0,0.5)');

  // Hook text below Clawd -- bold, dark, commanding
  const textX = 540;
  const hookY = 740;

  ctx.save();
  ctx.font = `800 56px ${SF}`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const lines = [
    'My Claude Code',
    'setup replaced',
    'a 5 person team',
  ];

  lines.forEach((line, i) => {
    ctx.fillText(line, textX, hookY + i * 68);
  });

  ctx.restore();

  // Cursor icon
  drawCursor(ctx, 649, 628, 44);

  // Slide dots at bottom
  drawSlideDots(ctx, 0, TOTAL_SLIDES, CH - 75);
}

export default function Slide1() {
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
          color: '#E8654A', fontFamily: SF, fontWeight: 600,
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
