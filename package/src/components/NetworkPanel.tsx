import { useState } from "@lynx-js/react";
import type { NetworkEntry } from "../types";
import { FadeList } from "./FadeList";
import { NetworkDetailSection } from "./NetworkDetailSection";
import "./NetworkPanel.css";

interface NetworkPanelProps {
  networks: NetworkEntry[];
  clearNetworks: () => void;
}

type TabType = "general" | "request" | "response";

export const NetworkPanel = ({
  networks,
  clearNetworks,
}: NetworkPanelProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const formatDuration = (duration?: number): string => {
    if (!duration) return "-";
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const extractPath = (url: string): string => {
    const pathMatch = url.match(/^https?:\/\/[^/]+(.*)$/);
    if (pathMatch?.[1]) {
      return pathMatch[1].startsWith("/")
        ? pathMatch[1].slice(1)
        : pathMatch[1];
    }
    return url;
  };

  const getGeneralInfo = (network: NetworkEntry) => {
    return [
      { key: "URL", value: network.url },
      { key: "Method", value: network.method },
      network.statusCode
        ? { key: "Status", value: String(network.statusCode) }
        : null,
      {
        key: "Request Time",
        value: new Date(network.startTime).toISOString(),
      },
      network.endTime
        ? {
            key: "Response Time",
            value: new Date(network.endTime).toISOString(),
          }
        : null,
      network.duration
        ? { key: "Duration", value: formatDuration(network.duration) }
        : null,
    ].filter((item) => item !== null);
  };

  const getStatusCodeVariant = (
    status: string,
    statusCode?: number,
  ): "success" | "error" | "pending" => {
    if (status === "pending") return "pending";
    if (status === "error") return "error";
    if (statusCode && statusCode >= 200 && statusCode < 300) return "success";
    return "error";
  };

  return (
    <view className={"np-container"}>
      <view className={"np-header"}>
        <text className={"np-count"}>Total: {networks.length} requests</text>
        <view className={"np-clearButton"} bindtap={clearNetworks}>
          <text className={"np-clearButtonText"}>🗑</text>
        </view>
      </view>

      {networks.length === 0 ? (
        <view className={"np-placeholder"}>
          <text className={"np-placeholderText"}>No network requests yet</text>
        </view>
      ) : (
        <FadeList className={"np-list"}>
          {networks.map((network) => (
            <list-item key={network.id} item-key={network.id}>
              <view className={`np-item np-item--${network.status}`}>
                <view
                  className={"np-itemHeader"}
                  bindtap={() =>
                    setSelectedId(selectedId === network.id ? null : network.id)
                  }
                >
                  <text
                    className={`np-method np-method--${network.method}`}
                  >
                    {network.method}
                  </text>
                  {network.statusCode && (
                    <text
                      className={`np-statusCode np-statusCode--${getStatusCodeVariant(network.status, network.statusCode)}`}
                    >
                      {network.statusCode}
                    </text>
                  )}
                  {network.status === "pending" && (
                    <text className={"np-statusCode np-statusCode--pending"}>
                      Pending...
                    </text>
                  )}
                  <text className={"np-time"}>
                    {formatDuration(network.duration)}
                  </text>
                  <text className={"np-time"}>
                    {new Date(network.startTime).toISOString()}
                  </text>
                </view>

                <text
                  className={"np-path"}
                  bindtap={() =>
                    setSelectedId(selectedId === network.id ? null : network.id)
                  }
                >
                  {extractPath(network.url)}
                </text>

                {selectedId === network.id && (
                  <view className={"np-detailsContainer"}>
                    {/* Tabs */}
                    <view className={"np-tabs"}>
                      <view
                        className={`np-tab${activeTab === "general" ? " np-tab--active" : ""}`}
                        bindtap={() => setActiveTab("general")}
                      >
                        <text
                          className={`np-tabText${activeTab === "general" ? " np-tabText--active" : ""}`}
                        >
                          General
                        </text>
                      </view>
                      <view
                        className={`np-tab${activeTab === "request" ? " np-tab--active" : ""}`}
                        bindtap={() => setActiveTab("request")}
                      >
                        <text
                          className={`np-tabText${activeTab === "request" ? " np-tabText--active" : ""}`}
                        >
                          Request
                        </text>
                      </view>
                      <view
                        className={`np-tab${activeTab === "response" ? " np-tab--active" : ""}`}
                        bindtap={() => setActiveTab("response")}
                      >
                        <text
                          className={`np-tabText${activeTab === "response" ? " np-tabText--active" : ""}`}
                        >
                          Response
                        </text>
                      </view>
                    </view>

                    {/* Tab Content */}
                    <view className={"np-tabContent"}>
                      {activeTab === "general" && (
                        <view className={"np-table"}>
                          {getGeneralInfo(network).map((item) => (
                            <view key={item.key} className={"np-tableRow"}>
                              <text className={"np-tableKey"}>{item.key}</text>
                              <text className={"np-tableValue"}>
                                {item.value}
                              </text>
                            </view>
                          ))}
                        </view>
                      )}

                      {activeTab === "request" && (
                        <NetworkDetailSection
                          headers={network.requestHeaders}
                          body={network.requestBody}
                        />
                      )}

                      {activeTab === "response" && (
                        <NetworkDetailSection
                          headers={network.responseHeaders}
                          body={network.responseBody}
                          error={network.error}
                        />
                      )}
                    </view>
                  </view>
                )}
              </view>
            </list-item>
          ))}
        </FadeList>
      )}
    </view>
  );
};
