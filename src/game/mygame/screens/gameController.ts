/**
 * Game Controller — Mystery Munch (Pixi mode).
 *
 * Bridge between the Solid.js GameScreen and the MysteryMunchController. The
 * scaffold contract requires `setupGame(deps) → GameController`; this file
 * delegates the heavy lifting to `mysterymunch/GameController.ts`.
 *
 * Per `game-controller.mdc`: ECS DB lifecycle, Pixi init, layer hierarchy,
 * and cleanup ordering are owned by the inner controller — keep this file
 * thin.
 */

import { createSignal } from 'solid-js';

import type {
  GameControllerDeps,
  GameController,
  SetupGame,
} from '~/game/mygame-contract';
import { createMysteryMunchController } from '~/game/mysterymunch/GameController';

export const setupGame: SetupGame = (_deps: GameControllerDeps): GameController => {
  const [ariaText, setAriaText] = createSignal('Mystery Munch — loading...');
  const inner = createMysteryMunchController();

  return {
    gameMode: 'pixi',

    init(container: HTMLDivElement) {
      setAriaText('Mystery Munch — game ready');
      inner.init(container).catch((err) => {
        // Async-init guardrail (see Dispatch rule on async ops with .catch()).
        console.error('[mysterymunch] init failed:', err);
        setAriaText('Mystery Munch — failed to load');
      });
    },

    destroy() {
      inner.destroy();
    },

    ariaText,
  };
};
