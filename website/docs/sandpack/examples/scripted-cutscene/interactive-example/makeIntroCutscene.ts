import {
	TextBoxSequence,
	Vector,
	Walker,
	conditional,
	parallel,
	scripted,
	sequenceOf,
	waitForKeyPress,
	waitTicks,
	walkCharacter,
	type ScriptEvent,
	type TextEntry,
} from "sliver-engine";
import type { CutsceneActor } from "./CutsceneActor";

export type CutsceneState = {
	elder: CutsceneActor;
	hero: CutsceneActor;
	coinsAwarded: boolean;
};

const createTextBoxSequence = (lines: string[]): ScriptEvent<CutsceneState> => {
	const base: Omit<TextEntry, "text"> = {
		position: "bottom",
		textSize: 18,
		boxColor: "rgba(0,0,0,0.75)",
		textColor: "white",
		lettersPerTick: 2,
		skipTyping: false,
	};

	const entries: TextEntry[] = lines.map((text) => ({ ...base, text }));
	return TextBoxSequence<CutsceneState>(entries);
};

const checkCoins = scripted<CutsceneState>(async (_ctx, state) => {
	return {
		...state,
		coinsAwarded: state.elder.coins > state.hero.coins,
	};
}, "checkCoins");

const awardCoins = scripted<CutsceneState>(async (_ctx, state) => {
	if (!state.coinsAwarded) return state;

	state.elder.coins = Math.max(0, state.elder.coins - 10);
	state.hero.coins += 10;
	return state;
}, "awardCoins");

export const makeIntroCutscene = (
	elder: CutsceneActor,
	hero: CutsceneActor,
): ScriptEvent<CutsceneState> => {
	const elderWalker = new Walker(
		elder,
		[elder.getScenePosition().toAdded(new Vector(64, 0))],
		1.4,
		false,
		false,
	);

	return sequenceOf<CutsceneState>(
		[
			parallel<CutsceneState>(
				[
					createTextBoxSequence(["...", "Welcome, traveler."]),
					walkCharacter<CutsceneState>(elder, elderWalker, "elderWalkIn"),
				],
				"introParallel",
			),
			checkCoins,
			conditional<CutsceneState>(
				(state) => state.coinsAwarded,
				sequenceOf<CutsceneState>(
					[
						createTextBoxSequence([
							"Take these 10 coins.",
							"Use them wisely.",
						]),
						awardCoins,
					],
					"awardBranch",
				),
				createTextBoxSequence([
					"You already have enough coins.",
					"Safe travels!",
				]),
				"coinConditional",
			),
			waitForKeyPress<CutsceneState>(" ", "waitSpace"),
			waitTicks<CutsceneState>(20),
			scripted<CutsceneState>(async (_ctx, state) => {
				hero.sendMessage("cutscene:status", "Cutscene finished.");
				return state;
			}, "doneMessage"),
		],
		"introCutscene",
	);
};
