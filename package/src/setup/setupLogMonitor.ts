import { ensureConsoleStructure } from "../shared/ensureConsoleStructure";
import type { LogEntry, LogLevel } from "../types";

type LogListener = (entry: LogEntry) => void;

const LOG_METHODS: LogLevel[] = ["log", "warn", "error", "info"];
const LOG_ID_PREFIX = "background-thread";

const generateLogId = (): string => {
  return `${LOG_ID_PREFIX}-${Date.now()}-${Math.random()}`;
};

const createLogEntry = (method: LogLevel, args: unknown[]): LogEntry => {
  return {
    id: generateLogId(),
    level: method,
    message: "",
    timestamp: Date.now(),
    args,
  };
};

const addLogEntry = (entry: LogEntry): void => {
  const state = globalThis.__LYNX_CONSOLE__?.state;
  if (!state?.logs || !state?.logListeners) {
    console.error(
      "[LynxConsole] Cannot add log entry: Log monitor not initialized. Call initLogMonitor() first.",
    );
    return;
  }

  state.logs.push(entry);
  state.logListeners.forEach((listener) => {
    listener(entry);
  });
};

// Background Thread: Log monitoring 초기화
export const initLogMonitor = () => {
  "background only";

  const { lynxConsole, state } = ensureConsoleStructure();

  if (lynxConsole.originalConsole) {
    console.warn("[LynxConsole] Log monitor already initialized");
    return;
  }

  const originalConsole = globalThis.console;
  lynxConsole.originalConsole = {
    log: originalConsole.log.bind(originalConsole),
    warn: originalConsole.warn.bind(originalConsole),
    error: originalConsole.error.bind(originalConsole),
    info: originalConsole.info.bind(originalConsole),
  };

  state.logs = [];
  state.logListeners = new Set();
  state.logSubscribe = (listener: LogListener) => {
    state.logListeners?.add(listener);
    return () => {
      state.logListeners?.delete(listener);
    };
  };

  // Background Thread console 오버라이드
  LOG_METHODS.forEach((method) => {
    globalThis.console[method] = ((...args: unknown[]) => {
      lynxConsole.originalConsole?.[method](...args);
      const entry = createLogEntry(method, args);
      addLogEntry(entry);
    }).bind(globalThis.console);
  });

  lynxConsole.originalConsole?.log(
    "[LynxConsole] ✅ Log monitoring initialized",
  );
};
