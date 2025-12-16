import type { CanvasController } from "../../../../CanvasController";
import { GameObject } from "../../../../GameObject";
import { CircleHitbox } from "../../../../GameObject/Hitboxes";
import { Vector } from "../../../../Vector";
import { random } from "../../../Util/Math";
import palette from "../../../colors.json";

let index = 0;
const size = 16;

class Ball extends GameObject {
  static readonly RADIUS = size;

  constructor(position: Vector = new Vector(random(0, 800), random(0, 600))) {
    super("ball" + index++, position);

    this.setPhisics({
      immovable: false,
      restitution: 0.98,
      affectedByGravity: true,
      friction: 0.05,
    });
    this.addHitbox(new CircleHitbox(Vector.zero(), size, this));

    this.setRenderFunction(this.renderBall);
  }

  private renderBall(obj: GameObject, canvas: CanvasController): void {
    const pos = obj.getPosition();
    canvas
      .getShapeDrawer()
      .drawCircle(pos.x, pos.y, size, palette.Primary, true, false);
  }

  // Make them bounce
  override onColision(otherGO: GameObject, penetration: Vector): void {
    this.speed = penetration.multiply(this.speed.magnitude());
  }
}

export { Ball };
