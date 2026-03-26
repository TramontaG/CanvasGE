import type { GameObject } from "sliver-engine";
import { MovingBoxBase, MOVING_BOX_START } from "./MovingBoxBase";
import { TELEPORT_TRIGGER_NAME } from "./TriggerZone";

export class TeleportingBox extends MovingBoxBase {
	constructor() {
		super("moving-box");
	}

	// Edit only this method.
	override onColision(otherGO: GameObject): void {
		if (otherGO.name === TELEPORT_TRIGGER_NAME) {
			this.setPosition(MOVING_BOX_START.clone());
		}
	}
}
