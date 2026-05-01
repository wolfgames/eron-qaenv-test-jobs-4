import { Show } from 'solid-js';
import { useScreen } from '~/core/systems/screens';
import { Button } from '~/core/ui/Button';
import { gameState } from '~/game/state';

/**
 * Mystery Munch results screen — branches between win, loss, and stub
 * states from the ECS-bridged signals (`gameState.boardPhase`).
 *
 * Per the plan's collision-resolved warning, the loss copy is "Almost there,
 * pal!" (GDD brand voice replaces the scaffold's "Game Over"). Full win
 * fanfare and 3-option continue flow land in batch 4; this batch establishes
 * the screen branching skeleton so navigation is intact end-to-end.
 */
export function ResultsScreen() {
  const { goto } = useScreen();

  const handlePlayAgain = () => {
    gameState.reset();
    goto('game');
  };

  const handleMainMenu = () => {
    goto('start');
  };

  return (
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-black px-6">
      <Show
        when={gameState.boardPhase() === 'won'}
        fallback={
          <h1 class="text-3xl font-bold text-white mb-2">
            Almost there, pal!
          </h1>
        }
      >
        <h1 class="text-3xl font-bold text-amber-300 mb-2">
          Mystery Solved!
        </h1>
      </Show>

      <div class="text-center mb-8">
        <p class="text-white/60 text-sm mb-1">Score</p>
        <p class="text-5xl font-bold text-white">
          {gameState.score()}
        </p>
      </div>

      <div class="flex gap-4">
        <Button onClick={handlePlayAgain}>
          Play Again
        </Button>
        <Button variant="secondary" onClick={handleMainMenu}>
          Main Menu
        </Button>
      </div>
    </div>
  );
}
