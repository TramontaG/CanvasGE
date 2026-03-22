import {
GameObject,
SquareHitbox,
Vector,
grabbable,
type GameEvent,
} from "sliver-engine";

const BOX_SIZE = 24;
const BOX_START = new Vector(228, 72);

export class GravityBox extends GameObject {
	constructor() {
		super("gravity-box", BOX_START.clone());
		this.addHitbox(
			new SquareHitbox(Vector.zero(), new Vector(BOX_SIZE, BOX_SIZE), this, {
				solid: true,
				debug: false,
			}),
		);
		this.setPhisics({
			immovable: false,
			affectedByGravity: true,
			restitution: 0.25,
			friction: 0.4,
			mass: 1,
		});
		this.setRenderFunction((obj, canvas) => {
			const pos = obj.getPosition();
			canvas
				.getShapeDrawer()
				.drawRectangle(pos.x, pos.y, BOX_SIZE, BOX_SIZE, "#f59e0b", true);
		});
	}

    @grabbable()
    override handleEvent(event: GameEvent): void {
    	super.handleEvent(event);
    }

}
