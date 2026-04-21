import { useLynxGlobalEventListener, useState } from "@lynx-js/react";

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useLynxGlobalEventListener(
    "keyboardstatuschanged",
    (status: "on" | "off", height: number) => {
      setKeyboardHeight(status === "on" ? height : 0);
    },
  );

  return keyboardHeight;
}
