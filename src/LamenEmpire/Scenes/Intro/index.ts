import { Scene } from "../../../Scenes";
import palette from "../../colors.json";
import { ScriptedEventRunner } from "../../GameObjects/ScriptedEventRunner";
import { createNoodleDreamIntroEvent } from "../../ScriptedEvents/NoodleDreamIntro";

const createIntroScene = () => {
  class IntroScene extends Scene {
    override setup(): void {
      super.setup();
      [...this.getGameObjects()].forEach((go) => go.destroy());
      this.addGameObject(
        new ScriptedEventRunner("IntroScript", createNoodleDreamIntroEvent())
      );
    }
  }

  return new IntroScene("Intro", palette.PrimaryEvenDarker);
};

export { createIntroScene };
