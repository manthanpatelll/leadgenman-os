'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawFolder, drawCursor, drawSearchBar, drawSlideDots,
  drawClawdOutlined, FOLDER_COLORS,
} from '../_shared';
import { roundedRect } from '@/lib/drawing-utils';

const SLIDE_NUM = 5;
const FILENAME = 'claude-replaced-team-05.png';
const FOLDER = FOLDER_COLORS.research;
const MONO = 'Menlo, Monaco, Consolas, monospace';

// ── Card 1: Web Search Results ──

function drawWebSearch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Dark background
  ctx.fillStyle = '#0D1117';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header bar
  ctx.fillStyle = '#161B22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 42, [10, 10, 0, 0]);
  ctx.fill();

  // Header text
  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#58A6FF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WebSearch', x + pad, y + 21);

  // Search icon
  ctx.strokeStyle = '#58A6FF';
  ctx.lineWidth = 2;
  const sX = x + w - 38;
  const sY = y + 21;
  ctx.beginPath();
  ctx.arc(sX, sY - 1, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sX + 5, sY + 4);
  ctx.lineTo(sX + 8, sY + 7);
  ctx.stroke();

  // Search results
  const results = [
    {
      title: 'Claude Code MCP setup guide',
      url: 'anthropic.com/docs/claude-code',
      desc: 'Complete guide to setting up Model Context Protocol servers with Claude...',
    },
    {
      title: 'Spring physics for Canvas 2D',
      url: 'developer.mozilla.org/canvas',
      desc: 'Implementing damped harmonic oscillator for smooth UI animations...',
    },
    {
      title: 'WebCodecs MP4 export pipeline',
      url: 'github.com/nickel-org/mediabunny',
      desc: 'Zero-copy frame capture with OffscreenCanvas and VideoEncoder API...',
    },
    {
      title: 'Instagram carousel dimensions',
      url: 'help.instagram.com/post-specs',
      desc: '1080x1350 (4:5) optimal carousel size, safe zones for text placement...',
    },
  ];

  let resultY = y + 56;
  ctx.textBaseline = 'top';

  results.forEach((r, i) => {
    if (resultY > y + h - 40) return;

    // Blue title
    ctx.font = `600 14px ${SF}`;
    ctx.fillStyle = '#58A6FF';
    ctx.textAlign = 'left';
    ctx.fillText(r.title, x + pad, resultY);

    // Green URL
    ctx.font = `400 11px ${MONO}`;
    ctx.fillStyle = '#3FB950';
    ctx.fillText(r.url, x + pad, resultY + 20);

    // Gray description
    ctx.font = `400 12px ${SF}`;
    ctx.fillStyle = '#6E7681';
    const maxDescW = w - pad * 2;
    const descText = r.desc.length > 60 ? r.desc.slice(0, 60) + '...' : r.desc;
    ctx.fillText(descText, x + pad, resultY + 36);

    // Divider
    if (i < results.length - 1) {
      ctx.fillStyle = '#21262D';
      ctx.fillRect(x + pad, resultY + 56, w - pad * 2, 1);
    }

    resultY += 70;
  });
}

// ── Card 2: Google Trends Chart ──

function drawGoogleTrends(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header bar
  ctx.fillStyle = '#1A1A22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 42, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#D97757';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Google Trends', x + pad, y + 21);

  // Date range
  ctx.font = `400 12px ${SF}`;
  ctx.fillStyle = '#555';
  ctx.textAlign = 'right';
  ctx.fillText('Jan -- Apr 2026', x + w - pad, y + 21);

  // Chart area
  const chartX = x + pad + 30;
  const chartY = y + 62;
  const chartW = w - pad * 2 - 35;
  const chartH = h - 150;

  // Y-axis labels
  ctx.font = `400 11px ${MONO}`;
  ctx.fillStyle = '#555';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yLabels = ['100', '75', '50', '25', '0'];
  yLabels.forEach((label, i) => {
    const ly = chartY + (chartH / 4) * i;
    ctx.fillText(label, chartX - 8, ly);
    // Grid line
    ctx.fillStyle = '#1E1E28';
    ctx.fillRect(chartX, ly, chartW, 1);
    ctx.fillStyle = '#555';
  });

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  months.forEach((m, i) => {
    ctx.fillText(m, chartX + (chartW / 3) * i, chartY + chartH + 8);
  });

  // Claude AI line (rising) -- coral
  const claudePoints = [
    [0, 0.35], [0.2, 0.42], [0.4, 0.55], [0.55, 0.62],
    [0.7, 0.78], [0.85, 0.88], [1.0, 0.95],
  ];

  // Area fill for Claude
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(chartX, chartY + chartH);
  claudePoints.forEach(([px, py]) => {
    ctx.lineTo(chartX + px * chartW, chartY + chartH * (1 - py));
  });
  ctx.lineTo(chartX + chartW, chartY + chartH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(217, 119, 87, 0.15)';
  ctx.fill();
  ctx.restore();

  // Claude line
  ctx.strokeStyle = '#D97757';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  claudePoints.forEach(([px, py], i) => {
    const lx = chartX + px * chartW;
    const ly = chartY + chartH * (1 - py);
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  });
  ctx.stroke();

  // Cursor line (declining) -- gray/blue
  const cursorPoints = [
    [0, 0.72], [0.15, 0.68], [0.3, 0.58], [0.5, 0.45],
    [0.65, 0.38], [0.8, 0.30], [1.0, 0.22],
  ];

  // Area fill for Cursor
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(chartX, chartY + chartH);
  cursorPoints.forEach(([px, py]) => {
    ctx.lineTo(chartX + px * chartW, chartY + chartH * (1 - py));
  });
  ctx.lineTo(chartX + chartW, chartY + chartH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(88, 166, 255, 0.08)';
  ctx.fill();
  ctx.restore();

  // Cursor line
  ctx.strokeStyle = '#58A6FF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  cursorPoints.forEach(([px, py], i) => {
    const lx = chartX + px * chartW;
    const ly = chartY + chartH * (1 - py);
    if (i === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  });
  ctx.stroke();

  // Legend
  const legendY = chartY + chartH + 32;
  const legendCenterX = x + w / 2;

  // Claude AI legend
  ctx.fillStyle = '#D97757';
  roundedRect(ctx, legendCenterX - 100, legendY, 12, 12, 3);
  ctx.fill();
  ctx.font = `600 13px ${SF}`;
  ctx.fillStyle = '#CCC';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Claude AI', legendCenterX - 84, legendY + 6);

  // Cursor legend
  ctx.fillStyle = '#58A6FF';
  roundedRect(ctx, legendCenterX + 20, legendY, 12, 12, 3);
  ctx.fill();
  ctx.fillStyle = '#CCC';
  ctx.fillText('Cursor', legendCenterX + 36, legendY + 6);
}

// ── Card 3: Hacker News Scraper ──

function drawHackerNews(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0D1117';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header bar
  ctx.fillStyle = '#161B22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 42, [10, 10, 0, 0]);
  ctx.fill();

  // HN orange icon
  ctx.fillStyle = '#FF6600';
  roundedRect(ctx, x + pad, y + 12, 18, 18, 3);
  ctx.fill();
  ctx.font = `800 12px ${SF}`;
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Y', x + pad + 9, y + 22);

  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#FF6600';
  ctx.textAlign = 'left';
  ctx.fillText('Hacker News', x + pad + 24, y + 21);

  // Posts
  const posts = [
    { title: 'Claude Code replaces junior devs at YC startup', pts: 863, comments: 412 },
    { title: 'Show HN: I built a SaaS with only AI agents', pts: 846, comments: 389 },
    { title: 'MCP is the new API -- why tool use matters', pts: 724, comments: 291 },
    { title: 'Spring physics make UI animations feel alive', pts: 531, comments: 178 },
    { title: 'WebCodecs API: browser-native video encoding', pts: 498, comments: 156 },
    { title: 'The death of the 5-person startup team', pts: 445, comments: 342 },
  ];

  let postY = y + 58;
  ctx.textBaseline = 'top';

  posts.forEach((post, i) => {
    if (postY > y + h - 30) return;

    // Rank number
    ctx.font = `600 13px ${MONO}`;
    ctx.fillStyle = '#484F58';
    ctx.textAlign = 'right';
    ctx.fillText(`${i + 1}.`, x + pad + 18, postY + 1);

    // Arrow
    ctx.fillStyle = '#FF6600';
    ctx.beginPath();
    ctx.moveTo(x + pad + 24, postY + 10);
    ctx.lineTo(x + pad + 30, postY + 2);
    ctx.lineTo(x + pad + 36, postY + 10);
    ctx.closePath();
    ctx.fill();

    // Title
    ctx.font = `500 13px ${SF}`;
    ctx.fillStyle = '#C9D1D9';
    ctx.textAlign = 'left';
    const maxTitleW = w - pad * 2 - 44;
    const title = ctx.measureText(post.title).width > maxTitleW
      ? post.title.slice(0, 38) + '...'
      : post.title;
    ctx.fillText(title, x + pad + 42, postY);

    // Points + comments
    ctx.font = `400 11px ${SF}`;
    ctx.fillStyle = '#FF6600';
    ctx.fillText(`${post.pts} pts`, x + pad + 42, postY + 20);
    ctx.fillStyle = '#484F58';
    ctx.fillText(`  |  ${post.comments} comments`, x + pad + 42 + ctx.measureText(`${post.pts} pts`).width, postY + 20);

    postY += 48;
  });
}

// ── Card 4: Competitor Analysis Table ──

function drawCompetitorAnalysis(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#111118';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header bar
  ctx.fillStyle = '#1A1A22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 42, [10, 10, 0, 0]);
  ctx.fill();

  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#CCC';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Competitive Intelligence', x + pad, y + 21);

  // Table columns
  const colX = {
    tool: x + pad,
    price: x + w * 0.42,
    users: x + w * 0.60,
    rating: x + w * 0.78,
  };

  // Table header
  const headerY = y + 58;
  ctx.font = `600 12px ${SF}`;
  ctx.fillStyle = '#6E7681';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('Tool', colX.tool, headerY);
  ctx.fillText('Price', colX.price, headerY);
  ctx.fillText('Users', colX.users, headerY);
  ctx.fillText('Rating', colX.rating, headerY);

  // Divider
  ctx.fillStyle = '#21262D';
  ctx.fillRect(x + pad, headerY + 20, w - pad * 2, 1);

  // Competitor rows
  const competitors = [
    { tool: 'Canva', price: '$13/mo', users: '190M', rating: '4.7', highlight: false },
    { tool: 'Rotato', price: '$99/yr', users: '12K', rating: '4.4', highlight: false },
    { tool: 'MockRocket', price: '$4/mo', users: '8K', rating: '4.1', highlight: false },
    { tool: 'TiltIt', price: '$79 LTD', users: '2.4K', rating: '4.9', highlight: true },
    { tool: 'Device Frames', price: '$12/mo', users: '5K', rating: '4.2', highlight: false },
  ];

  ctx.font = `400 13px ${SF}`;
  let rowY = headerY + 30;

  competitors.forEach((comp) => {
    if (rowY > y + h - 30) return;

    // Highlight row for TiltIt
    if (comp.highlight) {
      ctx.save();
      ctx.fillStyle = 'rgba(63, 185, 80, 0.08)';
      roundedRect(ctx, x + pad - 6, rowY - 6, w - pad * 2 + 12, 32, 6);
      ctx.fill();

      // Left green accent bar
      ctx.fillStyle = '#3FB950';
      roundedRect(ctx, x + pad - 6, rowY - 6, 3, 32, 2);
      ctx.fill();
      ctx.restore();
    }

    // Tool name
    ctx.font = `500 13px ${SF}`;
    ctx.fillStyle = comp.highlight ? '#3FB950' : '#C9D1D9';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(comp.tool, colX.tool, rowY);

    // Price
    ctx.font = `400 13px ${MONO}`;
    ctx.fillStyle = comp.highlight ? '#3FB950' : '#8B949E';
    ctx.fillText(comp.price, colX.price, rowY);

    // Users
    ctx.fillStyle = comp.highlight ? '#3FB950' : '#8B949E';
    ctx.fillText(comp.users, colX.users, rowY);

    // Rating with star
    ctx.fillStyle = comp.highlight ? '#3FB950' : '#8B949E';
    ctx.fillText(comp.rating, colX.rating, rowY);

    // Star icon
    const starX = colX.rating + ctx.measureText(comp.rating).width + 8;
    const starY2 = rowY + 6;
    ctx.fillStyle = comp.highlight ? '#3FB950' : '#E3B341';
    ctx.beginPath();
    ctx.moveTo(starX, starY2 - 5);
    ctx.lineTo(starX + 1.5, starY2 - 1.5);
    ctx.lineTo(starX + 5, starY2 - 1.5);
    ctx.lineTo(starX + 2.5, starY2 + 1);
    ctx.lineTo(starX + 3.5, starY2 + 5);
    ctx.lineTo(starX, starY2 + 2.5);
    ctx.lineTo(starX - 3.5, starY2 + 5);
    ctx.lineTo(starX - 2.5, starY2 + 1);
    ctx.lineTo(starX - 5, starY2 - 1.5);
    ctx.lineTo(starX - 1.5, starY2 - 1.5);
    ctx.closePath();
    ctx.fill();

    rowY += 40;
  });

  // Bottom accent bar
  ctx.fillStyle = '#D97757';
  roundedRect(ctx, x + pad, y + h - 20, 60, 4, 2);
  ctx.fill();
  ctx.fillStyle = '#2A2A35';
  roundedRect(ctx, x + pad + 68, y + h - 20, 36, 4, 2);
  ctx.fill();
}

// ── Tile definitions ──

const TILES = [
  { label: 'Real-time web search', draw: drawWebSearch },
  { label: 'Trend validation', draw: drawGoogleTrends },
  { label: 'Community signals', draw: drawHackerNews },
  { label: 'Competitive intelligence', draw: drawCompetitorAnalysis },
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
  ctx.fillText('Research/', folderX, folderY + folderSize * 0.78 / 2 + 14);
  ctx.restore();

  // Cursor to the LEFT of folder
  drawCursor(ctx, 838, 200, 38);
  drawClawdOutlined(ctx, folderX, folderY, 4, 'claude', 'pointing-right', 1, 'rgba(0,0,0,0.35)');

  // Search bar to the left
  drawSearchBar(ctx, 440, 174, 520, 'AI-powered research', FOLDER.body);

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

  // Slide dots -- index 4 for slide 5
  drawSlideDots(ctx, 4, TOTAL_SLIDES, CH - 75);
}

export default function Slide5() {
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
