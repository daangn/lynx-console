import type { ReactNode } from "@lynx-js/react";

// LynxConsole shared types

// 원하는 콘텐츠를 직접 그리는 탭
export interface CustomContentTab {
  key: string;
  label: string;
  renderContent: () => ReactNode;
}

// 문자열: 문자열 인자 중 하나라도 포함하면 매칭
// RegExp: 문자열 인자 중 하나라도 test 를 통과하면 매칭
// 함수: 엔트리 단위로 직접 판정
export type LogFilter = string | RegExp | ((entry: LogEntry) => boolean);

// 전체 콘솔 로그 중 filter 에 맞는 것만 모아 보여주는 탭
export interface CustomLogTab {
  key: string;
  label: string;
  filter: LogFilter;
  renderEntry?: (entry: LogEntry) => ReactNode;
}

export type CustomTab = CustomContentTab | CustomLogTab;

export interface MonitorConsoleOptions {
  // 수집한 엔트리를 console 에도 요약 한 줄과 함께 찍어요 (Lynx DevTool 에서 보려고요).
  // true: %c 로 꾸민 한 줄 (기본값) / "plain": 스타일 없는 텍스트 한 줄 / false: 안 찍어요
  console?: boolean | "plain";
}

export interface SnapshotOptions {
  // 컬렉션별로 최근 몇 개까지 담을지. 기본값 100
  limit?: number;
}

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

        // 현재까지 수집한 로그·네트워크·성능 엔트리를 JSON 문자열로 돌려줘요.
        // Lynx DevTool 의 Runtime.evaluate 로 밖에서 읽는 용도예요
        snapshot?: (options?: SnapshotOptions) => string;
      }
    | undefined;
}
