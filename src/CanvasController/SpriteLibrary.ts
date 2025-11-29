class SpriteLibrary {
  private sprites: Map<string, HTMLImageElement> = new Map();

  async loadSprite(name: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(name, img);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
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

  getSprite(name: string): HTMLImageElement | undefined {
    return this.sprites.get(name);
  }
}

export { SpriteLibrary };
