import type { RefObject } from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import type { NetworkTab } from "../hooks/useNetworkSearch";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { NetworkEntry } from "../types";
import {
  extractPath,
  formatDuration,
  getItemBg,
  getMethodColors,
  getStatusCodeColor,
  getStatusCodeVariant,
  TABS,
} from "../utils/networkFormat";
import { HighlightText } from "./HighlightText";
import { NetworkDetailSection } from "./NetworkDetailSection";
import { NetworkGeneralSection } from "./NetworkGeneralSection";
import "./NetworkPanel.css";

interface NetworkListItemProps {
  network: NetworkEntry;
  expanded: boolean;
  onToggle: () => void;
  activeTab: NetworkTab;
  searchQuery: string;
  onSelectTab: (tab: NetworkTab) => void;
  // nodeKey 단위 접근자(항목 id는 부모에서 미리 바인딩됨)
  getActiveOccurrence: (nodeKey: string) => number;
  getNodeRef: (nodeKey: string) => RefObject<NodesRef> | undefined;
}

export const NetworkListItem = ({
  network,
  expanded,
  onToggle,
  activeTab,
  searchQuery,
  onSelectTab,
  getActiveOccurrence,
  getNodeRef,
}: NetworkListItemProps) => {
  const colors = useThemeColors();

  return (
    <view
      className={"np-item"}
      style={{
        backgroundColor: getItemBg(colors, network.status),
        borderBottomColor: colors.stroke.neutralWeak,
      }}
    >
      <view className={"np-itemHeader"} bindtap={onToggle}>
        <text
          className={"np-method t2"}
          style={{
            fontWeight: fontWeight.bold,
            ...getMethodColors(colors, network.method),
          }}
        >
          {network.method}
        </text>
        {network.statusCode && (
          <text
            className={"np-statusCode t2"}
            style={{
              fontWeight: fontWeight.bold,
              color: getStatusCodeColor(
                colors,
                getStatusCodeVariant(network.status, network.statusCode),
              ),
            }}
          >
            {network.statusCode}
          </text>
        )}
        {network.status === "pending" && (
          <text
            className={"np-statusCode t2"}
            style={{
              fontWeight: fontWeight.bold,
              color: colors.fg.neutralSubtle,
            }}
          >
            Pending...
          </text>
        )}
        <text
          className={"np-time t2"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutralSubtle,
          }}
        >
          {formatDuration(network.duration)}
        </text>
        <text
          className={"np-time t2"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutralSubtle,
          }}
        >
          {new Date(network.startTime).toISOString()}
        </text>
      </view>

      <view bindtap={onToggle}>
        <HighlightText
          text={extractPath(network.url)}
          query={searchQuery}
          className={"np-path t3"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutral,
          }}
        />
      </view>

      {expanded && (
        <view
          className={"np-detailsContainer"}
          style={{ borderTopColor: colors.stroke.neutralSubtle }}
        >
          {/* Tabs */}
          <view className={"np-tabs"}>
            {TABS.map(({ tab, label }) => {
              const isActive = activeTab === tab;
              return (
                <view
                  key={tab}
                  className={"np-tab"}
                  style={{
                    backgroundColor: isActive
                      ? colors.bg.neutralWeak
                      : undefined,
                  }}
                  bindtap={() => onSelectTab(tab)}
                >
                  <text
                    className={"np-tabText t4"}
                    style={{
                      fontWeight: fontWeight.medium,
                      color: isActive
                        ? colors.fg.neutral
                        : colors.fg.neutralSubtle,
                    }}
                  >
                    {label}
                  </text>
                </view>
              );
            })}
          </view>

          {/* Tab Content */}
          <view className={"np-tabContent"}>
            {activeTab === "general" && (
              <NetworkGeneralSection
                network={network}
                searchQuery={searchQuery}
                getActiveOccurrence={getActiveOccurrence}
                getNodeRef={getNodeRef}
              />
            )}

            {activeTab === "request" && (
              <NetworkDetailSection
                section="request"
                headers={network.requestHeaders}
                body={network.requestBody}
                highlightQuery={searchQuery}
                getActiveOccurrence={getActiveOccurrence}
                getNodeRef={getNodeRef}
              />
            )}

            {activeTab === "response" && (
              <NetworkDetailSection
                section="response"
                headers={network.responseHeaders}
                body={network.responseBody}
                error={network.error}
                highlightQuery={searchQuery}
                getActiveOccurrence={getActiveOccurrence}
                getNodeRef={getNodeRef}
              />
            )}
          </view>
        </view>
      )}
    </view>
  );
};
