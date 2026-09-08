import { useRef, useState } from "@lynx-js/react";
import type { BaseTouchEvent, Target } from "@lynx-js/types";
import { type DragContext, MOVE_THRESHOLD, type Point } from "./dragContext";

// web platform은 touch/mouse 이벤트를 W3C 형태로 그대로 넘겨줘서
// 네이티브처럼 detail.x / detail.y 를 갖지 않아요.
export interface WebMouseEvent {
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

function getTouchPoint(e: BaseTouchEvent<Target>): Point {
  const webEvent = e as unknown as WebTouchEvent;
  const touch = webEvent.changedTouches?.[0] ?? webEvent.touches?.[0];
  return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
}

// web 드래그예요. main-thread 터치 이벤트에 detail.x/y 가 없고 마우스 드래그도 필요해서,
// 백그라운드에서 touch/mouse 이벤트로 상태 머신을 돌려요
export function useWebDrag(ctx: DragContext, isDragging: boolean) {
  const { x, y, xSign, ySign, onTap, startDrag, commitPosition } = ctx;

  // 커서가 버튼 밖으로 나가면 mousemove/mouseup이 끊겨요.
  // 누르고 있는 동안 화면 전체에 투명 오버레이를 깔아 이벤트를 계속 받아요.
  const [pressed, setPressed] = useState(false);
  const [tempX, setTempX] = useState(x);
  const [tempY, setTempY] = useState(y);

  const draggingRef = useRef(false);
  const recentDragRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, ax: 0, ay: 0 });

  const dragStart = (point: Point) => {
    startRef.current = { x: point.x, y: point.y, ax: x, ay: y };
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
      startDrag();
      setTempX(startRef.current.ax);
      setTempY(startRef.current.ay);
    }

    if (!draggingRef.current) return;

    setTempX(startRef.current.ax + xSign * dx);
    setTempY(startRef.current.ay + ySign * dy);
  };

  // 뒤이어 오는 click을 bindtap이 받아서 탭을 처리해요. 여기서는 드래그 종료만 다뤄요.
  const dragEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    recentDragRef.current = true;
    setTimeout(() => {
      recentDragRef.current = false;
    }, 300);
    commitPosition(tempX, tempY);
  };

  const handleTouchStart = (e: BaseTouchEvent<Target>) => {
    dragStart(getTouchPoint(e));
  };

  const handleTouchMove = (e: BaseTouchEvent<Target>) => {
    dragMove(getTouchPoint(e));
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

  // 드래그 직후 이어지는 click 으로 콘솔이 열리지 않게 막아요
  const handleTap = () => {
    if (recentDragRef.current) return;
    onTap();
  };

  return {
    // 드래그 중에는 커밋 전 임시 위치를 그려요
    currentX: isDragging ? tempX : x,
    currentY: isDragging ? tempY : y,
    handlers: {
      catchtouchstart: handleTouchStart,
      catchtouchmove: handleTouchMove,
      catchtouchend: dragEnd,
      catchmousedown: handleMouseDown,
      catchmousemove: handleMouseMove,
      catchmouseup: handleMouseUp,
      bindtap: handleTap,
    },
    // 누르고 있는 동안 화면 전체를 덮는 투명 오버레이용 핸들러예요.
    // 커서가 버튼을 벗어나도 오버레이가 mousemove/mouseup을 대신 받아줘요.
    dragOverlayHandlers:
      pressed || isDragging
        ? { catchmousemove: handleMouseMove, catchmouseup: handleMouseUp }
        : null,
  };
}
