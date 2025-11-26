import { GameObject } from "..";
import { SquareHitbox } from "../Hitboxes";
import type { CanvasController } from "../../CanvasController";
import type { GameEvent } from "../../Events";
import { Vector } from "../../Vector";
import { onClick, onKeyPressed } from "../../Events/decorators";

class Box extends GameObject {
  private selected: boolean = false;

  constructor(
    x: number,
    y: number,
    private width: number,
    private height: number,
    private color: string
  ) {
    super("Box", x, y);
    this.setRenderFunction(this.renderBox);

    this.addHitbox(new SquareHitbox(0, 0, this.width, this.height, this));
  }

  private renderBox(obj: GameObject, canvas: CanvasController): void {
    const shapeDrawer = canvas.getShapeDrawer();
    const pos = obj.getPosition();
    shapeDrawer.drawRectangle(
      pos.x,
      pos.y,
      this.width,
      this.height,
      this.selected ? "pink" : this.color
    );
  }

  @onKeyPressed<Box>("ArrowUp", (obj, event) => {
    obj.selected ? obj.getPosition().add(new Vector(0, -5)) : null;
  })
  @onKeyPressed<Box>("ArrowDown", (obj, event) => {
    obj.selected ? obj.getPosition().add(new Vector(0, 5)) : null;
  })
  @onKeyPressed<Box>("ArrowLeft", (obj, event) => {
    obj.selected ? obj.getPosition().add(new Vector(-5, 0)) : null;
  })
  @onKeyPressed<Box>("ArrowRight", (obj, event) => {
    obj.selected ? obj.getPosition().add(new Vector(5, 0)) : null;
  })
  @onClick<Box>((obj, event) => {
    obj.selected = !obj.selected;
    event.stopPropagation = true;
  })
  override handleEvent(event: GameEvent): void {
    if (this.selected) {
      if (event.type === "mouseButtonPressed") {
        const pos = this.getPosition();
        if (
          event.x < pos.x ||
          event.x > pos.x + this.width ||
          event.y < pos.y ||
          event.y > pos.y + this.height
        ) {
          this.selected = false;
        }
      }
    }
  }
}

export { Box };
