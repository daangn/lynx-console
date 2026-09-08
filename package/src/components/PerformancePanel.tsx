import { useState } from "@lynx-js/react";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { PerformanceEntryData } from "../types";
import "./PerformancePanel.css";
import { PerformanceListItem } from "./PerformanceListItem";

interface PerformancePanelProps {
  performances: PerformanceEntryData[];
  clearPerformances: () => void;
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
            className={"pp-count t3"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.neutralSubtle,
            }}
          >
            0 entries
          </text>
          <view
            bindtap={clearPerformances}
            className={"pp-clearButton"}
            style={{ backgroundColor: colors.bg.neutralWeak }}
          >
            <text
              className={"pp-clearButtonText t3"}
              style={{
                fontWeight: fontWeight.medium,
                color: colors.fg.neutralMuted,
              }}
            >
              🗑
            </text>
          </view>
        </view>
        <view className={"pp-placeholder"}>
          <text
            className={"pp-placeholderText t4"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.disabled,
            }}
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
          className={"pp-count t3"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutralSubtle,
          }}
        >
          {performances.length} entries
        </text>
        <view
          bindtap={clearPerformances}
          className={"pp-clearButton"}
          style={{ backgroundColor: colors.bg.neutralWeak }}
        >
          <text
            className={"pp-clearButtonText t3"}
            style={{
              fontWeight: fontWeight.medium,
              color: colors.fg.neutralMuted,
            }}
          >
            🗑
          </text>
        </view>
      </view>

      <list scroll-orientation="vertical" className={"pp-list"}>
        {performances.map((perf) => (
          <list-item key={perf.id} item-key={perf.id}>
            <PerformanceListItem
              perf={perf}
              expanded={selectedId === perf.id}
              onToggle={() =>
                setSelectedId(selectedId === perf.id ? null : perf.id)
              }
            />
          </list-item>
        ))}
      </list>
    </view>
  );
};
