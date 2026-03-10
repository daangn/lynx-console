import { useEffect, useState } from "@lynx-js/react";
import type { NetworkEntry } from "../types";

export const useNetwork = () => {
  const [networks, setNetworks] = useState<NetworkEntry[]>([]);

  useEffect(() => {
    if (typeof globalThis.__LYNX_CONSOLE__?.state?.networks === "undefined") {
      console.warn("[LynxConsole] Network monitoring not initialized");
      return;
    }

    const state = globalThis.__LYNX_CONSOLE__.state;

    setNetworks([...(state.networks ?? [])]);

    const updateNetworks = (_entry: NetworkEntry) => {
      setNetworks([...(state.networks ?? [])]);
    };

    const unsubscribe = state.subscribeNetwork?.(updateNetworks);

    return unsubscribe;
  }, []);

  const clearNetworks = () => {
    if (typeof globalThis.__LYNX_CONSOLE__?.state?.networks !== "undefined") {
      const state = globalThis.__LYNX_CONSOLE__.state;
      state.networks = [];
      state.networksMap?.clear();
      setNetworks([]);
    }
  };

  return { networks, clearNetworks };
};
