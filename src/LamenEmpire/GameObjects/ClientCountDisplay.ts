import { GameObject } from "../../GameObject";
import { Vector } from "../../Lib/Vector";
import { Text } from "../../GameObject/Library/Text";

class ClientCountDisplay extends GameObject {
  private label: Text;

  constructor(position: Vector, initialText: string = "0 / 0 clients") {
    super("ClientCountDisplay", position);

    this.label = new Text(
      "ClientCountDisplayText",
      Vector.zero(),
      initialText,
      { color: "#ffffff", size: "14px", align: "center" }
    );
    this.label.setPositionRelativeToMotherShip(true);
    this.addChild(this.label);
  }

  setCounts(current: number, max: number): void {
    this.label.setText(`${current} / ${max} clients`);
  }
}

export { ClientCountDisplay };
