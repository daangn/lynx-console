import { type ReactNode, useEffect, useRef, useState } from "@lynx-js/react";
import type {
  ListScrollEvent,
  ListScrollStateChangeEvent,
  NodesRef,
} from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { LogEntry } from "../types";
import "./ConsolePanel.css";
import { LogItem } from "./LogItem";

// 이 픽셀 안쪽이면 "맨 아래" 로 봐요
const BOTTOM_THRESHOLD = 24;

interface LogListProps {
  logs: LogEntry[];
  allEntries?: LogEntry[] | undefined;
  emptyText: string;
  renderEntry?: ((entry: LogEntry) => ReactNode) | undefined;
  searchQuery?: string | undefined;
}

// Log 탭과 필터 탭이 같이 쓰는 로그 목록이에요. 펼침 상태와 맨 아래 스크롤을 여기서 들어요
export const LogList = ({
  logs,
  allEntries = logs,
  emptyText,
  renderEntry,
  searchQuery = "",
}: LogListProps) => {
  const colors = useThemeColors();
  const [expandedArgs, setExpandedArgs] = useState(new Set<string>());
  // 맨 아래에 붙어 따라갈지 여부예요. 위로 올려 읽는 중이면 풀려요
  const [pinned, setPinned] = useState(true);
  const listRef = useRef<NodesRef>(null);
  // 필터로 숨겨진 항목도 기록해서, 다시 나타나도 새 로그로 세지 않아요.
  const entriesAtLockRef = useRef(new Set<string>());
  // 이벤트 직후 들어온 로그도 잠금을 따르도록 state와 함께 즉시 갱신해요.
  const pinnedRef = useRef(true);
  const draggingRef = useRef(false);
  const atBottomRef = useRef(true);

  const lastId = logs[logs.length - 1]?.id;

  const updatePinned = (next: boolean) => {
    if (!next && pinnedRef.current) {
      entriesAtLockRef.current = new Set(allEntries.map((entry) => entry.id));
    }
    pinnedRef.current = next;
    setPinned(next);
  };

  const scrollToBottom = () => {
    if (logs.length === 0) return;
    listRef.current
      ?.invoke({
        method: "scrollToPosition",
        // 연속 로그가 사용자 입력과 경쟁하는 스크롤 애니메이션을 만들지 않아요.
        params: { position: logs.length - 1, smooth: false },
        fail: () => {},
      })
      .exec();
  };

  const handleScroll = (e: ListScrollEvent) => {
    const { deltaY, scrollTop, scrollHeight, listHeight } = e.detail;
    const hasDimensions = listHeight > 0;
    atBottomRef.current = hasDimensions
      ? scrollHeight - listHeight - scrollTop <= BOTTOM_THRESHOLD
      : false;

    // 위로 이동하면 바닥 근처여도 바로 잠가요. 시간에 따른 무시 구간은 없어요.
    if (deltaY < 0) {
      updatePinned(false);
      return;
    }
    if (draggingRef.current) return;
    // 데이터 추가로 바닥이 멀어진 것만으로는 따라가기를 끄지 않아요.
    if (deltaY > 0 && atBottomRef.current) updatePinned(true);
  };

  const handleScrollStateChange = (e: ListScrollStateChangeEvent) => {
    // ListScrollState: 2=사용자 드래그, 1=정지. 타입 패키지의 런타임 import는 피해야 해요.
    if (e.detail.state === 2) {
      draggingRef.current = true;
      updatePinned(false);
    } else if (e.detail.state === 1) {
      draggingRef.current = false;
      if (atBottomRef.current) updatePinned(true);
    }
  };

  // pinnedRef는 렌더 직후 드래그가 시작돼도 이 effect의 자동 이동을 막아요.
  useEffect(() => {
    if (!pinnedRef.current || draggingRef.current) return;
    scrollToBottom();
  }, [logs.length, lastId, pinned]);

  // 검색어가 바뀌면 펼침 상태를 새로 시작해요(매치된 줄이 자동으로 펼쳐져요)
  useEffect(() => {
    setExpandedArgs(new Set());
  }, [searchQuery]);

  const newCount = pinned
    ? 0
    : logs.filter((log) => !entriesAtLockRef.current.has(log.id)).length;

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
    <view className={"cp-logListWrapper"}>
      <list
        ref={listRef}
        scroll-orientation="vertical"
        className={"cp-logList"}
        preload-buffer-count={10}
        initial-scroll-index={Math.max(0, logs.length - 1)}
        lower-threshold-item-count={1}
        bindscroll={handleScroll}
        bindscrollstatechange={handleScrollStateChange}
        bindscrolltolower={() => {
          atBottomRef.current = true;
          if (!draggingRef.current) updatePinned(true);
        }}
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
                  searchQuery={searchQuery}
                />
              )}
            </list-item>
          ))
        )}
      </list>
      {!pinned && (
        <view className={"cp-jumpToBottomRow"}>
          <view
            className={
              newCount > 0 ? "cp-jumpToBottom" : "cp-jumpToBottom--icon"
            }
            style={{
              backgroundColor: colors.bg.layerFloating,
              borderColor: colors.stroke.neutralWeak,
            }}
            bindtap={() => {
              draggingRef.current = false;
              updatePinned(true);
              scrollToBottom();
            }}
          >
            <text
              className={"cp-jumpToBottomText t3"}
              style={{
                fontWeight: fontWeight.medium,
                color: colors.fg.neutralMuted,
              }}
            >
              {newCount > 0 ? `${newCount} new ↓` : "↓"}
            </text>
          </view>
        </view>
      )}
    </view>
  );
};
