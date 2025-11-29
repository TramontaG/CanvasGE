import type { Vector } from "../../Vector";
import { GameObject } from "../index";

class SquareHitbox {
  constructor(
    private offset: Vector,
    private size: Vector,
    private gameObject: GameObject
  ) {}

  public getAbsolutePosition(): { x: number; y: number } {
    const gameObjectPosition = this.gameObject.getPosition();

    return {
      x: gameObjectPosition.x + this.offset.x,
      y: gameObjectPosition.y + this.offset.y,
    };
  }

  public intersects(other: SquareHitbox): boolean {
    const thisPos = this.getAbsolutePosition();
    const otherPos = other.getAbsolutePosition();

    return !(
      thisPos.x + this.size.x < otherPos.x ||
      thisPos.x > otherPos.x + other.size.x ||
      thisPos.y + this.size.y < otherPos.y ||
      thisPos.y > otherPos.y + other.size.y
    );
  }

  public intersectsWithPoint(point: { x: number; y: number }): boolean {
    const thisPos = this.getAbsolutePosition();

    return !(
      point.x < thisPos.x ||
      point.x > thisPos.x + this.size.x ||
      point.y < thisPos.y ||
      point.y > thisPos.y + this.size.y
    );
  }
}

class CircleHitbox {
  constructor(
    private offset: Vector,
    private radius: number,
    private gameObject: GameObject
  ) {}

  public getAbsolutePosition(): { x: number; y: number } {
    const gameObjectPosition = this.gameObject.getPosition();
    return {
      x: gameObjectPosition.x + this.offset.x,
      y: gameObjectPosition.y + this.offset.y,
    };
  }

  public intersects(other: CircleHitbox): boolean {
    const thisPos = this.getAbsolutePosition();
    const otherPos = other.getAbsolutePosition();
    const dx = thisPos.x - otherPos.x;
    const dy = thisPos.y - otherPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }

  public intersectsWithPoint(point: { x: number; y: number }): boolean {
    const thisPos = this.getAbsolutePosition();
    const dx = point.x - thisPos.x;
    const dy = point.y - thisPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius;
  }
}

export { SquareHitbox, CircleHitbox };
