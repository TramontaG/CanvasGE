import type { CanvasController } from "../../CanvasController";
import type { GameEvent } from "../../Events";
import { onClick, onKeyPressed } from "../../Events/decorators";
import { GameObject } from "../../GameObject";
import {
  renderSprite,
  renderSpriteAnimation,
} from "../../GameObject/Decorators";
import { SquareHitbox } from "../../GameObject/Hitboxes";
import type { Scene } from "../../Scenes";
import { Vector } from "../../Vector";

const UP_ANIMATION_INDEXES = [4, 5, 6, 7];
const DOWN_ANIMATION_INDEXES = [0, 1, 2, 3];
const LEFT_ANIMATION_INDEXES = [8, 9, 10, 11];
const RIGHT_ANIMATION_INDEXES = [8, 9, 10, 11]; // Same as left, but mirrored

class Client extends GameObject {
  public scale: number;
  private animationSpeed: number = 2;
  public facingDirection: "up" | "down" | "left" | "right" = "down";
  public facingSprites: Record<Client["facingDirection"], number> = {
    down: 0,
    up: 4,
    left: 8,
    right: 8,
  };

  constructor(name: string, scale: number = 4, animationSpeed: number = 2) {
    super(name, new Vector(150, 150));
    this.scale = scale;

    this.animationSpeed = animationSpeed;
    // this.showOriginDebug = true;

    this.addHitbox(
      new SquareHitbox(
        new Vector(-6 * scale, -24 * scale),
        new Vector(12 * scale, 26 * scale),
        this
      )
    );
  }

  get ticksPerFrame() {
    return Math.floor(1 / (this.animationSpeed / 60));
  }

  private getSpriteRenderPosition(): Vector {
    return this.getPosition().toAdded(
      new Vector(-16 * this.scale, -24 * this.scale)
    );
  }

  @renderSprite<Client>(
    (obj) => obj.speed.equals(Vector.zero()),
    "client1",
    (obj) => obj.facingSprites[obj.facingDirection],
    (obj) => obj.scale,
    (obj) => (obj.facingDirection === "right" ? "horizontal" : null),
    (obj) => obj.getSpriteRenderPosition()
  )
  @renderSpriteAnimation<Client>(
    (obj) =>
      !obj.speed.equals(Vector.zero()) && obj.getDominantDirection() === "down",
    "client1",
    DOWN_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale,
    null,
    (obj) => obj.getSpriteRenderPosition()
  )
  @renderSpriteAnimation<Client>(
    (obj) =>
      !obj.speed.equals(Vector.zero()) && obj.getDominantDirection() === "left",
    "client1",
    LEFT_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale,
    null,
    (obj) => obj.getSpriteRenderPosition()
  )
  @renderSpriteAnimation<Client>(
    (obj) =>
      !obj.speed.equals(Vector.zero()) && obj.getDominantDirection() === "up",
    "client1",
    UP_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale,
    null,
    (obj) => obj.getSpriteRenderPosition()
  )
  @renderSpriteAnimation<Client>(
    (obj) =>
      !obj.speed.equals(Vector.zero()) &&
      obj.getDominantDirection() === "right",
    "client1",
    RIGHT_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale,
    "horizontal",
    (obj) => obj.getSpriteRenderPosition()
  )
  override render(canvas: CanvasController, scene: Scene): void {
    super.render(canvas, scene);
  }

  override tick(): void {
    super.tick();
    const dominant = this.getDominantDirection();
    if (dominant) {
      this.facingDirection = dominant;
    }
  }

  @onClick((obj) => {
    obj.walker?.toggle();
  })
  override handleEvent(event: GameEvent): void {
    super.handleEvent(event);
    if (event.type === "keyReleased") {
      this.speed = Vector.zero();
    }
  }
}

export { Client };
