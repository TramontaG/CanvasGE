import {
	CanvasController,
	Game,
	Scene,
	SceneManager,
	SoundManager,
	Vector,
} from "sliver-engine";
import { createBounds } from "./createBounds";
import { Door } from "./Door";
import { KeyPickup } from "./KeyPickup";
import { Player } from "./Player";

const canvas = new CanvasController(520, 320);
const canvasElement = canvas.getCanvas();
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
canvasElement.style.width = "520px";
canvasElement.style.height = "320px";
canvasElement.style.display = "block";
canvasElement.style.margin = "0 auto";

const scene = new Scene("door-key-demo", "#0f172a");
scene.setGravity(Vector.zero());

scene.addGameObject([
	...createBounds(),
	new Player(new Vector(72, 150)),
	new KeyPickup(new Vector(200, 150)),
	new Door(new Vector(376, 124)),
]);

const scenes = new SceneManager({ main: scene }, scene);
const game = new Game({
	canvas,
	scenes,
	soundManager: new SoundManager(),
	ticksPerSecond: 60,
});

game.start();
