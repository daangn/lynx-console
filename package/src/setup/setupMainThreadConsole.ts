// both thread;
import "./_setupMainThreadConsole";

import { runOnMainThread } from "@lynx-js/react";
import { ensureConsoleStructure } from "../shared/ensureConsoleStructure";
import _setupMainThreadConsole from "./_setupMainThreadConsole";

// Main Thread: Console 초기화

export const initMainThreadConsole = async (): Promise<void> => {
  "background only";

  const { lynxConsole, state } = ensureConsoleStructure();

  if (lynxConsole.mainThreadInitialized) {
    console.error("[LynxConsole] Main thread console already initialized");
    return;
  }

  if (!state.logs) {
    console.error("[LynxConsole] Background thread console not initialized");
    return;
  }

  try {
    const setupOnMainThread = runOnMainThread(_setupMainThreadConsole);
    await setupOnMainThread();
  } catch (error) {
    console.error(
      "[LynxConsole] Failed to initialize main thread console:",
      error,
    );
  }
};
