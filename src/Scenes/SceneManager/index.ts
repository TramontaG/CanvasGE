import type { Scene } from "..";
import type { GameContext } from "../../Context";

class SceneManager {
  private activeScenes: Scene[] = [];
  private context: GameContext | null = null;

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
      scene.setContext(this.context);
      scene.setup();
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
    scene.setContext(this.context);
    scene.setup();
    this.activeScenes.push(scene);
  }

  popSceneFromActive(): Scene | undefined {
    return this.activeScenes.pop();
  }

  bindContext(context: GameContext): void {
    this.context = context;
    this.getAllScenes().forEach((scene) => scene.setContext(context));
  }
}

export { SceneManager };
