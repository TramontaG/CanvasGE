---
title: Scripted cutscene (state + combinators)
sidebar_position: 8
---

This example shows how to build a bigger scripted sequence using:

- a typed state object that you update as the cutscene progresses
- combinators like `sequenceOf`, `parallel`, `conditional`, `waitForKeyPress`, `waitTicks`
- library helpers like `createTextBoxSequence` and `walkCharacter`

## 1) Define a cutscene state

```ts
import type { BaseTState } from "sliver-engine";

type CutsceneState = BaseTState & {
  elder: GameObject;
  hero: GameObject;
  coinsAwarded: boolean;
};
```

## 2) Build small events that update state

```ts
import { scripted } from "sliver-engine";

const checkCoins = scripted<CutsceneState>(async (_ctx, state) => {
  const { elder, hero };
  const elderCoins = elder.getCoins();
  const heroCoins = hero.getCoins();
  const newState = state.structuredClone();

  if (elderCoins > heroCoins) {
    newState.coinsAwarded = true;
  }

  return newState;
}, "awardCoinsOnce");
```

## 3) Compose a cutscene with combinators

```ts
import {
  sequenceOf,
  parallel,
  conditional,
  waitForKeyPress,
  waitTicks,
  createTextBoxSequence,
  walkCharacter,
} from "sliver-engine";
import { Walker, Vector } from "sliver-engine";

const makeIntroCutscene = (opts: { elder: GameObject; hero: GameObject }) => {
  const { elder, hero } = opts;

  const elderWalker = new Walker(
    elder,
    [elder.getScenePosition().toAdded(new Vector(60, 0))],
    1.5,
    false,
    false
  );

  return sequenceOf<CutsceneState>(
    [
      // Initial dialog + elder movement in parallel.
      parallel<CutsceneState>(
        [
          createTextBoxSequence(["...", "Welcome, traveler."]),
          walkCharacter<CutsceneState>(elder, elderWalker, "elderWalkIn"),
        ],
        "introParallel"
      ),

      checkCoins, //Check if elder should give coins and sets the state

      conditional<CutsceneState>(
        (state) => state.coinsAwarded,
        sequenceOf([
          createTextBoxSequence([
            "Hey, you look like you could use some coins."
            "Here, take these 10 coins and make good use of them!"
          ]),
          scripted<CutsceneState>(async (ctx, state) => {
            ctx.player.coins += 10;
            ctx.elder.coins -= 10;
          })
        ])
        createTextBoxSequence([
          "I hope you have a fantastic journey!",
          "You look like a rich guy, so you won't have much problems!"
        ])
      ),

      // Wait for Space, then award coins once.
      waitForKeyPress(" ", "waitSpace"),

      // Small pacing delay (in ticks), then final line.
      waitTicks(30),
      createTextBoxSequence(["Good luck."]),
    ],
    "introCutscene"
  );
};
```

## 4) Run the cutscene from a scene

```ts
const runIntro = (ctx: GameContext, elder: GameObject, hero: GameObject) => {
  const cutscene = makeIntroCutscene({ elder, hero });

  const initial: CutsceneState = {
    elder,
    hero,
    coinsAwarded: false,
  };

  void (async () => {
    const finalState = await cutscene.run(ctx, initial);
    if (finalState.error) console.error(finalState.error);
  })();
};
```
