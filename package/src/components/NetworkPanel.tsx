import { useState } from "@lynx-js/react";
import { type NetworkTab, useNetworkSearch } from "../hooks/useNetworkSearch";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight, type ThemeColors } from "../styles/theme";
import type { NetworkEntry } from "../types";
import { HighlightText } from "./HighlightText";
import { NetworkDetailSection } from "./NetworkDetailSection";
import "./NetworkPanel.css";
import { NetworkSearchBar } from "./NetworkSearchBar";

interface NetworkPanelProps {
  networks: NetworkEntry[];
  clearNetworks: () => void;
}

const TABS: { tab: NetworkTab; label: string }[] = [
  { tab: "general", label: "General" },
  { tab: "request", label: "Request" },
  { tab: "response", label: "Response" },
];

function getMethodColors(colors: ThemeColors, method: string) {
  switch (method) {
    case "GET":
      return {
        color: colors.palette.blue600,
        backgroundColor: colors.palette.blue100,
      };
    case "POST":
      return {
        color: colors.palette.green600,
        backgroundColor: colors.palette.green100,
      };
    case "PUT":
      return {
        color: colors.palette.yellow600,
        backgroundColor: colors.palette.yellow100,
      };
    case "PATCH":
      return {
        color: colors.palette.purple600,
        backgroundColor: colors.palette.purple100,
      };
    case "DELETE":
      return {
        color: colors.palette.red600,
        backgroundColor: colors.palette.red100,
      };
    default:
      return {
        color: colors.fg.neutral,
        backgroundColor: colors.bg.neutralWeak,
      };
  }
}

function getStatusCodeColor(
  colors: ThemeColors,
  variant: "success" | "error" | "pending",
): string {
  switch (variant) {
    case "success":
      return colors.palette.green600;
    case "error":
      return colors.palette.red600;
    case "pending":
      return colors.fg.neutralSubtle;
  }
}

function getItemBg(colors: ThemeColors, status: string): string | undefined {
  switch (status) {
    case "pending":
      return colors.palette.gray100;
    case "error":
      return colors.palette.red100;
    default:
      return undefined;
  }
}

export const NetworkPanel = ({
  networks,
  clearNetworks,
}: NetworkPanelProps) => {
  const colors = useThemeColors();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const search = useNetworkSearch(networks);

  const isExpanded = (id: string): boolean =>
    selectedId === id || search.isMatched(id);

  const toggleExpanded = (id: string) =>
    setSelectedId(isExpanded(id) ? null : id);

  const formatDuration = (duration?: number): string => {
    if (!duration) return "-";
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const extractPath = (url: string): string => {
    const pathMatch = url.match(/^https?:\/\/[^/]+(.*)$/);
    if (pathMatch?.[1]) {
      return pathMatch[1].startsWith("/")
        ? pathMatch[1].slice(1)
        : pathMatch[1];
    }
    return url;
  };

  const getGeneralInfo = (network: NetworkEntry) => {
    return [
      { key: "URL", value: network.url },
      { key: "Method", value: network.method },
      network.statusCode
        ? { key: "Status", value: String(network.statusCode) }
        : null,
      {
        key: "Request Time",
        value: new Date(network.startTime).toISOString(),
      },
      network.endTime
        ? {
            key: "Response Time",
            value: new Date(network.endTime).toISOString(),
          }
        : null,
      network.duration
        ? { key: "Duration", value: formatDuration(network.duration) }
        : null,
    ].filter((item) => item !== null);
  };

  const getStatusCodeVariant = (
    status: string,
    statusCode?: number,
  ): "success" | "error" | "pending" => {
    if (status === "pending") return "pending";
    if (status === "error") return "error";
    if (statusCode && statusCode >= 200 && statusCode < 300) return "success";
    return "error";
  };

  return (
    <view className={"np-container"}>
      <NetworkSearchBar
        searchQuery={search.searchQuery}
        setSearchQuery={search.setSearchQuery}
        searchInputRef={search.searchInputRef}
        totalMatches={search.totalMatches}
        activeIndex={search.activeIndex}
        goToMatch={search.goToMatch}
        clearNetworks={clearNetworks}
      />

      <view className={"np-countRow"}>
        <text
          className={"np-count t3"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutralSubtle,
          }}
        >
          {search.searchQuery.trim()
            ? `${search.matchedCount} / ${networks.length} requests`
            : `Total: ${networks.length} requests`}
        </text>
      </view>

      {networks.length === 0 ? (
        <view className={"np-placeholder"}>
          <text
            className={"np-placeholderText t4"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.disabled,
            }}
          >
            No network requests yet
          </text>
        </view>
      ) : (
        <list
          ref={search.listRef}
          scroll-orientation="vertical"
          className={"np-list"}
        >
          {networks.map((network) => {
            const activeTab = search.getActiveTab(network.id);
            return (
              <list-item key={network.id} item-key={network.id}>
                <view
                  className={"np-item"}
                  style={{
                    backgroundColor: getItemBg(colors, network.status),
                    borderBottomColor: colors.stroke.neutralWeak,
                  }}
                >
                  <view
                    className={"np-itemHeader"}
                    bindtap={() => toggleExpanded(network.id)}
                  >
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
                            getStatusCodeVariant(
                              network.status,
                              network.statusCode,
                            ),
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

                  <view bindtap={() => toggleExpanded(network.id)}>
                    <HighlightText
                      text={extractPath(network.url)}
                      query={search.searchQuery}
                      className={"np-path t3"}
                      style={{
                        fontWeight: fontWeight.regular,
                        color: colors.fg.neutral,
                      }}
                    />
                  </view>

                  {isExpanded(network.id) && (
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
                              bindtap={() => search.selectTab(network.id, tab)}
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
                          <view className={"np-table"}>
                            {getGeneralInfo(network).map((item) => (
                              <view
                                key={item.key}
                                className={"np-tableRow"}
                                style={{
                                  backgroundColor: colors.bg.neutralWeak,
                                }}
                              >
                                <text
                                  className={"np-tableKey t3"}
                                  style={{
                                    fontWeight: fontWeight.bold,
                                    color: colors.fg.neutralSubtle,
                                  }}
                                >
                                  {item.key}
                                </text>
                                <HighlightText
                                  text={item.value}
                                  query={
                                    item.key === "URL" ? search.searchQuery : ""
                                  }
                                  activeOccurrence={
                                    item.key === "URL"
                                      ? search.getActiveOccurrence(
                                          network.id,
                                          "general",
                                        )
                                      : -1
                                  }
                                  className={"np-tableValue t3"}
                                  style={{
                                    fontWeight: fontWeight.regular,
                                    color: colors.fg.neutral,
                                  }}
                                />
                              </view>
                            ))}
                          </view>
                        )}

                        {activeTab === "request" && (
                          <NetworkDetailSection
                            headers={network.requestHeaders}
                            body={network.requestBody}
                            highlightQuery={search.searchQuery}
                            activeOccurrence={search.getActiveOccurrence(
                              network.id,
                              "request",
                            )}
                          />
                        )}

                        {activeTab === "response" && (
                          <NetworkDetailSection
                            headers={network.responseHeaders}
                            body={network.responseBody}
                            error={network.error}
                            highlightQuery={search.searchQuery}
                            activeOccurrence={search.getActiveOccurrence(
                              network.id,
                              "response",
                            )}
                          />
                        )}
                      </view>
                    </view>
                  )}
                </view>
              </list-item>
            );
          })}
        </list>
      )}
    </view>
  );
};
