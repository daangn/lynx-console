import { useState } from "@lynx-js/react";
import { stringify } from "javascript-stringify";
import type { PerformanceEntryData } from "../types";
import { FadeList } from "./FadeList";
import * as css from "./PerformancePanel.css";

interface PerformancePanelProps {
  performances: PerformanceEntryData[];
  clearPerformances: () => void;
}

interface FcpMetric {
  name: string;
  duration: number;
}

interface MetricFcpEntry {
  totalFcp?: FcpMetric;
  lynxFcp?: FcpMetric;
  fcp?: FcpMetric;
}

const isMetricFcpEntry = (entry: PerformanceEntryData): boolean => {
  return entry.entryType === "metric" && entry.name === "fcp";
};

const extractFcpMetrics = (entry: PerformanceEntryData) => {
  if (!isMetricFcpEntry(entry) || !entry.rawEntry) {
    return null;
  }

  const metricEntry = entry.rawEntry as MetricFcpEntry;

  return {
    totalFcp: metricEntry.totalFcp ?? undefined,
    lynxFcp: metricEntry.lynxFcp ?? undefined,
    fcp: metricEntry.fcp ?? undefined,
  };
};

const formatDuration = (ms?: number): string => {
  if (ms === undefined) return "-";
  return `${ms.toFixed(2)}ms`;
};

const getPrimaryFcpLabel = (entry: PerformanceEntryData): string => {
  const fcpMetrics = extractFcpMetrics(entry);
  if (!fcpMetrics) return "";

  const { totalFcp, lynxFcp, fcp } = fcpMetrics;

  if (totalFcp?.duration !== undefined) {
    return `totalFcp: ${formatDuration(totalFcp.duration)}`;
  }
  if (lynxFcp?.duration !== undefined) {
    return `lynxFcp: ${formatDuration(lynxFcp.duration)}`;
  }
  if (fcp?.duration !== undefined) {
    return `fcp: ${formatDuration(fcp.duration)}`;
  }
  return "";
};

export const PerformancePanel = ({
  performances,
  clearPerformances,
}: PerformancePanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (performances.length === 0) {
    return (
      <view className={css.container}>
        <view className={css.header}>
          <text className={css.count}>0 entries</text>
          <view
            bindtap={() => {
              console.log("[PerformancePanel] performances", performances);
            }}
            style={{ padding: "10px", backgroundColor: "red" }}
          >
            <text>Log</text>
          </view>
          <view bindtap={clearPerformances} className={css.clearButton}>
            <text className={css.clearButtonText}>🗑</text>
          </view>
        </view>
        <view className={css.placeholder}>
          <text className={css.placeholderText}>
            No performance data yet...
          </text>
        </view>
      </view>
    );
  }

  return (
    <view className={css.container}>
      <view className={css.header}>
        <text className={css.count}>{performances.length} entries</text>
        <view bindtap={clearPerformances} className={css.clearButton}>
          <text className={css.clearButtonText}>🗑</text>
        </view>
      </view>

      <FadeList className={css.list}>
        {performances.map((perf) => {
          const isMetricFcp = isMetricFcpEntry(perf);
          const fcpMetrics = extractFcpMetrics(perf);
          const primaryFcp = getPrimaryFcpLabel(perf);
          const { totalFcp, lynxFcp, fcp } = fcpMetrics ?? {};

          return (
            <list-item key={perf.id} item-key={perf.id}>
              <view className={css.item}>
                <view
                  className={css.itemHeader}
                  bindtap={() =>
                    setSelectedId(selectedId === perf.id ? null : perf.id)
                  }
                >
                  <text className={css.entryType({ type: perf.entryType })}>
                    {perf.entryType}
                  </text>
                  <text className={css.entryName}>{perf.name}</text>
                  <text className={css.timestamp}>
                    {new Date(perf.timestamp).toISOString()}
                  </text>
                </view>

                <view
                  bindtap={() =>
                    setSelectedId(selectedId === perf.id ? null : perf.id)
                  }
                >
                  {isMetricFcp && primaryFcp && (
                    <text className={css.fcpHighlight}>{primaryFcp}</text>
                  )}
                </view>

                {selectedId === perf.id && (
                  <view className={css.detailsContainer}>
                    {isMetricFcp && fcpMetrics && (
                      <view className={css.fcpSection}>
                        {totalFcp !== undefined && (
                          <view className={css.fcpMetric}>
                            <view className={css.fcpMetricHeader}>
                              <text className={css.fcpMetricName}>
                                전체 FCP
                              </text>
                              <text className={css.fcpMetricValue}>
                                {formatDuration(totalFcp.duration)}
                              </text>
                            </view>
                            <text className={css.fcpMetricDescription}>
                              PrepareTemplate Start부터 Paint End 까지 걸리는
                              시간
                            </text>
                          </view>
                        )}

                        {lynxFcp !== undefined && (
                          <view className={css.fcpMetric}>
                            <view className={css.fcpMetricHeader}>
                              <text className={css.fcpMetricName}>LynxFCP</text>
                              <text className={css.fcpMetricValue}>
                                {formatDuration(lynxFcp.duration)}
                              </text>
                            </view>
                            <text className={css.fcpMetricDescription}>
                              Bundle Load 시작부터 Paint End 까지 걸리는 시간
                            </text>
                          </view>
                        )}

                        {fcp !== undefined && (
                          <view className={css.fcpMetric}>
                            <view className={css.fcpMetricHeader}>
                              <text className={css.fcpMetricName}>
                                렌더링 FCP
                              </text>
                              <text className={css.fcpMetricValue}>
                                {formatDuration(fcp.duration)}
                              </text>
                            </view>
                            <text className={css.fcpMetricDescription}>
                              TemplateBundle 준비부터 Paint End 까지 걸리는 시간
                            </text>
                          </view>
                        )}
                      </view>
                    )}

                    {!!perf.rawEntry && (
                      <view className={css.rawEntrySection}>
                        <text className={css.detailTitle}>Raw Entry</text>
                        <text className={css.rawEntry}>
                          {String(stringify(perf.rawEntry, null, 2, { references: true }))}
                        </text>
                      </view>
                    )}
                  </view>
                )}
              </view>
            </list-item>
          );
        })}
      </FadeList>
    </view>
  );
};
