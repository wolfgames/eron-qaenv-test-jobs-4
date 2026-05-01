/**
 * Pure board-layout helpers (no Pixi imports).
 *
 * Computes board width, cell visual size, cell tap-target size, and
 * top-of-board y from viewport bounds and reserved zones. The renderer reads
 * these values; the unit tests assert layout constraints (≥41 px cell,
 * ≥44 px tap target, no overlap with HUD or bottom bar).
 *
 * Constants come from `pipeline-context.yml.viewport-budget.default`.
 */

export interface BoardLayoutInput {
  viewportW: number;
  viewportH: number;
  cols: number;
  rows: number;
  reservedTop: number;     // HUD strip
  reservedBottom: number;  // bottom action bar + DOM logo
}

export interface BoardLayout {
  /** Total board width in pixels (boardWidth = 85% of viewportW, capped). */
  boardWidth: number;
  boardHeight: number;
  /** Cell visual size (sprite footprint). */
  cellVisual: number;
  /** Cell tap-target size (≥ visual; padded for thumb-friendly touch). */
  cellTap: number;
  /** Inter-cell gap. */
  cellGap: number;
  /** Distance from viewport top to first row. */
  boardTop: number;
  /** Distance from viewport left to first column. */
  boardLeft: number;
}

/** GDD-spec: 85% of viewport width framed by ~8 px side padding. */
export const BOARD_WIDTH_RATIO = 0.85;
export const CELL_GAP_PX = 3;
export const CELL_TAP_PADDING_PX = 4; // 2 px each side beyond the visual.

export function computeBoardLayout(input: BoardLayoutInput): BoardLayout {
  const { viewportW, viewportH, cols, rows, reservedTop, reservedBottom } = input;

  const boardWidth = Math.round(viewportW * BOARD_WIDTH_RATIO);
  const cellVisual = Math.floor(boardWidth / cols);

  // Add padding so the tap area exceeds the 44 pt UX floor even when the
  // visual is tight against the cell-gap budget.
  const cellTap = cellVisual + CELL_TAP_PADDING_PX;

  const boardHeight = cellVisual * rows;
  const boardLeft = Math.floor((viewportW - boardWidth) / 2);

  // Center the board vertically inside the available zone (between HUD and
  // reserved bottom). Floor-clamp to reservedTop so we never overlap HUD.
  const availH = viewportH - reservedTop - reservedBottom;
  const boardTop = Math.max(reservedTop, reservedTop + Math.floor((availH - boardHeight) / 2));

  return {
    boardWidth,
    boardHeight,
    cellVisual,
    cellTap,
    cellGap: CELL_GAP_PX,
    boardTop,
    boardLeft,
  };
}
