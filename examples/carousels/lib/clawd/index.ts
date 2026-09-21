/**
 * Clawd Mascot System -- Public API
 *
 * Usage in any reel, carousel, or animation:
 *
 *   import { drawClawd, drawClawdCentered, drawClawdAnimated } from '@/lib/clawd';
 *   import { idleBounce, squashStretch, walkCycle } from '@/lib/clawd';
 *   import { generateClawdSVG, generateClawdPNG } from '@/lib/clawd';
 *   import { EXPRESSIONS, EXPRESSION_IDS, getExpression } from '@/lib/clawd';
 *   import { CLAWD_THEMES, getTheme } from '@/lib/clawd';
 */

// Types
export type {
  ClawdGrid,
  ClawdRow,
  ClawdExpression,
  ClawdExpressionDef,
  ClawdColorTheme,
  ClawdAnimState,
} from './types';
export { DEFAULT_ANIM_STATE } from './types';

// Expressions
export { EXPRESSIONS, EXPRESSION_IDS, getExpression } from './expressions';

// Colors
export { CLAWD_THEMES, getTheme } from './colors';

// Renderer
export {
  drawClawdGrid,
  drawClawd,
  drawClawdCentered,
  getClawdSize,
  drawClawdAnimated,
  idleBounce,
  squashStretch,
  walkCycle,
  generateClawdSVG,
  generateClawdPNG,
} from './renderer';
