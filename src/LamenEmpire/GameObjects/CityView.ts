import type { CanvasController } from "../../CanvasController";
import type { Scene } from "../../Scenes";
import { GameObject as BaseGameObject } from "../../GameObject";
import { renderSprite } from "../../GameObject/Decorators";
import { Vector } from "../../Vector";
import type { RestaurantSimulation } from "./RestaurantSimulation";

class CityView extends BaseGameObject {
  private size: Vector;
  private tier: number;
  private minTier = 1;
  private maxTier = 4;
  private occupants = 0;
  private dinnerTimeInTicks = 60 * 2.5; // ten seconds;

  private timers: number[] = [];

  constructor(
    name: string,
    position: Vector,
    size: Vector,
    initialTier: number = 1
  ) {
    super(name, position);
    this.size = size;
    this.tier = initialTier;
  }

  getTier(): number {
    return this.tier;
  }

  setTier(tier: number): void {
    const clamped = Math.min(this.maxTier, Math.max(this.minTier, tier));
    this.tier = clamped;
  }

  incrementTier(): void {
    this.setTier(this.tier + 1);
  }

  decrementTier(): void {
    this.setTier(this.tier - 1);
  }

  getSize(): Vector {
    return this.size.clone();
  }

  getOccupants() {
    return this.occupants;
  }

  incrementOccupants() {
    this.occupants++;
    this.timers.push(0);
  }

  get maximumOccupancy() {
    return 4 ^ this.tier;
  }

  isFull() {
    return this.occupants >= this.maximumOccupancy;
  }

  getDoorPosition(yRatio: number = 0.72): Vector {
    const origin = this.getPosition();
    return new Vector(
      origin.x + this.size.x / 2,
      origin.y + this.size.y * yRatio
    );
  }

  private getCitySize() {
    const spriteSize = 1024;
    return Math.min(this.size.x / spriteSize, this.size.y / spriteSize);
  }

  private getRestaurantSize(): number {
    const cityScale = this.getCitySize();

    return this.tier === 4 ? cityScale / 1.3 : cityScale / 1.5;
  }

  override tick() {
    super.tick();
    const restaurantSimulation = this.getMotherShip<RestaurantSimulation>()!;

    this.timers.forEach((timer, index) => {
      this.timers[index]!++;
      if (timer >= this.dinnerTimeInTicks) {
        restaurantSimulation.clientCheckOut();
        this.timers[index]! = -1; //marks timer to be deleted
        this.occupants--;
      }
    });

    this.timers = this.timers.filter((timer) => timer !== -1);
  }

  @renderSprite<CityView>(() => true, "cityBackground", 0, (obj) =>
    obj.getCitySize()
  )
  @renderSprite<CityView>(
    (obj) => obj.tier === 1,
    "restaurant1",
    0,
    (obj) => obj.getRestaurantSize(),
    null,
    () => new Vector(100, 85)
  )
  @renderSprite<CityView>(
    (obj) => obj.tier === 2,
    "restaurant2",
    0,
    (obj) => obj.getRestaurantSize(),
    null,
    () => new Vector(100, 35)
  )
  @renderSprite<CityView>(
    (obj) => obj.tier === 3,
    "restaurant3",
    0,
    (obj) => obj.getRestaurantSize(),
    null,
    () => new Vector(100, 15)
  )
  @renderSprite<CityView>(
    (obj) => obj.tier === 4,
    "restaurant4",
    0,
    (obj) => obj.getRestaurantSize(),
    null,
    () => new Vector(60, 0)
  )
  override render(canvas: CanvasController, scene: Scene): void {
    super.render(canvas, scene);
  }
}

export { CityView };
