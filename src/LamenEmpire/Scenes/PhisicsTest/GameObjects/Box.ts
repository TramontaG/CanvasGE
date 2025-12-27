import type { CanvasController } from "../../../../CanvasController";
import type { GameEvent } from "../../../../Events";
import { grabbable } from "../../../../Events/decorators";
import { GameObject } from "../../../../GameObject";
import { SquareHitbox } from "../../../../GameObject/Hitboxes";
import { Vector } from "../../../../Lib/Vector";
import palette from "../../../colors.json";

let index = 0;

class PhisicsBox extends GameObject {
  private color: string;

  constructor(
    position: Vector,
    private size: Vector,
    color: string = palette.Green
  ) {
    super("box" + index++, position);

    this.color = color;
    this.setPhisics({
      immovable: false,
      restitution: 0.5,
      affectedByGravity: true,
      friction: 0.6,
    });
    this.addHitbox(new SquareHitbox(Vector.zero(), this.size, this, true));
    this.setRenderFunction(this.renderBox);
  }

  getSize(): Vector {
    return this.size.clone();
  }

  private renderBox(obj: GameObject, canvas: CanvasController): void {
    const pos = obj.getPosition();
    canvas
      .getShapeDrawer()
      .drawRectangle(pos.x, pos.y, this.size.x, this.size.y, this.color);
  }

  @grabbable()
  override handleEvent(event: GameEvent): void {}
}

export { PhisicsBox };
