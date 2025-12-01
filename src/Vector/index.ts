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

  toAdded(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector): Vector {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  toSubtracted(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  multiply(scalar: number): Vector {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  toMultiplied(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  dotProduct(other: Vector): number {
    return this.x * other.x + this.y * other.y;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  equals(other: Vector): boolean {
    return this.x === other.x && this.y === other.y;
  }

  static zero(): Vector {
    return new Vector(0, 0);
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
    return this.clone().normalize();
  }
}

export { Vector };
