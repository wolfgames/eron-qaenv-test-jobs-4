/**
 * BoardRenderer tests — layout budget at 390×844 viewport.
 *
 * Tests run against pure layout helpers so they do not require a Pixi
 * render context. The renderer itself uses these helpers; mismatching the
 * helper output and the visual is caught by the integration acceptance test.
 */

import { describe, it, expect } from 'vitest';
import { computeBoardLayout } from './BoardLayout';
import { BUBBLE_TYPES } from '~/game/mysterymunch/data/bubbleTypes';

const VW = 390;
const VH = 844;
const HUD_PX = 120;
const BOTTOM_BAR_PX = 96;
const DOM_RESERVED_BOTTOM = 64;

describe('BoardRenderer: layout budget', () => {
  it('board width equals 332px at 390px viewport', () => {
    const layout = computeBoardLayout({
      viewportW: VW,
      viewportH: VH,
      cols: 8,
      rows: 8,
      reservedTop: HUD_PX,
      reservedBottom: BOTTOM_BAR_PX + DOM_RESERVED_BOTTOM,
    });
    expect(layout.boardWidth).toBe(332);
  });

  it('cell visual size ≥41px for 8x8 grid', () => {
    const layout = computeBoardLayout({
      viewportW: VW,
      viewportH: VH,
      cols: 8,
      rows: 8,
      reservedTop: HUD_PX,
      reservedBottom: BOTTOM_BAR_PX + DOM_RESERVED_BOTTOM,
    });
    expect(layout.cellVisual).toBeGreaterThanOrEqual(41);
  });

  it('cell tap target ≥44px', () => {
    const layout = computeBoardLayout({
      viewportW: VW,
      viewportH: VH,
      cols: 8,
      rows: 8,
      reservedTop: HUD_PX,
      reservedBottom: BOTTOM_BAR_PX + DOM_RESERVED_BOTTOM,
    });
    expect(layout.cellTap).toBeGreaterThanOrEqual(44);
  });

  it('board does not overlap HUD (top 120px reserved)', () => {
    const layout = computeBoardLayout({
      viewportW: VW,
      viewportH: VH,
      cols: 8,
      rows: 8,
      reservedTop: HUD_PX,
      reservedBottom: BOTTOM_BAR_PX + DOM_RESERVED_BOTTOM,
    });
    expect(layout.boardTop).toBeGreaterThanOrEqual(HUD_PX);
  });

  it('board does not overlap bottom bar (bottom 96px reserved)', () => {
    const layout = computeBoardLayout({
      viewportW: VW,
      viewportH: VH,
      cols: 8,
      rows: 8,
      reservedTop: HUD_PX,
      reservedBottom: BOTTOM_BAR_PX + DOM_RESERVED_BOTTOM,
    });
    const boardBottom = layout.boardTop + layout.boardHeight;
    const reservedBottomTop = VH - BOTTOM_BAR_PX - DOM_RESERVED_BOTTOM;
    expect(boardBottom).toBeLessThanOrEqual(reservedBottomTop);
  });

  it('renders 5 distinct bubble types with color + emoji icon dual cue', () => {
    // Acceptance row: "5 distinct bubble types are visually distinguishable
    // (color + emoji icon dual cue)" — assert the type registry has 5
    // entries with distinct color AND distinct emoji. (Data-side check; the
    // renderer reads the same registry.)
    expect(BUBBLE_TYPES.length).toBe(5);
    const colors = new Set(BUBBLE_TYPES.map((b) => b.color));
    const emojis = new Set(BUBBLE_TYPES.map((b) => b.emoji));
    expect(colors.size).toBe(5);
    expect(emojis.size).toBe(5);
  });
});

// ── Edge-case tests: seedBoard + layout (added by stabilize phase) ────────

import { seedBoard } from '~/game/mysterymunch/state/logic/seedBoard';

describe('seedBoard: edge-case — deterministic output', () => {
  it('produces identical boards for the same seed', () => {
    const a = seedBoard({ cols: 8, rows: 8, seed: 12345, colorCount: 5 });
    const b = seedBoard({ cols: 8, rows: 8, seed: 12345, colorCount: 5 });
    // Each cell must have identical colorIdx and bubbleId ordering.
    expect(a.cells.map((c) => c.colorIdx)).toEqual(b.cells.map((c) => c.colorIdx));
    expect(a.cells.map((c) => c.bubbleId)).toEqual(b.cells.map((c) => c.bubbleId));
  });

  it('produces different boards for different seeds', () => {
    const a = seedBoard({ cols: 8, rows: 8, seed: 1, colorCount: 5 });
    const b = seedBoard({ cols: 8, rows: 8, seed: 99999, colorCount: 5 });
    const identical = a.cells.every((c, i) => c.colorIdx === b.cells[i]?.colorIdx);
    expect(identical).toBe(false);
  });

  it('all bubbleIds are unique within a seeded board', () => {
    const snap = seedBoard({ cols: 8, rows: 8, seed: 31337, colorCount: 5 });
    const ids = snap.cells.map((c) => c.bubbleId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all colorIdx values are within the colorCount range', () => {
    const colorCount = 3;
    const snap = seedBoard({ cols: 8, rows: 8, seed: 42, colorCount });
    for (const cell of snap.cells) {
      expect(cell.colorIdx).toBeGreaterThanOrEqual(0);
      expect(cell.colorIdx).toBeLessThan(colorCount);
    }
  });
});

describe('BoardLayout: edge-case — layout invariants', () => {
  it('board bottom does not exceed viewport minus reserved bottom even on a tall board', () => {
    // Edge case: very large rows (e.g. 10) — board bottom must remain above the reserve.
    const reservedTop = 120;
    const reservedBottom = 160;
    const viewportH = 844;
    const layout = computeBoardLayout({
      viewportW: 390,
      viewportH,
      cols: 8,
      rows: 10,
      reservedTop,
      reservedBottom,
    });
    const boardBottom = layout.boardTop + layout.boardHeight;
    // Board top must respect reservedTop.
    expect(layout.boardTop).toBeGreaterThanOrEqual(reservedTop);
    // Board must fit within available vertical space.
    expect(boardBottom).toBeLessThanOrEqual(viewportH - reservedBottom);
  });

  it('boardTop never falls above reservedTop', () => {
    const reservedTop = 120;
    const layout = computeBoardLayout({
      viewportW: 390,
      viewportH: 844,
      cols: 8,
      rows: 8,
      reservedTop,
      reservedBottom: 160,
    });
    expect(layout.boardTop).toBeGreaterThanOrEqual(reservedTop);
  });

  it('cellTap always exceeds cellVisual (padding enforced)', () => {
    // No matter the viewport, the tap area must exceed the visual area.
    const layout = computeBoardLayout({
      viewportW: 390,
      viewportH: 844,
      cols: 8,
      rows: 8,
      reservedTop: 120,
      reservedBottom: 160,
    });
    expect(layout.cellTap).toBeGreaterThan(layout.cellVisual);
  });
});
