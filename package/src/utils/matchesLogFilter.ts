import type { LogEntry, LogFilter } from "../types";
import { parseConsoleArgs } from "./parseFormat";

// 로그 엔트리는 한 번 들어오면 바뀌지 않아서 파싱 결과를 엔트리별로 한 번만 만들어요
const searchStringsCache = new WeakMap<LogEntry, string[]>();

// 로그 한 줄에서 검색·필터 대상이 되는 문자열들이에요.
// %c 스타일 문자열은 빼고, %s·%d 같은 서식은 적용한 뒤의 텍스트를 봐요
export const getLogSearchStrings = (log: LogEntry): string[] => {
  const cached = searchStringsCache.get(log);
  if (cached) return cached;

  const { segments, rest } = parseConsoleArgs(log.args);
  const formatted = segments
    .map((seg) => (seg.type === "text" ? seg.text : String(seg.value)))
    .join("");
  const strings = rest.map((arg) => String(arg));
  const result = formatted ? [formatted, ...strings] : strings;
  searchStringsCache.set(log, result);
  return result;
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

  return strings.some((text) => {
    // g·y 플래그가 있으면 test() 가 lastIndex 를 이어 써서 로그를 하나 걸러 놓쳐요
    filter.lastIndex = 0;
    return filter.test(text);
  });
};
