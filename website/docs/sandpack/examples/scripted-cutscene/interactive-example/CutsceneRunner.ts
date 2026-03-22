import { GameObject, Vector, type GameContext, type Scene } from "sliver-engine";
import { makeIntroCutscene, type CutsceneState } from "./makeIntroCutscene";
import type { CutsceneActor } from "./CutsceneActor";

export class CutsceneRunner extends GameObject {
	private started = false;

	constructor(
		private elder: CutsceneActor,
		private hero: CutsceneActor,
	) {
		super("cutscene-runner", Vector.zero(), false, true);
		this.setPhisics({ immovable: true, affectedByGravity: false });
	}

	override onAddedToScene(_scene: Scene, context: GameContext): void {
		if (this.started) return;
		this.started = true;

		const cutscene = makeIntroCutscene(this.elder, this.hero);
		const initialState: CutsceneState = {
			elder: this.elder,
			hero: this.hero,
			coinsAwarded: false,
		};

		void (async () => {
			const finalState = await cutscene.run(context, initialState);

			if (finalState.error) {
				console.error(finalState.error);
				this.sendMessage("cutscene:status", "Cutscene failed.");
				return;
			}

			if (finalState.aborted) {
				this.sendMessage("cutscene:status", "Cutscene aborted.");
				return;
			}

			this.sendMessage("cutscene:status", "Cutscene complete.");
		})();
	}
}
