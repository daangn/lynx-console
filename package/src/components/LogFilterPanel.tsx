import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { LogEntry, LogFilter } from "../types";
import { matchesLogFilter } from "../utils/matchesLogFilter";
import "./ConsolePanel.css";
import { LogItem } from "./LogItem";

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
  const colors = useThemeColors();
  const [expandedArgs, setExpandedArgs] = useState(new Set<string>());
  const listRef = useRef<NodesRef>(null);

  const filteredLogs = useMemo(
    () => logs.filter((log) => matchesLogFilter(log, filter)),
    [logs, filter],
  );
  const logsRef = useRef(filteredLogs);
  logsRef.current = filteredLogs;

  useEffect(() => {
    if (logsRef.current.length === 0) return;
    listRef.current
      ?.invoke({
        method: "scrollToPosition",
        params: { position: logsRef.current.length - 1, smooth: true },
        fail: () => {},
      })
      .exec();
  }, [filteredLogs]);

  const toggleArg = (key: string) => {
    setExpandedArgs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <view className={"cp-logContainer"}>
      <list
        ref={listRef}
        scroll-orientation="vertical"
        className={"cp-logList"}
        preload-buffer-count={10}
        initial-scroll-index={Math.max(0, filteredLogs.length - 1)}
      >
        {filteredLogs.length === 0 ? (
          <list-item item-key="empty-state">
            <view className={"cp-placeholder"}>
              <text
                className={"cp-placeholderText t4"}
                style={{
                  fontWeight: fontWeight.regular,
                  color: colors.fg.disabled,
                }}
              >
                No matching logs yet.
              </text>
            </view>
          </list-item>
        ) : (
          filteredLogs.map((log) => (
            <list-item key={log.id} item-key={log.id}>
              {renderEntry ? (
                renderEntry(log)
              ) : (
                <LogItem
                  log={log}
                  expandedArgs={expandedArgs}
                  toggleArg={toggleArg}
                />
              )}
            </list-item>
          ))
        )}
      </list>
    </view>
  );
};
