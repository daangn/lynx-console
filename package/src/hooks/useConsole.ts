import { useEffect, useState } from "@lynx-js/react";
import type { LogEntry } from "../types";

export const useConsole = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (typeof globalThis.__LYNX_CONSOLE__?.state?.logs === "undefined") {
      console.warn("[LynxConsole] Log monitoring not initialized");
      return;
    }

    const state = globalThis.__LYNX_CONSOLE__.state;

    setLogs([...(state.logs ?? [])]);

    const updateLogs = (_entry: LogEntry) => {
      setLogs([...(state.logs ?? [])]);
    };

    const unsubscribe = state.logSubscribe?.(updateLogs);

    return unsubscribe;
  }, []);

  const clearLogs = () => {
    if (typeof globalThis.__LYNX_CONSOLE__?.state?.logs !== "undefined") {
      const state = globalThis.__LYNX_CONSOLE__.state;
      state.logs = [];
      setLogs([]);
    }
  };

  return { logs, clearLogs };
};
