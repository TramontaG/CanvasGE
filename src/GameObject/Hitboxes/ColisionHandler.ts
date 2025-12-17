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
  angularVelocityA: number;
  angularVelocityB: number;
  appliedImpulse: boolean;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const cross = (a: Vector, b: Vector): number => a.x * b.y - a.y * b.x;

const getHitboxBounds = (hitbox: Hitbox) => {
  if (hitbox instanceof CircleHitbox) {
    const center = hitbox.getAbsolutePosition();
    return {
      minX: center.x - hitbox.radius,
      maxX: center.x + hitbox.radius,
      minY: center.y - hitbox.radius,
      maxY: center.y + hitbox.radius,
    };
  }

  const topLeft = hitbox.getAbsolutePosition();
  return {
    minX: topLeft.x,
    maxX: topLeft.x + hitbox.size.x,
    minY: topLeft.y,
    maxY: topLeft.y + hitbox.size.y,
  };
};

const getBodyBounds = (hitboxes: Hitbox[]) => {
  if (hitboxes.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const hitbox of hitboxes) {
    const bounds = getHitboxBounds(hitbox);
    minX = Math.min(minX, bounds.minX);
    maxX = Math.max(maxX, bounds.maxX);
    minY = Math.min(minY, bounds.minY);
    maxY = Math.max(maxY, bounds.maxY);
  }

  return { minX, maxX, minY, maxY };
};

const getBodyCenter = (hitboxes: Hitbox[]): Vector => {
  const bounds = getBodyBounds(hitboxes);
  return new Vector(
    (bounds.minX + bounds.maxX) / 2,
    (bounds.minY + bounds.maxY) / 2
  );
};

const getInverseInertia = (hitboxes: Hitbox[]): number => {
  if (hitboxes.length === 0) return 0;

  if (hitboxes.length === 1) {
    const only = hitboxes[0]!;
    if (only instanceof CircleHitbox) {
      const r = only.radius;
      return r > 0 ? 2 / (r * r) : 0;
    }
    if (only instanceof SquareHitbox) {
      const w = only.size.x;
      const h = only.size.y;
      const denom = w * w + h * h;
      return denom > 0 ? 12 / denom : 0;
    }
  }

  const bounds = getBodyBounds(hitboxes);
  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  const denom = w * w + h * h;
  return denom > 0 ? 12 / denom : 0;
};

const projectVertices = (
  vertices: Vector[],
  axis: Vector
): { min: number; max: number } => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const vertex of vertices) {
    const projection = vertex.dotProduct(axis);
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  }

  return { min, max };
};

type ObbData = {
  center: Vector;
  axisX: Vector;
  axisY: Vector;
  halfX: number;
  halfY: number;
};

const getObbData = (
  vertices: [Vector, Vector, Vector, Vector],
  size: Vector
): ObbData => {
  const center = vertices[0].toAdded(vertices[2]).toMultiplied(0.5);
  const axisX = vertices[1].toSubtracted(vertices[0]).normalize();
  const axisY = vertices[3].toSubtracted(vertices[0]).normalize();
  return {
    center,
    axisX,
    axisY,
    halfX: size.x / 2,
    halfY: size.y / 2,
  };
};

const obbToWorld = (obb: ObbData, localX: number, localY: number): Vector =>
  new Vector(
    obb.center.x + obb.axisX.x * localX + obb.axisY.x * localY,
    obb.center.y + obb.axisX.y * localX + obb.axisY.y * localY
  );

const closestPointOnObb = (point: Vector, obb: ObbData): Vector => {
  const dx = point.x - obb.center.x;
  const dy = point.y - obb.center.y;
  const distX = dx * obb.axisX.x + dy * obb.axisX.y;
  const distY = dx * obb.axisY.x + dy * obb.axisY.y;

  const clampedX = clamp(distX, -obb.halfX, obb.halfX);
  const clampedY = clamp(distY, -obb.halfY, obb.halfY);

  return obbToWorld(obb, clampedX, clampedY);
};

const closestPointOnObbBoundary = (
  point: Vector,
  obb: ObbData,
  preferredNormal?: Vector
): Vector => {
  const dx = point.x - obb.center.x;
  const dy = point.y - obb.center.y;
  const distX = dx * obb.axisX.x + dy * obb.axisX.y;
  const distY = dx * obb.axisY.x + dy * obb.axisY.y;

  const inside =
    Math.abs(distX) <= obb.halfX && Math.abs(distY) <= obb.halfY;

  if (!inside) {
    const clampedX = clamp(distX, -obb.halfX, obb.halfX);
    const clampedY = clamp(distY, -obb.halfY, obb.halfY);
    return obbToWorld(obb, clampedX, clampedY);
  }

  if (preferredNormal) {
    const dotX = preferredNormal.dotProduct(obb.axisX);
    const dotY = preferredNormal.dotProduct(obb.axisY);

    if (Math.abs(dotX) >= Math.abs(dotY)) {
      const signX = dotX >= 0 ? 1 : -1;
      return obbToWorld(
        obb,
        signX * obb.halfX,
        clamp(distY, -obb.halfY, obb.halfY)
      );
    }

    const signY = dotY >= 0 ? 1 : -1;
    return obbToWorld(
      obb,
      clamp(distX, -obb.halfX, obb.halfX),
      signY * obb.halfY
    );
  }

  const penX = obb.halfX - Math.abs(distX);
  const penY = obb.halfY - Math.abs(distY);

  if (penX < penY) {
    const signX = distX >= 0 ? 1 : -1;
    return obbToWorld(
      obb,
      signX * obb.halfX,
      clamp(distY, -obb.halfY, obb.halfY)
    );
  }

  const signY = distY >= 0 ? 1 : -1;
  return obbToWorld(
    obb,
    clamp(distX, -obb.halfX, obb.halfX),
    signY * obb.halfY
  );
};

const getSupportPoint = (vertices: Vector[], direction: Vector): Vector => {
  let best = vertices[0]!;
  let bestProjection = best.dotProduct(direction);

  for (let i = 1; i < vertices.length; i++) {
    const candidate = vertices[i]!;
    const projection = candidate.dotProduct(direction);
    if (projection > bestProjection) {
      best = candidate;
      bestProjection = projection;
    }
  }

  return best;
};

const getContactPoint = (
  hitboxA: Hitbox,
  hitboxB: Hitbox,
  normal: Vector
): Vector => {
  if (hitboxA instanceof CircleHitbox && hitboxB instanceof CircleHitbox) {
    const aCenter = hitboxA.getTransformedPosition();
    const bCenter = hitboxB.getTransformedPosition();
    const pointOnA = aCenter.toSubtracted(normal.toMultiplied(hitboxA.radius));
    const pointOnB = bCenter.toAdded(normal.toMultiplied(hitboxB.radius));
    return pointOnA.toAdded(pointOnB).toMultiplied(0.5);
  }

  if (hitboxA instanceof CircleHitbox && hitboxB instanceof SquareHitbox) {
    const circleCenter = hitboxA.getTransformedPosition();
    const rectVertices = hitboxB.getTransformedVertices();
    const obb = getObbData(rectVertices, hitboxB.size);
    return closestPointOnObbBoundary(circleCenter, obb, normal);
  }

  if (hitboxA instanceof SquareHitbox && hitboxB instanceof CircleHitbox) {
    const circleCenter = hitboxB.getTransformedPosition();
    const rectVertices = hitboxA.getTransformedVertices();
    const obb = getObbData(rectVertices, hitboxA.size);
    return closestPointOnObbBoundary(circleCenter, obb, new Vector(-normal.x, -normal.y));
  }

  if (hitboxA instanceof SquareHitbox && hitboxB instanceof SquareHitbox) {
    const verticesA = hitboxA.getTransformedVertices();
    const verticesB = hitboxB.getTransformedVertices();

    const obbA = getObbData(verticesA, hitboxA.size);
    const obbB = getObbData(verticesB, hitboxB.size);

    const immovableA = !!hitboxA.gameObject.phisics.immovable;
    const immovableB = !!hitboxB.gameObject.phisics.immovable;

    let reference = obbA;
    let incident = obbB;
    let referenceToIncidentNormal = new Vector(-normal.x, -normal.y);

    if (immovableA !== immovableB) {
      if (immovableB) {
        reference = obbB;
        incident = obbA;
        referenceToIncidentNormal = normal;
      }
    } else {
      const alignmentA = Math.max(
        Math.abs(normal.dotProduct(obbA.axisX)),
        Math.abs(normal.dotProduct(obbA.axisY))
      );
      const alignmentB = Math.max(
        Math.abs(normal.dotProduct(obbB.axisX)),
        Math.abs(normal.dotProduct(obbB.axisY))
      );

      if (alignmentB > alignmentA) {
        reference = obbB;
        incident = obbA;
        referenceToIncidentNormal = normal;
      }
    }

    const pointOnReference = closestPointOnObbBoundary(
      incident.center,
      reference,
      referenceToIncidentNormal
    );
    const pointOnIncident = closestPointOnObbBoundary(
      pointOnReference,
      incident,
      new Vector(-referenceToIncidentNormal.x, -referenceToIncidentNormal.y)
    );

    return pointOnReference.toAdded(pointOnIncident).toMultiplied(0.5);
  }

  return hitboxA.getAbsolutePosition();
};

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
    const contactPoint = getContactPoint(hitboxA, hitboxB, normal);

    const hitboxesA = goA.getHitboxes();
    const hitboxesB = goB.getHitboxes();

    const centerA = getBodyCenter(hitboxesA);
    const centerB = getBodyCenter(hitboxesB);

    const invInertiaA = immovableA ? 0 : getInverseInertia(hitboxesA);
    const invInertiaB = immovableB ? 0 : getInverseInertia(hitboxesB);

    const contactOffsetA = contactPoint.toSubtracted(centerA);
    const contactOffsetB = contactPoint.toSubtracted(centerB);

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

    let resolvedVelocityA = velocityA.clone();
    let resolvedVelocityB = velocityB.clone();
    let resolvedAngularVelocityA = goA.angularVelocity ?? 0;
    let resolvedAngularVelocityB = goB.angularVelocity ?? 0;
    let appliedImpulse = false;
    let normalImpulseScalar = 0;

    const velocityAtContact = (velocity: Vector, angularVelocity: number, offset: Vector): Vector => {
      const angularComponent = new Vector(-angularVelocity * offset.y, angularVelocity * offset.x);
      return velocity.toAdded(angularComponent);
    };

    const applyImpulse = (impulse: Vector): void => {
      if (invMassA > 0) {
        resolvedVelocityA = resolvedVelocityA.toAdded(impulse.toMultiplied(invMassA));
      }
      if (invMassB > 0) {
        resolvedVelocityB = resolvedVelocityB.toSubtracted(impulse.toMultiplied(invMassB));
      }

      if (invInertiaA > 0) {
        resolvedAngularVelocityA += cross(contactOffsetA, impulse) * invInertiaA;
      }
      if (invInertiaB > 0) {
        resolvedAngularVelocityB -= cross(contactOffsetB, impulse) * invInertiaB;
      }
    };

    const invMassSum = invMassA + invMassB;
    if (invMassSum > 0) {
      const vAContact = velocityAtContact(resolvedVelocityA, resolvedAngularVelocityA, contactOffsetA);
      const vBContact = velocityAtContact(resolvedVelocityB, resolvedAngularVelocityB, contactOffsetB);
      const relativeVelocity = vAContact.toSubtracted(vBContact);

      const velocityAlongNormal = relativeVelocity.dotProduct(normal);

      // Only resolve when bodies are moving towards each other.
      if (velocityAlongNormal < 0) {
        const restitutionA = clamp01(goA.phisics.restitution ?? 1);
        const restitutionB = clamp01(goB.phisics.restitution ?? 1);
        const restitution = Math.min(restitutionA, restitutionB);

        const raCrossN = cross(contactOffsetA, normal);
        const rbCrossN = cross(contactOffsetB, normal);
        const denom =
          invMassSum +
          raCrossN * raCrossN * invInertiaA +
          rbCrossN * rbCrossN * invInertiaB;

        if (denom > 0) {
          normalImpulseScalar = (-(1 + restitution) * velocityAlongNormal) / denom;
          const impulse = normal.toMultiplied(normalImpulseScalar);
          applyImpulse(impulse);
          appliedImpulse = normalImpulseScalar !== 0;
        }
      }

      const frictionA = clamp01(goA.phisics.friction ?? 0);
      const frictionB = clamp01(goB.phisics.friction ?? 0);
      const friction = Math.min(frictionA, frictionB);

      if (friction > 0 && normalImpulseScalar > 0) {
        const postVAContact = velocityAtContact(resolvedVelocityA, resolvedAngularVelocityA, contactOffsetA);
        const postVBContact = velocityAtContact(resolvedVelocityB, resolvedAngularVelocityB, contactOffsetB);
        const postRelativeVelocity = postVAContact.toSubtracted(postVBContact);

        const normalComponent = postRelativeVelocity.dotProduct(normal);
        const tangent = postRelativeVelocity.toSubtracted(normal.toMultiplied(normalComponent));

        if (tangent.squaredMagnitude() > 0) {
          tangent.normalize();
          const tangentSpeed = postRelativeVelocity.dotProduct(tangent);

          const raCrossT = cross(contactOffsetA, tangent);
          const rbCrossT = cross(contactOffsetB, tangent);
          const denomT =
            invMassSum +
            raCrossT * raCrossT * invInertiaA +
            rbCrossT * rbCrossT * invInertiaB;

          if (denomT > 0) {
            const tangentImpulseScalar = -tangentSpeed / denomT;
            const maxFriction = friction * normalImpulseScalar;
            const clampedTangentImpulse = Math.max(
              -maxFriction,
              Math.min(maxFriction, tangentImpulseScalar)
            );

            if (clampedTangentImpulse !== 0) {
              const frictionImpulse = tangent.toMultiplied(clampedTangentImpulse);
              applyImpulse(frictionImpulse);
              appliedImpulse = true;
            }
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
      angularVelocityA: resolvedAngularVelocityA,
      angularVelocityB: resolvedAngularVelocityB,
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
    const verticesA = a.getTransformedVertices();
    const verticesB = b.getTransformedVertices();

    const immovableA = !!a.gameObject.phisics.immovable;
    const immovableB = !!b.gameObject.phisics.immovable;

    const axes =
      immovableA !== immovableB
        ? (() => {
            const vertices = immovableA ? verticesA : verticesB;
            return [
              vertices[1].toSubtracted(vertices[0]),
              vertices[3].toSubtracted(vertices[0]),
            ];
          })()
        : [
            verticesA[1].toSubtracted(verticesA[0]),
            verticesA[3].toSubtracted(verticesA[0]),
            verticesB[1].toSubtracted(verticesB[0]),
            verticesB[3].toSubtracted(verticesB[0]),
          ];

    let minOverlap = Number.POSITIVE_INFINITY;
    let smallestAxis: Vector | null = null;

    for (const axis of axes) {
      if (axis.squaredMagnitude() === 0) continue;

      const normalizedAxis = axis.toNormalized();
      const projA = projectVertices(verticesA, normalizedAxis);
      const projB = projectVertices(verticesB, normalizedAxis);

      const overlap = Math.min(
        projA.max - projB.min,
        projB.max - projA.min
      );
      if (overlap <= 0) {
        return Vector.zero();
      }

      if (overlap < minOverlap) {
        minOverlap = overlap;
        smallestAxis = normalizedAxis;
      }
    }

    if (!smallestAxis || !Number.isFinite(minOverlap)) {
      return Vector.zero();
    }

    const centerA = verticesA[0].toAdded(verticesA[2]).toMultiplied(0.5);
    const centerB = verticesB[0].toAdded(verticesB[2]).toMultiplied(0.5);
    const direction = centerA.toSubtracted(centerB);

    if (direction.dotProduct(smallestAxis) < 0) {
      smallestAxis.multiply(-1);
    }

    return smallestAxis.toMultiplied(minOverlap);
  }

  private static mtvCircleCircle(a: CircleHitbox, b: CircleHitbox): Vector {
    const ac = a.getTransformedPosition();
    const bc = b.getTransformedPosition();

    const diff = ac.toSubtracted(bc);
    const distSq = diff.squaredMagnitude();
    const r = a.radius + b.radius;

    if (distSq === 0) return new Vector(r, 0);

    const dist = Math.sqrt(distSq);
    const depth = r - dist;
    if (depth <= 0) return Vector.zero();
    const normal = diff.toMultiplied(1 / dist);

    return normal.toMultiplied(depth);
  }

  private static mtvSquareCircle(
    rect: SquareHitbox,
    circle: CircleHitbox
  ): Vector {
    const circleCenter = circle.getTransformedPosition();
    const rectVertices = rect.getTransformedVertices();
    const obb = getObbData(rectVertices, rect.size);
    const closest = closestPointOnObb(circleCenter, obb);

    const diff = circleCenter.toSubtracted(closest);
    const distSq = diff.squaredMagnitude();
    const r = circle.radius;
    const rSq = r * r;

    if (distSq > rSq) {
      return Vector.zero();
    }

    if (distSq === 0) {
      const d = circleCenter.toSubtracted(obb.center);
      const distX = d.dotProduct(obb.axisX);
      const distY = d.dotProduct(obb.axisY);

      const penX = obb.halfX - Math.abs(distX);
      const penY = obb.halfY - Math.abs(distY);

      if (penX < penY) {
        const sign = distX >= 0 ? 1 : -1;
        return obb.axisX.toMultiplied(sign * (r + penX));
      }

      const sign = distY >= 0 ? 1 : -1;
      return obb.axisY.toMultiplied(sign * (r + penY));
    }

    const dist = Math.sqrt(distSq);
    const depth = r - dist;
    if (depth <= 0) return Vector.zero();

    return diff.toMultiplied(depth / dist);
  }

  private static mtvCircleSquare(
    circle: CircleHitbox,
    rect: SquareHitbox
  ): Vector {
    return this.mtvSquareCircle(rect, circle);
  }
}

export { ColisionHandler };
