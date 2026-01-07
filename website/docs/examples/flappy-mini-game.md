---
title: Flappy mini game
sidebar_position: 9
---

This example shows a **tiny full game** in one file: input, gravity, pipe spawning,
scoring, game over, and restart. It is a simple Flappy-style loop.

Tip: this uses decorators, so make sure `experimentalDecorators: true` is enabled
in your `tsconfig.json`.

## Full example (single file)

```ts
import {
	CanvasController,
	Game,
	GameObject,
	Scene,
	SceneManager,
	SoundManager,
	SquareHitbox,
	Vector,
	onClick,
	onKeyPressed,
} from "sliver-engine";
import type { GameContext, GameEvent } from "sliver-engine";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;
const GROUND_HEIGHT = 80;
const GRAVITY = 0.35;
const FLAP_VELOCITY = -6.5;
const PIPE_WIDTH = 70;
const PIPE_GAP = 170;
const PIPE_SPEED = -2.6;
const PIPE_SPAWN_TICKS = 90;
const PIPE_MIN_TOP = 60;
const PIPE_MAX_TOP = CANVAS_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 60;
const BIRD_SIZE = new Vector(28, 22);
const BIRD_START = new Vector(120, CANVAS_HEIGHT / 2);
const CEILING_HEIGHT = 24;

const randomBetween = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

class Bird extends GameObject {
	private frozen = false;

	constructor(position: Vector) {
		super("bird", position);

		this.addHitbox(new SquareHitbox(Vector.zero(), BIRD_SIZE, this));
		this.setPhisics({ immovable: false, affectedByGravity: true });
		this.setRenderFunction(this.renderBird);
	}

	flap(): void {
		if (this.frozen) return;
		this.speed = new Vector(0, FLAP_VELOCITY);
	}

	freeze(): void {
		this.frozen = true;
		this.speed = Vector.zero();
		this.setPhisics({ immovable: true, affectedByGravity: false });
	}

	unfreeze(): void {
		this.frozen = false;
		this.setPhisics({ immovable: false, affectedByGravity: true });
	}

	override tick(): void {
		if (this.frozen) return;
		super.tick();
	}

	override onAddedToScene(_scene: Scene, _context: GameContext): void {
		this.onMessage("game:over", () => this.freeze());
		this.onMessage("game:reset", () => this.reset());
	}

	override onColision(other: GameObject, _penetration: Vector): void {
		if (this.frozen) return;
		if (other.name === "ceiling") return;
		this.sendMessage("game:over", null);
	}

	@onKeyPressed(" ", (obj) => {
		obj.handleInput();
	})
	@onClick<Bird>((obj) => {
		obj.handleInput();
	})
	override handleEvent(event: GameEvent): void {
		super.handleEvent(event);
	}

	private renderBird = (obj: GameObject, canvas: CanvasController): void => {
		const pos = obj.getPosition();
		canvas
			.getShapeDrawer()
			.drawRectangle(pos.x, pos.y, BIRD_SIZE.x, BIRD_SIZE.y, "#ffd166", true);
	};

	private handleInput(): void {
		if (this.frozen) {
			this.sendMessage("game:reset", null);
			return;
		}
		this.flap();
	}

	private reset(): void {
		this.setPosition(BIRD_START.clone());
		this.speed = Vector.zero();
		this.unfreeze();
	}
}

class PipePair extends GameObject {
	private passed = false;
	private frozen = false;
	private gapTopHeight: number;

	constructor(x: number, gapTopHeight: number, private bird: Bird) {
		super("pipe_pair", new Vector(x, 0));
		this.gapTopHeight = gapTopHeight;
		this.speed = new Vector(PIPE_SPEED, 0);

		const bottomHeight =
			CANVAS_HEIGHT - GROUND_HEIGHT - gapTopHeight - PIPE_GAP;

		this.addHitbox(
			new SquareHitbox(Vector.zero(), new Vector(PIPE_WIDTH, gapTopHeight), this)
		);
		this.addHitbox(
			new SquareHitbox(
				new Vector(0, gapTopHeight + PIPE_GAP),
				new Vector(PIPE_WIDTH, bottomHeight),
				this
			)
		);
		this.setRenderFunction(this.renderPipes);
	}

	setFrozen(frozen: boolean): void {
		this.frozen = frozen;
		this.speed = frozen ? Vector.zero() : new Vector(PIPE_SPEED, 0);
	}

	override tick(): void {
		if (this.frozen) return;
		super.tick();

		const pos = this.getScenePosition();
		if (pos.x + PIPE_WIDTH < 0) {
			this.destroy();
			return;
		}

		if (!this.passed && pos.x + PIPE_WIDTH < this.bird.getScenePosition().x) {
			this.passed = true;
			this.sendMessage("score:pipe", { amount: 1 });
		}
	}

	private renderPipes = (obj: GameObject, canvas: CanvasController): void => {
		const pos = obj.getPosition();
		const draw = canvas.getShapeDrawer();
		const bottomY = pos.y + this.gapTopHeight + PIPE_GAP;
		const bottomHeight =
			CANVAS_HEIGHT - GROUND_HEIGHT - this.gapTopHeight - PIPE_GAP;

		draw.drawRectangle(
			pos.x,
			pos.y,
			PIPE_WIDTH,
			this.gapTopHeight,
			"#06d6a0",
			true
		);
		draw.drawRectangle(
			pos.x,
			bottomY,
			PIPE_WIDTH,
			bottomHeight,
			"#06d6a0",
			true
		);
	};
}

class Ground extends GameObject {
	constructor() {
		super("ground", new Vector(0, CANVAS_HEIGHT - GROUND_HEIGHT));
		this.addHitbox(
			new SquareHitbox(
				Vector.zero(),
				new Vector(CANVAS_WIDTH, GROUND_HEIGHT),
				this
			)
		);
		this.setRenderFunction(this.renderGround);
	}

	private renderGround = (obj: GameObject, canvas: CanvasController): void => {
		const pos = obj.getPosition();
		canvas
			.getShapeDrawer()
			.drawRectangle(pos.x, pos.y, CANVAS_WIDTH, GROUND_HEIGHT, "#073b4c", true);
	};
}

class Ceiling extends GameObject {
	constructor() {
		super("ceiling", Vector.zero(), false);
		this.addHitbox(
			new SquareHitbox(
				Vector.zero(),
				new Vector(CANVAS_WIDTH, CEILING_HEIGHT),
				this
			)
		);
		this.setRenderFunction(() => {});
	}
}

class PipeSpawner extends GameObject {
	private pipes: PipePair[] = [];
	private ticksSincePipe = PIPE_SPAWN_TICKS;
	private paused = false;

	constructor(private bird: Bird) {
		super("pipe_spawner", Vector.zero());
	}

	override tick(): void {
		if (!this.paused) {
			this.ticksSincePipe += 1;
			if (this.ticksSincePipe >= PIPE_SPAWN_TICKS) {
				this.spawnPipe();
				this.ticksSincePipe = 0;
			}
			this.pipes = this.pipes.filter((pipe) => pipe.isActive());
		}

		super.tick();
	}

	override onAddedToScene(_scene: Scene, _context: GameContext): void {
		this.onMessage("game:over", () => this.pausePipes());
		this.onMessage("game:reset", () => this.resetPipes());
	}

	private pausePipes(): void {
		this.paused = true;
		this.pipes.forEach((pipe) => pipe.setFrozen(true));
	}

	private resetPipes(): void {
		this.paused = false;
		this.ticksSincePipe = PIPE_SPAWN_TICKS;
		this.pipes.forEach((pipe) => pipe.destroy());
		this.pipes = [];
	}

	private spawnPipe(): void {
		if (!this.scene) return;
		const gapTop = randomBetween(PIPE_MIN_TOP, PIPE_MAX_TOP);
		const pipe = new PipePair(CANVAS_WIDTH + 40, gapTop, this.bird);
		this.pipes.push(pipe);
		this.scene.addGameObject(pipe);
	}
}

class ScoreHud extends GameObject {
	private score = 0;
	private gameOver = false;

	constructor() {
		super("hud", Vector.zero());
		this.setRenderFunction(this.renderHud);
	}

	override onAddedToScene(_scene: Scene, _context: GameContext): void {
		this.onMessage<{ amount: number }>("score:pipe", ({ amount }) => {
			if (!this.gameOver) {
				this.score += amount;
			}
		});
		this.onMessage("game:over", () => {
			this.gameOver = true;
		});
		this.onMessage("game:reset", () => {
			this.gameOver = false;
			this.score = 0;
		});
	}

	private renderHud = (_obj: GameObject, canvas: CanvasController): void => {
		const draw = canvas.getShapeDrawer();
		draw.drawText(`Score: ${this.score}`, 16, 28, "white", "18px", "left");
		if (this.gameOver) {
			draw.drawText(
				"Game Over",
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2 - 20,
				"white",
				"32px",
				"center"
			);
			draw.drawText(
				"Press Space or Click to restart",
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2 + 20,
				"white",
				"16px",
				"center"
			);
		}
	};
}

const canvas = new CanvasController(CANVAS_WIDTH, CANVAS_HEIGHT);

const mainScene = new Scene("main", "#0b1a2e");
mainScene.setGravity(new Vector(0, GRAVITY));

const bird = new Bird(BIRD_START.clone());
const spawner = new PipeSpawner(bird);
const hud = new ScoreHud();
const ground = new Ground();
const ceiling = new Ceiling();

mainScene.addGameObject([bird, spawner, hud, ground, ceiling]);

const scenes = new SceneManager({ main: mainScene }, mainScene);
const game = new Game({
	canvas,
	scenes,
	soundManager: new SoundManager(),
	ticksPerSecond: 60,
});

game.start();
```
