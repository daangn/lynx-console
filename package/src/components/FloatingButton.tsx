import type { ReactNode } from "@lynx-js/react";
import { useLongPressDrag } from "../hooks/useLongPressDrag";
import * as css from "./FloatingButton.css";

interface FloatingButtonProps {
  bindtap: () => void;
  children: ReactNode;
}

const SHINE_STYLES = {
  idle: {
    transform: "scale(0)",
    opacity: 0,
  },
  dragging: {
    transform: "scale(1)",
    opacity: 1,
    transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  releasing: {
    transform: "scale(1)",
    opacity: 0,
    transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export const FloatingButton = ({
  bindtap,
  children,
}: FloatingButtonProps) => {
  const { phase, right, bottom, clearTimer, handlers } =
    useLongPressDrag(bindtap);


  const handleReload = () => {
    try {
      lynx.reload({}, () => {
        console.log("reloaded!");
      });
    } catch (e) {
      console.error("[LynxConsole] reload failed:", e);
    }
  };

  const isDragging = phase === "dragging";

  return (
    <view
      className={css.wrapper}
      style={{
        right: `${right}px`,
        bottom: `${bottom}px`,
        transform: isDragging ? "scale(1.05)" : "scale(1)",
      }}
      {...handlers}
    >
      <view className={css.button}>
        {children}
        <view className={css.shineOverlay} style={SHINE_STYLES[phase]} />
      </view>
      <view
        className={css.reloadButton}
        catchtouchstart={() => clearTimer()}
        bindtap={handleReload}
      >
        <text className={css.reloadIcon}>{"\u21BB"}</text>
      </view>
    </view>
  );
};
