---
"lynx-console": patch
---

web에서 플로팅 버튼 드래그 지원

데스크톱 브라우저는 touch 이벤트를 만들지 않아 `catchtouchstart/move/end`에만 의존하던 드래그가 web에서 아예 시작되지 않던 문제를 고쳤어요. 네이티브 touch 경로는 그대로예요.

- web에서 `mousedown/mousemove/mouseup`으로 동일한 드래그 상태 머신을 구동 (`useDrag`)
- 커서가 버튼 밖으로 벗어나도 포인터를 계속 추적하도록, 누르고 있는 동안만 전체 화면 오버레이를 렌더 (`FloatingButton`)
- web의 touch 이벤트는 네이티브와 달리 `detail.x/y`가 없어 `changedTouches` 좌표를 사용하도록 변경 (`useDrag`)
- 드래그 직후 이어지는 `click`으로 콘솔이 열리지 않도록 기존 `recentDrag` 가드를 마우스 경로에도 적용, `touchend`와 `bindtap`이 탭을 중복 처리하지 않도록 정리 (`useDrag`)
- reload 버튼을 누를 때 드래그가 시작되지 않도록 web에서 `mousedown`도 차단 (`FloatingButton`)
