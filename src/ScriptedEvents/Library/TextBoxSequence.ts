import { scripted, type BaseTState, type ScriptEvent } from "..";
import {
  TextBox,
  type TextBoxOptions,
  type TextBoxPortrait,
} from "../../GameObject/Library/TextBox";
import { sequenceOf, waitUntil } from "../Combinators";

type TextBoxSequenceState = {
  dialog?: TextBox;
};

export type TextBoxSequenceEntry =
  | string
  | {
      text: string;
      portrait?: TextBoxPortrait;
      textBox?: TextBoxOptions;
    };

export const createTextBoxSequence = (
  entries: TextBoxSequenceEntry[],
  defaultTextBoxOptions: TextBoxOptions = {}
) => {
  const isSpaceDown = (ctx: {
    isKeyPressed: (key: string) => boolean;
  }): boolean => ctx.isKeyPressed(" ") || ctx.isKeyPressed("Spacebar");

  const setDialog = (
    entry: TextBoxSequenceEntry
  ): ScriptEvent<TextBoxSequenceState & BaseTState> =>
    scripted<TextBoxSequenceState>(async (ctx, state) => {
      state.dialog?.destroy();

      const resolved =
        typeof entry === "string" ? { text: entry } : entry;

      const portrait: TextBoxPortrait | undefined =
        resolved.portrait ??
        resolved.textBox?.portrait ??
        defaultTextBoxOptions.portrait;

      const dialog = new TextBox("Dialog", resolved.text, {
        preset: "dialog",
        ...defaultTextBoxOptions,
        ...(resolved.textBox ?? {}),
        portrait,
      });

      ctx.getCurrentScene()?.addGameObject(dialog);

      return { ...state, dialog };
    }, "setDialog");

  const cleanupDialog = (): ScriptEvent<TextBoxSequenceState & BaseTState> =>
    scripted<TextBoxSequenceState>(async (_ctx, state) => {
      state.dialog?.destroy();
      return { ...state, dialog: undefined };
    }, "cleanupDialog");

  const waitForDialogAdvance = () =>
    sequenceOf<TextBoxSequenceState>(
      [
        waitUntil(
          (_ctx, state) => {
            return !!state.dialog && !state.dialog.isTyping();
          },
          { label: "waitTypingDone" }
        ),
        // Force a release so the "skip typing" press doesn't instantly advance.
        waitUntil(
          (ctx, state) =>
            !isSpaceDown(ctx) || !!state.dialog?.hasAdvanceRequested(),
          { label: "waitSpaceRelease" }
        ),
        waitUntil(
          (ctx, state) =>
            isSpaceDown(ctx) || !!state.dialog?.hasAdvanceRequested(),
          { label: "waitSpacePressOrClick" }
        ),
      ],
      "waitForDialogAdvance"
    );

  return sequenceOf<TextBoxSequenceState>([
    ...entries.map((page) =>
      sequenceOf<TextBoxSequenceState>([
        setDialog(page),
        waitForDialogAdvance(),
      ])
    ),
    cleanupDialog(),
  ]);
};
