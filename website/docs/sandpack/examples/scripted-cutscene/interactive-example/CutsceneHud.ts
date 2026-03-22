import {
	GameObject,
	Vector,
	type CanvasController,
	type GameContext,
	type Scene,
} from "sliver-engine";
import type { CutsceneActor } from "./CutsceneActor";

export class CutsceneHud extends GameObject {
	private status = "Press Space to advance dialog.";

	constructor(
		private elder: CutsceneActor,
		private hero: CutsceneActor,
	) {
		super("cutscene-hud", Vector.zero());
		this.setPhisics({ immovable: true, affectedByGravity: false });
	}

	override onAddedToScene(_scene: Scene, _context: GameContext): void {
		this.onMessage<string>("cutscene:status", (message) => {
			this.status = message;
		});
	}

	override render(canvas: CanvasController, _scene: Scene): void {
		const draw = canvas.getShapeDrawer();
		draw.drawText("Elder coins: " + this.elder.coins, 16, 24, "#e2e8f0", "14px", "left");
		draw.drawText("Hero coins: " + this.hero.coins, 16, 44, "#e2e8f0", "14px", "left");
		draw.drawText(this.status, 16, 66, "#94a3b8", "13px", "left");
	}
}
