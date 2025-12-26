import { GameObject } from "..";
import type { CanvasController } from "../../CanvasController";
import type { GameEvent } from "../../Events";
import type { Scene } from "../../Scenes";
import { Vector } from "../../Vector";
import { SquareHitbox } from "../Hitboxes";

type TextBoxPlacement = "top" | "middle" | "bottom";

type TextBoxPreset = "dialog" | "narration";

type TextBoxPortrait = {
  spriteSheetName: string;
  index: number;
  side?: "left" | "right";
};

type TextBoxTypingOptions = {
  enabled?: boolean;
  charsPerTick?: number;
  startImmediately?: boolean;
  skipKeys?: string[];
};

type TextBoxOptions = {
  preset?: TextBoxPreset;
  placement?: TextBoxPlacement;
  width?: number;
  height?: number;
  marginX?: number;
  marginY?: number;
  padding?: number;
  portrait?: TextBoxPortrait;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  textColor?: string;
  textSize?: string;
  textAlign?: CanvasTextAlign;
  font?: string;
  lineHeight?: number;
  typing?: TextBoxTypingOptions;
};

const TEXTBOX_PRESETS: Record<TextBoxPreset, Required<Pick<
  TextBoxOptions,
  | "placement"
  | "height"
  | "marginX"
  | "marginY"
  | "padding"
  | "backgroundColor"
  | "backgroundOpacity"
  | "borderColor"
  | "borderWidth"
  | "textColor"
  | "textSize"
  | "textAlign"
>> & { typing: Required<TextBoxTypingOptions> }> = {
  dialog: {
    placement: "bottom",
    height: 170,
    marginX: 32,
    marginY: 24,
    padding: 18,
    backgroundColor: "#000000",
    backgroundOpacity: 0.8,
    borderColor: "#ffffff",
    borderWidth: 2,
    textColor: "#ffffff",
    textSize: "20px",
    textAlign: "left",
    typing: {
      enabled: true,
      charsPerTick: 1.25,
      startImmediately: true,
      skipKeys: [" ", "Spacebar"],
    },
  },
  narration: {
    placement: "top",
    height: 140,
    marginX: 32,
    marginY: 24,
    padding: 18,
    backgroundColor: "#000000",
    backgroundOpacity: 0.65,
    borderColor: "#ffffff",
    borderWidth: 2,
    textColor: "#ffffff",
    textSize: "18px",
    textAlign: "left",
    typing: {
      enabled: true,
      charsPerTick: 1.25,
      startImmediately: true,
      skipKeys: [" ", "Spacebar"],
    },
  },
};

const parsePx = (size: string): number => {
  const match = /(-?\d+(\.\d+)?)px/.exec(size);
  if (!match) return 16;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : 16;
};

class TextBox extends GameObject {
  private placement: TextBoxPlacement;
  private width?: number;
  private height: number;
  private marginX: number;
  private marginY: number;
  private padding: number;
  private portrait?: TextBoxPortrait;
  private backgroundColor: string;
  private backgroundOpacity: number;
  private borderColor?: string;
  private borderWidth: number;
  private textColor: string;
  private textSize: string;
  private textAlign: CanvasTextAlign;
  private font?: string;
  private lineHeight?: number;

  private fullText: string;
  private typingEnabled: boolean;
  private typingCharsPerTick: number;
  private skipKeys: string[];

  private visibleLength: number = 0;
  private charAccumulator: number = 0;
  private advanceRequested: boolean = false;
  private hitbox: SquareHitbox;

  constructor(name: string, text: string, options: TextBoxOptions = {}) {
    super(name, Vector.zero());

    const preset = TEXTBOX_PRESETS[options.preset ?? "dialog"];

    this.marginX = options.marginX ?? preset.marginX;
    this.marginY = options.marginY ?? preset.marginY;

    this.placement = options.placement ?? preset.placement;
    this.width = options.width;

    this.height = options.height ?? preset.height;
    this.padding = options.padding ?? preset.padding;
    this.portrait = options.portrait;
    this.backgroundColor = options.backgroundColor ?? preset.backgroundColor;
    this.backgroundOpacity =
      options.backgroundOpacity ?? preset.backgroundOpacity;
    this.borderColor = options.borderColor ?? preset.borderColor;
    this.borderWidth = options.borderWidth ?? preset.borderWidth;
    this.textColor = options.textColor ?? preset.textColor;
    this.textSize = options.textSize ?? preset.textSize;
    this.textAlign = options.textAlign ?? preset.textAlign;
    this.font = options.font;
    this.lineHeight = options.lineHeight;

    const typing = {
      ...preset.typing,
      ...(options.typing ?? {}),
    };

    this.fullText = text;
    this.typingEnabled = typing.enabled;
    this.typingCharsPerTick = Math.max(0, typing.charsPerTick);
    this.skipKeys = typing.skipKeys;

    if (!this.typingEnabled || typing.startImmediately === false) {
      this.visibleLength = this.fullText.length;
    }

    this.setRenderFunction(this.renderTextBox);
    this.setTickFunction(this.tickTextBox);

    this.hitbox = new SquareHitbox(
      Vector.zero(),
      new Vector(0, this.height),
      this,
      { solid: false }
    );
    this.addHitbox(this.hitbox);
  }

  setText(text: string, { restartTyping = this.typingEnabled } = {}): void {
    this.fullText = text;
    this.advanceRequested = false;
    if (restartTyping) {
      this.startTyping();
      return;
    }
    this.finishTyping();
  }

  getText(): string {
    return this.fullText;
  }

  setPlacement(placement: TextBoxPlacement): void {
    this.placement = placement;
  }

  setPortrait(portrait: TextBoxPortrait | undefined): void {
    this.portrait = portrait;
  }

  startTyping(): void {
    this.typingEnabled = true;
    this.visibleLength = 0;
    this.charAccumulator = 0;
    this.advanceRequested = false;
  }

  finishTyping(): void {
    this.visibleLength = this.fullText.length;
    this.charAccumulator = 0;
  }

  isTyping(): boolean {
    return this.visibleLength < this.fullText.length;
  }

  hasAdvanceRequested(): boolean {
    return this.advanceRequested;
  }

  private getDisplayedText(): string {
    return this.fullText.slice(0, this.visibleLength);
  }

  private tickTextBox = () => {
    const canvas = this.getContext()?.getCanvas();
    if (canvas) {
      this.syncLayout(canvas);
    }
    this.tickTyping();
  };

  private tickTyping = () => {
    if (!this.typingEnabled) return;
    if (!this.isTyping()) return;
    if (this.typingCharsPerTick <= 0) return;

    this.charAccumulator += this.typingCharsPerTick;
    const addChars = Math.floor(this.charAccumulator);
    if (addChars <= 0) return;

    this.charAccumulator -= addChars;
    this.visibleLength = Math.min(
      this.fullText.length,
      this.visibleLength + addChars
    );
  };

  private syncLayout(canvas: CanvasController): void {
    const { x, y, width, height } = this.getLayout(canvas);
    this.setPosition(new Vector(x, y));
    this.hitbox.size.x = width;
    this.hitbox.size.y = height;
  }

  private getLayout(canvas: CanvasController): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const canvasEl = canvas.getCanvas();
    const canvasWidth = canvasEl.width;
    const canvasHeight = canvasEl.height;

    const width = Math.max(
      0,
      this.width ?? Math.max(0, canvasWidth - 2 * this.marginX)
    );

    const height = Math.max(0, this.height);
    const x = Math.max(0, (canvasWidth - width) / 2);

    const y =
      this.placement === "top"
        ? this.marginY
        : this.placement === "middle"
        ? (canvasHeight - height) / 2
        : canvasHeight - height - this.marginY;

    return { x, y, width, height };
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    if (maxWidth <= 0) return [];

    const hardLines = text.split("\n");
    const out: string[] = [];

    for (const hardLine of hardLines) {
      const line = hardLine.trimEnd();
      if (line.trim().length === 0) {
        out.push("");
        continue;
      }

      const words = line.split(/\s+/g);
      let current = "";

      for (const word of words) {
        const candidate = current.length === 0 ? word : `${current} ${word}`;
        if (ctx.measureText(candidate).width <= maxWidth) {
          current = candidate;
          continue;
        }

        if (current.length > 0) {
          out.push(current);
          current = word;
          continue;
        }

        // Word is longer than maxWidth; hard-break it.
        let chunk = "";
        for (const char of word) {
          const next = `${chunk}${char}`;
          if (ctx.measureText(next).width <= maxWidth) {
            chunk = next;
            continue;
          }
          if (chunk.length > 0) {
            out.push(chunk);
            chunk = char;
          }
        }
        if (chunk.length > 0) out.push(chunk);
        current = "";
      }

      if (current.length > 0) out.push(current);
    }

    return out;
  }

  private renderTextBox = (
    _obj: GameObject,
    canvas: CanvasController
  ): void => {
    this.syncLayout(canvas);
    const pos = this.getPosition();
    const x = pos.x;
    const y = pos.y;
    const width = this.hitbox.size.x;
    const height = this.hitbox.size.y;
    const shapeDrawer = canvas.getShapeDrawer();
    const ctx = canvas.getContext();

    shapeDrawer.drawRectangle(
      x,
      y,
      width,
      height,
      this.backgroundColor,
      true,
      this.backgroundOpacity
    );

    const portraitGap = 12;
    let contentX = x + this.padding;
    let contentWidth = Math.max(0, width - 2 * this.padding);

    const portrait = this.portrait;
    if (portrait) {
      const sheetSize = canvas
        .getSpriteLibrary()
        .getSpriteSheetFrameSize(portrait.spriteSheetName);
      if (!sheetSize) {
        // If the sheet isn't loaded, skip reserving space.
        // (Better to show text than clip it.)
      } else {
        const frameWidth = sheetSize.frameWidth;
        const frameHeight = sheetSize.frameHeight;
        const target = Math.max(0, height - 2 * this.padding);
        const scale = frameHeight === 0 ? 1 : target / frameHeight;
        const drawW = frameWidth * scale;
        const drawH = frameHeight * scale;
        const drawY = y + this.padding + Math.max(0, target - drawH) / 2;
        const side = portrait.side ?? "left";
        const drawX =
          side === "left"
            ? x + this.padding
            : x + width - this.padding - drawW;

        canvas
          .getSpriteLibrary()
          .drawSpriteFrame(
            ctx,
            portrait.spriteSheetName,
            portrait.index,
            new Vector(drawX, drawY),
            scale
          );

        contentWidth = Math.max(0, contentWidth - drawW - portraitGap);
        contentX =
          side === "left" ? contentX + drawW + portraitGap : contentX;
      }
    }

    if (this.borderColor && this.borderWidth > 0) {
      ctx.save();
      ctx.globalAlpha *= 1;
      ctx.lineWidth = this.borderWidth;
      ctx.strokeStyle = this.borderColor;
      ctx.strokeRect(x, y, width, height);
      ctx.restore();
    }

    const fontToUse = this.font ?? canvas.getShapeDrawer().getDefaultFont();
    ctx.save();
    ctx.fillStyle = this.textColor;
    ctx.font = `${this.textSize} ${fontToUse}`;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = "top";

    const fontPx = parsePx(this.textSize);
    const lineHeight = this.lineHeight ?? Math.ceil(fontPx * 1.3);
    const maxLines =
      lineHeight <= 0
        ? 0
        : Math.max(1, Math.floor((height - 2 * this.padding) / lineHeight));

    const textX =
      this.textAlign === "left"
        ? contentX
        : this.textAlign === "right"
        ? contentX + contentWidth
        : contentX + contentWidth / 2;
    const textY = y + this.padding;
    const availableWidth = contentWidth;

    const lines = this.wrapText(ctx, this.getDisplayedText(), availableWidth);
    for (let i = 0; i < Math.min(lines.length, maxLines); i += 1) {
      const line = lines[i] ?? "";
      ctx.fillText(line, textX, textY + i * lineHeight);
    }

    ctx.restore();
  };

  override render(canvas: CanvasController, scene: Scene): void {
    super.render(canvas, scene);
  }

  override handleEvent(event: GameEvent): void {
    if (event.type === "keyPressed" && this.skipKeys.includes(event.key)) {
      if (this.isTyping()) {
        this.finishTyping();
      } else {
        this.advanceRequested = true;
      }
      event.stopPropagation = true;
      return;
    }

    if (event.type === "mouseButtonPressed") {
      const canvas = this.getContext()?.getCanvas();
      if (canvas) {
        this.syncLayout(canvas);
      }

      const inside = this.hitbox.intersectsWithPoint(
        new Vector(event.x, event.y)
      );
      if (!inside) return;

      if (this.isTyping()) {
        this.finishTyping();
      } else {
        this.advanceRequested = true;
      }
      event.stopPropagation = true;
      return;
    }
  }
}

export { TextBox };
export type {
  TextBoxOptions,
  TextBoxPlacement,
  TextBoxTypingOptions,
  TextBoxPortrait,
  TextBoxPreset,
};
