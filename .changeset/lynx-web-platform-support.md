---
"lynx-console": minor
---

Lynx Web Platform 지원

`@lynx-js/web-core` 기반 web 환경에서도 콘솔이 동작하도록 플랫폼 분기를 추가했어요. 분기는 `SystemInfo.platform === "web"` 런타임 체크로 통일했고, 네이티브 동작 경로는 그대로예요.

- web의 `lynx.fetch`는 `LynxFetchModule`이 없어 동작하지 않으므로 worker의 `globalThis.fetch`를 원본으로 사용하도록 개선 (`setupNetworkMonitor`)
- web `x-list`가 리렌더마다 가로 스크롤을 리셋해 탭이 첫 번째로 돌아가던 문제를 `display` 토글 방식으로 대체 (`Tabs`)
- web에서 `requestAnimationFrame` 콜백이 유실되면 바텀시트가 열림 애니메이션 시작 상태에 갇히던 문제에 `setTimeout` 폴백 추가 (`BottomSheet`)
- 데스크톱 마우스 클릭으로도 콘솔이 열리도록 web 전용 `tap` 폴백 추가 (`useDrag`)
- 열린 콘솔이 플로팅 버튼을 가리도록 `z-index` 조정 (`FloatingButton.css`)
- web에서 `keyboardstatuschanged` 리스너 등록 시 존재하지 않는 네이티브 모듈을 호출해 패널 마운트가 실패하던 문제 우회 (`useKeyboardHeight`)
- web lynx-core가 미구현 API 호출 시 찍는 `NYI: ...` 노이즈 로그를 로그 목록에서 제외 (`setupLogMonitor`, `_setupMainThreadConsole`)
- web에서 performance entry가 전달되지 않을 때 플로팅 버튼의 FCP 표시를 숨김 (`index`)
