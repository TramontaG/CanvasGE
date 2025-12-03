class Vector {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  private roundToZero() {
    if (Math.abs(this.x) < 0.05) this.x = 0;
    if (Math.abs(this.y) < 0.05) this.y = 0;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  squaredMagnitude() {
    return this.x * this.x + this.y * this.y;
  }

  add(other: Vector): Vector {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  toAdded(other: Vector): Vector {
    const result = new Vector(this.x + other.x, this.y + other.y);
    result.roundToZero();
    return result;
  }

  subtract(other: Vector): Vector {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  toSubtracted(other: Vector): Vector {
    const result = new Vector(this.x - other.x, this.y - other.y);
    result.roundToZero();
    return result;
  }

  multiply(scalar: number): Vector {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  toMultiplied(scalar: number): Vector {
    const result = new Vector(this.x * scalar, this.y * scalar);
    result.roundToZero();
    return result;
  }

  dotProduct(other: Vector): number {
    return this.x * other.x + this.y * other.y;
  }

  clone(): Vector {
    const result = new Vector(this.x, this.y);
    result.roundToZero();
    return result;
  }

  equals(other: Vector): boolean {
    return this.x === other.x && this.y === other.y;
  }

  static zero(): Vector {
    const result = new Vector(0, 0);
    result.roundToZero();
    return result;
  }

  normalize(): Vector {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }
    return this;
  }

  toNormalized(): Vector {
    const result = this.clone().normalize();
    result.roundToZero();
    return result;
  }
}

export { Vector };
