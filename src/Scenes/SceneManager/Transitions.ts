import type { Scene } from "..";

export type SceneTransitionFunction = (percentage: number) => void;

export const createSceneTransition = (
  sceneA: Scene,
  sceneB: Scene,
  func: any,
  timing: any
) => {
  // both scenes active (higher on stack)
  // sceneA is the one that is being replaced
  // sceneB is the one that is being added
  // place scene B where it should
  // translate scene B with respect to the func and timing
  // when the transition is done, resolve the promise.
};
