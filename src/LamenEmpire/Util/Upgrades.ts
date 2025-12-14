import type { UpgradeDefinition, UpgradeKey } from "../config";
import { UPGRADE_CONFIG } from "../config";

type UpgradeState = {
  multiplier: number;
  cost: number;
  buyCount: number;
  definition: UpgradeDefinition;
};

class Upgrades {
  private upgrades: Record<UpgradeKey, UpgradeState>;

  constructor(definitions = UPGRADE_CONFIG) {
    this.upgrades = Object.fromEntries(
      Object.entries(definitions).map(([key, definition]) => [
        key,
        {
          multiplier: definition.initialMultiplier,
          cost: definition.cost,
          buyCount: 0,
          definition,
        },
      ])
    ) as Record<UpgradeKey, UpgradeState>;
  }

  public getCost(upgrade: UpgradeKey): number {
    return this.upgrades[upgrade].cost;
  }

  public getMultiplier(upgrade: UpgradeKey): number {
    return this.upgrades[upgrade].multiplier;
  }

  public getBuyCount(upgrade: UpgradeKey): number {
    return this.upgrades[upgrade].buyCount;
  }

  public canBuy(upgrade: UpgradeKey): boolean {
    const { buyCount, definition } = this.upgrades[upgrade];
    return buyCount < definition.maxBuy;
  }

  public applyPurchase(upgrade: UpgradeKey): number {
    const state = this.upgrades[upgrade];

    if (!this.canBuy(upgrade)) {
      throw new Error(`Upgrade "${upgrade}" is already at max level.`);
    }

    const {
      multiplierExponent,
      costExponent,
    } = state.definition;
    const nextState: UpgradeState = {
      ...state,
      multiplier: state.multiplier * multiplierExponent,
      cost: Math.floor(state.cost * costExponent),
      buyCount: state.buyCount + 1,
    };

    this.upgrades = { ...this.upgrades, [upgrade]: nextState };
    return state.cost;
  }
}

export { Upgrades };
export type { UpgradeKey };
