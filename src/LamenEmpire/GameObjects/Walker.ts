import type { CanvasController, ShapeDrawer } from "../../CanvasController";
import type { GameObject } from "../../GameObject";
import { Vector } from "../../Vector";

class Walker {
  private waypointIndex: number = 0;
  private active: boolean = false;
  private ciclic: boolean;

  constructor(
    private gameObject: GameObject,
    private waypoints: Vector[] = [],
    private speed: number,
    private debug = false,
    ciclic = true
  ) {
    this.ciclic = ciclic;
  }

  public getTargetedWaypoint() {
    if (this.waypoints.length === 0) return null;

    if (this.ciclic) {
      return this.waypoints[this.waypointIndex % this.waypoints.length]!;
    }

    const clampedIndex = Math.min(
      this.waypointIndex,
      this.waypoints.length - 1
    );
    return this.waypoints[clampedIndex]!;
  }

  private nextWaypoint(): Vector {
    if (!this.ciclic && this.waypointIndex >= this.waypoints.length - 1) {
      return this.waypoints[this.waypoints.length - 1]!;
    }

    this.waypointIndex = this.ciclic
      ? (this.waypointIndex + 1) % this.waypoints.length
      : this.waypointIndex + 1;
    return this.getTargetedWaypoint()!;
  }

  public toggle() {
    this.active = !this.active;
  }

  public reset() {
    this.waypointIndex = 0;
  }

  public hardReset() {
    this.waypointIndex = 0;
    if (!this.waypoints[0]) {
      return console.warn(
        `${this.gameObject.name} has no waypoints, impossible to hard reset it's walker!`
      );
    }
    this.gameObject.setPosition(this.waypoints[0]);
  }

  public tick() {
    if (!this.active || this.waypoints.length === 0) {
      return;
    }

    const currentPosition = this.gameObject.getPosition();
    const targetedWaypoint = this.getTargetedWaypoint();
    if (!targetedWaypoint) return;

    const movementVector = targetedWaypoint.toSubtracted(currentPosition);
    const movementDirection = movementVector.toNormalized();

    const intendedMovementVector = movementDirection.toMultiplied(this.speed);
    const maxMovement = movementVector.squaredMagnitude();

    const shouldClipMovement =
      intendedMovementVector.squaredMagnitude() >= maxMovement;

    const movement = shouldClipMovement ? movementVector : intendedMovementVector;

    if (shouldClipMovement) {
      const isAtLastWaypoint =
        !this.ciclic && this.waypointIndex >= this.waypoints.length - 1;

      if (isAtLastWaypoint) {
        this.gameObject.speed = Vector.zero();
        this.active = false;
        return;
      }

      this.nextWaypoint();
    }

    this.gameObject.speed = movement;

    return {
      direction: movementDirection,
      speed: this.speed,
      movement,
      currentWaypoint: this.getTargetedWaypoint(),
    };
  }

  public renderDebug(canvas: CanvasController) {
    if (!this.debug) return;
    this.waypoints.forEach((waypoint, index) => {
      canvas
        .getShapeDrawer()
        .drawCircle(waypoint.x, waypoint.y, 8, "red", true);
      if (index == 0) return;
      canvas.getShapeDrawer().drawLine(this.waypoints[index - 1]!, waypoint, 8);
    });

    if (this.ciclic && this.waypoints.length > 1) {
      canvas
        .getShapeDrawer()
        .drawLine(
          this.waypoints[this.waypoints.length - 1]!,
          this.waypoints[0]!,
          8
        );
    }
  }
}

export { Walker };
