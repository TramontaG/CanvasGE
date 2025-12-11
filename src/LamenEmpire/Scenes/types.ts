import type { Scene } from "../../Scenes";

type SceneDimensions = {
  width: number;
  height: number;
};

type LamenEmpireScenes = {
  menu: Scene;
  gameplay: Scene;
};

export type { SceneDimensions, LamenEmpireScenes };
