import {
	GameObject,
	SquareHitbox,
	Vector,
	grabbable,
	type GameEvent,
	type CanvasController,
	type Scene,
} from "sliver-engine";

const OBSTACLE_LAYOUT = [
	{
		position: new Vector(182, 88),
		size: new Vector(54, 148),
		color: "#334155",
	},
	{
		position: new Vector(302, 88),
		size: new Vector(54, 148),
		color: "#334155",
	},
] as const;

const DRAGGABLE_COLOR_ACTIVE = "#475569";

class Obstacle extends GameObject {
	constructor(
		name: string,
		position: Vector,
		size: Vector,
		private readonly color: string,
	) {
		super(name, position);
		this.addHitbox(
			new SquareHitbox(Vector.zero(), size, this, {
				solid: true,
				debug: false,
			}),
		);
	}

	override render(canvas: CanvasController, _scene: Scene): void {
		const pos = this.getPosition();
		const drawer = canvas.getShapeDrawer();
		const fillColor = this.beingGrabbed ? DRAGGABLE_COLOR_ACTIVE : this.color;
		drawer.drawRectangle(pos.x, pos.y, this.getSize().x, this.getSize().y, fillColor, true);
		drawer.drawRectangle(
			pos.x,
			pos.y,
			this.getSize().x,
			this.getSize().y,
			"rgba(15,23,42,0.45)",
			false,
		);
		drawer.drawText(
			"drag",
			pos.x + this.getSize().x / 2,
			pos.y + this.getSize().y / 2 + 4,
			"#e2e8f0",
			"12px",
			"center",
		);
	}

	private getSize(): Vector {
		return (this.getHitboxes()[0] as SquareHitbox).size;
	}

	@grabbable<Obstacle>()
	override handleEvent(event: GameEvent): void {
		super.handleEvent(event);
	}
}

export const createObstacles = (): Obstacle[] => {
	return OBSTACLE_LAYOUT.map((item, index) => {
		return new Obstacle(
			"walker-wall-" + String(index),
			item.position.clone(),
			item.size.clone(),
			item.color,
		);
	});
};
