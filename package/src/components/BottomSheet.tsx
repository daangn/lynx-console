import {
  type ReactNode,
  runOnBackground,
  useEffect,
  useMainThreadRef,
  useState,
} from "@lynx-js/react";
import type { MainThread } from "@lynx-js/types";
import { useKeyboardHeight } from "../hooks/useKeyboardHeight";
import { useThemeColors } from "../styles/ThemeContext";
import { duration } from "../styles/theme";
import "./BottomSheet.css";

interface BottomSheetProps {
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  isOpen: boolean;
  shouldClose?: boolean;
  safeAreaInsetBottom?: string;
}

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 700;
const DEFAULT_HEIGHT = 500;
const CLOSE_DRAG_THRESHOLD = 30; // 30px 이상 아래로 드래그하면 닫힘
const SHEET_TRANSITION = `transform ${duration.d6} cubic-bezier(0.4, 0, 0.2, 1), height ${duration.d6} cubic-bezier(0.4, 0, 0.2, 1)`;

// 마지막 높이 저장
let savedHeight: number | null = null;

export default function BottomSheet({
  children,
  footer,
  onClose,
  isOpen,
  shouldClose = false,
  safeAreaInsetBottom = "25px",
}: BottomSheetProps) {
  const colors = useThemeColors();
  const [sheetHeight, setSheetHeight] = useState(savedHeight ?? DEFAULT_HEIGHT);
  const [isOpening, setIsOpening] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const keyboardHeight = useKeyboardHeight();

  // 드래그 중 높이는 메인 스레드에서만 바꿔요. touchmove 마다 백그라운드 커밋이 나가면
  // DevTool 이 "CallLepusMethod called too frequently" 경고를 내요
  const contentRef = useMainThreadRef<MainThread.Element | null>(null);
  const dragStartY = useMainThreadRef(0);
  const dragHeight = useMainThreadRef(0);

  // 닫기 애니메이션 처리
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 아래에서 올라오는 애니메이션
  useEffect(() => {
    let done = false;
    const finishOpening = () => {
      if (done) return;
      done = true;
      setIsOpening(false);
    };
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(finishOpening);
    }
    // web BTS에서는 rAF 콜백이 유실될 수 있어 setTimeout으로 보완해요
    const timer = setTimeout(finishOpening, 50);
    return () => clearTimeout(timer);
  }, []);

  // 외부에서 닫기 요청 시 애니메이션 처리
  useEffect(() => {
    if (shouldClose && !isClosing) {
      handleClose();
    }
  }, [shouldClose, isClosing]);

  // 높이 변경 시 저장
  useEffect(() => {
    savedHeight = sheetHeight;
  }, [sheetHeight]);

  if (!isOpen) return null;

  const renderedHeight =
    keyboardHeight > 0
      ? Math.min(MAX_HEIGHT, sheetHeight + keyboardHeight)
      : sheetHeight;

  // 드래그가 끝났을 때 한 번만 백그라운드로 넘겨요
  const commitDrag = (height: number, dragDistance: number) => {
    setSheetHeight(height);
    if (dragDistance > CLOSE_DRAG_THRESHOLD) {
      handleClose();
    }
  };

  const handleTouchStart = (e: MainThread.TouchEvent) => {
    "main thread";
    dragStartY.current = e.detail.y;
    dragHeight.current = sheetHeight;
    contentRef.current?.setStyleProperty("transition", "none");
  };

  const handleTouchMove = (e: MainThread.TouchEvent) => {
    "main thread";
    const deltaY = dragStartY.current - e.detail.y;
    const newHeight = Math.min(
      Math.max(sheetHeight + deltaY, MIN_HEIGHT),
      MAX_HEIGHT,
    );
    dragHeight.current = newHeight;
    const shown =
      keyboardHeight > 0
        ? Math.min(MAX_HEIGHT, newHeight + keyboardHeight)
        : newHeight;
    contentRef.current?.setStyleProperty("height", `${shown}px`);
  };

  const handleTouchEnd = () => {
    "main thread";
    contentRef.current?.setStyleProperty("transition", SHEET_TRANSITION);
    runOnBackground(commitDrag)(
      dragHeight.current,
      sheetHeight - dragHeight.current,
    );
  };

  return (
    <scroll-view
      className="bs-backdrop"
      style={{
        background: colors.bg.overlay,
        opacity: isOpening || isClosing ? 0 : 1,
        transition: `opacity ${duration.d6} cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      <view className="bs-overlay" bindtap={handleClose}>
        <view
          className="bs-content"
          main-thread:ref={contentRef}
          catchtap={() => {}}
          style={{
            background: colors.bg.layerFloating,
            height: `${renderedHeight}px`,
            transform:
              isOpening || isClosing ? "translateY(100%)" : "translateY(0)",
            transition: SHEET_TRANSITION,
          }}
        >
          {/* catchtap: 이벤트 버블링 차단 */}
          <view
            className="bs-handleContainer"
            main-thread:bindtouchstart={handleTouchStart}
            main-thread:bindtouchmove={handleTouchMove}
            main-thread:bindtouchend={handleTouchEnd}
          >
            <view
              className="bs-handle"
              style={{ backgroundColor: colors.palette.gray400 }}
            />
          </view>
          {/* 드래그 핸들 자리를 비워두는 스페이서예요 */}
          <view className="bs-handleSpacer" />
          <view
            className="bs-body"
            style={{
              paddingBottom:
                keyboardHeight > 0
                  ? `${keyboardHeight}px`
                  : safeAreaInsetBottom,
            }}
          >
            {children}
          </view>
          {footer && <view className="bs-footer">{footer}</view>}
        </view>
      </view>
    </scroll-view>
  );
}
