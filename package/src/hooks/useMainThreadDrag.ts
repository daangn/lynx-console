import { runOnBackground, useMainThreadRef } from "@lynx-js/react";
import type { MainThread } from "@lynx-js/types";
import { type DragContext, MOVE_THRESHOLD } from "./dragContext";

// 네이티브 드래그예요. 드래그 중 위치는 main-thread 워클릿이 요소 스타일을 직접 바꿔요.
export function useMainThreadDrag(ctx: DragContext) {
  const { x, y, xSign, ySign, horizontal, vertical, onTap } = ctx;
  const { startDrag, commitPosition } = ctx;

  const startRef = useMainThreadRef({ x: 0, y: 0 });
  const draggingRef = useMainThreadRef(false);
  const posRef = useMainThreadRef({ x: 0, y: 0 });

  const handleTouchStart = (e: MainThread.TouchEvent) => {
    "main thread";
    startRef.current = { x: e.detail.x, y: e.detail.y };
    posRef.current = { x, y };
    draggingRef.current = false;
  };

  const handleTouchMove = (e: MainThread.TouchEvent) => {
    "main thread";
    const dx = e.detail.x - startRef.current.x;
    const dy = e.detail.y - startRef.current.y;

    if (
      !draggingRef.current &&
      (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD)
    ) {
      draggingRef.current = true;
      runOnBackground(startDrag)();
    }

    if (!draggingRef.current) return;

    const nextX = x + xSign * dx;
    const nextY = y + ySign * dy;
    posRef.current = { x: nextX, y: nextY };
    e.currentTarget.setStyleProperties({
      [horizontal]: `${nextX}px`,
      [vertical]: `${nextY}px`,
    });
  };

  const handleTouchEnd = () => {
    "main thread";
    if (draggingRef.current) {
      draggingRef.current = false;
      runOnBackground(commitPosition)(posRef.current.x, posRef.current.y);
    } else {
      runOnBackground(onTap)();
    }
  };

  return {
    "main-thread:catchtouchstart": handleTouchStart,
    "main-thread:catchtouchmove": handleTouchMove,
    "main-thread:catchtouchend": handleTouchEnd,
  };
}
