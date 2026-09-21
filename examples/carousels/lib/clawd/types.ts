/**
 * Clawd Mascot System -- Type definitions
 * Reusable across all reels, carousels, and animations
 */

/** A pixel grid row: array of cell values */
// 0 = empty, 1 = body, 2 = eye/dark, 3 = shadow/mid-tone
export type ClawdRow = number[];

/** Full pixel grid for one expression */
export type ClawdGrid = ClawdRow[];

/** Expression ID */
export type ClawdExpression =
  | 'normal'
  | 'happy'
  | 'surprised'
  | 'wink'
  | 'dancing'
  | 'sleeping'
  | 'cool'
  | 'angry'
  | 'looking-down'
  | 'pointing-right'
  | 'raising-arm';

/** Expression definition */
export interface ClawdExpressionDef {
  id: ClawdExpression;
  label: string;
  emoji: string;
  grid: ClawdGrid;
  /** Grid dimensions (may vary per expression for poses) */
  cols: number;
  rows: number;
}

/** Color theme */
export interface ClawdColorTheme {
  id: string;
  label: string;
  body: string;
  shadow: string;
  eye: string;
}

/** Animation state for moving/transforming Clawd */
export interface ClawdAnimState {
  x: number;
  y: number;
  pixelSize: number;
  scale: number;
  rotation: number; // radians
  opacity: number;
  expression: ClawdExpression;
  theme: string; // theme id
  /** Bounce offset (for idle animation) */
  bounceY: number;
  /** Squash & stretch */
  scaleX: number;
  scaleY: number;
}

/** Default animation state */
export const DEFAULT_ANIM_STATE: ClawdAnimState = {
  x: 0,
  y: 0,
  pixelSize: 24,
  scale: 1,
  rotation: 0,
  opacity: 1,
  expression: 'normal',
  theme: 'claude',
  bounceY: 0,
  scaleX: 1,
  scaleY: 1,
};
