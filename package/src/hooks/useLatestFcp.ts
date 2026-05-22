import { useEffect, useState } from "@lynx-js/react";
import type { PerformanceEntryData } from "../types";

interface FcpMetric {
  name: string;
  duration: number;
}

interface MetricFcpRawEntry {
  totalFcp?: FcpMetric;
  lynxFcp?: FcpMetric;
  fcp?: FcpMetric;
}

const pickFcp = (entry: PerformanceEntryData): FcpMetric | undefined => {
  if (entry.entryType !== "metric" || entry.name !== "fcp") return undefined;
  const raw = entry.rawEntry as MetricFcpRawEntry | undefined;
  if (raw?.totalFcp?.duration !== undefined) return raw.totalFcp;
  if (raw?.lynxFcp?.duration !== undefined) return raw.lynxFcp;
  return undefined;
};

export const useLatestFcp = (): FcpMetric | undefined => {
  const [fcp, setFcp] = useState<FcpMetric | undefined>(() => {
    const performances =
      globalThis.__LYNX_CONSOLE__?.state?.performances ?? [];
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
