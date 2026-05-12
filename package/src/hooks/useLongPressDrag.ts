import { useRef, useState } from "@lynx-js/react";
import type { BaseTouchEvent, Target } from "@lynx-js/types";

const LONG_PRESS_DURATION = 400;
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

interface UseLongPressDragOptions {
  initialPosition?: InitialPosition;
}

export function useLongPressDrag(
  onTap: () => void,
  options?: UseLongPressDragOptions,
) {
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
  const [tempX, setTempX] = useState(initX);
  const [tempY, setTempY] = useState(initY);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, ax: 0, ay: 0 });

  // anchor 방향에 따라 드래그 부호 결정. right/bottom anchor면 드래그 방향과 값 변화가 반대.
  const xSign = anchors.horizontal === "right" ? -1 : 1;
  const ySign = anchors.vertical === "bottom" ? -1 : 1;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTouchStart = (e: BaseTouchEvent<Target>) => {
    startRef.current = {
      x: e.detail.x,
      y: e.detail.y,
      ax: x,
      ay: y,
    };
    draggingRef.current = false;

    timerRef.current = setTimeout(() => {
      draggingRef.current = true;
      setPhase("dragging");
      setTempX(x);
      setTempY(y);
    }, LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e: BaseTouchEvent<Target>) => {
    const dx = e.detail.x - startRef.current.x;
    const dy = e.detail.y - startRef.current.y;

    if (
      !draggingRef.current &&
      (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)
    ) {
      clearTimer();
    }

    if (!draggingRef.current) return;

    setTempX(startRef.current.ax + xSign * dx);
    setTempY(startRef.current.ay + ySign * dy);
  };

  const handleTouchEnd = () => {
    clearTimer();

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
      setTimeout(() => setPhase("idle"), 300);
    } else {
      onTap();
    }
  };

  const isDragging = phase === "dragging";
  const currentX = isDragging ? tempX : x;
  const currentY = isDragging ? tempY : y;

  const positionStyle = {
    [anchors.horizontal]: `${currentX}px`,
    [anchors.vertical]: `${currentY}px`,
  } as { top?: string; left?: string; right?: string; bottom?: string };

  return {
    phase,
    positionStyle,
    clearTimer,
    handlers: {
      catchtouchstart: handleTouchStart,
      catchtouchmove: handleTouchMove,
      catchtouchend: handleTouchEnd,
    },
  };
}
