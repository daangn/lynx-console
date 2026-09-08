import {
  runOnBackground,
  useMainThreadRef,
  useRef,
  useState,
} from "@lynx-js/react";
import type { BaseTouchEvent, MainThread, Target } from "@lynx-js/types";
import { isWebPlatform } from "../shared/isWebPlatform";

const MOVE_THRESHOLD = 5;

const DEFAULT_RIGHT = 16;
const DEFAULT_BOTTOM = 84;

type VerticalAxis = "top" | "bottom";
type HorizontalAxis = "left" | "right";

export interface InitialPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface ResolvedAnchors {
  vertical: VerticalAxis;
  horizontal: HorizontalAxis;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

// web platform은 touch/mouse 이벤트를 W3C 형태로 그대로 넘겨줘서
// 네이티브처럼 detail.x / detail.y 를 갖지 않아요.
interface WebMouseEvent {
  button?: number;
  buttons?: number;
  clientX?: number;
  clientY?: number;
  x?: number;
  y?: number;
}

interface WebTouchEvent {
  changedTouches?: Array<{ clientX?: number; clientY?: number }>;
  touches?: Array<{ clientX?: number; clientY?: number }>;
}

function getMousePoint(e: WebMouseEvent): Point {
  return { x: e.clientX ?? e.x ?? 0, y: e.clientY ?? e.y ?? 0 };
}

function getWebTouchPoint(e: BaseTouchEvent<Target>): Point {
  const webEvent = e as unknown as WebTouchEvent;
  const touch = webEvent.changedTouches?.[0] ?? webEvent.touches?.[0];
  return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
}

function resolveAnchors(initial?: InitialPosition): ResolvedAnchors {
  // top/left이 명시되면 그것이 anchor가 돼요. 둘 다 명시되면 top/left가 이겨요.
  const vertical: VerticalAxis = initial?.top !== undefined ? "top" : "bottom";
  const horizontal: HorizontalAxis =
    initial?.left !== undefined ? "left" : "right";

  const y =
    vertical === "top"
      ? (initial?.top ?? 0)
      : (initial?.bottom ?? DEFAULT_BOTTOM);
  const x =
    horizontal === "left"
      ? (initial?.left ?? 0)
      : (initial?.right ?? DEFAULT_RIGHT);

  return { vertical, horizontal, x, y };
}

interface SavedState {
  vertical: VerticalAxis;
  horizontal: HorizontalAxis;
  x: number;
  y: number;
}

let saved: SavedState | null = null;

interface UseDragOptions {
  initialPosition?: InitialPosition;
}

// 네이티브: 드래그 중 위치는 main-thread 워클릿이 요소 스타일을 직접 바꿔요. touchmove 마다
//   백그라운드 커밋이 나가면 DevTool 이 "CallLepusMethod called too frequently" 경고를 내요.
// web: main-thread 터치 이벤트에 detail.x/y 가 없고 마우스 드래그도 필요해서, 백그라운드에서
//   touch/mouse 이벤트로 같은 상태 머신을 돌려요.
export function useDrag(onTap: () => void, options?: UseDragOptions) {
  const anchors = resolveAnchors(options?.initialPosition);

  // 저장된 위치는 anchor 조합이 동일할 때만 복원해요.
  const snapshot = saved;
  let initX = anchors.x;
  let initY = anchors.y;
  if (
    snapshot !== null &&
    snapshot.vertical === anchors.vertical &&
    snapshot.horizontal === anchors.horizontal
  ) {
    initX = snapshot.x;
    initY = snapshot.y;
  }

  const [x, setX] = useState(initX);
  const [y, setY] = useState(initY);
  const [phase, setPhase] = useState<"idle" | "dragging" | "releasing">("idle");
  // web은 커서가 버튼 밖으로 나가면 mousemove/mouseup이 끊겨요.
  // 누르고 있는 동안 화면 전체에 투명 오버레이를 깔아 이벤트를 계속 받아요.
  const [pressed, setPressed] = useState(false);
  const [tempX, setTempX] = useState(initX);
  const [tempY, setTempY] = useState(initY);

  const draggingRef = useRef(false);
  const recentDragRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, ax: 0, ay: 0 });

  // 네이티브 main-thread 경로에서 쓰는 상태예요
  const mtStartRef = useMainThreadRef({ x: 0, y: 0 });
  const mtDraggingRef = useMainThreadRef(false);
  const mtPosRef = useMainThreadRef({ x: 0, y: 0 });

  // anchor 방향에 따라 드래그 부호 결정. right/bottom anchor면 드래그 방향과 값 변화가 반대.
  const xSign = anchors.horizontal === "right" ? -1 : 1;
  const ySign = anchors.vertical === "bottom" ? -1 : 1;
  const horizontal = anchors.horizontal;
  const vertical = anchors.vertical;

  const startDrag = () => {
    setPhase("dragging");
  };

  // 드래그가 끝난 위치를 저장하고 releasing 단계로 넘어가요
  const commitPosition = (nextX: number, nextY: number) => {
    setX(nextX);
    setY(nextY);
    saved = {
      vertical: anchors.vertical,
      horizontal: anchors.horizontal,
      x: nextX,
      y: nextY,
    };
    setPhase("releasing");
    recentDragRef.current = true;
    setTimeout(() => {
      setPhase("idle");
      recentDragRef.current = false;
    }, 300);
  };

  // ---- 네이티브: main-thread 터치 ----

  const handleMainThreadTouchStart = (e: MainThread.TouchEvent) => {
    "main thread";
    mtStartRef.current = { x: e.detail.x, y: e.detail.y };
    mtPosRef.current = { x, y };
    mtDraggingRef.current = false;
  };

  const handleMainThreadTouchMove = (e: MainThread.TouchEvent) => {
    "main thread";
    const dx = e.detail.x - mtStartRef.current.x;
    const dy = e.detail.y - mtStartRef.current.y;

    if (
      !mtDraggingRef.current &&
      (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)
    ) {
      mtDraggingRef.current = true;
      runOnBackground(startDrag)();
    }

    if (!mtDraggingRef.current) return;

    const nextX = x + xSign * dx;
    const nextY = y + ySign * dy;
    mtPosRef.current = { x: nextX, y: nextY };
    e.currentTarget.setStyleProperties({
      [horizontal]: `${nextX}px`,
      [vertical]: `${nextY}px`,
    });
  };

  const handleMainThreadTouchEnd = () => {
    "main thread";
    if (mtDraggingRef.current) {
      mtDraggingRef.current = false;
      runOnBackground(commitPosition)(mtPosRef.current.x, mtPosRef.current.y);
    } else {
      runOnBackground(onTap)();
    }
  };

  // ---- web: 백그라운드 touch/mouse ----

  const dragStart = (point: Point) => {
    startRef.current = {
      x: point.x,
      y: point.y,
      ax: x,
      ay: y,
    };
    draggingRef.current = false;
  };

  const dragMove = (point: Point) => {
    const dx = point.x - startRef.current.x;
    const dy = point.y - startRef.current.y;

    if (
      !draggingRef.current &&
      (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)
    ) {
      draggingRef.current = true;
      setPhase("dragging");
      setTempX(startRef.current.ax);
      setTempY(startRef.current.ay);
    }

    if (!draggingRef.current) return;

    setTempX(startRef.current.ax + xSign * dx);
    setTempY(startRef.current.ay + ySign * dy);
  };

  // web은 뒤이어 오는 click을 bindtap이 받아서 탭을 처리해요. 여기서는 드래그 종료만 다뤄요.
  const dragEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    commitPosition(tempX, tempY);
  };

  const handleTouchStart = (e: BaseTouchEvent<Target>) => {
    dragStart(getWebTouchPoint(e));
  };

  const handleTouchMove = (e: BaseTouchEvent<Target>) => {
    dragMove(getWebTouchPoint(e));
  };

  const handleMouseDown = (e: WebMouseEvent) => {
    // 우클릭/가운데 클릭은 mouseup이 오지 않을 수 있어 주 버튼만 드래그로 다뤄요.
    if (e.button !== undefined && e.button !== 0) return;

    dragStart(getMousePoint(e));
    setPressed(true);
  };

  const handleMouseUp = () => {
    setPressed(false);
    dragEnd();
  };

  const handleMouseMove = (e: WebMouseEvent) => {
    // 창 밖에서 버튼을 뗀 경우 mouseup이 오지 않아서 눌림 상태로 남지 않도록 복구해요.
    if (e.buttons === 0) {
      handleMouseUp();
      return;
    }
    dragMove(getMousePoint(e));
  };

  const handleWebTap = () => {
    if (recentDragRef.current) return;
    onTap();
  };

  const isDragging = phase === "dragging";
  // 네이티브는 드래그 중 위치를 main-thread 가 직접 그려서 커밋된 x/y 만 써요
  const currentX = isWebPlatform && isDragging ? tempX : x;
  const currentY = isWebPlatform && isDragging ? tempY : y;

  const positionStyle = {
    [anchors.horizontal]: `${currentX}px`,
    [anchors.vertical]: `${currentY}px`,
  } as { top?: string; left?: string; right?: string; bottom?: string };

  const handlers = isWebPlatform
    ? {
        catchtouchstart: handleTouchStart,
        catchtouchmove: handleTouchMove,
        catchtouchend: dragEnd,
        catchmousedown: handleMouseDown,
        catchmousemove: handleMouseMove,
        catchmouseup: handleMouseUp,
        bindtap: handleWebTap,
      }
    : {
        "main-thread:catchtouchstart": handleMainThreadTouchStart,
        "main-thread:catchtouchmove": handleMainThreadTouchMove,
        "main-thread:catchtouchend": handleMainThreadTouchEnd,
      };

  return {
    phase,
    positionStyle,
    handlers,
    // 누르고 있는 동안 화면 전체를 덮는 투명 오버레이용 핸들러예요.
    // 커서가 버튼을 벗어나도 오버레이가 mousemove/mouseup을 대신 받아줘요.
    dragOverlayHandlers:
      isWebPlatform && (pressed || isDragging)
        ? {
            catchmousemove: handleMouseMove,
            catchmouseup: handleMouseUp,
          }
        : null,
  };
}
