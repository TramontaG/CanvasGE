import type { Scene } from "..";

class SceneManager {
  private activeScenes: Scene[] = [];

  constructor(
    private scenes: Record<string, Scene>,
    private currentScene: Scene | null = null
  ) {
    if (currentScene) {
      this.pushSceneToActive(currentScene);
    }
  }

  getScene(name: string): Scene | null {
    return this.scenes[name] || null;
  }

  setSceneAsCurrent(name: string): void {
    const scene = this.getScene(name);
    if (scene) {
      this.activeScenes = [scene];
      this.currentScene = scene;
    }
  }

  getAllScenes(): Scene[] {
    return Object.values(this.scenes);
  }

  getActiveScenes(): Scene[] {
    return this.activeScenes;
  }

  getCurrentScene(): Scene | null {
    return this.currentScene;
  }

  pushSceneToActive(scene: Scene): void {
    scene.setup();
    this.activeScenes.push(scene);
  }

  popSceneFromActive(): Scene | undefined {
    return this.activeScenes.pop();
  }
}

export { SceneManager };
