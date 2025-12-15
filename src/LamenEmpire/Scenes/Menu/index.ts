import { Scene } from "../../../Scenes";
import palette from "../../colors.json";
import type { SceneDimensions } from "../types";
import { createButtons } from "./GameObjects/Buttons";

const createMenuScene = ({ width, height }: SceneDimensions) => {
  const menuScene = new Scene("Main Menu", palette.Purple);

  const { enableAudio, playAudio, startButton, debugButton } = createButtons({
    width,
    height,
  });

  menuScene.addGameObject([startButton, playAudio, enableAudio, debugButton]);

  return menuScene;
};

export { createMenuScene };
