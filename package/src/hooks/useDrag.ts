import { useState } from "@lynx-js/react";
import { isWebPlatform } from "../shared/isWebPlatform";
import type { DragContext, HorizontalAxis, VerticalAxis } from "./dragContext";
import { useMainThreadDrag } from "./useMainThreadDrag";
import { useWebDrag } from "./useWebDrag";

const DEFAULT_RIGHT = 16;
const DEFAULT_BOTTOM = 84;

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

// 플로팅 버튼 드래그예요. 위치·단계 상태는 여기서 들고, 이벤트 처리는 플랫폼별 훅이 맡아요.
// 네이티브는 useMainThreadDrag, web 은 useWebDrag 예요
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
  const isDragging = phase === "dragging";

  const ctx: DragContext = {
    x,
    y,
    xSign: anchors.horizontal === "right" ? -1 : 1,
    ySign: anchors.vertical === "bottom" ? -1 : 1,
    horizontal: anchors.horizontal,
    vertical: anchors.vertical,
    onTap,
    startDrag: () => {
      setPhase("dragging");
    },
    commitPosition: (nextX, nextY) => {
      setX(nextX);
      setY(nextY);
      saved = {
        vertical: anchors.vertical,
        horizontal: anchors.horizontal,
        x: nextX,
        y: nextY,
      };
      setPhase("releasing");
      setTimeout(() => {
        setPhase("idle");
      }, 300);
    },
  };

  // 훅 호출 순서를 지키려고 둘 다 부르고, 플랫폼에 맞는 쪽만 써요
  const mainThread = useMainThreadDrag(ctx);
  const web = useWebDrag(ctx, isDragging);

  // 네이티브는 드래그 중 위치를 main-thread 가 직접 그려서 커밋된 x/y 만 써요
  const currentX = isWebPlatform ? web.currentX : x;
  const currentY = isWebPlatform ? web.currentY : y;

  const positionStyle = {
    [anchors.horizontal]: `${currentX}px`,
    [anchors.vertical]: `${currentY}px`,
  } as { top?: string; left?: string; right?: string; bottom?: string };

  return {
    phase,
    positionStyle,
    handlers: isWebPlatform ? web.handlers : mainThread.handlers,
    dragOverlayHandlers: isWebPlatform ? web.dragOverlayHandlers : null,
    // 네이티브에서 드래그 중 반짝임 효과를 main-thread 가 직접 켜고 끄려고 써요
    shineRef: mainThread.shineRef,
  };
}
