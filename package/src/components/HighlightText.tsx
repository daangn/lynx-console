import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";

interface HighlightSegment {
  text: string;
  match: boolean;
}

// query에 일치하는 부분을 대소문자 구분 없이 잘라 세그먼트로 반환
export function splitHighlight(
  text: string,
  query: string,
): HighlightSegment[] {
  const q = query.trim().toLowerCase();
  if (!q) return [{ text, match: false }];

  const lower = text.toLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const idx = lower.indexOf(q, cursor);
    if (idx === -1) {
      segments.push({ text: text.slice(cursor), match: false });
      break;
    }
    if (idx > cursor) {
      segments.push({ text: text.slice(cursor, idx), match: false });
    }
    segments.push({ text: text.slice(idx, idx + q.length), match: true });
    cursor = idx + q.length;
  }

  return segments;
}

export function textIncludes(text: string | undefined, query: string): boolean {
  if (!text) return false;
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return text.toLowerCase().includes(q);
}

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string | undefined;
  style?: Record<string, unknown> | undefined;
}

/**
 * query에 일치하는 부분을 강조 표시하는 텍스트.
 * 일치하지 않는 부분은 부모 <text>의 스타일을 그대로 상속하고,
 * 일치하는 부분만 중첩 <text>로 감싸 하이라이트 배경을 입힌다.
 */
export const HighlightText = ({
  text,
  query,
  className,
  style,
}: HighlightTextProps) => {
  const colors = useThemeColors();
  const segments = splitHighlight(text, query);

  if (segments.length === 1 && !segments[0]?.match) {
    return (
      <text className={className} style={style}>
        {text}
      </text>
    );
  }

  return (
    <text className={className} style={style}>
      {segments.map((segment, index) =>
        segment.match ? (
          <text
            // biome-ignore lint: 세그먼트는 텍스트 순서로 안정적
            key={`hl-${index}`}
            style={{
              backgroundColor: colors.palette.yellow600,
              color: colors.palette.staticWhite,
              fontWeight: fontWeight.bold,
            }}
          >
            {segment.text}
          </text>
        ) : (
          segment.text
        ),
      )}
    </text>
  );
};
