import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { GameObject } from "../GameObject";
import type { GameContext } from "../Context";
import { Vector } from "../Vector";
import { ColisionHandler } from "../GameObject/Hitboxes/ColisionHandler";

class Scene {
  private gameObjects: GameObject[] = [];
  private context: GameContext | null = null;
  private offset: Vector = new Vector(0, 0);
  private gravity: Vector = Vector.zero();
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

    this.handleColisions();
  }

  getGameObjects() {
    return this.gameObjects;
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

  addGameObject(_objects: GameObject | GameObject[]): void {
    const gameObjects = Array.isArray(_objects) ? _objects : [_objects];

    gameObjects.forEach((go) => {
      go.scene = this;
      go.setContext(this.context);
      this.gameObjects.push(go);
    });
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

  getGravity(): Vector {
    return this.gravity;
  }

  setGravity(gravity: Vector): void {
    this.gravity = gravity;
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

  private handleColisions(): void {
    const objects = this.gameObjects;

    for (let i = 0; i < objects.length; i++) {
      const a = objects[i]!;
      if (!a.isActive()) continue;

      const aHitboxes = a.getHitboxes();
      if (aHitboxes.length === 0) continue;

      for (let j = i + 1; j < objects.length; j++) {
        const b = objects[j]!;
        if (!b.isActive()) continue;

        const bHitboxes = b.getHitboxes();
        if (bHitboxes.length === 0) continue;

        for (let haIndex = 0; haIndex < aHitboxes.length; haIndex++) {
          const ha = aHitboxes[haIndex]!;
          for (let hbIndex = 0; hbIndex < bHitboxes.length; hbIndex++) {
            const hb = bHitboxes[hbIndex]!;

            if (!ha.intersects(hb)) continue;

            const resolution = ColisionHandler.resolveCollision(ha, hb);
            if (!resolution) continue;

            const aImmovable = !!a.phisics.immovable;
            const bImmovable = !!b.phisics.immovable;

            if (!aImmovable) {
              a.translate(resolution.deltaA);
            }
            if (!bImmovable) {
              b.translate(resolution.deltaB);
            }

            if (!resolution.appliedImpulse) continue;

            if (!aImmovable) {
              a.speed = resolution.velocityA;
            }
            if (!bImmovable) {
              b.speed = resolution.velocityB;
            }

            a.onColision(b, resolution.velocityA.toNormalized());
            b.onColision(a, resolution.velocityB.toNormalized());
          }
        }
      }
    }
  }
}

export { Scene };
