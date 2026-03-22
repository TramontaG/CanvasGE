import {
	GameObject,
	SquareHitbox,
	Vector,
	type CanvasController,
	type GameContext,
	type Scene,
} from "sliver-engine";

const SIZE = new Vector(26, 56);

export class Door extends GameObject {
	public open = false;

	constructor(position: Vector) {
		super("door", position.clone());
		this.addHitbox(
			new SquareHitbox(Vector.zero(), SIZE.clone(), this, {
				solid: true,
				debug: false,
			}),
		);
		this.setPhisics({ immovable: true });
	}

	override onAddedToScene(_scene: Scene, _context: GameContext): void {
		this.onceOnMessage<{ id: string }>("player:key_obtained", ({ id }) => {
			if (id !== "gold") return;
			this.open = true;
			this.getHitboxes().forEach((h) => {
				h.solid = false;
			});
		});
	}

	override render(canvas: CanvasController, _scene: Scene): void {
		const pos = this.getPosition();
		canvas
			.getShapeDrawer()
			.drawRectangle(
				pos.x,
				pos.y,
				SIZE.x,
				SIZE.y,
				this.open ? "#22c55e" : "#ef4444",
				true,
			);
	}
}
