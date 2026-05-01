/**
 * Bubble type registry — the 5 mystery-themed bubble colors.
 *
 * Color + emoji icon dual coding (per UX core-guideline "never rely on color
 * alone"). Each bubble carries a color tint AND a distinctive emoji glyph.
 */

export type BubbleColor = 'amber' | 'teal' | 'violet' | 'coral' | 'lime';

export interface BubbleType {
  color: number;       // Pixi tint (0xRRGGBB)
  emoji: string;       // Secondary visual cue
  name: BubbleColor;
  hexLabel: string;    // For Inspector / debug
}

export const BUBBLE_TYPES: ReadonlyArray<BubbleType> = [
  { color: 0xffb74a, emoji: '🌟', name: 'amber',  hexLabel: '#ffb74a' },
  { color: 0x4ad7d1, emoji: '💎', name: 'teal',   hexLabel: '#4ad7d1' },
  { color: 0xa66cc4, emoji: '🔮', name: 'violet', hexLabel: '#a66cc4' },
  { color: 0xff7a8a, emoji: '🌸', name: 'coral',  hexLabel: '#ff7a8a' },
  { color: 0xb6d65b, emoji: '🍃', name: 'lime',   hexLabel: '#b6d65b' },
];

export function bubbleByIndex(idx: number): BubbleType {
  return BUBBLE_TYPES[idx % BUBBLE_TYPES.length]!;
}

export function bubbleByName(name: BubbleColor): BubbleType {
  const t = BUBBLE_TYPES.find((b) => b.name === name);
  if (!t) throw new Error(`Unknown bubble color: ${name}`);
  return t;
}
