import { Button } from "../../GameObject/Library/Button";
import type { CanvasController } from "../../CanvasController";
import type { GameObject } from "../../GameObject";
import { Vector } from "../../Lib/Vector";
import type { Scene } from "../../Scenes";
import { renderSprite } from "../../GameObject/Decorators";
import type { GameEvent } from "../../Events";
import { onClick } from "../../Events/decorators";

type LamenEmpireButtonVariant = "normal" | "green" | "purple";

const BUTTON_VARIANT_SPRITES: Record<
  LamenEmpireButtonVariant,
  { idle: number; hover: number }
> = {
  normal: { idle: 0, hover: 1 },
  green: { idle: 2, hover: 3 },
  purple: { idle: 4, hover: 5 },
};

type LamenEmpireButtonOptions = {
  spriteSheetName?: string;
  scale?: number;
  textColor?: string;
  fontSize?: number;
};

class LamenEmpireButton extends Button {
  static FRAME_SIZE = new Vector(64, 32);

  private variant: LamenEmpireButtonVariant;
  private scale: number;
  private textColor: string;
  private fontSize: number;
  private labelText: string;
  private scaledSize: Vector;

  constructor(
    name: string,
    position: Vector,
    label: string,
    variant: LamenEmpireButtonVariant = "normal",
    onClick: (button: LamenEmpireButton) => void = () => {},
    {
      scale = 3,
      textColor = "white",
      fontSize = 14,
    }: LamenEmpireButtonOptions = {}
  ) {
    const size = LamenEmpireButton.FRAME_SIZE.toMultiplied(scale);
    // Call the base constructor to keep hitbox/click handling intact.
    super(name, position, size, label, "transparent", textColor, (btn) =>
      onClick(btn as LamenEmpireButton)
    );

    this.variant = variant;
    this.scale = scale;
    this.textColor = textColor;
    this.fontSize = fontSize;
    this.labelText = label;
    this.scaledSize = size;

    this.setRenderFunction(this.renderSpriteButton);
  }

  getSize(): Vector {
    return this.scaledSize.clone();
  }

  @renderSprite<LamenEmpireButton>(
    () => true, // Always render (handles both hover and idle states)
    "buttons",
    (obj) =>
      BUTTON_VARIANT_SPRITES[obj.variant][obj.hovering ? "hover" : "idle"],
    (obj) => obj.scale
  )
  override render(canvas: CanvasController, scene: Scene): void {
    super.render(canvas, scene);
  }

  @onClick<LamenEmpireButton>((button) => {
    button.getContext()?.getSoundManager().playSound("button_click");
  })
  override handleEvent(event: GameEvent): void {
    super.handleEvent(event);
  }

  private renderSpriteButton(obj: GameObject, canvas: CanvasController): void {
    const position = obj.getPosition();

    const labelX = position.x + this.scaledSize.x / 2;
    const labelY = position.y + this.scaledSize.y / 2 + this.fontSize / 3;

    canvas
      .getShapeDrawer()
      .drawText(
        this.labelText.toUpperCase(),
        labelX,
        labelY,
        this.textColor,
        `${this.fontSize * this.scale}px`
      );
  }
}

export { LamenEmpireButton };
export type { LamenEmpireButtonVariant, LamenEmpireButtonOptions };
