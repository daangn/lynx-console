import { useEffect, useMemo, useRef, useState } from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { LogEntry, LogLevel } from "../types";
import { getLogSearchStrings } from "../utils/matchesLogFilter";
import "./ConsolePanel.css";
import { getLevelColor, LogItem } from "./LogItem";

const LOG_LEVELS: LogLevel[] = ["log", "info", "warn", "error"];

let savedEnabledLevels: Set<LogLevel> | null = null;
let savedSearchQuery = "";
let closeFilterDropdown: (() => void) | null = null;

export const dismissFilterDropdown = () => closeFilterDropdown?.();

interface LogPanelProps {
  logs: LogEntry[];
  clearLogs: () => void;
}

const runCode = (code: string) => {
  try {
    // biome-ignore lint: intentional REPL tool
    const result = eval(code);
    if (result instanceof Promise) {
      result.then((r) => console.log(r)).catch((e) => console.error(e));
    } else {
      console.log(result);
    }
  } catch (e) {
    console.error(e);
  }
};

export const LogPanel = ({ logs, clearLogs }: LogPanelProps) => {
  const colors = useThemeColors();
  const [expandedArgs, setExpandedArgs] = useState(new Set<string>());
  const [code, setCode] = useState("");
  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(
    () => savedEnabledLevels ?? new Set(LOG_LEVELS),
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(savedSearchQuery);
  const inputRef = useRef<NodesRef>(null);
  const searchInputRef = useRef<NodesRef>(null);
  const listRef = useRef<NodesRef>(null);

  useEffect(() => {
    savedEnabledLevels = enabledLevels;
  }, [enabledLevels]);

  useEffect(() => {
    savedSearchQuery = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    if (savedSearchQuery) {
      searchInputRef.current
        ?.invoke({ method: "setValue", params: { value: savedSearchQuery } })
        .exec();
    }
  }, []);

  useEffect(() => {
    closeFilterDropdown = () => setFilterOpen(false);
    return () => {
      closeFilterDropdown = null;
    };
  }, []);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        if (!enabledLevels.has(log.level)) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return getLogSearchStrings(log).some((text) =>
            text.toLowerCase().includes(query),
          );
        }
        return true;
      }),
    [logs, enabledLevels, searchQuery],
  );
  const logsRef = useRef(filteredLogs);
  logsRef.current = filteredLogs;

  const toggleLevel = (level: LogLevel) => {
    setEnabledLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const scrollToBottom = (smooth: boolean) => {
    if (logsRef.current.length === 0) return;
    listRef.current
      ?.invoke({
        method: "scrollToPosition",
        params: { position: logsRef.current.length - 1, smooth },
        // 연속 로그로 진행 중이던 smooth 스크롤이 중단될 때 나는 무해한 경고를 무시
        fail: () => {},
      })
      .exec();
  };

  useEffect(() => {
    scrollToBottom(true);
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

  const handleRun = () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setCode("");
    inputRef.current
      ?.invoke({ method: "setValue", params: { value: "" } })
      .exec();
    runCode(trimmed);
  };

  return (
    <view
      className={"cp-logContainer"}
      bindtap={() => {
        if (filterOpen) setFilterOpen(false);
      }}
    >
      <view className={"cp-logHeader"}>
        <view className={"cp-filterWrapper"}>
          <view
            className={"cp-filterButton"}
            style={{ backgroundColor: colors.bg.neutralWeak }}
            catchtap={() => setFilterOpen((v) => !v)}
          >
            <text
              className={"cp-filterButtonText t3"}
              style={{
                fontWeight: fontWeight.medium,
                color: colors.fg.neutralMuted,
              }}
            >
              Filter ▼
            </text>
          </view>
          {filterOpen && (
            <view
              className={"cp-filterDropdown"}
              style={{
                backgroundColor: colors.bg.layerFloating,
                borderColor: colors.stroke.neutralSubtle,
              }}
              catchtap={() => {}}
            >
              {LOG_LEVELS.map((level) => (
                <view
                  key={level}
                  className={"cp-filterOption"}
                  bindtap={() => toggleLevel(level)}
                >
                  <text
                    className={"cp-filterCheckbox t3"}
                    style={{
                      fontWeight: fontWeight.medium,
                      color: getLevelColor(colors, level),
                    }}
                  >
                    {enabledLevels.has(level) ? "✅" : "⬜"}
                  </text>
                  <text
                    className={"cp-filterLabel t3"}
                    style={{
                      fontWeight: fontWeight.medium,
                      color: getLevelColor(colors, level),
                    }}
                  >
                    {level.toUpperCase()}
                  </text>
                </view>
              ))}
            </view>
          )}
        </view>
        <view
          className={"cp-searchWrapper"}
          style={{ borderBottomColor: colors.stroke.neutralSubtle }}
        >
          <text
            className={"cp-searchPrompt t6"}
            style={{
              fontWeight: fontWeight.medium,
              color: colors.fg.placeholder,
            }}
          >
            {"›"}
          </text>
          <input
            ref={searchInputRef}
            className={"cp-searchInput t3"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.neutral,
              caretColor: colors.palette.green600,
            }}
            placeholder="Search logs..."
            bindinput={(e: BaseEvent<"bindinput", InputInputEvent>) =>
              setSearchQuery(e.detail.value)
            }
          />
          {searchQuery.length > 0 && (
            <view
              className={"cp-searchClear"}
              bindtap={() => {
                setSearchQuery("");
                searchInputRef.current
                  ?.invoke({ method: "setValue", params: { value: "" } })
                  .exec();
              }}
            >
              <text
                className={"cp-searchClearText t3"}
                style={{
                  fontWeight: fontWeight.medium,
                  color: colors.fg.placeholder,
                }}
              >
                ✕
              </text>
            </view>
          )}
        </view>
        <view style={{ display: "flex", flexDirection: "row", gap: 8 }}>
          <view
            className={"cp-clearButton"}
            style={{ backgroundColor: colors.bg.neutralWeak }}
            bindtap={clearLogs}
          >
            <text
              className={"cp-clearButtonText t3"}
              style={{
                fontWeight: fontWeight.medium,
                color: colors.fg.neutralMuted,
              }}
            >
              🗑
            </text>
          </view>
        </view>
      </view>
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
                No logs yet. Try console.log("Hello!")
              </text>
            </view>
          </list-item>
        ) : (
          filteredLogs.map((log) => (
            <list-item key={log.id} item-key={log.id}>
              <LogItem
                log={log}
                expandedArgs={expandedArgs}
                toggleArg={toggleArg}
              />
            </list-item>
          ))
        )}
      </list>
      <view className={"cp-replInputRow"}>
        <text
          className={"cp-replPrompt t10"}
          style={{
            fontWeight: fontWeight.medium,
            color: colors.fg.placeholder,
          }}
        >
          {"›"}
        </text>
        <input
          ref={inputRef}
          className={"cp-replInput t5"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutral,
            caretColor: colors.palette.green600,
          }}
          placeholder="enter code..."
          bindinput={(e: BaseEvent<"bindinput", InputInputEvent>) =>
            setCode(e.detail.value)
          }
          bindconfirm={handleRun}
        />
        <view
          className={"cp-replRunButton"}
          style={{ backgroundColor: colors.palette.green100 }}
          bindtap={handleRun}
        >
          <text
            className={"cp-replRunButtonText t3"}
            style={{
              fontWeight: fontWeight.medium,
              color: colors.palette.green600,
            }}
          >
            Run
          </text>
        </view>
      </view>
    </view>
  );
};
