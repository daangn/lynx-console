import type { LogEntry, LogFilter } from "../types";
import { parseConsoleArgs } from "./parseFormat";

// 로그 한 줄에서 검색·필터 대상이 되는 문자열들이에요.
// %c 스타일 문자열은 빼고, %s·%d 같은 서식은 적용한 뒤의 텍스트를 봐요
export const getLogSearchStrings = (log: LogEntry): string[] => {
  const { segments, rest } = parseConsoleArgs(log.args);
  const formatted = segments
    .map((seg) => (seg.type === "text" ? seg.text : String(seg.value)))
    .join("");
  const strings = rest.map((arg) => String(arg));
  return formatted ? [formatted, ...strings] : strings;
};

// 커스텀 로그 탭의 filter 로 엔트리를 판정해요
export const matchesLogFilter = (
  entry: LogEntry,
  filter: LogFilter,
): boolean => {
  if (typeof filter === "function") {
    try {
      return filter(entry);
    } catch {
      return false;
    }
  }

  const strings = getLogSearchStrings(entry);

  if (typeof filter === "string") {
    return strings.some((text) => text.includes(filter));
  }

  return strings.some((text) => filter.test(text));
};
