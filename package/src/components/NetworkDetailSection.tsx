import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight } from "../styles/theme";
import "./NetworkPanel.css";

interface NetworkDetailSectionProps {
  headers?: Record<string, string> | undefined;
  body?: string | undefined;
  error?: string | undefined;
}

export const NetworkDetailSection = ({
  headers = {},
  body = "",
  error = "",
}: NetworkDetailSectionProps) => {
  const colors = useThemeColors();

  return (
    <>
      {/* Headers */}
      <view className={"np-detailSection"}>
        <text
          className={"np-detailSectionTitle"}
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
                  className={"np-tableKey"}
                  style={{ fontWeight: fontWeight.bold, color: colors.fg.neutralSubtle }}
                >
                  {key}
                </text>
                <text
                  className={"np-tableValue"}
                  style={{ fontWeight: fontWeight.regular, color: colors.fg.neutral }}
                >
                  {value}
                </text>
              </view>
            ))}
          </view>
        ) : (
          <text
            className={"np-emptyText"}
            style={{ fontWeight: fontWeight.regular, color: colors.fg.disabled }}
          >
            No headers
          </text>
        )}
      </view>

      {/* Body */}
      <view className={"np-detailSection"}>
        <text
          className={"np-detailSectionTitle"}
          style={{ fontWeight: fontWeight.bold, color: colors.fg.neutral }}
        >
          Body
        </text>
        {error && (
          <text
            className={"np-errorText"}
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
          <text
            className={"np-bodyText"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.neutral,
              backgroundColor: colors.bg.neutralWeak,
            }}
          >
            {body}
          </text>
        )}
        {!error && !body && (
          <text
            className={"np-emptyText"}
            style={{ fontWeight: fontWeight.regular, color: colors.fg.disabled }}
          >
            No body
          </text>
        )}
      </view>
    </>
  );
};
