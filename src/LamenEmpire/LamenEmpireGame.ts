import type { Scene } from "../Scenes";
import type { GameOptions } from "../Game";
import { Game } from "../Game";
import { Vector } from "../Lib/Vector";
import { createClientPaths } from "./Util/Paths";
import { Client } from "./GameObjects/Client";
import { Walker } from "./GameObjects/Walker";
import { FloatingMoneyDisplay } from "./GameObjects/FloatingMoneyDisplay";
import { CityView } from "./GameObjects/CityView";
import { GoldDisplay } from "./GameObjects/GoldDisplay";
import { ClientCountDisplay } from "./GameObjects/ClientCountDisplay";
import { Upgrades, type UpgradeKey } from "./Util/Upgrades";
import { GAME_CONFIG, RESTAURANT_TIERS, type RestaurantTierId } from "./config";

type GameplayBindings = {
  scene: Scene;
  cityView: CityView;
  goldDisplay: GoldDisplay;
  clientCountDisplay: ClientCountDisplay;
};

class LamenEmpireGame extends Game {
  private upgrades = new Upgrades();
  private tier: RestaurantTierId = GAME_CONFIG.initialTier;
  private balance: number = GAME_CONFIG.startingGold;
  private totalGold: number = GAME_CONFIG.startingGold;
  private spawnTimer: number = 0;
  private clientCounter: number = 0;
  private gameplayBindings: GameplayBindings | null = null;
  private paths: ReturnType<typeof createClientPaths> = createClientPaths();
  private walkerDebug: boolean;
  private walkerRenderDebug: boolean;

  constructor(
    options: GameOptions & {
      walkerDebug?: boolean;
      walkerRenderDebug?: boolean;
    }
  ) {
    super(options);
    this.walkerDebug = options.walkerDebug ?? false;
    this.walkerRenderDebug = options.walkerRenderDebug ?? false;
  }

  registerGameplayBindings(bindings: GameplayBindings): void {
    this.gameplayBindings = bindings;

    bindings.cityView.setTier(this.tier);
    bindings.cityView.setCapacityProvider(() => this.getCapacity());
    bindings.cityView.setStayDurationProvider(() =>
      this.getClientStayDurationInTicks()
    );
    bindings.cityView.setOnClientCheckout(() => this.handleClientCheckout());

    this.updateGoldDisplay();
    this.updateClientCount();
  }

  protected override onTick(): void {
    this.spawnTimer++;

    if (this.shouldSpawnClient()) {
      this.spawnClient();
    }
  }

  getCurrentTier(): RestaurantTierId {
    return this.tier;
  }

  setTier(target: number): void {
    const clamped = Math.min(
      GAME_CONFIG.maxTier,
      Math.max(GAME_CONFIG.minTier, target)
    );
    this.tier = clamped as RestaurantTierId;
    this.gameplayBindings?.cityView.setTier(this.tier);
    this.updateClientCount();
  }

  incrementTier(): void {
    this.setTier(this.tier + 1);
  }

  decrementTier(): void {
    this.setTier(this.tier - 1);
  }

  getCapacity(): number {
    const base = RESTAURANT_TIERS[this.tier]?.capacity ?? 0;
    return Math.floor(
      this.applyUpgrades(base, ["capacity", "capacityBaseBonus"])
    );
  }

  getWalkingSpeed(): number {
    const base = RESTAURANT_TIERS[this.tier]?.walkSpeed ?? 0;
    return this.applyUpgrades(base, "walkingSpeed");
  }

  getClientSpawnIntervalInTicks(): number {
    const base = RESTAURANT_TIERS[this.tier]?.spawnIntervalInTicks ?? 0;
    return Math.ceil(this.applyUpgrades(base, "clientSpawnTime"));
  }

  getClientStayDurationInTicks(): number {
    const base = RESTAURANT_TIERS[this.tier]?.stayDurationInTicks ?? 0;
    return Math.ceil(this.applyUpgrades(base, "eatingTime"));
  }

  canAfford(amount: number): boolean {
    return this.balance >= amount;
  }

  buyUpgrade(upgrade: UpgradeKey): boolean {
    if (!this.upgrades.canBuy(upgrade)) {
      return false;
    }

    const cost = this.upgrades.getCost(upgrade);

    if (!this.canAfford(cost)) {
      return false;
    }

    this.spendGold(cost);
    this.upgrades.applyPurchase(upgrade);
    this.updateClientCount();
    return true;
  }

  getUpgradeCost(upgrade: UpgradeKey): number {
    return this.upgrades.getCost(upgrade);
  }

  private shouldSpawnClient(): boolean {
    if (!this.gameplayBindings) {
      return false;
    }

    const cityIsFull = this.gameplayBindings.cityView.isFull();
    return (
      this.spawnTimer >= this.getClientSpawnIntervalInTicks() && !cityIsFull
    );
  }

  private spawnClient() {
    if (!this.gameplayBindings) {
      return;
    }

    const { cityView, scene } = this.gameplayBindings;

    cityView.incrementOccupants();
    this.updateClientCount();

    const client = new Client(
      `client-${this.clientCounter++}`,
      3,
      this.getWalkingSpeed() + 4
    );

    const [startPoint] = this.getEntryPath();

    client.setPosition(startPoint!.clone());
    client.setWalker(this.createEnterWalker(client));

    scene.addGameObject(client);

    this.spawnTimer = 0;
  }

  private handleClientCheckout() {
    if (!this.gameplayBindings) {
      return;
    }

    this.updateClientCount();
    this.addGold(GAME_CONFIG.clientPayout);
    this.createFloatingMoneyDisplay(GAME_CONFIG.clientPayout);

    this.getContext()!.getSoundManager().playSound("coin", { volume: 0.25 });

    const { scene } = this.gameplayBindings;
    const client = new Client(
      `client-${this.clientCounter++}`,
      3,
      this.getWalkingSpeed() + 4
    );

    const [startPoint] = this.getExitPath();

    client.setPosition(startPoint!.clone());
    client.setWalker(this.createExitWalker(client));

    scene.addGameObject(client);
  }

  private createEnterWalker(client: Client) {
    return new Walker(
      client,
      this.getEntryPath(),
      this.getWalkingSpeed(),
      this.walkerRenderDebug ?? false,
      false
    )
      .start()
      .setOnComplete(() => {
        this.gameplayBindings?.scene.removeGameObject(client);
        this.updateClientCount();
      });
  }

  private createExitWalker(client: Client) {
    return new Walker(
      client,
      this.getExitPath(),
      this.getWalkingSpeed(),
      this.walkerDebug,
      false
    )
      .start()
      .setOnComplete(() => {
        this.gameplayBindings?.scene.removeGameObject(client);
      });
  }

  private createFloatingMoneyDisplay(amount: number) {
    if (!this.gameplayBindings) {
      return;
    }

    const position = this.gameplayBindings.cityView
      .getDoorPosition()
      .toSubtracted(new Vector(0, 300));
    const floatingDisplay = new FloatingMoneyDisplay(position, amount);

    this.gameplayBindings.scene.addGameObject(floatingDisplay);
  }

  private getTierIndex(): number {
    const tierIndex = this.tier - 1;
    return Math.max(0, Math.min(this.paths.length - 1, tierIndex));
  }

  private getEntryPath(): Vector[] {
    return this.paths[this.getTierIndex()]!.entryPath;
  }

  private getExitPath(): Vector[] {
    return this.paths[this.getTierIndex()]!.exitPath;
  }

  private addGold(amount: number): void {
    this.balance += amount;
    this.totalGold += amount;
    this.updateGoldDisplay();
  }

  private spendGold(amount: number): void {
    this.balance -= amount;
    this.updateGoldDisplay();
  }

  private updateGoldDisplay(): void {
    this.gameplayBindings?.goldDisplay.setTotals(this.balance, this.totalGold);
  }

  private updateClientCount(): void {
    if (!this.gameplayBindings) {
      return;
    }

    const current = this.gameplayBindings.cityView.getOccupants();
    const max = this.getCapacity();
    this.gameplayBindings.clientCountDisplay.setCounts(current, max);
  }

  private applyUpgrades(
    baseValue: number,
    upgrades: UpgradeKey | UpgradeKey[]
  ): number {
    const keys = Array.isArray(upgrades) ? upgrades : [upgrades];
    const multiplier = keys.reduce(
      (acc, upgrade) => acc * this.upgrades.getMultiplier(upgrade),
      1
    );
    return baseValue * multiplier;
  }
}

export { LamenEmpireGame };
