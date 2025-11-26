import type { CanvasController } from "../CanvasController";
import type { Game } from "../Game";
import type { GameObject } from "../GameObject";
import type { Scene } from "../Scenes";
import type { SceneManager } from "../Scenes/SceneManager";

type MessageHandler<TPayload = unknown> = (
  payload: TPayload,
  sender?: GameObject | null
) => void;

class MessageBus {
  private channels = new Map<string, Set<MessageHandler>>();

  subscribe<TPayload>(
    channel: string,
    handler: MessageHandler<TPayload>
  ): () => void {
    const handlers = this.channels.get(channel) ?? new Set<MessageHandler>();
    handlers.add(handler as MessageHandler);
    this.channels.set(channel, handlers);

    return () => {
      this.unsubscribe(channel, handler);
    };
  }

  unsubscribe<TPayload>(
    channel: string,
    handler: MessageHandler<TPayload>
  ): void {
    const handlers = this.channels.get(channel);
    if (!handlers) {
      return;
    }

    handlers.delete(handler as MessageHandler);
    if (handlers.size === 0) {
      this.channels.delete(channel);
    }
  }

  publish<TPayload>(
    channel: string,
    payload: TPayload,
    sender?: GameObject | null
  ): void {
    const handlers = this.channels.get(channel);
    handlers?.forEach((handler) => handler(payload, sender ?? null));
  }
}

type GameContextOptions = {
  game: Game;
  canvas: CanvasController;
  sceneManager: SceneManager;
};

class GameContext {
  private messageBus = new MessageBus();

  constructor(private options: GameContextOptions) {}

  getGame(): Game {
    return this.options.game;
  }

  getCanvas(): CanvasController {
    return this.options.canvas;
  }

  getSceneManager(): SceneManager {
    return this.options.sceneManager;
  }

  getCurrentScene(): Scene | null {
    return this.options.sceneManager.getCurrentScene();
  }

  getActiveScenes(): Scene[] {
    return this.options.sceneManager.getActiveScenes();
  }

  getAllScenes(): Scene[] {
    return this.options.sceneManager.getAllScenes();
  }

  setCurrentScene(name: string): void {
    this.options.sceneManager.setSceneAsCurrent(name);
  }

  pushScene(name: string): void {
    const scene = this.options.sceneManager.getScene(name);
    if (scene) {
      this.options.sceneManager.pushSceneToActive(scene);
    }
  }

  popScene(): Scene | undefined {
    return this.options.sceneManager.popSceneFromActive();
  }

  sendMessage<TPayload>(
    channel: string,
    payload: TPayload,
    sender?: GameObject | null
  ): void {
    this.messageBus.publish(channel, payload, sender);
  }

  subscribeToMessage<TPayload>(
    channel: string,
    handler: MessageHandler<TPayload>
  ): () => void {
    return this.messageBus.subscribe(channel, handler);
  }
}

export { GameContext, MessageBus };
export type { MessageHandler };
