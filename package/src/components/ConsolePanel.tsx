import type { ReactNode } from "@lynx-js/react";
import { useConsole, useNetwork, usePerformance } from "../hooks";
import type { CustomTab } from "../types";
import "./ConsolePanel.css";
import { dismissFilterDropdown, LogPanel } from "./LogPanel";
import { NetworkPanel } from "./NetworkPanel";
import { PerformancePanel } from "./PerformancePanel";
import Tabs from "./Tabs";

interface ConsolePanelProps {
  customTabs?: CustomTab[];
}

export const ConsolePanel = ({ customTabs }: ConsolePanelProps) => {
  const { logs, clearLogs } = useConsole();
  const { networks, clearNetworks } = useNetwork();
  const { performances, clearPerformances } = usePerformance();

  const state = globalThis.__LYNX_CONSOLE__?.state;

  const items: Array<{
    key: string;
    label: string;
    renderContent: () => ReactNode;
  }> = [];

  if (state?.logs) {
    items.push({
      key: "log",
      label: "Log",
      renderContent: () => <LogPanel logs={logs} clearLogs={clearLogs} />,
    });
  }

  if (state?.networks) {
    items.push({
      key: "network",
      label: "Network",
      renderContent: () => (
        <NetworkPanel networks={networks} clearNetworks={clearNetworks} />
      ),
    });
  }

  if (state?.performances) {
    items.push({
      key: "performance",
      label: "Perf",
      renderContent: () => (
        <PerformancePanel
          performances={performances}
          clearPerformances={clearPerformances}
        />
      ),
    });
  }

  if (customTabs) {
    for (const tab of customTabs) {
      items.push({
        key: tab.key,
        label: tab.label,
        renderContent: tab.renderContent,
      });
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <view className="cp-container">
      <Tabs onTabChange={dismissFilterDropdown} items={items} />
    </view>
  );
};
