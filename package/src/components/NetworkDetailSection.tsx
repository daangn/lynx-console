import { type RefObject, useState } from "@lynx-js/react";
import type { NodesRef } from "@lynx-js/types";
import { matchNode } from "../hooks/useNetworkSearch";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import { HighlightText, textIncludes } from "./HighlightText";
import "./NetworkPanel.css";

interface NetworkDetailSectionProps {
  section: "request" | "response";
  headers?: Record<string, string> | undefined;
  body?: string | undefined;
  error?: string | undefined;
  highlightQuery?: string | undefined;
  // 이 항목 안에서 nodeKey에 해당하는 노드의 활성 매치 등장 순번(없으면 -1)
  getActiveOccurrence?: ((nodeKey: string) => number) | undefined;
  // 활성 매치 노드면 스크롤용 ref를 돌려준다(아니면 undefined)
  getNodeRef?:
    | ((nodeKey: string) => RefObject<NodesRef> | undefined)
    | undefined;
}

export const NetworkDetailSection = ({
  section,
  headers = {},
  body = "",
  error = "",
  highlightQuery = "",
  getActiveOccurrence = () => -1,
  getNodeRef = () => undefined,
}: NetworkDetailSectionProps) => {
  const colors = useThemeColors();
  const [isLogged, setIsLogged] = useState(false);

  // 헤더 행 안의 key 또는 value가 활성 매치면 그 행에 스크롤 ref를 단다
  const rowRef = (name: string) =>
    getNodeRef(matchNode.headerKey(section, name)) ??
    getNodeRef(matchNode.headerValue(section, name));

  const headerEntries = Object.entries(headers);
  const headerHasMatch = headerEntries.some(
    ([key, value]) =>
      textIncludes(key, highlightQuery) || textIncludes(value, highlightQuery),
  );
  // 헤더는 기본 접힘. 검색 결과가 헤더에 있으면 자동으로 펼치고, 탭하면 수동 토글
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  // 검색어가 바뀌면 수동 상태를 초기화해 새 매치 여부를 자동으로 반영한다.
  // effect 대신 렌더 단계에서 직접 리셋(추가 페인트·깜빡임 없음 — React 권장 패턴)
  const [prevQuery, setPrevQuery] = useState(highlightQuery);
  if (prevQuery !== highlightQuery) {
    setPrevQuery(highlightQuery);
    setManualOpen(null);
  }
  const headersOpen = manualOpen ?? headerHasMatch;

  return (
    <>
      {/* Headers (토글) */}
      <view className={"np-detailSection"}>
        <view
          className={"np-detailSectionHeader"}
          bindtap={() => setManualOpen(!headersOpen)}
        >
          <text
            className={"t2"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.neutralSubtle,
            }}
          >
            {headersOpen ? "▼" : "▶"}
          </text>
          <text
            className={"t3"}
            style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
          >
            Headers
          </text>
        </view>
        {headersOpen &&
          (headerEntries.length > 0 ? (
            <view className={"np-table"}>
              {headerEntries.map(([key, value]) => (
                <view
                  key={key}
                  ref={rowRef(key)}
                  className={"np-tableRow"}
                  style={{ backgroundColor: colors.bg.neutralWeak }}
                >
                  <HighlightText
                    text={key}
                    query={highlightQuery}
                    activeOccurrence={getActiveOccurrence(
                      matchNode.headerKey(section, key),
                    )}
                    className={"np-tableKey t3"}
                    style={{
                      fontWeight: fontWeight.bold,
                      color: colors.fg.neutralSubtle,
                    }}
                  />
                  <HighlightText
                    text={value}
                    query={highlightQuery}
                    activeOccurrence={getActiveOccurrence(
                      matchNode.headerValue(section, key),
                    )}
                    className={"np-tableValue t3"}
                    style={{
                      fontWeight: fontWeight.regular,
                      color: colors.fg.neutral,
                    }}
                  />
                </view>
              ))}
            </view>
          ) : (
            <text
              className={"np-emptyText t3"}
              style={{
                fontWeight: fontWeight.regular,
                color: colors.fg.disabled,
              }}
            >
              No headers
            </text>
          ))}
      </view>

      {/* Body */}
      <view
        className={"np-detailSection"}
        ref={getNodeRef(matchNode.body(section))}
      >
        <view className={"np-detailSectionHeader"}>
          <text
            className={"np-detailSectionTitle t3"}
            style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
          >
            Body
          </text>
          {body && (
            <view
              className={"np-logButton"}
              style={{
                backgroundColor: colors.bg.neutralWeak,
                borderRadius: 4,
              }}
              bindtap={() => {
                console.log(`[lynx-console] ${section} body:`, body);
                setIsLogged(true);
                setTimeout(() => setIsLogged(false), 5000);
              }}
            >
              <text
                className={"t3"}
                style={{
                  color: isLogged ? colors.fg.accent : colors.fg.neutralSubtle,
                  fontWeight: fontWeight.regular,
                }}
              >
                {isLogged ? "✓ logged" : "log"}
              </text>
            </view>
          )}
        </view>
        {error && (
          <text
            className={"np-errorText t3"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.palette.red600,
              backgroundColor: colors.palette.red100,
            }}
          >
            {error}
          </text>
        )}
        {body && (
          <HighlightText
            text={body}
            query={highlightQuery}
            activeOccurrence={getActiveOccurrence(matchNode.body(section))}
            className={"np-bodyText t3"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.neutral,
              backgroundColor: colors.bg.neutralWeak,
            }}
          />
        )}
        {!error && !body && (
          <text
            className={"np-emptyText t3"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.disabled,
            }}
          >
            No body
          </text>
        )}
      </view>
    </>
  );
};
