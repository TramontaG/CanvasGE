import type { GameObject } from "..";
import type { CanvasController } from "../../CanvasController";
import type { Scene } from "../../Scenes";
import type { Vector } from "../../Vector";

type MirroringMode = "horizontal" | "vertical" | "both" | null;

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

      spriteLib.drawSpriteFrame(
        context,
        spriteSheetName,
        typeof index === "function" ? index(this) : index,
        overridePosition ? overridePosition(this) : this.position,
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
  spriteSheetName: string,
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

      const frameIndex =
        Math.floor(gameContext.getTickCount() / ticksPerFrame) % indexes.length;

      const spriteIndex =
        typeof indexes === "function"
          ? indexes(this)[frameIndex]!
          : indexes[frameIndex]!;

      spriteLib.drawSpriteFrame(
        context,
        spriteSheetName,
        spriteIndex,
        overridePosition ? overridePosition(this) : this.position,
        typeof scale === "function" ? scale(this) : scale,
        mirroring === "horizontal" || mirroring === "both",
        mirroring === "vertical" || mirroring === "both"
      );
      return original.call(this, canvas, scene);
    };
    return descriptor;
  };
};
