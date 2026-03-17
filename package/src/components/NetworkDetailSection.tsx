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
  return (
    <>
      {/* Headers */}
      <view className={"np-detailSection"}>
        <text className={"np-detailSectionTitle"}>Headers</text>
        {headers && Object.keys(headers).length > 0 ? (
          <view className={"np-table"}>
            {Object.entries(headers).map(([key, value]) => (
              <view key={key} className={"np-tableRow"}>
                <text className={"np-tableKey"}>{key}</text>
                <text className={"np-tableValue"}>{value}</text>
              </view>
            ))}
          </view>
        ) : (
          <text className={"np-emptyText"}>No headers</text>
        )}
      </view>

      {/* Body */}
      <view className={"np-detailSection"}>
        <text className={"np-detailSectionTitle"}>Body</text>
        {error && <text className={"np-errorText"}>{error}</text>}
        {body && <text className={"np-bodyText"}>{body}</text>}
        {!error && !body && <text className={"np-emptyText"}>No body</text>}
      </view>
    </>
  );
};
