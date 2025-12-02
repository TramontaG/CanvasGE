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
  private animationTimer: number = 0;
  public velocity: Vector = new Vector(0, 0);
  public speed: number;
  public facingDirection: "up" | "down" | "left" | "right" = "down";
  public facingSprites: Record<Client["facingDirection"], number> = {
    down: 0,
    up: 4,
    left: 8,
    right: 8,
  };

  private ticksPerFrame: number;

  constructor(name: string, scale: number = 4, speed: number = 1) {
    super(name, new Vector(150, 150));
    this.scale = scale;
    this.speed = speed;

    this.ticksPerFrame = 1 / (speed / 8);

    this.addHitbox(
      new SquareHitbox(
        new Vector(8, 0).multiply(scale),
        new Vector(16, 32).multiply(scale),
        this
      )
    );
  }

  @renderSprite<Client>(
    (obj) => obj.velocity.equals(Vector.zero()),
    "client1",
    (obj) => obj.facingSprites[obj.facingDirection],
    (obj) => obj.scale,
    (obj) => (obj.facingDirection === "right" ? "horizontal" : null)
  )
  @renderSpriteAnimation<Client>(
    (obj) => obj.velocity.toNormalized().equals(new Vector(0, 1)),
    "client1",
    DOWN_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale
  )
  @renderSpriteAnimation<Client>(
    (obj) => obj.velocity.toNormalized().equals(new Vector(-1, 0)),
    "client1",
    LEFT_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale
  )
  @renderSpriteAnimation<Client>(
    (obj) => obj.velocity.toNormalized().equals(new Vector(0, -1)),
    "client1",
    UP_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale
  )
  @renderSpriteAnimation<Client>(
    (obj) => obj.velocity.toNormalized().equals(new Vector(1, 0)),
    "client1",
    RIGHT_ANIMATION_INDEXES,
    (obj) => obj.ticksPerFrame,
    (obj) => obj.scale,
    "horizontal"
  )
  override render(canvas: CanvasController, scene: Scene): void {
    super.render(canvas, scene);
  }

  override tick(): void {
    super.tick();

    const walking = !this.velocity.equals(Vector.zero());

    if (walking) {
      this.animationTimer++;
    } else {
      this.animationTimer = 0;
    }

    if (walking && this.animationTimer % Math.floor(20 / this.speed) === 0) {
      this.position.add(this.velocity.toMultiplied(this.speed));
      return;
    }
    if (walking && this.animationTimer % Math.floor(10 / this.speed) === 0) {
      this.position.add(this.velocity.toMultiplied(this.speed * 1.2));
      return;
    }
  }

  @onKeyPressed<Client>("ArrowLeft", (obj, _ev) => {
    const velocity = new Vector(-3, 0).multiply(obj.scale);
    obj.facingDirection = "left";
    obj.velocity = velocity;
  })
  @onKeyPressed<Client>("ArrowRight", (obj, _ev) => {
    const velocity = new Vector(3, 0).multiply(obj.scale);
    obj.facingDirection = "right";
    obj.velocity = velocity;
  })
  @onKeyPressed<Client>("ArrowUp", (obj, _ev) => {
    const velocity = new Vector(0, -3).multiply(obj.scale);
    obj.facingDirection = "up";
    obj.velocity = velocity;
  })
  @onKeyPressed<Client>("ArrowDown", (obj, _ev) => {
    const velocity = new Vector(0, 3).multiply(obj.scale);
    obj.facingDirection = "down";
    obj.velocity = velocity;
  })
  override handleEvent(event: GameEvent): void {
    super.handleEvent(event);
    if (event.type === "keyReleased") {
      this.velocity = Vector.zero();
    }
  }
}

export { Client };
