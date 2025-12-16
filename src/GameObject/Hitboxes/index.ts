import type { CanvasController } from "../../CanvasController";
import type { Vector } from "../../Vector";
import { GameObject } from "../index";

type HitboxOptions = {
  debug?: boolean;
  solid?: boolean;
};

type Hitbox = SquareHitbox | CircleHitbox;

const normalizeHitboxOptions = (
  options?: HitboxOptions | boolean
): Required<HitboxOptions> => {
  if (typeof options === "boolean") {
    return { debug: options, solid: true };
  }

  return {
    debug: options?.debug ?? false,
    solid: options?.solid ?? true,
  };
};

class SquareHitbox {
  public solid: boolean;
  private debug: boolean;

  constructor(
    public offset: Vector,
    public size: Vector,
    public gameObject: GameObject,
    options: HitboxOptions | boolean = {}
  ) {
    const resolved = normalizeHitboxOptions(options);
    this.debug = resolved.debug;
    this.solid = resolved.solid;
  }

  public getAbsolutePosition() {
    const gameObjectPosition = this.gameObject.getPosition();
    return gameObjectPosition.toAdded(this.offset);
  }

  public getFutureIntendedPosition(): Vector {
    return this.gameObject.getIntendedNextPosition().toAdded(this.offset);
  }

  private intesectsWithSquare(
    other: SquareHitbox,
    selfPos: Vector,
    otherPos: Vector
  ): boolean {
    return !(
      selfPos.x + this.size.x < otherPos.x ||
      selfPos.x > otherPos.x + other.size.x ||
      selfPos.y + this.size.y < otherPos.y ||
      selfPos.y > otherPos.y + other.size.y
    );
  }

  private intersectsWithCircle(
    other: CircleHitbox,
    selfPos: Vector,
    otherPos: Vector
  ): boolean {
    const rectCenter = selfPos.add(this.size.toMultiplied(0.5));

    const r = other.radius;
    const dx = Math.abs(otherPos.x - rectCenter.x);
    const dy = Math.abs(otherPos.y - rectCenter.y);

    const halfW = this.size.x / 2;
    const halfH = this.size.y / 2;

    if (dx > halfW + r || dy > halfH + r) {
      return false;
    }

    if (dx <= halfW || dy <= halfH) {
      return true;
    }

    const cornerDx = dx - halfW;
    const cornerDy = dy - halfH;

    return cornerDx * cornerDx + cornerDy * cornerDy <= r * r;
  }

  public intersects(other: CircleHitbox | SquareHitbox): boolean {
    const thisPos = this.getAbsolutePosition();
    const otherPos = other.getAbsolutePosition();

    if (other instanceof CircleHitbox) {
      return this.intersectsWithCircle(other, thisPos, otherPos);
    }

    if (other instanceof SquareHitbox) {
      return this.intesectsWithSquare(other, thisPos, otherPos);
    }

    return false;
  }

  public willIntersectWith(other: CircleHitbox | SquareHitbox): boolean {
    const thisPos = this.getFutureIntendedPosition();
    const otherPos = other.getFutureIntendedPosition();

    if (other instanceof CircleHitbox) {
      return this.intersectsWithCircle(other, thisPos, otherPos);
    }

    if (other instanceof SquareHitbox) {
      return this.intesectsWithSquare(other, thisPos, otherPos);
    }

    return false;
  }

  public intersectsWithPoint(point: Vector): boolean {
    const thisPos = this.getAbsolutePosition();

    return !(
      point.x < thisPos.x ||
      point.x > thisPos.x + this.size.x ||
      point.y < thisPos.y ||
      point.y > thisPos.y + this.size.y
    );
  }

  public renderDebug(canvas: CanvasController): void {
    if (this.debug) {
      const pos = this.getAbsolutePosition();
      canvas
        .getShapeDrawer()
        .drawRectangle(pos.x, pos.y, this.size.x, this.size.y, "red", false);
    }
  }
}

class CircleHitbox {
  public solid: boolean;
  private debug: boolean;

  constructor(
    public offset: Vector,
    public radius: number,
    public gameObject: GameObject,
    options: HitboxOptions | boolean = {}
  ) {
    const resolved = normalizeHitboxOptions(options);
    this.debug = resolved.debug;
    this.solid = resolved.solid;
  }

  public getAbsolutePosition() {
    const gameObjectPosition = this.gameObject.getPosition();
    return gameObjectPosition.toAdded(this.offset);
  }

  public getFutureIntendedPosition(): Vector {
    return this.gameObject.getIntendedNextPosition().toAdded(this.offset);
  }

  private intersectWithCircle(
    other: CircleHitbox,
    thisPos: Vector,
    otherPos: Vector
  ): boolean {
    const dx = thisPos.x - otherPos.x;
    const dy = thisPos.y - otherPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + other.radius;
  }

  private intersectWithSquare(
    other: SquareHitbox,
    thisPos: Vector,
    otherPos: Vector
  ) {
    const rectCenter = otherPos.add(other.size.toMultiplied(0.5));

    const r = this.radius;
    const dx = Math.abs(thisPos.x - rectCenter.x);
    const dy = Math.abs(thisPos.y - rectCenter.y);

    const halfW = other.size.x / 2;
    const halfH = other.size.y / 2;

    if (dx > halfW + r || dy > halfH + r) {
      return false;
    }

    if (dx <= halfW || dy <= halfH) {
      return true;
    }

    const cornerDx = dx - halfW;
    const cornerDy = dy - halfH;

    return cornerDx * cornerDx + cornerDy * cornerDy <= r * r;
  }

  public intersects(other: CircleHitbox | SquareHitbox): boolean {
    const thisPos = this.getAbsolutePosition();
    const otherPos = other.getAbsolutePosition();

    if (other instanceof CircleHitbox) {
      return this.intersectWithCircle(other, thisPos, otherPos);
    }

    if (other instanceof SquareHitbox) {
      return this.intersectWithSquare(other, thisPos, otherPos);
    }

    return false;
  }

  public willIntersectWith(other: CircleHitbox | SquareHitbox): boolean {
    const thisPos = this.getFutureIntendedPosition();
    const otherPos = other.getFutureIntendedPosition();

    if (other instanceof CircleHitbox) {
      return this.intersectWithCircle(other, thisPos, otherPos);
    }
    if (other instanceof SquareHitbox) {
      return this.intersectWithSquare(other, thisPos, otherPos);
    }

    return false;
  }

  public intersectsWithPoint(point: Vector): boolean {
    const thisPos = this.getAbsolutePosition();
    const dx = point.x - thisPos.x;
    const dy = point.y - thisPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius;
  }

  public renderDebug(canvas: CanvasController): void {
    if (this.debug) {
      const pos = this.getAbsolutePosition();
      canvas
        .getShapeDrawer()
        .drawCircle(pos.x, pos.y, this.radius, "red", false);
    }
  }
}

export { SquareHitbox, CircleHitbox, type HitboxOptions, type Hitbox };
