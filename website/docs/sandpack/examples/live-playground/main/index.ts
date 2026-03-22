import {
	CanvasController,
	Game,
	GameObject,
	Scene,
	SceneManager,
	SoundManager,
	Vector,
} from "sliver-engine";
import { BOX_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

class BouncingBox extends GameObject {
	private direction = 1;

	constructor() {
		super("box", new Vector(40, CANVAS_HEIGHT / 2 - BOX_SIZE / 2));

		this.setTickFunction((obj) => {
			const pos = obj.getScenePosition();

			if (pos.x <= 0 || pos.x + BOX_SIZE >= CANVAS_WIDTH) {
				this.direction *= -1;
			}

			obj.translate(new Vector(2.5 * this.direction, 0));
		});

		this.setRenderFunction((obj, canvas) => {
			const pos = obj.getPosition();
			const draw = canvas.getShapeDrawer();

			draw.drawRectangle(pos.x, pos.y, BOX_SIZE, BOX_SIZE, "#ffd166", true);
			draw.drawText(
				"Edit color/size in code, then click Run",
				12,
				24,
				"#f8fafc",
				"14px",
				"left",
			);
		});
	}
}

const canvas = new CanvasController(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasElement = canvas.getCanvas();

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

canvasElement.style.width = `${CANVAS_WIDTH}px`;
canvasElement.style.height = `${CANVAS_HEIGHT}px`;
canvasElement.style.display = "block";
canvasElement.style.margin = "0 auto";

const mainScene = new Scene("main", "#111827");
mainScene.addGameObject(new BouncingBox());

const scenes = new SceneManager({ main: mainScene }, mainScene);

const game = new Game({
	canvas,
	scenes,
	soundManager: new SoundManager(),
	ticksPerSecond: 60,
});

game.start();
