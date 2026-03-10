import { stringify } from "javascript-stringify";
import { ensureConsoleStructure } from "../shared/ensureConsoleStructure";
import type { NetworkEntry } from "../types";

const generateNetworkId = (): string => {
  return `network-${Date.now()}-${Math.random()}`;
};

const extractUrl = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return (input as Request).url;
};

const extractMethod = (
  input: RequestInfo | URL,
  init?: RequestInit,
): string | undefined => {
  if (init?.method) return init.method;
  if (typeof input === "object" && "method" in input) {
    return (input as Request).method;
  }
  return "GET";
};

const extractHeaders = (
  headers: HeadersInit | undefined,
): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!headers) return result;

  try {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        result[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        result[key] = value;
      });
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        result[key] = value;
      });
    }
  } catch (error) {
    console.error("[LynxConsole] Failed to extract headers:", error);
  }

  return result;
};

const mergeRequestHeaders = (
  input: RequestInfo | URL,
  init?: RequestInit,
): Record<string, string> => {
  const merged: Record<string, string> = {};

  // Request 객체나 URL 객체에서 헤더 추출
  if (typeof input === "object" && "headers" in input) {
    Object.assign(merged, extractHeaders(input.headers as HeadersInit));
  }

  // RequestInit에서 헤더 추출 (나중 값이 우선)
  if (init?.headers) {
    Object.assign(merged, extractHeaders(init.headers));
  }

  return merged;
};

const addNetworkEntry = (entry: NetworkEntry): void => {
  const state = globalThis.__LYNX_CONSOLE__?.state;
  if (!state?.networks || !state?.networksMap || !state?.networkListeners) {
    console.error(
      "[LynxConsole] Cannot add network entry: Network monitor not initialized. Call initNetworkMonitor() first.",
    );
    return;
  }

  state.networks.push(entry);
  state.networksMap.set(entry.id, entry);

  state.networkListeners.forEach((listener) => {
    listener(entry);
  });
};

const updateNetworkEntry = (
  id: string,
  updates: Partial<NetworkEntry>,
): void => {
  const state = globalThis.__LYNX_CONSOLE__?.state;
  if (!state?.networks || !state?.networksMap || !state?.networkListeners) {
    console.error(
      "[LynxConsole] Cannot update network entry: Network monitor not initialized. Call initNetworkMonitor() first.",
    );
    return;
  }

  const existingEntry = state.networksMap.get(id);
  if (!existingEntry) {
    console.error(
      `[LynxConsole] Cannot update network entry: Entry with id '${id}' not found.`,
    );
    return;
  }

  const updatedEntry = { ...existingEntry, ...updates };

  const index = state.networks.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    state.networks[index] = updatedEntry;
  }

  state.networksMap.set(id, updatedEntry);

  state.networkListeners.forEach((listener) => {
    listener(updatedEntry);
  });
};

export const initNetworkMonitor = () => {
  if (!lynx.fetch) {
    console.warn(
      "[LynxConsole] lynx.fetch not available, skipping network monitor",
    );
    return;
  }

  const { state } = ensureConsoleStructure();

  if (state.networks !== undefined) {
    console.warn("[LynxConsole] Network monitor already initialized");
    return;
  }

  type NetworkListener = (entry: NetworkEntry) => void;
  state.networks = [];
  state.networksMap = new Map();
  state.networkListeners = new Set();
  state.subscribeNetwork = (listener: NetworkListener) => {
    state.networkListeners?.add(listener);
    return () => {
      state.networkListeners?.delete(listener);
    };
  };

  const originalFetch = fetch.bind(lynx);

  const monitoredFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const id = generateNetworkId();
    const startTime = Date.now();
    const url = extractUrl(input);
    const method = extractMethod(input, init);

    const requestHeaders = mergeRequestHeaders(input, init);

    // Request body 처리
    let requestBody: string | undefined;
    if (init?.body) {
      if (typeof init.body === "string") {
        requestBody = init.body;
      } else if (init.body instanceof URLSearchParams) {
        requestBody = init.body.toString();
      } else {
        // Lynx가 지원하지 않는 타입이거나 알 수 없는 타입
        requestBody = String(init.body);
      }
    }

    addNetworkEntry({
      id,
      url,
      method: method || "default",
      status: "pending",
      startTime,
      requestHeaders,
      requestBody: requestBody ?? "",
    });

    try {
      const response = await originalFetch(input, init);
      const endTime = Date.now();

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const clonedResponse = response.clone();
      let responseBody: string | undefined;

      try {
        const headerMap: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headerMap[key.toLowerCase()] = value;
        });

        const contentType = headerMap["content-type"];
        if (contentType?.includes("application/json")) {
          const json = await clonedResponse.json();
          responseBody = stringify(json, null, 2, { references: true }) ?? "";
        } else if (contentType?.includes("text")) {
          responseBody = await clonedResponse.text();
        }
      } catch (error) {
        responseBody = `[Unable to read response body] ${error}`;
        console.error("[LynxConsole] Error reading response body:", error);
      }

      updateNetworkEntry(id, {
        status: "success",
        statusCode: response.status,
        statusText: response.statusText,
        endTime,
        duration: endTime - startTime,
        responseHeaders,
        responseBody: responseBody ?? "",
      });

      return response;
    } catch (error) {
      const endTime = Date.now();
      updateNetworkEntry(id, {
        status: "error",
        endTime,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  // biome-ignore lint/suspicious/noTsIgnore: to assign fetch to global functionfetch
  // @ts-ignore
  // biome-ignore lint/suspicious/noGlobalAssign: to assign fetch to global functionfetch fetch
  fetch = monitoredFetch as typeof fetch;

  //fetch 대신 lynx.fetch를 사용하는 경우에도 모니터링 되도록 설정
  lynx.fetch = monitoredFetch as typeof lynx.fetch;

  console.log("[LynxConsole] ✅ Network monitoring initialized");
};
