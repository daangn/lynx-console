import { useState } from "@lynx-js/react";
import { useThemeColors } from "../styles/ThemeContext";
import { fontWeight, type ThemeColors } from "../styles/theme";
import type { NetworkEntry } from "../types";
import { NetworkDetailSection } from "./NetworkDetailSection";
import "./NetworkPanel.css";

interface NetworkPanelProps {
  networks: NetworkEntry[];
  clearNetworks: () => void;
}

type TabType = "general" | "request" | "response";

function getMethodColors(colors: ThemeColors, method: string) {
  switch (method) {
    case "GET":
      return {
        color: colors.palette.blue600,
        backgroundColor: colors.palette.blue100,
      };
    case "POST":
      return {
        color: colors.palette.green600,
        backgroundColor: colors.palette.green100,
      };
    case "PUT":
      return {
        color: colors.palette.yellow600,
        backgroundColor: colors.palette.yellow100,
      };
    case "PATCH":
      return {
        color: colors.palette.purple600,
        backgroundColor: colors.palette.purple100,
      };
    case "DELETE":
      return {
        color: colors.palette.red600,
        backgroundColor: colors.palette.red100,
      };
    default:
      return {
        color: colors.fg.neutral,
        backgroundColor: colors.bg.neutralWeak,
      };
  }
}

function getStatusCodeColor(
  colors: ThemeColors,
  variant: "success" | "error" | "pending"
): string {
  switch (variant) {
    case "success":
      return colors.palette.green600;
    case "error":
      return colors.palette.red600;
    case "pending":
      return colors.fg.neutralSubtle;
  }
}

function getItemBg(colors: ThemeColors, status: string): string | undefined {
  switch (status) {
    case "pending":
      return colors.palette.gray100;
    case "error":
      return colors.palette.red100;
    default:
      return undefined;
  }
}

export const NetworkPanel = ({
  networks,
  clearNetworks,
}: NetworkPanelProps) => {
  const colors = useThemeColors();
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
    statusCode?: number
  ): "success" | "error" | "pending" => {
    if (status === "pending") return "pending";
    if (status === "error") return "error";
    if (statusCode && statusCode >= 200 && statusCode < 300) return "success";
    return "error";
  };

  return (
    <view className={"np-container"}>
      <view className={"np-header"}>
        <text
          className={"np-count t3"}
          style={{
            fontWeight: fontWeight.regular,
            color: colors.fg.neutralSubtle,
          }}
        >
          Total: {networks.length} requests
        </text>
        <view
          className={"np-clearButton"}
          style={{ backgroundColor: colors.bg.neutralWeak }}
          bindtap={clearNetworks}
        >
          <text
            className={"np-clearButtonText t3"}
            style={{
              fontWeight: fontWeight.medium,
              color: colors.fg.neutralMuted,
            }}
          >
            🗑
          </text>
        </view>
      </view>

      {networks.length === 0 ? (
        <view className={"np-placeholder"}>
          <text
            className={"np-placeholderText t4"}
            style={{
              fontWeight: fontWeight.regular,
              color: colors.fg.disabled,
            }}
          >
            No network requests yet
          </text>
        </view>
      ) : (
        <list scroll-orientation="vertical" className={"np-list"}>
          {networks.map((network) => (
            <list-item key={network.id} item-key={network.id}>
              <view
                className={"np-item"}
                style={{
                  backgroundColor: getItemBg(colors, network.status),
                  borderBottomColor: colors.stroke.neutralWeak,
                }}
              >
                <view
                  className={"np-itemHeader"}
                  bindtap={() =>
                    setSelectedId(selectedId === network.id ? null : network.id)
                  }
                >
                  <text
                    className={"np-method t2"}
                    style={{
                      fontWeight: fontWeight.bold,
                      ...getMethodColors(colors, network.method),
                    }}
                  >
                    {network.method}
                  </text>
                  {network.statusCode && (
                    <text
                      className={"np-statusCode t2"}
                      style={{
                        fontWeight: fontWeight.bold,
                        color: getStatusCodeColor(
                          colors,
                          getStatusCodeVariant(
                            network.status,
                            network.statusCode
                          )
                        ),
                      }}
                    >
                      {network.statusCode}
                    </text>
                  )}
                  {network.status === "pending" && (
                    <text
                      className={"np-statusCode t2"}
                      style={{
                        fontWeight: fontWeight.bold,
                        color: colors.fg.neutralSubtle,
                      }}
                    >
                      Pending...
                    </text>
                  )}
                  <text
                    className={"np-time t2"}
                    style={{
                      fontWeight: fontWeight.regular,
                      color: colors.fg.neutralSubtle,
                    }}
                  >
                    {formatDuration(network.duration)}
                  </text>
                  <text
                    className={"np-time t2"}
                    style={{
                      fontWeight: fontWeight.regular,
                      color: colors.fg.neutralSubtle,
                    }}
                  >
                    {new Date(network.startTime).toISOString()}
                  </text>
                </view>

                <text
                  className={"np-path t3"}
                  style={{
                    fontWeight: fontWeight.regular,
                    color: colors.fg.neutral,
                  }}
                  bindtap={() =>
                    setSelectedId(selectedId === network.id ? null : network.id)
                  }
                >
                  {extractPath(network.url)}
                </text>

                {selectedId === network.id && (
                  <view
                    className={"np-detailsContainer"}
                    style={{ borderTopColor: colors.stroke.neutralSubtle }}
                  >
                    {/* Tabs */}
                    <view className={"np-tabs"}>
                      <view
                        className={"np-tab"}
                        style={{
                          backgroundColor:
                            activeTab === "general"
                              ? colors.bg.neutralWeak
                              : undefined,
                        }}
                        bindtap={() => setActiveTab("general")}
                      >
                        <text
                          className={"np-tabText t4"}
                          style={{
                            fontWeight: fontWeight.medium,
                            color:
                              activeTab === "general"
                                ? colors.fg.neutral
                                : colors.fg.neutralSubtle,
                          }}
                        >
                          General
                        </text>
                      </view>
                      <view
                        className={"np-tab"}
                        style={{
                          backgroundColor:
                            activeTab === "request"
                              ? colors.bg.neutralWeak
                              : undefined,
                        }}
                        bindtap={() => setActiveTab("request")}
                      >
                        <text
                          className={"np-tabText t4"}
                          style={{
                            fontWeight: fontWeight.medium,
                            color:
                              activeTab === "request"
                                ? colors.fg.neutral
                                : colors.fg.neutralSubtle,
                          }}
                        >
                          Request
                        </text>
                      </view>
                      <view
                        className={"np-tab"}
                        style={{
                          backgroundColor:
                            activeTab === "response"
                              ? colors.bg.neutralWeak
                              : undefined,
                        }}
                        bindtap={() => setActiveTab("response")}
                      >
                        <text
                          className={"np-tabText t4"}
                          style={{
                            fontWeight: fontWeight.medium,
                            color:
                              activeTab === "response"
                                ? colors.fg.neutral
                                : colors.fg.neutralSubtle,
                          }}
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
                            <view
                              key={item.key}
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
                                {item.key}
                              </text>
                              <text
                                className={"np-tableValue t3"}
                                style={{
                                  fontWeight: fontWeight.regular,
                                  color: colors.fg.neutral,
                                }}
                              >
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
