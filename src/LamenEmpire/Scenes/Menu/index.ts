import { Scene } from "../../../Scenes";
import palette from "../../colors.json";
import { createButtons } from "./GameObjects/Buttons";

const createMenuScene = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const menuScene = new Scene("Main Menu", palette.Purple);

  const { enableAudio, playAudio, startButton, debugButton, phisicsTestButton } =
    createButtons({
      width,
      height,
    });

  menuScene.addGameObject([
    startButton,
    phisicsTestButton,
    playAudio,
    enableAudio,
    debugButton,
  ]);

  return menuScene;
};

export { createMenuScene };
