import {
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import { countOccurrences } from "../components/HighlightText";
import type { NetworkEntry } from "../types";

// Lynx invoke 콜백을 Promise로 래핑 — 콜백 중첩 없이 await로 순차 호출 가능
function invokeAsync<T = void>(
  ref: NodesRef | null | undefined,
  method: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!ref) {
      reject(new Error("ref is null"));
      return;
    }
    ref
      .invoke({
        method,
        params,
        success: (res: T) => resolve(res),
        fail: () => reject(new Error("invoke failed")),
      })
      .exec();
  });
}

export type NetworkTab = "general" | "request" | "response";
type Section = "request" | "response";

// 렌더되는 개별 <text> 노드를 고유 식별하는 키 생성기.
// 훅(매치 카운트)과 렌더(강조)가 반드시 같은 키를 쓰도록 한곳에서 관리한다.
export const matchNode = {
  url: "url",
  body: (section: Section): string => `${section}:body`,
  headerKey: (section: Section, name: string): string =>
    `${section}:hdr:${name}:k`,
  headerValue: (section: Section, name: string): string =>
    `${section}:hdr:${name}:v`,
};

// 검색어의 개별 등장(매치) 하나
interface SearchMatch {
  entryId: string;
  entryIndex: number;
  tab: NetworkTab;
  // 렌더되는 <text> 노드 식별자(matchNode로 생성)
  nodeKey: string;
  // 그 노드 텍스트 안에서의 0-based 등장 순번
  localIndex: number;
}

// 패널이 다시 마운트돼도 검색어를 유지
let savedSearchQuery = "";

/**
 * 네트워크 패널의 검색 상태와 매치 네비게이션을 담당한다.
 * url / request·response 헤더 / request·response body 안의 모든 등장을
 * 노드 단위로 모아 위/아래 이동, 스크롤 포커스, 탭 전환, 활성 매치 강조를 제공한다.
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
  // 현재 활성 매치가 렌더된 노드(헤더 행 / body 섹션 / url 행)에 붙는 ref
  const activeNodeRef = useRef<NodesRef>(null);

  useEffect(() => {
    savedSearchQuery = searchQuery;
    // 검색어가 바뀌면 첫 매치부터 다시 시작하고 탭 선택도 매치를 따르도록 초기화
    setCurrentMatchIndex(0);
    setTabOverrides({});
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
      // 렌더 순서와 동일하게 노드를 훑으며 각 노드의 등장마다 매치를 만든다
      const addNode = (tab: NetworkTab, nodeKey: string, text?: string) => {
        const count = countOccurrences(text, searchQuery);
        for (let localIndex = 0; localIndex < count; localIndex++) {
          result.push({
            entryId: network.id,
            entryIndex,
            tab,
            nodeKey,
            localIndex,
          });
        }
      };
      const addHeaders = (
        section: Section,
        headers?: Record<string, string>,
      ) => {
        for (const [key, value] of Object.entries(headers ?? {})) {
          addNode(section, matchNode.headerKey(section, key), key);
          addNode(section, matchNode.headerValue(section, key), value);
        }
      };

      addNode("general", matchNode.url, network.url);
      addHeaders("request", network.requestHeaders);
      addNode("request", matchNode.body("request"), network.requestBody);
      addHeaders("response", network.responseHeaders);
      addNode("response", matchNode.body("response"), network.responseBody);
    });
    return result;
  }, [networks, searchQuery]);

  const activeIndex =
    matches.length > 0
      ? ((currentMatchIndex % matches.length) + matches.length) % matches.length
      : 0;
  const activeMatch = matches[activeIndex];
  const activeNodeKey = activeMatch?.nodeKey;

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

  // 현재 매치가 바뀌면 매치 노드를 화면 상단으로 스크롤한다.
  const activeEntryId = activeMatch?.entryId;
  const activeEntryIndex = activeMatch?.entryIndex;
  useEffect(() => {
    if (activeEntryId === undefined || activeEntryIndex === undefined) return;
    // effect 시작 시점에 스냅샷 캡처 — 비동기 콜백 내부에서 읽으면
    // 빠른 연속 이동 시 이미 다른 노드를 가리킬 수 있다
    const nodeRef = activeNodeRef.current;
    const listNode = listRef.current;
    // 다음 매치로 빠르게 이동하면 이전 체인을 중단해 옛 스크롤이 이기지 않게 한다
    let cancelled = false;

    void (async () => {
      try {
        // 1) 항목을 즉시 상단으로 스크롤(smooth:false → 완료 후 레이아웃 확정)
        await invokeAsync(listNode, "scrollToPosition", {
          index: activeEntryIndex,
          alignTo: "top",
          smooth: false,
        });
        if (cancelled || !nodeRef) return;
        // 2) 매치 노드와 리스트의 뷰포트 기준 위치를 병렬 조회
        const [nodeRect, listRect] = await Promise.all([
          invokeAsync<{ top: number }>(nodeRef, "boundingClientRect"),
          invokeAsync<{ top: number }>(listNode, "boundingClientRect"),
        ]);
        if (cancelled) return;
        // 3) 노드가 리스트 상단보다 아래에 있는 만큼 추가 스크롤
        const offset = nodeRect.top - listRect.top;
        if (offset <= 0) return;
        await invokeAsync(listNode, "scrollBy", { offset });
      } catch {
        // 스크롤 실패(언마운트·ref 없음 등)는 무시
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeEntryId, activeEntryIndex, activeNodeKey, activeIndex]);

  return {
    searchQuery,
    setSearchQuery,
    searchInputRef,
    listRef,
    totalMatches: matches.length,
    matchedCount: matchedIds.size,
    activeIndex,
    isMatched: (id: string): boolean => matchedIds.has(id),
    // 활성 항목은 매치 위치의 탭을 따른다(수동 탭 선택이 있으면 그것을 우선)
    getActiveTab: (id: string): NetworkTab =>
      tabOverrides[id] ??
      (activeMatch?.entryId === id ? activeMatch.tab : undefined) ??
      defaultTabByEntry.get(id) ??
      "general",
    selectTab: (id: string, tab: NetworkTab): void =>
      setTabOverrides((prev) => ({ ...prev, [id]: tab })),
    // 이 항목/노드에서 현재 활성 매치의 등장 순번(아니면 -1)
    getActiveOccurrence: (id: string, nodeKey: string): number =>
      activeMatch &&
      activeMatch.entryId === id &&
      activeMatch.nodeKey === nodeKey
        ? activeMatch.localIndex
        : -1,
    // 활성 매치 노드에만 스크롤용 ref를 부여한다(나머지는 undefined)
    getNodeRef: (
      id: string,
      nodeKey: string,
    ): RefObject<NodesRef> | undefined =>
      activeMatch &&
      activeMatch.entryId === id &&
      activeMatch.nodeKey === nodeKey
        ? activeNodeRef
        : undefined,
    goToMatch: (delta: number): void => {
      if (matches.length === 0) return;
      // 이동 시 탭 선택을 비워 활성 항목이 매치 위치의 탭을 따르도록 한다
      setTabOverrides({});
      setCurrentMatchIndex((prev) => prev + delta);
    },
  };
}
