import { GameObject, SquareHitbox, Vector } from "sliver-engine";

type ObstacleDef = { name: string; position: Vector; size: Vector; color: string };

const BOUNDS: ObstacleDef[] = [
	{ name: "ceiling", position: new Vector(20, 20), size: new Vector(440, 16), color: "#334155" },
	{ name: "floor", position: new Vector(20, 284), size: new Vector(440, 16), color: "#334155" },
	{ name: "left-wall", position: new Vector(20, 36), size: new Vector(16, 248), color: "#334155" },
	{ name: "right-wall", position: new Vector(444, 36), size: new Vector(16, 248), color: "#334155" },
	{ name: "block-a", position: new Vector(196, 92), size: new Vector(28, 120), color: "#475569" },
	{ name: "block-b", position: new Vector(298, 132), size: new Vector(28, 120), color: "#475569" },
];

class Obstacle extends GameObject {
	constructor(def: ObstacleDef) {
		super(def.name, def.position.clone());
		this.addHitbox(
			new SquareHitbox(Vector.zero(), def.size.clone(), this, {
				solid: true,
				debug: false,
			}),
		);
		this.setPhisics({ immovable: true });
		this.setRenderFunction((obj, canvas) => {
			const pos = obj.getPosition();
			canvas
				.getShapeDrawer()
				.drawRectangle(pos.x, pos.y, def.size.x, def.size.y, def.color, true);
		});
	}
}

export const createArena = (): Obstacle[] => {
	return BOUNDS.map((def) => new Obstacle(def));
};
