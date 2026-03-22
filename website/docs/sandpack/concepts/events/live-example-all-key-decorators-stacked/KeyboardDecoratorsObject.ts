import {
	onKeyComboHold,
	onKeyComboPressed,
	onKeyHold,
	onKeyPressed,
	Vector,
	type GameEvent,
} from "sliver-engine";
import { KeyboardDecoratorsObjectBase } from "./KeyboardDecoratorsObject.base";

const BOX_MIN_X = 40;
const BOX_MAX_X = 520 - 64 - 40;
const BOX_MIN_Y = 44;
const BOX_MAX_Y = 228 - 64 - 4;
const HOLD_STEP_X = 1.4;
const HOLD_STEP_Y = 1.4;
const COMBO_HOLD_STEP_X = 0.7;
const SPACE_KEY = " ";

export class KeyboardDecoratorsObject extends KeyboardDecoratorsObjectBase {
	constructor() {
		super("keyboard-decorators-demo");
	}
	@onKeyComboHold<KeyboardDecoratorsObject>(["Shift", "A"], (obj) => {
		obj.rotation -= 0.08;
	})
	@onKeyComboHold<KeyboardDecoratorsObject>(["Shift", "D"], (obj) => {
		obj.rotation += 0.08;
	})
	@onKeyHold<KeyboardDecoratorsObject>("w", (obj) => {
		obj.translate(new Vector(0, -HOLD_STEP_Y));
	})
	@onKeyHold<KeyboardDecoratorsObject>("a", (obj) => {
		obj.translate(new Vector(-HOLD_STEP_X, 0));
	})
	@onKeyHold<KeyboardDecoratorsObject>("s", (obj) => {
		obj.translate(new Vector(0, HOLD_STEP_Y));
	})
	@onKeyHold<KeyboardDecoratorsObject>("d", (obj) => {
		obj.translate(new Vector(HOLD_STEP_X, 0));
	})
	@onKeyComboPressed<KeyboardDecoratorsObject>(["Shift", SPACE_KEY], (obj) => {
		obj.rotation = 0;
	})
	@onKeyPressed<KeyboardDecoratorsObject>(SPACE_KEY, (obj) => {
		obj.setOpacity(Math.random());
	})
	override handleEvent(event: GameEvent): void {
		super.handleEvent(event);
	}
}
