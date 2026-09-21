/**
 * Clawd Mascot -- Color themes
 * Default "Claude" theme from official mascot
 */

import type { ClawdColorTheme } from './types';

export const CLAWD_THEMES: ClawdColorTheme[] = [
  { id: 'claude', label: 'Claude', body: '#CD7B5A', shadow: '#CA7356', eye: '#1A1A1A' },
  { id: 'mint', label: 'Mint', body: '#7ECFB3', shadow: '#6BBF9F', eye: '#1A5C42' },
  { id: 'berry', label: 'Berry', body: '#C27BA0', shadow: '#B06B90', eye: '#5C1A42' },
  { id: 'ocean', label: 'Ocean', body: '#6B9BD2', shadow: '#5A8BC2', eye: '#1A3A5C' },
  { id: 'lime', label: 'Lime', body: '#A8D86B', shadow: '#96C85B', eye: '#3A5C1A' },
  { id: 'coral', label: 'Coral', body: '#E88585', shadow: '#D87575', eye: '#5C1A1A' },
  { id: 'mono', label: 'Mono', body: '#888888', shadow: '#777777', eye: '#1A1A1A' },
  { id: 'night', label: 'Night', body: '#4A5568', shadow: '#3A4558', eye: '#C0C0FF' },
];

/** Get a theme by ID, defaults to 'claude' */
export function getTheme(id: string): ClawdColorTheme {
  return CLAWD_THEMES.find((t) => t.id === id) ?? CLAWD_THEMES[0];
}
