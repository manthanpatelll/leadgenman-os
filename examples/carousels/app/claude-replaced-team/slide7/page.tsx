'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawFolder, drawCursor, drawSearchBar, drawSlideDots,
  drawClawdOutlined, FOLDER_COLORS,
} from '../_shared';
import { roundedRect } from '@/lib/drawing-utils';

const SLIDE_NUM = 7;
const FILENAME = 'claude-replaced-team-07.png';
const FOLDER = FOLDER_COLORS.automate;
const MONO = 'Menlo, Monaco, Consolas, monospace';

// ── Card 1: Hooks Config ──

function drawHooksConfig(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Dark editor background
  ctx.fillStyle = '#1A1A2E';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const headerH = 38;
  ctx.fillStyle = '#141425';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  // Tab
  ctx.fillStyle = '#1A1A2E';
  ctx.beginPath();
  ctx.roundRect(x + 12, y + 6, 140, headerH - 6, [6, 6, 0, 0]);
  ctx.fill();

  ctx.font = `400 13px ${MONO}`;
  ctx.fillStyle = '#8B949E';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('settings.json', x + 24, y + headerH / 2 + 2);

  // JSON content
  const pad = 18;
  let lineY = y + headerH + pad;
  const lineH = 20;

  const lines: Array<{ text: string; color: string; indent: number }> = [
    { text: '{', indent: 0, color: '#FEBC2E' },
    { text: '"hooks": {', indent: 1, color: '#58A6FF' },
    { text: '"PreToolUse": [', indent: 2, color: '#58A6FF' },
    { text: '{', indent: 3, color: '#FEBC2E' },
    { text: '"tool": "Write",', indent: 4, color: '#58A6FF' },
    { text: '"cmd": "eslint --fix $FILE"', indent: 4, color: '#3FB950' },
    { text: '},', indent: 3, color: '#FEBC2E' },
    { text: '{', indent: 3, color: '#FEBC2E' },
    { text: '"tool": "Bash",', indent: 4, color: '#58A6FF' },
    { text: '"cmd": "prettier --write"', indent: 4, color: '#3FB950' },
    { text: '}', indent: 3, color: '#FEBC2E' },
    { text: '],', indent: 2, color: '#58A6FF' },
    { text: '"PostToolUse": [', indent: 2, color: '#58A6FF' },
    { text: '{', indent: 3, color: '#FEBC2E' },
    { text: '"cmd": "vitest run"', indent: 4, color: '#3FB950' },
    { text: '}', indent: 3, color: '#FEBC2E' },
    { text: ']', indent: 2, color: '#58A6FF' },
    { text: '}', indent: 1, color: '#FEBC2E' },
    { text: '}', indent: 0, color: '#FEBC2E' },
  ];

  // Line numbers
  ctx.font = `400 13px ${MONO}`;
  lines.forEach((line, i) => {
    if (lineY > y + h - 10) return;
    // Line number
    ctx.fillStyle = '#444';
    ctx.textAlign = 'right';
    ctx.fillText(`${i + 1}`, x + 32, lineY);

    // Code
    ctx.textAlign = 'left';
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, x + 42 + line.indent * 14, lineY);
    lineY += lineH;
  });
}

// ── Card 2: MCP Server List ──

function drawMCPServers(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Header
  const headerH = 44;
  ctx.fillStyle = '#1A1A22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `700 16px ${SF}`;
  ctx.fillStyle = '#E6EDF3';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('MCP Servers', x + 20, y + headerH / 2);

  // Connected badge
  const badgeText = 'Connected';
  ctx.font = `600 11px ${SF}`;
  const badgeW = ctx.measureText(badgeText).width + 16;
  const badgeX = x + w - 20 - badgeW;
  const badgeY = y + headerH / 2 - 10;
  ctx.fillStyle = 'rgba(63, 185, 80, 0.15)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, 20, 10);
  ctx.fill();
  ctx.fillStyle = '#3FB950';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeW / 2, y + headerH / 2);

  // Server list
  const servers = [
    { name: 'Playwright', desc: 'Browser testing' },
    { name: 'Kapture', desc: 'Screenshots' },
    { name: 'Brave Search', desc: 'Web search' },
    { name: 'Supabase', desc: 'Database' },
    { name: 'Stripe', desc: 'Payments' },
  ];

  const rowH = 56;
  const startY = y + headerH + 14;

  servers.forEach((server, i) => {
    const rowY = startY + i * rowH;
    if (rowY + rowH > y + h - 4) return;

    // Subtle row divider
    if (i > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x + 16, rowY - 2, w - 32, 1);
    }

    // Green dot
    ctx.beginPath();
    ctx.arc(x + 28, rowY + rowH / 2 - 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#3FB950';
    ctx.fill();

    // Server name
    ctx.font = `600 15px ${SF}`;
    ctx.fillStyle = '#E6EDF3';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(server.name, x + 44, rowY + rowH / 2 - 10);

    // Description
    ctx.font = `400 13px ${SF}`;
    ctx.fillStyle = '#666';
    ctx.fillText(server.desc, x + 44, rowY + rowH / 2 + 10);
  });
}

// ── Card 3: Cron Jobs ──

function drawCronJobs(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0C0C0C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const headerH = 36;
  ctx.fillStyle = '#1C1C1C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  // Clock icon
  const clockX = x + 22;
  const clockY = y + headerH / 2;
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(clockX, clockY, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(clockX, clockY - 4);
  ctx.lineTo(clockX, clockY);
  ctx.lineTo(clockX + 3, clockY + 2);
  ctx.stroke();

  ctx.font = `500 13px ${SF}`;
  ctx.fillStyle = '#999';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Scheduled Tasks', clockX + 14, clockY);

  // Cron entries
  const pad = 18;
  let lineY = y + headerH + pad + 4;
  const lineH = 22;

  const entries = [
    { cron: '0 9 * * *', cmd: '/trends', desc: 'fetch daily trends', active: true },
    { cron: '0 0 * * 0', cmd: 'backup', desc: 'weekly DB backup', active: true },
    { cron: '*/30 * * * *', cmd: 'health', desc: 'health check', active: true },
    { cron: '0 18 * * 1-5', cmd: 'report', desc: 'daily analytics', active: true },
  ];

  ctx.font = `400 13px ${MONO}`;

  entries.forEach((entry, i) => {
    const entryStartY = lineY + i * (lineH * 3 + 16);
    if (entryStartY + lineH * 2 > y + h - 10) return;

    // Green active dot
    ctx.beginPath();
    ctx.arc(x + pad + 4, entryStartY + 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = entry.active ? '#3FB950' : '#555';
    ctx.fill();

    // Cron expression
    ctx.fillStyle = '#F5A623';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(entry.cron, x + pad + 16, entryStartY);

    // Command
    ctx.fillStyle = '#58A6FF';
    ctx.fillText(entry.cmd, x + pad + 16, entryStartY + lineH);

    // Description
    ctx.fillStyle = '#666';
    ctx.font = `400 12px ${SF}`;
    ctx.fillText('-- ' + entry.desc, x + pad + 16 + ctx.measureText(entry.cmd).width + 8, entryStartY + lineH);
    ctx.font = `400 13px ${MONO}`;

    // Separator line
    if (i < entries.length - 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(x + pad, entryStartY + lineH * 2 + 8, w - pad * 2, 1);
    }
  });
}

// ── Card 4: Git Auto-Commit Log ──

function drawAutoCommitLog(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0C0C0C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  // Title bar
  const headerH = 36;
  ctx.fillStyle = '#1C1C1C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, headerH, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `500 13px ${SF}`;
  ctx.fillStyle = '#999';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Terminal -- git log', x + w / 2, y + headerH / 2);

  const pad = 16;
  let lineY = y + headerH + pad;
  const lineH = 28;

  const commits = [
    { time: '10:41', hash: 'a3f2c1d', msg: 'NM-398: Init carousel hub' },
    { time: '10:42', hash: 'b7e4a2f', msg: 'NM-399: Add slide 1 cover' },
    { time: '10:43', hash: 'c9d1b3e', msg: 'NM-400: Fix title spacing' },
    { time: '10:44', hash: 'd2f5e4a', msg: 'NM-401: Add slide 2 cards' },
    { time: '10:44', hash: 'e8a3f5b', msg: 'NM-402: Fix card shadow' },
    { time: '10:45', hash: 'f1c6d7e', msg: 'NM-403: Add slide 3 layout' },
    { time: '10:46', hash: 'a4b8e9f', msg: 'NM-404: Update label font' },
    { time: '10:47', hash: 'b5d2f1a', msg: 'NM-405: Add slide 4 mockups' },
    { time: '10:48', hash: 'c7e3a2b', msg: 'NM-406: Fix grid alignment' },
    { time: '10:49', hash: 'd9f4b3c', msg: 'NM-407: Add slide 5 cards' },
  ];

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  commits.forEach((commit, i) => {
    if (lineY > y + h - 14) return;

    // Timestamp
    ctx.font = `400 12px ${MONO}`;
    ctx.fillStyle = '#555';
    ctx.fillText(commit.time, x + pad, lineY + 2);

    // Hash
    ctx.fillStyle = '#F5A623';
    ctx.fillText(commit.hash, x + pad + 48, lineY + 2);

    // Message
    ctx.font = `400 13px ${MONO}`;
    ctx.fillStyle = '#D0D0D8';
    const msgX = x + pad + 48 + 72;
    const maxMsgW = w - pad - (48 + 72 + pad);
    const msg = commit.msg;
    const measured = ctx.measureText(msg).width;
    if (measured > maxMsgW) {
      // Truncate
      let truncated = msg;
      while (ctx.measureText(truncated + '..').width > maxMsgW && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      ctx.fillText(truncated + '..', msgX, lineY + 2);
    } else {
      ctx.fillText(msg, msgX, lineY + 2);
    }

    // Subtle divider
    if (i < commits.length - 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(x + pad, lineY + lineH - 4, w - pad * 2, 1);
    }

    lineY += lineH;
  });
}

// ── Tile definitions ──

const TILES = [
  { label: 'Automated hooks', draw: drawHooksConfig },
  { label: 'MCP integrations', draw: drawMCPServers },
  { label: 'Scheduled automation', draw: drawCronJobs },
  { label: 'Auto-commit on every change', draw: drawAutoCommitLog },
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

  ctx.save();
  ctx.font = `600 20px ${SF}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Automate/', folderX, folderY + folderSize * 0.78 / 2 + 14);
  ctx.restore();

  // Cursor to the left of folder
  drawCursor(ctx, 832, 200, 38);
  drawClawdOutlined(ctx, folderX, folderY, 4, 'claude', 'dancing', 1, 'rgba(0,0,0,0.35)');

  // Search bar to the left
  drawSearchBar(ctx, 430, 174, 520, 'Set it and forget it', FOLDER.body);

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

  // Slide dots (index 6 for slide 7)
  drawSlideDots(ctx, 6, TOTAL_SLIDES, CH - 75);
}

export default function Slide7() {
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
          color: '#38C9BE', fontFamily: SF, fontWeight: 600,
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
            background: '#38C9BE', color: '#FFF',
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
