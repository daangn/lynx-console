import { useEffect, useMemo, useRef, useState } from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { stringify } from "javascript-stringify";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight, type ThemeColors } from "../styles/theme";
import type { LogEntry, LogLevel } from "../types";
import "./ConsolePanel.css";

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

function getLevelColor(colors: ThemeColors, level: LogLevel): string {
  switch (level) {
    case "log":
      return colors.palette.green600;
    case "info":
      return colors.palette.blue600;
    case "warn":
      return colors.palette.yellow600;
    case "error":
      return colors.palette.red600;
  }
}

function getLogItemBg(
  colors: ThemeColors,
  level: LogLevel,
): string | undefined {
  switch (level) {
    case "warn":
      return colors.palette.yellow100;
    case "error":
      return colors.palette.red100;
    default:
      return undefined;
  }
}

function getStringColor(colors: ThemeColors, level: LogLevel): string {
  switch (level) {
    case "warn":
      return colors.palette.yellow900;
    case "error":
      return colors.palette.red900;
    default:
      return colors.fg.neutral;
  }
}

function getPrimitiveColor(colors: ThemeColors, level: LogLevel): string {
  switch (level) {
    case "warn":
      return colors.palette.yellow900;
    case "error":
      return colors.palette.red900;
    default:
      return colors.palette.blue600;
  }
}

export const LogPanel = ({ logs, clearLogs }: LogPanelProps) => {
  const colors = useThemeColors();
  const [expandedArgs, setExpandedArgs] = useState(new Set());
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
          return log.args.some((arg) =>
            String(arg).toLowerCase().includes(query),
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
      return (
        <text
          style={{
            color: colors.fg.neutralSubtle,
            fontWeight: fontWeight.regular,
          }}
        >
          null
        </text>
      );
    }

    if (arg === undefined) {
      return (
        <text
          style={{
            color: colors.fg.neutralSubtle,
            fontWeight: fontWeight.regular,
          }}
        >
          undefined
        </text>
      );
    }

    if (typeof arg === "string") {
      const MAX_LENGTH = 80;
      const shouldTruncate = arg.length > MAX_LENGTH;
      const strColor = getStringColor(colors, level);

      if (!shouldTruncate) {
        return (
          <text
            className={"cp-argString t3"}
            style={{ color: strColor, fontWeight: fontWeight.regular }}
          >
            {arg}
          </text>
        );
      }

      return (
        <view className={"cp-argObject"}>
          <view className={"cp-argObjectHeader"} bindtap={() => toggleArg(key)}>
            <text
              className={"cp-toggleIndicator t2"}
              style={{
                color: colors.fg.neutralSubtle,
                fontWeight: fontWeight.regular,
              }}
            >
              {isExpanded ? "▼" : "▶"}
            </text>
            <text
              className={"cp-argString t3"}
              style={{ color: strColor, fontWeight: fontWeight.regular }}
            >
              {isExpanded ? arg : `${arg.slice(0, MAX_LENGTH)}...`}
            </text>
          </view>
        </view>
      );
    }

    if (typeof arg === "number" || typeof arg === "boolean") {
      return (
        <text
          className={"cp-argPrimitive t3"}
          style={{
            color: getPrimitiveColor(colors, level),
            fontWeight: fontWeight.regular,
          }}
        >
          {String(arg)}
        </text>
      );
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
        <view className={"cp-argObject"}>
          <view className={"cp-argObjectHeader"} bindtap={() => toggleArg(key)}>
            <text
              className={"cp-toggleIndicator t2"}
              style={{
                color: colors.fg.neutralSubtle,
                fontWeight: fontWeight.regular,
              }}
            >
              {isExpanded ? "▼" : "▶"}
            </text>
            <text
              className={"cp-argObjectPreview t3"}
              style={{
                fontWeight: fontWeight.medium,
                color: colors.fg.neutral,
              }}
            >
              {preview}
            </text>
          </view>
          {isExpanded && (
            <view className={"cp-argObjectContent"}>
              <text
                className={"cp-argObjectJson t3"}
                style={{
                  fontWeight: fontWeight.regular,
                  color: colors.fg.neutral,
                }}
              >
                {jsonString}
              </text>
            </view>
          )}
        </view>
      );
    }

    return (
      <text
        className={"cp-argPrimitive t3"}
        style={{
          color: getPrimitiveColor(colors, level),
          fontWeight: fontWeight.regular,
        }}
      >
        {String(arg)}
      </text>
    );
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
          filteredLogs.map((log) => {
            return (
              <list-item key={log.id} item-key={log.id}>
                <view
                  className={"cp-logItem"}
                  style={{
                    backgroundColor: getLogItemBg(colors, log.level),
                    borderBottomColor: colors.stroke.neutralWeak,
                  }}
                >
                  <view className={"cp-logItemHeader"}>
                    <text
                      className={"cp-logLevel t2"}
                      style={{
                        fontWeight: fontWeight.bold,
                        color: getLevelColor(colors, log.level),
                      }}
                    >
                      {log.level.toUpperCase()}
                    </text>
                    <text
                      className={"cp-logTime t2"}
                      style={{
                        fontWeight: fontWeight.regular,
                        color: colors.fg.neutralSubtle,
                      }}
                    >
                      {new Date(log.timestamp).toISOString()}
                    </text>
                  </view>
                  <view className={"cp-logArgsContainer"}>
                    {log.args.map((arg, index) => (
                      <view
                        key={`${log.id}-${index.toString()}`}
                        className={"cp-logArgItem"}
                        style={{ fontWeight: fontWeight.regular }}
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
