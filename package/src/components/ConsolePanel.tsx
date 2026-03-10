import { useConsole, useNetwork, usePerformance } from "../hooks";
import * as css from "./ConsolePanel.css";
import { LogPanel } from "./LogPanel";
import { NetworkPanel } from "./NetworkPanel";
import { PerformancePanel } from "./PerformancePanel";
import Tabs from "./Tabs";

export const ConsolePanel = () => {
  const { logs, clearLogs } = useConsole();
  const { networks, clearNetworks } = useNetwork();
  const { performances, clearPerformances } = usePerformance();

  return (
    <view className={css.container}>
      <Tabs
        items={[
          {
            key: "log",
            label: "Log",
            renderContent: () => <LogPanel logs={logs} clearLogs={clearLogs} />,
          },
          {
            key: "network",
            label: "Network",
            renderContent: () => <NetworkPanel networks={networks} clearNetworks={clearNetworks} />,
          },
          {
            key: "performance",
            label: "Performance",
            renderContent: () => (
              <PerformancePanel
                performances={performances}
                clearPerformances={clearPerformances}
              />
            ),
          },
        ]}
      />
    </view>
  );
};
