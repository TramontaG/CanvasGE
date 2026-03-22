import { GameObject, SquareHitbox, Vector, type CanvasController, type Scene } from "sliver-engine";

const SIZE = new Vector(18, 18);

export class KeyPickup extends GameObject {
	constructor(position: Vector) {
		super("item:key", position.clone());
		this.addHitbox(
			new SquareHitbox(Vector.zero(), SIZE.clone(), this, {
				solid: false,
				debug: false,
			}),
		);
		this.setPhisics({ immovable: true });
	}

	override onColision(other: GameObject): void {
		if (other.name !== "player") return;
		this.sendMessage("player:key_obtained", { id: "gold" });
		this.destroy();
	}

	override render(canvas: CanvasController, _scene: Scene): void {
		const pos = this.getPosition();
		canvas
			.getShapeDrawer()
			.drawRectangle(pos.x, pos.y, SIZE.x, SIZE.y, "#facc15", true);
	}
}
