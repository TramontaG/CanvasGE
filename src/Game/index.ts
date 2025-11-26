import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { SceneManager } from "../Scenes/SceneManager";
import { GameContext } from "../Context";

type GameOptions = {
  canvas: CanvasController;
  scenes: SceneManager;
  ticksPerSecond?: number;
};

class Game {
  public canvas: CanvasController;
  private scenes: SceneManager;
  private ticksPerSecond: number = 10;
  private lastTickTime: number = 0;
  private context: GameContext;

  constructor({ canvas, scenes, ticksPerSecond }: GameOptions) {
    this.canvas = canvas;
    this.scenes = scenes;
    this.ticksPerSecond = ticksPerSecond || this.ticksPerSecond;
    this.context = new GameContext({
      game: this,
      canvas,
      sceneManager: scenes,
    });
    this.scenes.bindContext(this.context);
  }

  setup() {
    console.log("Game setup complete.");
  }

  start() {
    console.log("Game started.");

    // Tick interval
    setInterval(() => {
      const now = performance.now();
      const tickInterval = 1000 / this.ticksPerSecond;
      const lastTickTime = this.lastTickTime || 0;
      if (now - lastTickTime >= tickInterval) {
        this.scenes.getActiveScenes().forEach((scene) => {
          scene.tick();
        });
        this.lastTickTime = now;
      }
    });

    // Render loop
    const renderLoop = () => {
      this.canvas.clearCanvas();
      this.render();
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }

  render() {
    this.scenes.getActiveScenes().forEach((scene) => {
      scene.render(this.canvas);
    });
  }

  handleEvent(event: GameEvent) {
    this.scenes.getActiveScenes().forEach((scene) => {
      scene.handleEvent(event);
    });
  }

  getContext(): GameContext {
    return this.context;
  }
}

export { Game };
