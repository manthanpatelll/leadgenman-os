'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@/lib/download';
import {
  CW, CH, SF, BG, TOTAL_SLIDES,
  drawWindowChrome, drawFolder, drawCursor, drawSearchBar, drawSlideDots,
  drawClawdOutlined, FOLDER_COLORS,
} from '../_shared';
import { roundedRect } from '@/lib/drawing-utils';

const SLIDE_NUM = 4;
const FILENAME = 'claude-replaced-team-04.png';
const FOLDER = FOLDER_COLORS.deploy;
const MONO = 'Menlo, Monaco, Consolas, monospace';

// ── Card 1: Vercel Dashboard ──

function drawVercelDashboard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Dark background
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header bar
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 42, [10, 10, 0, 0]);
  ctx.fill();

  // Vercel triangle logo
  const logoX = x + pad + 8;
  const logoY = y + 21;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(logoX, logoY + 7);
  ctx.lineTo(logoX + 7, logoY - 7);
  ctx.lineTo(logoX + 14, logoY + 7);
  ctx.closePath();
  ctx.fill();

  // "Vercel" text
  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Vercel', x + pad + 28, y + 21);

  // Breadcrumb separator + project name
  ctx.fillStyle = '#666';
  ctx.font = `400 14px ${SF}`;
  ctx.fillText('/', x + pad + 82, y + 21);
  ctx.fillStyle = '#999';
  ctx.fillText('tiltit', x + pad + 94, y + 21);

  // Deployments header
  const contentY = y + 52;
  ctx.font = `700 16px ${SF}`;
  ctx.fillStyle = '#EDEDED';
  ctx.fillText('Deployments', x + pad, contentY + 16);

  // Divider
  ctx.fillStyle = '#222';
  ctx.fillRect(x + pad, contentY + 38, w - pad * 2, 1);

  // Deployment rows
  const deployments = [
    { status: 'Ready', msg: 'fix: carousel export DPR', branch: 'main', time: '2m ago', color: '#50E3C2' },
    { status: 'Ready', msg: 'feat: add trend radar API', branch: 'main', time: '1h ago', color: '#50E3C2' },
    { status: 'Ready', msg: 'chore: update deps', branch: 'main', time: '3h ago', color: '#50E3C2' },
    { status: 'Ready', msg: 'fix: spring physics edge', branch: 'main', time: '6h ago', color: '#50E3C2' },
  ];

  const rowStartY = contentY + 48;
  const rowH = 52;

  deployments.forEach((dep, i) => {
    const ry = rowStartY + i * rowH;
    if (ry + rowH > y + h - 8) return;

    // Row divider
    if (i > 0) {
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(x + pad, ry, w - pad * 2, 1);
    }

    // Status dot
    ctx.beginPath();
    ctx.arc(x + pad + 5, ry + rowH / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = dep.color;
    ctx.fill();

    // Status text
    ctx.font = `600 13px ${SF}`;
    ctx.fillStyle = dep.color;
    ctx.textBaseline = 'middle';
    ctx.fillText(dep.status, x + pad + 16, ry + rowH / 2 - 10);

    // Commit message
    ctx.font = `400 13px ${SF}`;
    ctx.fillStyle = '#999';
    ctx.fillText(dep.msg, x + pad + 16, ry + rowH / 2 + 8);

    // Time
    ctx.font = `400 12px ${SF}`;
    ctx.fillStyle = '#555';
    ctx.textAlign = 'right';
    ctx.fillText(dep.time, x + w - pad, ry + rowH / 2);
    ctx.textAlign = 'left';
  });

  // Production badge at bottom
  const badgeY = y + h - 32;
  ctx.fillStyle = '#1A1A1A';
  roundedRect(ctx, x + pad, badgeY, 90, 22, 4);
  ctx.fill();
  ctx.font = `600 11px ${SF}`;
  ctx.fillStyle = '#50E3C2';
  ctx.textBaseline = 'middle';
  ctx.fillText('Production', x + pad + 10, badgeY + 11);
}

// ── Card 2: Terminal -- Deploy Command ──

function drawDeployTerminal(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
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

  // Prompt
  ctx.fillStyle = '#3FB950';
  ctx.fillText('manthan@mac', x + pad, lineY);
  ctx.fillStyle = '#888';
  ctx.fillText(' ~/tiltit', x + pad + ctx.measureText('manthan@mac').width, lineY);
  lineY += lineH;

  // Command
  ctx.fillStyle = '#58A6FF';
  ctx.fillText('$ ', x + pad, lineY);
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText('npx vercel deploy --prod', x + pad + 16, lineY);
  lineY += lineH;
  ctx.fillStyle = '#E6EDF3';
  ctx.fillText('  --yes', x + pad + 16, lineY);
  lineY += lineH + 8;

  // Output lines
  const outputs = [
    { text: 'Vercel CLI 50.40.0', color: '#888' },
    { text: 'Deploying tiltit...', color: '#F5A623' },
    { text: 'Uploading [===========] 100%', color: '#888' },
    { text: 'Build completed in 42s', color: '#888' },
    { text: '', color: '#888' },
    { text: 'Production:', color: '#999' },
  ];

  outputs.forEach(line => {
    if (lineY > y + h - 60) return;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, x + pad, lineY);
    lineY += lineH;
  });

  // Production URL in green
  ctx.fillStyle = '#3FB950';
  ctx.font = `600 14px ${MONO}`;
  ctx.fillText('https://tiltit.video', x + pad + 8, lineY);
  lineY += lineH + 6;

  // Done checkmark
  ctx.fillStyle = '#3FB950';
  ctx.font = `400 13.5px ${MONO}`;
  ctx.fillText('Done. Deployed to production.', x + pad, lineY);
}

// ── Card 3: GitHub Actions CI/CD ──

function drawGitHubActions(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0D1117';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header
  ctx.fillStyle = '#161B22';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 42, [10, 10, 0, 0]);
  ctx.fill();

  // Actions icon (play triangle in circle)
  const iconX = x + pad + 8;
  const iconY = y + 21;
  ctx.strokeStyle = '#58A6FF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(iconX, iconY, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#58A6FF';
  ctx.beginPath();
  ctx.moveTo(iconX - 3, iconY - 5);
  ctx.lineTo(iconX - 3, iconY + 5);
  ctx.lineTo(iconX + 5, iconY);
  ctx.closePath();
  ctx.fill();

  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#E6EDF3';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Actions', x + pad + 24, y + 21);

  // Workflow name
  const contentY = y + 52;
  ctx.font = `600 15px ${SF}`;
  ctx.fillStyle = '#D2A8FF';
  ctx.fillText('Deploy to Production', x + pad, contentY + 14);

  // Branch + trigger
  ctx.font = `400 12px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.fillText('main -- push', x + pad, contentY + 34);

  // Duration
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8B949E';
  ctx.font = `400 13px ${SF}`;
  ctx.fillText('2m 14s', x + w - pad, contentY + 14);
  ctx.textAlign = 'left';

  // Divider
  ctx.fillStyle = '#21262D';
  ctx.fillRect(x + pad, contentY + 50, w - pad * 2, 1);

  // Steps with checkmarks
  const steps = [
    { name: 'Lint', time: '12s' },
    { name: 'Type check', time: '18s' },
    { name: 'Build', time: '1m 32s' },
    { name: 'Deploy', time: '22s' },
  ];

  const stepStartY = contentY + 62;
  const stepH = 44;

  steps.forEach((step, i) => {
    const sy = stepStartY + i * stepH;
    if (sy + stepH > y + h - 10) return;

    // Vertical connector line
    if (i < steps.length - 1) {
      ctx.fillStyle = '#3FB950';
      ctx.fillRect(x + pad + 8, sy + 18, 2, stepH - 4);
    }

    // Green checkmark circle
    ctx.beginPath();
    ctx.arc(x + pad + 9, sy + 12, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#238636';
    ctx.fill();

    // Checkmark
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + pad + 4, sy + 12);
    ctx.lineTo(x + pad + 8, sy + 16);
    ctx.lineTo(x + pad + 14, sy + 8);
    ctx.stroke();

    // Step name
    ctx.font = `500 14px ${SF}`;
    ctx.fillStyle = '#E6EDF3';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(step.name, x + pad + 26, sy + 12);

    // Step time
    ctx.font = `400 12px ${SF}`;
    ctx.fillStyle = '#8B949E';
    ctx.textAlign = 'right';
    ctx.fillText(step.time, x + w - pad, sy + 12);
    ctx.textAlign = 'left';
  });

  // Success badge at bottom
  const badgeY = y + h - 34;
  ctx.fillStyle = '#238636';
  roundedRect(ctx, x + pad, badgeY, 68, 22, 4);
  ctx.fill();
  ctx.font = `700 11px ${SF}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.fillText('Success', x + pad + 10, badgeY + 11);
}

// ── Card 4: Domain Config ──

function drawDomainConfig(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#0C0C0C';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();

  const pad = 20;

  // Header
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 42, [10, 10, 0, 0]);
  ctx.fill();

  // Globe icon
  const gX = x + pad + 8;
  const gY = y + 21;
  ctx.strokeStyle = '#EDEDED';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(gX, gY, 8, 0, Math.PI * 2);
  ctx.stroke();
  // Meridian lines
  ctx.beginPath();
  ctx.ellipse(gX, gY, 4, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(gX - 8, gY);
  ctx.lineTo(gX + 8, gY);
  ctx.stroke();

  ctx.font = `700 15px ${SF}`;
  ctx.fillStyle = '#EDEDED';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Domains', x + pad + 24, y + 21);

  // Domain name
  const contentY = y + 54;
  ctx.font = `600 18px ${MONO}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('tiltit.video', x + pad, contentY);

  // Divider
  ctx.fillStyle = '#222';
  ctx.fillRect(x + pad, contentY + 22, w - pad * 2, 1);

  // DNS records
  const records = [
    { type: 'A', name: 'tiltit.video', value: '76.76.21.21', status: 'Valid' },
    { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', status: 'Valid' },
  ];

  const recordY = contentY + 36;
  const recordH = 56;

  records.forEach((rec, i) => {
    const ry = recordY + i * recordH;

    // Type badge
    ctx.fillStyle = '#1E293B';
    roundedRect(ctx, x + pad, ry, 58, 22, 4);
    ctx.fill();
    ctx.font = `700 12px ${MONO}`;
    ctx.fillStyle = '#58A6FF';
    ctx.textBaseline = 'middle';
    ctx.fillText(rec.type, x + pad + 8, ry + 11);

    // Name
    ctx.font = `500 13px ${MONO}`;
    ctx.fillStyle = '#E6EDF3';
    ctx.fillText(rec.name, x + pad + 66, ry + 11);

    // Value (below)
    ctx.font = `400 12px ${MONO}`;
    ctx.fillStyle = '#8B949E';
    ctx.fillText(rec.value, x + pad + 14, ry + 34);

    // Status checkmark
    ctx.fillStyle = '#3FB950';
    ctx.font = `500 12px ${SF}`;
    ctx.textAlign = 'right';
    ctx.fillText(rec.status, x + w - pad, ry + 11);
    ctx.textAlign = 'left';

    // Green dot
    ctx.beginPath();
    ctx.arc(x + w - pad - ctx.measureText(rec.status).width - 10, ry + 11, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3FB950';
    ctx.fill();
  });

  // SSL Section
  const sslY = recordY + records.length * recordH + 12;

  // Divider
  ctx.fillStyle = '#222';
  ctx.fillRect(x + pad, sslY, w - pad * 2, 1);

  const sslContentY = sslY + 16;

  // Lock icon
  ctx.strokeStyle = '#3FB950';
  ctx.lineWidth = 2;
  const lockX = x + pad + 8;
  const lockY = sslContentY + 8;
  // Lock body
  roundedRect(ctx, lockX - 6, lockY, 12, 10, 2);
  ctx.stroke();
  // Lock shackle
  ctx.beginPath();
  ctx.arc(lockX, lockY - 2, 5, Math.PI, 0);
  ctx.stroke();

  ctx.font = `600 14px ${SF}`;
  ctx.fillStyle = '#E6EDF3';
  ctx.textBaseline = 'middle';
  ctx.fillText('SSL Certificate', x + pad + 22, sslContentY + 12);

  // Valid badge
  ctx.fillStyle = '#0E3A22';
  roundedRect(ctx, x + pad + 130, sslContentY + 2, 52, 20, 4);
  ctx.fill();
  ctx.font = `700 11px ${SF}`;
  ctx.fillStyle = '#3FB950';
  ctx.fillText('Valid', x + pad + 142, sslContentY + 12);

  // Expiry
  ctx.font = `400 12px ${SF}`;
  ctx.fillStyle = '#8B949E';
  ctx.fillText('Expires: Dec 2026  --  Auto-renew', x + pad + 22, sslContentY + 36);

  // Encryption info
  ctx.fillStyle = '#555';
  ctx.font = `400 11px ${MONO}`;
  ctx.fillText('TLS 1.3  |  ECDSA P-256', x + pad + 22, sslContentY + 56);
}

// ── Tile definitions ──

const TILES = [
  { label: 'Zero-config deploys', draw: drawVercelDashboard },
  { label: 'CLI-first workflow', draw: drawDeployTerminal },
  { label: 'Automated CI/CD', draw: drawGitHubActions },
  { label: 'Custom domains + SSL', draw: drawDomainConfig },
];

// ── Main render ──

function renderSlide(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CW, CH);

  drawWindowChrome(ctx, undefined, undefined, FOLDER.body);

  // ── Row 1: Folder (LEFT) + Search bar ──
  const folderX = 130;
  const folderY = 170;
  const folderSize = 130;
  drawFolder(ctx, folderX, folderY, folderSize, FOLDER.body, FOLDER.shadow);

  ctx.save();
  ctx.font = `600 20px ${SF}`;
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Deploy/', folderX, folderY + folderSize * 0.78 / 2 + 14);
  ctx.restore();

  drawCursor(ctx, 208, 200, 38);
  drawClawdOutlined(ctx, folderX, folderY, 4, 'claude', 'raising-arm', 1, 'rgba(0,0,0,0.35)');

  drawSearchBar(ctx, 512, 174, 520, 'One-click shipping', FOLDER.body);

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

  // Slide dots (index 3 = slide 4)
  drawSlideDots(ctx, 3, TOTAL_SLIDES, CH - 75);
}

export default function Slide4() {
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
          color: '#5CC93E', fontFamily: SF, fontWeight: 600,
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
            background: '#5CC93E', color: '#FFF',
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
