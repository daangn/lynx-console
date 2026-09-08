import { useState } from "@lynx-js/react";
import type { NetworkTab } from "../hooks/useNetworkSearch";
import type { NetworkEntry } from "../types";
import { NetworkListItem } from "./NetworkListItem";

interface NetworkLogRowProps {
  network: NetworkEntry;
  expanded: boolean;
  onToggle: () => void;
}

const noOccurrence = () => -1;
const noNodeRef = () => undefined;

// Log 탭과 필터 탭에서 네트워크 로그를 Network 탭 항목과 같은 UI 로 그려요
export const NetworkLogRow = ({
  network,
  expanded,
  onToggle,
}: NetworkLogRowProps) => {
  const [activeTab, setActiveTab] = useState<NetworkTab>("general");

  return (
    <NetworkListItem
      network={network}
      expanded={expanded}
      onToggle={onToggle}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      searchQuery=""
      getActiveOccurrence={noOccurrence}
      getNodeRef={noNodeRef}
    />
  );
};
