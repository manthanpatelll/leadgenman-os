'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawFolder, drawCursor, drawSearchBar, drawSlideDots,
  drawClawdOutlined, FOLDER_COLORS,
} from '../_shared';
import { roundedRect } from '@/lib/drawing-utils';

const SLIDE_NUM = 2;
const FILENAME = 'claude-replaced-team-02.png';
const FOLDER = FOLDER_COLORS.content;
const MONO = 'Menlo, Monaco, Consolas, monospace';

// ── Card 1: GitHub Repo ──

function drawGitHubRepo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // GitHub dark header bar
  const headerH = 42;
  ctx.fillStyle = '#161B22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  // GitHub icon
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + 26, y + headerH / 2, 10, 0, Math.PI * 2);
  ctx.fill();

  // Repo path
  ctx.font = `600 16px ${SF}`;
  ctx.fillStyle = '#58A6FF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('manthan / tiltit', x + 44, y + headerH / 2);

  // Star count
  ctx.fillStyle = '#8B949E';
  ctx.font = `500 14px ${SF}`;
  ctx.textAlign = 'right';
  ctx.fillText('142', x + w - 18, y + headerH / 2);

  // Star icon
  const starX = x + w - 46;
  const starY = y + headerH / 2;
  ctx.fillStyle = '#E3B341';
  ctx.beginPath();
  ctx.moveTo(starX, starY - 6);
  ctx.lineTo(starX + 2, starY - 2);
  ctx.lineTo(starX + 6, starY - 2);
  ctx.lineTo(starX + 3, starY + 1);
  ctx.lineTo(starX + 4, starY + 6);
  ctx.lineTo(starX, starY + 3);
  ctx.lineTo(starX - 4, starY + 6);
  ctx.lineTo(starX - 3, starY + 1);
  ctx.lineTo(starX - 6, starY - 2);
  ctx.lineTo(starX - 2, starY - 2);
  ctx.closePath();
  ctx.fill();

  // Content area
  const contentY = y + headerH;
  const contentH = h - headerH;
  ctx.fillStyle = '#0D1117';
  ctx.beginPath();
  ctx.roundRect(x, contentY, w, contentH, [0, 0, 10, 10]);
  ctx.fill();

  // Description
  ctx.font = `400 15px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Screen recordings to 3D videos', x + 20, contentY + 16);

  // File tree
  const files = [
    { name: 'app/', indent: 0 },
    { name: 'carousel-auto/', indent: 1 },
    { name: 'trends/', indent: 1 },
    { name: 'lib/', indent: 0 },
    { name: 'engine/', indent: 1 },
    { name: 'logos/', indent: 1 },
    { name: 'scripts/', indent: 0 },
    { name: 'sfx-engine/', indent: 1 },
    { name: 'CLAUDE.md', indent: 0 },
    { name: 'package.json', indent: 0 },
    { name: 'next.config.ts', indent: 0 },
    { name: 'tsconfig.json', indent: 0 },
  ];

  const fileStartY = contentY + 46;
  const lineH = 24;
  ctx.font = `400 14px ${MONO}`;

  files.forEach((file, i) => {
    if (fileStartY + i * lineH > y + h - 12) return;
    const isDir = file.name.endsWith('/');
    const fX = x + 20 + file.indent * 22;
    const fY = fileStartY + i * lineH;

    // Folder/file icon
    ctx.fillStyle = isDir ? '#54AEFF' : '#8B949E';
    if (isDir) {
      ctx.fillRect(fX, fY + 3, 10, 2);
      ctx.fillRect(fX, fY + 4, 14, 10);
    } else {
      ctx.fillRect(fX + 1, fY + 1, 10, 13);
      ctx.fillStyle = '#0D1117';
      ctx.fillRect(fX + 2.5, fY + 2.5, 7, 10);
      ctx.fillStyle = '#8B949E';
    }

    ctx.fillStyle = isDir ? '#E6EDF3' : '#8B949E';
    ctx.fillText(file.name, fX + 20, fY + 1);
  });
}

// ── Card 2: Claude Code session ──

function drawClaudeCode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#1A1A2E';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;
  let lineY = y + pad;
  const lineH = 22;

  // Title bar dots
  const dotColors = ['#FF5F57', '#FEBC2E', '#28C840'];
  dotColors.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(x + pad + i * 18, lineY + 2, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  lineY += 28;

  ctx.font = `400 14px ${MONO}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // $ claude
  ctx.fillStyle = '#888';
  ctx.fillText('$', x + pad, lineY);
  ctx.fillStyle = '#C8A2F8';
  ctx.fillText(' claude', x + pad + 14, lineY);
  lineY += lineH + 4;

  // Claude branding
  ctx.fillStyle = '#D97757';
  ctx.fillText('Claude Code', x + pad, lineY);
  ctx.fillStyle = '#666';
  ctx.fillText(' v1.0.23', x + pad + 100, lineY);
  lineY += lineH + 8;

  // User prompt
  ctx.fillStyle = '#C8A2F8';
  ctx.fillText('>', x + pad, lineY);
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText(' /new-series', x + pad + 14, lineY);
  lineY += lineH + 8;

  // Tool calls
  const tools = [
    { icon: 'Read', file: 'content-strategy.md', color: '#58A6FF' },
    { icon: 'WebSearch', file: '"claude code trends"', color: '#3FB950' },
    { icon: 'Write', file: 'app/carousel/slide1.tsx', color: '#F5A623' },
    { icon: 'Agent', file: 'building slides 2-8...', color: '#D97757' },
  ];

  tools.forEach(tool => {
    if (lineY > y + h - 50) return;
    ctx.fillStyle = tool.color;
    ctx.fillText(tool.icon, x + pad + 8, lineY);
    ctx.fillStyle = '#999';
    ctx.fillText(` ${tool.file}`, x + pad + 8 + ctx.measureText(tool.icon).width, lineY);
    lineY += lineH;
  });

  // Progress
  lineY += 10;
  ctx.fillStyle = '#3FB950';
  ctx.fillText('  4/8 slides built', x + pad + 8, lineY);

  lineY += lineH + 4;
  const barW = w - pad * 2 - 16;
  ctx.fillStyle = '#333';
  roundedRect(ctx, x + pad + 8, lineY, barW, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#3FB950';
  roundedRect(ctx, x + pad + 8, lineY, barW * 0.5, 6, 3);
  ctx.fill();
}

// ── Card 3: Terminal (SFX Engine) ──

function drawTerminal(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0C0C0C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;
  const lineH = 22;

  // Title bar
  ctx.fillStyle = '#282828';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 34, [10, 10, 0, 0]);
  ctx.fill();
  ctx.font = `500 13px ${SF}`;
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.fillText('Terminal -- zsh', x + w / 2, y + 19);
  ctx.textAlign = 'left';

  let lineY = y + 48;
  ctx.font = `400 13.5px ${MONO}`;

  // Command
  ctx.fillStyle = '#3FB950';
  ctx.fillText('manthan@mac', x + pad, lineY);
  ctx.fillStyle = '#888';
  ctx.fillText(' ~/tiltit', x + pad + ctx.measureText('manthan@mac').width, lineY);
  lineY += lineH;
  ctx.fillStyle = '#58A6FF';
  ctx.fillText('$ ', x + pad, lineY);
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText('python scripts/sfx-engine/', x + pad + 16, lineY);
  lineY += lineH;
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText('  build_sfx_track.py \\', x + pad + 16, lineY);
  lineY += lineH;
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText('    --video reel-part3.mp4', x + pad + 16, lineY);
  lineY += lineH + 8;

  // Output
  const outputs = [
    { text: '[whisper] Transcribing audio...', color: '#F5A623' },
    { text: '[whisper] Found 12 segments (34.2s)', color: '#888' },
    { text: '[sfx]    Mapping sound effects...', color: '#F5A623' },
    { text: '  0.8s  whoosh_smooth.wav', color: '#58A6FF' },
    { text: '  2.1s  textdigitalreadout.wav', color: '#58A6FF' },
    { text: '  4.5s  textdigitalreadout.wav', color: '#58A6FF' },
    { text: '  7.2s  whoosh_smooth.wav', color: '#58A6FF' },
    { text: '  9.8s  textdigitalreadout.wav', color: '#58A6FF' },
    { text: '[done]   SFX track: sfx_output.wav', color: '#3FB950' },
  ];

  outputs.forEach(line => {
    if (lineY > y + h - 14) return;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, x + pad, lineY);
    lineY += lineH;
  });
}

// ── Card 4: UI -- Trends Dashboard ──

function drawTrendsDashboard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header bar
  ctx.fillStyle = '#1A1A22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 40, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `800 15px ${SF}`;
  ctx.fillStyle = '#FF6B35';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TREND RADAR', x + pad, y + 21);

  ctx.fillStyle = '#555';
  ctx.font = `400 12px ${SF}`;
  ctx.textAlign = 'right';
  ctx.fillText('Apr 7, 2026', x + w - pad, y + 21);

  // Table header
  const tableY = y + 56;
  ctx.font = `600 13px ${SF}`;
  ctx.fillStyle = '#666';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Keyword', x + pad, tableY);
  ctx.fillText('Score', x + w * 0.52, tableY);
  ctx.fillText('Velocity', x + w * 0.70, tableY);

  // Divider
  ctx.fillStyle = '#2A2A35';
  ctx.fillRect(x + pad, tableY + 20, w - pad * 2, 1);

  // Data rows
  const rows = [
    { keyword: 'Claude AI', score: '53', velocity: 'Rising', vColor: '#3FB950' },
    { keyword: 'Claude Code', score: '42', velocity: 'Rising', vColor: '#3FB950' },
    { keyword: 'AI tools', score: '31', velocity: 'Declining', vColor: '#F85149' },
    { keyword: 'Cursor AI', score: '5', velocity: 'Declining', vColor: '#F85149' },
    { keyword: 'React', score: '48', velocity: 'Stable', vColor: '#888' },
    { keyword: 'MCP servers', score: '1', velocity: 'Declining', vColor: '#F85149' },
    { keyword: 'Vercel', score: '10', velocity: 'Declining', vColor: '#F85149' },
    { keyword: 'Next.js', score: '7', velocity: 'Declining', vColor: '#F85149' },
  ];

  ctx.font = `400 14px ${SF}`;
  rows.forEach((row, i) => {
    const rowY = tableY + 28 + i * 30;
    if (rowY > y + h - 20) return;

    // Subtle row stripe
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(x + 4, rowY - 4, w - 8, 26);
    }

    ctx.fillStyle = '#D0D0D8';
    ctx.textAlign = 'left';
    ctx.fillText(row.keyword, x + pad, rowY);

    // Score
    ctx.fillStyle = '#AAA';
    ctx.fillText(row.score, x + w * 0.52, rowY);

    // Mini bar
    const barX = x + w * 0.52 + 30;
    const barMaxW = 50;
    const barH = 6;
    ctx.fillStyle = '#2A2A35';
    roundedRect(ctx, barX, rowY + 5, barMaxW, barH, 3);
    ctx.fill();
    ctx.fillStyle = row.vColor;
    roundedRect(ctx, barX, rowY + 5, barMaxW * (parseInt(row.score) / 53), barH, 3);
    ctx.fill();

    // Velocity
    ctx.fillStyle = row.vColor;
    ctx.font = `500 13px ${SF}`;
    ctx.fillText(row.velocity, x + w * 0.70, rowY);
    ctx.font = `400 14px ${SF}`;
  });

  // Bottom accent bar
  ctx.fillStyle = '#FF6B35';
  roundedRect(ctx, x + pad, y + h - 20, 60, 4, 2);
  ctx.fill();
  ctx.fillStyle = '#2A2A35';
  roundedRect(ctx, x + pad + 68, y + h - 20, 36, 4, 2);
  ctx.fill();
}

// ── Tile definitions ──

const TILES = [
  { label: 'Content codebase', draw: drawGitHubRepo },
  { label: 'AI content generation', draw: drawClaudeCode },
  { label: 'Automated sound design', draw: drawTerminal },
  { label: 'Trend research', draw: drawTrendsDashboard },
];

// ── Main render ──

function renderSlide(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CW, CH);

  drawWindowChrome(ctx, undefined, undefined, FOLDER.body);

  // ── Row 1: Folder + Search bar on the same line ──
  const folderX = 130;
  const folderY = 170;
  const folderSize = 130;
  drawFolder(ctx, folderX, folderY, folderSize, FOLDER.body, FOLDER.shadow);

  ctx.save();
  ctx.font = `600 20px ${SF}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Content/', folderX, folderY + folderSize * 0.78 / 2 + 14);
  ctx.restore();

  drawCursor(ctx, 208, 200, 38);
  drawClawdOutlined(ctx, folderX, folderY, 4, 'claude', 'cool', 1, 'rgba(0,0,0,0.35)');

  drawSearchBar(ctx, 512, 174, 520, 'AI content pipeline', FOLDER.body);

  // ── 2x2 card grid ──
  // From simulator: startX=55, gapX=24, gapY=95
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

    // Card shadow -- stronger for dark cards
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

    // Label below card -- bold, clear
    ctx.save();
    ctx.font = `700 20px ${SF}`;
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(tile.label, tx + tileW / 2, ty + tileH + 12);
    ctx.restore();
  });

  // Slide dots
  drawSlideDots(ctx, 1, TOTAL_SLIDES, CH - 75);
}

export default function Slide2() {
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
