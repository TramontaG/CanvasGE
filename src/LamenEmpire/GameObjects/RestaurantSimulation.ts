import { GameObject } from "../../GameObject";
import { Vector } from "../../Vector";
import { Client } from "./Client";
import { CityView } from "./CityView";
import { Walker } from "./Walker";
import { createClientPaths } from "../Util/Paths";

type RestaurantSimulationConfig = {
  spawnIntervalInTicks: number;
  stayDurationMs: number;
  walkSpeed: number;
  walkerDebug?: boolean;
  walkerRenderDebug?: boolean;
};

const DEFAULT_CONFIG: RestaurantSimulationConfig = {
  spawnIntervalInTicks: 180,
  stayDurationMs: 5000,
  walkSpeed: 2.5,
  walkerDebug: false,
  walkerRenderDebug: false,
};

class RestaurantSimulation extends GameObject {
  private spawnTimer: number = 0;
  private config: RestaurantSimulationConfig;
  private paths: ReturnType<typeof createClientPaths> = createClientPaths();
  private clientCounter = 0;

  constructor(
    name: string,
    private cityView: CityView,
    config?: Partial<RestaurantSimulationConfig>
  ) {
    super(name, Vector.zero());
    this.addChild(this.cityView);
    this.config = { ...DEFAULT_CONFIG, ...config };
    setTimeout(() => this.spawnClient());
  }

  private getCurrentTier(): number {
    return this.cityView.getTier();
  }

  private getTierIndex(): number {
    const tierIndex = this.getCurrentTier() - 1;
    return Math.max(0, Math.min(this.paths.length - 1, tierIndex));
  }

  private getEntryPath(): Vector[] {
    return this.paths[this.getTierIndex()]!.entryPath;
  }

  private getExitPath(): Vector[] {
    return this.paths[this.getTierIndex()]!.exitPath;
  }

  private shouldSpawnClient() {
    const spawnInterval = this.config.spawnIntervalInTicks;
    return this.spawnTimer >= spawnInterval && !this.cityView.isFull();
  }

  private spawnClient() {
    const client = new Client(
      `client-${this.clientCounter++}`,
      3,
      this.config.walkSpeed + 4
    );

    const [startPoint] = this.getEntryPath();

    client.setPosition(startPoint!.clone());
    client.setWalker(this.createEnterWalker(client));

    this.addChild(client);

    this.spawnTimer = 0;
  }

  public clientCheckOut() {
    const client = new Client(
      `client-${this.clientCounter++}`,
      3,
      this.config.walkSpeed + 4
    );

    const [startPoint] = this.getExitPath();

    client.setPosition(startPoint!.clone());
    client.setWalker(this.createExitWalker(client));

    this.addChild(client);
  }

  createEnterWalker(client: Client) {
    return new Walker(
      client,
      this.getEntryPath(),
      this.config.walkSpeed,
      this.config.walkerRenderDebug ?? false,
      false
    )
      .start()
      .setOnComplete(() => {
        this.removeChild(client);
        this.cityView.incrementOccupants();
      });
  }

  createExitWalker(client: Client) {
    return new Walker(
      client,
      this.getExitPath(),
      this.config.walkSpeed,
      this.config.walkerDebug,
      false
    )
      .start()
      .setOnComplete(() => {
        this.removeChild(client);
      });
  }

  override tick(): void {
    super.tick();
    this.spawnTimer++;

    if (this.shouldSpawnClient()) {
      this.spawnClient();
    }
  }
}

export { RestaurantSimulation };
export type { RestaurantSimulationConfig };
