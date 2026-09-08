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

  // 드래그 중 높이는 메인 스레드에서만 바꿔요. 기준 높이와 키보드 높이도 터치 시작 때의 값을
  // 메인 스레드에 담아 두고 써서, 드래그 중 백그라운드 렌더가 나도 계산이 흔들리지 않아요
  const contentRef = useMainThreadRef<MainThread.Element | null>(null);
  const draggingRef = useMainThreadRef(false);
  const dragStartY = useMainThreadRef(0);
  const dragStartHeight = useMainThreadRef(0);
  const dragKeyboardHeight = useMainThreadRef(0);
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
    setSheetHeight(Math.min(Math.max(height, MIN_HEIGHT), MAX_HEIGHT));
    if (dragDistance > CLOSE_DRAG_THRESHOLD) {
      handleClose();
    }
  };

  const handleTouchStart = (e: MainThread.TouchEvent) => {
    "main thread";
    draggingRef.current = true;
    dragStartY.current = e.detail.y;
    dragStartHeight.current = sheetHeight;
    dragKeyboardHeight.current = keyboardHeight;
    dragHeight.current = sheetHeight;
    contentRef.current?.setStyleProperty("transition", "none");
  };

  const handleTouchMove = (e: MainThread.TouchEvent) => {
    "main thread";
    if (!draggingRef.current) return;
    const deltaY = dragStartY.current - e.detail.y;
    const newHeight = Math.min(
      Math.max(dragStartHeight.current + deltaY, MIN_HEIGHT),
      MAX_HEIGHT,
    );
    dragHeight.current = newHeight;
    const keyboard = dragKeyboardHeight.current;
    const shown =
      keyboard > 0 ? Math.min(MAX_HEIGHT, newHeight + keyboard) : newHeight;
    // 드래그 중 백그라운드 렌더가 style 을 다시 써도 다음 이동에서 바로 되돌리려고 transition 도 같이 써요
    contentRef.current?.setStyleProperties({
      height: `${shown}px`,
      transition: "none",
    });
  };

  // touchstart 없이 온 touchend 는 무시해요. 초기값 0 이 커밋되면 시트가 0px 로 굳어요
  const handleTouchEnd = () => {
    "main thread";
    if (!draggingRef.current) return;
    draggingRef.current = false;
    contentRef.current?.setStyleProperty("transition", SHEET_TRANSITION);
    runOnBackground(commitDrag)(
      dragHeight.current,
      dragStartHeight.current - dragHeight.current,
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
            main-thread:bindtouchcancel={handleTouchEnd}
          >
            <view
              className="bs-handle"
              style={{ backgroundColor: colors.palette.gray400 }}
            />
          </view>
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
