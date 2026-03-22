import {
	CanvasController,
	Game,
	Scene,
	SceneManager,
	SoundManager,
	Vector,
} from "sliver-engine";
import { createArena } from "./createArena";
import { PatrollingEnemy } from "./PatrollingEnemy";

const canvas = new CanvasController(520, 320);
const canvasElement = canvas.getCanvas();
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
canvasElement.style.width = "520px";
canvasElement.style.height = "320px";
canvasElement.style.display = "block";
canvasElement.style.margin = "0 auto";

const scene = new Scene("enemy-patrol-demo", "#0f172a");
scene.setGravity(Vector.zero());

scene.addGameObject([
	...createArena(),
	new PatrollingEnemy(new Vector(92, 72)),
]);

const scenes = new SceneManager({ main: scene }, scene);
const game = new Game({
	canvas,
	scenes,
	soundManager: new SoundManager(),
	ticksPerSecond: 60,
});

game.start();
