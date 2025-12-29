---
title: Rendering
sidebar_position: 9
---

Rendering in Sliver is based on a `CanvasController`, which owns a real HTML `<canvas>` + its 2D rendering context, plus a few helpers:

- `ShapeDrawer`: drawing primitives, text, clipping/rotation helpers, and simple sprite drawing.
- `SpriteLibrary`: loads sprites and sprite sheets, and draws individual frames.

The engine clears the canvas and renders active scenes every frame (see [`Game loop`](./game-loop.md)).

## CanvasController (the canvas + 2D context)

Create a canvas:

```ts
import { CanvasController } from "sliver-engine";

const canvas = new CanvasController(800, 600);
```

By default, Sliver appends the `<canvas>` to `#canvas-container` if present, otherwise to `document.body`.

Useful APIs:

- `canvas.getCanvas()`: the underlying `HTMLCanvasElement`
- `canvas.getContext()`: the underlying `CanvasRenderingContext2D`
- `canvas.clearCanvas()`: clears the entire canvas
- `canvas.reset()`: resets the transform matrix (`setTransform(1,0,0,1,0,0)`)
- `canvas.getShapeDrawer()`: access `ShapeDrawer` helpers
- `canvas.getSpriteLibrary()`: access `SpriteLibrary` asset loading + frame drawing

## ShapeDrawer (primitives, text, transforms)

Get it from the canvas:

```ts
const draw = canvas.getShapeDrawer();
```

Common drawing calls:

```ts
import { Vector } from "sliver-engine";

draw.drawBackground("#0b0a18");
draw.drawRectangle(10, 10, 100, 50, "red", true);
draw.drawCircle(200, 120, 16, "cyan", true);
draw.drawLine(new Vector(0, 0), new Vector(100, 100), 4, "white");
draw.drawText("Hello", 400, 40, "white", "16px");
```

### Clipping, rotation, and opacity

These helpers wrap `ctx.save()` / `ctx.restore()` for you:

```ts
draw.withClippingRect(50, 50, 200, 100, () => {
  draw.drawText("Only visible inside", 150, 100, "white");
});

draw.withRotation(400, 300, Math.PI / 8, () => {
  draw.drawRectangle(360, 280, 80, 40, "orange", true);
});

draw.withOpacity(0.5, () => {
  draw.drawCircle(100, 100, 30, "hotpink", true);
});
```

### Font loading

`ShapeDrawer.loadFont(fontName, url)` loads and registers a font so it can be used by `drawText`.

```ts
await canvas
  .getShapeDrawer()
  .loadFont("Roboto", "https://fonts.googleapis.com/css2?family=Roboto");

canvas.getShapeDrawer().setDefaultFont("Roboto");
```

## Sprites and sprite sheets

All sprite assets live in the `SpriteLibrary`:

```ts
const sprites = canvas.getSpriteLibrary();
```

### Loading a single sprite

```ts
await sprites.loadSprite("player", new URL("/sprites/player.png", window.location.href));
```

Then draw it (scaled to a rectangle) via `ShapeDrawer.drawSprite`:

```ts
canvas.getShapeDrawer().drawSprite("player", 100, 100, 64, 64);
```

### Loading a sprite sheet

Use `loadSpriteSheet(name, url, frameWidth, frameHeight)` for fixed-grid sheets:

```ts
await sprites.loadSpriteSheet(
  "hero",
  new URL("/sprites/hero-sheet.png", window.location.href),
  16, // frameWidth
  16  // frameHeight
);
```

Frames are indexed **left-to-right, top-to-bottom**:

- first row: `0, 1, 2, ...`
- second row continues: `columns, columns+1, ...`

### Drawing a frame by index

```ts
import { Vector } from "sliver-engine";

sprites.drawSpriteFrame(
  canvas.getContext(),
  "hero",
  0,                 // frame index
  new Vector(100, 80),
  4                  // scale (16px -> 64px)
);
```

Notes:
- `drawSpriteFrame` disables image smoothing (`ctx.imageSmoothingEnabled = false`) for crisp pixel art.
- Optional mirroring is supported: `mirrorHorizontal` / `mirrorVertical`.

### Drawing a grid cell (col/row)

If you prefer explicit grid addressing:

```ts
sprites.drawSpriteGrid(canvas.getContext(), "hero", 2, 1, new Vector(100, 80), 4);
```

## Sprite rendering from GameObjects

Most sprites are drawn from `GameObject.render(canvas, scene)` (or a `renderFn`) using `CanvasController`:

```ts
gameObject.setRenderFunction((obj, canvas) => {
  const spriteLib = canvas.getSpriteLibrary();
  const pos = obj.getPosition();
  spriteLib.drawSpriteFrame(canvas.getContext(), "hero", 0, pos, 4);
});
```

## Rendering decorators (`renderSprite`, `renderSpriteAnimation`)

Sliver also provides **render decorators** for drawing sprite-sheet frames directly from your `render(...)` method.

These are not the same thing as the input/event decorators:

- Event decorators wrap `handleEvent(event)` (see `@onClick`, `@onHover`, …).
- Render decorators wrap `render(canvas, scene)` (see `@renderSprite`, `@renderSpriteAnimation`).

### `@renderSprite(when, sheetName, index, scale?, mirroring?, overridePosition?)`

Draws a single sprite-sheet frame when `when(obj)` is true.

Parameters can be constants or functions (so you can choose frames/scales dynamically):

- `index`: `number | (obj) => number`
- `scale`: `number | (obj) => number`
- `mirroring`: `"horizontal" | "vertical" | "both" | null | (obj) => ...`
- `overridePosition`: `(obj) => Vector` (defaults to `obj.getPosition()`)

Example (idle frame + horizontal flip based on direction):

```ts
import { GameObject, renderSprite } from "sliver-engine";
import type { CanvasController, Scene } from "sliver-engine";

class Hero extends GameObject {
  @renderSprite(
    () => true,
    "hero",
    0,
    4,
    (obj) => (obj.getDominantDirection() === "left" ? "horizontal" : null)
  )
  override render(canvas: CanvasController, scene: Scene): void {
    // Leave empty (or only do debug), so you don't draw on top of the sprite.
  }
}
```

### `@renderSpriteAnimation(when, sheetName, indexes, ticksPerFrame, scale?, mirroring?, overridePosition?)`

`renderSpriteAnimation` picks a frame based on `GameContext.getTickCount()`:

```ts
import { GameObject, renderSpriteAnimation } from "sliver-engine";
import type { CanvasController, Scene } from "sliver-engine";

class Hero extends GameObject {
  @renderSpriteAnimation(
    () => true,          // when
    "hero",              // spriteSheetName
    [0, 1, 2, 3],        // indexes (looped)
    6,                   // ticksPerFrame
    4                    // scale
  )
  override render(canvas: CanvasController, scene: Scene): void {
    // Leave empty (or only do debug), so you don't draw on top of the sprite.
  }
}
```

Because it’s tick-based, animation speed stays stable even if the frame rate varies.

Notes:
- `ticksPerFrame` can also be a function `(obj) => number` if you want variable animation speeds.
- `indexes` can also be a function `(obj) => number[]` if you want to swap animations by state.

## Tip: keep sprite indexes as constants

Hard-coding frame numbers everywhere gets painful fast. A simple pattern is to centralize them:

```ts
export const HERO_FRAMES = {
  Idle: [0, 1, 2, 3],
  Run: [8, 9, 10, 11],
  Jump: [16, 17, 18],
} as const;
```

Then your render code stays readable:

```ts
@renderSpriteAnimation(() => true, "hero", HERO_FRAMES.Run, 4, 4)
override render(canvas: CanvasController, scene: Scene): void {
  super.render(canvas, scene);
}
```
