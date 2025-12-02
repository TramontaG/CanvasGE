import { CanvasController } from "../CanvasController";
import { Game } from "../Game";
import { Button } from "../GameObject/Library/Button";
import { Scene } from "../Scenes";
import { SceneManager } from "../Scenes/SceneManager";
import { Vector } from "../Vector";
import { Client } from "./GameObjects/Client";

const prepareGame = async () => {
  const gameConfig = {
    width: 800,
    height: 600,
  };

  const initialScene = new Scene("Main Scene", "rgb(200, 200, 255)");

  const game = new Game({
    canvas: new CanvasController(gameConfig.width, gameConfig.height),
    scenes: new SceneManager(
      {
        initialScene: initialScene,
      },
      initialScene
    ),
  });

  initialScene.addGameObject(new Client("sample player", 4, 2));

  await game.canvas
    .getShapeDrawer()
    .loadFont(
      "Raleway",
      "https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
    );

  game.canvas.getShapeDrawer().setDefaultFont("Raleway");

  initialScene.addGameObject(
    new Button(
      "sample button",
      new Vector(100, 500),
      new Vector(200, 100),
      "Font Test",
      "blue",
      () => console.log("Button clicked")
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
