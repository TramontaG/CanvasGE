import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { GameObject } from "../GameObject";
import type { GameContext } from "../Context";
import { Vector } from "../Vector";

class Scene {
  private gameObjects: GameObject[] = [];
  private context: GameContext | null = null;
  private offset: Vector = new Vector(0, 0);
  private opacity: number = 1;
  private overlayColor: string | null = null;
  private overlayAlpha: number = 0;

  constructor(private name: string, private backgroundColor?: string) {}

  setup() {
    console.log(`Setting up scene: ${this.name}`);
  }

  tick() {
    this.gameObjects.forEach((obj) => {
      obj.tick();
    });
  }

  removeGameObject(gameObject: GameObject) {
    this.gameObjects = this.gameObjects.filter((go) => go !== gameObject);
  }

  render(canvas: CanvasController) {
    const ctx = this.context?.getCanvas().getContext();
    if (!ctx) {
      return;
    }

    const previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha = previousAlpha * this.opacity;

    if (this.backgroundColor) {
      // Offset the background so it moves with the scene.
      ctx.save();
      ctx.translate(this.offset.x, this.offset.y);
      this.context
        ?.getCanvas()
        .getShapeDrawer()
        .drawBackground(this.backgroundColor);
      ctx.restore();
    }

    this.gameObjects.forEach((obj) => {
      obj.render(canvas, this);
    });

    if (this.overlayColor && this.overlayAlpha > 0) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = previousAlpha * this.overlayAlpha;
      ctx.fillStyle = this.overlayColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    ctx.globalAlpha = previousAlpha;
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

  getOpacity(): number {
    return this.opacity;
  }

  setOpacity(opacity: number): void {
    this.opacity = opacity;
  }

  setOverlay(color: string | null, alpha: number): void {
    this.overlayColor = color;
    this.overlayAlpha = alpha;
  }
}

export { Scene };
