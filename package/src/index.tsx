import "./styles/vars/index.css";
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
import { FloatingButton } from "./components/FloatingButton.jsx";
import { usePerformance } from "./hooks/usePerformance";
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
}

interface FcpMetric {
  name: string;
  duration: number;
}

interface MetricFcpEntry {
  totalFcp?: FcpMetric;
  lynxFcp?: FcpMetric;
  fcp?: FcpMetric;
}

const LynxConsole = forwardRef<LynxConsoleHandle, LynxConsoleProps>(
  (
    { theme = "light", safeAreaInsetBottom = "50px", customTabs },
    ref: ForwardedRef<LynxConsoleHandle>,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [shouldClose, setShouldClose] = useState(false);
    const { performances } = usePerformance();

    const latestFcp = useMemo(() => {
      for (let i = performances.length - 1; i >= 0; i--) {
        const perf = performances[i];
        if (perf && perf.entryType === "metric" && perf.name === "fcp") {
          const metricEntry = perf.rawEntry as MetricFcpEntry | undefined;
          // totalFcp를 먼저 시도하고, 없으면 lynxFcp 반환
          if (metricEntry?.totalFcp?.duration !== undefined) {
            return metricEntry.totalFcp;
          }
          if (metricEntry?.lynxFcp?.duration !== undefined) {
            return metricEntry.lynxFcp;
          }
        }
      }
      return undefined;
    }, [performances]);

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

    const themeClass = `data-lynx-console-color-mode__${theme}-only`;

    return (
      <view className={themeClass}>
        <FloatingButton bindtap={handleOpenBottomSheet}>
          <text className="fb-title">LynxConsole</text>
          <text className="fb-subtitle">
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
    );
  },
);

export type { CustomTab } from "./types";
export default LynxConsole;
