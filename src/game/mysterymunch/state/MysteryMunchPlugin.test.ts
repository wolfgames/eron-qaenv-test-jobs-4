/**
 * MysteryMunchPlugin tests — ECS resources init + DOM bridge.
 *
 * Acceptance row → test mapping (from implementation-plan.yml batch 1):
 *  - "ECS db is initialized" → resources readable.
 *  - "transaction updates score" → DOM-bridge signal reflects new value.
 */

import { describe, it, expect } from 'vitest';
import { Database } from '@adobe/data/ecs';

import { mysteryMunchPlugin, type MysteryMunchDatabase } from './MysteryMunchPlugin';
import { bridgeMysteryMunchToSignals } from './bridge';
import { gameState } from '~/game/state';

function makeDb(): MysteryMunchDatabase {
  return Database.create(mysteryMunchPlugin);
}

describe('MysteryMunchPlugin: ECS resources init', () => {
  it('creates movesRemaining resource with default value', () => {
    const db = makeDb();
    expect(db.resources.movesRemaining).toBeTypeOf('number');
    expect(db.resources.movesRemaining).toBeGreaterThan(0);
  });

  it('creates score resource with 0', () => {
    const db = makeDb();
    expect(db.resources.score).toBe(0);
  });

  it('creates boardPhase resource as idle', () => {
    const db = makeDb();
    expect(db.resources.boardPhase).toBe('idle');
  });

  it('DOM bridge signal reflects ECS resource update', () => {
    const db = makeDb();
    gameState.reset();
    const cleanup = bridgeMysteryMunchToSignals(db);

    db.transactions.addScore({ amount: 250 });

    expect(db.resources.score).toBe(250);
    expect(gameState.score()).toBe(250);

    cleanup();
  });
});

// ── Edge-case tests (added by stabilize phase) ────────────────────────────

describe('MysteryMunchPlugin: edge-case — decrementMoves floor', () => {
  it('decrementMoves does not go below 0 (floor at zero)', () => {
    const db = makeDb();
    // Use resetGameResources to pin movesRemaining to a known value.
    db.transactions.resetGameResources();
    // Drain all moves.
    const initial = db.resources.movesRemaining;
    for (let i = 0; i < initial; i++) {
      db.transactions.decrementMoves();
    }
    expect(db.resources.movesRemaining).toBe(0);
    // One more decrement — must clamp at 0, not go negative.
    db.transactions.decrementMoves();
    expect(db.resources.movesRemaining).toBe(0);
  });
});

describe('MysteryMunchPlugin: edge-case — replaceBoardCells idempotency', () => {
  it('calling replaceBoardCells twice leaves only the second set of cells', () => {
    const db = makeDb();
    // First batch: 2 cells with distinct bubbleIds.
    db.transactions.replaceBoardCells({
      cells: [
        { row: 0, col: 0, colorIdx: 0, bubbleId: 1, cellKind: 'bubble', hp: 0, haunted: false },
        { row: 0, col: 1, colorIdx: 1, bubbleId: 2, cellKind: 'bubble', hp: 0, haunted: false },
      ],
    });
    expect(Array.from(db.select(['cellKind'])).length).toBe(2);

    // Second batch: 3 different cells — the first batch must be fully replaced.
    db.transactions.replaceBoardCells({
      cells: [
        { row: 1, col: 0, colorIdx: 2, bubbleId: 10, cellKind: 'bubble', hp: 0, haunted: false },
        { row: 1, col: 1, colorIdx: 3, bubbleId: 11, cellKind: 'bubble', hp: 0, haunted: false },
        { row: 1, col: 2, colorIdx: 4, bubbleId: 12, cellKind: 'bubble', hp: 0, haunted: false },
      ],
    });
    expect(Array.from(db.select(['cellKind'])).length).toBe(3);
  });
});

describe('MysteryMunchPlugin: edge-case — bridge cleanup stops propagation', () => {
  it('signal does NOT update after cleanup() is called', () => {
    const db = makeDb();
    gameState.reset();
    const cleanup = bridgeMysteryMunchToSignals(db);
    cleanup();

    // Mutation after cleanup — signal must NOT change.
    const scoreBefore = gameState.score();
    db.transactions.addScore({ amount: 500 });

    // ECS resource updated but signal should remain at the pre-cleanup value.
    expect(db.resources.score).toBe(500);
    expect(gameState.score()).toBe(scoreBefore);
  });
});
