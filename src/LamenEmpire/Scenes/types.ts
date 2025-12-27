import type { Scene } from "../../Scenes";
import type { GameplaySceneBindings } from "./Gameplay";

type SceneDimensions = {
  width: number;
  height: number;
};

type LamenEmpireScenes = {
  menu: Scene;
  gameplay: GameplaySceneBindings;
  phisicsTest: Scene;
  pathfindingDebug: Scene;
};

export type { SceneDimensions, LamenEmpireScenes, GameplaySceneBindings };
