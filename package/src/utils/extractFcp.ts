import type { PerformanceEntryData } from "../types";

export interface FcpMetric {
  name: string;
  duration: number;
}

export interface FcpMetrics {
  totalFcp?: FcpMetric;
  lynxFcp?: FcpMetric;
  fcp?: FcpMetric;
}

interface FcpRawEntry {
  totalFcp?: FcpMetric;
  lynxFcp?: FcpMetric;
  fcp?: FcpMetric;
}

// Lynx 3.6까지는 FCP가 metric("fcp") 엔트리로만 전달되고,
// 3.7부터는 pipeline("loadBundle"/"reloadBundle") 엔트리에 fcp 필드가 함께 실려온다
// (MetricFcpEntry는 3.7부터 deprecated)
const isMetricFcpEntry = (entry: PerformanceEntryData): boolean => {
  return entry.entryType === "metric" && entry.name === "fcp";
};

const isBundlePipelineEntry = (entry: PerformanceEntryData): boolean => {
  return (
    entry.entryType === "pipeline" &&
    (entry.name === "loadBundle" || entry.name === "reloadBundle")
  );
};

export const extractFcpMetrics = (
  entry: PerformanceEntryData,
): FcpMetrics | null => {
  if (!entry.rawEntry) return null;
  if (!isMetricFcpEntry(entry) && !isBundlePipelineEntry(entry)) return null;

  const raw = entry.rawEntry as FcpRawEntry;
  const totalFcp = raw.totalFcp ?? undefined;
  const lynxFcp = raw.lynxFcp ?? undefined;
  const fcp = raw.fcp ?? undefined;

  if (
    totalFcp?.duration === undefined &&
    lynxFcp?.duration === undefined &&
    fcp?.duration === undefined
  ) {
    return null;
  }

  return { totalFcp, lynxFcp, fcp };
};
