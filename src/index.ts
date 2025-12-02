import { Game } from "./Game";
import { prepareGame } from "./LamenEmpire";

prepareGame().then((game: Game) => {
  game.start();
});
