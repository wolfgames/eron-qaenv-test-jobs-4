/**
 * Shared types for the Mystery Munch game state.
 */

export type BoardPhase =
  | 'idle'         // Awaiting player input.
  | 'animating'   // Animation queue draining; input blocked.
  | 'won'
  | 'lost'
  | 'reshuffling';

export type CellKind = 'bubble' | 'empty' | 'haunted' | 'blocker';

export interface CellState {
  kind: CellKind;
  /** 0..4 → BUBBLE_TYPES index; -1 if not a bubble cell. */
  colorIdx: number;
  /** Stable bubble identity that survives gravity-fill movement. */
  bubbleId: number;
  /** For blockers, remaining HP. */
  hp: number;
  /** Marks a cell as haunted (ghost-fog overlay). */
  haunted: boolean;
}

export interface BoardState {
  cols: number;
  rows: number;
  /** cells[row][col]. */
  cells: CellState[][];
}

export const DEFAULT_LEVEL_MOVES = 25;

export function emptyCell(): CellState {
  return { kind: 'empty', colorIdx: -1, bubbleId: 0, hp: 0, haunted: false };
}
