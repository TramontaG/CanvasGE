import {
  colorFlash,
  slideReplace,
} from "../../../../Scenes/SceneManager/Transitions";
import { Vector } from "../../../../Vector";
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
    "Phisics Test",
    "normal",
    (btn) =>
      btn.transitionToScene("phisicsTest", slideReplace("left"), "replace")
  );

  const enableAudio = new LamenEmpireButton(
    "EnableAudioButton",
    buttonPosition.toAdded(new Vector(0, (buttonSize.y + 10) * 2)),
    "Enable Audio",
    "green",
    (btn) => btn.getContext()!.getSoundManager().unlock()
  );

  const playAudio = new LamenEmpireButton(
    "PlayAudioButton",
    buttonPosition.toAdded(new Vector(0, (buttonSize.y + 10) * 3)),
    "PlayAudio",
    "purple",
    (btn) => btn.getContext()!.getSoundManager().playSound("coin")
  );

  const debugButton = new LamenEmpireButton(
    "debug",
    buttonPosition.toSubtracted(new Vector(0, buttonSize.y + 10)),
    "Debug",
    "normal",
    (btn) => console.log(btn.getContext()!.getSoundManager().getLoadedSounds())
  );

  return {
    startButton,
    introButton,
    phisicsTestButton,
    enableAudio,
    playAudio,
    debugButton,
  };
};

export { createButtons };
