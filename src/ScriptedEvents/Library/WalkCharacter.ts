import { scripted, type BaseTState } from "..";
import type { GameObject } from "../../GameObject";
import type { Walker } from "../../GameObject/Walker";

export const walkCharacter = <TState extends Record<string, any>>(
  character: GameObject,
  walker: Walker,
  label: string | null = null
) => {
  return scripted<TState & BaseTState>((ctx, state) => {
    character.setWalker(walker);
    if (!walker.getTargetedWaypoint()) {
      return Promise.resolve(state);
    }

    return new Promise((resolve) => {
      walker.setOnComplete(() => resolve(state));
      walker.start();
    });
  }, label ?? "walkCharacter");
};
