import { GameObject } from "../../GameObject";
import {
  runEvent,
  type BaseTState,
  type ScriptEvent,
} from "../../ScriptedEvents";
import { Vector } from "../../Lib/Vector";

class ScriptedEventRunner<
  TState extends Record<string, unknown>
> extends GameObject {
  private started = false;
  private running: Promise<void> | null = null;

  constructor(
    name: string,
    private event: ScriptEvent<TState & BaseTState>,
    private initialState: TState = {} as TState
  ) {
    super(name, Vector.zero());
  }

  private async run(): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;

    const baseState: BaseTState = {
      done: false,
      aborted: undefined,
      error: undefined,
    };

    await runEvent(this.event, ctx, {
      ...baseState,
      ...this.initialState,
    } as TState & BaseTState);
  }

  override tick(): void {
    if (!this.started) {
      this.started = true;
      this.running = this.run();
    }
    super.tick();
  }
}

export { ScriptedEventRunner };
