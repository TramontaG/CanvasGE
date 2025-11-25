import { GameObject } from "..";
import { SquareHitbox } from "../Hitboxes";
import type { CanvasController } from "../../CanvasController";
import type { GameEvent } from "../../Events";
import { Vector } from "../../Vector";

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

  override handleEvent(event: GameEvent): void {
    // Select
    if (event.type === "mouseButtonPressed") {
      this.selected = false;
      const hiboxes = this.getHitboxes();

      for (const hitbox of hiboxes) {
        if (hitbox.intersectsWithPoint({ x: event.x, y: event.y })) {
          this.selected = true;
          break;
        }
      }
    }

    if (!this.selected) {
      return;
    }

    if (event.type === "keyPressed") {
      if (event.key === "ArrowUp") {
        const pos = this.getPosition();
        this.getPosition().y = pos.y - 5;
      }
      if (event.key === "ArrowDown") {
        const pos = this.getPosition();
        this.getPosition().y = pos.y + 5;
      }
      if (event.key === "ArrowLeft") {
        const pos = this.getPosition();
        this.getPosition().x = pos.x - 5;
      }
      if (event.key === "ArrowRight") {
        const pos = this.getPosition();
        this.getPosition().x = pos.x + 5;
      }
    }
  }
}

export { Box };
