import {
	CanvasController,
	Game,
	Scene,
	SceneManager,
	SoundManager,
	Vector,
} from "sliver-engine";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	HERO_SCALE,
	HERO_SPRITE_SIZE,
} from "./constants";
import { SpriteHero } from "./SpriteHero";
import { SpriteHud } from "./SpriteHud";
import { loadDemoHeroSprites } from "./spriteSetup";

const canvas = new CanvasController(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasElement = canvas.getCanvas();
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
canvasElement.style.width = "100%";
canvasElement.style.maxWidth = CANVAS_WIDTH + "px";
canvasElement.style.height = "auto";
canvasElement.style.aspectRatio = CANVAS_WIDTH + " / " + CANVAS_HEIGHT;
canvasElement.style.display = "block";
canvasElement.style.margin = "0 auto";

const scene = new Scene("sprite-demo", "#0f172a");
scene.setGravity(Vector.zero());

const hero = new SpriteHero(
	new Vector(
		(CANVAS_WIDTH - HERO_SPRITE_SIZE.x * HERO_SCALE) / 2,
		(CANVAS_HEIGHT - HERO_SPRITE_SIZE.y * HERO_SCALE) / 2,
	),
);
const hud = new SpriteHud();

scene.addGameObject([hero, hud]);

const scenes = new SceneManager({ main: scene }, scene);
const game = new Game({
	canvas,
	scenes,
	soundManager: new SoundManager(),
	ticksPerSecond: 60,
});

const boot = async (): Promise<void> => {
	try {
		await loadDemoHeroSprites(canvas);
		game.start();
	} catch (error) {
		console.warn("Could not load demo sprite sheet in this runtime", error);
	}
};

void boot();
