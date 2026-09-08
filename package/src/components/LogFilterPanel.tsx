import { type ReactNode, useMemo } from "@lynx-js/react";
import type { LogEntry, LogFilter } from "../types";
import { matchesLogFilter } from "../utils/matchesLogFilter";
import "./ConsolePanel.css";
import { LogList } from "./LogList";

interface LogFilterPanelProps {
  logs: LogEntry[];
  filter: LogFilter;
  renderEntry?: ((entry: LogEntry) => ReactNode) | undefined;
}

// 전체 콘솔 로그 중 filter 에 맞는 것만 모아 보여주는 커스텀 탭 본문이에요
export const LogFilterPanel = ({
  logs,
  filter,
  renderEntry,
}: LogFilterPanelProps) => {
  const filteredLogs = useMemo(
    () => logs.filter((log) => matchesLogFilter(log, filter)),
    [logs, filter],
  );

  return (
    <view className={"cp-logContainer"}>
      <LogList
        logs={filteredLogs}
        emptyText="No matching logs yet."
        renderEntry={renderEntry}
      />
    </view>
  );
};
