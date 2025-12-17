import type { CanvasController } from "../../../../CanvasController";
import { GameObject } from "../../../../GameObject";
import { SquareHitbox } from "../../../../GameObject/Hitboxes";
import { Vector } from "../../../../Vector";
import palette from "../../../colors.json";

class Wall extends GameObject {
  private color: string;

  constructor(name: string, position: Vector, private size: Vector, color?: string) {
    super(name, position);

    this.color = color ?? palette.DarkPurple;
    this.setPhisics({ immovable: true, friction: 0.8 });
    this.addHitbox(new SquareHitbox(Vector.zero(), this.size, this, true));
    this.setRenderFunction(this.renderWall);
  }

  private renderWall(obj: GameObject, canvas: CanvasController): void {
    const pos = obj.getPosition();
    canvas
      .getShapeDrawer()
      .drawRectangle(pos.x, pos.y, this.size.x, this.size.y, this.color);
  }
}

export { Wall };
