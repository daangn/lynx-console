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
      customTabs,
      initialPosition,
    },
    ref: ForwardedRef<LynxConsoleHandle>,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [shouldClose, setShouldClose] = useState(false);
    const latestFcp = useLatestFcp();
    const colors = useMemo(() => getColors(theme), [theme]);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
        setShouldClose(false);
      },
      close: () => {
        setShouldClose(true);
      },
      isOpen: () => isOpen,
    }));

    const handleOpenBottomSheet = () => {
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
            <text
              className="fb-subtitle t3"
              style={{ fontWeight: "400", color: colors.palette.staticWhite }}
            >
              {`${latestFcp?.name ?? "FCP"}: ${latestFcp?.duration ? latestFcp.duration.toFixed(2) : "--"}ms`}
            </text>
          </FloatingButton>
          {isOpen && (
            <BottomSheet
              isOpen={isOpen}
              shouldClose={shouldClose}
              onClose={handleCloseBottomSheet}
              title="Lynx Console"
              safeAreaInsetBottom={safeAreaInsetBottom}
            >
              <ConsolePanel customTabs={customTabs} />
            </BottomSheet>
          )}
        </view>
      </ThemeProvider>
    );
  },
);

export type { CustomTab } from "./types";
export default LynxConsole;
