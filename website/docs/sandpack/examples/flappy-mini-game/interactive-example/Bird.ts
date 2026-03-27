import {
  GameObject,
  SquareHitbox,
  Vector,
  onClickAnywhere,
  onKeyPressed,
  type CanvasController,
  type GameContext,
  type GameEvent,
  type Scene,
} from "sliver-engine";
import { BIRD_SIZE, BIRD_START, FLAP_VELOCITY } from "./constants";

export class Bird extends GameObject {
  private frozen = false;

  constructor(position: Vector) {
    super("bird", position.clone());
    this.addHitbox(new SquareHitbox(Vector.zero(), BIRD_SIZE.clone(), this));
    this.setPhisics({
      immovable: false,
      affectedByGravity: true,
    });
  }

  override onAddedToScene(_scene: Scene, _context: GameContext): void {
    this.onMessage("game:over", () => this.freeze());
    this.onMessage("game:reset", () => this.resetBird());
  }

  override onColision(other: GameObject): void {
    if (this.frozen) return;
    // Do not kill the bird if it bumps on the ceiling
    if (other.name === "ceiling") return;
    // Otherwise, kill the bird
    this.sendMessage("game:over", null);
  }

  flap(): void {
    if (this.frozen) return;
    // set the speed to a flat value upwards
    this.speed = new Vector(0, FLAP_VELOCITY);
  }

  private freeze(): void {
    this.frozen = true;
    this.speed = Vector.zero();
    this.angularVelocity = 0;
    this.setPhisics({ immovable: true, affectedByGravity: false });
  }

  private unfreeze(): void {
    this.frozen = false;
    this.setPhisics({ immovable: false, affectedByGravity: true });
  }

  private resetBird(): void {
    this.setPosition(BIRD_START.clone());
    this.speed = Vector.zero();
    this.unfreeze();
  }

  override tick(): void {
    super.tick();
    if (this.frozen) return;
  }

  @onKeyPressed<Bird>(" ", (obj) => {
    obj.handleInput();
  })
  @onClickAnywhere<Bird>((obj, event) => {
    obj.handleInput();
  })
  override handleEvent(event: GameEvent): void {
    super.handleEvent(event);
  }

  private handleInput(): void {
    if (this.frozen) {
      this.sendMessage("game:reset", null);
      return;
    }
    this.flap();
  }

  override render(canvas: CanvasController, _scene: Scene): void {
    const pos = this.getPosition();
    canvas
      .getShapeDrawer()
      .drawRectangle(pos.x, pos.y, BIRD_SIZE.x, BIRD_SIZE.y, "#fbbf24", true);
  }
}
