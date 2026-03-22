import {
	GameObject,
	SquareHitbox,
	Vector,
	type CanvasController,
	type Scene,
} from "sliver-engine";

const ACTOR_SIZE = 24;

export class CutsceneActor extends GameObject {
	public coins: number;

	constructor(
		name: string,
		position: Vector,
		private color: string,
		initialCoins: number,
	) {
		super(name, position.clone());
		this.coins = initialCoins;
		this.addHitbox(
			new SquareHitbox(Vector.zero(), new Vector(ACTOR_SIZE, ACTOR_SIZE), this, {
				solid: false,
				debug: false,
			}),
		);
		this.setPhisics({ immovable: true, affectedByGravity: false });
	}

	override render(canvas: CanvasController, _scene: Scene): void {
		const draw = canvas.getShapeDrawer();
		const pos = this.getPosition();
		draw.drawRectangle(pos.x, pos.y, ACTOR_SIZE, ACTOR_SIZE, this.color, true);
		draw.drawText(this.name, pos.x + ACTOR_SIZE / 2, pos.y - 8, "#cbd5e1", "11px", "center");
	}
}
