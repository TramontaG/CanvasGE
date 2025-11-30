import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { GameObject } from "../GameObject";
import type { GameContext } from "../Context";
import { Vector } from "../Vector";

class Scene {
  private gameObjects: GameObject[] = [];
  private context: GameContext | null = null;
  private offset: Vector = new Vector(0, 0);

  constructor(private name: string, private backgroundColor?: string) {}

  setup() {
    console.log(`Setting up scene: ${this.name}`);
  }

  tick() {
    this.gameObjects.forEach((obj) => {
      obj.tick();
    });
  }

  render(canvas: CanvasController) {
    if (this.backgroundColor) {
      this.context
        ?.getCanvas()
        .getShapeDrawer()
        .drawBackground(this.backgroundColor);
    }

    this.gameObjects.forEach((obj) => {
      obj.render(canvas, this);
    });

    this.context?.getCanvas().reset();
  }

  addGameObject(obj: GameObject): void {
    obj.scene = this;
    obj.setContext(this.context);
    this.gameObjects.push(obj);
  }

  handleEvent(event: GameEvent): void {
    this.gameObjects.toReversed().forEach((obj) => {
      if (event.stopPropagation) return;
      obj.handleEvent(event);
    });
  }

  setContext(context: GameContext | null): void {
    this.context = context;
    this.gameObjects.forEach((obj) => {
      obj.setContext(context);
    });
  }

  getOffset(): Vector {
    return this.offset;
  }

  setOffset(offset: Vector): void {
    this.offset = offset;
  }
}

export { Scene };
