import { Scene } from "../../../Scenes";
import { Vector } from "../../../Vector";
import { Panel } from "../../GameObjects/Panel";
import { CityView } from "../../GameObjects/CityView";
import { LamenEmpireButton } from "../../GameObjects/LamenEmpireButton";
import { RestaurantSimulation } from "../../GameObjects/RestaurantSimulation";
import palette from "../../colors.json";

const createGameplayScene = (dimensions: { width: number; height: number }) => {
  const scene = new Scene("Gameplay", palette.PrimaryEvenDarker);

  const sideWidth = 200;
  const availableWidth = dimensions.width - sideWidth;

  // Let the city fill the full canvas height; bottom menu will overlay transparently.
  const bottomHeight = Math.max(0, dimensions.height - availableWidth);

  const cityView = new CityView(
    "CityView",
    new Vector(0, 0),
    new Vector(availableWidth, dimensions.height)
  );

  const restaurantSimulation = new RestaurantSimulation(
    "RestaurantSimulation",
    cityView,
    {
      walkerDebug: true,
      walkerRenderDebug: true,
      spawnIntervalInTicks: 60,
      stayDurationMs: 5000,
      walkSpeed: 4,
    }
  );

  const bottomMenuY = dimensions.height - bottomHeight;
  const bottomMenu = new Panel(
    "BottomMenu",
    new Vector(0, bottomMenuY),
    new Vector(dimensions.width, bottomHeight),
    "transparent"
  );

  const sideMenuHeight = dimensions.height;
  const sideMenuX = dimensions.width - sideWidth;

  const sideMenu = new Panel(
    "SideMenu",
    new Vector(sideMenuX, 0),
    new Vector(sideWidth, sideMenuHeight),
    palette.DarkGreen
  );

  const buttonScale = 2;
  const buttonSize = LamenEmpireButton.FRAME_SIZE.toMultiplied(buttonScale);
  const buttonX = sideMenuX + (sideWidth - buttonSize.x) / 2;

  const incrementButton = new LamenEmpireButton(
    "IncreaseTierButton",
    new Vector(buttonX, 24),
    "Tier +",
    "green",
    () => cityView.incrementTier(),
    { scale: buttonScale, textColor: "white", fontSize: 10 }
  );

  const decrementButton = new LamenEmpireButton(
    "DecreaseTierButton",
    new Vector(buttonX, 24 + buttonSize.y + 12),
    "Tier -",
    "purple",
    () => cityView.decrementTier(),
    { scale: buttonScale, textColor: "white", fontSize: 10 }
  );

  scene.addGameObject(restaurantSimulation);
  scene.addGameObject(bottomMenu);
  scene.addGameObject(sideMenu);
  scene.addGameObject(incrementButton);
  scene.addGameObject(decrementButton);

  return scene;
};

export { createGameplayScene };
