import { GameObject, SquareHitbox, Vector } from "sliver-engine";
import {
ENCLOSURE_LEFT,
ENCLOSURE_OUTER_WIDTH,
ENCLOSURE_THICKNESS,
ENCLOSURE_TOP,
} from "./enclosureDimensions";

export const TELEPORT_TRIGGER_NAME = "teleport-trigger";

const TRIGGER_SIZE = new Vector(64, 128);
const TRIGGER_POSITION = new Vector(
ENCLOSURE_LEFT + ENCLOSURE_OUTER_WIDTH - ENCLOSURE_THICKNESS - TRIGGER_SIZE.x - 12,
ENCLOSURE_TOP + ENCLOSURE_THICKNESS + 32,
);

class TriggerZone extends GameObject {
constructor() {
super(TELEPORT_TRIGGER_NAME, TRIGGER_POSITION.clone());
this.addHitbox(
new SquareHitbox(Vector.zero(), TRIGGER_SIZE.clone(), this, {
solid: false,
debug: true,
}),
);
this.setPhisics({
immovable: true,
});
this.setRenderFunction((obj, canvas) => {
const pos = obj.getPosition();
canvas
.getShapeDrawer()
.drawRectangle(
pos.x,
pos.y,
TRIGGER_SIZE.x,
TRIGGER_SIZE.y,
"rgba(16, 185, 129, 0.28)",
true,
);
});
}
}

export const createTriggerZone = (): TriggerZone => {
	return new TriggerZone();
};
