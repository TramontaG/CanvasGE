class Vector {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector): Vector {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other: Vector): Vector {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiply(scalar: number): Vector {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  dotProduct(other: Vector): number {
    return this.x * other.x + this.y * other.y;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }
}

export { Vector };
