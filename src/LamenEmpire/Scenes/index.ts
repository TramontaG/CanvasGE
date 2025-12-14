import { createGameplayScene } from "./Gameplay";
import { createMenuScene } from "./Menu";
import type {
  GameplaySceneBindings,
  LamenEmpireScenes,
  SceneDimensions,
} from "./types";
import type { LamenEmpireGame } from "../LamenEmpireGame";

const createLamenEmpireScenes = (
  dimensions: SceneDimensions,
  getGame: () => LamenEmpireGame
): LamenEmpireScenes => {
  const gameplay = createGameplayScene(dimensions, getGame);
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
export type {
  GameplaySceneBindings,
  LamenEmpireScenes,
  SceneDimensions,
};
