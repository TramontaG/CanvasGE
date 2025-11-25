class ShapeDrawer {
  constructor(private context: CanvasRenderingContext2D) {}

  drawRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = "black"
  ): void {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, width, height);
  }

  drawCircle(
    x: number,
    y: number,
    radius: number,
    color: string = "black"
  ): void {
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x, y, radius / 2, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    font: string = "16px Arial",
    color: string = "black",
    align: CanvasTextAlign = "center"
  ): void {
    this.context.fillStyle = color;
    this.context.font = font;
    this.context.textAlign = align;
    this.context.fillText(text, x, y);
  }
}

class CanvasController {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private shapeDrawer: ShapeDrawer;

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d")!;
    this.shapeDrawer = new ShapeDrawer(this.context);
    document.body.appendChild(this.canvas);
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
}

export { CanvasController, ShapeDrawer };
