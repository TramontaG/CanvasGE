import { Scene } from "../../../Scenes";
import palette from "../../colors.json";
import { Vector } from "../../../Lib/Vector";
import { Client } from "../../GameObjects/Client";
import { Walker } from "../../GameObjects/Walker";
import { SquareHitbox } from "../../../GameObject/Hitboxes";
import { random } from "../../Util/Math";
import { LamenEmpireButton } from "../../GameObjects/LamenEmpireButton";
import { slideReplace } from "../../../Scenes/SceneManager/Transitions";
import { GameObject } from "../../../GameObject";

type SceneDimensions = {
  width: number;
  height: number;
};

const createPathfindingDebugScene = ({ width, height }: SceneDimensions) => {
  const scene = new Scene("PathfindingDebug", palette.PrimaryEvenDarker);

  class SolidBlock extends GameObject {
    private blockHitbox: SquareHitbox;
    private blockSize: Vector;
    private color: string;

    constructor(name: string, position: Vector, size: Vector, color: string) {
      super(name, position);
      this.color = color;
      this.blockSize = size.clone();
      this.blockHitbox = new SquareHitbox(Vector.zero(), this.blockSize, this, {
        solid: true,
        debug: false,
      });
      this.addHitbox(this.blockHitbox);
      this.setRenderFunction((obj, canvas) => {
        const pos = obj.getPosition();
        const drawer = canvas.getShapeDrawer();
        drawer.drawRectangle(
          pos.x,
          pos.y,
          this.blockSize.x,
          this.blockSize.y,
          this.color,
          true,
          0.8
        );
        drawer.drawRectangle(
          pos.x,
          pos.y,
          this.blockSize.x,
          this.blockSize.y,
          "black",
          false,
          0.8
        );
      });
    }

    setSize(size: Vector): void {
      this.blockSize = size.clone();
      this.blockHitbox.size = this.blockSize.clone();
    }

    getSize(): Vector {
      return this.blockSize.clone();
    }
  }

  const buttonScale = 2;
  const padding = 16;

  const backButton = new LamenEmpireButton(
    "BackToMenu",
    new Vector(padding, padding),
    "Menu",
    "purple",
    (btn) => btn.transitionToScene("menu", slideReplace("right"), "replace"),
    { scale: buttonScale, fontSize: 10 }
  );

  const shuffleButton = new LamenEmpireButton(
    "ShuffleObstacles",
    new Vector(padding + 180, padding),
    "Shuffle",
    "normal",
    () => {
      shuffleObstacles();
      client.walker?.requestPathRecalculation();
    },
    { scale: buttonScale, fontSize: 10 }
  );

  const margin = 40;
  const uiHeight = 90;
  const playMin = new Vector(margin, uiHeight + margin);
  const playMax = new Vector(width - margin, height - margin);

  const waypoints: Vector[] = [
    new Vector(playMin.x, playMin.y),
    new Vector(playMax.x, playMin.y),
    new Vector(playMax.x, playMax.y),
    new Vector(playMin.x, playMax.y),
    new Vector(playMin.x, playMin.y), // closes the loop for onComplete
  ];

  const client = new Client("PathfindingClient", 3, 2);
  client.setPhisics({
    immovable: false,
    restitution: 0,
    friction: 0.15,
    affectedByGravity: false,
  });
  client.setPosition(waypoints[0]!.clone());

  const walker = new Walker(client, waypoints, 2.2, true, false, {
    avoidObstacles: true,
    gridCellSize: 16,
    maxExpandedNodes: 12_000,
  })
    .start()
    .setOnComplete(() => {
      shuffleObstacles();
      walker.reset();
      walker.start();
    });

  client.setWalker(walker);

  const obstacleCount = 8;
  const obstacleColors = [
    palette.Primary,
    palette.PrimaryDarker,
    palette.Purple,
    palette.DarkPurple,
  ].filter(Boolean) as string[];

  const obstacles: SolidBlock[] = [];
  for (let i = 0; i < obstacleCount; i++) {
    const size = new Vector(64, 48);
    const obstacle = new SolidBlock(
      `Obstacle-${i}`,
      new Vector(playMin.x + i * 10, playMin.y + i * 10),
      size,
      obstacleColors[i % obstacleColors.length] ?? "gray"
    );
    obstacles.push(obstacle);
  }

  const aabbIntersects = (
    a: { minX: number; maxX: number; minY: number; maxY: number },
    b: { minX: number; maxX: number; minY: number; maxY: number }
  ): boolean =>
    a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;

  const aabbFor = (position: Vector, size: Vector) => ({
    minX: position.x,
    maxX: position.x + size.x,
    minY: position.y,
    maxY: position.y + size.y,
  });

  const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

  const reservedAabbs = (): Array<ReturnType<typeof aabbFor>> => {
    const aabbs: Array<ReturnType<typeof aabbFor>> = [];

    // Keep corners reachable so a full loop is always possible,
    // but still allow obstacles to spawn along the edges (in the walker's way).
    const avoidRadius = 28;
    for (const wp of waypoints) {
      aabbs.push(
        aabbFor(
          new Vector(wp.x - avoidRadius, wp.y - avoidRadius),
          new Vector(avoidRadius * 2, avoidRadius * 2)
        )
      );
    }

    return aabbs;
  };

  const findObstaclePlacement = (
    size: Vector,
    existing: Array<ReturnType<typeof aabbFor>>
  ): Vector => {
    const maxX = playMax.x - size.x;
    const maxY = playMax.y - size.y;

    const boundsMinX = padding;
    const boundsMinY = uiHeight + padding;
    const boundsMaxX = width - padding - size.x;
    const boundsMaxY = height - padding - size.y;

    const attempts = 120;
    const reserved = reservedAabbs();

    for (let attempt = 0; attempt < attempts; attempt++) {
      const side = Math.floor(random(0, 4));

      // Place obstacles so they overlap the path rectangle edges.
      let candidateX = playMin.x;
      let candidateY = playMin.y;

      if (side === 0) {
        // Top edge: ensure obstacle vertical span includes y=playMin.y.
        candidateX = random(playMin.x, maxX);
        candidateY = random(playMin.y - size.y, playMin.y);
      } else if (side === 1) {
        // Bottom edge: ensure obstacle vertical span includes y=playMax.y.
        candidateX = random(playMin.x, maxX);
        candidateY = random(playMax.y - size.y, playMax.y);
      } else if (side === 2) {
        // Left edge: ensure obstacle horizontal span includes x=playMin.x.
        candidateX = random(playMin.x - size.x, playMin.x);
        candidateY = random(playMin.y, maxY);
      } else {
        // Right edge: ensure obstacle horizontal span includes x=playMax.x.
        candidateX = random(playMax.x - size.x, playMax.x);
        candidateY = random(playMin.y, maxY);
      }

      const candidate = new Vector(
        clamp(candidateX, boundsMinX, boundsMaxX),
        clamp(candidateY, boundsMinY, boundsMaxY)
      );
      const candidateAabb = aabbFor(candidate, size);

      const hitsReserved = reserved.some((aabb) =>
        aabbIntersects(candidateAabb, aabb)
      );
      if (hitsReserved) continue;

      const overlapsExisting = existing.some((aabb) =>
        aabbIntersects(candidateAabb, aabb)
      );
      if (overlapsExisting) continue;

      return candidate;
    }

    return new Vector(random(playMin.x, maxX), random(playMin.y, maxY));
  };

  const shuffleObstacles = (): void => {
    const placed: Array<ReturnType<typeof aabbFor>> = [];

    for (const obstacle of obstacles) {
      const w = Math.floor(random(2, 10)) * 16;
      const h = Math.floor(random(2, 8)) * 16;
      const size = new Vector(w, h);
      const position = findObstaclePlacement(size, placed);
      obstacle.setPosition(position);
      obstacle.setSize(size);
      placed.push(aabbFor(position, size));
    }
  };

  shuffleObstacles();

  scene.addGameObject([client, ...obstacles, backButton, shuffleButton]);
  return scene;
};

export { createPathfindingDebugScene };
