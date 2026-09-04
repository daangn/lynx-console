---
title: API 레퍼런스
description: props, handle, 모니터 초기화 함수예요.
---

# API 레퍼런스

## `LynxConsole` props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `theme` | `"light" \| "dark"` | `"light"` | 콘솔 UI 테마예요. |
| `safeAreaInsetBottom` | `string` | `"50px"` | 패널 하단 세이프 에어리어 값이에요. |
| `customTabs` | `CustomTab[]` | `undefined` | 콘솔에 추가로 표시할 탭이에요. |
| `initialPosition` | `{ top?: number; left?: number; right?: number; bottom?: number }` | `{ right: 16, bottom: 84 }` | 플로팅 버튼의 초기 위치(px)예요. 각 변이 독립적이라 원하는 모서리에 붙일 수 있어요(예: `{ top: 50, left: 16 }`). `top`과 `bottom` (또는 `left`와 `right`)을 함께 주면 `top` / `left`가 이겨요. 사용자가 버튼을 드래그한 뒤에는 저장된 위치가 우선해요. |

## `CustomTab`

| 속성 | 타입 | 설명 |
| --- | --- | --- |
| `key` | `string` | 탭의 고유 식별자예요. |
| `label` | `string` | 탭에 표시할 텍스트예요. |
| `renderContent` | `() => ReactNode` | 탭 콘텐츠를 렌더하는 함수예요. |

## `LynxConsoleHandle`

`LynxConsole`에 `ref`를 달면 쓸 수 있어요.

| 메서드 | 설명 |
| --- | --- |
| `open()` | 콘솔을 열어요. |
| `close()` | 콘솔을 닫아요. |
| `isOpen()` | 콘솔이 열려 있는지 반환해요. |

## 모니터 초기화 함수

`lynx-console/setup`에서 가져와, 앱 진입점에서 호출해요.

| 함수 | 설명 |
| --- | --- |
| `initLogMonitor()` | `console.log`, `console.error` 등을 캡처해요. |
| `initMainThreadConsole()` | 메인 스레드의 콘솔 출력을 캡처해요. `initLogMonitor()`가 먼저 필요해요. |
| `initNetworkMonitor()` | `fetch` 요청을 가로채서 기록해요. |
| `initPerformanceMonitor()` | 성능 지표를 수집해요. |

초기화한 모니터의 탭만 렌더돼요.
