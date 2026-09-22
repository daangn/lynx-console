import type { LogEntry, NetworkEntry, PerformanceEntryData } from "../types";
import { getLogSearchStrings } from "./matchesLogFilter";
import { getNetworkLogEntry, getPerformanceLogEntry } from "./networkLog";

// 네트워크 로그는 접힌 줄에 안 보이는 URL · 헤더 · 본문까지 검색 대상이에요.
// 응답이 나중에 채워지는 엔트리라 캐시하지 않아요
const networkStrings = (network: NetworkEntry): string[] => [
  network.url,
  network.method,
  network.statusCode === undefined ? "" : String(network.statusCode),
  network.statusText ?? "",
  ...Object.entries(network.requestHeaders ?? {}).flat(),
  network.requestBody ?? "",
  ...Object.entries(network.responseHeaders ?? {}).flat(),
  network.responseBody ?? "",
  network.error ?? "",
];

const performanceStrings = (perf: PerformanceEntryData): string[] => [
  perf.name,
  perf.entryType,
  ...(perf.metrics ?? []).map((metric) => metric.name),
];

// 통합 리스트의 검색이에요. 콘솔 텍스트에 더해 네트워크 · 성능 엔트리의 속살까지 훑어요
export const matchesSearchQuery = (log: LogEntry, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const network = getNetworkLogEntry(log);
  const perf = getPerformanceLogEntry(log);
  const haystack = [
    ...getLogSearchStrings(log),
    ...(network ? networkStrings(network) : []),
    ...(perf ? performanceStrings(perf) : []),
  ];

  return haystack.some((text) => text.toLowerCase().includes(needle));
};
