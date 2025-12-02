import { CanvasController } from "../CanvasController";
import { Game } from "../Game";
import { Box } from "../GameObject/Library/Box";
import { Button } from "../GameObject/Library/Button";
import { Scene } from "../Scenes";
import { SceneManager } from "../Scenes/SceneManager";
import {
  colorFlash,
  fadeTransition,
  slideFrom,
} from "../Scenes/SceneManager/Transitions";
import { Vector } from "../Vector";
import { Client } from "./GameObjects/Client";

const prepareGame = async () => {
  const gameConfig = {
    width: 800,
    height: 600,
  };

  const initialScene = new Scene("Main Scene", "rgb(200, 200, 255)");
  const transitionPlayground = new Scene(
    "Transition Playground",
    "rgb(255, 240, 180)"
  );

  transitionPlayground.addGameObject(
    new Box(new Vector(260, 180), new Vector(280, 180), "red")
  );

  const game = new Game({
    canvas: new CanvasController(gameConfig.width, gameConfig.height),
    scenes: new SceneManager(
      {
        initialScene: initialScene,
        transitionPlayground,
      },
      initialScene
    ),
  });

  initialScene.addGameObject(new Client("sample player", 4, 1));

  await game.canvas
    .getShapeDrawer()
    .loadFont(
      "Raleway",
      "https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
    );

  game.canvas.getShapeDrawer().setDefaultFont("Raleway");

  const buttonSize = new Vector(200, 70);

  initialScene.addGameObject(
    new Button(
      "SampleButton",
      new Vector(50, 500),
      buttonSize,
      "Fade to Playground",
      "blue",
      (btn) =>
        btn.transitionToScene(
          "transitionPlayground",
          fadeTransition(450),
          "replace"
        )
    )
  );

  initialScene.addGameObject(
    new Button(
      "SlideRightButton",
      new Vector(300, 500),
      buttonSize,
      "Slide Right (push)",
      "purple",
      (btn) =>
        btn.transitionToScene(
          "transitionPlayground",
          slideFrom("right", gameConfig.width),
          "push"
        )
    )
  );

  initialScene.addGameObject(
    new Button(
      "SlideDownButton",
      new Vector(550, 500),
      buttonSize,
      "Slide Down (replace)",
      "darkgreen",
      (btn) =>
        btn.transitionToScene(
          "transitionPlayground",
          slideFrom("down", gameConfig.height),
          "replace"
        )
    )
  );

  initialScene.addGameObject(
    new Button(
      "ColorFlashButton",
      new Vector(550, 410),
      buttonSize,
      "Color Flash (Blue)",
      "crimson",
      (btn) =>
        btn.transitionToScene(
          "transitionPlayground",
          colorFlash("blue"),
          "replace"
        )
    )
  );

  transitionPlayground.addGameObject(
    new Button(
      "BackFadeButton",
      new Vector(50, 500),
      buttonSize,
      "Back (Fade)",
      "teal",
      (btn) =>
        btn.transitionToScene("initialScene", fadeTransition(300), "replace")
    )
  );

  // transitionPlayground.addGameObject(
  //   new Button("Back", new Vector(50, 500), buttonSize, "Back", "teal", (btn) =>
  //     btn.setCurrentScene("initialScene")
  //   )
  // );

  transitionPlayground.addGameObject(
    new Button(
      "BackSlideLeftButton",
      new Vector(300, 500),
      buttonSize,
      "Back (Slide Left)",
      "brown",
      (btn) =>
        btn.transitionToScene(
          "initialScene",
          slideFrom("left", gameConfig.width),
          "replace"
        )
    )
  );

  transitionPlayground.addGameObject(
    new Button(
      "BackSlideUpPushButton",
      new Vector(550, 500),
      buttonSize,
      "Back (Slide Up / push)",
      "orange",
      (btn) =>
        btn.transitionToScene(
          "initialScene",
          slideFrom("up", gameConfig.height),
          "push"
        )
    )
  );

  await game.canvas
    .getSpriteLibrary()
    .loadSpriteSheet(
      "client1",
      new URL("./assets/Cliente.png", import.meta.url),
      32,
      32
    );

  return game;
};

export { prepareGame };
