import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";

interface HighlightSegment {
  text: string;
  match: boolean;
  // 일치 세그먼트일 때 해당 텍스트 안에서의 0-based 등장 순번
  occurrence?: number;
}

// query가 등장하는 시작 인덱스들을 대소문자 구분 없이 반환한다.
// 강조(splitHighlight)와 카운트(countOccurrences)가 같은 매치 정의를
// 공유하도록 하는 단일 출처. 한쪽만 바뀌어 어긋나는 일을 막는다.
function matchIndices(text: string, query: string): number[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const lower = text.toLowerCase();
  const indices: number[] = [];
  let from = 0;
  while (true) {
    const idx = lower.indexOf(q, from);
    if (idx === -1) break;
    indices.push(idx);
    from = idx + q.length;
  }
  return indices;
}

// query에 일치하는 부분을 대소문자 구분 없이 잘라 세그먼트로 반환
export function splitHighlight(
  text: string,
  query: string,
): HighlightSegment[] {
  const q = query.trim().toLowerCase();
  const indices = matchIndices(text, query);
  if (indices.length === 0) return [{ text, match: false }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  indices.forEach((idx, occurrence) => {
    if (idx > cursor) {
      segments.push({ text: text.slice(cursor, idx), match: false });
    }
    segments.push({
      text: text.slice(idx, idx + q.length),
      match: true,
      occurrence,
    });
    cursor = idx + q.length;
  });
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }

  return segments;
}

export function textIncludes(text: string | undefined, query: string): boolean {
  if (!text) return false;
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return text.toLowerCase().includes(q);
}

// text 안에 query가 몇 번 등장하는지 센다(대소문자 무시)
export function countOccurrences(
  text: string | undefined,
  query: string,
): number {
  if (!text) return 0;
  return matchIndices(text, query).length;
}

interface HighlightTextProps {
  text: string;
  query: string;
  // 이 텍스트 안에서 "현재 선택된" 매치의 등장 순번(없으면 -1)
  activeOccurrence?: number | undefined;
  className?: string | undefined;
  style?: Record<string, unknown> | undefined;
}

/**
 * query에 일치하는 부분을 강조 표시하는 텍스트.
 * 일치하지 않는 부분은 부모 <text>의 스타일을 그대로 상속하고,
 * 일치하는 부분만 중첩 <text>로 감싸 하이라이트 배경을 입힌다.
 * activeOccurrence와 순번이 같은 매치는 "현재 선택" 스타일로 강조한다.
 */
export const HighlightText = ({
  text,
  query,
  activeOccurrence = -1,
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
      {segments.map((segment, index) => {
        if (!segment.match) return segment.text;
        const isActive = segment.occurrence === activeOccurrence;
        return (
          <text
            // biome-ignore lint: 세그먼트는 텍스트 순서로 안정적
            key={`hl-${index}`}
            style={{
              backgroundColor: isActive
                ? colors.highlight.activeBg
                : colors.highlight.matchBg,
              color: isActive
                ? colors.highlight.activeText
                : colors.highlight.matchText,
              fontWeight: fontWeight.bold,
            }}
          >
            {segment.text}
          </text>
        );
      })}
    </text>
  );
};
