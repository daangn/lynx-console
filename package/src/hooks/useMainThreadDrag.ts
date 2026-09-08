import { runOnBackground, useMainThreadRef } from "@lynx-js/react";
import type { MainThread } from "@lynx-js/types";
import { type DragContext, MOVE_THRESHOLD } from "./dragContext";

const DRAGGING_TRANSFORM = "scale(1.05)";
const IDLE_TRANSFORM = "scale(1)";
const SHINE_IN = "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)";
const SHINE_OUT = "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)";

// 네이티브 드래그예요. 위치는 물론 확대·반짝임 효과까지 main-thread 워클릿이 요소 스타일을 직접 바꿔요.
// 드래그 중에 백그라운드 렌더가 나면 인라인 style 전체가 커밋된 위치로 다시 쓰여 버튼이 튀기 때문에,
// 백그라운드에는 손을 뗀 뒤에 한 번만 알려요
export function useMainThreadDrag(ctx: DragContext) {
  const { x, y, xSign, ySign, horizontal, vertical, onTap } = ctx;
  const { commitPosition } = ctx;

  const shineRef = useMainThreadRef<MainThread.Element | null>(null);
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
      e.currentTarget.setStyleProperty("transform", DRAGGING_TRANSFORM);
      shineRef.current?.setStyleProperties({
        transform: "scale(1)",
        opacity: "1",
        transition: SHINE_IN,
      });
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

  const handleTouchEnd = (e: MainThread.TouchEvent) => {
    "main thread";
    if (!draggingRef.current) {
      runOnBackground(onTap)();
      return;
    }
    draggingRef.current = false;
    e.currentTarget.setStyleProperty("transform", IDLE_TRANSFORM);
    shineRef.current?.setStyleProperties({
      opacity: "0",
      transition: SHINE_OUT,
    });
    runOnBackground(commitPosition)(posRef.current.x, posRef.current.y);
  };

  return {
    shineRef,
    handlers: {
      "main-thread:catchtouchstart": handleTouchStart,
      "main-thread:catchtouchmove": handleTouchMove,
      "main-thread:catchtouchend": handleTouchEnd,
      "main-thread:catchtouchcancel": handleTouchEnd,
    },
  };
}
