import { Vector } from "../../Vector";
import { FloatingView } from "../../GameObject/Library/FloatingView";
import { Text } from "../../GameObject/Library/Text";

class FloatingMoneyDisplay extends FloatingView {
  constructor(position: Vector, amount: number) {
    // Transparent background to only show text.
    super("FloatingMoneyDisplay", position, new Vector(0, 0), "green", {
      fadeStep: 0.02,
      riseSpeed: 1.2,
    });

    const id = `FloatingMoneyText-${Date.now()}-${Math.floor(
      Math.random() * 1_000_000
    )}`;

    const text = new Text(id, Vector.zero(), `+ ${amount} gold`, {
      color: "#f2d14b",
      size: "18px",
      align: "center",
    });

    // Children of FloatingView are positioned relative to the floating view.
    this.addChild(text);
  }
}

export { FloatingMoneyDisplay };
