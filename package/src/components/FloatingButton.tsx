import type { ReactNode } from "@lynx-js/react";
import * as css from "./FloatingButton.css";

interface FloatingButtonProps {
  bindtap: () => void;
  isVisible: boolean;
  children: ReactNode;
}

export const FloatingButton = ({
  bindtap,
  isVisible,
  children,
}: FloatingButtonProps) => {
  if (!isVisible) return null;

  const handleReload = () => {
    try {
      lynx.reload({}, () => {
        console.log("reloaded!");
      });
    } catch (e) {
      console.error("[LynxConsole] reload failed:", e);
    }
  };

  return (
    <view className={css.wrapper}>
      <view className={css.container} bindtap={bindtap}>
        <view className={css.button}>{children}</view>
      </view>
      <view className={css.reloadButton} bindtap={handleReload}>
        <text className={css.reloadIcon}>{"\u21BB"}</text>
      </view>
    </view>
  );
};
