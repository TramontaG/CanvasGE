import { CanvasController } from "../CanvasController";
import { SceneManager } from "../Scenes/SceneManager";
import { createLamenEmpireScenes } from "./Scenes";
import { LamenEmpireGame } from "./LamenEmpireGame";
import { loadSprites } from "./Util/LoadSprites";
import { loadFont } from "./Util/LoadFonts";
import { SoundManager } from "../SoundManager";
import { loadAudios } from "./Util/LoadSounds";

const prepareGame = async () => {
  const gameConfig = {
    width: 800,
    height: 600,
  };

  const canvas = new CanvasController(gameConfig.width, gameConfig.height);

  await loadFont(canvas.getShapeDrawer());
  await loadSprites(canvas.getSpriteLibrary());

  let gameInstance!: LamenEmpireGame;
  const getGame = () => gameInstance;

  const soundManager = new SoundManager();
  await loadAudios(soundManager);

  const { menu, gameplay, phisicsTest, intro } = createLamenEmpireScenes(
    gameConfig,
    getGame
  );

  const game = new LamenEmpireGame({
    canvas,
    soundManager: soundManager,
    scenes: new SceneManager(
      {
        menu,
        gameplay: gameplay.scene,
        phisicsTest,
        intro,
      },
      menu
    ),
  });

  gameInstance = game;
  game.registerGameplayBindings(gameplay);

  return game;
};

export { prepareGame };
