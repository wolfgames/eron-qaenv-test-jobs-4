/**
 * BoardRenderer — translates ECS Block entities into a grid of BlockRenderers
 * on the Pixi stage.
 *
 * Pure-Pixi: no DOM, no per-frame allocation, no `requestAnimationFrame`.
 * Layout is computed by `computeBoardLayout()` (pure helper, unit-tested).
 *
 * Per renderers.mdc this class holds no game state — coordinates and colors
 * come from a `BoardSnapshot` passed in by the GameController each sync.
 */

import { Container, Graphics } from 'pixi.js';

import { computeBoardLayout, type BoardLayout } from './BoardLayout';
import { BlockRenderer } from './BlockRenderer';

export interface BoardCellSnapshot {
  row: number;
  col: number;
  bubbleId: number;
  colorIdx: number;
  /** 'bubble' | 'empty' | 'haunted' | 'blocker' */
  kind: string;
}

export interface BoardSnapshot {
  cols: number;
  rows: number;
  cells: ReadonlyArray<BoardCellSnapshot>;
}

export class BoardRenderer {
  readonly container: Container;
  /** Inset frame drawn behind the cells for visual separation. */
  private readonly frame: Graphics;
  private layout: BoardLayout | null = null;
  /** Stable bubbleId → BlockRenderer (renderer reuses sprites by identity). */
  private readonly blocksById = new Map<number, BlockRenderer>();
  private destroyed = false;

  constructor() {
    this.container = new Container();
    this.container.eventMode = 'passive'; // children are interactive; container propagates.

    this.frame = new Graphics();
    this.container.addChild(this.frame);
  }

  init(
    snapshot: BoardSnapshot,
    viewportW: number,
    viewportH: number,
    reservedTop: number,
    reservedBottom: number,
  ): void {
    if (this.destroyed) return;

    this.layout = computeBoardLayout({
      viewportW,
      viewportH,
      cols: snapshot.cols,
      rows: snapshot.rows,
      reservedTop,
      reservedBottom,
    });

    // Draw the inset board frame.
    this.frame.clear();
    this.frame.roundRect(
      this.layout.boardLeft - 6,
      this.layout.boardTop - 6,
      this.layout.boardWidth + 12,
      this.layout.boardHeight + 12,
      14,
    );
    this.frame.fill({ color: 0x1a1c2e, alpha: 0.8 });

    // Sync cells to children.
    this.syncBoard(snapshot);
  }

  /** Resync block sprites to a new board snapshot, reusing by stable id. */
  syncBoard(snapshot: BoardSnapshot): void {
    if (this.destroyed || !this.layout) return;

    const layout = this.layout;
    const seen = new Set<number>();

    for (const cell of snapshot.cells) {
      if (cell.kind !== 'bubble' && cell.kind !== 'haunted') continue;
      seen.add(cell.bubbleId);

      let renderer = this.blocksById.get(cell.bubbleId);
      if (!renderer) {
        renderer = new BlockRenderer({
          cellVisual: layout.cellVisual,
          cellTap: layout.cellTap,
          bubbleId: cell.bubbleId,
          colorIdx: cell.colorIdx,
        });
        this.blocksById.set(cell.bubbleId, renderer);
        this.container.addChild(renderer.container);
      } else {
        renderer.setColor(cell.colorIdx);
      }

      const x = layout.boardLeft + cell.col * layout.cellVisual + Math.floor(layout.cellVisual / 2);
      const y = layout.boardTop + cell.row * layout.cellVisual + Math.floor(layout.cellVisual / 2);
      renderer.setPosition(x, y);
    }

    // Reap blocks no longer on the board (post-clear).
    for (const [id, renderer] of this.blocksById) {
      if (!seen.has(id)) {
        renderer.destroy();
        this.blocksById.delete(id);
      }
    }
  }

  /** Read-only access to the resolved layout (used by Input handlers). */
  getLayout(): BoardLayout | null {
    return this.layout;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const renderer of this.blocksById.values()) {
      renderer.destroy();
    }
    this.blocksById.clear();
    this.container.removeAllListeners();
    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
