import type { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { GameObject } from "../GameObject";
import type { GameContext } from "../Context";
import { Vector } from "../Lib/Vector";
import { ColisionHandler } from "../GameObject/Hitboxes/ColisionHandler";

const LINEAR_VELOCITY_SNAP_EPSILON = 0.001;
const RESTING_TANGENTIAL_VELOCITY_SNAP_EPSILON = 0.01;
const RESTING_NORMAL_VELOCITY_SNAP_EPSILON = 0.35;
const ROTATION_SNAP_STEP = Math.PI / 2;
const ROTATION_SNAP_EPSILON = 0.02;
const RESTING_ANGULAR_VELOCITY_SNAP_EPSILON = 0.02;
const RESTING_ROTATION_ALIGNMENT_DELTA = 0.12;
const RESTING_FULL_SLEEP_ANGULAR_EPSILON = 0.08;
const TAU = Math.PI * 2;

const normalizeRotation = (value: number): number => {
  const normalized = value % TAU;
  return normalized < 0 ? normalized + TAU : normalized;
};

const snapRotationToQuarterTurn = (
  value: number,
  epsilon: number = ROTATION_SNAP_EPSILON
): number => {
  const snapped = Math.round(value / ROTATION_SNAP_STEP) * ROTATION_SNAP_STEP;
  return Math.abs(value - snapped) < epsilon ? snapped : value;
};

const snapRotationToNearestQuarterTurn = (value: number): number =>
  Math.round(value / ROTATION_SNAP_STEP) * ROTATION_SNAP_STEP;

const getDistanceToNearestQuarterTurn = (value: number): number => {
  const snapped = snapRotationToNearestQuarterTurn(value);
  const directDistance = Math.abs(value - snapped);
  return Math.min(directDistance, TAU - directDistance);
};

const isRotationNearQuarterTurn = (value: number, delta: number): boolean =>
  getDistanceToNearestQuarterTurn(value) <= delta;

class Scene {
  private gameObjects: GameObject[] = [];
  private context: GameContext | null = null;
  private offset: Vector = new Vector(0, 0);
  private gravity: Vector = Vector.zero();
  private opacity: number = 1;
  private overlayColor: string | null = null;
  private overlayAlpha: number = 0;
  private didSetup: boolean = false;
  private isActive: boolean = false;
  private pendingEnter: boolean = false;

  constructor(
    private name: string,
    private backgroundColor?: string,
  ) {}

  setup() {
    console.log(`Setting up scene: ${this.name}`);
  }

  onEnter(): void {}

  onExit(): void {}

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
    gameObject.notifyRemovedFromScene(this);
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

    const sortedObjects = this.gameObjects
      .map((obj, index) => ({ obj, index }))
      .sort((a, b) => {
        if (a.obj.zIndex !== b.obj.zIndex) {
          return a.obj.zIndex - b.obj.zIndex;
        }
        return a.index - b.index;
      })
      .map(({ obj }) => obj);

    sortedObjects.forEach((obj) => {
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
      go.notifyAddedToScene(this, this.context);
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
      obj.notifyAddedToScene(this, context);
    });

    if (context && this.pendingEnter) {
      this.pendingEnter = false;
      this.runSetupIfNeeded();
      if (this.isActive) {
        this.onEnter();
      }
    }
  }

  getContext(): GameContext | null {
    return this.context;
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

  activate(): void {
    if (this.isActive) {
      if (this.pendingEnter && this.context) {
        this.pendingEnter = false;
        this.runSetupIfNeeded();
        this.onEnter();
      }
      return;
    }

    this.isActive = true;

    if (!this.context) {
      this.pendingEnter = true;
      return;
    }

    this.runSetupIfNeeded();
    this.onEnter();
  }

  deactivate(): void {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    this.pendingEnter = false;
    this.onExit();
  }

  private runSetupIfNeeded(): void {
    if (this.didSetup) {
      return;
    }
    this.didSetup = true;
    this.setup();
  }

  private handleColisions(): void {
    const movableObjects: GameObject[] = [];
    const immovableObjects: GameObject[] = [];

    for (const obj of this.gameObjects) {
      if (obj.phisics.immovable) {
        immovableObjects.push(obj);
        continue;
      }

      movableObjects.push(obj);
    }

    const objects = [...movableObjects, ...immovableObjects];

    const notifiedPairs = new Set<string>();
    const allowedPairs = new Map<string, boolean>();
    const objectsInResolvedCollisions = new Set<GameObject>();
    const supportedBySurface = new Set<GameObject>();
    const maxPasses = 4;

    for (let pass = 0; pass < maxPasses; pass++) {
      let resolvedAny = false;

      for (let i = 0; i < objects.length; i++) {
        const a = objects[i]!;
        if (!a.isActive()) continue;

        const aHitboxes = a.getHitboxes();
        if (aHitboxes.length === 0) continue;

        objectPairLoop: for (let j = i + 1; j < objects.length; j++) {
          const b = objects[j]!;
          if (!b.isActive()) continue;

          const bHitboxes = b.getHitboxes();
          if (bHitboxes.length === 0) continue;

          const pairKey = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
          let isPairAllowed = allowedPairs.get(pairKey);
          if (isPairAllowed === false) continue;

          for (let haIndex = 0; haIndex < aHitboxes.length; haIndex++) {
            const ha = aHitboxes[haIndex]!;
            for (let hbIndex = 0; hbIndex < bHitboxes.length; hbIndex++) {
              const hb = bHitboxes[hbIndex]!;

              if (!ha.intersects(hb)) continue;

              if (isPairAllowed === undefined) {
                isPairAllowed = a.beforeColision(b) && b.beforeColision(a);
                allowedPairs.set(pairKey, isPairAllowed);
              }

              if (!isPairAllowed) {
                continue objectPairLoop;
              }

              const resolution = ColisionHandler.resolveCollision(ha, hb);
              const penetration =
                resolution?.penetration ??
                ColisionHandler.getPenetrationVector(ha, hb);

              if (!notifiedPairs.has(pairKey)) {
                notifiedPairs.add(pairKey);
                a.onColision(b, penetration);
                b.onColision(a, penetration.toMultiplied(-1));
              }

              if (!resolution) continue;

              resolvedAny = true;
              objectsInResolvedCollisions.add(a);
              objectsInResolvedCollisions.add(b);

              const aImmovable = !!a.phisics.immovable;
              const bImmovable = !!b.phisics.immovable;

              if (!aImmovable && resolution.normal.y < -0.5) {
                supportedBySurface.add(a);
              }
              if (!bImmovable && resolution.normal.y > 0.5) {
                supportedBySurface.add(b);
              }

              if (!aImmovable) {
                a.translate(resolution.deltaA);
              }
              if (!bImmovable) {
                b.translate(resolution.deltaB);
              }

              if (resolution.appliedImpulse) {
                if (!aImmovable) {
                  a.speed = resolution.velocityA;
                  a.angularVelocity = resolution.angularVelocityA;
                }
                if (!bImmovable) {
                  b.speed = resolution.velocityB;
                  b.angularVelocity = resolution.angularVelocityB;
                }
              }
            }
          }
        }
      }

      if (!resolvedAny) {
        break;
      }
    }

    for (const object of objectsInResolvedCollisions) {
      const isSupported = supportedBySurface.has(object);
      object.rotation = normalizeRotation(object.rotation);
      const isRotationAlignedOnSupport = isRotationNearQuarterTurn(
        object.rotation,
        RESTING_ROTATION_ALIGNMENT_DELTA
      );

      if (
        isSupported &&
        object.speed.y > 0 &&
        object.speed.y < RESTING_NORMAL_VELOCITY_SNAP_EPSILON
      ) {
        object.speed.y = 0;
      }

      if (
        isSupported &&
        isRotationAlignedOnSupport &&
        Math.abs(object.angularVelocity) < RESTING_ANGULAR_VELOCITY_SNAP_EPSILON
      ) {
        object.angularVelocity = 0;
      }

      const shouldFullSleepOnSupport =
        isSupported &&
        isRotationAlignedOnSupport &&
        Math.abs(object.speed.x) < RESTING_TANGENTIAL_VELOCITY_SNAP_EPSILON &&
        object.speed.y >= 0 &&
        object.speed.y < RESTING_NORMAL_VELOCITY_SNAP_EPSILON &&
        Math.abs(object.angularVelocity) < RESTING_FULL_SLEEP_ANGULAR_EPSILON;

      if (shouldFullSleepOnSupport) {
        object.speed = Vector.zero();
        object.angularVelocity = 0;
        object.rotation = snapRotationToNearestQuarterTurn(object.rotation);
      }

      if (object.angularVelocity === 0) {
        object.rotation = snapRotationToQuarterTurn(
          object.rotation,
          isSupported ? RESTING_ROTATION_ALIGNMENT_DELTA : ROTATION_SNAP_EPSILON
        );
      }

      if (Math.abs(object.speed.x) < LINEAR_VELOCITY_SNAP_EPSILON) {
        object.speed.x = 0;
      }

      if (Math.abs(object.speed.y) < LINEAR_VELOCITY_SNAP_EPSILON) {
        object.speed.y = 0;
      }

      if (object.speed.x === 0 && object.speed.y === 0) {
        object.speed = Vector.zero();
      }
    }
  }
}

export { Scene };
