import { GameObject, SquareHitbox, Vector } from "sliver-engine";
import {
	mapEnclosurePoint,
	scaleEnclosureSize,
	scaleEnclosureVector,
} from "./enclosureDimensions";

const BOX_SIZE = scaleEnclosureSize(24, 24);
export const MOVING_BOX_START = mapEnclosurePoint(56, 126);
const FIXED_SPEED = scaleEnclosureVector(72, 0);

export class MovingBoxBase extends GameObject {
	constructor(name: string = "moving-box") {
		super(name, MOVING_BOX_START.clone());
		this.addHitbox(
			new SquareHitbox(Vector.zero(), BOX_SIZE.clone(), this, {
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
				.drawRectangle(
					pos.x,
					pos.y,
					BOX_SIZE.x,
					BOX_SIZE.y,
					"#f59e0b",
					true,
				);
		});
	}
}
