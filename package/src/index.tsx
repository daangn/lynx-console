import {
  type ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "@lynx-js/react";
import BottomSheet from "./components/BottomSheet.jsx";
import { ConsolePanel } from "./components/ConsolePanel.jsx";
import "./components/FloatingButton.css";
import "./styles/tokens.css";
import { FloatingButton } from "./components/FloatingButton.jsx";
import { useLatestFcp } from "./hooks/useLatestFcp";
import { useViewport } from "./hooks/useViewport";
import { isWebPlatform } from "./shared/isWebPlatform";
import { ThemeProvider } from "./styles/ThemeContext";
import { getColors } from "./styles/theme";
import type { CustomTab } from "./types";

export interface LynxConsoleHandle {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
}

export interface LynxConsoleProps {
  theme?: "light" | "dark";
  safeAreaInsetBottom?: string;
  safeAreaInsetTop?: string;
  customTabs?: CustomTab[];
  initialPosition?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
}

const LynxConsole = forwardRef<LynxConsoleHandle, LynxConsoleProps>(
  (
    {
      theme = "light",
      safeAreaInsetBottom = "50px",
      safeAreaInsetTop,
      customTabs,
      initialPosition,
    },
    ref: ForwardedRef<LynxConsoleHandle>,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [shouldClose, setShouldClose] = useState(false);
    const latestFcp = useLatestFcp();
    const {
      width: viewportWidth,
      height: viewportHeight,
      measure,
    } = useViewport();
    // 가로가 세로보다 긴 화면(펼친 폴더블 · 태블릿 · 가로모드)에서는
    // 바텀시트가 너무 납작해져서 사이드 패널로 열어요
    const layout =
      viewportWidth !== undefined &&
      viewportHeight !== undefined &&
      viewportWidth > viewportHeight
        ? "side"
        : "bottom";
    const colors = useMemo(() => getColors(theme), [theme]);

    useImperativeHandle(ref, () => ({
      open: () => {
        measure();
        setIsOpen(true);
        setShouldClose(false);
      },
      close: () => {
        setShouldClose(true);
      },
      isOpen: () => isOpen,
    }));

    const handleOpenBottomSheet = () => {
      measure();
      setIsOpen(true);
      setShouldClose(false);
    };

    const handleCloseBottomSheet = () => {
      setIsOpen(false);
      setShouldClose(false);
    };

    return (
      <ThemeProvider value={colors}>
        <view
          style={{
            backgroundColor: colors.bg.layerDefault,
            color: colors.fg.neutral,
          }}
        >
          <FloatingButton
            bindtap={handleOpenBottomSheet}
            initialPosition={initialPosition}
          >
            <text
              className="fb-title t4"
              style={{ fontWeight: "400", color: colors.palette.staticWhite }}
            >
              LynxConsole
            </text>
            {/* web은 performance entry가 오지 않아 실제 수집된 경우에만 표시해요 */}
            {(!isWebPlatform || latestFcp) && (
              <text
                className="fb-subtitle t3"
                style={{ fontWeight: "400", color: colors.palette.staticWhite }}
              >
                {`${latestFcp?.name ?? "FCP"}: ${latestFcp?.duration ? latestFcp.duration.toFixed(2) : "--"}ms`}
              </text>
            )}
          </FloatingButton>
          {isOpen && (
            <BottomSheet
              isOpen={isOpen}
              shouldClose={shouldClose}
              onClose={handleCloseBottomSheet}
              safeAreaInsetBottom={safeAreaInsetBottom}
              safeAreaInsetTop={safeAreaInsetTop}
              layout={layout}
              viewportWidth={viewportWidth}
            >
              <ConsolePanel customTabs={customTabs} />
            </BottomSheet>
          )}
        </view>
      </ThemeProvider>
    );
  },
);

export type {
  CustomContentTab,
  CustomLogTab,
  CustomTab,
  LogEntry,
  LogFilter,
  LogLevel,
  MonitorConsoleOptions,
} from "./types";
export { isNetworkLog, isPerformanceLog } from "./utils/networkLog";
export default LynxConsole;
