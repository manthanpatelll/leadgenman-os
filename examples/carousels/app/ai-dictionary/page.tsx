'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { roundedRect } from '@/lib/drawing-utils';
import { downloadBlob } from '@/lib/download';

const CW = 1080;
const CH = 1440;
const SF = '-apple-system, SF Pro Text, SF Compact, system-ui, sans-serif';

// =============================================================================
// KEYBOARD DIMENSIONS (Apple Magic Keyboard -- Silver)
// Scale: 1 unit (1u = 19mm key pitch) = 60px
// =============================================================================
const U = 65;             // 1 keyboard unit in pixels
const KEY_FACE = 56;      // key face size (in a 1u slot)
const KEY_GAP = U - KEY_FACE; // gap = 9px
const KEY_R = 5;          // key corner radius
const FN_KEY_H = 32;      // function row keys are shorter
const ARROW_HALF_H = (KEY_FACE - KEY_GAP) / 2; // half-height arrow keys

// Colors (Silver Magic Keyboard)
const CHASSIS_BG = '#dcdcdc';
const CHASSIS_INNER = '#c8c8c8';
const KEY_FACE_TOP = '#fafafa';
const KEY_FACE_BOT = '#f0f0f0';
const KEY_BORDER = 'rgba(0,0,0,0.08)';
const KEY_SHADOW = 'rgba(0,0,0,0.12)';
const KEY_LABEL = '#4a4a4a';
const KEY_LABEL_LIGHT = '#888888';
const KEY_LABEL_SYMBOL = '#666666';

// =============================================================================
// KEYBOARD LAYOUT (US ANSI Apple Magic Keyboard, compact 78-key)
// =============================================================================
// Each key: { label, sub?, w (in units), h? (override height) }
interface KeyInfo {
  label: string;
  sub?: string;       // secondary label (top symbol on number keys)
  w: number;          // width in units
  h?: number;         // height override in px
  gap?: number;       // gap AFTER this key in px (for function key groups)
  isArrowUp?: boolean;
  isArrowDown?: boolean;
}

// Function row: 13 keys at 1u = 13u. Need to fill 14.5u = 1.5u extra = 1.5 * 65 = 97.5px
// Distribute across 3 group gaps: ~32px each
const FN_GROUP_GAP = Math.round((1.5 * U) / 3);
const ROW_FN: KeyInfo[] = [
  { label: 'esc', w: 1, gap: FN_GROUP_GAP },
  { label: 'F1', w: 1 },
  { label: 'F2', w: 1 },
  { label: 'F3', w: 1 },
  { label: 'F4', w: 1, gap: FN_GROUP_GAP },
  { label: 'F5', w: 1 },
  { label: 'F6', w: 1 },
  { label: 'F7', w: 1 },
  { label: 'F8', w: 1, gap: FN_GROUP_GAP },
  { label: 'F9', w: 1 },
  { label: 'F10', w: 1 },
  { label: 'F11', w: 1 },
  { label: 'F12', w: 1 },
];

const ROW_NUM: KeyInfo[] = [
  { label: '`', sub: '~', w: 1 },
  { label: '1', sub: '!', w: 1 },
  { label: '2', sub: '@', w: 1 },
  { label: '3', sub: '#', w: 1 },
  { label: '4', sub: '$', w: 1 },
  { label: '5', sub: '%', w: 1 },
  { label: '6', sub: '^', w: 1 },
  { label: '7', sub: '&', w: 1 },
  { label: '8', sub: '*', w: 1 },
  { label: '9', sub: '(', w: 1 },
  { label: '0', sub: ')', w: 1 },
  { label: '-', sub: '_', w: 1 },
  { label: '=', sub: '+', w: 1 },
  { label: 'delete', w: 1.5 },
];

const ROW_QWERTY: KeyInfo[] = [
  { label: 'tab', w: 1.5 },
  { label: 'Q', w: 1 },
  { label: 'W', w: 1 },
  { label: 'E', w: 1 },
  { label: 'R', w: 1 },
  { label: 'T', w: 1 },
  { label: 'Y', w: 1 },
  { label: 'U', w: 1 },
  { label: 'I', w: 1 },
  { label: 'O', w: 1 },
  { label: 'P', w: 1 },
  { label: '[', sub: '{', w: 1 },
  { label: ']', sub: '}', w: 1 },
  { label: '\\', sub: '|', w: 1 },
];

const ROW_HOME: KeyInfo[] = [
  { label: 'caps lock', w: 1.75 },
  { label: 'A', w: 1 },
  { label: 'S', w: 1 },
  { label: 'D', w: 1 },
  { label: 'F', w: 1 },
  { label: 'G', w: 1 },
  { label: 'H', w: 1 },
  { label: 'J', w: 1 },
  { label: 'K', w: 1 },
  { label: 'L', w: 1 },
  { label: ';', sub: ':', w: 1 },
  { label: "'", sub: '"', w: 1 },
  { label: 'return', w: 1.75 },
];

const ROW_SHIFT: KeyInfo[] = [
  { label: '\u21E7 shift', w: 2.25 },
  { label: 'Z', w: 1 },
  { label: 'X', w: 1 },
  { label: 'C', w: 1 },
  { label: 'V', w: 1 },
  { label: 'B', w: 1 },
  { label: 'N', w: 1 },
  { label: 'M', w: 1 },
  { label: ',', sub: '<', w: 1 },
  { label: '.', sub: '>', w: 1 },
  { label: '/', sub: '?', w: 1 },
  { label: '\u21E7 shift', w: 2.25 },
];

const ROW_BOTTOM: KeyInfo[] = [
  { label: 'fn', w: 1 },
  { label: '\u2303 control', w: 1.25 },
  { label: '\u2325 option', w: 1.25 },
  { label: '\u2318 command', w: 1.25 },
  { label: '', w: 4.5 },  // spacebar (sized to fit 14.5u total)
  { label: '\u2318 command', w: 1.25 },
  { label: '\u2325 option', w: 1 },
  { label: '\u25C0', w: 1 },              // left arrow
  { label: '\u25B2', w: 1, isArrowUp: true },   // up/down (half height)
  { label: '\u25B6', w: 1 },              // right arrow
];

// Arrow down is drawn separately (below arrow up)

const ALL_ROWS = [ROW_FN, ROW_NUM, ROW_QWERTY, ROW_HOME, ROW_SHIFT, ROW_BOTTOM];

// =============================================================================
// DRAWING
// =============================================================================
function drawKey(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  key: KeyInfo,
  dimmed = false,
) {
  if (dimmed) {
    ctx.save();
    ctx.globalAlpha = 0.15;
  }

  // Shadow
  ctx.save();
  ctx.shadowColor = KEY_SHADOW;
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1.5;
  ctx.shadowOffsetX = 0;

  // Key face gradient
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, KEY_FACE_TOP);
  grad.addColorStop(1, KEY_FACE_BOT);
  roundedRect(ctx, x, y, w, h, KEY_R);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Border
  roundedRect(ctx, x, y, w, h, KEY_R);
  ctx.strokeStyle = KEY_BORDER;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Bottom edge (3D depth -- slightly darker line at bottom)
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + KEY_R, y + h);
  ctx.lineTo(x + w - KEY_R, y + h);
  ctx.stroke();

  // Labels
  if (key.sub) {
    // Dual-label key (number row with symbol)
    ctx.font = `400 13px ${SF}`;
    ctx.fillStyle = KEY_LABEL_SYMBOL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(key.sub, x + w / 2, y + 8);

    ctx.font = `500 17px ${SF}`;
    ctx.fillStyle = KEY_LABEL;
    ctx.textBaseline = 'bottom';
    ctx.fillText(key.label, x + w / 2, y + h - 8);
  } else if (key.label.length === 1 && key.label !== '') {
    // Single character (letter or arrow)
    const isArrow = ['\u25C0', '\u25B2', '\u25BC', '\u25B6'].includes(key.label);
    const fontSize = isArrow ? 14 : 22;
    ctx.font = `${isArrow ? '400' : '500'} ${fontSize}px ${SF}`;
    ctx.fillStyle = isArrow ? KEY_LABEL_LIGHT : KEY_LABEL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(key.label, x + w / 2, y + h / 2 + 1);
  } else if (key.label === '') {
    // Spacebar -- no label
  } else {
    // Modifier / function key (multi-char label)
    const isFn = key.label.startsWith('F') && key.label.length <= 3;
    const fontSize = isFn ? 13 : key.label.length > 8 ? 10 : 12;
    ctx.font = `400 ${fontSize}px ${SF}`;
    ctx.fillStyle = KEY_LABEL_LIGHT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(key.label, x + w / 2, y + h / 2 + 1);
  }

  if (dimmed) ctx.restore();
}

// "follow for more" highlighted letters
const CTA_HIGHLIGHT_KEYS = new Set(['F', 'O', 'L', 'W', 'R', 'M', 'E']);

function renderCTAKeyboard(ctx: CanvasRenderingContext2D) {
  const TF = 'Inter, -apple-system, SF Pro Display, system-ui, sans-serif';
  const metrics = getKeyboardMetrics();
  const { kbX, kbW, kbH, pad, rowLeftX } = metrics;

  // Center everything vertically: text block (~160px) + gap (40px) + keyboard
  const totalH = 160 + 40 + kbH;
  const startY = (CH - totalH) / 2;
  const kbY = startY + 200; // keyboard below text

  // @leadgenman handle (above title)
  ctx.save();
  ctx.font = `400 36px ${TF}`;
  ctx.fillStyle = '#999999';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('@leadgenman', CW / 2, kbY - 120);

  // "follow for more" text
  ctx.fillStyle = '#000000';
  ctx.font = `700 72px ${TF}`;
  ctx.fillText('follow for more', CW / 2, kbY - 40);
  ctx.restore();

  // Chassis body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, kbX, kbY, kbW, kbH, 16);
  ctx.fillStyle = CHASSIS_BG;
  ctx.fill();
  ctx.restore();

  roundedRect(ctx, kbX, kbY, kbW, kbH, 16);
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const innerPad = 8;
  roundedRect(ctx, kbX + innerPad, kbY + innerPad, kbW - innerPad * 2, kbH - innerPad * 2, 10);
  ctx.fillStyle = CHASSIS_INNER;
  ctx.fill();

  // Render rows with dimming
  let curY = kbY + pad;
  ALL_ROWS.forEach((row, rowIdx) => {
    const isFnRow = rowIdx === 0;
    const keyH = isFnRow ? FN_KEY_H : KEY_FACE;
    let curX = rowLeftX;

    row.forEach((key) => {
      const faceW = key.w * U - KEY_GAP;
      const isHighlighted = key.label.length === 1 && CTA_HIGHLIGHT_KEYS.has(key.label.toUpperCase());

      if (key.isArrowUp) {
        const halfH = (KEY_FACE - 2) / 2;
        drawKey(ctx, curX, curY, faceW, halfH - 1, key, true);
        drawKey(ctx, curX, curY + halfH + 1, faceW, halfH - 1, { label: '\u25BC', w: 1 }, true);
      } else {
        drawKey(ctx, curX, curY, faceW, keyH, key, !isHighlighted);
      }

      curX += faceW + KEY_GAP;
      if (key.gap) curX += key.gap;
    });

    curY += keyH + KEY_GAP;
  });

  // Draw lines from "follow for more" characters to their keys
  const phrase = 'follow for more';
  const textY = kbY - 40;
  const kbYOffset = kbY - metrics.kbY;

  ctx.save();
  ctx.font = `700 72px ${TF}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';

  const fullW = ctx.measureText(phrase).width;
  let charX = (CW - fullW) / 2;

  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let charIdx = 0;
  for (let i = 0; i < phrase.length; i++) {
    const ch = phrase[i];
    const charW = ctx.measureText(ch).width;
    const charCenterX = charX + charW / 2;

    if (ch !== ' ') {
      const keyPos = getKeyCenter(ch.toUpperCase());
      if (keyPos) {
        const keyY = keyPos.y + kbYOffset;
        const keyTopY = keyY - KEY_FACE / 2;
        // Right-angle trace: down from text, then horizontal to key x, then down to key
        const midY = kbY + 10 + charIdx * 6; // staggered just below keyboard top edge
        drawCircuitTrace(ctx, [
          { x: charCenterX, y: textY - 5 },
          { x: charCenterX, y: midY },
          { x: keyPos.x, y: midY },
          { x: keyPos.x, y: keyTopY },
        ]);
        charIdx++;
      }
    }

    charX += charW;
  }

  ctx.restore();
}

function renderKeyboard(ctx: CanvasRenderingContext2D) {
  // Calculate keyboard dimensions
  const kbInnerW = 14.5 * U; // key area width (all rows = 14.5u)
  const pad = 20;
  const kbW = kbInnerW + pad * 2;
  const kbH = FN_KEY_H + 5 * KEY_FACE + 6 * KEY_GAP + pad * 2 + 14;
  const kbX = (CW - kbW) / 2;
  const kbY = CH - kbH - 100;

  // ── TITLE (positioned from simulator) ──
  const TF = 'Inter, -apple-system, SF Pro Display, system-ui, sans-serif';

  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // "The" -- italic, light (shifted right to clear left-side connector lines)
  ctx.font = `italic 400 62px ${TF}`;
  ctx.fillText('The', 188, 133);

  // "A—Z" -- semi-bold
  ctx.font = `600 180px ${TF}`;
  ctx.fillText('A\u2014Z', 339, 191);

  // "of" -- italic, light
  ctx.font = `italic 400 81px ${TF}`;
  ctx.fillText('of', 553, 352);

  // "AI" -- bold, massive
  ctx.font = `700 300px ${TF}`;
  ctx.fillText('AI', 672, 390);

  // "Dictionary" -- italic, light
  ctx.font = `italic 400 48px ${TF}`;
  ctx.fillText('Dictionary', 920, 596);

  ctx.restore();

  // Chassis body
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, kbX, kbY, kbW, kbH, 16);
  ctx.fillStyle = CHASSIS_BG;
  ctx.fill();
  ctx.restore();

  // Chassis border
  roundedRect(ctx, kbX, kbY, kbW, kbH, 16);
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Inner recessed area (slightly darker where keys sit)
  const innerPad = 8;
  roundedRect(ctx, kbX + innerPad, kbY + innerPad, kbW - innerPad * 2, kbH - innerPad * 2, 10);
  ctx.fillStyle = CHASSIS_INNER;
  ctx.fill();

  // ── RENDER ROWS ──
  // First, find the widest row to use as the alignment reference
  let maxRowW = 0;
  ALL_ROWS.forEach((row) => {
    let rowW = 0;
    row.forEach((key, i) => {
      rowW += key.w * U - KEY_GAP;
      if (i < row.length - 1) rowW += KEY_GAP;
      if (key.gap) rowW += key.gap;
    });
    if (rowW > maxRowW) maxRowW = rowW;
  });

  // All rows align to the same left edge (based on widest row)
  const rowLeftX = kbX + (kbW - maxRowW) / 2;

  let curY = kbY + pad;

  ALL_ROWS.forEach((row, rowIdx) => {
    const isFnRow = rowIdx === 0;
    const keyH = isFnRow ? FN_KEY_H : KEY_FACE;

    // All rows start at the same left edge
    let curX = rowLeftX;

    row.forEach((key, ki) => {
      const faceW = key.w * U - KEY_GAP;

      if (key.isArrowUp) {
        // Up arrow -- half height, top half
        const halfH = (KEY_FACE - 2) / 2;
        drawKey(ctx, curX, curY, faceW, halfH - 1, key);
        // Down arrow -- half height, bottom half
        drawKey(ctx, curX, curY + halfH + 1, faceW, halfH - 1, { label: '\u25BC', w: 1 });
      } else {
        drawKey(ctx, curX, curY, faceW, keyH, key);
      }

      curX += faceW + KEY_GAP;
      if (key.gap) curX += key.gap;
    });

    curY += keyH + KEY_GAP;
  });
}

// =============================================================================
// KEYBOARD METRICS & KEY CENTER LOOKUP
// =============================================================================
function getKeyboardMetrics() {
  const kbInnerW = 14.5 * U;
  const pad = 20;
  const kbW = kbInnerW + pad * 2;
  const kbH = FN_KEY_H + 5 * KEY_FACE + 6 * KEY_GAP + pad * 2 + 14;
  const kbX = (CW - kbW) / 2;
  const kbY = CH - kbH - 100;

  // Find widest row for alignment
  let maxRowW = 0;
  ALL_ROWS.forEach((row) => {
    let rowW = 0;
    row.forEach((key, i) => {
      rowW += key.w * U - KEY_GAP;
      if (i < row.length - 1) rowW += KEY_GAP;
      if (key.gap) rowW += key.gap;
    });
    if (rowW > maxRowW) maxRowW = rowW;
  });

  const rowLeftX = kbX + (kbW - maxRowW) / 2;
  return { kbX, kbY, kbW, kbH, pad, rowLeftX, maxRowW };
}

function getKeyCenter(label: string): { x: number; y: number } | null {
  const { pad, kbY, rowLeftX } = getKeyboardMetrics();
  let curY = kbY + pad;

  for (let rowIdx = 0; rowIdx < ALL_ROWS.length; rowIdx++) {
    const row = ALL_ROWS[rowIdx];
    const isFnRow = rowIdx === 0;
    const keyH = isFnRow ? FN_KEY_H : KEY_FACE;
    let curX = rowLeftX;

    for (let ki = 0; ki < row.length; ki++) {
      const key = row[ki];
      const faceW = key.w * U - KEY_GAP;

      if (key.label === label || key.label.toUpperCase() === label.toUpperCase()) {
        return { x: curX + faceW / 2, y: curY + keyH / 2 };
      }

      // Also check arrow down (drawn below arrow up)
      if (key.isArrowUp && label === '\u25BC') {
        const halfH = (KEY_FACE - 2) / 2;
        return { x: curX + faceW / 2, y: curY + halfH + 1 + (halfH - 1) / 2 };
      }

      curX += faceW + KEY_GAP;
      if (key.gap) curX += key.gap;
    }

    curY += keyH + KEY_GAP;
  }

  return null;
}

// =============================================================================
// CIRCUIT-BOARD CONNECTOR LINES (slide 1 keys -> slide 2 terms)
// =============================================================================
interface TermPosition {
  letter: string;
  x: number;
  y: number;
  trackY: number;
  endOffsetX: number; // horizontal offset from term.x for connector endpoint
  endOffsetY: number; // vertical offset from term.y for connector endpoint
}

const SLIDE_2_TERMS: TermPosition[] = [
  { letter: 'A', x: 100,  y: 180,  trackY: 660, endOffsetX: -65, endOffsetY: 99 },
  { letter: 'B', x: 580,  y: 600,  trackY: 700, endOffsetX: 20, endOffsetY: 78 },
  { letter: 'C', x: 250,  y: 1000, trackY: 740, endOffsetX: 19, endOffsetY: 55 },
];

function drawCircuitTrace(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], radius = 10) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    ctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, radius);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
}

// Bottom-row keys that route lines DOWNWARD from the keyboard
const BOTTOM_KEYS = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

function renderConnectors(ctx: CanvasRenderingContext2D, overrides?: Record<string, { endOffsetX: number; endOffsetY: number }>, customWaypoints?: Record<string, { x: number; y: number }[]>) {
  ctx.save();
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Helper: draw connector with optional custom waypoints inserted between start and end
  const drawWithWaypoints = (letter: string, defaultPoints: { x: number; y: number }[]) => {
    const wp = customWaypoints?.[letter];
    if (wp && wp.length > 0) {
      // Custom waypoints replace the MIDDLE of the path, keep start and end
      const start = defaultPoints[0];
      const end = defaultPoints[defaultPoints.length - 1];
      drawCircuitTrace(ctx, [start, ...wp, end]);
    } else {
      drawCircuitTrace(ctx, defaultPoints);
    }
  };

  // A, B, C connectors to slide 2 (existing -- go UP from keys)
  for (const term of SLIDE_2_TERMS) {
    const keyCenter = getKeyCenter(term.letter);
    if (!keyCenter) continue;

    const startX = keyCenter.x;
    const startY = keyCenter.y - KEY_FACE / 2 + 11;

    const offsets = overrides?.[term.letter] ?? term;
    const endX = CW + term.x + offsets.endOffsetX;
    const endY = term.y + offsets.endOffsetY;

    const points = [
      { x: startX, y: startY },
      { x: startX, y: term.trackY },
      { x: endX, y: term.trackY },
      { x: endX, y: endY },
      ...(term.letter === 'A' ? [{ x: CW + term.x + 20, y: endY }] : []),
    ];

    drawWithWaypoints(term.letter, points);
  }

  // Shift-row keys -- lines go DOWN from keyboard, RIGHT across slides to destination
  const { kbY, kbH } = getKeyboardMetrics();
  const kbBottom = kbY + kbH;

  const BOTTOM_CONNECTORS: { letter: string; destSlide: number; trackIdx: number }[] = [
    // Shift row
    { letter: 'Z', destSlide: 7, trackIdx: 0 },
    { letter: 'X', destSlide: 7, trackIdx: 1 },
    { letter: 'V', destSlide: 6, trackIdx: 2 },
    { letter: 'N', destSlide: 4, trackIdx: 3 },
    { letter: 'M', destSlide: 4, trackIdx: 4 },
    // Home row (skip A -- already connected upward)
    { letter: 'S', destSlide: 6, trackIdx: 5 },
    { letter: 'D', destSlide: 2, trackIdx: 6 },
    { letter: 'F', destSlide: 2, trackIdx: 7 },
    { letter: 'G', destSlide: 2, trackIdx: 8 },
    { letter: 'H', destSlide: 3, trackIdx: 9 },
    { letter: 'J', destSlide: 3, trackIdx: 10 },
    { letter: 'K', destSlide: 3, trackIdx: 11 },
    { letter: 'L', destSlide: 4, trackIdx: 12 },
  ];

  for (const conn of BOTTOM_CONNECTORS) {

    const keyCenter = getKeyCenter(conn.letter);
    if (!keyCenter) continue;

    const destTerms = SLIDE_TERMS[conn.destSlide];
    if (!destTerms) continue;
    const destTerm = destTerms.find(t => t.letter === conn.letter);
    if (!destTerm) continue;

    const startX = keyCenter.x;
    const startY = keyCenter.y + KEY_FACE / 2 - 11;
    const trackY = kbBottom + 14 + conn.trackIdx * 6;

    const offsets = overrides?.[conn.letter] ?? { endOffsetX: 20, endOffsetY: 70 };
    const endX = conn.destSlide * CW + destTerm.x + offsets.endOffsetX;
    const endY = destTerm.y + offsets.endOffsetY;

    const BOTTOM_ARRIVAL_LETTERS = new Set(['D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'S', 'V', 'X', 'Z']);
    const arrOffset = conn.letter === 'V' ? 50 : conn.letter === 'X' ? 50 : conn.letter === 'N' ? 90 : 20;
    const arrPoint = BOTTOM_ARRIVAL_LETTERS.has(conn.letter)
      ? [{ x: conn.destSlide * CW + destTerm.x + arrOffset, y: endY }]
      : [];

    const points = [
      { x: startX, y: startY },
      { x: startX, y: trackY },
      { x: endX, y: trackY },
      { x: endX, y: endY },
      ...arrPoint,
    ];

    drawWithWaypoints(conn.letter, points);
  }

  // Top row (QWERTY) -- lines go UP, route LEFT of title, RIGHT across top to destination
  const LEFT_MARGIN = 60;
  const TOP_CONNECTORS: { letter: string; destSlide: number; trackIdx: number }[] = [
    { letter: 'Q', destSlide: 5, trackIdx: 0 },
    { letter: 'W', destSlide: 7, trackIdx: 1 },
    { letter: 'E', destSlide: 2, trackIdx: 2 },
    { letter: 'R', destSlide: 5, trackIdx: 3 },
    { letter: 'T', destSlide: 6, trackIdx: 4 },
    { letter: 'Y', destSlide: 7, trackIdx: 5 },
    { letter: 'U', destSlide: 6, trackIdx: 6 },
    { letter: 'I', destSlide: 3, trackIdx: 7 },
    { letter: 'O', destSlide: 4, trackIdx: 8 },
    { letter: 'P', destSlide: 5, trackIdx: 9 },
  ];

  for (const conn of TOP_CONNECTORS) {

    const keyCenter = getKeyCenter(conn.letter);
    if (!keyCenter) continue;

    const destTerms = SLIDE_TERMS[conn.destSlide];
    if (!destTerms) continue;
    const destTerm = destTerms.find(t => t.letter === conn.letter);
    if (!destTerm) continue;

    const startX = keyCenter.x;
    const startY = keyCenter.y - KEY_FACE / 2 + 11;
    const trackY = 30 + conn.trackIdx * 8;
    const turnY = kbY - 40;
    const lx = LEFT_MARGIN + conn.trackIdx * 5;

    const offsets = overrides?.[conn.letter] ?? { endOffsetX: 20, endOffsetY: 70 };
    const endX = conn.destSlide * CW + destTerm.x + offsets.endOffsetX;
    const endY = destTerm.y + offsets.endOffsetY;

    const TOP_ARRIVAL_LETTERS = new Set(['U']);
    const topArrPoint = TOP_ARRIVAL_LETTERS.has(conn.letter)
      ? [{ x: conn.destSlide * CW + destTerm.x + 20, y: endY }]
      : [];

    const points = [
      { x: startX, y: startY },
      { x: startX, y: turnY },       // up to above keyboard
      { x: lx, y: turnY },           // left to margin
      { x: lx, y: trackY },          // up to top edge
      { x: endX, y: trackY },        // right across slides to destination
      { x: endX, y: endY },          // down to term
      ...topArrPoint,
    ];

    drawWithWaypoints(conn.letter, points);
  }

  ctx.restore();
}

// =============================================================================
// TERM BLOCK RENDERER (for slides 1-10)
// =============================================================================
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, currentY);
}

function renderTermBlock(ctx: CanvasRenderingContext2D, letter: string, x: number, y: number) {
  const TF = 'Inter, -apple-system, SF Pro Display, system-ui, sans-serif';
  const term = AI_TERMS[letter];
  if (!term) return;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Big letter
  ctx.font = `700 140px ${TF}`;
  ctx.fillStyle = '#000000';
  ctx.fillText(letter, x, y);

  // Term name
  ctx.font = `600 32px ${TF}`;
  ctx.fillStyle = '#000000';
  ctx.fillText(term.term, x + 10, y + 155);

  // Definition (word-wrapped)
  ctx.font = `400 21px ${TF}`;
  ctx.fillStyle = '#666666';
  wrapText(ctx, term.definition, x + 10, y + 200, 420, 28);

  ctx.restore();
}

// =============================================================================
// SLIDE DEFINITIONS
// =============================================================================
const TOTAL_SLIDES = 9;
const BG_COLOR = '#FFFFFF';

interface SlideInfo {
  index: number;
  label: string;
  letters: string[];
}

const SLIDES: SlideInfo[] = [
  { index: 0, label: 'Hook', letters: [] },
  { index: 1, label: 'A B C', letters: ['A', 'B', 'C'] },
  { index: 2, label: 'D E F G', letters: ['D', 'E', 'F', 'G'] },
  { index: 3, label: 'H I J K', letters: ['H', 'I', 'J', 'K'] },
  { index: 4, label: 'L M N O', letters: ['L', 'M', 'N', 'O'] },
  { index: 5, label: 'P Q R', letters: ['P', 'Q', 'R'] },
  { index: 6, label: 'S T U V', letters: ['S', 'T', 'U', 'V'] },
  { index: 7, label: 'W X Y Z', letters: ['W', 'X', 'Y', 'Z'] },
  { index: 8, label: 'CTA', letters: [] },
];

// Term positions per slide (randomized asymmetric layouts)
const SLIDE_TERMS: Record<number, { letter: string; x: number; y: number }[]> = {
  // Slide 2 (index 1): A,B,C -- handled by SLIDE_2_TERMS
  2: [ // D,E,F,G -- right-left-right-left
    { letter: 'D', x: 550, y: 140 },
    { letter: 'E', x: 100, y: 430 },
    { letter: 'F', x: 580, y: 740 },
    { letter: 'G', x: 120, y: 1080 },
  ],
  3: [ // H,I,J,K -- left-right-left-right
    { letter: 'H', x: 100, y: 140 },
    { letter: 'I', x: 560, y: 430 },
    { letter: 'J', x: 150, y: 740 },
    { letter: 'K', x: 540, y: 1080 },
  ],
  4: [ // L,M,N,O -- center-left-right-center
    { letter: 'L', x: 300, y: 140 },
    { letter: 'M', x: 80, y: 430 },
    { letter: 'N', x: 580, y: 740 },
    { letter: 'O', x: 250, y: 1080 },
  ],
  5: [ // P,Q,R -- right-center-left
    { letter: 'P', x: 570, y: 140 },
    { letter: 'Q', x: 120, y: 560 },
    { letter: 'R', x: 400, y: 980 },
  ],
  6: [ // S,T,U,V -- left-right-center-left
    { letter: 'S', x: 100, y: 140 },
    { letter: 'T', x: 580, y: 430 },
    { letter: 'U', x: 300, y: 740 },
    { letter: 'V', x: 90, y: 1080 },
  ],
  7: [ // W,X,Y,Z -- center-right-left-right
    { letter: 'W', x: 280, y: 140 },
    { letter: 'X', x: 580, y: 430 },
    { letter: 'Y', x: 100, y: 740 },
    { letter: 'Z', x: 540, y: 1080 },
  ],
};

// AI terms for each letter
const AI_TERMS: Record<string, { term: string; definition: string }> = {
  A: { term: 'Agent', definition: 'An AI that can take actions autonomously to accomplish goals' },
  B: { term: 'Bias', definition: 'Systematic errors in AI outputs from skewed training data' },
  C: { term: 'Context Window', definition: 'The maximum amount of text an AI model can process at once' },
  D: { term: 'Diffusion', definition: 'A technique that generates images by gradually removing noise' },
  E: { term: 'Embedding', definition: 'A numerical representation of text that captures its meaning' },
  F: { term: 'Fine-tuning', definition: 'Training a pre-built model further on specific data' },
  G: { term: 'GPT', definition: 'Generative Pre-trained Transformer -- the architecture behind ChatGPT' },
  H: { term: 'Hallucination', definition: 'When an AI confidently generates false or fabricated information' },
  I: { term: 'Inference', definition: 'The process of running a trained model to get predictions' },
  J: { term: 'Jailbreak', definition: 'Tricking an AI into bypassing its safety guidelines' },
  K: { term: 'Knowledge Base', definition: 'A structured store of information an AI can retrieve from' },
  L: { term: 'LLM', definition: 'Large Language Model -- trained on massive text to understand language' },
  M: { term: 'Multimodal', definition: 'AI that can process multiple types of input like text, images, and audio' },
  N: { term: 'Neural Net', definition: 'A computing system inspired by the human brain\'s neuron connections' },
  O: { term: 'Open Source', definition: 'AI models with publicly available weights and code anyone can use' },
  P: { term: 'Prompt', definition: 'The input text you give an AI to guide its response' },
  Q: { term: 'Quantization', definition: 'Compressing a model\'s precision to run faster on less hardware' },
  R: { term: 'RAG', definition: 'Retrieval-Augmented Generation -- feeding real documents to improve answers' },
  S: { term: 'Supervised Learning', definition: 'Training a model on labeled data where correct answers are provided' },
  T: { term: 'Tokens', definition: 'The smallest units of text an AI reads -- roughly 3/4 of a word' },
  U: { term: 'Unsupervised', definition: 'Learning patterns from data without human-labeled examples' },
  V: { term: 'Vector DB', definition: 'A database optimized for storing and searching embeddings' },
  W: { term: 'Weights', definition: 'The learned parameters inside a neural network' },
  X: { term: 'XGBoost', definition: 'Gradient boosting algorithm that builds decision trees sequentially to minimize errors' },
  Y: { term: 'YOLO', definition: 'You Only Look Once -- a real-time object detection algorithm' },
  Z: { term: 'Zero-shot', definition: 'Performing a task without any specific training examples for it' },
};

// =============================================================================
// RENDER INDIVIDUAL SLIDE
// =============================================================================
function renderSlide(ctx: CanvasRenderingContext2D, slideIndex: number) {
  // White background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, CW, CH);

  // @leadgenman watermark top-right (skip first and last slide)
  if (slideIndex > 0 && slideIndex < TOTAL_SLIDES - 1 && slideIndex !== 7 && slideIndex % 2 === 1) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.font = `400 18px Inter, -apple-system, system-ui, sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('@leadgenman', CW - 30, 60);
    ctx.restore();
  }

  if (slideIndex === 0) {
    renderKeyboard(ctx);
  } else if (slideIndex === 1) {
    for (const term of SLIDE_2_TERMS) {
      renderTermBlock(ctx, term.letter, term.x, term.y);
    }
  } else if (slideIndex === TOTAL_SLIDES - 1) {
    // CTA slide -- keyboard with "follow for more" highlighted
    renderCTAKeyboard(ctx);
  } else if (SLIDE_TERMS[slideIndex]) {
    for (const term of SLIDE_TERMS[slideIndex]) {
      renderTermBlock(ctx, term.letter, term.x, term.y);
    }
  }
}

// =============================================================================
// SEAMLESS SHEET RENDERER (all 12 slides side by side)
// =============================================================================
function renderFullSheet(ctx: CanvasRenderingContext2D, connectorOverrides?: Record<string, { endOffsetX: number; endOffsetY: number }>, customWaypoints?: Record<string, { x: number; y: number }[]>) {
  const totalW = CW * TOTAL_SLIDES;
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, totalW, CH);

  // 1. Render slide backgrounds (keyboard, white fills)
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    ctx.save();
    ctx.translate(i * CW, 0);
    ctx.beginPath();
    ctx.rect(0, 0, CW, CH);
    ctx.clip();
    renderSlide(ctx, i);
    ctx.restore();
  }

  // 2. Render seamless connectors (cross slide boundaries)
  renderConnectors(ctx, connectorOverrides, customWaypoints);

  // 3. Re-render foreground content ON TOP of connectors (big letters + terms)
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    if (SLIDES[i].letters.length > 0) {
      ctx.save();
      ctx.translate(i * CW, 0);
      ctx.beginPath();
      ctx.rect(0, 0, CW, CH);
      ctx.clip();
      if (i === 1) {
        for (const term of SLIDE_2_TERMS) {
          renderTermBlock(ctx, term.letter, term.x, term.y);
        }
      } else if (SLIDE_TERMS[i]) {
        for (const term of SLIDE_TERMS[i]) {
          renderTermBlock(ctx, term.letter, term.x, term.y);
        }
      }
      ctx.restore();
    }
  }

}

// =============================================================================
// COMPONENT
// =============================================================================
export default function AIDictionaryCarousel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tuneCanvasRef = useRef<HTMLCanvasElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);
  const [tuneMode, setTuneMode] = useState(false);
  const [tuneSlide, setTuneSlide] = useState(1); // which slide to focus on in tune mode
  // Default offsets for ALL 26 letters (tuned values for A,B,C; default 20,70 for rest)
  const [endOffsets, setEndOffsets] = useState<Record<string, { endOffsetX: number; endOffsetY: number }>>(() => {
    const defaults: Record<string, { endOffsetX: number; endOffsetY: number }> = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => {
      defaults[l] = { endOffsetX: 20, endOffsetY: 70 };
    });
    // Manthan's tuned values
    defaults.A = { endOffsetX: -65, endOffsetY: 99 };
    defaults.B = { endOffsetX: 20, endOffsetY: 78 };
    defaults.C = { endOffsetX: 19, endOffsetY: 55 };
    defaults.D = { endOffsetX: -16, endOffsetY: 75 };
    defaults.E = { endOffsetX: 19, endOffsetY: 33 };
    defaults.F = { endOffsetX: -10, endOffsetY: 72 };
    defaults.G = { endOffsetX: -36, endOffsetY: 74 };
    defaults.H = { endOffsetX: -19, endOffsetY: 75 };
    defaults.I = { endOffsetX: 20, endOffsetY: 70 };
    defaults.J = { endOffsetX: -31, endOffsetY: 93 };
    defaults.K = { endOffsetX: 431, endOffsetY: 65 };
    defaults.L = { endOffsetX: 704, endOffsetY: 102 };
    defaults.M = { endOffsetX: -34, endOffsetY: 72 };
    defaults.N = { endOffsetX: 467, endOffsetY: 55 };
    defaults.O = { endOffsetX: 38, endOffsetY: 27 };
    defaults.S = { endOffsetX: -51, endOffsetY: 39 };
    defaults.T = { endOffsetX: 44, endOffsetY: 31 };
    defaults.U = { endOffsetX: 199, endOffsetY: 102 };
    defaults.V = { endOffsetX: 420, endOffsetY: 101 };
    defaults.W = { endOffsetX: 16, endOffsetY: 33 };
    defaults.X = { endOffsetX: 459, endOffsetY: 66 };
    defaults.Y = { endOffsetX: 46, endOffsetY: 74 };
    defaults.Z = { endOffsetX: -30, endOffsetY: 23 };
    return defaults;
  });
  const draggingRef = useRef<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [addingWaypoint, setAddingWaypoint] = useState(false);
  const [customWaypoints, setCustomWaypoints] = useState<Record<string, { x: number; y: number }[]>>({});
  const draggingWpRef = useRef<{ letter: string; idx: number } | null>(null);

  // Render full sheet
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const totalW = CW * TOTAL_SLIDES;
    canvas.width = totalW * dpr;
    canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    renderFullSheet(ctx, endOffsets, customWaypoints);
  }, [endOffsets, tuneMode, customWaypoints]);

  // All connector destinations (letter → slide index)
  const ALL_CONNECTOR_DESTS: { letter: string; destSlide: number }[] = [
    // SLIDE_2_TERMS (A,B,C → slide 1)
    { letter: 'A', destSlide: 1 }, { letter: 'B', destSlide: 1 }, { letter: 'C', destSlide: 1 },
    // Bottom connectors (shift + home rows)
    { letter: 'Z', destSlide: 7 }, { letter: 'X', destSlide: 7 },
    { letter: 'V', destSlide: 6 }, { letter: 'N', destSlide: 4 }, { letter: 'M', destSlide: 4 },
    { letter: 'S', destSlide: 6 }, { letter: 'D', destSlide: 2 }, { letter: 'F', destSlide: 2 },
    { letter: 'G', destSlide: 2 }, { letter: 'H', destSlide: 3 }, { letter: 'J', destSlide: 3 },
    { letter: 'K', destSlide: 3 }, { letter: 'L', destSlide: 4 },
    // Top connectors (QWERTY row)
    { letter: 'Q', destSlide: 5 }, { letter: 'W', destSlide: 7 }, { letter: 'E', destSlide: 2 },
    { letter: 'R', destSlide: 5 }, { letter: 'T', destSlide: 6 }, { letter: 'Y', destSlide: 7 },
    { letter: 'U', destSlide: 6 }, { letter: 'I', destSlide: 3 }, { letter: 'O', destSlide: 4 },
    { letter: 'P', destSlide: 5 },
  ];

  // Helper: get tunable endpoints for a given slide index
  const getTunableEndpoints = useCallback((slideIdx: number): { letter: string; baseX: number; baseY: number; slideOfEndpoint: number }[] => {
    const results: { letter: string; baseX: number; baseY: number; slideOfEndpoint: number }[] = [];

    for (const conn of ALL_CONNECTOR_DESTS) {
      if (conn.destSlide !== slideIdx) continue;

      if (slideIdx === 1) {
        const term = SLIDE_2_TERMS.find(t => t.letter === conn.letter);
        if (term) results.push({ letter: conn.letter, baseX: term.x, baseY: term.y, slideOfEndpoint: 1 });
      } else {
        const destTerms = SLIDE_TERMS[slideIdx];
        if (!destTerms) continue;
        const destTerm = destTerms.find(t => t.letter === conn.letter);
        if (destTerm) results.push({ letter: conn.letter, baseX: destTerm.x, baseY: destTerm.y, slideOfEndpoint: slideIdx });
      }
    }

    return results;
  }, []);

  // Render tune canvas (zoomed view of selected slide pair)
  useEffect(() => {
    if (!tuneMode) return;
    const canvas = tuneCanvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const viewW = CW * 2; // show 2 slides side by side
    canvas.width = viewW * dpr;
    canvas.height = CH * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const leftSlide = tuneSlide - 1;
    const rightSlide = tuneSlide;
    const translateX = leftSlide * CW;

    // Render the two slides
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, viewW, CH);
    for (let i = 0; i < 2; i++) {
      const slideIdx = leftSlide + i;
      if (slideIdx < 0 || slideIdx >= TOTAL_SLIDES) continue;
      ctx.save();
      ctx.translate(i * CW, 0);
      ctx.beginPath();
      ctx.rect(0, 0, CW, CH);
      ctx.clip();
      renderSlide(ctx, slideIdx);
      ctx.restore();
    }

    // Render connectors translated so they align with the viewed pair
    ctx.save();
    ctx.translate(-translateX, 0);
    renderConnectors(ctx, endOffsets, customWaypoints);
    ctx.restore();

    // Draw slide divider
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CW, 0);
    ctx.lineTo(CW, CH);
    ctx.stroke();

    // Draw draggable endpoint markers for tunable endpoints on tuneSlide
    const endpoints = getTunableEndpoints(tuneSlide);
    for (const ep of endpoints) {
      const ox = endOffsets[ep.letter] ?? { endOffsetX: 20, endOffsetY: 70 };
      // Position relative to the viewed pair: endpoint is on rightSlide (index 1 in view)
      const ex = CW + ep.baseX + ox.endOffsetX;
      const ey = ep.baseY + ox.endOffsetY;

      // Red crosshair
      ctx.strokeStyle = '#FF3333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - 12, ey);
      ctx.lineTo(ex + 12, ey);
      ctx.moveTo(ex, ey - 12);
      ctx.lineTo(ex, ey + 12);
      ctx.stroke();

      // Circle
      ctx.beginPath();
      ctx.arc(ex, ey, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.font = `600 14px ${SF}`;
      ctx.fillStyle = '#FF3333';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(ep.letter, ex + 14, ey - 4);
    }

    // Draw custom waypoints for selected letter
    if (selectedLetter && customWaypoints[selectedLetter]) {
      const leftSlide = tuneSlide - 1;
      const pts = customWaypoints[selectedLetter];
      for (let idx = 0; idx < pts.length; idx++) {
        const wpX = pts[idx].x - leftSlide * CW;
        const wpY = pts[idx].y;

        // Green square marker
        ctx.fillStyle = '#22CC66';
        ctx.fillRect(wpX - 6, wpY - 6, 12, 12);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(wpX - 6, wpY - 6, 12, 12);

        // Index label
        ctx.font = `700 11px ${SF}`;
        ctx.fillStyle = '#22CC66';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${idx + 1}`, wpX + 10, wpY - 2);
      }
    }
  }, [tuneMode, tuneSlide, endOffsets, getTunableEndpoints, selectedLetter, customWaypoints]);

  // Tune canvas mouse handlers
  const getTuneCanvasPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = tuneCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = (CW * 2) / rect.width;
    const scaleY = CH / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const handleTuneMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getTuneCanvasPos(e);
    if (!pos) return;

    // Handle adding waypoint
    if (addingWaypoint && selectedLetter) {
      const leftSlide = tuneSlide - 1;
      setCustomWaypoints(prev => {
        const pts = [...(prev[selectedLetter] || [])];
        // Store in full-sheet coordinates
        pts.push({ x: Math.round(pos.x + leftSlide * CW), y: Math.round(pos.y) });
        return { ...prev, [selectedLetter]: pts };
      });
      return;
    }

    // Handle dragging existing waypoints
    if (selectedLetter && customWaypoints[selectedLetter]) {
      const leftSlide = tuneSlide - 1;
      const pts = customWaypoints[selectedLetter];
      for (let idx = 0; idx < pts.length; idx++) {
        const wpX = pts[idx].x - leftSlide * CW;
        const wpY = pts[idx].y;
        const dist = Math.sqrt((pos.x - wpX) ** 2 + (pos.y - wpY) ** 2);
        if (dist < 20) {
          draggingWpRef.current = { letter: selectedLetter, idx };
          return;
        }
      }
    }

    // Find nearest endpoint among tunable endpoints for current tuneSlide
    const endpoints = getTunableEndpoints(tuneSlide);
    for (const ep of endpoints) {
      const ox = endOffsets[ep.letter] ?? { endOffsetX: 20, endOffsetY: 70 };
      const ex = CW + ep.baseX + ox.endOffsetX;
      const ey = ep.baseY + ox.endOffsetY;
      const dist = Math.sqrt((pos.x - ex) ** 2 + (pos.y - ey) ** 2);
      if (dist < 30) {
        draggingRef.current = ep.letter;
        return;
      }
    }
  }, [endOffsets, tuneSlide, getTuneCanvasPos, getTunableEndpoints, addingWaypoint, selectedLetter, customWaypoints]);

  const handleTuneMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Handle dragging waypoints
    if (draggingWpRef.current) {
      const pos = getTuneCanvasPos(e);
      if (!pos) return;
      const { letter, idx } = draggingWpRef.current;
      const leftSlide = tuneSlide - 1;
      setCustomWaypoints(prev => {
        const pts = [...(prev[letter] || [])];
        pts[idx] = { x: Math.round(pos.x + leftSlide * CW), y: Math.round(pos.y) };
        return { ...prev, [letter]: pts };
      });
      return;
    }

    if (!draggingRef.current) return;
    const pos = getTuneCanvasPos(e);
    if (!pos) return;
    const letter = draggingRef.current;
    const endpoints = getTunableEndpoints(tuneSlide);
    const ep = endpoints.find(e => e.letter === letter);
    if (!ep) return;
    setEndOffsets(prev => ({
      ...prev,
      [letter]: {
        endOffsetX: Math.round(pos.x - CW - ep.baseX),
        endOffsetY: Math.round(pos.y - ep.baseY),
      },
    }));
  }, [tuneSlide, getTuneCanvasPos, getTunableEndpoints, endOffsets]);

  const handleTuneMouseUp = useCallback(() => {
    draggingRef.current = null;
    draggingWpRef.current = null;
  }, []);

  // Export single slide
  const handleExportSlide = useCallback(async (slideIndex: number) => {
    if (exporting) return;
    setExporting(true);
    try {
      const S = 4;
      const off = new OffscreenCanvas(CW * S, CH * S);
      const oc = off.getContext('2d') as OffscreenCanvasRenderingContext2D;
      if (!oc) return;
      oc.scale(S, S);

      // Render full sheet then clip to this slide
      oc.save();
      oc.beginPath();
      oc.rect(0, 0, CW, CH);
      oc.clip();
      oc.translate(-slideIndex * CW, 0);
      renderFullSheet(oc as unknown as CanvasRenderingContext2D, endOffsets, customWaypoints);
      oc.restore();

      const blob = await off.convertToBlob({ type: 'image/png' });
      const name = `ai-dictionary-slide-${String(slideIndex + 1).padStart(2, '0')}.png`;
      await downloadBlob(blob, name);
    } finally {
      setExporting(false);
    }
  }, [exporting, endOffsets, customWaypoints]);

  // Export all slides
  const handleExportAll = useCallback(async () => {
    if (exportingAll) return;
    setExportingAll(true);
    try {
      const S = 4;
      for (let i = 0; i < TOTAL_SLIDES; i++) {
        const off = new OffscreenCanvas(CW * S, CH * S);
        const oc = off.getContext('2d') as OffscreenCanvasRenderingContext2D;
        if (!oc) continue;
        oc.scale(S, S);

        // Render full sheet then clip to this slide
        oc.save();
        oc.beginPath();
        oc.rect(0, 0, CW, CH);
        oc.clip();
        oc.translate(-i * CW, 0);
        renderFullSheet(oc as unknown as CanvasRenderingContext2D, endOffsets, customWaypoints);
        oc.restore();

        const blob = await off.convertToBlob({ type: 'image/png' });
        const name = `ai-dictionary-slide-${String(i + 1).padStart(2, '0')}.png`;
        await downloadBlob(blob, name);
        // Small delay between downloads so browser doesn't block them
        await new Promise(r => setTimeout(r, 300));
      }
    } finally {
      setExportingAll(false);
    }
  }, [exportingAll, endOffsets, customWaypoints]);

  const [exportingZip, setExportingZip] = useState(false);
  const handleExportZip = useCallback(async () => {
    if (exportingZip) return;
    setExportingZip(true);
    try {
      const S = 4;
      const zip = new JSZip();
      for (let i = 0; i < TOTAL_SLIDES; i++) {
        const off = new OffscreenCanvas(CW * S, CH * S);
        const oc = off.getContext('2d') as OffscreenCanvasRenderingContext2D;
        if (!oc) continue;
        oc.scale(S, S);
        oc.save();
        oc.beginPath();
        oc.rect(0, 0, CW, CH);
        oc.clip();
        oc.translate(-i * CW, 0);
        renderFullSheet(oc as unknown as CanvasRenderingContext2D, endOffsets, customWaypoints);
        oc.restore();
        const blob = await off.convertToBlob({ type: 'image/png' });
        zip.file(`ai-dictionary-slide-${String(i + 1).padStart(2, '0')}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      await downloadBlob(zipBlob, 'ai-dictionary-slides-4x.zip');
    } finally {
      setExportingZip(false);
    }
  }, [exportingZip, endOffsets, customWaypoints]);

  const [exportingPdf, setExportingPdf] = useState(false);
  const handleExportPdf = useCallback(async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const S = 4;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [CW, CH],
        compress: true,
      });
      for (let i = 0; i < TOTAL_SLIDES; i++) {
        const off = new OffscreenCanvas(CW * S, CH * S);
        const oc = off.getContext('2d') as OffscreenCanvasRenderingContext2D;
        if (!oc) continue;
        oc.scale(S, S);
        oc.save();
        oc.beginPath();
        oc.rect(0, 0, CW, CH);
        oc.clip();
        oc.translate(-i * CW, 0);
        renderFullSheet(oc as unknown as CanvasRenderingContext2D, endOffsets, customWaypoints);
        oc.restore();
        const blob = await off.convertToBlob({ type: 'image/png' });
        const dataUrl: string = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        if (i > 0) pdf.addPage([CW, CH], 'portrait');
        pdf.addImage(dataUrl, 'PNG', 0, 0, CW, CH, undefined, 'SLOW');
        await new Promise(r => setTimeout(r, 0));
      }
      pdf.save('ai-dictionary-4x.pdf');
    } finally {
      setExportingPdf(false);
    }
  }, [exportingPdf, endOffsets, customWaypoints]);

  return (
    <div style={{
      minHeight: '100vh', background: '#F5F5F5',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px', gap: 16,
    }}>
      {/* Seamless sheet preview -- horizontal scroll */}
      <div style={{
        width: '100%', overflowX: 'auto', overflowY: 'hidden',
        borderRadius: 12, boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
      }}>
        <canvas ref={canvasRef}
          width={CW * TOTAL_SLIDES} height={CH}
          style={{
            height: 500, width: (500 / CH) * CW * TOTAL_SLIDES,
            background: '#FFF', display: 'block',
          }}
        />
      </div>

      {/* Slide labels */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        justifyContent: 'center', maxWidth: 800,
      }}>
        {SLIDES.map((slide) => (
          <button key={slide.index}
            onClick={() => handleExportSlide(slide.index)}
            disabled={exporting}
            style={{
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid #ddd', background: '#fff',
              fontSize: 12, fontWeight: 600, fontFamily: SF,
              cursor: exporting ? 'default' : 'pointer',
              opacity: exporting ? 0.5 : 1,
              color: '#333',
            }}>
            {slide.index + 1}. {slide.label}
          </button>
        ))}
      </div>

      {/* Tune mode toggle */}
      <button onClick={() => setTuneMode(!tuneMode)}
        style={{
          width: '100%', maxWidth: 540, height: 40, borderRadius: 10,
          border: tuneMode ? '2px solid #FF3333' : '1px solid #ddd',
          background: tuneMode ? '#FFF0F0' : '#fff',
          color: tuneMode ? '#FF3333' : '#333',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: SF,
        }}>
        {tuneMode ? 'Tune Mode ON -- drag red crosshairs to position connector endpoints' : 'Tune Connector Endpoints'}
      </button>

      {/* Tune canvas -- zoomed view of selected slide pair */}
      {tuneMode && (
        <>
          {/* Slide selector buttons */}
          <div style={{
            display: 'flex', gap: 6, justifyContent: 'center',
            width: '100%', maxWidth: 540,
          }}>
            {Array.from({ length: 7 }, (_, i) => i + 1).map(idx => {
              const isActive = tuneSlide === idx;
              const hasEndpoints = getTunableEndpoints(idx).length > 0;
              return (
                <button key={idx}
                  onClick={() => setTuneSlide(idx)}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: isActive ? '2px solid #FF3333' : '1px solid #ddd',
                    background: isActive ? '#FF3333' : '#fff',
                    color: isActive ? '#fff' : hasEndpoints ? '#333' : '#aaa',
                    fontSize: 13, fontWeight: 600, fontFamily: SF,
                    cursor: 'pointer',
                  }}>
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{
            width: '100%', maxWidth: 800, borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 2px 20px rgba(0,0,0,0.12)', border: '2px solid #FF3333',
          }}>
            <canvas ref={tuneCanvasRef}
              width={CW * 2} height={CH}
              onMouseDown={handleTuneMouseDown}
              onMouseMove={handleTuneMouseMove}
              onMouseUp={handleTuneMouseUp}
              onMouseLeave={handleTuneMouseUp}
              style={{
                width: '100%', height: 'auto', display: 'block',
                cursor: draggingRef.current ? 'grabbing' : 'grab',
                background: '#FFF',
              }}
            />
          </div>

          {/* Waypoint editor controls */}
          <div style={{
            width: '100%', maxWidth: 800, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#666', fontFamily: SF }}>Edit connector:</span>
            {getTunableEndpoints(tuneSlide).map(ep => (
              <button key={ep.letter}
                onClick={() => { setSelectedLetter(selectedLetter === ep.letter ? null : ep.letter); setAddingWaypoint(false); }}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  border: selectedLetter === ep.letter ? '2px solid #FF3333' : '1px solid #ddd',
                  background: selectedLetter === ep.letter ? '#FFF0F0' : '#fff',
                  color: selectedLetter === ep.letter ? '#FF3333' : '#333',
                  cursor: 'pointer', fontFamily: SF,
                }}>
                {ep.letter}
              </button>
            ))}
            {selectedLetter && (
              <>
                <button
                  onClick={() => setAddingWaypoint(!addingWaypoint)}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: addingWaypoint ? '2px solid #22CC66' : '1px solid #ddd',
                    background: addingWaypoint ? '#EEFFEE' : '#fff',
                    color: addingWaypoint ? '#22CC66' : '#333',
                    cursor: 'pointer', fontFamily: SF,
                  }}>
                  {addingWaypoint ? '+ Click canvas to add point' : '+ Add Waypoint'}
                </button>
                <button
                  onClick={() => {
                    setCustomWaypoints(prev => {
                      const pts = [...(prev[selectedLetter!] || [])];
                      pts.pop();
                      return { ...prev, [selectedLetter!]: pts };
                    });
                  }}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: '1px solid #ddd', background: '#fff', color: '#FF3333',
                    cursor: 'pointer', fontFamily: SF,
                  }}>
                  Remove Last
                </button>
                <button
                  onClick={() => setCustomWaypoints(prev => ({ ...prev, [selectedLetter!]: [] }))}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: '1px solid #ddd', background: '#fff', color: '#999',
                    cursor: 'pointer', fontFamily: SF,
                  }}>
                  Clear All
                </button>
                <span style={{ fontSize: 11, color: '#999', fontFamily: 'Menlo, monospace' }}>
                  {(customWaypoints[selectedLetter] || []).length} waypoints
                </span>
              </>
            )}
          </div>

          {/* Current values for selected slide */}
          <div style={{
            width: '100%', maxWidth: 540, padding: 16, borderRadius: 10,
            background: '#1a1a1a', color: '#ccc', fontFamily: 'Menlo, monospace',
            fontSize: 12, lineHeight: 1.8,
          }}>
            <div style={{ color: '#FF6B35', fontWeight: 700, marginBottom: 8 }}>
              Slide {tuneSlide + 1} -- Connector Endpoint Offsets (copy these):
            </div>
            {getTunableEndpoints(tuneSlide).length === 0 ? (
              <div style={{ color: '#666' }}>No tunable connector endpoints on this slide.</div>
            ) : (
              getTunableEndpoints(tuneSlide).map(ep => {
                const o = endOffsets[ep.letter] ?? { endOffsetX: 20, endOffsetY: 70 };
                return <div key={ep.letter}>{ep.letter}: endOffsetX: {o.endOffsetX}, endOffsetY: {o.endOffsetY}</div>;
              })
            )}
          </div>
        </>
      )}

      {/* Export all button */}
      <button onClick={handleExportAll} disabled={exportingAll}
        style={{
          width: '100%', maxWidth: 540, height: 48, borderRadius: 10,
          border: 'none', background: '#FF6B35', color: '#FFF',
          fontSize: 14, fontWeight: 700, cursor: exportingAll ? 'default' : 'pointer',
          fontFamily: SF, opacity: exportingAll ? 0.6 : 1,
        }}>
        {exportingAll ? 'Exporting all slides...' : `Export All ${TOTAL_SLIDES} Slides (${CW * 4} \u00D7 ${CH * 4} each)`}
      </button>

      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 540, marginTop: 12 }}>
        <button onClick={handleExportZip} disabled={exportingZip}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            border: '1px solid #ddd', background: '#fff', color: '#111',
            fontSize: 13, fontWeight: 600, cursor: exportingZip ? 'default' : 'pointer',
            fontFamily: SF, opacity: exportingZip ? 0.6 : 1,
          }}>
          {exportingZip ? 'Bundling ZIP...' : `Export ZIP (${TOTAL_SLIDES}\u00D7 PNG, 4x)`}
        </button>
        <button onClick={handleExportPdf} disabled={exportingPdf}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            border: '1px solid #ddd', background: '#fff', color: '#111',
            fontSize: 13, fontWeight: 600, cursor: exportingPdf ? 'default' : 'pointer',
            fontFamily: SF, opacity: exportingPdf ? 0.6 : 1,
          }}>
          {exportingPdf ? 'Building PDF...' : 'Export PDF (4x, SLOW)'}
        </button>
      </div>
    </div>
  );
}
