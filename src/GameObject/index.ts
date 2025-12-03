import { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { Scene } from "../Scenes";
import { Vector } from "../Vector";
import type { CircleHitbox, SquareHitbox } from "./Hitboxes";
import type { GameContext, MessageHandler } from "../Context";
import { onHover, onStopHovering } from "../Events/decorators";
import type { SceneTransition } from "../Scenes/SceneManager/Transitions";
import type { Walker } from "../LamenEmpire/GameObjects/Walker";

class GameObject {
  private renderFn = (obj: GameObject, canvas: CanvasController) => {};
  private tickFn = (obj: GameObject) => {};
  private context: GameContext | null = null;
  public hovering?: boolean = false;
  private motherShip?: GameObject = undefined;
  public walker: Walker | null = null;
  public speed: Vector = Vector.zero();
  public showOriginDebug: boolean = false;
  private lastDominantDirection: "up" | "down" | "left" | "right" | null =
    "down";

  constructor(
    public name: string,
    public position: Vector,
    public visible: boolean = true,
    public active: boolean = true,
    public hitboxes: (CircleHitbox | SquareHitbox)[] = [],
    public scene: Scene | null = null,
    public children: GameObject[] = [],
    showOriginDebug: boolean = false
  ) {
    this.showOriginDebug = showOriginDebug;
  }

  tick() {
    if (this.active) {
      this.runKeyTickHandlers();
      this.tickFn(this);

      this.walker?.tick();
      this.position.add(this.speed);
    }
  }

  setWalker(walker: Walker) {
    this.walker = walker;
  }

  setPosition(position: Vector) {
    this.position = position;
  }

  setMotherShip<Class extends GameObject = GameObject>(
    motherShip: Class
  ): void {
    this.motherShip = motherShip as Class;
  }

  getMotherShip<Class extends GameObject = GameObject>(): Class | undefined {
    return this.motherShip as Class | undefined;
  }

  addHitbox(hitbox: CircleHitbox | SquareHitbox): void {
    this.hitboxes.push(hitbox);
  }

  getHitboxes(): (CircleHitbox | SquareHitbox)[] {
    return this.hitboxes;
  }

  render(canvas: CanvasController, scene: Scene): void {
    if (this.visible) {
      this.walker?.renderDebug(canvas);
      this.renderFn(this, canvas);
      this.children.forEach((child) => child.render(canvas, scene));
      this.hitboxes.forEach((hitbox) => {
        hitbox.renderDebug(canvas);
      });

      if (this.showOriginDebug) {
        const origin = this.getPosition();
        canvas
          .getShapeDrawer()
          .drawCircle(origin.x, origin.y, 8, "red", true, true, "white", 4);
      }
    }
  }

  setOriginDebug(show: boolean): void {
    this.showOriginDebug = show;
  }

  addChild(child: GameObject): void {
    child.setMotherShip(this);
    console.log("Adding child", child.name, "to", this.name);
    this.children.push(child);
  }

  getDominantDirection(): "up" | "down" | "left" | "right" | null {
    const movement = this.speed.toNormalized();
    if (movement.equals(Vector.zero())) return this.lastDominantDirection;

    const directions: Array<{
      dir: "up" | "down" | "left" | "right";
      vec: Vector;
    }> = [
      { dir: "down", vec: new Vector(0, 1) },
      { dir: "up", vec: new Vector(0, -1) },
      { dir: "left", vec: new Vector(-1, 0) },
      { dir: "right", vec: new Vector(1, 0) },
    ];

    const initial = directions[0]!;
    const best = directions.slice(1).reduce(
      (current, candidate) => {
        const candidateScore = movement.dotProduct(candidate.vec);
        return candidateScore > current.score
          ? { dir: candidate.dir, score: candidateScore }
          : current;
      },
      {
        dir: initial.dir,
        score: movement.dotProduct(initial.vec),
      }
    );

    this.lastDominantDirection = best.dir;
    return this.lastDominantDirection;
  }

  getChildren(): GameObject[] {
    return this.children;
  }

  getChildByName(name: string): GameObject | null {
    return this.children.find((child) => child.name === name) || null;
  }

  getPosition(): Vector {
    const sceneOffset = this.scene ? this.scene.getOffset() : Vector.zero();

    return new Vector(
      this.position.x + sceneOffset.x,
      this.position.y + sceneOffset.y
    );
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

  @onHover<GameObject>((obj, event) => {
    obj.hovering = true;
  })
  @onStopHovering<GameObject>((obj, event) => {
    obj.hovering = false;
  })
  handleEvent(event: GameEvent): void {}

  setContext(context: GameContext | null): void {
    this.context = context;
  }

  getContext(): GameContext | null {
    return this.context;
  }

  onMessage<TPayload>(
    channel: string,
    handler: MessageHandler<TPayload>
  ): () => void {
    if (!this.context) {
      return () => {};
    }

    return this.context.subscribeToMessage(channel, handler);
  }

  sendMessage<TPayload>(channel: string, payload: TPayload): void {
    this.context?.sendMessage(channel, payload, this);
  }

  setCurrentScene(name: string): void {
    this.context?.setCurrentScene(name);
  }

  pushScene(name: string): void {
    this.context?.pushScene(name);
  }

  popScene(): Scene | undefined {
    return this.context?.popScene();
  }

  transitionToScene(
    name: string,
    transition?: SceneTransition,
    mode: "replace" | "push" = "replace"
  ): Promise<void> {
    return (
      this.context?.transitionToScene(name, transition, mode) ??
      Promise.resolve()
    );
  }

  getPressedKeys(): string[] {
    return this.context?.getPressedKeys() ?? [];
  }

  isKeyPressed(key: string): boolean {
    return this.context?.isKeyPressed(key) ?? false;
  }

  private runKeyTickHandlers(): void {
    const KEY_TICK_HANDLERS = Symbol.for("canvasge.keyTickHandlers");

    const handlers: Array<(obj: GameObject) => void> = [];

    let proto = Object.getPrototypeOf(this);

    // acumulate handlers from the prototype chain
    // this includes this class and all its superclasses
    // neat JS trick!
    while (proto) {
      const protoHandlers = (proto as Record<symbol, unknown>)[
        KEY_TICK_HANDLERS
      ] as Array<(obj: GameObject) => void> | undefined;
      if (protoHandlers) {
        handlers.push(...protoHandlers);
      }
      proto = Object.getPrototypeOf(proto);
    }

    handlers.forEach((handler) => handler(this));
  }
}

export { GameObject };
