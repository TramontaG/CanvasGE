import { CanvasController } from "./CanvasController";
import { GameEventsdispatcher } from "./Events";
import { Game } from "./Game";
import { prepareGame } from "./LamenEmpire";
import { debugScene1, debugScene2 } from "./Scenes/DebugScenes";
import { SceneManager } from "./Scenes/SceneManager";

prepareGame().then((game: Game) => {
  game.start();
});
