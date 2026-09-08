import { stringify } from "javascript-stringify";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight, type ThemeColors } from "../styles/theme";
import type { LogEntry, LogLevel } from "../types";
import {
  getNetworkLogEntry,
  getPerformanceLogEntry,
} from "../utils/networkLog";
import { parseConsoleArgs } from "../utils/parseFormat";
import "./ConsolePanel.css";
import { NetworkLogRow } from "./NetworkLogRow";
import { PerformanceLogRow } from "./PerformanceLogRow";

export function getLevelColor(colors: ThemeColors, level: LogLevel): string {
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

interface LogItemProps {
  log: LogEntry;
  expandedArgs: Set<string>;
  toggleArg: (key: string) => void;
}

// Log 탭과 필터 탭이 같이 쓰는 로그 한 줄이에요
export const LogItem = ({ log, expandedArgs, toggleArg }: LogItemProps) => {
  const colors = useThemeColors();

  // 네트워크 모니터가 찍은 로그는 Network 탭 항목과 같은 UI 로 보여줘요
  const network = getNetworkLogEntry(log);
  if (network) {
    const key = `${log.id}-network`;
    return (
      <NetworkLogRow
        network={network}
        expanded={expandedArgs.has(key)}
        onToggle={() => toggleArg(key)}
      />
    );
  }

  // 성능 모니터가 찍은 로그는 Perf 탭 항목과 같은 UI 로 보여줘요
  const perf = getPerformanceLogEntry(log);
  if (perf) {
    const key = `${log.id}-performance`;
    return (
      <PerformanceLogRow
        perf={perf}
        expanded={expandedArgs.has(key)}
        onToggle={() => toggleArg(key)}
      />
    );
  }

  const renderArg = (
    arg: unknown,
    parentKey: string,
    level: LogLevel,
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

  const { segments, rest } = parseConsoleArgs(log.args);
  const baseTextStyle = {
    color: getStringColor(colors, log.level),
    fontWeight: fontWeight.regular,
  };
  const wrap = (key: string, content: React.ReactNode) => (
    <view
      key={key}
      className={"cp-logArgItem"}
      style={{ fontWeight: fontWeight.regular }}
    >
      {content}
    </view>
  );

  return (
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
        {segments.map((seg, index) => {
          const key = `${log.id}-seg-${index.toString()}`;
          return wrap(
            key,
            seg.type === "text" ? (
              <text
                className={"cp-argString t3"}
                style={{ ...baseTextStyle, ...seg.style }}
              >
                {seg.text}
              </text>
            ) : (
              renderArg(seg.value, key, log.level)
            ),
          );
        })}
        {rest.map((arg, index) => {
          const key = `${log.id}-rest-${index.toString()}`;
          return wrap(key, renderArg(arg, key, log.level));
        })}
      </view>
    </view>
  );
};
