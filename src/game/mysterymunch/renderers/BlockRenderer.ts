/**
 * BlockRenderer — renders a single bubble cell on the GPU.
 *
 * Each bubble is a Pixi `Container` with:
 *   - a colored circle Graphic (color tint per `BUBBLE_TYPES`)
 *   - an emoji `Text` overlay (secondary visual cue per UX guideline:
 *     "never rely on color alone")
 *
 * The container is sized to `cellVisual` and exposes `cellTap` (≥ 44 px) as
 * the hit area so a tap anywhere within the padded zone hits the bubble. An
 * idle "wobble" GSAP tween plays continuously to keep the board alive.
 *
 * Per renderers.mdc: this renderer holds **no** game state — coordinates and
 * color come from the ECS Block archetype via the BoardRenderer.
 */

import { Container, Graphics, Text, Rectangle } from 'pixi.js';
import gsap from 'gsap';

import { bubbleByIndex } from '~/game/mysterymunch/data/bubbleTypes';

export interface BlockRenderOptions {
  cellVisual: number;
  cellTap: number;
  /** Stable identity from the ECS Block archetype. */
  bubbleId: number;
  colorIdx: number;
}

export class BlockRenderer {
  readonly container: Container;
  private readonly bg: Graphics;
  private readonly emojiText: Text;
  private readonly cellVisual: number;
  private wobbleTween: gsap.core.Tween | null = null;
  private destroyed = false;

  constructor(opts: BlockRenderOptions) {
    this.cellVisual = opts.cellVisual;

    this.container = new Container();
    this.container.eventMode = 'static'; // receives pointer taps.
    const halfTap = opts.cellTap / 2;
    this.container.hitArea = new Rectangle(-halfTap, -halfTap, opts.cellTap, opts.cellTap);

    const radius = Math.floor(this.cellVisual / 2) - 2;
    this.bg = new Graphics();
    this.bg.circle(0, 0, radius);
    this.bg.fill({ color: 0xffffff, alpha: 1 });
    this.container.addChild(this.bg);

    const bubble = bubbleByIndex(opts.colorIdx);
    this.bg.tint = bubble.color;

    this.emojiText = new Text({
      text: bubble.emoji,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: Math.floor(this.cellVisual * 0.55),
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.emojiText.anchor.set(0.5, 0.5);
    this.container.addChild(this.emojiText);

    this.startIdleWobble();
  }

  /** Re-skin to a different colorIdx without recreating the container. */
  setColor(colorIdx: number): void {
    if (this.destroyed) return;
    const bubble = bubbleByIndex(colorIdx);
    this.bg.tint = bubble.color;
    this.emojiText.text = bubble.emoji;
  }

  setPosition(x: number, y: number): void {
    if (this.destroyed) return;
    this.container.position.set(x, y);
  }

  private startIdleWobble(): void {
    // Lightweight idle anim — single tween, repeat:-1, yoyo:true.
    this.wobbleTween = gsap.to(this.container, {
      pixi: { rotation: 2 }, // degrees (with PixiPlugin) — falls back to no-op without plugin.
      duration: 2.4 + Math.random() * 0.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.wobbleTween) {
      this.wobbleTween.kill();
      this.wobbleTween = null;
    }
    gsap.killTweensOf(this.container);
    this.container.removeAllListeners();
    this.container.parent?.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
