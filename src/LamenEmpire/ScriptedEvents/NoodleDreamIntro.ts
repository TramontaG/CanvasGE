import {
  scripted,
  done,
  type BaseTState,
  type ScriptEvent,
} from "../../ScriptedEvents";
import { sequenceOf } from "../../ScriptedEvents/Combinators";
import { slideReplace } from "../../Scenes/SceneManager/Transitions";
import {
  createTextBoxSequence,
  type TextBoxSequenceEntry,
} from "../../ScriptedEvents/Library/TextBoxSequence";

type IntroState = {
  music?: { stop: () => void };
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
  const randomHeroFaceIndex = (): number => Math.floor(Math.random() * 8);

  const hero = (text: string, side: "left" | "right" = "left") => {
    const entry: TextBoxSequenceEntry = {
      text,
      portrait: {
        spriteSheetName: "heroFaces",
        index: randomHeroFaceIndex(),
        side,
      },
    };
    return entry;
  };

  const pages: TextBoxSequenceEntry[] = [
    hero(
      "I used to stare at spreadsheets like they were prison bars.\nAnd every time my stomach growled, it wasn't for lunch.\nIt was for a dream."
    ),
    "In the city of Lamen, a tired office worker kept the same secret dream: noodles.\nNot just eating them—selling them. Perfect bowls, honest prices, and a line out the door.",
    hero(
      "Every lunch break I drew floor plans on napkins.\nA counter here. A steamer there.\nA tiny sign that said: “OPEN, even when the day is heavy.”"
    ),
    "He started small: one pot, one ladle, one recipe borrowed from his grandmother and improved with stubborn practice.\nThe first broth tasted like hope and burnt garlic.",
    hero(
      "At night I studied numbers like other people studied poems.\nCost of flour. Cost of rent. Cost of failing.\nThen, quietly: cost of never trying."
    ),
    hero(
      "When I finally quit, they called me brave.\nI didn’t feel brave.\nI felt hungry—like the kind of hunger that builds a life.",
      "right"
    ),
    "The first restaurant was barely a rectangle of light.\nTwo tables. Eight stools. A cracked window.\nBut the broth was warm, and the noodles had bounce.",
    hero(
      "Opening night.\nMy hands shook when I tied the apron.\nI told myself: just one bowl at a time."
    ),
    "The first customer didn’t smile.\nThey ate in silence… then asked for another bowl.\nBy sunset, the sign outside was smeared with fingerprints from curious hands.",
    hero(
      "I named it “Lamen Empire” as a joke—an empire made of steam.\nBut jokes can become blueprints, if you keep working."
    ),
    "Tonight is the first day of the business.\nThe doors are unlocked.\nThe pot is simmering.\nAnd the city is about to taste my dream.",
  ];

  const events: Array<ScriptEvent<IntroState & BaseTState>> = [
    playIntroMusic(),
  ];

  events.push(createTextBoxSequence(pages));
  events.push(transitionToGameplay);

  return sequenceOf(events, "NoodleDreamIntro");
};

export { createNoodleDreamIntroEvent };
export type { IntroState };
