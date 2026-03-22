import {
	CanvasController,
	Game,
	GameObject,
	Scene,
	SceneManager,
	SoundManager,
	Vector,
} from "sliver-engine";
import { CutsceneActor } from "./CutsceneActor";
import { CutsceneHud } from "./CutsceneHud";
import { CutsceneRunner } from "./CutsceneRunner";

const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 320;

class Backdrop extends GameObject {
	constructor() {
		super("cutscene-backdrop", Vector.zero());
		this.setPhisics({ immovable: true, affectedByGravity: false });
	}

	override render(canvas: CanvasController, _scene: Scene): void {
		const draw = canvas.getShapeDrawer();
		draw.drawRectangle(0, 238, CANVAS_WIDTH, 82, "#1e293b", true);
	}
}

const canvas = new CanvasController(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasElement = canvas.getCanvas();
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
canvasElement.style.width = CANVAS_WIDTH + "px";
canvasElement.style.height = CANVAS_HEIGHT + "px";
canvasElement.style.display = "block";
canvasElement.style.margin = "0 auto";

const scene = new Scene("cutscene-demo", "#0f172a");
scene.setGravity(Vector.zero());

const elder = new CutsceneActor("elder", new Vector(128, 206), "#f97316", 20);
const hero = new CutsceneActor("hero", new Vector(360, 206), "#38bdf8", 2);
const hud = new CutsceneHud(elder, hero);
const runner = new CutsceneRunner(elder, hero);

scene.addGameObject([new Backdrop(), elder, hero, hud, runner]);

const scenes = new SceneManager({ main: scene }, scene);
const game = new Game({
	canvas,
	scenes,
	soundManager: new SoundManager(),
	ticksPerSecond: 60,
});

game.start();
