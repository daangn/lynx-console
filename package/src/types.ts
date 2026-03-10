// LynxConsole shared types

// 추후 Lynx에서 지원하는 Console API를 추가적으로 지원 예정
// https://lynxjs.org/api/lynx-api/global.html
export type LogLevel = "log" | "warn" | "error" | "info";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
  args: unknown[];
}

// Network monitoring types
export type NetworkStatus = "pending" | "success" | "error";

export interface NetworkEntry {
  id: string;
  url: string;
  method: string;
  status: NetworkStatus;
  statusCode?: number | undefined;
  statusText?: string | undefined;
  startTime: number;
  endTime?: number | undefined;
  duration?: number | undefined;
  requestHeaders?: Record<string, string> | undefined;
  requestBody?: string | undefined;
  responseHeaders?: Record<string, string> | undefined;
  responseBody?: string | undefined;
  error?: string | undefined;
}

// Performance monitoring types
export type PerformanceEntryType = "init" | "metric" | "pipeline" | "resource";

export interface PerformanceMetric {
  name: string;
  duration: number;
  startTimestampName: string;
  startTimestamp: number;
  endTimestampName: string;
  endTimestamp: number;
}

export interface PerformanceEntryData {
  id: string;
  entryType: PerformanceEntryType;
  name: string;
  timestamp: number;
  metrics?: PerformanceMetric[];
  rawEntry?: unknown;
}

// __LYNX_CONSOLE__ 내부 객체가 undefined면 상태 초기화가 되지 않은 것
declare global {
  var __INIT_DATA__: {
    stage?: string;
    [key: string]: unknown;
  };

  var __LYNX_CONSOLE__:
    | {
        // Original console methods backup (initialized by initLogMonitor)
        originalConsole?: {
          log: (...args: unknown[]) => void;
          warn: (...args: unknown[]) => void;
          error: (...args: unknown[]) => void;
          info: (...args: unknown[]) => void;
        };

        // Monitor states
        state?: {
          logs?: LogEntry[];
          logListeners?: Set<(entry: LogEntry) => void>;
          logSubscribe?: (listener: (entry: LogEntry) => void) => () => void;

          networks?: NetworkEntry[];
          networksMap?: Map<string, NetworkEntry>;
          networkListeners?: Set<(entry: NetworkEntry) => void>;
          subscribeNetwork?: (
            listener: (entry: NetworkEntry) => void,
          ) => () => void;

          performances?: PerformanceEntryData[];
          performanceListeners?: Set<(entry: PerformanceEntryData) => void>;
          subscribePerformance?: (
            listener: (entry: PerformanceEntryData) => void,
          ) => () => void;
        };

        mainThreadInitialized?: boolean;
      }
    | undefined;
}
