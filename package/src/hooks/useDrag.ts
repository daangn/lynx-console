import { useRef, useState } from "@lynx-js/react";
import type { BaseTouchEvent, Target } from "@lynx-js/types";
import { isWebPlatform } from "../shared/isWebPlatform";
import {
  getMousePoint,
  getTouchPoint,
  type Point,
  type WebMouseEvent,
} from "../utils/pointerEvent";

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

  // anchor 방향에 따라 드래그 부호 결정. right/bottom anchor면 드래그 방향과 값 변화가 반대.
  const xSign = anchors.horizontal === "right" ? -1 : 1;
  const ySign = anchors.vertical === "bottom" ? -1 : 1;

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

  const dragEnd = () => {
    if (draggingRef.current) {
      setX(tempX);
      setY(tempY);
      saved = {
        vertical: anchors.vertical,
        horizontal: anchors.horizontal,
        x: tempX,
        y: tempY,
      };
      setPhase("releasing");
      draggingRef.current = false;
      recentDragRef.current = true;
      setTimeout(() => {
        setPhase("idle");
        recentDragRef.current = false;
      }, 300);
    } else if (!isWebPlatform) {
      // web은 뒤이어 오는 click을 bindtap이 받아서 처리해요. 여기서 부르면 두 번 열려요.
      onTap();
    }
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

  const handleWebTap = () => {
    if (recentDragRef.current) return;
    onTap();
  };

  const isDragging = phase === "dragging";
  const currentX = isDragging ? tempX : x;
  const currentY = isDragging ? tempY : y;

  const positionStyle = {
    [anchors.horizontal]: `${currentX}px`,
    [anchors.vertical]: `${currentY}px`,
  } as { top?: string; left?: string; right?: string; bottom?: string };

  const mouseHandlers = {
    catchmousedown: handleMouseDown,
    catchmousemove: handleMouseMove,
    catchmouseup: handleMouseUp,
  };

  return {
    phase,
    positionStyle,
    handlers: {
      catchtouchstart: handleTouchStart,
      catchtouchmove: handleTouchMove,
      catchtouchend: dragEnd,
      ...(isWebPlatform ? { bindtap: handleWebTap, ...mouseHandlers } : {}),
    },
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
