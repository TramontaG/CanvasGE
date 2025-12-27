import { Scene } from "../../../Scenes";
import { Vector } from "../../../Lib/Vector";
import palette from "../../colors.json";
import { Button } from "../../../GameObject/Library/Button";
import { Ball } from "./GameObjects/Ball";
import { PhisicsBox } from "./GameObjects/Box";
import { Wall } from "./GameObjects/Wall";
import { random } from "../../Util/Math";
import {
  fadeTransition,
  slideReplace,
} from "../../../Scenes/SceneManager/Transitions";
import { LamenEmpireButton } from "../../GameObjects/LamenEmpireButton";

const WALL_THICKNESS = 20;
const BALL_COUNT = 10;
const BOX_COUNT = 4;

const randomBallSpeed = (): Vector => {
  const angle = random(0, Math.PI * 2);
  const magnitude = random(2, 4);
  return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
};

const randomObjectSpeed = (): Vector => {
  const angle = random(0, Math.PI * 2);
  const magnitude = random(1, 5);
  return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
};

const createPhisicsTest = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const scene = new Scene("PhisicsTest", palette.Purple);
  scene.setGravity(new Vector(0, 0.15));

  const radius = Ball.RADIUS;
  const minX = WALL_THICKNESS + radius;
  const maxX = width - WALL_THICKNESS - radius;
  const minY = WALL_THICKNESS + radius;
  const maxY = height - WALL_THICKNESS - radius;

  const walls = [
    new Wall("WallTop", new Vector(0, 0), new Vector(width, WALL_THICKNESS)),
    new Wall(
      "WallBottom",
      new Vector(0, height - WALL_THICKNESS),
      new Vector(width, WALL_THICKNESS)
    ),
    new Wall("WallLeft", new Vector(0, 0), new Vector(WALL_THICKNESS, height)),
    new Wall(
      "WallRight",
      new Vector(width - WALL_THICKNESS, 0),
      new Vector(WALL_THICKNESS, height)
    ),
  ];

  const balls: Ball[] = [];

  const clampBallPosition = (position: Vector): Vector =>
    new Vector(
      Math.min(maxX, Math.max(minX, position.x)),
      Math.min(maxY, Math.max(minY, position.y))
    );

  const pushBall = (position: Vector): void => {
    const ball = new Ball(clampBallPosition(position));
    ball.speed = randomBallSpeed();
    balls.push(ball);
  };

  // Seed a couple at deterministic spots.
  pushBall(new Vector(width * 0.35, height * 0.35));
  pushBall(new Vector(width * 0.65, height * 0.65));

  const minDistance = radius * 2 + 2;
  const minDistanceSq = minDistance * minDistance;

  const findSpawnPosition = (): Vector => {
    const maxAttempts = 75;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = new Vector(random(minX, maxX), random(minY, maxY));
      const overlapsExisting = balls.some((existing) => {
        const p = existing.getPosition();
        const dx = candidate.x - p.x;
        const dy = candidate.y - p.y;
        return dx * dx + dy * dy < minDistanceSq;
      });
      if (!overlapsExisting) return candidate;
    }

    return new Vector(random(minX, maxX), random(minY, maxY));
  };

  while (balls.length < BALL_COUNT) {
    pushBall(findSpawnPosition());
  }

  const boxes: PhisicsBox[] = [];
  const boxesMinX = WALL_THICKNESS;
  const boxesMinY = WALL_THICKNESS;

  const aabbIntersects = (
    a: { minX: number; maxX: number; minY: number; maxY: number },
    b: { minX: number; maxX: number; minY: number; maxY: number }
  ): boolean =>
    a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;

  const ballAabb = (ball: Ball) => {
    const p = ball.getPosition();
    return {
      minX: p.x - radius,
      maxX: p.x + radius,
      minY: p.y - radius,
      maxY: p.y + radius,
    };
  };

  const boxAabb = (position: Vector, size: Vector) => ({
    minX: position.x,
    maxX: position.x + size.x,
    minY: position.y,
    maxY: position.y + size.y,
  });

  const findBoxSpawnPosition = (size: Vector): Vector => {
    const maxX = width - WALL_THICKNESS - size.x;
    const maxY = Math.min(height - WALL_THICKNESS - size.y, height * 0.5);

    const attempts = 100;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const candidate = new Vector(
        random(boxesMinX, maxX),
        random(boxesMinY, maxY)
      );
      const candidateAabb = boxAabb(candidate, size);

      const overlapsBalls = balls.some((ball) =>
        aabbIntersects(candidateAabb, ballAabb(ball))
      );
      if (overlapsBalls) continue;

      const overlapsBoxes = boxes.some((box) =>
        aabbIntersects(candidateAabb, boxAabb(box.getPosition(), box.getSize()))
      );
      if (overlapsBoxes) continue;

      return candidate;
    }

    return new Vector(random(boxesMinX, maxX), random(boxesMinY, maxY));
  };

  for (let i = 0; i < BOX_COUNT; i++) {
    const size = new Vector(random(30, 70), random(30, 70));
    const position = findBoxSpawnPosition(size);
    const box = new PhisicsBox(position, size);
    box.speed = new Vector(random(-1.2, 1.2), random(-0.5, 0.5));
    boxes.push(box);
  }

  const randomizeObjects = (): void => {
    scene.getGameObjects().forEach((gameObject) => {
      if (gameObject.phisics.immovable) return;

      if (gameObject instanceof Ball) {
        gameObject.setPosition(
          new Vector(random(minX, maxX), random(minY, maxY))
        );
        gameObject.speed = randomBallSpeed();
        return;
      }

      if (gameObject instanceof PhisicsBox) {
        const size = gameObject.getSize();
        const maxX = width - WALL_THICKNESS - size.x;
        const maxY = height - WALL_THICKNESS - size.y;
        gameObject.setPosition(
          new Vector(random(WALL_THICKNESS, maxX), random(WALL_THICKNESS, maxY))
        );
        gameObject.speed = randomObjectSpeed();
        return;
      }

      gameObject.speed = randomObjectSpeed();
    });
  };

  const randomizeButton = new LamenEmpireButton(
    "RandomizeSceneObjects",
    new Vector(32, 32),
    "Random",
    "green",
    () => randomizeObjects()
  );

  const backButton = new LamenEmpireButton(
    "BackToLastScene",
    new Vector(240, 32),
    "Back",
    "purple",
    (obj) =>
      obj
        .getContext()
        ?.transitionToScene("menu", slideReplace("right"), "replace")
  );

  scene.addGameObject([
    ...walls,
    ...boxes,
    ...balls,
    randomizeButton,
    backButton,
  ]);

  return scene;
};

export { createPhisicsTest };
