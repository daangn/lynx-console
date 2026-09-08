// 플로팅 버튼 드래그에서 네이티브(main-thread)와 web 구현에 넘겨주는 컨텍스트와 공용 타입이에요

export const MOVE_THRESHOLD = 5;

export type VerticalAxis = "top" | "bottom";
export type HorizontalAxis = "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface DragContext {
  // 커밋된 현재 위치
  x: number;
  y: number;
  // anchor 방향에 따른 드래그 부호. right/bottom anchor면 드래그 방향과 값 변화가 반대예요
  xSign: 1 | -1;
  ySign: 1 | -1;
  horizontal: HorizontalAxis;
  vertical: VerticalAxis;
  onTap: () => void;
  // 드래그가 시작됐을 때 한 번 불러요
  startDrag: () => void;
  // 드래그가 끝난 위치를 저장하고 releasing 단계로 넘겨요
  commitPosition: (nextX: number, nextY: number) => void;
}
