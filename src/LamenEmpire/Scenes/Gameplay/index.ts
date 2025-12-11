import { Scene } from "../../../Scenes";
import { Vector } from "../../../Vector";
import { Panel } from "../../GameObjects/Panel";
import { CityView } from "../../GameObjects/CityView";
import { LamenEmpireButton } from "../../GameObjects/LamenEmpireButton";
import { RestaurantSimulation } from "../../GameObjects/RestaurantSimulation";
import { ScrollView } from "../../../GameObject/Library/ScrollView";
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
  const scrollPadding = 10;
  const scrollViewSize = new Vector(
    sideWidth - scrollPadding * 2,
    sideMenuHeight - scrollPadding * 2
  );

  const scrollView = new ScrollView(
    "SideMenuScrollView",
    new Vector(sideMenuX + scrollPadding, scrollPadding),
    scrollViewSize,
    [],
    {
      backgroundColor: palette.DarkGreen,
      scrollbarColor: palette.Primary,
      scrollbarTrackColor: palette.PrimaryEvenDarker,
      scrollStep: buttonSize.y / 1.5,
    }
  );

  const buttonX = (scrollViewSize.x - buttonSize.x) / 2;
  const buttonSpacing = 12;
  const buttonStartY = 12;

  const sideButtons: Array<{
    label: string;
    variant: "normal" | "green" | "purple";
    onClick: () => void;
  }> = [
    { label: "Tier +", variant: "green", onClick: () => cityView.incrementTier() },
    { label: "Tier -", variant: "purple", onClick: () => cityView.decrementTier() },
  ];

  const fillerLabels = [
    "Add Worker",
    "Buy Table",
    "Upgrade Kitchen",
    "Advertise",
    "Hire Chef",
    "Theme Swap",
    "Open Late",
    "Happy Hour",
    "Menu Edit",
    "Toggle Debug",
  ];

  fillerLabels.forEach((label, index) => {
    const variants: Array<"normal" | "green" | "purple"> = [
      "normal",
      "green",
      "purple",
    ];
    sideButtons.push({
      label,
      variant: variants[index % variants.length]!,
      onClick: () => {
        console.log(`Clicked ${label}`);
      },
    });
  });

  sideButtons.forEach((config, index) => {
    const btn = new LamenEmpireButton(
      `SideMenuButton-${config.label}`,
      new Vector(buttonX, buttonStartY + index * (buttonSize.y + buttonSpacing)),
      config.label,
      config.variant,
      config.onClick,
      { scale: buttonScale, textColor: "white", fontSize: 10 }
    );
    scrollView.addChild(btn);
  });

  scene.addGameObject(restaurantSimulation);
  scene.addGameObject(bottomMenu);
  scene.addGameObject(sideMenu);
  scene.addGameObject(scrollView);

  return scene;
};

export { createGameplayScene };
