import { useEffect, useState } from "@lynx-js/react";
import type { PerformanceEntryData } from "../types";

export const usePerformance = () => {
  const [performances, setPerformances] = useState<PerformanceEntryData[]>([]);

  useEffect(() => {
    if (
      typeof globalThis.__LYNX_CONSOLE__?.state?.performances === "undefined"
    ) {
      console.warn("[LynxConsole] Performance monitoring not initialized");
      return;
    }

    const state = globalThis.__LYNX_CONSOLE__.state;

    setPerformances([...(state.performances ?? [])]);

    const updatePerformances = (_entry: PerformanceEntryData) => {
      setPerformances([...(state.performances ?? [])]);
    };

    const unsubscribe = state.subscribePerformance?.(updatePerformances);

    return unsubscribe;
  }, []);

  const clearPerformances = () => {
    if (
      typeof globalThis.__LYNX_CONSOLE__?.state?.performances !== "undefined"
    ) {
      const state = globalThis.__LYNX_CONSOLE__.state;
      state.performances = [];
      setPerformances([]);
    }
  };

  return { performances, clearPerformances };
};
