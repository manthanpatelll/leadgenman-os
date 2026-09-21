'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawFolder, drawCursor, drawSearchBar, drawSlideDots,
  drawClawdOutlined, FOLDER_COLORS,
} from '../_shared';
import { roundedRect } from '@/lib/drawing-utils';

const SLIDE_NUM = 3;
const FILENAME = 'claude-replaced-team-03.png';
const FOLDER = FOLDER_COLORS.code;
const MONO = 'Menlo, Monaco, Consolas, monospace';

// ── Card 1: VS Code Editor (Zustand store) ──

function drawVSCodeEditor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Dark editor background
  ctx.fillStyle = '#1E1E1E';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const titleH = 38;
  ctx.fillStyle = '#2D2D2D';
  ctx.beginPath();
  ctx.roundRect(x, y, w, titleH, [10, 10, 0, 0]);
  ctx.fill();

  // Traffic light dots
  const dotColors = ['#FF5F57', '#FEBC2E', '#28C840'];
  dotColors.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(x + 18 + i * 18, y + titleH / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  // Filename tab
  ctx.fillStyle = '#1E1E1E';
  ctx.fillRect(x + 76, y + 6, 150, titleH - 6);
  ctx.font = `400 13px ${MONO}`;
  ctx.fillStyle = '#CCCCCC';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('editor-store.ts', x + 86, y + titleH / 2 + 2);

  // Code lines
  const pad = 16;
  const lineH = 23;
  let lineY = y + titleH + 14;
  ctx.textBaseline = 'top';

  const codeLines: Array<Array<{ text: string; color: string }>> = [
    [
      { text: 'import', color: '#C586C0' },
      { text: ' { create } ', color: '#D4D4D4' },
      { text: 'from', color: '#C586C0' },
      { text: " 'zustand'", color: '#CE9178' },
    ],
    [
      { text: 'import', color: '#C586C0' },
      { text: ' { subscribeWithSelector }', color: '#D4D4D4' },
    ],
    [
      { text: '  ', color: '#D4D4D4' },
      { text: 'from', color: '#C586C0' },
      { text: " 'zustand/middleware'", color: '#CE9178' },
    ],
    [],
    [
      { text: 'interface', color: '#569CD6' },
      { text: ' EditorState', color: '#4EC9B0' },
      { text: ' {', color: '#D4D4D4' },
    ],
    [
      { text: '  activeTemplate', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: 'string', color: '#4EC9B0' },
    ],
    [
      { text: '  fieldValues', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: 'Record', color: '#4EC9B0' },
      { text: '<', color: '#D4D4D4' },
      { text: 'string', color: '#4EC9B0' },
      { text: ', ', color: '#D4D4D4' },
      { text: 'string', color: '#4EC9B0' },
      { text: '>', color: '#D4D4D4' },
    ],
    [
      { text: '  isPlaying', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: 'boolean', color: '#4EC9B0' },
    ],
    [
      { text: '  exportFormat', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: "'mp4'", color: '#CE9178' },
      { text: ' | ', color: '#D4D4D4' },
      { text: "'gif'", color: '#CE9178' },
    ],
    [
      { text: '}', color: '#D4D4D4' },
    ],
    [],
    [
      { text: 'export', color: '#C586C0' },
      { text: ' const', color: '#569CD6' },
      { text: ' useEditorStore', color: '#DCDCAA' },
      { text: ' =', color: '#D4D4D4' },
    ],
    [
      { text: '  create', color: '#DCDCAA' },
      { text: '<', color: '#D4D4D4' },
      { text: 'EditorState', color: '#4EC9B0' },
      { text: '>()(', color: '#D4D4D4' },
    ],
  ];

  ctx.font = `400 14px ${MONO}`;

  codeLines.forEach((tokens, i) => {
    if (lineY + i * lineH > y + h - 12) return;
    const currentY = lineY + i * lineH;

    // Line number
    ctx.fillStyle = '#858585';
    ctx.textAlign = 'right';
    ctx.fillText(String(i + 1), x + pad + 20, currentY);
    ctx.textAlign = 'left';

    // Code tokens
    let curX = x + pad + 32;
    tokens.forEach(token => {
      ctx.fillStyle = token.color;
      ctx.fillText(token.text, curX, currentY);
      curX += ctx.measureText(token.text).width;
    });
  });
}

// ── Card 2: Git Log Terminal ──

function drawGitLog(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0C0C0C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const titleH = 34;
  ctx.fillStyle = '#282828';
  ctx.beginPath();
  ctx.roundRect(x, y, w, titleH, [10, 10, 0, 0]);
  ctx.fill();
  ctx.font = `500 13px ${SF}`;
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Terminal -- zsh', x + w / 2, y + titleH / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const pad = 16;
  let lineY = y + titleH + 14;
  const lineH = 22;

  // Command line
  ctx.font = `400 14px ${MONO}`;
  ctx.fillStyle = '#3FB950';
  ctx.fillText('manthan@mac', x + pad, lineY);
  ctx.fillStyle = '#888';
  ctx.fillText(' ~/tiltit', x + pad + ctx.measureText('manthan@mac').width, lineY);
  lineY += lineH;
  ctx.fillStyle = '#58A6FF';
  ctx.fillText('$ ', x + pad, lineY);
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText('git log --oneline', x + pad + 16, lineY);
  lineY += lineH + 8;

  // Git log entries
  const commits = [
    { hash: 'a5ea66f', msg: 'NM-405: Add carousel slide 3' },
    { hash: 'c6d0047', msg: 'NM-404: Redesign trash icon' },
    { hash: '556c4c0', msg: 'NM-403: Add no-more slide' },
    { hash: 'cad54fe', msg: 'NM-402: Add design process' },
    { hash: '0640160', msg: 'NM-401: Add brand logos' },
    { hash: 'f3b2a19', msg: 'NM-400: Fix export pipeline' },
    { hash: 'e8c4d01', msg: 'NM-399: Add spring physics' },
    { hash: 'd2a1b33', msg: 'NM-398: Canvas DPI scaling' },
    { hash: 'b7f0e42', msg: 'NM-397: Zustand store setup' },
    { hash: '91a3c58', msg: 'NM-396: Template registry' },
  ];

  ctx.font = `400 14px ${MONO}`;
  commits.forEach(commit => {
    if (lineY > y + h - 14) return;
    ctx.fillStyle = '#E3B341';
    ctx.fillText(commit.hash, x + pad, lineY);
    ctx.fillStyle = '#E6EDF3';
    ctx.fillText(` ${commit.msg}`, x + pad + ctx.measureText(commit.hash).width, lineY);
    lineY += lineH;
  });
}

// ── Card 3: Test Runner (Playwright) ──

function drawTestRunner(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0D1117';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const titleH = 34;
  ctx.fillStyle = '#161B22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, titleH, [10, 10, 0, 0]);
  ctx.fill();
  ctx.font = `500 13px ${SF}`;
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Terminal -- zsh', x + w / 2, y + titleH / 2 + 1);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const pad = 16;
  let lineY = y + titleH + 14;
  const lineH = 22;

  // Command
  ctx.font = `400 14px ${MONO}`;
  ctx.fillStyle = '#58A6FF';
  ctx.fillText('$ ', x + pad, lineY);
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText('npx playwright test', x + pad + 16, lineY);
  lineY += lineH + 8;

  // Header
  ctx.fillStyle = '#8B949E';
  ctx.font = `400 13px ${MONO}`;
  ctx.fillText('Running 31 tests using 1 worker', x + pad, lineY);
  lineY += lineH + 4;

  // Test results
  const tests = [
    'homepage renders correctly',
    'template selector works',
    'canvas preview loads',
    'field editor updates state',
    'export modal opens',
    'MP4 export completes',
    'GIF export completes',
    'device frame renders',
    'spring animation smooth',
    'watermark overlay applies',
    'DPI scaling correct',
    'template registry loads',
  ];

  ctx.font = `400 13px ${MONO}`;
  tests.forEach(test => {
    if (lineY > y + h - 54) return;
    ctx.fillStyle = '#3FB950';
    ctx.fillText('\u2713', x + pad, lineY);
    ctx.fillStyle = '#C9D1D9';
    ctx.fillText(` ${test}`, x + pad + 14, lineY);
    lineY += lineH;
  });

  // Summary
  lineY = y + h - 40;
  ctx.fillStyle = '#1A2332';
  ctx.fillRect(x + 4, lineY - 6, w - 8, 36);

  ctx.font = `700 14px ${MONO}`;
  ctx.fillStyle = '#3FB950';
  ctx.fillText('  31 passed', x + pad, lineY + 4);
  ctx.fillStyle = '#8B949E';
  ctx.font = `400 14px ${MONO}`;
  ctx.fillText(' (37s)', x + pad + ctx.measureText('  31 passed').width + 4, lineY + 4);
}

// ── Card 4: Package.json Viewer ──

function drawPackageJson(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#1A1A2E';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const titleH = 38;
  ctx.fillStyle = '#252540';
  ctx.beginPath();
  ctx.roundRect(x, y, w, titleH, [10, 10, 0, 0]);
  ctx.fill();

  // Traffic light dots
  const dotColors = ['#FF5F57', '#FEBC2E', '#28C840'];
  dotColors.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(x + 18 + i * 18, y + titleH / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  // Filename
  ctx.fillStyle = '#1A1A2E';
  ctx.fillRect(x + 76, y + 6, 140, titleH - 6);
  ctx.font = `400 13px ${MONO}`;
  ctx.fillStyle = '#CCCCCC';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('package.json', x + 86, y + titleH / 2 + 2);
  ctx.textBaseline = 'top';

  const pad = 16;
  let lineY = y + titleH + 14;
  const lineH = 22;

  // JSON content with syntax highlighting
  const jsonLines: Array<Array<{ text: string; color: string }>> = [
    [{ text: '{', color: '#D4D4D4' }],
    [
      { text: '  "name"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"tiltit"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '  "dependencies"', color: '#9CDCFE' },
      { text: ': {', color: '#D4D4D4' },
    ],
    [
      { text: '    "next"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"15.2.4"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "react"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"19.0.0"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "zustand"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"5.0.3"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "stripe"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"17.5.0"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "@supabase/ssr"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"0.6.1"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "tailwindcss"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"4.0.0"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "@phosphor-icons"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"2.1.7"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "gifenc"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"1.0.3"', color: '#CE9178' },
      { text: ',', color: '#D4D4D4' },
    ],
    [
      { text: '    "posthog-js"', color: '#9CDCFE' },
      { text: ': ', color: '#D4D4D4' },
      { text: '"1.194.0"', color: '#CE9178' },
    ],
    [
      { text: '  }', color: '#D4D4D4' },
    ],
    [{ text: '}', color: '#D4D4D4' }],
  ];

  ctx.font = `400 14px ${MONO}`;

  jsonLines.forEach((tokens, i) => {
    const currentY = lineY + i * lineH;
    if (currentY > y + h - 12) return;

    let curX = x + pad;
    tokens.forEach(token => {
      ctx.fillStyle = token.color;
      ctx.fillText(token.text, curX, currentY);
      curX += ctx.measureText(token.text).width;
    });
  });
}

// ── Tile definitions ──

const TILES = [
  { label: 'Type-safe state management', draw: drawVSCodeEditor },
  { label: 'Auto-commit after every change', draw: drawGitLog },
  { label: 'E2E testing with Playwright', draw: drawTestRunner },
  { label: 'Battle-tested stack', draw: drawPackageJson },
];

// ── Main render ──

function renderSlide(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CW, CH);

  drawWindowChrome(ctx, undefined, undefined, FOLDER.body);

  // ── Row 1: Folder on RIGHT side + Search bar on the left ──
  const folderX = 920;
  const folderY = 170;
  const folderSize = 130;
  drawFolder(ctx, folderX, folderY, folderSize, FOLDER.body, FOLDER.shadow);

  // Folder label
  ctx.save();
  ctx.font = `600 20px ${SF}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Code/', folderX, folderY + folderSize * 0.78 / 2 + 14);
  ctx.restore();

  // Cursor to the LEFT of the folder
  drawCursor(ctx, 830, 200, 38);
  drawClawdOutlined(ctx, folderX, folderY, 4, 'claude', 'happy', 1, 'rgba(0,0,0,0.35)');

  // Search bar to the left of the folder
  drawSearchBar(ctx, 440, 174, 520, 'Claude Code dev workflow', FOLDER.body);

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

  // Slide dots (index 2 = third slide)
  drawSlideDots(ctx, 2, TOTAL_SLIDES, CH - 75);
}

export default function Slide3() {
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
          color: '#F5A623', fontFamily: SF, fontWeight: 600,
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
            background: '#F5A623', color: '#FFF',
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
