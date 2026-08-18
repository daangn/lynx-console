import { useLynxGlobalEventListener, useState } from "@lynx-js/react";
import { isWebPlatform } from "../shared/isWebPlatform";

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useLynxGlobalEventListener(
    isWebPlatform ? "__lynx_console_keyboard_noop__" : "keyboardstatuschanged",
    (status: "on" | "off", height: number) => {
      setKeyboardHeight(status === "on" ? height : 0);
    },
  );

  return keyboardHeight;
}
