import type { LogEntry, NetworkEntry, PerformanceEntryData } from "../types";

// 네트워크 모니터가 넣은 로그면 마지막 인자의 NetworkEntry 를 돌려줘요
export const getNetworkLogEntry = (log: LogEntry): NetworkEntry | null => {
  if (log.source !== "network") return null;
  return (log.args[log.args.length - 1] as NetworkEntry) ?? null;
};

// 성능 모니터가 넣은 로그면 마지막 인자의 PerformanceEntryData 를 돌려줘요
export const getPerformanceLogEntry = (
  log: LogEntry,
): PerformanceEntryData | null => {
  if (log.source !== "performance") return null;
  return (log.args[log.args.length - 1] as PerformanceEntryData) ?? null;
};

// 커스텀 탭 filter 에서 네트워크·성능 로그만 고를 때 써요
export const isNetworkLog = (log: LogEntry): boolean =>
  log.source === "network";

export const isPerformanceLog = (log: LogEntry): boolean =>
  log.source === "performance";
