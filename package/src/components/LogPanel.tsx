import {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "@lynx-js/react";
import type { BaseEvent, InputInputEvent, NodesRef } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import type { LogEntry, LogLevel } from "../types";
import { matchesSearchQuery } from "../utils/logSearch";
import "./ConsolePanel.css";
import { getLevelColor } from "./LogItem";
import { LogList } from "./LogList";

export const LOG_LEVELS: LogLevel[] = ["log", "info", "warn", "error"];

let closeFilterDropdown: (() => void) | null = null;

export const dismissFilterDropdown = () => closeFilterDropdown?.();

interface LevelFilter {
  enabled: Set<LogLevel>;
  toggle: (level: LogLevel) => void;
}

interface LogPanelProps {
  allEntries: LogEntry[];
  // 필터 탭 · 레벨로 이미 걸러진 로그예요
  logs: LogEntry[];
  // 필터 전 전체 개수예요. "3 / 42" 로 지금 얼마나 좁혔는지 보여줘요
  totalCount: number;
  clearLogs: () => void;
  renderEntry?: ((entry: LogEntry) => ReactNode) | undefined;
  // 주면 레벨 드롭다운을 그려요. Log 탭을 켰을 때만 와요
  levelFilter?: LevelFilter | undefined;
  // Network 전용 화면과 같은 검색어를 써요
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export const LogPanel = ({
  logs,
  allEntries,
  totalCount,
  clearLogs,
  renderEntry,
  levelFilter,
  searchQuery,
  setSearchQuery,
}: LogPanelProps) => {
  const colors = useThemeColors();
  const [filterOpen, setFilterOpen] = useState(false);
  const searchInputRef = useRef<NodesRef>(null);

  useEffect(() => {
    if (searchQuery) {
      searchInputRef.current
        ?.invoke({ method: "setValue", params: { value: searchQuery } })
        .exec();
    }
  }, []);

  useEffect(() => {
    closeFilterDropdown = () => setFilterOpen(false);
    return () => {
      closeFilterDropdown = null;
    };
  }, []);

  // 드롭다운이 사라지는 동안 열린 채로 남지 않게 해요
  useEffect(() => {
    if (!levelFilter) setFilterOpen(false);
  }, [levelFilter]);

  const visibleLogs = useMemo(
    () => logs.filter((log) => matchesSearchQuery(log, searchQuery)),
    [logs, searchQuery],
  );

  const isFiltered = visibleLogs.length !== totalCount;

  return (
    <view
      className={"cp-logContainer"}
      bindtap={() => {
        if (filterOpen) setFilterOpen(false);
      }}
    >
      <view className={"cp-logHeader"}>
        {levelFilter && (
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
                    bindtap={() => levelFilter.toggle(level)}
                  >
                    <text
                      className={"cp-filterCheckbox t3"}
                      style={{
                        fontWeight: fontWeight.medium,
                        color: getLevelColor(colors, level),
                      }}
                    >
                      {levelFilter.enabled.has(level) ? "✅" : "⬜"}
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
        )}
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
            placeholder="Search logs, url, request & response..."
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
        <text
          className={"cp-logCount t2"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutralSubtle,
          }}
        >
          {isFiltered
            ? `${visibleLogs.length} / ${totalCount}`
            : String(totalCount)}
        </text>
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
      <LogList
        logs={visibleLogs}
        allEntries={allEntries}
        emptyText={
          totalCount === 0
            ? 'No logs yet. Try console.log("Hello!")'
            : "No logs match the current filter."
        }
        renderEntry={renderEntry}
        searchQuery={searchQuery}
      />
    </view>
  );
};
