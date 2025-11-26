import { CanvasController } from "./CanvasController";
import { GameEventsdispatcher } from "./Events";
import { Game } from "./Game";
import { debugScene1, debugScene2 } from "./Scenes/DebugScenes";
import { SceneManager } from "./Scenes/SceneManager";

const GameConfig = {
  width: 800,
  height: 600,
};

const canvas = new CanvasController(GameConfig.width, GameConfig.height);

const game = new Game({
  canvas,
  scenes: new SceneManager(
    {
      debug: debugScene1,
      debug2: debugScene2,
    },
    debugScene1
  ),
});

const eventsDispatcher = new GameEventsdispatcher(
  game,
  game.getKeyAccumulator()
);

game.start();

Object.defineProperty(window, "game", {
  value: game,
  writable: false,
});
