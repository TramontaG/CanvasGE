import {
CanvasController,
Game,
Scene,
SceneManager,
SoundManager,
Vector,
} from "sliver-engine";
import { createBounds } from "./createBounds";
import { createExtraSquares } from "./createExtraSquares";

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

const mainScene = new Scene("physics-options-demo", "#0f172a");
mainScene.setGravity(new Vector(0, 0.28));

const bounds = createBounds();
const extraSquares = createExtraSquares();

mainScene.addGameObject([...bounds, ...extraSquares.cyan, ...extraSquares.rose]);

const scenes = new SceneManager({ main: mainScene }, mainScene);
const game = new Game({
canvas,
scenes,
soundManager: new SoundManager(),
ticksPerSecond: 60,
});

game.start();
