import { useEffect, useState } from "@lynx-js/react";
import type { PerformanceEntryData } from "../types";
import { extractFcpMetrics, type FcpMetric } from "../utils/extractFcp";

const pickFcp = (entry: PerformanceEntryData): FcpMetric | undefined => {
  const metrics = extractFcpMetrics(entry);
  if (!metrics) return undefined;
  if (metrics.totalFcp?.duration !== undefined) return metrics.totalFcp;
  if (metrics.lynxFcp?.duration !== undefined) return metrics.lynxFcp;
  return undefined;
};

export const useLatestFcp = (): FcpMetric | undefined => {
  const [fcp, setFcp] = useState<FcpMetric | undefined>(() => {
    const performances = globalThis.__LYNX_CONSOLE__?.state?.performances ?? [];
    for (let i = performances.length - 1; i >= 0; i--) {
      const entry = performances[i];
      if (!entry) continue;
      const found = pickFcp(entry);
      if (found) return found;
    }
    return undefined;
  });

  useEffect(() => {
    const state = globalThis.__LYNX_CONSOLE__?.state;
    if (!state?.subscribePerformance) return;

    const unsubscribe = state.subscribePerformance((entry) => {
      const found = pickFcp(entry);
      if (found) setFcp(found);
    });

    return unsubscribe;
  }, []);

  return fcp;
};
