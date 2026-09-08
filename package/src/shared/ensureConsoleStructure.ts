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

  return {
    lynxConsole: globalThis.__LYNX_CONSOLE__,
    state: globalThis.__LYNX_CONSOLE__.state,
  };
};
