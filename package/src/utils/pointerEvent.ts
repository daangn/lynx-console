import type { BaseTouchEvent, Target } from "@lynx-js/types";
import { isWebPlatform } from "../shared/isWebPlatform";

export interface Point {
  x: number;
  y: number;
}

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

export function getMousePoint(e: WebMouseEvent): Point {
  return { x: e.clientX ?? e.x ?? 0, y: e.clientY ?? e.y ?? 0 };
}

export function getTouchPoint(e: BaseTouchEvent<Target>): Point {
  if (!isWebPlatform) {
    return { x: e.detail.x, y: e.detail.y };
  }

  const webEvent = e as unknown as WebTouchEvent;
  const touch = webEvent.changedTouches?.[0] ?? webEvent.touches?.[0];
  return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
}
