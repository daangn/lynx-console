import { useEffect, useMemo, useRef, useState } from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { stringify } from "javascript-stringify";
import type { LogEntry, LogLevel } from "../types";
import { vars } from "../styles/vars";
import * as css from "./ConsolePanel.css";

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
  const [expandedArgs, setExpandedArgs] = useState(new Set());
  const [code, setCode] = useState("");
  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(
    () => savedEnabledLevels ?? new Set(LOG_LEVELS),
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(savedSearchQuery);
  const [fadeState, setFadeState] = useState({ atTop: true, atBottom: true });
  const fadeRef = useRef({ atTop: true, atBottom: true });
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
    return () => { closeFilterDropdown = null; };
  }, []);

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        if (!enabledLevels.has(log.level)) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return log.args.some((arg) => String(arg).toLowerCase().includes(query));
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
    setTimeout(() => scrollToBottom(false), 100);
  };

  const renderArg = (
    arg: unknown,
    parentKey: string,
    level: "log" | "info" | "warn" | "error",
  ): React.ReactNode => {
    const key = parentKey;
    const isExpanded = expandedArgs.has(key);

    if (arg === null) {
      return <text className={css.argNull}>null</text>;
    }

    if (arg === undefined) {
      return <text className={css.argUndefined}>undefined</text>;
    }

    if (typeof arg === "string") {
      const MAX_LENGTH = 80;
      const shouldTruncate = arg.length > MAX_LENGTH;

      if (!shouldTruncate) {
        return <text className={css.argString({ level })}>{arg}</text>;
      }

      // 문자열이 길 경우 토글 버튼 추가
      return (
        <view className={css.argObject}>
          <view className={css.argObjectHeader} bindtap={() => toggleArg(key)}>
            <text className={css.toggleIndicator}>
              {isExpanded ? "▼" : "▶"}
            </text>
            <text className={css.argString({ level })}>
              {isExpanded ? arg : `${arg.slice(0, MAX_LENGTH)}...`}
            </text>
          </view>
        </view>
      );
    }

    if (typeof arg === "number" || typeof arg === "boolean") {
      return <text className={css.argPrimitive({ level })}>{String(arg)}</text>;
    }

    if (typeof arg === "object") {
      let preview = "Object";
      if (Array.isArray(arg)) {
        preview = `Array(${arg.length})`;
      } else if (arg instanceof Map) {
        preview = `Map(${arg.size})`;
      } else if (arg instanceof Set) {
        preview = `Set(${arg.size})`;
      } else if (arg instanceof Date) {
        preview = `Date`;
      } else if (arg instanceof RegExp) {
        preview = `RegExp`;
      } else if (arg instanceof Error) {
        preview = `${arg.constructor.name}`;
      } else if (arg?.constructor?.name && arg.constructor.name !== "Object") {
        preview = arg.constructor.name;
      }

      let jsonString: string;
      if (arg instanceof Map) {
        const entries = Array.from(arg.entries()).map(
          ([k, v]) => `  [${stringify(k)}, ${stringify(v)}]`,
        );
        jsonString = `{\n${entries.join(",\n")}\n}`;
      } else if (arg instanceof Set) {
        const values = Array.from(arg.values()).map((v) => stringify(v));
        jsonString = `{\n${values.join(", ")}\n}`;
      } else {
        jsonString =
          stringify(arg, null, 2, { references: true }) ?? String(arg);
      }

      return (
        <view className={css.argObject}>
          <view className={css.argObjectHeader} bindtap={() => toggleArg(key)}>
            <text className={css.toggleIndicator}>
              {isExpanded ? "▼" : "▶"}
            </text>
            <text className={css.argObjectPreview}>{preview}</text>
          </view>
          {isExpanded && (
            <view className={css.argObjectContent}>
              <text className={css.argObjectJson}>{jsonString}</text>
            </view>
          )}
        </view>
      );
    }

    return <text className={css.argPrimitive({ level })}>{String(arg)}</text>;
  };

  return (
    <view
      className={css.logContainer}
      bindtap={() => { if (filterOpen) setFilterOpen(false); }}
    >
      <view className={css.logHeader}>
        <view className={css.filterWrapper}>
          <view
            className={css.filterButton}
            catchtap={() => setFilterOpen((v) => !v)}
          >
            <text className={css.filterButtonText}>Filter  ▼</text>
          </view>
          {filterOpen && (
            <view className={css.filterDropdown} catchtap={() => {}}>
              {LOG_LEVELS.map((level) => (
                <view
                  key={level}
                  className={css.filterOption}
                  bindtap={() => toggleLevel(level)}
                >
                  <text className={css.filterCheckbox({ level })}>
                    {enabledLevels.has(level) ? "✅" : "⬜"}
                  </text>
                  <text className={css.filterLabel({ level })}>
                    {level.toUpperCase()}
                  </text>
                </view>
              ))}
            </view>
          )}
        </view>
        <view className={css.searchWrapper}>
          <text className={css.searchPrompt}>{"›"}</text>
          <input
            ref={searchInputRef}
            className={css.searchInput}
            placeholder="Search logs..."
            bindinput={(e: BaseEvent<"bindinput", InputInputEvent>) =>
              setSearchQuery(e.detail.value)
            }
          />
          {searchQuery.length > 0 && (
            <view
              className={css.searchClear}
              bindtap={() => {
                setSearchQuery("");
                searchInputRef.current
                  ?.invoke({ method: "setValue", params: { value: "" } })
                  .exec();
              }}
            >
              <text className={css.searchClearText}>✕</text>
            </view>
          )}
        </view>
        <view style={{ display: "flex", flexDirection: "row", gap: 8 }}>
          <view className={css.clearButton} bindtap={clearLogs}>
            <text className={css.clearButtonText}>🗑</text>
          </view>
        </view>
      </view>
      <view
        className={css.fadeTop}
        style={{
          background: fadeState.atTop
            ? `linear-gradient(to bottom, #ffffff00, #ffffff00)`
            : `linear-gradient(to bottom, ${vars.$color.bg.layerDefault}, #ffffff00)`,
        }}
      />
      <list
        ref={listRef}
        scroll-orientation="vertical"
        className={css.logList}
        preload-buffer-count={10}
        initial-scroll-index={Math.max(0, filteredLogs.length - 1)}
        scroll-event-throttle={16}
        bindscroll={(e: BaseEvent<"bindscroll", { scrollTop: number; scrollHeight: number; listHeight: number }>) => {
          const { scrollTop, scrollHeight, listHeight } = e.detail;
          const atTop = scrollTop <= 10;
          const atBottom = scrollTop + listHeight >= scrollHeight - 10;
          if (atTop !== fadeRef.current.atTop || atBottom !== fadeRef.current.atBottom) {
            fadeRef.current.atTop = atTop;
            fadeRef.current.atBottom = atBottom;
            setFadeState({ atTop, atBottom });
          }
        }}
      >
        {filteredLogs.length === 0 ? (
          <list-item item-key="empty-state">
            <view className={css.placeholder}>
              <text className={css.placeholderText}>
                No logs yet. Try console.log("Hello!")
              </text>
            </view>
          </list-item>
        ) : (
          filteredLogs.map((log) => {
            return (
              <list-item key={log.id} item-key={log.id}>
                <view className={css.logItem({ level: log.level })}>
                  <view className={css.logItemHeader}>
                    <text className={css.logLevel({ level: log.level })}>
                      {log.level.toUpperCase()}
                    </text>
                    <text className={css.logTime}>
                      {new Date(log.timestamp).toISOString()}
                    </text>
                  </view>
                  <view className={css.logArgsContainer}>
                    {log.args.map((arg, index) => (
                      <view
                        key={`${log.id}-${index.toString()}`}
                        className={css.logArgItem}
                      >
                        {renderArg(
                          arg,
                          `${log.id}-${index.toString()}`,
                          log.level,
                        )}
                      </view>
                    ))}
                  </view>
                </view>
              </list-item>
            );
          })
        )}
      </list>
      <view
        className={css.fadeBottom}
        style={{
          background: fadeState.atBottom
            ? `linear-gradient(to top, #ffffff00, #ffffff00)`
            : `linear-gradient(to top, ${vars.$color.bg.layerDefault}, #ffffff00)`,
        }}
      />
      <view className={css.replInputRow}>
        <text className={css.replPrompt}>{"›"}</text>
        <input
          ref={inputRef}
          className={css.replInput}
          placeholder="enter code..."
          bindinput={(e: BaseEvent<"bindinput", InputInputEvent>) =>
            setCode(e.detail.value)
          }
          bindconfirm={handleRun}
        />
        <view className={css.replRunButton} bindtap={handleRun}>
          <text className={css.replRunButtonText}>Run</text>
        </view>
      </view>
    </view>
  );
};
