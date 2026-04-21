import { parseCssString, type StyleObject } from "./parseCssStyle";

export type LogSegment =
  | { type: "text"; text: string; style?: StyleObject }
  | { type: "arg"; value: unknown };

export interface ParsedLogArgs {
  segments: LogSegment[];
  rest: unknown[];
}

const HAS_FORMAT = /%[csdifoO%]/;

const formatNumber = (v: unknown, int: boolean): string => {
  const n =
    typeof v === "number"
      ? int
        ? Math.trunc(v)
        : v
      : typeof v === "symbol"
        ? Number.NaN
        : int
          ? parseInt(String(v), 10)
          : parseFloat(String(v));
  return Number.isNaN(n) ? "NaN" : String(n);
};

export const parseConsoleArgs = (args: unknown[]): ParsedLogArgs => {
  const first = args[0];
  if (typeof first !== "string" || !HAS_FORMAT.test(first)) {
    return { segments: [], rest: args };
  }

  const segments: LogSegment[] = [];
  let currentText = "";
  let currentStyle: StyleObject | undefined;
  let argIndex = 1;
  let lastIndex = 0;

  const flushText = () => {
    if (currentText) {
      segments.push({ type: "text", text: currentText, style: currentStyle });
      currentText = "";
    }
  };

  const re = /%([csdifoO%])/g;
  let match: RegExpExecArray | null = re.exec(first);
  while (match !== null) {
    currentText += first.slice(lastIndex, match.index);
    lastIndex = re.lastIndex;
    const spec = match[1];

    if (spec === "%") {
      currentText += "%";
    } else if (argIndex >= args.length) {
      currentText += match[0];
    } else {
      const arg = args[argIndex++];
      switch (spec) {
        case "c":
          flushText();
          currentStyle =
            typeof arg === "string" ? parseCssString(arg) : undefined;
          break;
        case "s":
          currentText += String(arg);
          break;
        case "d":
        case "i":
          currentText += formatNumber(arg, true);
          break;
        case "f":
          currentText += formatNumber(arg, false);
          break;
        case "o":
        case "O":
          flushText();
          segments.push({ type: "arg", value: arg });
          break;
      }
    }

    match = re.exec(first);
  }
  currentText += first.slice(lastIndex);
  flushText();

  return { segments, rest: args.slice(argIndex) };
};
