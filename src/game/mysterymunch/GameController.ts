/**
 * MysteryMunch GameController — central integration point per
 * `game-controller.mdc`.
 *
 * Wiring sequence (per the Wiring Pattern in the rules):
 *   1. Create ECS DB from MysteryMunchPlugin → setActiveDb(db) →
 *      bridgeMysteryMunchToSignals(db).
 *   2. Init Pixi Application (resizeTo container, resolution capped at 2);
 *      build layer hierarchy (bg, board, hud, ui).
 *   3. Instantiate BoardRenderer & HUD (HUD is a stub here, finished in
 *      batch 2) with viewport bounds.
 *   4. Seed an initial 8×8 board through the `replaceBoardCells`
 *      transaction so the board is visible at mount.
 *
 * Cleanup order (per the Cleanup Contract): GSAP tweens → Pixi app → ECS
 * bridge → setActiveDb(null). ECS observers must not fire into destroyed
 * renderers.
 */

import gsap from 'gsap';

import { setActiveDb } from '~/core/systems/ecs';
import { mysteryMunchPlugin, type MysteryMunchDatabase } from './state/MysteryMunchPlugin';
import { bridgeMysteryMunchToSignals } from './state/bridge';
import type { BoardRenderer, BoardSnapshot, BoardCellSnapshot } from './renderers/BoardRenderer';
import { seedBoard } from './state/logic/seedBoard';
import { Database } from '@adobe/data/ecs';

// Pixi types only — runtime imports are deferred to init() so node-side test
// environments (which don't have `navigator`) can still load this module.
import type { Application, Container } from 'pixi.js';

const HUD_PX = 120;
const BOTTOM_BAR_PX = 96;
const DOM_RESERVED_BOTTOM = 64;

export interface MysteryMunchControllerHandle {
  init(container: HTMLDivElement): Promise<void>;
  destroy(): void;
  /** Test seam — read the active ECS db (returns null after destroy). */
  getDb(): MysteryMunchDatabase | null;
}

/**
 * Factory — created from the host scaffold's `setupGame()` (see
 * `src/game/mygame/screens/gameController.ts`).
 */
export function createMysteryMunchController(): MysteryMunchControllerHandle {
  let db: MysteryMunchDatabase | null = null;
  let unbridge: (() => void) | null = null;
  let app: Application | null = null;
  let bgLayer: Container | null = null;
  let boardLayer: Container | null = null;
  let hudLayer: Container | null = null;
  let uiLayer: Container | null = null;
  let board: BoardRenderer | null = null;
  let mounted = false;

  function snapshotFromDb(d: MysteryMunchDatabase, cols: number, rows: number): BoardSnapshot {
    const cells: BoardCellSnapshot[] = [];
    for (const entity of d.select(['cellKind', 'row', 'col', 'colorIdx', 'bubbleId'])) {
      const row = d.get(entity, 'row');
      const col = d.get(entity, 'col');
      const bubbleId = d.get(entity, 'bubbleId');
      const colorIdx = d.get(entity, 'colorIdx');
      const cellKind = d.get(entity, 'cellKind');
      if (
        row === undefined ||
        col === undefined ||
        bubbleId === undefined ||
        colorIdx === undefined ||
        cellKind === undefined
      ) continue;
      cells.push({ row, col, bubbleId, colorIdx, kind: cellKind });
    }
    return { cols, rows, cells };
  }

  return {
    async init(container: HTMLDivElement) {
      if (mounted) return;
      mounted = true;

      // 1. ECS DB + bridge.
      db = Database.create(mysteryMunchPlugin);
      setActiveDb(db);
      unbridge = bridgeMysteryMunchToSignals(db);
      db.transactions.resetGameResources();
      db.transactions.setRngSeed({ seed: 31337 });

      // 2. Pixi Application — dynamic import keeps node test env happy.
      const pixi = await import('pixi.js');
      const { BoardRenderer: BoardRendererCtor } = await import('./renderers/BoardRenderer');
      app = new pixi.Application();
      await app.init({
        resizeTo: container,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        background: '#0e1024',
        antialias: true,
      });
      // Guard: destroy() may have run while init was awaiting.
      if (!mounted || !app) {
        app?.destroy(true, { children: true });
        app = null;
        return;
      }
      container.appendChild(app.canvas as HTMLCanvasElement);

      app.stage.eventMode = 'static';

      bgLayer = new pixi.Container();
      bgLayer.eventMode = 'none';
      boardLayer = new pixi.Container();
      boardLayer.eventMode = 'passive';
      hudLayer = new pixi.Container();
      hudLayer.eventMode = 'passive';
      uiLayer = new pixi.Container();
      uiLayer.eventMode = 'passive';

      app.stage.addChild(bgLayer, boardLayer, hudLayer, uiLayer);

      const w = app.screen.width;
      const h = app.screen.height;
      const bg = new pixi.Graphics();
      bg.rect(0, 0, w, h);
      bg.fill({ color: 0x0e1024 });
      bgLayer.addChild(bg);

      // 3. Seed board in ECS, then render.
      const cols = 8;
      const rows = 8;
      const snapshot = seedBoard({
        cols,
        rows,
        seed: db.resources.rngSeed || 31337,
        colorCount: 5,
      });
      db.transactions.replaceBoardCells({
        cells: snapshot.cells.map((c) => ({
          row: c.row,
          col: c.col,
          colorIdx: c.colorIdx,
          bubbleId: c.bubbleId,
          cellKind: c.kind,
          hp: 0,
          haunted: false,
        })),
      });

      board = new BoardRendererCtor();
      boardLayer.addChild(board.container);
      board.init(
        snapshotFromDb(db, cols, rows),
        w,
        h,
        HUD_PX,
        BOTTOM_BAR_PX + DOM_RESERVED_BOTTOM,
      );
    },

    destroy() {
      if (!mounted) return;
      mounted = false;

      // Cleanup order: GSAP tweens → Pixi app → ECS bridge → setActiveDb(null).
      gsap.globalTimeline.getChildren(true, true, true).forEach((t) => t.kill());

      if (board) {
        board.destroy();
        board = null;
      }
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
      bgLayer = boardLayer = hudLayer = uiLayer = null;

      if (unbridge) {
        unbridge();
        unbridge = null;
      }
      setActiveDb(null);
      db = null;
    },

    getDb() {
      return db;
    },
  };
}
