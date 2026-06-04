---
"lynx-console": patch
---

`FloatingButton`에서 `consume-slide-event={[[-180, 180]]}` 속성 제거.

이 속성이 한 군데라도 set되면 iOS는 `UIPanGestureRecognizer`를 LynxView의 root view에 attach해요. 이 root-level recognizer가 UIKit gesture arena에서 list의 `UIScrollView` scroll recognizer와 협상하면서 `shouldBeRequiredToFailByGestureRecognizer: YES` 때문에 list scroll이 매 gesture 시작마다 Lynx pan recognizer의 fail을 기다리게 돼요. 결과적으로 `<list>` 페이지에서 스크롤 시작이 끈적한 느낌을 줘요. (Android는 MotionEvent 인터셉트 방식이라 동일 문제 없음.)

FloatingButton의 드래그는 `useLongPressDrag`의 long-press 임계로 list scroll과 자연스럽게 구분되므로 이 속성 없이도 동작에 큰 영향 없을 것으로 예상.
