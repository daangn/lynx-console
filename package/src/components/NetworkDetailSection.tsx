import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import { HighlightText } from "./HighlightText";
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

  // 이 body에 현재 활성 매치가 있으면 스크롤 포커스가 body로 잘 잡히도록
  // Headers보다 위에 렌더한다(헤더가 길어도 body가 밀려나지 않음)
  const bodyFirst = activeOccurrence >= 0;

  const headerSection = (
    <view className={"np-detailSection"}>
      <text
        className={"np-detailSectionTitle t3"}
        style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
      >
        Headers
      </text>
      {headers && Object.keys(headers).length > 0 ? (
        <view className={"np-table"}>
          {Object.entries(headers).map(([key, value]) => (
            <view
              key={key}
              className={"np-tableRow"}
              style={{ backgroundColor: colors.bg.neutralWeak }}
            >
              <text
                className={"np-tableKey t3"}
                style={{
                  fontWeight: fontWeight.bold,
                  color: colors.fg.neutralSubtle,
                }}
              >
                {key}
              </text>
              <text
                className={"np-tableValue t3"}
                style={{
                  fontWeight: fontWeight.regular,
                  color: colors.fg.neutral,
                }}
              >
                {value}
              </text>
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
      )}
    </view>
  );

  const bodySection = (
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
  );

  return (
    <>
      {bodyFirst ? bodySection : headerSection}
      {bodyFirst ? headerSection : bodySection}
    </>
  );
};
