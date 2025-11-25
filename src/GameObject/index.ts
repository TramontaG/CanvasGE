import { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { Scene } from "../Scenes";
import { Vector } from "../Vector";
import type { CircleHitbox, SquareHitbox } from "./Hitboxes";

class GameObject {
  private renderFn = (obj: GameObject, canvas: CanvasController) => {};
  private tickFn = (obj: GameObject) => {};
  private position = new Vector(0, 0);

  constructor(
    private name: string,
    private x: number,
    private y: number,
    private visible: boolean = true,
    private active: boolean = true,
    private hitboxes: (CircleHitbox | SquareHitbox)[] = [],
    public scene: Scene | null = null
  ) {
    this.position = new Vector(x, y);
  }

  tick() {
    if (this.active) {
      this.tickFn(this);
    }
  }

  addHitbox(hitbox: CircleHitbox | SquareHitbox): void {
    this.hitboxes.push(hitbox);
  }

  getHitboxes(): (CircleHitbox | SquareHitbox)[] {
    return this.hitboxes;
  }

  render(canvas: CanvasController): void {
    if (this.visible) {
      this.renderFn(this, canvas);
    }
  }

  getPosition(): Vector {
    return this.position;
  }

  isVisible(): boolean {
    return this.visible;
  }

  isActive(): boolean {
    return this.active;
  }

  setRenderFunction(
    fn: (obj: GameObject, canvas: CanvasController) => void
  ): void {
    this.renderFn = fn;
  }

  setTickFunction(fn: (obj: GameObject) => void): void {
    this.tickFn = fn;
  }

  handleEvent(event: GameEvent): void {}
}

export { GameObject };
