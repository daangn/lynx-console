import * as css from "./NetworkPanel.css";

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
  return (
    <>
      {/* Headers */}
      <view className={css.detailSection}>
        <text className={css.detailSectionTitle}>Headers</text>
        {headers && Object.keys(headers).length > 0 ? (
          <view className={css.table}>
            {Object.entries(headers).map(([key, value]) => (
              <view key={key} className={css.tableRow}>
                <text className={css.tableKey}>{key}</text>
                <text className={css.tableValue}>{value}</text>
              </view>
            ))}
          </view>
        ) : (
          <text className={css.emptyText}>No headers</text>
        )}
      </view>

      {/* Body */}
      <view className={css.detailSection}>
        <text className={css.detailSectionTitle}>Body</text>
        {error && <text className={css.errorText}>{error}</text>}
        {body && <text className={css.bodyText}>{body}</text>}
        {!error && !body && <text className={css.emptyText}>No body</text>}
      </view>
    </>
  );
};
