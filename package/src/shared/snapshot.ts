import type { SnapshotOptions } from "../types";
import { safeJsonStringify } from "./safeJson";

const DEFAULT_LIMIT = 100;

const tail = <T>(items: T[] | undefined, limit: number): T[] =>
  items ? items.slice(-limit) : [];

// Lynx DevTool 에서 Runtime.evaluate 로 `__LYNX_CONSOLE__.snapshot()` 을 부르면
// 지금까지 쌓인 엔트리를 JSON 문자열로 받아요
export const createSnapshot = (options?: SnapshotOptions): string => {
  const limit = Math.max(1, options?.limit ?? DEFAULT_LIMIT);
  const state = globalThis.__LYNX_CONSOLE__?.state;

  return safeJsonStringify({
    capturedAt: Date.now(),
    logs: tail(state?.logs, limit),
    networks: tail(state?.networks, limit),
    performances: tail(state?.performances, limit),
  });
};
