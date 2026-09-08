import type { NetworkEntry, PerformanceEntryData } from "../types";

// console 요약 줄에 쓰는 %c 스타일이에요. lynx-console Log 탭과 Lynx DevTool Console 이 같은 모양으로 그려요.
// 테마 객체를 끌어오지 않도록 라이트 팔레트 값을 직접 써요
const CHIP = "padding:1px 4px;border-radius:3px;font-weight:bold;";
const METHOD_CHIP: Record<string, string> = {
  GET: `${CHIP}background:#eff6ff;color:#5e98fe`,
  POST: `${CHIP}background:#edfaf6;color:#10ab7d`,
  PUT: `${CHIP}background:#fff7de;color:#c49725`,
  PATCH: `${CHIP}background:#f5f3fe;color:#9f84fb`,
  DELETE: `${CHIP}background:#fdf0f0;color:#fc6a66`,
};
const DEFAULT_METHOD_CHIP = `${CHIP}background:#f3f4f5;color:#1a1c20`;
// Perf 탭의 entryType 색과 맞춰요
const ENTRY_TYPE_CHIP: Record<string, string> = {
  init: `${CHIP}background:#eff6ff;color:#5e98fe`,
  metric: `${CHIP}background:#edfaf6;color:#10ab7d`,
  pipeline: `${CHIP}background:#f5f3fe;color:#9f84fb`,
  resource: `${CHIP}background:#fff7de;color:#c49725`,
};
const DEFAULT_ENTRY_TYPE_CHIP = `${CHIP}background:#f3f4f5;color:#1a1c20`;
const FCP_TEXT = "color:#5e98fe;font-weight:bold";
const BRAND_CHIP = `${CHIP}background:#edfaf6;color:#10ab7d`;

const STATUS_OK = "color:#10ab7d;font-weight:bold";
const STATUS_FAIL = "color:#fc6a66;font-weight:bold";
const MUTED = "color:#868b94";
const RESET = "";

export type ConsoleArgs = [string, ...string[]];

// URL 이나 이름 안의 % 가 %c·%d 같은 서식 지정자로 읽히지 않게 해요
const escapePercent = (text: string): string => text.replace(/%/g, "%%");

const networkStatusText = (entry: NetworkEntry): string =>
  entry.status === "error" ? "ERR" : String(entry.statusCode ?? "-");

const isOk = (entry: NetworkEntry): boolean =>
  entry.status !== "error" &&
  entry.statusCode !== undefined &&
  entry.statusCode >= 200 &&
  entry.statusCode < 300;

// "GET 200 https://… 123ms" 를 메서드 칩·상태색·회색 소요시간으로 꾸며요
export const formatNetworkConsoleArgs = (entry: NetworkEntry): ConsoleArgs => [
  `%c${escapePercent(entry.method)}%c ${networkStatusText(entry)}%c ${escapePercent(entry.url)}%c ${entry.duration ?? 0}ms`,
  METHOD_CHIP[entry.method.toUpperCase()] ?? DEFAULT_METHOD_CHIP,
  isOk(entry) ? STATUS_OK : STATUS_FAIL,
  RESET,
  MUTED,
];

// %c 를 못 그리는 곳(logcat, CI 로그, 텍스트만 읽는 에이전트)용 한 줄이에요
export const formatNetworkPlain = (entry: NetworkEntry): string =>
  `${entry.method} ${networkStatusText(entry)} ${entry.url} ${entry.duration ?? 0}ms`;

// "pipeline loadBundle FCP 812.34ms" 를 entryType 칩·이름·파란 FCP 로 꾸며요
export const formatPerformanceConsoleArgs = (
  entry: PerformanceEntryData,
  fcpMs: number | undefined,
): ConsoleArgs => {
  const chip = ENTRY_TYPE_CHIP[entry.entryType] ?? DEFAULT_ENTRY_TYPE_CHIP;
  const name = escapePercent(entry.name);
  if (fcpMs === undefined) {
    return [`%c${entry.entryType}%c ${name}`, chip, RESET];
  }
  return [
    `%c${entry.entryType}%c ${name}%c FCP ${fcpMs.toFixed(2)}ms`,
    chip,
    RESET,
    FCP_TEXT,
  ];
};

export const formatPerformancePlain = (
  entry: PerformanceEntryData,
  fcpMs: number | undefined,
): string =>
  fcpMs === undefined
    ? `${entry.entryType} ${entry.name}`
    : `${entry.entryType} ${entry.name} FCP ${fcpMs.toFixed(2)}ms`;

// "LynxConsole" 초록 칩 뒤에 메시지를 붙여요. 초기화 안내 같은 자체 로그용이에요
export const formatBrandConsoleArgs = (message: string): ConsoleArgs => [
  `%cLynxConsole%c ${message}`,
  BRAND_CHIP,
  RESET,
];
