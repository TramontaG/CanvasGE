import type { Scene } from "..";
import { Vector } from "../../Vector";

type TransitionScenes = {
  from: Scene | null;
  to: Scene;
};

export type SceneTransitionFunction = (
  progress: number,
  scenes: TransitionScenes
) => void;

export type SceneTransition = {
  duration: number;
  easing?: (t: number) => number;
  setup?: SceneTransitionFunction;
  step: SceneTransitionFunction;
  cleanup?: SceneTransitionFunction;
};

const linearEasing = (t: number) => t;
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

const createSceneTransition = (
  step: SceneTransitionFunction,
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    setup?: SceneTransitionFunction;
    cleanup?: SceneTransitionFunction;
  }
): SceneTransition => ({
  duration: options?.duration ?? 500,
  easing: options?.easing,
  setup: options?.setup,
  step,
  cleanup: options?.cleanup,
});

const fadeTransition = (duration: number = 450): SceneTransition =>
  createSceneTransition(
    (progress, { from, to }) => {
      if (from) {
        from.setOpacity(1 - progress);
      }
      to.setOpacity(progress);
    },
    {
      duration,
      setup: (_, { to }) => {
        to.setOpacity(0);
      },
      cleanup: (_, { from, to }) => {
        if (from) {
          from.setOpacity(1);
        }
        to.setOpacity(1);
      },
    }
  );

type SlideDirection = "left" | "right" | "up" | "down";

const slideFrom = (
  direction: SlideDirection,
  distance: number = 400,
  duration: number = 500
): SceneTransition => {
  const directionVectorMap: Record<SlideDirection, Vector> = {
    left: new Vector(-distance, 0),
    right: new Vector(distance, 0),
    up: new Vector(0, -distance),
    down: new Vector(0, distance),
  };

  const offsetVector = directionVectorMap[direction];

  return createSceneTransition(
    (progress, { from, to }) => {
      const incomingOffset = offsetVector.toMultiplied(1 - progress);
      to.setOffset(incomingOffset);

      if (from) {
        const outgoingOffset = offsetVector.toMultiplied(-progress);
        from.setOffset(outgoingOffset);
      }
    },
    {
      duration,
      easing: easeInOut,
      setup: (_, { to }) => {
        to.setOffset(offsetVector);
        to.setOpacity(1);
      },
      cleanup: (_, { from, to }) => {
        to.setOffset(Vector.zero());
        if (from) {
          from.setOffset(Vector.zero());
        }
      },
    }
  );
};

const colorFlash = (
  color: string = "white",
  duration: number = 750
): SceneTransition =>
  createSceneTransition(
    (progress, { from, to }) => {
      const flashAlpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      if (progress < 0.5) {
        to.setOpacity(0);
        from?.setOpacity(1);
      } else {
        to.setOpacity(1);
        from?.setOpacity(0);
      }

      to.setOverlay(color, flashAlpha);
      if (from) {
        from.setOverlay(color, flashAlpha);
      }
    },
    {
      duration,
      easing: easeInOut,
      setup: (_, { from, to }) => {
        to.setOpacity(0);
        from?.setOpacity(1);
        to.setOverlay(color, 0);
        if (from) {
          from.setOverlay(color, 0);
        }
      },
      cleanup: (_, { from, to }) => {
        to.setOpacity(1);
        from?.setOpacity(1);
        to.setOverlay(null, 0);
        if (from) {
          from.setOverlay(null, 0);
        }
      },
    }
  );

export {
  createSceneTransition,
  fadeTransition,
  slideFrom,
  colorFlash,
  easeInOut,
  linearEasing,
};
export type { TransitionScenes, SlideDirection };
