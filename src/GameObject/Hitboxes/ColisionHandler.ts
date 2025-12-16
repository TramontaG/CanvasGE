import { CircleHitbox, SquareHitbox, type Hitbox } from ".";
import { clamp } from "../../LamenEmpire/Util/Math";
import { Vector } from "../../Vector";

type CollisionResolution = {
  penetration: Vector;
  normal: Vector;
  deltaA: Vector;
  deltaB: Vector;
  velocityA: Vector;
  velocityB: Vector;
  appliedImpulse: boolean;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

class ColisionHandler {
  static resolveCollision(
    hitboxA: Hitbox,
    hitboxB: Hitbox
  ): CollisionResolution | null {
    if (!hitboxA.solid || !hitboxB.solid) return null;

    const goA = hitboxA.gameObject;
    const goB = hitboxB.gameObject;

    const immovableA = !!goA.phisics.immovable;
    const immovableB = !!goB.phisics.immovable;

    if (immovableA && immovableB) return null;

    const penetration = this.getPenetrationVector(hitboxA, hitboxB);

    if (penetration.squaredMagnitude() === 0) {
      return null;
    }

    const normal = penetration.toNormalized();

    const deltaA = !immovableA && immovableB
      ? penetration
      : !immovableA && !immovableB
        ? penetration.toMultiplied(0.5)
        : Vector.zero();

    const deltaB = immovableA && !immovableB
      ? penetration.toMultiplied(-1)
      : !immovableA && !immovableB
        ? penetration.toMultiplied(-0.5)
        : Vector.zero();

    const velocityA = goA.speed.clone();
    const velocityB = goB.speed.clone();

    const invMassA = immovableA ? 0 : 1;
    const invMassB = immovableB ? 0 : 1;
    const invMassSum = invMassA + invMassB;

    let resolvedVelocityA = velocityA.clone();
    let resolvedVelocityB = velocityB.clone();
    let appliedImpulse = false;
    let normalImpulseScalar = 0;

    if (invMassSum > 0) {
      const relativeVelocity = velocityA.toSubtracted(velocityB);
      const velocityAlongNormal = relativeVelocity.dotProduct(normal);

      // Only resolve when bodies are moving towards each other.
      if (velocityAlongNormal < 0) {
        const restitutionA = clamp01(goA.phisics.restitution ?? 1);
        const restitutionB = clamp01(goB.phisics.restitution ?? 1);
        const restitution = Math.min(restitutionA, restitutionB);

        const impulseScalar =
          (-(1 + restitution) * velocityAlongNormal) / invMassSum;
        const impulse = normal.toMultiplied(impulseScalar);

        resolvedVelocityA = velocityA.toAdded(impulse.toMultiplied(invMassA));
        resolvedVelocityB = velocityB.toSubtracted(
          impulse.toMultiplied(invMassB)
        );
        appliedImpulse = true;
        normalImpulseScalar = impulseScalar;
      }

      const frictionA = clamp01(goA.phisics.friction ?? 0);
      const frictionB = clamp01(goB.phisics.friction ?? 0);
      const friction = Math.min(frictionA, frictionB);

      if (friction > 0 && normalImpulseScalar > 0) {
        const postRelativeVelocity = resolvedVelocityA.toSubtracted(resolvedVelocityB);
        const normalComponent = postRelativeVelocity.dotProduct(normal);
        const tangent = postRelativeVelocity.toSubtracted(
          normal.toMultiplied(normalComponent)
        );

        if (tangent.squaredMagnitude() > 0) {
          tangent.normalize();
          const tangentSpeed = postRelativeVelocity.dotProduct(tangent);
          const tangentImpulseScalar = -tangentSpeed / invMassSum;
          const maxFriction = friction * normalImpulseScalar;
          const clampedTangentImpulse = Math.max(
            -maxFriction,
            Math.min(maxFriction, tangentImpulseScalar)
          );

          if (clampedTangentImpulse !== 0) {
            const frictionImpulse = tangent.toMultiplied(clampedTangentImpulse);
            resolvedVelocityA = resolvedVelocityA.toAdded(
              frictionImpulse.toMultiplied(invMassA)
            );
            resolvedVelocityB = resolvedVelocityB.toSubtracted(
              frictionImpulse.toMultiplied(invMassB)
            );
            appliedImpulse = true;
          }
        }
      }
    }

    return {
      penetration,
      normal,
      deltaA,
      deltaB,
      velocityA: resolvedVelocityA,
      velocityB: resolvedVelocityB,
      appliedImpulse,
    };
  }

  static getPenetrationVector(hitboxA: Hitbox, hitboxB: Hitbox): Vector {
    if (hitboxA instanceof SquareHitbox && hitboxB instanceof SquareHitbox) {
      return this.mtvRectRect(hitboxA, hitboxB);
    }
    if (hitboxA instanceof CircleHitbox && hitboxB instanceof CircleHitbox) {
      return this.mtvCircleCircle(hitboxA, hitboxB);
    }
    if (hitboxA instanceof SquareHitbox && hitboxB instanceof CircleHitbox) {
      return this.mtvSquareCircle(hitboxA, hitboxB).toMultiplied(-1);
    }
    if (hitboxA instanceof CircleHitbox && hitboxB instanceof SquareHitbox) {
      return this.mtvCircleSquare(hitboxA, hitboxB);
    }
    return new Vector(0, 0);
  }

  private static mtvRectRect(a: SquareHitbox, b: SquareHitbox): Vector {
    const aTL = a.getAbsolutePosition();
    const bTL = b.getAbsolutePosition();

    const aL = aTL.x;
    const aR = aTL.x + a.size.x;
    const aT = aTL.y;
    const aB = aTL.y + a.size.y;

    const bL = bTL.x;
    const bR = bTL.x + b.size.x;
    const bT = bTL.y;
    const bB = bTL.y + b.size.y;

    const overlapX = Math.min(aR, bR) - Math.max(aL, bL);
    const overlapY = Math.min(aB, bB) - Math.max(aT, bT);

    const aCx = aL + a.size.x / 2;
    const aCy = aT + a.size.y / 2;
    const bCx = bL + b.size.x / 2;
    const bCy = bT + b.size.y / 2;

    if (overlapX < overlapY) {
      return new Vector(aCx < bCx ? -overlapX : overlapX, 0);
    } else {
      return new Vector(0, aCy < bCy ? -overlapY : overlapY);
    }
  }

  private static mtvCircleCircle(a: CircleHitbox, b: CircleHitbox): Vector {
    const ac = a.getAbsolutePosition();
    const bc = b.getAbsolutePosition();

    const diff = ac.toSubtracted(bc);
    const distSq = diff.squaredMagnitude();
    const r = a.radius + b.radius;

    if (distSq === 0) return new Vector(r, 0);

    const dist = Math.sqrt(distSq);
    const depth = r - dist;
    const normal = diff.toMultiplied(1 / dist);

    return normal.toMultiplied(depth);
  }

  private static mtvSquareCircle(
    rect: SquareHitbox,
    circle: CircleHitbox
  ): Vector {
    const rectTL = rect.getAbsolutePosition();
    const rectMinX = rectTL.x;
    const rectMaxX = rectTL.x + rect.size.x;
    const rectMinY = rectTL.y;
    const rectMaxY = rectTL.y + rect.size.y;

    const cc = circle.getAbsolutePosition();

    const closestX = clamp(cc.x, rectMinX, rectMaxX);
    const closestY = clamp(cc.y, rectMinY, rectMaxY);

    const dx = cc.x - closestX;
    const dy = cc.y - closestY;

    const d2 = dx * dx + dy * dy;

    // in case the center of the circle is inside the rectangle
    if (d2 === 0) {
      // chooses the minimum push to the edge
      const leftPen = cc.x - rectMinX;
      const rightPen = rectMaxX - cc.x;
      const topPen = cc.y - rectMinY;
      const bottomPen = rectMaxY - cc.y;

      const minPen = Math.min(leftPen, rightPen, topPen, bottomPen);

      if (minPen === leftPen) return new Vector(-(leftPen + circle.radius), 0);
      if (minPen === rightPen) return new Vector(rightPen + circle.radius, 0);
      if (minPen === topPen) return new Vector(0, -(topPen + circle.radius));
      return new Vector(0, bottomPen + circle.radius);
    }

    const dist = Math.sqrt(d2);
    const depth = circle.radius - dist;

    const normal = new Vector(dx / dist, dy / dist);
    return normal.toMultiplied(depth);
  }

  private static mtvCircleSquare(
    circle: CircleHitbox,
    rect: SquareHitbox
  ): Vector {
    return this.mtvSquareCircle(rect, circle);
  }
}

export { ColisionHandler };
