import { ensureConsoleStructure } from "../shared/ensureConsoleStructure";
import { isWebPlatform } from "../shared/isWebPlatform";
import type { LogEntry, LogLevel, LogSource } from "../types";
import { formatBrandConsoleArgs } from "../utils/consoleStyle";

type LogListener = (entry: LogEntry) => void;

const LOG_METHODS: LogLevel[] = ["log", "warn", "error", "info"];
const LOG_ID_PREFIX = "background-thread";

// web lynx-core가 미구현 API 호출 시 찍는 "NYI: ..." 노이즈 로그인지 확인해요
const isUnimplementedApiNoise = (args: unknown[]): boolean => {
  return (
    isWebPlatform &&
    typeof args[0] === "string" &&
    args[0].startsWith("NYI: ") &&
    args[0].includes("lynx-core")
  );
};

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

// 네트워크·성능 모니터가 쓰는 진입점이에요. DevTool 에는 원본 console 로 보내고,
// 로그 목록에는 출처를 붙여 넣어요. 로그 모니터가 없으면 console 로만 찍어요
export const emitMonitorLog = (
  level: LogLevel,
  args: unknown[],
  source: LogSource,
): void => {
  const original = globalThis.__LYNX_CONSOLE__?.originalConsole?.[level];
  if (!original) {
    console[level](...args);
    return;
  }
  original(...args);
  addLogEntry({ ...createLogEntry(level, args), source });
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
      if (isUnimplementedApiNoise(args)) return;
      lynxConsole.originalConsole?.[method](...args);
      const entry = createLogEntry(method, args);
      addLogEntry(entry);
    }).bind(globalThis.console);
  });

  lynxConsole.originalConsole?.log(
    ...formatBrandConsoleArgs("Log monitoring initialized"),
  );
};
