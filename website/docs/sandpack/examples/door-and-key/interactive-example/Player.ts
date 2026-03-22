import {
	GameObject,
	SquareHitbox,
	Vector,
	onKeyHold,
	type CanvasController,
	type GameEvent,
	type Scene,
} from "sliver-engine";

const SIZE = new Vector(20, 20);
const STEP = 2;
const MIN_X = 36;
const MAX_X = 520 - 56;
const MIN_Y = 36;
const MAX_Y = 320 - 56;

export class Player extends GameObject {
	constructor(position: Vector) {
		super("player", position.clone());
		this.addHitbox(
			new SquareHitbox(Vector.zero(), SIZE.clone(), this, { solid: true, debug: false }),
		);
		this.setPhisics({
			immovable: false,
			affectedByGravity: false,
			mass: 1,
			friction: 0,
			restitution: 0,
		});
	}

	@onKeyHold<Player>("w", (obj) => obj.moveBy(new Vector(0, -STEP)))
	@onKeyHold<Player>("a", (obj) => obj.moveBy(new Vector(-STEP, 0)))
	@onKeyHold<Player>("s", (obj) => obj.moveBy(new Vector(0, STEP)))
	@onKeyHold<Player>("d", (obj) => obj.moveBy(new Vector(STEP, 0)))
	override handleEvent(event: GameEvent): void {
		super.handleEvent(event);
	}

	private moveBy(delta: Vector): void {
		this.translate(delta);
		const pos = this.getPosition();
		this.setPosition(
			new Vector(
				Math.max(MIN_X, Math.min(MAX_X, pos.x)),
				Math.max(MIN_Y, Math.min(MAX_Y, pos.y)),
			),
		);
	}

	override render(canvas: CanvasController, _scene: Scene): void {
		const pos = this.getPosition();
		canvas
			.getShapeDrawer()
			.drawRectangle(pos.x, pos.y, SIZE.x, SIZE.y, "#38bdf8", true);
	}
}
