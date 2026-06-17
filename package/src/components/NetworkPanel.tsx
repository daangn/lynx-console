import { useState } from "@lynx-js/react";
import { useNetworkSearch } from "../hooks/useNetworkSearch";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { NetworkEntry } from "../types";
import { NetworkListItem } from "./NetworkListItem";
import "./NetworkPanel.css";
import { NetworkSearchBar } from "./NetworkSearchBar";

interface NetworkPanelProps {
  networks: NetworkEntry[];
  clearNetworks: () => void;
}

export const NetworkPanel = ({
  networks,
  clearNetworks,
}: NetworkPanelProps) => {
  const colors = useThemeColors();
  // 수동으로 펼친 단일 항목(아코디언). 검색 매치는 별도로 자동 펼침된다.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 매치로 자동 펼쳐졌지만 사용자가 직접 접은 항목들(자동 펼침을 무시)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const search = useNetworkSearch(networks);

  const isExpanded = (id: string): boolean => {
    if (collapsedIds.has(id)) return false;
    return selectedId === id || search.isMatched(id);
  };

  const toggleExpanded = (id: string): void => {
    if (isExpanded(id)) {
      // 접기: 아코디언 선택을 해제하고, 매치 항목이면 자동 펼침도 끈다
      setSelectedId((cur) => (cur === id ? null : cur));
      if (search.isMatched(id)) {
        setCollapsedIds((prev) => new Set(prev).add(id));
      }
    } else {
      // 펼치기: 아코디언 선택 + 접힘 표시 해제
      setSelectedId(id);
      setCollapsedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
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
          {networks.map((network) => (
            <list-item key={network.id} item-key={network.id}>
              <NetworkListItem
                network={network}
                expanded={isExpanded(network.id)}
                onToggle={() => toggleExpanded(network.id)}
                activeTab={search.getActiveTab(network.id)}
                searchQuery={search.searchQuery}
                onSelectTab={(tab) => search.selectTab(network.id, tab)}
                getActiveOccurrence={(nodeKey) =>
                  search.getActiveOccurrence(network.id, nodeKey)
                }
                getNodeRef={(nodeKey) => search.getNodeRef(network.id, nodeKey)}
              />
            </list-item>
          ))}
        </list>
      )}
    </view>
  );
};
