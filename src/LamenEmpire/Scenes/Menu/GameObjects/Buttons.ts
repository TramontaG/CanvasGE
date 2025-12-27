import {
  colorFlash,
  slideReplace,
} from "../../../../Scenes/SceneManager/Transitions";
import { Vector } from "../../../../Lib/Vector";
import { LamenEmpireButton } from "../../../GameObjects/LamenEmpireButton";
import type { SceneDimensions } from "../../types";

const buttonScale = 3;
const buttonSize = LamenEmpireButton.FRAME_SIZE.toMultiplied(buttonScale);

const createButtons = ({ width, height }: SceneDimensions) => {
  const buttonPosition = new Vector(
    (width - buttonSize.x) / 2,
    (height - buttonSize.y) / 2
  );

  const startButton = new LamenEmpireButton(
    "StartGameButton",
    buttonPosition,
    "Start",
    "normal",
    (btn) => {
      btn.getContext()!.getSoundManager().unlock();
      btn.transitionToScene("intro", slideReplace("right"), "replace");
    }
  );

  const introButton = new LamenEmpireButton(
    "IntroButton",
    buttonPosition.toSubtracted(new Vector(0, (buttonSize.y + 10) * 2)),
    "Intro",
    "purple",
    (btn) => {
      btn.getContext()!.getSoundManager().unlock();
      btn.transitionToScene("intro", slideReplace("right"), "replace");
    }
  );

  const phisicsTestButton = new LamenEmpireButton(
    "PhisicsTestButton",
    buttonPosition.toAdded(new Vector(0, buttonSize.y + 10)),
    "Physics",
    "green",
    (btn) =>
      btn.transitionToScene("phisicsTest", slideReplace("left"), "replace")
  );

  const debugButton = new LamenEmpireButton(
    "debug",
    buttonPosition.toSubtracted(new Vector(0, buttonSize.y + 10)),
    "Debug",
    "green",
    (btn) =>
      btn.transitionToScene("pathfindingDebug", slideReplace("left"), "replace")
  );

  return {
    startButton,
    introButton,
    phisicsTestButton,
    debugButton,
  };
};

export { createButtons };
