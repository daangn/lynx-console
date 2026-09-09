import { type ReactNode, useEffect, useRef, useState } from "@lynx-js/react";
import type { BaseTouchEvent, Target } from "@lynx-js/types";
import { useKeyboardHeight } from "../hooks/useKeyboardHeight";
import { isWebPlatform } from "../shared/isWebPlatform";
import { useThemeColors } from "../styles/ThemeContext";
import { duration } from "../styles/theme";
import {
  getMousePoint,
  getTouchPoint,
  type Point,
  type WebMouseEvent,
} from "../utils/pointerEvent";
import "./BottomSheet.css";

export type SheetLayout = "bottom" | "side";

type SheetPhase = "opening" | "open" | "closing";

interface BottomSheetProps {
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  isOpen: boolean;
  shouldClose?: boolean;
  safeAreaInsetBottom?: string;
  /** side 레이아웃은 화면 위까지 덮어서 상태바 높이만큼 안쪽 여백이 필요해요 */
  safeAreaInsetTop?: string;
  /** 가로가 더 긴 화면(폴더블 · 태블릿 · 가로모드)에서는 side 로 열어요 */
  layout?: SheetLayout;
  /** side 레이아웃에서 최대 너비를 화면에 맞춰 제한하는 데 써요 */
  viewportWidth?: number;
}

const MIN_HEIGHT = 200;
const MAX_HEIGHT = 700;
const DEFAULT_HEIGHT = 500;

const MIN_WIDTH = 280;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 420;
// 화면 전체를 덮지 않도록 남겨두는 최소 여백이에요
const SIDE_MIN_GAP = 64;

const CLOSE_DRAG_THRESHOLD = 30; // 30px 이상 바깥쪽으로 드래그하면 닫힘

// 마지막 크기 저장 (레이아웃별로 따로 기억해요)
let savedHeight: number | null = null;
let savedWidth: number | null = null;

export default function BottomSheet({
  children,
  footer,
  onClose,
  isOpen,
  shouldClose = false,
  safeAreaInsetBottom = "25px",
  safeAreaInsetTop = "24px",
  layout = "bottom",
  viewportWidth,
}: BottomSheetProps) {
  const colors = useThemeColors();
  const isSide = layout === "side";

  const minSize = isSide ? MIN_WIDTH : MIN_HEIGHT;
  const maxSize = isSide
    ? Math.max(
        MIN_WIDTH,
        Math.min(MAX_WIDTH, (viewportWidth ?? MAX_WIDTH) - SIDE_MIN_GAP),
      )
    : MAX_HEIGHT;
  const defaultSize = Math.min(
    Math.max(
      isSide ? (savedWidth ?? DEFAULT_WIDTH) : (savedHeight ?? DEFAULT_HEIGHT),
      minSize,
    ),
    maxSize,
  );

  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<SheetPhase>("opening");
  const keyboardHeight = useKeyboardHeight();
  // 드래그 핸들러는 state 대신 ref 를 봐요. touchmove 와 touchend 가 붙어 들어오면
  // 아직 리렌더 전이라 클로저의 size · isDragging 이 한 프레임 뒤처져요
  const sizeRef = useRef(defaultSize);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ pointer: 0, size: defaultSize });
  // 드래그 직후의 click 을 backdrop 이 받아 닫지 않도록 하는 표시예요
  const recentDragRef = useRef(false);

  // 닫기 애니메이션 처리
  const handleClose = () => {
    setPhase("closing");
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // 화면 밖에서 밀려 들어오는 애니메이션
  useEffect(() => {
    // 여는 도중 닫히면 그대로 둬요
    const finishOpening = () =>
      setPhase((current) => (current === "opening" ? "open" : current));
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(finishOpening);
    }
    // web BTS에서는 rAF 콜백이 유실될 수 있어 setTimeout으로 보완해요
    const timer = setTimeout(finishOpening, 50);
    return () => clearTimeout(timer);
  }, []);

  // 외부에서 닫기 요청 시 애니메이션 처리
  useEffect(() => {
    if (shouldClose && phase !== "closing") {
      handleClose();
    }
  }, [shouldClose, phase]);

  // 지금 크기가 어느 레이아웃의 값인지 기억해요
  const sizeLayoutRef = useRef(isSide);

  // 크기 변경 시 저장. 레이아웃이 막 바뀐 프레임은 아직 이전 레이아웃의 크기라 건너뛰어요
  useEffect(() => {
    if (sizeLayoutRef.current !== isSide) return;
    if (isSide) {
      savedWidth = size;
    } else {
      savedHeight = size;
    }
  }, [size, isSide]);

  // 화면이 접히거나 회전하면 그 레이아웃의 크기로 갈아끼우고, 좁아진 화면에는 다시 맞춰요
  useEffect(() => {
    const layoutChanged = sizeLayoutRef.current !== isSide;
    sizeLayoutRef.current = isSide;
    const base = layoutChanged
      ? isSide
        ? (savedWidth ?? DEFAULT_WIDTH)
        : (savedHeight ?? DEFAULT_HEIGHT)
      : size;
    const next = Math.min(Math.max(base, minSize), maxSize);
    if (next !== size) {
      sizeRef.current = next;
      setSize(next);
    }
  }, [isSide, minSize, maxSize, size]);

  if (!isOpen) return null;

  // side 는 가로, bottom 은 세로 좌표로 크기를 조절해요
  const axisOf = (point: Point) => (isSide ? point.x : point.y);

  const dragBegin = (point: Point) => {
    dragOriginRef.current = { pointer: axisOf(point), size: sizeRef.current };
    draggingRef.current = true;
    setIsDragging(true);
  };

  const dragMove = (point: Point) => {
    if (!draggingRef.current) return;
    // 바깥쪽(아래 · 오른쪽)으로 끌면 작아져요
    const origin = dragOriginRef.current;
    const delta = origin.pointer - axisOf(point);
    // 드래그 중에는 transition 을 꺼둬서 크기를 바로 반영해도 돼요
    const next = Math.min(Math.max(origin.size + delta, minSize), maxSize);
    sizeRef.current = next;
    setSize(next);
  };

  const dragEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);

    // 바깥쪽으로 30px 이상 드래그하면 닫기
    if (dragOriginRef.current.size - sizeRef.current > CLOSE_DRAG_THRESHOLD) {
      handleClose();
      return;
    }
    // 드래그 끝에 따라오는 click 이 backdrop 을 눌러 닫지 않도록 잠깐 막아요
    recentDragRef.current = true;
    setTimeout(() => {
      recentDragRef.current = false;
    }, 300);
  };

  const handleMouseDown = (e: WebMouseEvent) => {
    // 우클릭/가운데 클릭은 mouseup이 오지 않을 수 있어 주 버튼만 드래그로 다뤄요.
    if (e.button !== undefined && e.button !== 0) return;
    dragBegin(getMousePoint(e));
  };

  const handleMouseMove = (e: WebMouseEvent) => {
    // 창 밖에서 버튼을 뗀 경우 mouseup이 오지 않아서 눌림 상태로 남지 않도록 복구해요.
    if (e.buttons === 0) {
      dragEnd();
      return;
    }
    dragMove(getMousePoint(e));
  };

  const handleBackdropTap = () => {
    if (recentDragRef.current) return;
    handleClose();
  };

  const handleMouseHandlers = isWebPlatform
    ? { catchmousedown: handleMouseDown }
    : {};

  // web은 커서가 핸들 밖으로 나가면 mousemove/mouseup이 끊겨요.
  // 드래그하는 동안 화면 전체에 투명 오버레이를 깔아 이벤트를 계속 받아요.
  const showDragOverlay = isWebPlatform && isDragging;

  // bottom 레이아웃은 키보드가 시트를 가려 높이를 키워요.
  // side 레이아웃은 이미 전체 높이라 body 아래 여백만 확보해요.
  const sheetHeight =
    !isSide && keyboardHeight > 0
      ? Math.min(MAX_HEIGHT, size + keyboardHeight)
      : size;

  const hiddenTransform = isSide ? "translateX(100%)" : "translateY(100%)";
  const visibleTransform = isSide ? "translateX(0)" : "translateY(0)";
  const isVisible = phase === "open";
  const sizeStyle = isSide
    ? { width: `${size}px` }
    : { height: `${sheetHeight}px` };
  const sizeTransition = isSide ? "width" : "height";

  return (
    <scroll-view
      className="bs-backdrop"
      style={{
        background: colors.bg.overlay,
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${duration.d6} cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      <view
        className={isSide ? "bs-overlay bs-overlay--side" : "bs-overlay"}
        bindtap={handleBackdropTap}
      >
        {showDragOverlay && (
          <view
            className="bs-dragOverlay"
            catchtap={() => {}}
            catchmousemove={handleMouseMove}
            catchmouseup={dragEnd}
          />
        )}
        <view
          className={isSide ? "bs-content bs-content--side" : "bs-content"}
          catchtap={() => {}}
          style={{
            background: colors.bg.layerFloating,
            ...sizeStyle,
            transform: isVisible ? visibleTransform : hiddenTransform,
            transition: isDragging
              ? "none"
              : `transform ${duration.d6} cubic-bezier(0.4, 0, 0.2, 1), ${sizeTransition} ${duration.d6} cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {/* catchtap: 이벤트 버블링 차단 */}
          <view
            className={
              isSide
                ? "bs-handleContainer bs-handleContainer--side"
                : "bs-handleContainer"
            }
            bindtouchstart={(e: BaseTouchEvent<Target>) =>
              dragBegin(getTouchPoint(e))
            }
            bindtouchmove={(e: BaseTouchEvent<Target>) =>
              dragMove(getTouchPoint(e))
            }
            bindtouchend={dragEnd}
            {...handleMouseHandlers}
          >
            <view
              className={isSide ? "bs-handle bs-handle--side" : "bs-handle"}
              style={{ backgroundColor: colors.palette.gray400 }}
            />
          </view>
          {!isSide && <view className="bs-handleSpacer" />}
          <view
            className={isSide ? "bs-body bs-body--side" : "bs-body"}
            style={{
              paddingBottom:
                keyboardHeight > 0
                  ? `${keyboardHeight}px`
                  : safeAreaInsetBottom,
              ...(isSide ? { paddingTop: safeAreaInsetTop } : {}),
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
