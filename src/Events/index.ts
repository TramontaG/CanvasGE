import type { Game } from "../Game";
import { KeyAccumulator } from "./keyAccumulator";

export type KeyPressedEvent = {
  type: "keyPressed";
  key: string;
  stopPropagation?: boolean;
};

export type KeyReleasedEvent = {
  type: "keyReleased";
  key: string;
  stopPropagation?: boolean;
};

export type MouseMovedEvent = {
  type: "mouseMoved";
  x: number;
  y: number;
  stopPropagation?: boolean;
};

export type MouseButtonPressedEvent = {
  type: "mouseButtonPressed";
  button: number;
  x: number;
  y: number;
  stopPropagation?: boolean;
};

export type MouseButtonReleasedEvent = {
  type: "mouseButtonReleased";
  button: number;
  x: number;
  y: number;
  stopPropagation?: boolean;
};

export type MouseWheelScrolledEvent = {
  type: "mouseWheelScrolled";
  deltaX: number;
  deltaY: number;
  x: number;
  y: number;
  stopPropagation?: boolean;
};

export type GameEvent =
  | KeyPressedEvent
  | KeyReleasedEvent
  | MouseMovedEvent
  | MouseButtonPressedEvent
  | MouseButtonReleasedEvent
  | MouseWheelScrolledEvent;

class GameEventsdispatcher {
  private canvasElement: HTMLCanvasElement;

  constructor(private game: Game, private keyAccumulator: KeyAccumulator) {
    this.canvasElement = game.canvas.getCanvas();

    // Keyboard events
    window.addEventListener("keydown", (e) => {
      const event: KeyPressedEvent = { type: "keyPressed", key: e.key };
      this.keyAccumulator.handleKeyDown(e.key);
      this.dispatchEvent(event);
    });

    window.addEventListener("keyup", (e) => {
      const event: KeyReleasedEvent = { type: "keyReleased", key: e.key };
      this.keyAccumulator.handleKeyUp(e.key);
      this.dispatchEvent(event);
    });

    // Mouse events
    this.canvasElement.addEventListener("mousemove", (e) => {
      const rect = this.canvasElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const event: MouseMovedEvent = { type: "mouseMoved", x, y };
      this.dispatchEvent(event);
    });

    this.canvasElement.addEventListener("mousedown", (e) => {
      const rect = this.canvasElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const event: MouseButtonPressedEvent = {
        type: "mouseButtonPressed",
        button: e.button,
        x,
        y,
      };
      this.dispatchEvent(event);
    });

    this.canvasElement.addEventListener("mouseup", (e) => {
      const rect = this.canvasElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const event: MouseButtonReleasedEvent = {
        type: "mouseButtonReleased",
        button: e.button,
        x,
        y,
      };
      this.dispatchEvent(event);
    });

    this.canvasElement.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const rect = this.canvasElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const event: MouseWheelScrolledEvent = {
          type: "mouseWheelScrolled",
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          x,
          y,
        };
        this.dispatchEvent(event);
      },
      { passive: false }
    );
  }

  dispatchEvent(event: GameEvent): void {
    this.game.handleEvent(event);
  }
}

export { GameEventsdispatcher, KeyAccumulator };
