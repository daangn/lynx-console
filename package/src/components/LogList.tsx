import { type ReactNode, useEffect, useRef, useState } from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { LogEntry } from "../types";
import "./ConsolePanel.css";
import { LogItem } from "./LogItem";

interface LogListProps {
  logs: LogEntry[];
  emptyText: string;
  renderEntry?: ((entry: LogEntry) => ReactNode) | undefined;
}

// Log 탭과 필터 탭이 같이 쓰는 로그 목록이에요. 펼침 상태와 맨 아래 스크롤을 여기서 들어요
export const LogList = ({ logs, emptyText, renderEntry }: LogListProps) => {
  const colors = useThemeColors();
  const [expandedArgs, setExpandedArgs] = useState(new Set<string>());
  const listRef = useRef<NodesRef>(null);

  const lastId = logs[logs.length - 1]?.id;

  // 새 로그가 붙거나 목록이 바뀌었을 때만 맨 아래로 내려요
  useEffect(() => {
    if (logs.length === 0) return;
    listRef.current
      ?.invoke({
        method: "scrollToPosition",
        params: { position: logs.length - 1, smooth: true },
        // 연속 로그로 진행 중이던 smooth 스크롤이 중단될 때 나는 무해한 경고를 무시
        fail: () => {},
      })
      .exec();
  }, [logs.length, lastId]);

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
    <list
      ref={listRef}
      scroll-orientation="vertical"
      className={"cp-logList"}
      preload-buffer-count={10}
      initial-scroll-index={Math.max(0, logs.length - 1)}
    >
      {logs.length === 0 ? (
        <list-item item-key="empty-state">
          <view className={"cp-placeholder"}>
            <text
              className={"cp-placeholderText t4"}
              style={{
                fontWeight: fontWeight.regular,
                color: colors.fg.disabled,
              }}
            >
              {emptyText}
            </text>
          </view>
        </list-item>
      ) : (
        logs.map((log) => (
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
  );
};
