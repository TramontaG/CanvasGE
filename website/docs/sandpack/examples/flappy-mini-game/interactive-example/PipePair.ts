import {
  GameObject,
  SquareHitbox,
  Vector,
  type CanvasController,
  type Scene,
} from "sliver-engine";
import {
  CANVAS_HEIGHT,
  GROUND_HEIGHT,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_WIDTH,
} from "./constants";
import type { Bird } from "./Bird";

export class PipePair extends GameObject {
  private passed = false;
  private frozen = false;

  constructor(
    x: number,
    private gapTopHeight: number,
    private bird: Bird,
  ) {
    super("pipe-pair", new Vector(x, 0));

    // Make it move to the left with PIPE_SPEED
    this.speed = new Vector(PIPE_SPEED, 0);

    const bottomHeight =
      CANVAS_HEIGHT - GROUND_HEIGHT - this.gapTopHeight - PIPE_GAP;

    // Creating hitboxes for colision detection
    this.addHitbox(
      new SquareHitbox(
        Vector.zero(),
        new Vector(PIPE_WIDTH, this.gapTopHeight),
        this,
      ),
    );
    this.addHitbox(
      new SquareHitbox(
        new Vector(0, this.gapTopHeight + PIPE_GAP),
        new Vector(PIPE_WIDTH, bottomHeight),
        this,
      ),
    );
  }

  // Freeze movement
  setFrozen(frozen: boolean): void {
    this.frozen = frozen;
    this.speed = frozen ? Vector.zero() : new Vector(PIPE_SPEED, 0);
  }

  override tick(): void {
    if (this.frozen) return;
    super.tick();

    const pos = this.getScenePosition();

    // If goes off screen, destroys it
    if (pos.x + PIPE_WIDTH < 0) {
      this.destroy();
      return;
    }

    // When position is passed, sends a message to the score hud
    if (!this.passed && pos.x + PIPE_WIDTH < this.bird.getScenePosition().x) {
      this.passed = true;
      this.sendMessage("score:pipe", { amount: 1 });
    }
  }

  override render(canvas: CanvasController, _scene: Scene): void {
    const pos = this.getPosition();
    const draw = canvas.getShapeDrawer();
    const bottomY = this.gapTopHeight + PIPE_GAP;
    const bottomHeight =
      CANVAS_HEIGHT - GROUND_HEIGHT - this.gapTopHeight - PIPE_GAP;

    // Render upper and lower pipes
    draw.drawRectangle(
      pos.x,
      pos.y,
      PIPE_WIDTH,
      this.gapTopHeight,
      "#10b981",
      true,
    );
    draw.drawRectangle(
      pos.x,
      bottomY,
      PIPE_WIDTH,
      bottomHeight,
      "#10b981",
      true,
    );
  }
}
