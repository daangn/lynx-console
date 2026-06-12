import { useEffect, useMemo, useRef, useState } from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight, type ThemeColors } from "../styles/theme";
import type { NetworkEntry } from "../types";
import { countOccurrences, HighlightText } from "./HighlightText";
import { NetworkDetailSection } from "./NetworkDetailSection";
import "./NetworkPanel.css";

interface NetworkPanelProps {
  networks: NetworkEntry[];
  clearNetworks: () => void;
}

type TabType = "general" | "request" | "response";

// 검색어의 개별 등장(매치) 하나를 가리킨다
interface SearchMatch {
  entryId: string;
  entryIndex: number;
  tab: TabType;
  // 해당 필드 텍스트 안에서의 0-based 등장 순번
  localIndex: number;
}

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
  // 현재 선택된 매치 인덱스(전체 매치 배열 기준, 음수/초과는 wrap 처리)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchInputRef = useRef<NodesRef>(null);
  const listRef = useRef<NodesRef>(null);

  useEffect(() => {
    savedSearchQuery = searchQuery;
    // 검색어가 바뀌면 첫 매치부터 다시 시작
    setCurrentMatchIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (savedSearchQuery) {
      searchInputRef.current
        ?.invoke({ method: "setValue", params: { value: savedSearchQuery } })
        .exec();
    }
  }, []);

  // url / request body / response body 안의 모든 등장을 평탄한 매치 배열로 만든다
  const matches = useMemo<SearchMatch[]>(() => {
    if (!searchQuery.trim()) return [];
    const result: SearchMatch[] = [];
    networks.forEach((network, entryIndex) => {
      const fields: { tab: TabType; text?: string }[] = [
        { tab: "general", text: network.url },
        { tab: "request", text: network.requestBody },
        { tab: "response", text: network.responseBody },
      ];
      for (const { tab, text } of fields) {
        const occurrences = countOccurrences(text, searchQuery);
        for (let localIndex = 0; localIndex < occurrences; localIndex++) {
          result.push({ entryId: network.id, entryIndex, tab, localIndex });
        }
      }
    });
    return result;
  }, [networks, searchQuery]);

  // wrap-around: 음수/초과 인덱스를 항상 유효 범위로 정규화
  const activeIndex =
    matches.length > 0
      ? ((currentMatchIndex % matches.length) + matches.length) % matches.length
      : 0;
  const activeMatch = matches[activeIndex];

  // 일치한 항목 id 집합과 항목별 기본 탭(첫 매치 기준)
  const { matchedIds, defaultTabByEntry } = useMemo(() => {
    const ids = new Set<string>();
    const tabByEntry = new Map<string, TabType>();
    for (const match of matches) {
      ids.add(match.entryId);
      if (!tabByEntry.has(match.entryId)) {
        tabByEntry.set(match.entryId, match.tab);
      }
    }
    return { matchedIds: ids, defaultTabByEntry: tabByEntry };
  }, [matches]);

  const isExpanded = (id: string): boolean =>
    selectedId === id || matchedIds.has(id);

  const getActiveTab = (id: string): TabType =>
    tabOverrides[id] ?? defaultTabByEntry.get(id) ?? "general";

  // 이 항목/탭에서 현재 활성 매치의 등장 순번(아니면 -1)
  const getActiveOccurrence = (id: string, tab: TabType): number =>
    activeMatch && activeMatch.entryId === id && activeMatch.tab === tab
      ? activeMatch.localIndex
      : -1;

  const goToMatch = (delta: number) => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => prev + delta);
  };

  // 현재 매치가 바뀌면 해당 항목으로 스크롤하고 그 항목의 탭을 매치 위치로 전환
  const activeEntryId = activeMatch?.entryId;
  const activeEntryIndex = activeMatch?.entryIndex;
  const activeTabForScroll = activeMatch?.tab;
  useEffect(() => {
    if (activeEntryId === undefined || activeEntryIndex === undefined) return;
    listRef.current
      ?.invoke({
        method: "scrollToPosition",
        params: { position: activeEntryIndex, smooth: true },
        // 스크롤 도중 목록이 갱신되며 나는 무해한 경고를 무시
        fail: () => {},
      })
      .exec();
    if (activeTabForScroll) {
      setTabOverrides((prev) => ({
        ...prev,
        [activeEntryId]: activeTabForScroll,
      }));
    }
  }, [activeEntryId, activeEntryIndex, activeTabForScroll, activeIndex]);

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
          {searchQuery.trim().length > 0 && (
            <view className={"np-matchNav"}>
              <text
                className={"np-matchCount t2"}
                style={{
                  fontWeight: fontWeight.medium,
                  color: colors.fg.neutralSubtle,
                }}
              >
                {matches.length > 0
                  ? `${activeIndex + 1}/${matches.length}`
                  : "0/0"}
              </text>
              <view
                className={"np-matchNavButton"}
                style={{ backgroundColor: colors.bg.neutralWeak }}
                bindtap={() => goToMatch(-1)}
              >
                <text
                  className={"np-matchNavText t3"}
                  style={{
                    fontWeight: fontWeight.bold,
                    color:
                      matches.length > 0
                        ? colors.fg.neutralMuted
                        : colors.fg.disabled,
                  }}
                >
                  ▲
                </text>
              </view>
              <view
                className={"np-matchNavButton"}
                style={{ backgroundColor: colors.bg.neutralWeak }}
                bindtap={() => goToMatch(1)}
              >
                <text
                  className={"np-matchNavText t3"}
                  style={{
                    fontWeight: fontWeight.bold,
                    color:
                      matches.length > 0
                        ? colors.fg.neutralMuted
                        : colors.fg.disabled,
                  }}
                >
                  ▼
                </text>
              </view>
            </view>
          )}
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
            ? `${matchedIds.size} / ${networks.length} requests`
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
                              {item.key === "URL" ? (
                                <HighlightText
                                  text={item.value}
                                  query={searchQuery}
                                  activeOccurrence={getActiveOccurrence(
                                    network.id,
                                    "general",
                                  )}
                                  className={"np-tableValue t3"}
                                  style={{
                                    fontWeight: fontWeight.regular,
                                    color: colors.fg.neutral,
                                  }}
                                />
                              ) : (
                                <text
                                  className={"np-tableValue t3"}
                                  style={{
                                    fontWeight: fontWeight.regular,
                                    color: colors.fg.neutral,
                                  }}
                                >
                                  {item.value}
                                </text>
                              )}
                            </view>
                          ))}
                        </view>
                      )}

                      {getActiveTab(network.id) === "request" && (
                        <NetworkDetailSection
                          headers={network.requestHeaders}
                          body={network.requestBody}
                          highlightQuery={searchQuery}
                          activeOccurrence={getActiveOccurrence(
                            network.id,
                            "request",
                          )}
                        />
                      )}

                      {getActiveTab(network.id) === "response" && (
                        <NetworkDetailSection
                          headers={network.responseHeaders}
                          body={network.responseBody}
                          error={network.error}
                          highlightQuery={searchQuery}
                          activeOccurrence={getActiveOccurrence(
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
          ))}
        </list>
      )}
    </view>
  );
};
