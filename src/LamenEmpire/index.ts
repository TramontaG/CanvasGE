import { CanvasController } from "../CanvasController";
import { Game } from "../Game";
import { SceneManager } from "../Scenes/SceneManager";
import { createLamenEmpireScenes } from "./Scenes";

const prepareGame = async () => {
  const gameConfig = {
    width: 800,
    height: 600,
  };

  const canvas = new CanvasController(gameConfig.width, gameConfig.height);

  await canvas
    .getShapeDrawer()
    .loadFont(
      "Tiny5",
      "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Raleway:ital,wght@0,100..900;1,100..900&family=Tiny5&display=swap"
    );

  canvas.getShapeDrawer().setDefaultFont("Tiny5");

  const spriteLibrary = canvas.getSpriteLibrary();

  await Promise.all([
    spriteLibrary.loadSpriteSheet(
      "client1",
      new URL("./assets/Cliente.png", import.meta.url),
      32,
      32
    ),
    spriteLibrary.loadSpriteSheet(
      "buttons",
      new URL("./assets/Buttons.png", import.meta.url),
      64,
      32
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant1",
      new URL("./assets/Restaurant_tier_1.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant2",
      new URL("./assets/Restaurant_tier_2.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant3",
      new URL("./assets/Restaurant_tier_3.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant4",
      new URL("./assets/Restaurant_tier_4.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "cityBackground",
      new URL("./assets/City_background.png", import.meta.url),
      1024,
      1024
    ),
  ]);

  const { menu, gameplay } = createLamenEmpireScenes(gameConfig);

  const game = new Game({
    canvas,
    scenes: new SceneManager(
      {
        menu,
        gameplay,
      },
      gameplay
    ),
  });

  return game;
};

export { prepareGame };
