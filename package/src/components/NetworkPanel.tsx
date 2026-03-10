import { useState } from "@lynx-js/react";
import type { NetworkEntry } from "../types";
import { NetworkDetailSection } from "./NetworkDetailSection";
import * as css from "./NetworkPanel.css";

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
    <view className={css.container}>
      <view className={css.header}>
        <text className={css.count}>Total: {networks.length} requests</text>
        <view className={css.clearButton} bindtap={clearNetworks}>
          <text className={css.clearButtonText}>Clear</text>
        </view>
      </view>

      {networks.length === 0 ? (
        <view className={css.placeholder}>
          <text className={css.placeholderText}>No network requests yet</text>
        </view>
      ) : (
        <list className={css.list}>
          {networks.map((network) => (
            <list-item key={network.id} item-key={network.id}>
              <view className={css.item({ status: network.status })}>
                <view
                  className={css.itemHeader}
                  bindtap={() =>
                    setSelectedId(selectedId === network.id ? null : network.id)
                  }
                >
                  <text
                    className={css.method({
                      type: network.method as
                        | "GET"
                        | "POST"
                        | "PUT"
                        | "PATCH"
                        | "DELETE",
                    })}
                  >
                    {network.method}
                  </text>
                  {network.statusCode && (
                    <text
                      className={css.statusCode({
                        type: getStatusCodeVariant(
                          network.status,
                          network.statusCode,
                        ),
                      })}
                    >
                      {network.statusCode}
                    </text>
                  )}
                  {network.status === "pending" && (
                    <text className={css.statusCode({ type: "pending" })}>
                      Pending...
                    </text>
                  )}
                  <text className={css.time}>
                    {formatDuration(network.duration)}
                  </text>
                  <text className={css.time}>
                    {new Date(network.startTime).toISOString()}
                  </text>
                </view>

                <text
                  className={css.path}
                  bindtap={() =>
                    setSelectedId(selectedId === network.id ? null : network.id)
                  }
                >
                  {extractPath(network.url)}
                </text>

                {selectedId === network.id && (
                  <view className={css.detailsContainer}>
                    {/* Tabs */}
                    <view className={css.tabs}>
                      <view
                        className={css.tab({ active: activeTab === "general" })}
                        bindtap={() => setActiveTab("general")}
                      >
                        <text
                          className={css.tabText({
                            active: activeTab === "general",
                          })}
                        >
                          General
                        </text>
                      </view>
                      <view
                        className={css.tab({ active: activeTab === "request" })}
                        bindtap={() => setActiveTab("request")}
                      >
                        <text
                          className={css.tabText({
                            active: activeTab === "request",
                          })}
                        >
                          Request
                        </text>
                      </view>
                      <view
                        className={css.tab({
                          active: activeTab === "response",
                        })}
                        bindtap={() => setActiveTab("response")}
                      >
                        <text
                          className={css.tabText({
                            active: activeTab === "response",
                          })}
                        >
                          Response
                        </text>
                      </view>
                    </view>

                    {/* Tab Content */}
                    <view className={css.tabContent}>
                      {activeTab === "general" && (
                        <view className={css.table}>
                          {getGeneralInfo(network).map((item) => (
                            <view key={item.key} className={css.tableRow}>
                              <text className={css.tableKey}>{item.key}</text>
                              <text className={css.tableValue}>
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
        </list>
      )}
    </view>
  );
};
