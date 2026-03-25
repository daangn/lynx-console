import { type ReactNode, useEffect, useState } from "@lynx-js/react";
import type { BaseTouchEvent, Target } from "@lynx-js/types";
import { useThemeColors } from "../styles/ThemeContext";
import { duration, fontWeight } from "../styles/theme";
import "./BottomSheet.css";

interface BottomSheetProps {
  children: ReactNode;
  title?: string;
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

// 마지막 높이 저장
let savedHeight: number | null = null;

export default function BottomSheet({
  children,
  title,
  footer,
  onClose,
  isOpen,
  shouldClose = false,
  safeAreaInsetBottom = "25px",
}: BottomSheetProps) {
  const colors = useThemeColors();
  const [sheetHeight, setSheetHeight] = useState(savedHeight ?? DEFAULT_HEIGHT);
  const [tempHeight, setTempHeight] = useState(savedHeight ?? DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(
    savedHeight ?? DEFAULT_HEIGHT,
  );
  const [isOpening, setIsOpening] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // 닫기 애니메이션 처리
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 아래에서 올라오는 애니메이션
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsOpening(false);
    });
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

  const handleTouchStart = (e: BaseTouchEvent<Target>) => {
    setIsDragging(true);
    setDragStartY(e.detail.y);
    setDragStartHeight(sheetHeight);
    setTempHeight(sheetHeight);
  };

  const handleTouchMove = (e: BaseTouchEvent<Target>) => {
    if (!isDragging) return;
    const deltaY = dragStartY - e.detail.y;
    const newHeight = Math.min(
      Math.max(dragStartHeight + deltaY, MIN_HEIGHT),
      MAX_HEIGHT,
    );
    setTempHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // 아래로 일정 30px 이상 드래그하면 닫기
    const dragDistance = dragStartHeight - tempHeight;
    setSheetHeight(tempHeight);
    if (dragDistance > CLOSE_DRAG_THRESHOLD) {
      handleClose();
    }
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
          catchtap={() => {}}
          style={{
            background: colors.bg.layerFloating,
            height: `${isDragging ? tempHeight : sheetHeight}px`,
            transform:
              isOpening || isClosing ? "translateY(100%)" : "translateY(0)",
            transition: isDragging
              ? "none"
              : `transform ${duration.d6} cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {/* catchtap: 이벤트 버블링 차단 */}
          <view
            className="bs-handleContainer"
            bindtouchstart={handleTouchStart}
            bindtouchmove={handleTouchMove}
            bindtouchend={handleTouchEnd}
          >
            <view
              className="bs-handle"
              style={{ backgroundColor: colors.palette.gray400 }}
            />
          </view>
          <view className="bs-header">
            {title && (
              <text
                className="bs-title t7"
                style={{
                  fontWeight: fontWeight.bold,
                  color: colors.fg.neutral,
                }}
              >
                {title}
              </text>
            )}
          </view>
          <view
            className="bs-body"
            style={{
              paddingBottom: safeAreaInsetBottom,
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
