import { useState } from "@lynx-js/react";
import { stringify } from "javascript-stringify";
import { useThemeColors } from "../styles/ThemeContext";
import { type ThemeColors, fontWeight } from "../styles/theme";
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

function getEntryTypeColors(colors: ThemeColors, entryType: string) {
  switch (entryType) {
    case "init":
      return { color: colors.palette.blue600, backgroundColor: colors.palette.blue100 };
    case "metric":
      return { color: colors.palette.green600, backgroundColor: colors.palette.green100 };
    case "pipeline":
      return { color: colors.palette.purple600, backgroundColor: colors.palette.purple100 };
    case "resource":
      return { color: colors.palette.yellow600, backgroundColor: colors.palette.yellow100 };
    default:
      return { color: colors.fg.neutral, backgroundColor: colors.bg.neutralWeak };
  }
}

export const PerformancePanel = ({
  performances,
  clearPerformances,
}: PerformancePanelProps) => {
  const colors = useThemeColors();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (performances.length === 0) {
    return (
      <view className={"pp-container"}>
        <view
          className={"pp-header"}
          style={{ borderBottomColor: colors.stroke.neutralSubtle }}
        >
          <text
            className={"pp-count"}
            style={{ fontWeight: fontWeight.regular, color: colors.fg.neutralSubtle }}
          >
            0 entries
          </text>
          <view
            bindtap={clearPerformances}
            className={"pp-clearButton"}
            style={{ backgroundColor: colors.bg.neutralWeak }}
          >
            <text
              className={"pp-clearButtonText"}
              style={{ fontWeight: fontWeight.medium, color: colors.fg.neutralMuted }}
            >
              🗑
            </text>
          </view>
        </view>
        <view className={"pp-placeholder"}>
          <text
            className={"pp-placeholderText"}
            style={{ fontWeight: fontWeight.regular, color: colors.fg.disabled }}
          >
            No performance data yet...
          </text>
        </view>
      </view>
    );
  }

  return (
    <view className={"pp-container"}>
      <view
        className={"pp-header"}
        style={{ borderBottomColor: colors.stroke.neutralSubtle }}
      >
        <text
          className={"pp-count"}
          style={{ fontWeight: fontWeight.regular, color: colors.fg.neutralSubtle }}
        >
          {performances.length} entries
        </text>
        <view
          bindtap={clearPerformances}
          className={"pp-clearButton"}
          style={{ backgroundColor: colors.bg.neutralWeak }}
        >
          <text
            className={"pp-clearButtonText"}
            style={{ fontWeight: fontWeight.medium, color: colors.fg.neutralMuted }}
          >
            🗑
          </text>
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
              <view
                className={"pp-item"}
                style={{ borderBottomColor: colors.stroke.neutralWeak }}
              >
                <view
                  className={"pp-itemHeader"}
                  bindtap={() =>
                    setSelectedId(selectedId === perf.id ? null : perf.id)
                  }
                >
                  <text
                    className={"pp-entryType"}
                    style={{
                      fontWeight: fontWeight.bold,
                      ...getEntryTypeColors(colors, perf.entryType),
                    }}
                  >
                    {perf.entryType}
                  </text>
                  <text
                    className={"pp-entryName"}
                    style={{ fontWeight: fontWeight.medium, color: colors.fg.neutral }}
                  >
                    {perf.name}
                  </text>
                  <text
                    className={"pp-timestamp"}
                    style={{ fontWeight: fontWeight.regular, color: colors.fg.neutralSubtle }}
                  >
                    {new Date(perf.timestamp).toISOString()}
                  </text>
                </view>

                <view
                  bindtap={() =>
                    setSelectedId(selectedId === perf.id ? null : perf.id)
                  }
                >
                  {isMetricFcp && primaryFcp && (
                    <text
                      className={"pp-fcpHighlight"}
                      style={{
                        fontWeight: fontWeight.bold,
                        color: colors.palette.blue600,
                        backgroundColor: colors.palette.blue100,
                      }}
                    >
                      {primaryFcp}
                    </text>
                  )}
                </view>

                {selectedId === perf.id && (
                  <view className={"pp-detailsContainer"}>
                    {isMetricFcp && fcpMetrics && (
                      <view className={"pp-fcpSection"}>
                        {totalFcp !== undefined && (
                          <view
                            className={"pp-fcpMetric"}
                            style={{ backgroundColor: colors.bg.layerDefault }}
                          >
                            <view className={"pp-fcpMetricHeader"}>
                              <text
                                className={"pp-fcpMetricName"}
                                style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
                              >
                                전체 FCP
                              </text>
                              <text
                                className={"pp-fcpMetricValue"}
                                style={{ fontWeight: fontWeight.bold, color: colors.palette.blue600 }}
                              >
                                {formatDuration(totalFcp.duration)}
                              </text>
                            </view>
                            <text
                              className={"pp-fcpMetricDescription"}
                              style={{ fontWeight: fontWeight.regular, color: colors.fg.neutralSubtle }}
                            >
                              PrepareTemplate Start부터 Paint End 까지 걸리는
                              시간
                            </text>
                          </view>
                        )}

                        {lynxFcp !== undefined && (
                          <view
                            className={"pp-fcpMetric"}
                            style={{ backgroundColor: colors.bg.layerDefault }}
                          >
                            <view className={"pp-fcpMetricHeader"}>
                              <text
                                className={"pp-fcpMetricName"}
                                style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
                              >
                                LynxFCP
                              </text>
                              <text
                                className={"pp-fcpMetricValue"}
                                style={{ fontWeight: fontWeight.bold, color: colors.palette.blue600 }}
                              >
                                {formatDuration(lynxFcp.duration)}
                              </text>
                            </view>
                            <text
                              className={"pp-fcpMetricDescription"}
                              style={{ fontWeight: fontWeight.regular, color: colors.fg.neutralSubtle }}
                            >
                              Bundle Load 시작부터 Paint End 까지 걸리는 시간
                            </text>
                          </view>
                        )}

                        {fcp !== undefined && (
                          <view
                            className={"pp-fcpMetric"}
                            style={{ backgroundColor: colors.bg.layerDefault }}
                          >
                            <view className={"pp-fcpMetricHeader"}>
                              <text
                                className={"pp-fcpMetricName"}
                                style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
                              >
                                렌더링 FCP
                              </text>
                              <text
                                className={"pp-fcpMetricValue"}
                                style={{ fontWeight: fontWeight.bold, color: colors.palette.blue600 }}
                              >
                                {formatDuration(fcp.duration)}
                              </text>
                            </view>
                            <text
                              className={"pp-fcpMetricDescription"}
                              style={{ fontWeight: fontWeight.regular, color: colors.fg.neutralSubtle }}
                            >
                              TemplateBundle 준비부터 Paint End 까지 걸리는 시간
                            </text>
                          </view>
                        )}
                      </view>
                    )}

                    {!!perf.rawEntry && (
                      <view
                        className={"pp-rawEntrySection"}
                        style={{ backgroundColor: colors.bg.neutralWeak }}
                      >
                        <text
                          className={"pp-detailTitle"}
                          style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
                        >
                          Raw Entry
                        </text>
                        <text
                          className={"pp-rawEntry"}
                          style={{ fontWeight: fontWeight.regular, color: colors.fg.neutralSubtle }}
                        >
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
