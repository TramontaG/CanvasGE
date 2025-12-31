import type { GameObject } from "..";
import type { CanvasController } from "../../CanvasController";
import type { Scene } from "../../Scenes";
import type { Vector } from "../../Lib/Vector";

type MirroringMode = "horizontal" | "vertical" | "both" | null;

export const onColision = <TObj extends GameObject = GameObject>(
  predicate: (self: TObj, other: GameObject) => boolean,
  handler: (self: TObj, other: GameObject) => void
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (this: TObj, other: GameObject, penetration: Vector) => unknown
    >
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      other: GameObject,
      penetration: Vector
    ) {
      if (predicate(this, other)) {
        handler(this, other);
      }

      return original.call(this, other, penetration);
    };

    return descriptor;
  };
};

export const renderSprite = <TObj extends GameObject = GameObject>(
  when: (obj: TObj) => boolean,
  spriteSheetName: string,
  index: number | ((obj: TObj) => number),
  scale: number | ((obj: TObj) => number) = 1,
  _mirroring: MirroringMode | ((obj: TObj) => MirroringMode) = null,
  overridePosition?: (obj: TObj) => Vector
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;

    descriptor.value = function (
      this: TObj,
      canvas: CanvasController,
      scene: Scene
    ) {
      if (!when(this)) {
        return original.call(this, canvas, scene);
      }
      const spriteLib = canvas.getSpriteLibrary();
      const context = canvas.getContext();
      const mirroring =
        typeof _mirroring === "function" ? _mirroring(this) : _mirroring;
      const position = overridePosition
        ? overridePosition(this)
        : this.getPosition();

      spriteLib.drawSpriteFrame(
        context,
        spriteSheetName,
        typeof index === "function" ? index(this) : index,
        position,
        typeof scale === "function" ? scale(this) : scale,
        mirroring === "horizontal" || mirroring === "both",
        mirroring === "vertical" || mirroring === "both"
      );

      return original.call(this, canvas, scene);
    };

    return descriptor;
  };
};

export const renderSpriteAnimation = <TObj extends GameObject = GameObject>(
  when: (obj: TObj) => boolean,
  _spriteSheetName: ((obj: TObj) => string) | string,
  indexes: number[] | ((obj: TObj) => number[]),
  _ticksPerFrame: number | ((obj: TObj) => number),
  scale: number | ((obj: TObj) => number) = 1,
  _mirroring: MirroringMode | ((obj: TObj) => MirroringMode) = null,
  overridePosition?: (obj: TObj) => Vector
) => {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const original = descriptor.value;
    if (!original) return descriptor;
    descriptor.value = function (
      this: TObj,
      canvas: CanvasController,
      scene: Scene
    ) {
      if (!when(this)) {
        return original.call(this, canvas, scene);
      }

      const spriteLib = canvas.getSpriteLibrary();
      const context = canvas.getContext();
      const gameContext = this.getContext()!;
      const mirroring =
        typeof _mirroring === "function" ? _mirroring(this) : _mirroring;
      const ticksPerFrame =
        typeof _ticksPerFrame === "number"
          ? _ticksPerFrame
          : _ticksPerFrame(this);
      const position = overridePosition
        ? overridePosition(this)
        : this.getPosition();

      const frameIndex =
        Math.floor(gameContext.getTickCount() / ticksPerFrame) % indexes.length;

      const spriteIndex =
        typeof indexes === "function"
          ? indexes(this)[frameIndex]!
          : indexes[frameIndex]!;

      const spriteSheetName =
        typeof _spriteSheetName === "function"
          ? _spriteSheetName(this)
          : _spriteSheetName;

      spriteLib.drawSpriteFrame(
        context,
        spriteSheetName,
        spriteIndex,
        position,
        typeof scale === "function" ? scale(this) : scale,
        mirroring === "horizontal" || mirroring === "both",
        mirroring === "vertical" || mirroring === "both"
      );
      return original.call(this, canvas, scene);
    };
    return descriptor;
  };
};
