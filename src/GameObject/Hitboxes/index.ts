import { GameObject } from "../index";

class SquareHitbox {
  constructor(
    private xOffset: number,
    private yOffset: number,
    private width: number,
    private height: number,
    private gameObject: GameObject
  ) {}

  public getAbsolutePosition(): { x: number; y: number } {
    const gameObjectPosition = this.gameObject.getPosition();
    return {
      x: gameObjectPosition.x + this.xOffset,
      y: gameObjectPosition.y + this.yOffset,
    };
  }

  public intersects(other: SquareHitbox): boolean {
    const thisPos = this.getAbsolutePosition();
    const otherPos = other.getAbsolutePosition();

    return !(
      thisPos.x + this.width < otherPos.x ||
      thisPos.x > otherPos.x + other.width ||
      thisPos.y + this.height < otherPos.y ||
      thisPos.y > otherPos.y + other.height
    );
  }

  public intersectsWithPoint(point: { x: number; y: number }): boolean {
    const thisPos = this.getAbsolutePosition();
    return !(
      point.x < thisPos.x ||
      point.x > thisPos.x + this.width ||
      point.y < thisPos.y ||
      point.y > thisPos.y + this.height
    );
  }
}

class CircleHitbox {
  constructor(
    private xOffset: number,
    private yOffset: number,
    private radius: number,
    private gameObject: GameObject
  ) {}

  public getAbsolutePosition(): { x: number; y: number } {
    const gameObjectPosition = this.gameObject.getPosition();
    return {
      x: gameObjectPosition.x + this.xOffset,
      y: gameObjectPosition.y + this.yOffset,
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
