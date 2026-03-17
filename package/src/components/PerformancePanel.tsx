import { useState } from "@lynx-js/react";
import { stringify } from "javascript-stringify";
import type { PerformanceEntryData } from "../types";
import { FadeList } from "./FadeList";
import "./PerformancePanel.css";

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
      <view className={"pp-container"}>
        <view className={"pp-header"}>
          <text className={"pp-count"}>0 entries</text>
          <view
            bindtap={() => {
              console.log("[PerformancePanel] performances", performances);
            }}
            style={{ padding: "10px", backgroundColor: "red" }}
          >
            <text>Log</text>
          </view>
          <view bindtap={clearPerformances} className={"pp-clearButton"}>
            <text className={"pp-clearButtonText"}>🗑</text>
          </view>
        </view>
        <view className={"pp-placeholder"}>
          <text className={"pp-placeholderText"}>
            No performance data yet...
          </text>
        </view>
      </view>
    );
  }

  return (
    <view className={"pp-container"}>
      <view className={"pp-header"}>
        <text className={"pp-count"}>{performances.length} entries</text>
        <view bindtap={clearPerformances} className={"pp-clearButton"}>
          <text className={"pp-clearButtonText"}>🗑</text>
        </view>
      </view>

      <FadeList className={"pp-list"}>
        {performances.map((perf) => {
          const isMetricFcp = isMetricFcpEntry(perf);
          const fcpMetrics = extractFcpMetrics(perf);
          const primaryFcp = getPrimaryFcpLabel(perf);
          const { totalFcp, lynxFcp, fcp } = fcpMetrics ?? {};

          return (
            <list-item key={perf.id} item-key={perf.id}>
              <view className={"pp-item"}>
                <view
                  className={"pp-itemHeader"}
                  bindtap={() =>
                    setSelectedId(selectedId === perf.id ? null : perf.id)
                  }
                >
                  <text className={`pp-entryType pp-entryType--${perf.entryType}`}>
                    {perf.entryType}
                  </text>
                  <text className={"pp-entryName"}>{perf.name}</text>
                  <text className={"pp-timestamp"}>
                    {new Date(perf.timestamp).toISOString()}
                  </text>
                </view>

                <view
                  bindtap={() =>
                    setSelectedId(selectedId === perf.id ? null : perf.id)
                  }
                >
                  {isMetricFcp && primaryFcp && (
                    <text className={"pp-fcpHighlight"}>{primaryFcp}</text>
                  )}
                </view>

                {selectedId === perf.id && (
                  <view className={"pp-detailsContainer"}>
                    {isMetricFcp && fcpMetrics && (
                      <view className={"pp-fcpSection"}>
                        {totalFcp !== undefined && (
                          <view className={"pp-fcpMetric"}>
                            <view className={"pp-fcpMetricHeader"}>
                              <text className={"pp-fcpMetricName"}>
                                전체 FCP
                              </text>
                              <text className={"pp-fcpMetricValue"}>
                                {formatDuration(totalFcp.duration)}
                              </text>
                            </view>
                            <text className={"pp-fcpMetricDescription"}>
                              PrepareTemplate Start부터 Paint End 까지 걸리는
                              시간
                            </text>
                          </view>
                        )}

                        {lynxFcp !== undefined && (
                          <view className={"pp-fcpMetric"}>
                            <view className={"pp-fcpMetricHeader"}>
                              <text className={"pp-fcpMetricName"}>LynxFCP</text>
                              <text className={"pp-fcpMetricValue"}>
                                {formatDuration(lynxFcp.duration)}
                              </text>
                            </view>
                            <text className={"pp-fcpMetricDescription"}>
                              Bundle Load 시작부터 Paint End 까지 걸리는 시간
                            </text>
                          </view>
                        )}

                        {fcp !== undefined && (
                          <view className={"pp-fcpMetric"}>
                            <view className={"pp-fcpMetricHeader"}>
                              <text className={"pp-fcpMetricName"}>
                                렌더링 FCP
                              </text>
                              <text className={"pp-fcpMetricValue"}>
                                {formatDuration(fcp.duration)}
                              </text>
                            </view>
                            <text className={"pp-fcpMetricDescription"}>
                              TemplateBundle 준비부터 Paint End 까지 걸리는 시간
                            </text>
                          </view>
                        )}
                      </view>
                    )}

                    {!!perf.rawEntry && (
                      <view className={"pp-rawEntrySection"}>
                        <text className={"pp-detailTitle"}>Raw Entry</text>
                        <text className={"pp-rawEntry"}>
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
