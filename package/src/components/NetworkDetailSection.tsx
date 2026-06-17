import { useState } from "@lynx-js/react";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import { HighlightText, textIncludes } from "./HighlightText";
import "./NetworkPanel.css";

interface NetworkDetailSectionProps {
  headers?: Record<string, string> | undefined;
  body?: string | undefined;
  error?: string | undefined;
  highlightQuery?: string | undefined;
  activeOccurrence?: number | undefined;
}

export const NetworkDetailSection = ({
  headers = {},
  body = "",
  error = "",
  highlightQuery = "",
  activeOccurrence = -1,
}: NetworkDetailSectionProps) => {
  const colors = useThemeColors();

  const headerEntries = Object.entries(headers);
  const headerHasMatch = headerEntries.some(
    ([key, value]) =>
      textIncludes(key, highlightQuery) || textIncludes(value, highlightQuery),
  );
  // 헤더는 기본 접힘. 검색 결과가 헤더에 있으면 자동으로 펼치고, 탭하면 수동 토글
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
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
                  className={"np-tableRow"}
                  style={{ backgroundColor: colors.bg.neutralWeak }}
                >
                  <HighlightText
                    text={key}
                    query={highlightQuery}
                    className={"np-tableKey t3"}
                    style={{
                      fontWeight: fontWeight.bold,
                      color: colors.fg.neutralSubtle,
                    }}
                  />
                  <HighlightText
                    text={value}
                    query={highlightQuery}
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
      <view className={"np-detailSection"}>
        <text
          className={"np-detailSectionTitle t3"}
          style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
        >
          Body
        </text>
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
            activeOccurrence={activeOccurrence}
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
