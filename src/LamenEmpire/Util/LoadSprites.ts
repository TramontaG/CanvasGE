import type { SpriteLibrary } from "../../CanvasController/SpriteLibrary";

const loadSprites = (spriteLibrary: SpriteLibrary) => {
  return Promise.all([
    spriteLibrary.loadSpriteSheet(
      "client1",
      new URL("../assets/Cliente.png", import.meta.url),
      32,
      32
    ),
    spriteLibrary.loadSpriteSheet(
      "buttons",
      new URL("../assets/Buttons.png", import.meta.url),
      64,
      32
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant1",
      new URL("../assets/Restaurant_tier_1.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant2",
      new URL("../assets/Restaurant_tier_2.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant3",
      new URL("../assets/Restaurant_tier_3.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "restaurant4",
      new URL("../assets/Restaurant_tier_4.png", import.meta.url),
      1024,
      1024
    ),
    spriteLibrary.loadSpriteSheet(
      "cityBackground",
      new URL("../assets/City_background.png", import.meta.url),
      1024,
      1024
    ),
  ]);
};

export { loadSprites };
