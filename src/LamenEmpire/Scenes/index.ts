import { createGameplayScene } from "./Gameplay";
import { createMenuScene } from "./Menu";
import type { LamenEmpireGame } from "../LamenEmpireGame";
import { createPhisicsTest } from "./PhisicsTest";
import { createIntroScene } from "./Intro";

const createLamenEmpireScenes = (
  dimensions: { width: number; height: number },
  getGame: () => LamenEmpireGame
) => {
  const gameplay = createGameplayScene(dimensions, getGame);
  const menu = createMenuScene(dimensions);
  const phisicsTest = createPhisicsTest(dimensions);
  const intro = createIntroScene();

  return {
    menu,
    gameplay,
    phisicsTest,
    intro,
  };
};

export { createLamenEmpireScenes, createMenuScene, createGameplayScene };
