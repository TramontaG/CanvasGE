import { CanvasController } from "../CanvasController";
import type { GameEvent } from "../Events";
import type { Scene } from "../Scenes";
import { Vector } from "../Vector";
import type { CircleHitbox, SquareHitbox } from "./Hitboxes";
import type { GameContext, MessageHandler } from "../Context";

class GameObject {
  private renderFn = (obj: GameObject, canvas: CanvasController) => {};
  private tickFn = (obj: GameObject) => {};
  private position = new Vector(0, 0);
  private context: GameContext | null = null;

  constructor(
    private name: string,
    private x: number,
    private y: number,
    private visible: boolean = true,
    private active: boolean = true,
    private hitboxes: (CircleHitbox | SquareHitbox)[] = [],
    public scene: Scene | null = null
  ) {
    this.position = new Vector(x, y);
  }

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

  render(canvas: CanvasController): void {
    if (this.visible) {
      this.renderFn(this, canvas);
    }
  }

  getPosition(): Vector {
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
