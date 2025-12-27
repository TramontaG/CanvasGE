import {
  scripted,
  done,
  type BaseTState,
  type ScriptEvent,
} from "../../ScriptedEvents";
import { parallel, sequenceOf } from "../../ScriptedEvents/Combinators";
import { slideReplace } from "../../Scenes/SceneManager/Transitions";
import {
  createTextBoxSequence,
  type TextBoxSequenceEntry,
} from "../../ScriptedEvents/Library/TextBoxSequence";
import { walkCharacter } from "../../ScriptedEvents/Library/WalkCharacter";
import { Vector } from "../../Lib/Vector";
import type { GameContext } from "../../Context";
import { Client } from "../GameObjects/Client";
import { Walker } from "../GameObjects/Walker";

type IntroState = {
  music?: { stop: () => void };
  hero?: Client;
};

const playIntroMusic = (): ScriptEvent<IntroState & BaseTState> =>
  scripted<IntroState>(async (ctx, state) => {
    const soundManager = ctx.getSoundManager();

    const music = soundManager.playSound("ramen_delight", {
      loop: true,
      volume: 0.5,
    });

    return { ...state, music };
  }, "playIntroMusic");

const transitionToGameplay = scripted<IntroState>(async (ctx, state) => {
  state.music?.stop();
  await ctx.transitionToScene("gameplay", slideReplace("right"), "replace");
  return done(state);
}, "transitionToGameplay");

const createNoodleDreamIntroEvent = (): ScriptEvent<
  IntroState & BaseTState
> => {
  const stage = (ctx: GameContext) => {
    const canvas = ctx.getCanvas().getCanvas();
    const width = canvas.width;
    const height = canvas.height;

    const margin = 40;
    return {
      width,
      height,
      leftX: Math.floor(margin),
      centerX: Math.floor(width / 2),
      rightX: Math.floor(width - margin),
      groundY: Math.floor(height * 0.72),
    };
  };

  const createHero = (): ScriptEvent<IntroState & BaseTState> =>
    scripted<IntroState>(async (ctx, state) => {
      if (state.hero) {
        return state;
      }

      const scene = ctx.getCurrentScene();
      if (!scene) {
        return state;
      }

      const hero = new Client("IntroHero", 3, 3);
      hero.setPhisics({
        immovable: false,
        affectedByGravity: false,
        restitution: 0,
        friction: 0,
      });

      const { leftX, groundY } = stage(ctx);
      hero.setPosition(new Vector(leftX, groundY));

      scene.addGameObject(hero);

      return { ...state, hero };
    }, "createHero");

  const removeHero = (): ScriptEvent<IntroState & BaseTState> =>
    scripted<IntroState>(async (_ctx, state) => {
      state.hero?.destroy();
      return { ...state, hero: undefined };
    }, "removeHero");

  const walkHeroTo = (
    destination: (ctx: GameContext) => Vector,
    label: string
  ): ScriptEvent<IntroState & BaseTState> =>
    scripted<IntroState>(async (ctx, state) => {
      const hero = state.hero;
      if (!hero) {
        return state;
      }

      const start = hero.getScenePosition().clone();
      const end = destination(ctx);

      const walker = new Walker(hero, [start, end], 2.4, false, false);
      return walkCharacter<IntroState>(hero, walker, label).run(ctx, state);
    }, label);

  const randomHeroFaceIndex = (): number => Math.floor(Math.random() * 8);
  const heroFaceIndex = randomHeroFaceIndex();

  const hero = (text: string, side: "left" | "right" = "left") => {
    const entry: TextBoxSequenceEntry = {
      text,
      portrait: {
        spriteSheetName: "heroFaces",
        index: heroFaceIndex,
        side,
      },
    };
    return entry;
  };

  const pagesIntro: TextBoxSequenceEntry[] = [
    "LAMEN EMPIRE\n\nA small dream, simmering.",
    hero(
      "I used to stare at spreadsheets like they were prison bars.\nAnd every time my stomach growled, it wasn't for lunch.\nIt was for a dream."
    ),
    "In the city of Lamen, a tired office worker kept the same secret dream: noodles.\nNot just eating them—selling them.\nPerfect bowls, honest prices, and a line out the door.",
  ];

  const pagesPlanning: TextBoxSequenceEntry[] = [
    hero(
      "Every lunch break I drew floor plans on napkins.\nA counter here. A steamer there.\nA tiny sign that said: “OPEN, even when the day is heavy.”"
    ),
    "I started small: one pot, one ladle, one recipe borrowed from my grandmother.\nThe first broth tasted like hope and burnt garlic.",
    hero(
      "At night I studied numbers like other people studied poems.\nCost of flour. Cost of rent. Cost of failing.\nThen, quietly: cost of never trying."
    ),
  ];

  const pagesOpeningNight: TextBoxSequenceEntry[] = [
    hero(
      "When I finally quit, they called me brave.\nI didn’t feel brave.\nI felt hungry—like the kind of hunger that builds a life.",
      "right"
    ),
    "The first restaurant was barely a rectangle of light.\nTwo tables. Eight stools. A cracked window.\nBut the broth was warm, and the noodles had bounce.",
    hero(
      "Opening night.\nMy hands shook when I tied the apron.\nI told myself: just one bowl at a time."
    ),
    "The doors are unlocked.\nThe pot is simmering.\nAnd the city is about to taste my dream.",
  ];

  const events: Array<ScriptEvent<IntroState & BaseTState>> = [
    playIntroMusic(),
    createHero(),
  ];

  events.push(
    parallel<IntroState>(
      [
        walkHeroTo((ctx) => {
          const { centerX, groundY } = stage(ctx);
          return new Vector(centerX - 120, groundY);
        }, "walkHeroToCenter"),
        createTextBoxSequence(pagesIntro),
      ],
      "introWalkAndTalk1"
    )
  );

  events.push(
    parallel<IntroState>(
      [
        walkHeroTo((ctx) => {
          const { centerX, groundY } = stage(ctx);
          return new Vector(centerX + 120, groundY);
        }, "walkHeroAcrossCounter"),
        createTextBoxSequence(pagesPlanning),
      ],
      "introWalkAndTalk2"
    )
  );

  events.push(
    parallel<IntroState>(
      [
        walkHeroTo((ctx) => {
          const { rightX, groundY } = stage(ctx);
          return new Vector(rightX - 80, groundY);
        }, "walkHeroToDoor"),
        createTextBoxSequence(pagesOpeningNight),
      ],
      "introWalkAndTalk3"
    )
  );
  events.push(removeHero());
  events.push(transitionToGameplay);

  return sequenceOf(events, "NoodleDreamIntro");
};

export { createNoodleDreamIntroEvent };
export type { IntroState };
