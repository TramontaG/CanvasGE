---
title: Door + key (messages + triggers)
sidebar_position: 5
---
import sandpack1IndexTs from "../sandpack/examples/door-and-key/interactive-example/index.ts?raw";
import sandpack1DoorTs from "../sandpack/examples/door-and-key/interactive-example/Door.ts?raw";
import sandpack1KeyPickupTs from "../sandpack/examples/door-and-key/interactive-example/KeyPickup.ts?raw";
import sandpack1PlayerTs from "../sandpack/examples/door-and-key/interactive-example/Player.ts?raw";
import sandpack1CreateBoundsTs from "../sandpack/examples/door-and-key/interactive-example/createBounds.ts?raw";
import sandpack1MainTs from "../sandpack/examples/door-and-key/interactive-example/main.ts?raw";

This example shows a common pattern:

- a “key” pickup is a non-solid trigger
- the key sends a message when collected
- the “door” listens and changes its behavior at runtime by swapping its `tickFn` (`setTickFunction`)

## Key pickup (trigger)

```ts
import { GameObject, SquareHitbox, Vector } from "sliver-engine";

class KeyPickup extends GameObject {
  constructor() {
    super("item:key", new Vector(240, 160));
    this.addHitbox(
      new SquareHitbox(Vector.zero(), new Vector(16, 16), this, {
        solid: false,
      })
    );
  }

  override onColision(other: GameObject): void {
    if (other.name !== "player") return;
    this.sendMessage("player:key_obtained", { id: "gold" });
    this.destroy();
  }
}
```

## Door (locks until key obtained)

```ts
import { GameObject, SquareHitbox, Vector, renderTile } from "sliver-engine";
import type { CanvasController, GameContext, Scene } from "sliver-engine";

// indexes of the sprites in the spritesheet
const DoorSprites = {
  open: 0,
  closed: 1,
};

class Door extends GameObject {
  public open: boolean = false;

  constructor() {
    super("door", new Vector(400, 160));
    this.addHitbox(new SquareHitbox(Vector.zero(), new Vector(24, 48), this)); // solid
    this.setPhisics({ immovable: true });
  }

  override onAddedToScene(_scene: Scene, _context: GameContext): void {
    this.onceOnMessage<{ id: string }>("player:key_obtained", ({ id }) => {
      if (id !== "gold") return;

      // Make the door non-solid for the player to pass through it
      this.getHitboxes().forEach((h) => (h.solid = false));
    });
  }

  // change the rendering of the door depending on if it's open or closed.
  @renderTile<Door>(
    "interactive_objects", // spritesheet name
    DoorSprites.open, // sprite index
    { when: (door) => door.open }
  )
  @renderTile<Door>(
    "interactive_objects", // spritesheet name
    DoorSprites.closed, // sprite index
    { when: (door) => !door.open }
  )
  override render(canvas: CanvasController, scene: Scene): void {}
}
```

This keeps coupling low: the key doesn’t need to know where the door is.

In the interactive example, the player is driven by velocity through the scene physics step, so the closed door and the arena walls block movement physically instead of relying on manual position checks.

## Interactive example

This sandbox demonstrates key pickup + message-driven door behavior.

- Move with `W/A/S/D`.
- Edit `Door.ts` to change how the door reacts to the key.
- Press **Run** to apply changes.

<SandpackExample
	files={{
		"/index.ts": {
			code: sandpack1IndexTs,
			readOnly: true,
		},
		"/Door.ts": sandpack1DoorTs,
		"/KeyPickup.ts": {
			code: sandpack1KeyPickupTs,
			readOnly: true,
		},
		"/Player.ts": {
			code: sandpack1PlayerTs,
			readOnly: true,
		},
		"/createBounds.ts": {
			code: sandpack1CreateBoundsTs,
			readOnly: true,
		},
		"/main.ts": {
			code: sandpack1MainTs,
			readOnly: true,
		},
	}}
	visibleFiles={["/Door.ts"]}
	activeFile="/Door.ts"
	editorHeight={320}
	showRunButton
	hiddenFiles={[
		"/index.html",
		"/styles.css",
		"/package.json",
		"/index.ts",
		"/main.ts",
		"/Player.ts",
		"/KeyPickup.ts",
		"/createBounds.ts",
	]}
	options={{
		autoReload: false,
		showNavigator: true,
		showRefreshButton: true,
		showTabs: true,
		showLineNumbers: true,
		wrapContent: false,
	}}
	customSetup={{
		dependencies: {
			"sliver-engine": "0.0.1-alpha-5",
		},
	}}
/>
