# CanvasGE

Small HTML Canvas playground for experimenting with a 2D game loop, a scene stack, and some ergonomic event decorators.

## What is here
- Canvas controller with helpers for rectangles, circles, text, and sprite loading (`CanvasController`, `ShapeDrawer`, `SpriteLibrary`).
- Scene manager with an active scene stack plus offset support for camera-like translation (`SceneManager`, `Scene`).
- Game loop that separates ticks (logic) from rendering and exposes a shared `GameContext`.
- Event system with hover/click decorators, key-hold helpers, and hitboxes for point intersection (`Events/decorators`, `Hitboxes`).
- Basic library of game objects: boxes, buttons, clickable/hoverable shapes, and a scene translator overlay (`GameObject/Library`).
- Message bus and key accumulator utilities (`Context`, `Events/keyAccumulator`).

## Repository layout
- `index.html` – Host page with the canvas mount and a styled shell for the demo.
- `src/index.ts` – Entry point wiring the canvas, game, event dispatcher, and debug scenes.
- `src/Game` – Game loop and context bootstrap.
- `src/Scenes` – Scene definition plus `SceneManager`; `DebugScenes` shows sample objects.
- `src/GameObject` – Base game object, hitboxes, and the reusable object library (buttons, boxes, groups, hoverable/clickable shapes, scene translator).
- `src/CanvasController` – Canvas/sprite helpers and transformation utilities.
- `src/Events` – Event types, dispatcher, decorators, and key accumulator.
- `src/Assets` – Simple shape renderers (arrows/chevrons).

## Running locally
1) Install deps: `npm install` (or `bun install`).
2) Start dev server: `npm run start` (Parcel will open `index.html`).
3) Build static files: `npm run build` (outputs to `build/`).

The demo mounts an 800x600 canvas and loads two debug scenes; the button in the first scene pushes a second scene onto the stack.

## Extending
- Add a scene by instantiating `Scene` and registering it in `SceneManager` (`src/index.ts`).
- Create a game object by subclassing `GameObject`, adding hitboxes, and using decorators like `@onClick` or `@onKeyPressed` to react to input.
- Use `GameContext` methods from your objects to switch/push/pop scenes, publish/subscribe messages, or query pressed keys.
