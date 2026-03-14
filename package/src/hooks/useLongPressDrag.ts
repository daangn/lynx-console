import { useRef, useState } from "@lynx-js/react";
import type { BaseTouchEvent, Target } from "@lynx-js/types";

const LONG_PRESS_DURATION = 400;
const MOVE_THRESHOLD = 5;

const DEFAULT_RIGHT = 16;
const DEFAULT_BOTTOM = 84;

let savedRight = DEFAULT_RIGHT;
let savedBottom = DEFAULT_BOTTOM;

export function useLongPressDrag(onTap: () => void) {
  const [right, setRight] = useState(savedRight);
  const [bottom, setBottom] = useState(savedBottom);
  const [phase, setPhase] = useState<"idle" | "dragging" | "releasing">("idle");
  const [tempRight, setTempRight] = useState(savedRight);
  const [tempBottom, setTempBottom] = useState(savedBottom);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, r: 0, b: 0 });

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
      r: right,
      b: bottom,
    };
    draggingRef.current = false;

    timerRef.current = setTimeout(() => {
      draggingRef.current = true;
      setPhase("dragging");
      setTempRight(right);
      setTempBottom(bottom);
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

    // right/bottom 기준이므로 방향 반전
    setTempRight(startRef.current.r - dx);
    setTempBottom(startRef.current.b - dy);
  };

  const handleTouchEnd = () => {
    clearTimer();

    if (draggingRef.current) {
      setRight(tempRight);
      setBottom(tempBottom);
      savedRight = tempRight;
      savedBottom = tempBottom;
      setPhase("releasing");
      draggingRef.current = false;
      setTimeout(() => setPhase("idle"), 300);
    } else {
      onTap();
    }
  };

  const isDragging = phase === "dragging";

  return {
    phase,
    right: isDragging ? tempRight : right,
    bottom: isDragging ? tempBottom : bottom,
    clearTimer,
    handlers: {
      bindtouchstart: handleTouchStart,
      bindtouchmove: handleTouchMove,
      bindtouchend: handleTouchEnd,
    },
  };
}
