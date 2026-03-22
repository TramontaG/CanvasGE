import {
	CanvasController,
	Game,
	Scene,
	SceneManager,
	SoundManager,
} from "sliver-engine";
import { createCharacter } from "./createCharacter";
import { createObstacles } from "./createObstacles";

const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 320;

const canvas = new CanvasController(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasElement = canvas.getCanvas();

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

canvasElement.style.width = CANVAS_WIDTH + "px";
canvasElement.style.height = CANVAS_HEIGHT + "px";
canvasElement.style.display = "block";
canvasElement.style.margin = "0 auto";

const mainScene = new Scene("walker-demo", "#0f172a");

const character = createCharacter();
const obstacles = createObstacles();

mainScene.addGameObject([character, ...obstacles]);

const scenes = new SceneManager({ main: mainScene }, mainScene);
const game = new Game({
	canvas,
	scenes,
	soundManager: new SoundManager(),
	ticksPerSecond: 60,
});

game.start();
character.walker?.start();
