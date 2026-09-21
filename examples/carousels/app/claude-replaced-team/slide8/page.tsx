'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawSlideDots, drawClawdOutlined,
} from '../_shared';
import { getClawdSize } from '@/lib/clawd';
import { roundedRect } from '@/lib/drawing-utils';

const SLIDE_NUM = 8;
const FILENAME = 'claude-replaced-team-08.png';

function renderSlide(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CW, CH);

  const chromeH = drawWindowChrome(ctx);
  const dotsY = CH - 75;

  // Content zone: between chrome and dots
  const contentTop = chromeH;
  const contentBottom = dotsY - 30;
  const contentH = contentBottom - contentTop;
  const centerX = CW / 2;

  // Vertically center all elements
  // Elements: Clawd (clawdH) + gap(40) + "follow for more."(72px) + gap(36) + divider + gap(36)
  //         + "comment"(32px) + gap(24) + pill(~110px) + gap(24) + "for the full..."(32px) + gap(50) + icons(30px)
  const pixelSize = 30;
  const clawdDims = getClawdSize(pixelSize, 'happy');
  const clawdH = clawdDims.height;

  const totalBlockH =
    clawdH + 40 +   // Clawd + gap
    72 + 36 +        // "follow for more." + gap
    2 + 36 +         // divider + gap
    32 + 24 +        // "comment" + gap
    110 + 24 +       // pill + gap
    32 + 50 +        // "for the full..." + gap
    30;              // icons

  let y = contentTop + (contentH - totalBlockH) / 2;

  // ── 1. Clawd mascot ──
  drawClawdOutlined(
    ctx, centerX, y + clawdH / 2,
    pixelSize, 'claude', 'happy',
    2, 'rgba(0,0,0,0.5)'
  );
  y += clawdH + 40;

  // ── 2. "follow for more." ──
  ctx.save();
  ctx.font = `800 72px ${SF}`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('follow for more.', centerX, y);
  ctx.restore();
  y += 72 + 36;

  // ── 3. Thin divider line ──
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(centerX - 30, y, 60, 2);
  ctx.restore();
  y += 2 + 36;

  // ── 4. "comment" ──
  ctx.save();
  ctx.font = `500 32px ${SF}`;
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('comment', centerX, y);
  ctx.restore();
  y += 32 + 24;

  // ── 5. "SETUP" pill ──
  const pillText = '\u201CSETUP\u201D';
  const pillFont = `800 80px ${SF}`;
  ctx.save();
  ctx.font = pillFont;
  const pillTextW = ctx.measureText(pillText).width;
  ctx.restore();

  const pillPadX = 48;
  const pillPadY = 14;
  const pillW = pillTextW + pillPadX * 2;
  const pillH = 80 + pillPadY * 2; // text height + vertical padding
  const pillX = centerX - pillW / 2;
  const pillY = y;
  const pillR = 20;

  // Pill shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
  ctx.fill();
  ctx.restore();

  // Pill border
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
  ctx.stroke();
  ctx.restore();

  // Pill text
  ctx.save();
  ctx.font = pillFont;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pillText, centerX, pillY + pillH / 2);
  ctx.restore();

  y += pillH + 24;

  // ── 6. "for the full setup guide" ──
  ctx.save();
  ctx.font = `500 32px ${SF}`;
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('for the full setup guide', centerX, y);
  ctx.restore();
  y += 32 + 50;

  // ── 7. IG action icons ──
  const iconSize = 30;
  const iconGap = 80;
  const icons = [
    { draw: drawHeartIcon, color: '#FF6B35' },   // coral
    { draw: drawCommentIcon, color: '#28C840' },  // green
    { draw: drawShareIcon, color: '#8B5CF6' },    // purple
    { draw: drawBookmarkIcon, color: '#3B82F6' }, // blue
  ];
  const iconsW = (icons.length - 1) * iconGap;
  const iconsStartX = centerX - iconsW / 2;

  icons.forEach((icon, i) => {
    icon.draw(ctx, iconsStartX + i * iconGap, y, iconSize, icon.color);
  });

  // ── Slide dots ──
  drawSlideDots(ctx, TOTAL_SLIDES - 1, TOTAL_SLIDES, dotsY);
}

// ── Icon drawing functions ──

function drawHeartIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const s = size / 30;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(-1, -2, -8, -8, -13, -4);
  ctx.bezierCurveTo(-18, 0, -18, 8, -13, 12);
  ctx.lineTo(0, 22);
  ctx.lineTo(13, 12);
  ctx.bezierCurveTo(18, 8, 18, 0, 13, -4);
  ctx.bezierCurveTo(8, -8, 1, -2, 0, 4);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawCommentIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const s = size / 30;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  // Speech bubble
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(12, -8);
  ctx.quadraticCurveTo(16, -8, 16, -4);
  ctx.lineTo(16, 6);
  ctx.quadraticCurveTo(16, 10, 12, 10);
  ctx.lineTo(2, 10);
  ctx.lineTo(-4, 18);
  ctx.lineTo(-4, 10);
  ctx.lineTo(-12, 10);
  ctx.quadraticCurveTo(-16, 10, -16, 6);
  ctx.lineTo(-16, -4);
  ctx.quadraticCurveTo(-16, -8, -12, -8);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawShareIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = 'none';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const s = size / 30;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  // Paper plane / share
  ctx.beginPath();
  ctx.moveTo(-14, 2);
  ctx.lineTo(16, -10);
  ctx.lineTo(4, 18);
  ctx.lineTo(0, 6);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(16, -10);
  ctx.stroke();
  ctx.restore();
}

function drawBookmarkIcon(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const s = size / 30;
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.lineTo(-10, 16);
  ctx.lineTo(0, 8);
  ctx.lineTo(10, 16);
  ctx.lineTo(10, -12);
  ctx.quadraticCurveTo(10, -14, 8, -14);
  ctx.lineTo(-8, -14);
  ctx.quadraticCurveTo(-10, -14, -10, -12);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ── Component ──

export default function Slide8() {
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
