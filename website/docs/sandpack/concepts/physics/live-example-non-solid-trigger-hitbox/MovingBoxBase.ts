import { GameObject, SquareHitbox, Vector } from "sliver-engine";
import {
ENCLOSURE_LEFT,
ENCLOSURE_THICKNESS,
ENCLOSURE_TOP,
} from "./enclosureDimensions";

const BOX_SIZE = 24;
export const MOVING_BOX_START = new Vector(
	ENCLOSURE_LEFT + ENCLOSURE_THICKNESS + 20,
	ENCLOSURE_TOP + ENCLOSURE_THICKNESS + 90,
);
const FIXED_SPEED = new Vector(1.2, 0);

export class MovingBoxBase extends GameObject {
	constructor(name: string = "moving-box") {
		super(name, MOVING_BOX_START.clone());
		this.addHitbox(
			new SquareHitbox(Vector.zero(), new Vector(BOX_SIZE, BOX_SIZE), this, {
				solid: true,
				debug: false,
			}),
		);
		this.setPhisics({
			immovable: false,
			affectedByGravity: false,
			restitution: 0,
			friction: 0,
			mass: 1,
		});
		this.setTickFunction(() => {
			this.speed = FIXED_SPEED.clone();
		});
		this.setRenderFunction((obj, canvas) => {
			const pos = obj.getPosition();
			canvas
				.getShapeDrawer()
				.drawRectangle(pos.x, pos.y, BOX_SIZE, BOX_SIZE, "#f59e0b", true);
		});
	}
}
