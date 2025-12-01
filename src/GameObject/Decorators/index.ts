import type { GameObject } from "..";
import type { CanvasController } from "../../CanvasController";
import type { Scene } from "../../Scenes";
import type { Vector } from "../../Vector";

export const renderSprite = <TObj extends GameObject = GameObject>(
  when: (obj: TObj) => boolean,
  spriteSheetName: string,
  index: number,
  scale: number | ((obj: TObj) => number) = 1,
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

      spriteLib.drawSpriteFrame(
        context,
        spriteSheetName,
        index,
        overridePosition ? overridePosition(this) : this.position,
        typeof scale === "function" ? scale(this) : scale
      );

      return original.call(this, canvas, scene);
    };

    return descriptor;
  };
};

export const renderSpriteAnimation = <TObj extends GameObject = GameObject>(
  when: (obj: TObj) => boolean,
  spriteSheetName: string,
  indexes: number[],
  ticksPerFrame: number,
  scale: number | ((obj: TObj) => number) = 1,
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

      const frameIndex =
        Math.floor(gameContext.getTickCount() / ticksPerFrame) % indexes.length;

      const spriteIndex = indexes[frameIndex]!;

      spriteLib.drawSpriteFrame(
        context,
        spriteSheetName,
        spriteIndex,
        overridePosition ? overridePosition(this) : this.position,
        typeof scale === "function" ? scale(this) : scale
      );
      return original.call(this, canvas, scene);
    };
    return descriptor;
  };
};
