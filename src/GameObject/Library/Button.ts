import { GameObject } from "..";
import type { CanvasController } from "../../CanvasController";
import type { GameEvent } from "../../Events";
import { onClick } from "../../Events/decorators";
import type { Game } from "../../Game";
import { SquareHitbox } from "../Hitboxes";

class Button extends GameObject {
  constructor(
    x: number,
    y: number,
    private width: number,
    private height: number,
    private label: string,
    private color: string
  ) {
    super("Button", x, y);
    this.setRenderFunction(this.renderButton);

    this.addHitbox(new SquareHitbox(0, 0, this.width, this.height, this));
  }

  private renderButton(obj: GameObject, canvas: CanvasController): void {
    const shapeDrawer = canvas.getShapeDrawer();
    const pos = obj.getPosition();
    shapeDrawer.drawRectangle(
      pos.x,
      pos.y,
      this.width,
      this.height,
      this.color
    );

    shapeDrawer.drawText(
      this.label,
      pos.x + this.width / 2,
      pos.y + this.height / 2
    );
  }

  @onClick<Button>((obj, event) => {
    obj.getContext()?.setCurrentScene("debug2");
  })
  override handleEvent(event: GameEvent): void {}
}

export { Button };
