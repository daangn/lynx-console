import { ensureConsoleStructure } from "../shared/ensureConsoleStructure";
import type { PerformanceEntryData, PerformanceEntryType } from "../types";

type PerformanceListener = (entry: PerformanceEntryData) => void;

const generatePerformanceId = (): string => {
  return `performance-${Date.now()}-${Math.random()}`;
};

const addPerformanceEntry = (entry: PerformanceEntryData): void => {
  const state = globalThis.__LYNX_CONSOLE__?.state;
  if (!state?.performances || !state?.performanceListeners) {
    console.error(
      "[LynxConsole] Cannot add performance entry: Performance monitor not initialized. Call initPerformanceMonitor() first.",
    );
    return;
  }

  state.performances.push(entry);
  state.performanceListeners.forEach((listener) => {
    listener(entry);
  });
};

export const initPerformanceMonitor = () => {
  "background only";

  if (!lynx.performance) {
    console.warn(
      "[LynxConsole] lynx.performance not available, skipping performance monitor",
    );
    return;
  }

  const { state } = ensureConsoleStructure();

  if (state.performances !== undefined) {
    console.warn("[LynxConsole] Performance monitor already initialized");
    return;
  }

  state.performances = [];
  state.performanceListeners = new Set();
  state.subscribePerformance = (listener: PerformanceListener) => {
    state.performanceListeners?.add(listener);
    return () => {
      state.performanceListeners?.delete(listener);
    };
  };

  const observer = lynx.performance.createObserver((entry) => {
    const performanceEntry: PerformanceEntryData = {
      id: generatePerformanceId(),
      entryType: entry.entryType as PerformanceEntryType,
      name: entry.name,
      timestamp: Date.now(),
      rawEntry: entry,
    };

    addPerformanceEntry(performanceEntry);
  });

  observer.observe([
    "pipeline", // LoadBundleEntry
    "init", // InitLynxviewEntry
    "metric", // MetricEntry
  ]);

  console.log("[LynxConsole] ✅ Performance monitoring initialized");
};
