import {
  abort,
  done,
  failed,
  isAborted,
  isErrored,
  runEvent,
  scripted,
  type BaseTState,
  type ScriptEvent,
} from ".";
import type { GameContext } from "../Context";

export const sequenceOf = <TState extends Record<string, any>>(
  events: ScriptEvent<BaseTState & TState>[],
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, _state) => {
    let state = _state;

    for (const event of events) {
      state = await runEvent(event, ctx, state);
    }

    return state;
  }, label);
};

export const parallel = <TState extends Record<string, any>>(
  events: ScriptEvent<TState & BaseTState>[],
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, state) => {
    const promises = events.map((event) => runEvent(event, ctx, state));

    const newState = await Promise.all(promises).then((res) => {
      return res.reduce((acc, curr) => {
        if (isAborted(curr)) return acc;
        return { ...acc, ...curr };
      }, state);
    });

    return newState;
  }, label);
};

export const first = <TState extends Record<string, any>>(
  events: ScriptEvent<TState & BaseTState>[],
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, state) => {
    const promises = events.map((event) => runEvent(event, ctx, state));
    const firstResolved = await Promise.race(promises);
    return firstResolved;
  }, label);
};

export const conditional = <TState extends Record<string, any>>(
  predicate: (state: TState & BaseTState) => boolean,
  thenEv: ScriptEvent<TState & BaseTState>,
  elseEv: ScriptEvent<TState & BaseTState>,
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, state) => {
    if (predicate(state)) {
      return runEvent(thenEv, ctx, state);
    } else {
      return runEvent(elseEv, ctx, state);
    }
  }, label);
};

export const all = <TState extends Record<string, any>>(
  events: ScriptEvent<TState & BaseTState>[],
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, _state) => {
    const promises = events.map((event) => () => runEvent(event, ctx, _state));

    let state = _state;

    return new Promise((resolve) => {
      promises.forEach((promise, index) => {
        promise().then((newState) => {
          state = { ...state, ...newState };

          if (isAborted(state)) {
            resolve(
              abort(state, `Aborted on ${label || "runAll"}\n${state.aborted}`)
            );
          }

          if (isErrored(state)) {
            resolve(
              failed(state, `Failed on ${label || "runAll"}\n${state.error}`)
            );
          }

          if (index === promises.length - 1) resolve(state);
        });
      });
    });
  }, label);
};

export const repeatWhile = <TState extends Record<string, any>>(
  predicate: (ctx: GameContext, state: TState & BaseTState) => boolean,
  event: ScriptEvent<TState & BaseTState>,
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, state) => {
    let newState = state;
    while (predicate(ctx, newState)) {
      if (isAborted(newState)) {
        return abort(
          newState,
          `Aborted on ${label || "repeatWhile"}\n${newState.aborted}`
        );
      }

      if (isErrored(newState)) {
        return failed(
          newState,
          `Failed oon ${label || "repeatWhile"}\n${newState.error}`
        );
      }

      newState = await runEvent(event, ctx, newState);
    }

    return newState;
  });
};

export const repeat = <TState extends Record<string, any>>(
  event: ScriptEvent<TState & BaseTState>,
  times: number,
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, _state) => {
    let state = _state;

    for (let i = 0; i < times; i++) {
      state = await runEvent(event, ctx, state);
    }

    return state;
  }, label);
};

export const withTimeout = <TState extends Record<string, any>>(
  event: ScriptEvent<TState & BaseTState>,
  timeout: number,
  label: string | null = null
) => {
  return scripted<TState>(async (ctx, state) => {
    setTimeout(() => {
      abort(state, `Timeout on ${label || "withTimeout"}`);
    }, timeout);

    return await runEvent(event, ctx, state);
  });
};

export const waitTicks = <TState extends Record<string, any>>(
  timeInTicks: number
) => {
  return scripted<TState>(async (ctx, state) => {
    const currTicks = ctx.getTickCount();
    const tickRate = ctx.getGame().getTickRate();

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    while (ctx.getTickCount() < currTicks + timeInTicks) {
      await sleep(1000 / (tickRate * 2));
    }

    return state;
  });
};

export const waitUntil = <TState extends Record<string, any>>(
  predicate: (ctx: GameContext, state: TState) => boolean,
  opts?: { pollGameTicks?: number; label?: string }
) => {
  const pollGameTicks = opts?.pollGameTicks ?? 1;
  const label = opts?.label ?? "waitUntil";

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const core = scripted<TState>(async (ctx, state) => {
    const ticksPerSecond = ctx.getTickRate();
    while (true) {
      if (predicate(ctx, state)) return state;

      await sleep(pollGameTicks * (1000 / ticksPerSecond));
    }
  }, label);

  return core;
};

export const waitForKeyPress = <TState extends Record<string, any>>(
  key: string,
  label: string | null = null
) => {
  return waitUntil<TState>(
    (ctx, state) => {
      return ctx.getPressedKeys().includes(key);
    },
    {
      pollGameTicks: 1,
      label: label ?? `waitForKeyPress(${key})`,
    }
  );
};
