type RestaurantTierId = 1 | 2 | 3 | 4;

type RestaurantTierConfig = {
  capacity: number;
  spawnIntervalInTicks: number;
  stayDurationInTicks: number;
  walkSpeed: number;
};

type UpgradeDefinition = {
  initialMultiplier: number;
  cost: number;
  multiplierExponent: number;
  costExponent: number;
  maxBuy: number;
};

const GAME_CONFIG = {
  initialTier: 1 as RestaurantTierId,
  minTier: 1 as RestaurantTierId,
  maxTier: 4 as RestaurantTierId,
  startingGold: 0,
  clientPayout: 5,
};

const RESTAURANT_TIERS: Record<RestaurantTierId, RestaurantTierConfig> = {
  1: {
    capacity: 4,
    spawnIntervalInTicks: 20,
    stayDurationInTicks: 150,
    walkSpeed: 4,
  },
  2: {
    capacity: 8,
    spawnIntervalInTicks: 18,
    stayDurationInTicks: 140,
    walkSpeed: 4.5,
  },
  3: {
    capacity: 12,
    spawnIntervalInTicks: 16,
    stayDurationInTicks: 130,
    walkSpeed: 5,
  },
  4: {
    capacity: 16,
    spawnIntervalInTicks: 14,
    stayDurationInTicks: 120,
    walkSpeed: 5.5,
  },
};

const UPGRADE_CONFIG = {
  orderTime: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 0.9,
    costExponent: 1.1,
    maxBuy: 200,
  },
  prepareTime: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 0.9,
    costExponent: 1.1,
    maxBuy: 200,
  },
  eatingTime: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 0.9,
    costExponent: 1.1,
    maxBuy: 200,
  },
  serviceTime: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 0.9,
    costExponent: 1.1,
    maxBuy: 200,
  },
  walkingSpeed: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 1.1,
    costExponent: 1.2,
    maxBuy: 200,
  },
  capacity: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 1.1,
    costExponent: 1.2,
    maxBuy: 200,
  },
  capacityBaseBonus: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 1.1,
    costExponent: 1.2,
    maxBuy: 200,
  },
  clientSpawnTime: {
    initialMultiplier: 1,
    cost: 10,
    multiplierExponent: 0.9,
    costExponent: 1.1,
    maxBuy: 200,
  },
} satisfies Record<string, UpgradeDefinition>;

type UpgradeKey = keyof typeof UPGRADE_CONFIG;

export { GAME_CONFIG, RESTAURANT_TIERS, UPGRADE_CONFIG };
export type {
  RestaurantTierConfig,
  RestaurantTierId,
  UpgradeDefinition,
  UpgradeKey,
};
