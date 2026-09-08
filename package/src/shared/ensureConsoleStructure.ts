import { createSnapshot } from "./snapshot";

type LynxConsole = NonNullable<typeof globalThis.__LYNX_CONSOLE__>;
type ConsoleState = NonNullable<LynxConsole["state"]>;

export const ensureConsoleStructure = (): {
  lynxConsole: LynxConsole;
  state: ConsoleState;
} => {
  if (!globalThis.__LYNX_CONSOLE__) {
    globalThis.__LYNX_CONSOLE__ = {};
  }

  if (!globalThis.__LYNX_CONSOLE__.state) {
    globalThis.__LYNX_CONSOLE__.state = {};
  }

  if (!globalThis.__LYNX_CONSOLE__.snapshot) {
    globalThis.__LYNX_CONSOLE__.snapshot = createSnapshot;
  }

  return {
    lynxConsole: globalThis.__LYNX_CONSOLE__,
    state: globalThis.__LYNX_CONSOLE__.state,
  };
};
