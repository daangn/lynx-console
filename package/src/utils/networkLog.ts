import type { LogEntry, NetworkEntry } from "../types";

const NETWORK_ID_PREFIX = "network-";

// 네트워크 모니터가 console 에 찍은 로그면 마지막 인자의 NetworkEntry 를 돌려줘요
export const getNetworkLogEntry = (log: LogEntry): NetworkEntry | null => {
  const last = log.args[log.args.length - 1];
  if (!last || typeof last !== "object") return null;
  const entry = last as Partial<NetworkEntry>;
  if (
    typeof entry.id !== "string" ||
    !entry.id.startsWith(NETWORK_ID_PREFIX) ||
    typeof entry.url !== "string" ||
    typeof entry.method !== "string"
  ) {
    return null;
  }
  return entry as NetworkEntry;
};

// 커스텀 탭 filter 에서 네트워크 로그만 고를 때 써요
export const isNetworkLog = (log: LogEntry): boolean =>
  getNetworkLogEntry(log) !== null;
