import type { CanvasController } from "../../CanvasController";
import type { GameEvent } from "../../Events";
import { onClick } from "../../Events/decorators";
import { GameObject } from "../../GameObject";
import {
  renderSprite,
  renderSpriteAnimation,
} from "../../GameObject/Decorators";
import { CircleHitbox, SquareHitbox } from "../../GameObject/Hitboxes";
import type { Scene } from "../../Scenes";
import { Vector } from "../../Vector";

class Client extends GameObject {
  private walking: boolean = false;
  public scale: number;

  constructor(name: string, scale: number = 4) {
    super(name, new Vector(150, 150));
    this.scale = scale;

    this.addHitbox(
      new SquareHitbox(
        new Vector(8, 0).multiply(scale),
        new Vector(16, 32).multiply(scale),
        this
      )
    );
  }

  @renderSprite<Client>((obj) => !obj.walking, "client1", 0, (obj) => obj.scale)
  @renderSpriteAnimation<Client>(
    (obj) => obj.walking,
    "client1",
    [0, 1, 2, 3],
    10,
    (obj) => obj.scale
  )
  override render(canvas: CanvasController, scene: Scene): void {
    super.render(canvas, scene);
  }

  override tick(): void {
    super.tick();
    const tickCount = this.getContext()!.getTickCount();
    if (this.walking && tickCount % 20 === 0) {
      this.position.add(new Vector(0, 5).multiply(this.scale));
    }
  }

  @onClick<Client>((obj, ev) => {
    obj.toggleWalking();
  })
  override handleEvent(event: GameEvent): void {}

  toggleWalking(): void {
    this.walking = !this.walking;
  }
}

export { Client };
