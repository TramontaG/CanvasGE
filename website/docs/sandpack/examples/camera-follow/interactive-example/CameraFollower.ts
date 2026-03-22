import { GameObject, Vector } from "sliver-engine";

const SMOOTHING = 1;

export class CameraFollower extends GameObject {
	constructor(private target: GameObject) {
		super("camera:follower", Vector.zero(), false, true);
	}

	override tick(): void {
		const scene = this.scene;
		const ctx = this.getContext();
		if (!scene || !ctx) return;

		const canvasEl = ctx.getCanvas().getCanvas();
		const center = new Vector(canvasEl.width / 2, canvasEl.height / 2);
		const targetPos = this.target.getScenePosition();
		const desiredOffset = center.toSubtracted(targetPos);
		const currentOffset = scene.getOffset();

		scene.setOffset(
			new Vector(
				currentOffset.x + (desiredOffset.x - currentOffset.x) * SMOOTHING,
				currentOffset.y + (desiredOffset.y - currentOffset.y) * SMOOTHING,
			),
		);
	}
}
