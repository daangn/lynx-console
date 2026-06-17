import type { NetworkTab } from "../hooks/useNetworkSearch";
import type { ThemeColors } from "../styles/theme";
import type { NetworkEntry } from "../types";

export const TABS: { tab: NetworkTab; label: string }[] = [
  { tab: "general", label: "General" },
  { tab: "request", label: "Request" },
  { tab: "response", label: "Response" },
];

export function getMethodColors(colors: ThemeColors, method: string) {
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

export function getStatusCodeColor(
  colors: ThemeColors,
  variant: "success" | "error" | "pending",
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

export function getStatusCodeVariant(
  status: string,
  statusCode?: number,
): "success" | "error" | "pending" {
  if (status === "pending") return "pending";
  if (status === "error") return "error";
  if (statusCode && statusCode >= 200 && statusCode < 300) return "success";
  return "error";
}

export function getItemBg(
  colors: ThemeColors,
  status: string,
): string | undefined {
  switch (status) {
    case "pending":
      return colors.palette.gray100;
    case "error":
      return colors.palette.red100;
    default:
      return undefined;
  }
}

export function formatDuration(duration?: number): string {
  if (!duration) return "-";
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(2)}s`;
}

export function extractPath(url: string): string {
  const pathMatch = url.match(/^https?:\/\/[^/]+(.*)$/);
  if (pathMatch?.[1]) {
    return pathMatch[1].startsWith("/") ? pathMatch[1].slice(1) : pathMatch[1];
  }
  return url;
}

export function getGeneralInfo(
  network: NetworkEntry,
): { key: string; value: string }[] {
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
}
