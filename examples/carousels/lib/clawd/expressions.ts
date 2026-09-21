/**
 * Clawd Mascot -- Expression grids
 * Each grid: 0=empty, 1=body, 2=eye/dark, 3=shadow, 4=white/highlight
 * Parsed from official SVG exports at claude-code-mascot-generator.replit.app
 *
 * Add new expressions by pasting SVG, parsing rect positions into grid.
 */

import type { ClawdExpression, ClawdExpressionDef } from './types';

// ── Normal: simple single-pixel eyes ──
const NORMAL_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 2, 1, 1, 2, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
];

// ── Happy: raised hands, wide smile, shadow knees ──
const HAPPY_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0 ], // row 0: raised hands
  [ 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0 ], // row 1: raised hands
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ], // row 2: head
  [ 0, 0, 1, 1, 2, 1, 1, 1, 2, 1, 1, 0, 0 ], // row 3: eyes
  [ 0, 0, 1, 2, 1, 2, 1, 2, 1, 2, 1, 0, 0 ], // row 4: smile
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ], // row 5: body
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ], // row 6: body
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ], // row 7: body
  [ 0, 0, 3, 0, 3, 0, 0, 0, 3, 0, 3, 0, 0 ], // row 8: legs top (shadow)
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ], // row 9: legs
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ], // row 10: feet
];

// ── Surprised: wide white eyes with dark pupil ──
const SURPRISED_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 4, 4, 1, 1, 4, 4, 1, 0, 0 ],
  [ 0, 0, 1, 1, 2, 4, 1, 1, 2, 4, 1, 0, 0 ],
  [ 0, 0, 1, 1, 4, 4, 1, 1, 4, 4, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
];

// ── Wink: left eye 2x2 dark, right eye closed (body-color row 3) ──
const WINK_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0, 0 ],
  [ 0, 0, 1, 1, 2, 2, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
];

// ── Dancing: splayed legs, 2x2 dark eyes ──
const DANCING_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0, 0 ],
  [ 0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0 ],
  [ 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0 ],
  [ 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1 ],
];

// ── Sleeping: closed eyes (3-wide dark line) + shadow lids ──
const SLEEPING_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 2, 2, 2, 1, 2, 2, 2, 1, 0, 0 ],
  [ 0, 0, 1, 3, 3, 3, 1, 3, 3, 3, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
];

// ── Cool: sunglasses (shadow brow + 4-wide dark lenses) ──
const COOL_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 3, 3, 3, 3, 1, 3, 3, 3, 3, 0, 0 ],
  [ 0, 0, 2, 2, 2, 2, 1, 2, 2, 2, 2, 0, 0 ],
  [ 0, 0, 2, 2, 2, 2, 1, 2, 2, 2, 2, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
];

// ── Angry: furrowed brows (shadow + dark, diagonal pattern) ──
const ANGRY_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 3, 3, 1, 1, 1, 3, 3, 1, 0, 0 ],
  [ 0, 0, 1, 2, 2, 3, 1, 3, 2, 2, 1, 0, 0 ],
  [ 0, 0, 1, 1, 2, 2, 1, 2, 2, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
];

// ── Looking down: head shifted down, shadow arms at sides, eyes lowered ──
const LOOKING_DOWN_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3 ],
  [ 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3 ],
  [ 1, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 3 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 3, 0, 3, 0, 0, 0, 3, 0, 3, 0, 0 ],
  [ 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
];

// ── Pointing right: extended right arm (17 cols wide) ──
const POINTING_RIGHT_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16
  [ 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 ],
  [ 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0 ],
];

// ── Raising arm: right arm raised above head, arms wrap below ──
const RAISING_ARM_GRID = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 2, 1, 1, 1, 2, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
  [ 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0 ],
  [ 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0 ],
  [ 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1 ],
];

/** All expression definitions */
export const EXPRESSIONS: Record<ClawdExpression, ClawdExpressionDef> = {
  normal: {
    id: 'normal',
    label: 'Normal',
    emoji: '\u{1F610}',
    grid: NORMAL_GRID,
    cols: 13,
    rows: 11,
  },
  happy: {
    id: 'happy',
    label: 'Happy',
    emoji: '\u{1F604}',
    grid: HAPPY_GRID,
    cols: 13,
    rows: 11,
  },
  surprised: {
    id: 'surprised',
    label: 'Surprised',
    emoji: '\u{1F62E}',
    grid: SURPRISED_GRID,
    cols: 13,
    rows: 11,
  },
  wink: {
    id: 'wink',
    label: 'Wink',
    emoji: '\u{1F609}',
    grid: WINK_GRID,
    cols: 13,
    rows: 11,
  },
  dancing: {
    id: 'dancing',
    label: 'Dancing',
    emoji: '\u{1F483}',
    grid: DANCING_GRID,
    cols: 13,
    rows: 11,
  },
  sleeping: {
    id: 'sleeping',
    label: 'Sleeping',
    emoji: '\u{1F634}',
    grid: SLEEPING_GRID,
    cols: 13,
    rows: 11,
  },
  cool: {
    id: 'cool',
    label: 'Cool',
    emoji: '\u{1F60E}',
    grid: COOL_GRID,
    cols: 13,
    rows: 11,
  },
  angry: {
    id: 'angry',
    label: 'Angry',
    emoji: '\u{1F620}',
    grid: ANGRY_GRID,
    cols: 13,
    rows: 11,
  },
  'looking-down': {
    id: 'looking-down',
    label: 'Looking down',
    emoji: '\u{1F447}',
    grid: LOOKING_DOWN_GRID,
    cols: 13,
    rows: 12,
  },
  'pointing-right': {
    id: 'pointing-right',
    label: 'Pointing right',
    emoji: '\u{1F449}',
    grid: POINTING_RIGHT_GRID,
    cols: 17,
    rows: 11,
  },
  'raising-arm': {
    id: 'raising-arm',
    label: 'Raising arm',
    emoji: '\u{1F64B}',
    grid: RAISING_ARM_GRID,
    cols: 13,
    rows: 13,
  },
};

/** Get expression by ID */
export function getExpression(id: ClawdExpression): ClawdExpressionDef {
  return EXPRESSIONS[id] ?? EXPRESSIONS.normal;
}

/** List all expression IDs */
export const EXPRESSION_IDS: ClawdExpression[] = [
  'normal', 'happy', 'surprised', 'wink', 'dancing',
  'sleeping', 'cool', 'angry', 'looking-down', 'pointing-right', 'raising-arm',
];
