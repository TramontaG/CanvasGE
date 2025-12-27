import { createGameplayScene } from "./Gameplay";
import { createMenuScene } from "./Menu";
import type { LamenEmpireGame } from "../LamenEmpireGame";
import { createPhisicsTest } from "./PhisicsTest";
import { createIntroScene } from "./Intro";
import { createPathfindingDebugScene } from "./PathfindingDebug";

const createLamenEmpireScenes = (
  dimensions: { width: number; height: number },
  getGame: () => LamenEmpireGame
) => {
  const gameplay = createGameplayScene(dimensions, getGame);
  const menu = createMenuScene(dimensions);
  const phisicsTest = createPhisicsTest(dimensions);
  const intro = createIntroScene();
  const pathfindingDebug = createPathfindingDebugScene(dimensions);

  return {
    menu,
    gameplay,
    phisicsTest,
    intro,
    pathfindingDebug,
  };
};

export { createLamenEmpireScenes, createMenuScene, createGameplayScene };
