import { useEffect, useMemo, useState } from "@lynx-js/react";
import type { NetworkTab } from "../hooks/useNetworkSearch";
import type { NetworkEntry } from "../types";
import { textIncludes } from "./HighlightText";
import { NetworkListItem } from "./NetworkListItem";

interface NetworkLogRowProps {
  network: NetworkEntry;
  expanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}

const noOccurrence = () => -1;
const noNodeRef = () => undefined;

const headersInclude = (
  headers: Record<string, string> | undefined,
  query: string,
): boolean =>
  Object.entries(headers ?? {}).some(
    ([key, value]) => textIncludes(key, query) || textIncludes(value, query),
  );

// 검색어가 처음 걸리는 섹션이에요. 그 섹션을 열어둬서 왜 걸렸는지 바로 보여줘요
const firstMatchingTab = (
  network: NetworkEntry,
  query: string,
): NetworkTab | null => {
  if (!query.trim()) return null;
  if (textIncludes(network.url, query)) return "general";
  if (
    headersInclude(network.requestHeaders, query) ||
    textIncludes(network.requestBody, query)
  ) {
    return "request";
  }
  if (
    headersInclude(network.responseHeaders, query) ||
    textIncludes(network.responseBody, query)
  ) {
    return "response";
  }
  return null;
};

// Log 탭과 필터 탭에서 네트워크 로그를 Network 탭 항목과 같은 UI 로 그려요
export const NetworkLogRow = ({
  network,
  expanded,
  onToggle,
  searchQuery,
}: NetworkLogRowProps) => {
  const matchedTab = useMemo(
    () => firstMatchingTab(network, searchQuery),
    [network, searchQuery],
  );
  const [selectedTab, setSelectedTab] = useState<NetworkTab | null>(null);

  // 검색어가 바뀌면 매치가 있는 섹션을 다시 따라가요
  useEffect(() => {
    setSelectedTab(null);
  }, [searchQuery]);

  return (
    <NetworkListItem
      network={network}
      // 검색에 걸린 줄은 펼쳐 두고, 한 번 누르면 도로 접혀요
      expanded={matchedTab ? !expanded : expanded}
      onToggle={onToggle}
      activeTab={selectedTab ?? matchedTab ?? "general"}
      onSelectTab={setSelectedTab}
      searchQuery={searchQuery}
      getActiveOccurrence={noOccurrence}
      getNodeRef={noNodeRef}
    />
  );
};
