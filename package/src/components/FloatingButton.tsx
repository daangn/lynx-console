import type { ReactNode } from "@lynx-js/react";
import {
  type InitialPosition,
  useFloatingButtonDrag,
} from "../hooks/useFloatingButtonDrag";
import { useThemeColors } from "../styles/ThemeContext";
import { duration } from "../styles/theme";
import "./FloatingButton.css";

interface FloatingButtonProps {
  bindtap: () => void;
  children: ReactNode;
  initialPosition?: InitialPosition;
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
  initialPosition,
}: FloatingButtonProps) => {
  const colors = useThemeColors();
  const {
    phase,
    positionStyle,
    dragHandlers,
    dragOverlayHandlers,
    stopDragHandlers,
  } = useFloatingButtonDrag({ onTap: bindtap, initialPosition });

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
    <>
      {/* 드래그 중 커서가 버튼 밖으로 나가도 mousemove/mouseup을 계속 받기 위한 오버레이예요 */}
      {dragOverlayHandlers && (
        <view className={"fb-dragOverlay"} {...dragOverlayHandlers} />
      )}
      <view
        className={"fb-wrapper"}
        style={{
          ...positionStyle,
          transform: isDragging ? "scale(1.05)" : "scale(1)",
          transition: `transform ${duration.d4} cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
        {...dragHandlers}
      >
        <view
          className={"fb-button"}
          style={{ backgroundColor: colors.palette.green600 }}
        >
          {children}
          <view className={"fb-shineOverlay"} style={SHINE_STYLES[phase]} />
        </view>
        <view
          className={"fb-reloadButton"}
          style={{ backgroundColor: colors.palette.green600 }}
          {...stopDragHandlers}
          bindtap={handleReload}
        >
          <text
            className={"fb-reloadIcon"}
            style={{ color: colors.palette.staticWhite }}
          >
            {"\u21BB"}
          </text>
        </view>
      </view>
    </>
  );
};
