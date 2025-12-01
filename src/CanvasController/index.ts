import type { Vector } from "../Vector";
import { SpriteLibrary } from "./SpriteLibrary";

class ShapeDrawer {
  private defaultFont: string = "Arial";

  constructor(
    private context: CanvasRenderingContext2D,
    private spriteLibrary: SpriteLibrary
  ) {}

  drawRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = "black",
    filled: boolean = true
  ): void {
    this.context.fillStyle = color;
    if (filled) {
      this.context.fillRect(x, y, width, height);
    } else {
      this.context.strokeStyle = color;
      this.context.strokeRect(x, y, width, height);
    }
  }

  setDefaultFont(font: string): void {
    this.defaultFont = font;
  }

  drawCircle(
    x: number,
    y: number,
    radius: number,
    color: string = "black",
    filled: boolean = true,
    centerDot: boolean = true,
    centerDotColor: string = "red",
    centerDotRadius: number = 2
  ): void {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2);
    if (filled) {
      this.context.fillStyle = color;
      this.context.fill();
    } else {
      this.context.strokeStyle = color;
      this.context.stroke();
    }

    if (centerDot) {
      this.context.beginPath();
      this.context.arc(x, y, centerDotRadius, 0, Math.PI * 2);
      this.context.fillStyle = centerDotColor;
      this.context.fill();
    }

    this.context.closePath();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color: string = "black",
    size: string = "16px",
    align: CanvasTextAlign = "center",
    font: string = this.defaultFont
  ): void {
    this.context.fillStyle = color;
    this.context.font = `${size} ${font}`;
    this.context.textAlign = align;
    this.context.fillText(text, x, y);
  }

  drawBackground(color: string = "white"): void {
    this.context.fillStyle = color;
    this.context.fillRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
  }

  drawSprite(
    spriteName: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const sprite = this.spriteLibrary.getSprite(spriteName);
    if (sprite) {
      this.context.drawImage(sprite, x, y, width, height);
    }
  }

  loadFont(fontName: string, url: string): void {
    const newFont = new FontFace(fontName, `url(${url})`);
    newFont.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
    });
  }
}

class CanvasController {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private spriteLibrary: SpriteLibrary = new SpriteLibrary();
  private shapeDrawer: ShapeDrawer;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d")!;
    this.shapeDrawer = new ShapeDrawer(this.context, this.spriteLibrary);
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.appendChild(this.canvas);
    } else {
      document.body.appendChild(this.canvas);
    }
  }

  clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  getShapeDrawer(): ShapeDrawer {
    return this.shapeDrawer;
  }

  getSpriteLibrary(): SpriteLibrary {
    return this.spriteLibrary;
  }

  applyTranslation(translationVector: Vector): void {
    this.context.translate(translationVector.x, translationVector.y);
  }

  reset(): void {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
  }

  applyRotation(angle: number): void {
    this.context.rotate(angle);
  }
}

export { CanvasController, ShapeDrawer };
