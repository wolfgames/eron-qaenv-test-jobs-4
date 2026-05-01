/**
 * Seeded initial-board generator (pure function).
 *
 * Produces a deterministic 8×8 bubble grid for batch 1's "valid grid render"
 * acceptance row. Higher-fidelity generation (solvability check, blocker
 * placement, haunted cells) lands in batch 5 — this helper just makes the
 * grid renderable so the player can see the foundation working.
 *
 * No `Math.random()` (per ECS purity rule) — uses a small seeded RNG.
 */

import { BUBBLE_TYPES } from '~/game/mysterymunch/data/bubbleTypes';
import type { BoardCellSnapshot, BoardSnapshot } from '~/game/mysterymunch/renderers/BoardRenderer';

export interface SeedBoardOptions {
  cols: number;
  rows: number;
  seed: number;
  /** Number of distinct colors in play (≤ BUBBLE_TYPES.length). */
  colorCount?: number;
  /** First bubble id allocated (caller should advance plugin's nextBubbleId by cols*rows). */
  startId?: number;
}

/** Mulberry32 — small, fast, non-cryptographic seeded RNG. */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function rng() {
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedBoard(opts: SeedBoardOptions): BoardSnapshot {
  const cols = opts.cols;
  const rows = opts.rows;
  const colorCount = Math.min(opts.colorCount ?? BUBBLE_TYPES.length, BUBBLE_TYPES.length);
  const rng = mulberry32(opts.seed || 1);
  const startId = opts.startId ?? 1;

  const cells: BoardCellSnapshot[] = [];
  let id = startId;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIdx = Math.floor(rng() * colorCount);
      cells.push({
        row,
        col,
        bubbleId: id++,
        colorIdx,
        kind: 'bubble',
      });
    }
  }

  return { cols, rows, cells };
}
