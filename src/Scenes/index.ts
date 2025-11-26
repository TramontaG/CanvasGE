import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { GameObject } from "../GameObject";
import type { GameContext } from "../Context";

class Scene {
  private gameObjects: GameObject[] = [];
  private context: GameContext | null = null;

  constructor(private name: string) {}

  setup() {
    console.log(`Setting up scene: ${this.name}`);
  }

  tick() {
    this.gameObjects.forEach((obj) => {
      obj.tick();
    });
  }

  render(canvas: CanvasController) {
    this.gameObjects.forEach((obj) => {
      obj.render(canvas);
    });
  }

  addGameObject(obj: GameObject): void {
    obj.scene = this;
    obj.setContext(this.context);
    this.gameObjects.push(obj);
  }

  handleEvent(event: GameEvent): void {
    this.gameObjects.forEach((obj) => {
      obj.handleEvent(event);
    });
  }

  setContext(context: GameContext | null): void {
    this.context = context;
    this.gameObjects.forEach((obj) => {
      obj.setContext(context);
    });
  }
}

export { Scene };
