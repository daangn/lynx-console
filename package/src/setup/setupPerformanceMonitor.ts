import { ensureConsoleStructure } from "../shared/ensureConsoleStructure";
import type {
  MonitorConsoleOptions,
  PerformanceEntryData,
  PerformanceEntryType,
} from "../types";
import {
  formatBrandConsoleArgs,
  formatPerformanceConsoleArgs,
  formatPerformancePlain,
} from "../utils/consoleStyle";
import { extractFcpMetrics } from "../utils/extractFcp";
import { emitMonitorLog } from "./setupLogMonitor";

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

// 모든 성능 엔트리를 "pipeline loadBundle FCP 812.34ms" 한 줄과 엔트리 객체로 console 에 찍어요
const emitPerformanceLog = (
  entry: PerformanceEntryData,
  plain: boolean,
): void => {
  const metrics = extractFcpMetrics(entry);
  const fcp = metrics?.totalFcp ?? metrics?.lynxFcp ?? metrics?.fcp;
  const summary = plain
    ? [formatPerformancePlain(entry, fcp?.duration)]
    : formatPerformanceConsoleArgs(entry, fcp?.duration);
  emitMonitorLog("info", [...summary, entry], "performance");
};

export const initPerformanceMonitor = (options?: MonitorConsoleOptions) => {
  "background only";

  const consoleMode = options?.console ?? true;
  const emitToConsole = consoleMode !== false;
  const plainConsole = consoleMode === "plain";

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
    if (emitToConsole) emitPerformanceLog(performanceEntry, plainConsole);
  });

  observer.observe([
    "pipeline", // LoadBundleEntry/ReloadBundleEntry — 엔진 3.7+에서는 FCP/init 타임스탬프도 여기에 실려옴
    "init", // InitLynxviewEntry — 엔진 3.6까지만 사용
    "metric", // MetricFcpEntry(3.6까지) / MetricFspEntry
  ]);

  console.log(...formatBrandConsoleArgs("Performance monitoring initialized"));
};
