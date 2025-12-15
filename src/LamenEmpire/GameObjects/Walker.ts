import type { CanvasController, ShapeDrawer } from "../../CanvasController";
import type { GameObject } from "../../GameObject";
import { Vector } from "../../Vector";

class Walker {
  private waypointIndex: number = 0;
  private active: boolean = false;
  private ciclic: boolean;
  private onComplete?: () => void;

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

  public setWaypoints(waypoints: Vector[], ciclic: boolean = false): void {
    this.waypoints = waypoints;
    this.ciclic = ciclic;
    this.waypointIndex = 0;
    this.active = false;
    this.gameObject.speed = Vector.zero();
  }

  public isActive(): boolean {
    return this.active;
  }

  public setOnComplete(callback: () => void) {
    this.onComplete = callback;
    return this;
  }

  public toggle() {
    this.active = !this.active;
    if (!this.active) {
      this.gameObject.speed = Vector.zero(); //stop moving
    }
  }

  public start() {
    this.active = true;
    return this;
  }

  private stop() {
    this.active = false;
    this.gameObject.speed = Vector.zero();
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

    const currentPosition = this.gameObject.getScenePosition();
    const targetedWaypoint = this.getTargetedWaypoint();
    if (!targetedWaypoint) {
      this.onComplete?.();
      return;
    }

    const movementVector = targetedWaypoint.toSubtracted(currentPosition);
    const movementDirection = movementVector.toNormalized();

    const intendedMovementVector = movementDirection.toMultiplied(this.speed);
    const maxMovement = movementVector.squaredMagnitude();

    const shouldClipMovement =
      intendedMovementVector.squaredMagnitude() >= maxMovement;

    const movement = shouldClipMovement
      ? movementVector
      : intendedMovementVector;

    if (shouldClipMovement) {
      const isAtLastWaypoint =
        !this.ciclic && this.waypointIndex >= this.waypoints.length - 1;

      if (isAtLastWaypoint) {
        // Snap to the final waypoint, stop, and notify listeners.
        this.gameObject.setPosition(targetedWaypoint);
        this.gameObject.speed = Vector.zero();
        this.active = false;
        this.onComplete?.();

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
    const sceneOffset = this.gameObject.scene?.getOffset() ?? Vector.zero();
    this.waypoints.forEach((waypoint, index) => {
      const renderedWaypoint = waypoint.toAdded(sceneOffset);
      canvas
        .getShapeDrawer()
        .drawCircle(renderedWaypoint.x, renderedWaypoint.y, 8, "red", true);
      if (index == 0) return;
      canvas.getShapeDrawer().drawLine(
        this.waypoints[index - 1]!.toAdded(sceneOffset),
        renderedWaypoint,
        8
      );
    });

    if (this.ciclic && this.waypoints.length > 1) {
      canvas
        .getShapeDrawer()
        .drawLine(
          this.waypoints[this.waypoints.length - 1]!.toAdded(sceneOffset),
          this.waypoints[0]!.toAdded(sceneOffset),
          8
        );
    }
  }
}

export { Walker };
