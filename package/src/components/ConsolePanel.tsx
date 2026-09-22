import { type ReactNode, useEffect, useMemo, useState } from "@lynx-js/react";
import { useConsole, useNetwork, usePerformance } from "../hooks";
import type { CustomTab, LogEntry, LogLevel } from "../types";
import { matchesLogFilter } from "../utils/matchesLogFilter";
import { mergeConsoleEntries } from "../utils/mergeConsoleEntries";
import { isNetworkLog, isPerformanceLog } from "../utils/networkLog";
import "./ConsolePanel.css";
import { dismissFilterDropdown, LOG_LEVELS, LogPanel } from "./LogPanel";
import { MultiTabs, type TabItem } from "./MultiTabs";
import { NetworkPanel } from "./NetworkPanel";
import { ReplInput } from "./ReplInput";

interface ConsolePanelProps {
  customTabs?: CustomTab[];
}

// 필터 탭 하나. match 로 통합 리스트에서 걸러내요
interface FilterTab extends TabItem {
  match: (log: LogEntry) => boolean;
  renderEntry?: ((entry: LogEntry) => ReactNode) | undefined;
}

// 시트를 닫았다 열어도 필터가 유지되게 모듈 스코프에 들고 있어요
let savedSelected: Set<string> | null = null;
let savedLevels: Set<LogLevel> | null = null;
let savedSearchQuery = "";

const buildFilterTabs = (customTabs: CustomTab[] | undefined): FilterTab[] => {
  const state = globalThis.__LYNX_CONSOLE__?.state;
  const tabs: FilterTab[] = [];

  if (state?.logs) {
    tabs.push({
      key: "log",
      label: "Log",
      // 모니터가 넣은 게 아닌, 사용자가 직접 호출한 console 로그예요
      match: (log) => log.source === undefined,
    });
  }

  if (state?.networks) {
    tabs.push({ key: "network", label: "Network", match: isNetworkLog });
  }

  if (state?.performances) {
    tabs.push({ key: "performance", label: "Perf", match: isPerformanceLog });
  }

  for (const tab of customTabs ?? []) {
    if (!("filter" in tab)) continue;
    tabs.push({
      key: tab.key,
      label: tab.label,
      match: (log) => matchesLogFilter(log, tab.filter),
      renderEntry: tab.renderEntry,
    });
  }

  return tabs;
};

export const ConsolePanel = ({ customTabs }: ConsolePanelProps) => {
  const { logs, clearLogs } = useConsole();
  const { networks, clearNetworks } = useNetwork();
  const { performances, clearPerformances } = usePerformance();
  const entries = useMemo(
    () => mergeConsoleEntries(logs, networks, performances),
    [logs, networks, performances],
  );

  const filterTabs = useMemo(() => buildFilterTabs(customTabs), [customTabs]);
  // 로그가 아니라 임의 UI 를 그리는 탭이에요. 누르면 본문을 통째로 갈아끼워요
  const contentTabs = useMemo(
    () => (customTabs ?? []).filter((tab) => !("filter" in tab)),
    [customTabs],
  );

  const [selected, setSelected] = useState<Set<string>>(
    () => savedSelected ?? new Set(),
  );
  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(
    () => savedLevels ?? new Set(LOG_LEVELS),
  );
  const [activeContentTab, setActiveContentTab] = useState<string | null>(null);
  // 통합 리스트와 Network 전용 화면이 검색어를 같이 써요
  const [searchQuery, setSearchQuery] = useState(savedSearchQuery);

  useEffect(() => {
    savedSelected = selected;
  }, [selected]);

  useEffect(() => {
    savedSearchQuery = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    savedLevels = enabledLevels;
  }, [enabledLevels]);

  const activeTab = contentTabs.find((tab) => tab.key === activeContentTab);
  // Network 탭만 단독으로 켜면 매치 순회가 되는 전용 패널을 보여줘요
  const networkOnly =
    !activeTab && selected.size === 1 && selected.has("network");
  // 레벨 필터는 Log 탭을 켰을 때만 의미가 있어요
  const showLevelFilter = !activeTab && !networkOnly && selected.has("log");

  // 아무것도 안 켜면 전부 보여줘요. 여러 개 켜면 합집합이에요
  const filteredLogs = useMemo(() => {
    const active = filterTabs.filter((tab) => selected.has(tab.key));
    return entries.filter((log) => {
      if (
        showLevelFilter &&
        log.source === undefined &&
        !enabledLevels.has(log.level)
      )
        return false;
      if (active.length === 0) return true;
      return active.some((tab) => tab.match(log));
    });
  }, [entries, filterTabs, selected, enabledLevels, showLevelFilter]);

  // 커스텀 필터 탭 하나만 켰을 때는 그 탭이 주던 전용 렌더러를 그대로 써요
  const renderEntry = useMemo(() => {
    if (selected.size !== 1) return undefined;
    return filterTabs.find((tab) => selected.has(tab.key))?.renderEntry;
  }, [filterTabs, selected]);

  const clearAll = () => {
    clearLogs();
    clearNetworks();
    clearPerformances();
  };

  const toggleFilterTab = (key: string) => {
    dismissFilterDropdown();
    setActiveContentTab(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  };

  const toggleContentTab = (key: string) => {
    dismissFilterDropdown();
    setActiveContentTab((prev) => (prev === key ? null : key));
  };

  const toggleLevel = (level: LogLevel) => {
    setEnabledLevels((prev) => {
      const next = new Set(prev);
      if (!next.delete(level)) next.add(level);
      return next;
    });
  };

  if (filterTabs.length === 0 && contentTabs.length === 0) {
    return null;
  }

  const renderBody = () => {
    if (activeTab && "renderContent" in activeTab) {
      return activeTab.renderContent();
    }
    if (networkOnly) {
      return (
        <NetworkPanel
          networks={networks}
          clearNetworks={clearAll}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      );
    }
    return (
      <LogPanel
        logs={filteredLogs}
        totalCount={entries.length}
        clearLogs={clearAll}
        renderEntry={renderEntry}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        levelFilter={
          showLevelFilter
            ? { enabled: enabledLevels, toggle: toggleLevel }
            : undefined
        }
      />
    );
  };

  return (
    <view className="cp-container">
      <MultiTabs
        items={filterTabs}
        selected={selected}
        onToggle={toggleFilterTab}
        contentTabs={contentTabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
        }))}
        activeContentTab={activeContentTab}
        onContentTabToggle={toggleContentTab}
      />
      {renderBody()}
      {/* 어떤 탭을 보고 있든 코드는 실행할 수 있어야 해요 */}
      <ReplInput />
    </view>
  );
};
