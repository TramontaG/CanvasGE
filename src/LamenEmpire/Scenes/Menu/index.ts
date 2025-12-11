import { colorFlash } from "../../../Scenes/SceneManager/Transitions";
import { Scene } from "../../../Scenes";
import { Vector } from "../../../Vector";
import { LamenEmpireButton } from "../../GameObjects/LamenEmpireButton";
import palette from "../../colors.json";
import type { SceneDimensions } from "../types";

const createMenuScene = (
  { width, height }: SceneDimensions,
  gameplaySceneName: string
) => {
  const menuScene = new Scene("Main Menu", palette.Purple);

  const buttonScale = 3;
  const buttonSize = LamenEmpireButton.FRAME_SIZE.toMultiplied(buttonScale);

  const buttonPosition = new Vector(
    (width - buttonSize.x) / 2,
    (height - buttonSize.y) / 2
  );

  const startButton = new LamenEmpireButton(
    "StartGameButton",
    buttonPosition,
    "Start",
    "normal",
    (button) =>
      button.transitionToScene(
        gameplaySceneName,
        colorFlash(palette.Purple),
        "replace"
      ),
    { scale: buttonScale, textColor: "white", fontSize: 12 }
  );

  menuScene.addGameObject(startButton);

  return menuScene;
};

export { createMenuScene };
