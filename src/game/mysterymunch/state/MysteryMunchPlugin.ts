/**
 * MysteryMunchPlugin — ECS source-of-truth for the Mystery Munch core loop.
 *
 * Per ecs-state.mdc this plugin owns: score, movesRemaining, starsEarned,
 * goalProgress, hauntedCellsCleared, clueTilesCollected, boardPhase, and the
 * Block archetype that backs each occupied cell on the board.
 *
 * SolidJS signals (in src/game/state.ts) are demoted to a DOM bridge — see
 * `bridge.ts` for the resource → signal wiring.
 */

import { Database } from '@adobe/data/ecs';
import { F32, U32 } from '@adobe/data/math';

import { DEFAULT_LEVEL_MOVES } from './types';

// ── Plugin definition ─────────────────────────────────────────────────────

export const mysteryMunchPlugin = Database.Plugin.create({
  // 3. components ----------------------------------------------------------
  components: {
    // Numeric (linear-memory layout for fast iteration).
    row: U32.schema,
    col: U32.schema,
    colorIdx: U32.schema,
    bubbleId: U32.schema,
    hp: F32.schema,

    // Inline schemas for strings/booleans.
    cellKind: { type: 'string', default: 'bubble' } as const,
    haunted: { type: 'boolean', default: false } as const,
    spriteKey: { type: 'string', default: '' } as const,
  },

  // 4. resources -----------------------------------------------------------
  resources: {
    score: { default: 0 as number },
    movesRemaining: { default: DEFAULT_LEVEL_MOVES as number },
    starsEarned: { default: 0 as number },
    goalProgress: { default: 0 as number },
    hauntedCellsCleared: { default: 0 as number },
    clueTilesCollected: { default: 0 as number },
    /**
     * Board state machine. Lowercase string discriminant matches `BoardPhase`
     * in `state/types.ts`. Input is blocked while non-idle (animated-dynamics
     * CoS exit criterion).
     */
    boardPhase: { default: 'idle' as string },
    /** Seeded RNG seed for reproducible level generation. */
    rngSeed: { default: 0 as number },
    /** Monotonic counter that issues stable bubble identities. */
    nextBubbleId: { default: 1 as number },
  },

  // 5. archetypes ----------------------------------------------------------
  archetypes: {
    Block: ['cellKind', 'colorIdx', 'bubbleId', 'row', 'col', 'hp', 'haunted', 'spriteKey'],
  },

  // 7. transactions --------------------------------------------------------
  transactions: {
    addScore(store, args: { amount: number }) {
      store.resources.score = store.resources.score + args.amount;
    },
    setScore(store, args: { value: number }) {
      store.resources.score = args.value;
    },
    decrementMoves(store) {
      const next = store.resources.movesRemaining - 1;
      store.resources.movesRemaining = next < 0 ? 0 : next;
    },
    addMoves(store, args: { amount: number }) {
      store.resources.movesRemaining = store.resources.movesRemaining + args.amount;
    },
    setBoardPhase(store, args: { phase: string }) {
      store.resources.boardPhase = args.phase;
    },
    setStarsEarned(store, args: { stars: number }) {
      store.resources.starsEarned = args.stars;
    },
    incrementHauntedCleared(store) {
      store.resources.hauntedCellsCleared = store.resources.hauntedCellsCleared + 1;
    },
    incrementCluesCollected(store) {
      store.resources.clueTilesCollected = store.resources.clueTilesCollected + 1;
    },
    setGoalProgress(store, args: { value: number }) {
      store.resources.goalProgress = args.value;
    },
    setRngSeed(store, args: { seed: number }) {
      store.resources.rngSeed = args.seed;
    },
    /**
     * Clear-and-rebuild board pattern (per ecs-state.mdc "Bulk Board Replace").
     * Used by gravity-fill / level-generation to atomically swap board state.
     */
    replaceBoardCells(
      store,
      args: { cells: ReadonlyArray<{ row: number; col: number; colorIdx: number; bubbleId: number; cellKind: string; hp: number; haunted: boolean }> },
    ) {
      // Delete every entity that has the cellKind component.
      for (const entity of store.select(['cellKind'])) {
        store.delete(entity);
      }
      // Insert new cells.
      for (const c of args.cells) {
        store.archetypes.Block.insert({
          cellKind: c.cellKind,
          colorIdx: c.colorIdx,
          bubbleId: c.bubbleId,
          row: c.row,
          col: c.col,
          hp: c.hp,
          haunted: c.haunted,
          spriteKey: '',
        });
      }
    },
    /** Issue and return a new bubble id (advances `nextBubbleId`). */
    allocateBubbleId(store) {
      const id = store.resources.nextBubbleId;
      store.resources.nextBubbleId = id + 1;
    },
    resetGameResources(store) {
      store.resources.score = 0;
      store.resources.movesRemaining = DEFAULT_LEVEL_MOVES;
      store.resources.starsEarned = 0;
      store.resources.goalProgress = 0;
      store.resources.hauntedCellsCleared = 0;
      store.resources.clueTilesCollected = 0;
      store.resources.boardPhase = 'idle';
    },
  },
});

export type MysteryMunchDatabase = Database.FromPlugin<typeof mysteryMunchPlugin>;

export function createMysteryMunchWorld(): MysteryMunchDatabase {
  return Database.create(mysteryMunchPlugin);
}
