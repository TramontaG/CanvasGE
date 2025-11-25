import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { GameObject } from "../GameObject";

class Scene {
  private gameObjects: GameObject[] = [];

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
    this.gameObjects.push(obj);
  }

  handleEvent(event: GameEvent): void {
    this.gameObjects.forEach((obj) => {
      obj.handleEvent(event);
    });
  }
}

export { Scene };
