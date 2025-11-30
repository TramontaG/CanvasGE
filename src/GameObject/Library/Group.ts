import { GameObject } from "..";
import type { GameEvent } from "../../Events";
import { onChildrenEvents } from "../../Events/decorators";
import { Vector } from "../../Vector";

class Group extends GameObject {
  constructor(name: string, children: GameObject[]) {
    super(name, new Vector(0, 0));

    children.forEach((child) => {
      this.addChild(child);
    });
  }

  @onChildrenEvents<Group>()
  override handleEvent(event: GameEvent): void {}
}

export { Group };
