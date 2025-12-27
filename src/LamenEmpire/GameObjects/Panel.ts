import type { CanvasController } from "../../CanvasController";
import type { GameObject } from "../../GameObject";
import { GameObject as BaseGameObject } from "../../GameObject";
import { Vector } from "../../Lib/Vector";
import { SquareHitbox } from "../../GameObject/Hitboxes";

class Panel extends BaseGameObject {
  constructor(
    name: string,
    position: Vector,
    private size: Vector,
    private color: string
  ) {
    super(name, position);

    this.setRenderFunction(this.renderPanel);
    this.addHitbox(new SquareHitbox(Vector.zero(), this.size, this));
  }

  getSize(): Vector {
    return this.size.clone();
  }

  private renderPanel(obj: GameObject, canvas: CanvasController): void {
    const pos = obj.getPosition();
    canvas
      .getShapeDrawer()
      .drawRectangle(pos.x, pos.y, this.size.x, this.size.y, this.color);
  }
}

export { Panel };
