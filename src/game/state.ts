import { createSignal, createRoot } from 'solid-js';

/**
 * Game state that persists across screens.
 *
 * For the Mystery Munch game, the SolidJS signals here are the **DOM bridge**
 * (per ecs-state.mdc) — the ECS database is the source of truth for game
 * state. `bridgeMysteryMunchToSignals` (in mysterymunch/state/bridge.ts)
 * propagates ECS resource changes into these signals so DOM screens
 * (LoadingScreen, StartScreen, ResultsScreen) can react.
 *
 * Pause state lives in core/systems/pause (scaffold feature).
 */

export interface GameState {
  score: () => number;
  setScore: (score: number) => void;
  addScore: (amount: number) => void;

  level: () => number;
  setLevel: (level: number) => void;
  incrementLevel: () => void;

  movesRemaining: () => number;
  setMovesRemaining: (moves: number) => void;

  starsEarned: () => number;
  setStarsEarned: (stars: number) => void;

  boardPhase: () => string;
  setBoardPhase: (phase: string) => void;

  cluesCollected: () => number;
  setCluesCollected: (clues: number) => void;

  hauntedCleared: () => number;
  setHauntedCleared: (count: number) => void;

  /** Meta-currency — placeholder of 999 in the core pass per resolved_questions oq-snack-coins-scope. */
  snackCoins: () => number;
  setSnackCoins: (coins: number) => void;

  reset: () => void;
}

function createGameState(): GameState {
  const [score, setScore] = createSignal(0);
  const [level, setLevel] = createSignal(1);
  const [movesRemaining, setMovesRemaining] = createSignal(0);
  const [starsEarned, setStarsEarned] = createSignal(0);
  const [boardPhase, setBoardPhase] = createSignal('idle');
  const [cluesCollected, setCluesCollected] = createSignal(0);
  const [hauntedCleared, setHauntedCleared] = createSignal(0);
  const [snackCoins, setSnackCoins] = createSignal(999);

  return {
    score,
    setScore,
    addScore: (amount: number) => setScore((s) => s + amount),

    level,
    setLevel,
    incrementLevel: () => setLevel((l) => l + 1),

    movesRemaining,
    setMovesRemaining,

    starsEarned,
    setStarsEarned,

    boardPhase,
    setBoardPhase,

    cluesCollected,
    setCluesCollected,

    hauntedCleared,
    setHauntedCleared,

    snackCoins,
    setSnackCoins,

    reset: () => {
      setScore(0);
      setLevel(1);
      setMovesRemaining(0);
      setStarsEarned(0);
      setBoardPhase('idle');
      setCluesCollected(0);
      setHauntedCleared(0);
      // snackCoins is meta-currency — preserved across reset.
    },
  };
}

export const gameState = createRoot(createGameState);
