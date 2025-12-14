import { Scene } from "../../../Scenes";
import { Vector } from "../../../Vector";
import { Panel } from "../../GameObjects/Panel";
import { CityView } from "../../GameObjects/CityView";
import { LamenEmpireButton } from "../../GameObjects/LamenEmpireButton";
import { ScrollView } from "../../../GameObject/Library/ScrollView";
import { ShowOnHover } from "../../../GameObject/Library/ShowOnHover";
import { Text } from "../../../GameObject/Library/Text";
import { GoldDisplay } from "../../GameObjects/GoldDisplay";
import { ClientCountDisplay } from "../../GameObjects/ClientCountDisplay";
import { LamenEmpireGame } from "../../LamenEmpireGame";
import type { UpgradeKey } from "../../Util/Upgrades";
import palette from "../../colors.json";

type GameplaySceneBindings = {
  scene: Scene;
  cityView: CityView;
  goldDisplay: GoldDisplay;
  clientCountDisplay: ClientCountDisplay;
};

const createGameplayScene = (
  dimensions: { width: number; height: number },
  getGame: () => LamenEmpireGame
): GameplaySceneBindings => {
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

  const goldDisplay = new GoldDisplay(new Vector(dimensions.width / 2, 24));
  const clientCountDisplay = new ClientCountDisplay(
    new Vector(dimensions.width / 2, 48)
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
    upgrade?: UpgradeKey;
  }> = [
    {
      label: "Tier +",
      variant: "green",
      onClick: () => getGame().incrementTier(),
    },
    {
      label: "Tier -",
      variant: "purple",
      onClick: () => getGame().decrementTier(),
    },
  ];

  const upgradeButtons: Array<{
    label: string;
    upgrade: UpgradeKey;
    variant?: "normal" | "green" | "purple";
  }> = [
    { label: "Order Time", upgrade: "orderTime" },
    { label: "Prep Time", upgrade: "prepareTime" },
    { label: "Eating Time", upgrade: "eatingTime" },
    { label: "Service Time", upgrade: "serviceTime" },
    { label: "Walking Speed", upgrade: "walkingSpeed", variant: "green" },
    { label: "Capacity", upgrade: "capacity", variant: "green" },
    { label: "Base Capacity", upgrade: "capacityBaseBonus", variant: "green" },
    { label: "Spawn Time", upgrade: "clientSpawnTime", variant: "purple" },
  ];

  upgradeButtons.forEach(({ label, upgrade, variant }) => {
    sideButtons.push({
      label,
      variant: variant ?? "normal",
      onClick: () => {
        getGame().buyUpgrade(upgrade);
      },
      upgrade,
    });
  });

  sideButtons.forEach((config, index) => {
    const buttonPosition = new Vector(
      buttonX,
      buttonStartY + index * (buttonSize.y + buttonSpacing)
    );

    const btn = new LamenEmpireButton(
      `SideMenuButton-${config.label}`,
      buttonPosition,
      config.label,
      config.variant,
      config.onClick,
      { scale: buttonScale, textColor: "white", fontSize: 10 }
    );
    scrollView.addChild(btn);

    if (config.upgrade) {
      const costLabel = new Text(
        `UpgradeCost-${config.label}`,
        buttonPosition.toAdded(new Vector(buttonSize.x / 2, -8)),
        "",
        { color: "#f2d14b", size: "12px", align: "center" }
      );

      costLabel.setTickFunction(() => {
        const cost = getGame().getUpgradeCost(config.upgrade!);
        costLabel.setText(`Cost: ${cost} gold`);
      });

      const costOnHover = new ShowOnHover(
        costLabel,
        buttonSize,
        buttonPosition.clone()
      );
      scrollView.addChild(costOnHover);
    }
  });

  scene.addGameObject(cityView);
  scene.addGameObject(bottomMenu);
  scene.addGameObject(sideMenu);
  scene.addGameObject(scrollView);
  scene.addGameObject(goldDisplay);
  scene.addGameObject(clientCountDisplay);

  return { scene, cityView, goldDisplay, clientCountDisplay };
};

export { createGameplayScene };
export type { GameplaySceneBindings };
