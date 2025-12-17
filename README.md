# CanvasGE

Small TypeScript/HTML5 Canvas playground for building a 2D game engine (CanvasGE) and dogfooding it with a WIP game (LamenEmpire).

## LamenEmpire note
`src/LamenEmpire` contains the game I’m currently developing on top of CanvasGE. As soon as the engine feels ready to be published, **LamenEmpire will be moved to its own repository** and this repo will focus on the engine only.

## Engine features (CanvasGE)
- **Game loop + context**: tick/render split, configurable TPS, shared `GameContext` (tick/frame counters, pressed keys, message bus, sound manager).
- **Scenes**: scene stack, per-scene camera offset, background fill, opacity + overlay, gravity, and transitions (fade/slide/flash with easing).
- **Rendering**: `CanvasController` + `ShapeDrawer` for primitives/text, clipping and rotation helpers, font loading, and sprite + sprite-sheet support (frame rendering, scaling, mirroring) with `renderSprite` / `renderSpriteAnimation` helpers.
- **Input/events**: keyboard + mouse + wheel events, propagation control, and ergonomic decorators (`@onClick`, `@onMouseRelease`, `@onHover`, `@onStopHovering`, `@onMouseWheel`, `@onMouseWheelOverHitbox`, `@onKeyPressed`/combo, `@onChildrenEvents`, `@grabbable()`).
- **Game objects**: `GameObject` base with tick/render hooks, child hierarchy, relative positioning, opacity/rotation, simple movement via `speed`, and helpers to change scenes / publish messages / query keys.
- **Hitboxes + collisions**: circle + (rotatable) square hitboxes, point checks, “will intersect” checks, debug rendering, and collision resolution with restitution + friction and immovable bodies.
- **Audio**: `SoundManager` (Web Audio) with preload, master gain, per-sound volume, looping, playback-rate, and start/end/duration controls.
- **Reusable object/widgets**: `Box`, `Button`, `Text`, `ScrollView` (clipping + scrollbar + wheel), `FloatingView` (rise + fade), `ShowOnHover`, `Group`, `SceneTranslator`, and basic shape helpers (`ClickableShape`, `HoverableShape`).

## Game in this repo (LamenEmpire)
LamenEmpire is the current “real” project used to validate the engine while it evolves.
- Scenes: menu, gameplay, and a physics test playground (`src/LamenEmpire/Scenes`).
- Uses engine systems heavily: sprite sheets, scene transitions, sound effects, hitboxes/collisions, and UI helpers like scroll views.

## Repository layout
- `index.html` – Host page with the canvas mount and a styled shell for the demo.
- `src/index.ts` – Current entry point (boots LamenEmpire).
- `src/CanvasController` – Canvas primitives, font loading, sprite + sprite-sheet helpers.
- `src/Context` – `GameContext` + message bus.
- `src/Events` – Event types, dispatcher, decorators, and `KeyAccumulator`.
- `src/Game` – Game loop orchestration.
- `src/GameObject` – `GameObject`, hitboxes/collisions, sprite render decorators, and reusable widgets.
- `src/Scenes` – `Scene` + `SceneManager` and transition helpers.
- `src/SoundManager` – Web Audio wrapper.
- `src/Vector` – Small 2D vector math utility.
- `src/LamenEmpire` – The game (will be extracted to a separate repo later).
- `src/Assets` – Shape render helpers (arrow/chevrons).

## Running locally
1) Install deps: `npm install` (or `bun install`).
2) Start dev server: `npm run start` (Parcel will open `index.html`).
3) Build static files: `npm run build` (outputs to `build/`).

The demo mounts an 800x600 canvas and boots LamenEmpire via `src/index.ts`.

## Extending
- Add a scene by instantiating `Scene` and registering it in `SceneManager` (see how `src/LamenEmpire/index.ts` wires scenes today).
- Create a game object by subclassing `GameObject`, adding hitboxes, and using decorators like `@onClick` / `@onHover` / `@onKeyPressed`.
- Use `GameContext` from objects to switch/push/pop/transition scenes, publish/subscribe messages, query pressed keys, and play sounds.

## Engine roadmap (to be “2D game ready”)
- **Decouple engine from LamenEmpire** (remove engine imports that reference `src/LamenEmpire`, and make the engine usable without the game).
- **Stabilize a public API** (clean exports, package/build story, examples).
- **Time management**: deterministic fixed timestep, pause/resume, time scaling, and better delta handling.
- **Camera**: follow targets, zoom/scale, screen↔world conversions, and parallax helpers.
- **Animation**: first-class sprite animation/state system (beyond per-object decorators), tweens, and timers.
- **Physics**: broadphase, collision layers/triggers, continuous collision, and more shapes/constraints as needed.
- **Input**: configurable bindings, gamepad/touch support, and action-based input mapping.
- **UI/layout tooling**: anchoring/layout helpers, text wrapping, and better debug tooling (inspectors/overlays).
