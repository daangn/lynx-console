import { useEffect, useMemo, useRef, useState } from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight, type ThemeColors } from "../styles/theme";
import type { NetworkEntry } from "../types";
import { HighlightText, textIncludes } from "./HighlightText";
import { NetworkDetailSection } from "./NetworkDetailSection";
import "./NetworkPanel.css";

interface NetworkPanelProps {
  networks: NetworkEntry[];
  clearNetworks: () => void;
}

type TabType = "general" | "request" | "response";

// 패널이 다시 마운트돼도 검색어를 유지
let savedSearchQuery = "";

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
  // 항목별 탭 선택 상태(검색 일치 항목은 일치한 탭이 기본값)
  const [tabOverrides, setTabOverrides] = useState<Record<string, TabType>>({});
  const [searchQuery, setSearchQuery] = useState(savedSearchQuery);
  const searchInputRef = useRef<NodesRef>(null);
  const listRef = useRef<NodesRef>(null);

  useEffect(() => {
    savedSearchQuery = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    if (savedSearchQuery) {
      searchInputRef.current
        ?.invoke({ method: "setValue", params: { value: savedSearchQuery } })
        .exec();
    }
  }, []);

  // 검색 일치 정보: 일치한 항목 id 집합과 항목별로 펼칠 탭
  const matchInfo = useMemo(() => {
    const ids = new Set<string>();
    const matchedTab = new Map<string, TabType>();
    if (!searchQuery.trim()) return { ids, matchedTab };

    for (const network of networks) {
      const inResponse = textIncludes(network.responseBody, searchQuery);
      const inRequest = textIncludes(network.requestBody, searchQuery);
      const inUrl = textIncludes(network.url, searchQuery);
      if (inResponse || inRequest || inUrl) {
        ids.add(network.id);
        // response를 가장 우선해 자동으로 펼친다
        matchedTab.set(
          network.id,
          inResponse ? "response" : inRequest ? "request" : "general",
        );
      }
    }
    return { ids, matchedTab };
  }, [networks, searchQuery]);

  const isExpanded = (id: string): boolean =>
    selectedId === id || matchInfo.ids.has(id);

  const getActiveTab = (id: string): TabType =>
    tabOverrides[id] ?? matchInfo.matchedTab.get(id) ?? "general";

  // 검색어가 바뀌면 첫 번째 일치 항목으로 스크롤 포커스
  const firstMatchIndex = useMemo(() => {
    if (!searchQuery.trim()) return -1;
    return networks.findIndex((network) => matchInfo.ids.has(network.id));
  }, [networks, matchInfo, searchQuery]);

  useEffect(() => {
    if (firstMatchIndex < 0) return;
    listRef.current
      ?.invoke({
        method: "scrollToPosition",
        params: { position: firstMatchIndex, smooth: true },
        // 스크롤 도중 목록이 갱신되며 나는 무해한 경고를 무시
        fail: () => {},
      })
      .exec();
  }, [firstMatchIndex]);

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
      <view className={"np-header"}>
        <view
          className={"np-searchWrapper"}
          style={{ borderBottomColor: colors.stroke.neutralSubtle }}
        >
          <text
            className={"np-searchPrompt t6"}
            style={{
              fontWeight: fontWeight.medium,
              color: colors.fg.placeholder,
            }}
          >
            {"›"}
          </text>
          <input
            ref={searchInputRef}
            className={"np-searchInput t3"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.neutral,
              caretColor: colors.palette.green600,
            }}
            placeholder="Search url, request & response..."
            bindinput={(e: BaseEvent<"bindinput", InputInputEvent>) =>
              setSearchQuery(e.detail.value)
            }
          />
          {searchQuery.length > 0 && (
            <view
              className={"np-searchClear"}
              bindtap={() => {
                setSearchQuery("");
                searchInputRef.current
                  ?.invoke({ method: "setValue", params: { value: "" } })
                  .exec();
              }}
            >
              <text
                className={"np-searchClearText t3"}
                style={{
                  fontWeight: fontWeight.medium,
                  color: colors.fg.placeholder,
                }}
              >
                ✕
              </text>
            </view>
          )}
        </view>
        <view
          className={"np-clearButton"}
          style={{ backgroundColor: colors.bg.neutralWeak }}
          bindtap={clearNetworks}
        >
          <text
            className={"np-clearButtonText t3"}
            style={{
              fontWeight: fontWeight.medium,
              color: colors.fg.neutralMuted,
            }}
          >
            🗑
          </text>
        </view>
      </view>

      <view className={"np-countRow"}>
        <text
          className={"np-count t3"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutralSubtle,
          }}
        >
          {searchQuery.trim()
            ? `${matchInfo.ids.size} / ${networks.length} requests`
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
        <list ref={listRef} scroll-orientation="vertical" className={"np-list"}>
          {networks.map((network) => (
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
                  bindtap={() =>
                    setSelectedId(isExpanded(network.id) ? null : network.id)
                  }
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

                <view
                  bindtap={() =>
                    setSelectedId(isExpanded(network.id) ? null : network.id)
                  }
                >
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

                {isExpanded(network.id) && (
                  <view
                    className={"np-detailsContainer"}
                    style={{ borderTopColor: colors.stroke.neutralSubtle }}
                  >
                    {/* Tabs */}
                    <view className={"np-tabs"}>
                      {(["general", "request", "response"] as TabType[]).map(
                        (tab) => {
                          const isActive = getActiveTab(network.id) === tab;
                          return (
                            <view
                              key={tab}
                              className={"np-tab"}
                              style={{
                                backgroundColor: isActive
                                  ? colors.bg.neutralWeak
                                  : undefined,
                              }}
                              bindtap={() =>
                                setTabOverrides((prev) => ({
                                  ...prev,
                                  [network.id]: tab,
                                }))
                              }
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
                                {tab === "general"
                                  ? "General"
                                  : tab === "request"
                                    ? "Request"
                                    : "Response"}
                              </text>
                            </view>
                          );
                        },
                      )}
                    </view>

                    {/* Tab Content */}
                    <view className={"np-tabContent"}>
                      {getActiveTab(network.id) === "general" && (
                        <view className={"np-table"}>
                          {getGeneralInfo(network).map((item) => (
                            <view
                              key={item.key}
                              className={"np-tableRow"}
                              style={{ backgroundColor: colors.bg.neutralWeak }}
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
                                query={searchQuery}
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

                      {getActiveTab(network.id) === "request" && (
                        <NetworkDetailSection
                          headers={network.requestHeaders}
                          body={network.requestBody}
                          highlightQuery={searchQuery}
                        />
                      )}

                      {getActiveTab(network.id) === "response" && (
                        <NetworkDetailSection
                          headers={network.responseHeaders}
                          body={network.responseBody}
                          error={network.error}
                          highlightQuery={searchQuery}
                        />
                      )}
                    </view>
                  </view>
                )}
              </view>
            </list-item>
          ))}
        </list>
      )}
    </view>
  );
};
