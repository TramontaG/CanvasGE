import type { ShapeRendererFn } from "../Assets/Shapes";
import type { Vector } from "../Vector";

export const withRotation = (
  angle: number,
  shape: ShapeRendererFn
): ShapeRendererFn => {
  return (ctx, position, size) => {
    ctx.save();
    // Translate to the center of the object
    ctx.translate(position.x + size.x / 2, position.y + size.y / 2);
    // Rotate around the center
    ctx.rotate(angle);
    // Translate back to the original position
    ctx.translate(-(position.x + size.x / 2), -(position.y + size.y / 2));
    shape(ctx, position, size);
    ctx.restore();
  };
};

export const withTranslation = (
  translationVector: Vector,
  shape: ShapeRendererFn
): ShapeRendererFn => {
  return (ctx, position, size) => {
    ctx.save();
    ctx.translate(translationVector.x, translationVector.y);
    shape(ctx, position, size);
    ctx.restore();
  };
};
