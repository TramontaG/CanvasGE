import type { Vector } from "../Vector";

class SpriteLibrary {
  private sprites: Map<string, HTMLImageElement> = new Map();
  private spriteSheets: Map<
    string,
    {
      image: HTMLImageElement;
      frameWidth: number;
      frameHeight: number;
      columns: number;
    }
  > = new Map();

  async loadSprite(name: string, url: URL): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(name, img);
        resolve();
      };
      img.onerror = reject;
      img.src = url.toString();
    });
  }

  async loadSvgSprite(name: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(name, img);
        resolve();
      };
      img.onerror = reject;

      fetch(url)
        .then((response) => response.text())
        .then((svgText) => {
          const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
          const url = URL.createObjectURL(svgBlob);
          img.src = url;
        })
        .catch(reject);
    });
  }

  /**
   * Load a fixed size sprite sheet
   */
  async loadSpriteSheet(
    name: string,
    url: URL,
    frameWidth: number,
    frameHeight: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const columns = Math.floor(img.width / frameWidth);

        this.spriteSheets.set(name, {
          image: img,
          frameWidth,
          frameHeight,
          columns,
        });

        resolve();
      };
      img.onerror = reject;
      img.src = url.toString();
    });
  }

  getSprite(name: string): HTMLImageElement | undefined {
    return this.sprites.get(name);
  }

  /**
   * Render the sprite frame by its index in the sheet
   * Indexes grow from left to right, top to bottom
   */
  drawSpriteFrame(
    ctx: CanvasRenderingContext2D,
    sheetName: string,
    index: number,
    position: Vector,
    scale = 1,
    mirrorHorizontal = false,
    mirrorVertical = false
  ): void {
    const sheet = this.spriteSheets.get(sheetName);
    if (!sheet) return;

    const { image, frameWidth, frameHeight, columns } = sheet;

    const sx = (index % columns) * frameWidth;
    const sy = Math.floor(index / columns) * frameHeight;

    ctx.imageSmoothingEnabled = false; // nearest neighbor

    // Save the current context state
    ctx.save();

    // Apply transformations if needed
    if (mirrorHorizontal || mirrorVertical) {
      // Calculate the center of the sprite
      const centerX = position.x + (frameWidth * scale) / 2;
      const centerY = position.y + (frameHeight * scale) / 2;

      // Translate to the center of the sprite
      ctx.translate(centerX, centerY);

      // Apply mirroring
      if (mirrorHorizontal) {
        ctx.scale(-1, 1);
      }
      if (mirrorVertical) {
        ctx.scale(1, -1);
      }

      // Translate back to the original position
      ctx.translate(-centerX, -centerY);
    }

    // Draw the image with the applied transformations
    ctx.drawImage(
      image,
      sx,
      sy,
      frameWidth,
      frameHeight,
      position.x,
      position.y,
      frameWidth * scale,
      frameHeight * scale
    );

    // Restore the context state
    ctx.restore();
  }

  /**
   * Render a specific cell from the sprite sheet grid
   */
  drawSpriteGrid(
    ctx: CanvasRenderingContext2D,
    sheetName: string,
    col: number,
    row: number,
    position: Vector,
    scale = 1
  ): void {
    const sheet = this.spriteSheets.get(sheetName);
    if (!sheet) return;

    const { image, frameWidth, frameHeight } = sheet;

    const sx = col * frameWidth;
    const sy = row * frameHeight;

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      image,
      sx,
      sy,
      frameWidth,
      frameHeight,
      position.x,
      position.y,
      frameWidth * scale,
      frameHeight * scale
    );
  }
}

export { SpriteLibrary };
