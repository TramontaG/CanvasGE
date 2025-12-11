import { createGameplayScene } from "./Gameplay";
import { createMenuScene } from "./Menu";
import type { LamenEmpireScenes, SceneDimensions } from "./types";

const createLamenEmpireScenes = (
  dimensions: SceneDimensions
): LamenEmpireScenes => {
  const gameplay = createGameplayScene(dimensions);
  const menu = createMenuScene(dimensions, "gameplay");

  return {
    menu,
    gameplay,
  };
};

export {
  createLamenEmpireScenes,
  createMenuScene,
  createGameplayScene,
};
export type { LamenEmpireScenes, SceneDimensions };
