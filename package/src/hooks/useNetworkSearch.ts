import { useEffect, useMemo, useRef, useState } from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import { countOccurrences } from "../components/HighlightText";
import type { NetworkEntry } from "../types";

export type NetworkTab = "general" | "request" | "response";

// 검색어의 개별 등장(매치) 하나
interface SearchMatch {
  entryId: string;
  entryIndex: number;
  tab: NetworkTab;
  // 해당 필드 텍스트 안에서의 0-based 등장 순번
  localIndex: number;
}

// 패널이 다시 마운트돼도 검색어를 유지
let savedSearchQuery = "";

/**
 * 네트워크 패널의 검색 상태와 매치 네비게이션을 담당한다.
 * url / request body / response body 안의 모든 등장을 평탄한 배열로 모아
 * 위/아래 이동, 스크롤 포커스, 탭 자동 전환, 활성 매치 강조를 제공한다.
 */
export function useNetworkSearch(networks: NetworkEntry[]) {
  const [searchQuery, setSearchQuery] = useState(savedSearchQuery);
  // 전체 매치 배열 기준 현재 인덱스(음수/초과는 wrap 처리)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  // 항목별 탭 선택 상태(매치로 이동하거나 직접 탭을 누르면 갱신)
  const [tabOverrides, setTabOverrides] = useState<Record<string, NetworkTab>>(
    {},
  );
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

  const matches = useMemo<SearchMatch[]>(() => {
    if (!searchQuery.trim()) return [];
    const result: SearchMatch[] = [];
    networks.forEach((network, entryIndex) => {
      const fields: { tab: NetworkTab; text?: string }[] = [
        { tab: "general", text: network.url },
        { tab: "request", text: network.requestBody },
        { tab: "response", text: network.responseBody },
      ];
      for (const { tab, text } of fields) {
        const count = countOccurrences(text, searchQuery);
        for (let localIndex = 0; localIndex < count; localIndex++) {
          result.push({ entryId: network.id, entryIndex, tab, localIndex });
        }
      }
    });
    return result;
  }, [networks, searchQuery]);

  const activeIndex =
    matches.length > 0
      ? ((currentMatchIndex % matches.length) + matches.length) % matches.length
      : 0;
  const activeMatch = matches[activeIndex];

  // 일치한 항목 id 집합과 항목별 기본 탭(첫 매치 기준)
  const { matchedIds, defaultTabByEntry } = useMemo(() => {
    const ids = new Set<string>();
    const tabByEntry = new Map<string, NetworkTab>();
    for (const match of matches) {
      ids.add(match.entryId);
      if (!tabByEntry.has(match.entryId)) {
        tabByEntry.set(match.entryId, match.tab);
      }
    }
    return { matchedIds: ids, defaultTabByEntry: tabByEntry };
  }, [matches]);

  // 현재 매치가 바뀌면 해당 항목으로 스크롤하고 그 항목의 탭을 매치 위치로 전환
  const activeEntryId = activeMatch?.entryId;
  const activeEntryIndex = activeMatch?.entryIndex;
  const activeTab = activeMatch?.tab;
  useEffect(() => {
    if (activeEntryId === undefined || activeEntryIndex === undefined) return;
    listRef.current
      ?.invoke({
        method: "scrollToPosition",
        // middle: 매치 항목을 "완전히 보이도록" 화면 중앙에 정렬한다.
        // top 정렬은 상단 헤더에 가리거나 목록 끝 근처 항목을 못 올리는 문제가 있음
        params: { position: activeEntryIndex, alignTo: "middle", smooth: true },
        // 스크롤 도중 목록이 갱신되며 나는 무해한 경고를 무시
        fail: () => {},
      })
      .exec();
    if (activeTab) {
      setTabOverrides((prev) => ({ ...prev, [activeEntryId]: activeTab }));
    }
  }, [activeEntryId, activeEntryIndex, activeTab, activeIndex]);

  return {
    searchQuery,
    setSearchQuery,
    searchInputRef,
    listRef,
    totalMatches: matches.length,
    matchedCount: matchedIds.size,
    activeIndex,
    isMatched: (id: string): boolean => matchedIds.has(id),
    getActiveTab: (id: string): NetworkTab =>
      tabOverrides[id] ?? defaultTabByEntry.get(id) ?? "general",
    selectTab: (id: string, tab: NetworkTab): void =>
      setTabOverrides((prev) => ({ ...prev, [id]: tab })),
    // 이 항목/탭에서 현재 활성 매치의 등장 순번(아니면 -1)
    getActiveOccurrence: (id: string, tab: NetworkTab): number =>
      activeMatch && activeMatch.entryId === id && activeMatch.tab === tab
        ? activeMatch.localIndex
        : -1,
    goToMatch: (delta: number): void => {
      if (matches.length > 0) setCurrentMatchIndex((prev) => prev + delta);
    },
  };
}
