const MAX_STRING_LENGTH = 10_000;

const truncate = (value: string): string =>
  value.length > MAX_STRING_LENGTH
    ? `${value.slice(0, MAX_STRING_LENGTH)}… [truncated ${value.length - MAX_STRING_LENGTH} chars]`
    : value;

// 순환 참조·Map·Set·Error·함수처럼 JSON.stringify 가 못 다루는 값을 안전하게 문자열로 바꿔요
export const safeJsonStringify = (value: unknown, indent?: number): string => {
  const seen = new WeakSet<object>();

  const replacer = (_key: string, raw: unknown): unknown => {
    if (typeof raw === "string") return truncate(raw);
    if (typeof raw === "bigint") return `${raw.toString()}n`;
    if (typeof raw === "function")
      return `[Function ${raw.name || "anonymous"}]`;
    if (typeof raw === "symbol") return raw.toString();
    if (raw === undefined) return "[undefined]";
    if (raw instanceof Error) {
      return { name: raw.name, message: raw.message, stack: raw.stack };
    }
    if (raw instanceof Map) return Object.fromEntries(raw.entries());
    if (raw instanceof Set) return Array.from(raw.values());
    if (typeof raw === "object" && raw !== null) {
      if (seen.has(raw)) return "[Circular]";
      seen.add(raw);
    }
    return raw;
  };

  try {
    return JSON.stringify(value, replacer, indent) ?? "null";
  } catch (error) {
    return JSON.stringify({ error: `[Unserializable] ${String(error)}` });
  }
};
