import { runOnBackground } from "@lynx-js/react";
import type { LogEntry, LogLevel } from "../types";

const _setupMainThreadConsole = (): void => {
  "main thread";

  //IMPORTANT: do not use external functions in main thread
  if (!globalThis.__LYNX_CONSOLE__) globalThis.__LYNX_CONSOLE__ = {};
  const lynxConsole = globalThis.__LYNX_CONSOLE__;

  if (lynxConsole.mainThreadInitialized) {
    console.warn("[LynxConsole] Main thread console already initialized");
    return;
  }

  const LOG_METHODS: LogLevel[] = ["log", "warn", "error", "info"];
  const LOG_ID_PREFIX = "main-thread";

  const serializeArgs = (args: unknown[]): unknown[] => {
    return args.map((arg) => {
      try {
        JSON.stringify(arg);
        return arg;
      } catch {
        return String(arg);
      }
    });
  };

  const generateLogId = (): string => {
    return `${LOG_ID_PREFIX}-${Date.now()}-${Math.random()}`;
  };

  // Main Thread에서 Background Thread로 로그 전송하는 함수
  const sendLogToBackground = runOnBackground((entry: LogEntry): void => {
    const state = globalThis.__LYNX_CONSOLE__?.state;
    if (!state) return;

    state.logs?.push(entry);
    state.logListeners?.forEach((listener) => {
      listener(entry);
    });
  });

  const originalConsole = globalThis.console;

  const originalMethods = {
    log: originalConsole.log.bind(originalConsole),
    warn: originalConsole.warn.bind(originalConsole),
    error: originalConsole.error.bind(originalConsole),
    info: originalConsole.info.bind(originalConsole),
  };

  // Main Thread console 오버라이드
  LOG_METHODS.forEach((method) => {
    const original = originalMethods[method];
    originalConsole[method] = ((...args: unknown[]) => {
      // 원본 console 호출
      original(...args);

      const serializedArgs = serializeArgs(args);
      const timestamp = Date.now();
      const id = generateLogId();

      sendLogToBackground({
        id,
        level: method,
        message: "",
        timestamp,
        args: serializedArgs,
      });
    }).bind(originalConsole);
  });

  lynxConsole.mainThreadInitialized = true;

  originalConsole.log("[LynxConsole] ✅ Main thread console initialized");
};

export default _setupMainThreadConsole;
