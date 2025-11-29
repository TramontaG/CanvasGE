import { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { Scene } from "../Scenes";
import { Vector } from "../Vector";
import type { CircleHitbox, SquareHitbox } from "./Hitboxes";
import type { GameContext, MessageHandler } from "../Context";

class GameObject {
  private renderFn = (obj: GameObject, canvas: CanvasController) => {};
  private tickFn = (obj: GameObject) => {};
  private context: GameContext | null = null;

  constructor(
    public name: string,
    public position: Vector,
    public visible: boolean = true,
    public active: boolean = true,
    public hitboxes: (CircleHitbox | SquareHitbox)[] = [],
    public scene: Scene | null = null
  ) {}

  tick() {
    if (this.active) {
      this.runKeyTickHandlers();
      this.tickFn(this);
    }
  }

  addHitbox(hitbox: CircleHitbox | SquareHitbox): void {
    this.hitboxes.push(hitbox);
  }

  getHitboxes(): (CircleHitbox | SquareHitbox)[] {
    return this.hitboxes;
  }

  render(canvas: CanvasController, scene: Scene): void {
    if (this.visible) {
      this.renderFn(this, canvas);
    }
  }

  getPosition(): Vector {
    const sceneOffset = this.scene ? this.scene.getOffset() : Vector.zero();

    return new Vector(
      this.position.x + sceneOffset.x,
      this.position.y + sceneOffset.y
    );

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
