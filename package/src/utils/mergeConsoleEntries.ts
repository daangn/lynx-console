import type { LogEntry, NetworkEntry, PerformanceEntryData } from "../types";
import {
  formatNetworkConsoleArgs,
  formatPerformanceConsoleArgs,
} from "./consoleStyle";
import { extractFcpMetrics } from "./extractFcp";

// 표시 데이터는 모니터의 수집 기록에서 가져와요. DevTool 출력 옵션과 무관해요.
export const mergeConsoleEntries = (
  logs: LogEntry[],
  networks: NetworkEntry[],
  performances: PerformanceEntryData[],
): LogEntry[] => {
  // 콘솔에 출력한 모니터 요약은 아래에서 실제 기록으로 대체해요.
  const entries = logs.filter((log) => log.source === undefined);

  for (const network of networks) {
    entries.push({
      id: `monitor:network:${network.id}`,
      source: "network",
      level: network.status === "error" ? "error" : "info",
      message: "",
      // 요청 완료 후에도 목록 위치와 펼침 상태를 유지해요.
      timestamp: network.startTime,
      args: [...formatNetworkConsoleArgs(network), network],
    });
  }

  for (const performance of performances) {
    const metrics = extractFcpMetrics(performance);
    const fcp = metrics?.totalFcp ?? metrics?.lynxFcp ?? metrics?.fcp;
    entries.push({
      id: `monitor:performance:${performance.id}`,
      source: "performance",
      level: "info",
      message: "",
      timestamp: performance.timestamp,
      args: [
        ...formatPerformanceConsoleArgs(performance, fcp?.duration),
        performance,
      ],
    });
  }

  return entries.sort((a, b) => a.timestamp - b.timestamp);
};
