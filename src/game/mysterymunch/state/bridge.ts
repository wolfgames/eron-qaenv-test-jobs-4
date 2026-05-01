/**
 * ECS → SolidJS signal bridge (per ecs-state.mdc).
 *
 * Subscribes to ECS resource observables and writes through to the
 * `gameState` DOM bridge so screens (LoadingScreen, StartScreen,
 * ResultsScreen) and any DOM HUD overlays remain reactive.
 *
 * Returns an unobserve function that the GameController must call before
 * `setActiveDb(null)` and Pixi teardown — observers must not fire into
 * destroyed renderers.
 */

import type { MysteryMunchDatabase } from './MysteryMunchPlugin';
import { gameState } from '~/game/state';

export function bridgeMysteryMunchToSignals(db: MysteryMunchDatabase): () => void {
  // Seed signals from current resource values (synchronous initial sync).
  gameState.setScore(db.resources.score);
  gameState.setMovesRemaining(db.resources.movesRemaining);
  gameState.setStarsEarned(db.resources.starsEarned);
  gameState.setBoardPhase(db.resources.boardPhase);
  gameState.setCluesCollected(db.resources.clueTilesCollected);
  gameState.setHauntedCleared(db.resources.hauntedCellsCleared);

  const unobservers: Array<() => void> = [];

  unobservers.push(
    db.observe.resources.score((v) => {
      gameState.setScore(v);
    }),
  );
  unobservers.push(
    db.observe.resources.movesRemaining((v) => {
      gameState.setMovesRemaining(v);
    }),
  );
  unobservers.push(
    db.observe.resources.starsEarned((v) => {
      gameState.setStarsEarned(v);
    }),
  );
  unobservers.push(
    db.observe.resources.boardPhase((v) => {
      gameState.setBoardPhase(v);
    }),
  );
  unobservers.push(
    db.observe.resources.clueTilesCollected((v) => {
      gameState.setCluesCollected(v);
    }),
  );
  unobservers.push(
    db.observe.resources.hauntedCellsCleared((v) => {
      gameState.setHauntedCleared(v);
    }),
  );

  return () => {
    for (const u of unobservers) {
      try {
        u();
      } catch {
        // Tolerate already-disposed observers (Pixi-first teardown order).
      }
    }
  };
}
