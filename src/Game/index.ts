import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { SceneManager } from "../Scenes/SceneManager";
import { GameContext } from "../Context";
import { GameEventsdispatcher, KeyAccumulator } from "../Events";

type GameOptions = {
  canvas: CanvasController;
  scenes: SceneManager;
  ticksPerSecond?: number;
};

class Game {
  public canvas: CanvasController;
  private scenes: SceneManager;
  private ticksPerSecond: number = 60;
  private lastTickTime: number = 0;
  public context: GameContext;
  private keyAccumulator = new KeyAccumulator();
  private eventsDispatcher: GameEventsdispatcher;

  constructor({ canvas, scenes, ticksPerSecond }: GameOptions) {
    this.canvas = canvas;
    this.scenes = scenes;
    this.ticksPerSecond = ticksPerSecond || this.ticksPerSecond;
    this.context = new GameContext({
      game: this,
      canvas,
      sceneManager: scenes,
      keyAccumulator: this.keyAccumulator,
    });
    this.scenes.bindContext(this.context);
    this.eventsDispatcher = new GameEventsdispatcher(
      this,
      this.keyAccumulator
    );
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
        this.onTick();
        this.scenes.tick();
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

  // Meant to be overridden by game-specific implementations to inject logic
  // that should run once per tick, before the scenes tick.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onTick(): void {}

  handleEvent(event: GameEvent) {
    this.scenes
      .getActiveScenes()
      .toReversed()
      .forEach((scene) => {
        scene.handleEvent(event);
      });
  }

  getContext(): GameContext {
    return this.context;
  }

  getKeyAccumulator(): KeyAccumulator {
    return this.keyAccumulator;
  }
}

export { Game };
export type { GameOptions };
