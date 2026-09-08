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

콘텐츠 탭과 로그 필터 탭, 둘 중 하나예요.

| 속성 | 타입 | 설명 |
| --- | --- | --- |
| `key` | `string` | 탭의 고유 식별자예요. |
| `label` | `string` | 탭에 표시할 텍스트예요. |
| `renderContent` | `() => ReactNode` | 콘텐츠 탭: 탭 콘텐츠를 렌더하는 함수예요. |
| `filter` | `string \| RegExp \| (entry: LogEntry) => boolean` | 필터 탭: 조건에 맞는 콘솔 로그만 보여줘요. 문자열은 찍힌 텍스트(`%c` · `%s` 서식 적용 후)에 포함되면, 정규식은 그 텍스트가 통과하면 매칭돼요. |
| `renderEntry` | `(entry: LogEntry) => ReactNode` | 필터 탭 선택 항목: 매칭된 로그 한 줄을 그려요. 기본은 Log 탭과 같은 모양이에요. |

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
| `initNetworkMonitor(options?)` | `fetch` 요청을 가로채서 기록해요. |
| `initPerformanceMonitor(options?)` | 성능 지표를 수집해요. |

초기화한 모니터의 탭만 렌더돼요.

`options.console`(기본값 `true`)을 켜두면 수집한 엔트리를 `%c`로 꾸민 요약 한 줄과 엔트리 객체로 콘솔에도 찍어서, Lynx DevTool 에서 볼 수 있어요. `"plain"`은 스타일 없는 텍스트로 찍고, `false`는 안 찍어요. [Lynx DevTool](/ko/guide/devtool)을 참고해요.

## `isNetworkLog(entry)`

`LogEntry`가 네트워크 모니터가 찍은 줄인지 돌려줘요. 필터 탭에 `filter: isNetworkLog`로 쓰려고 있어요.

## `__LYNX_CONSOLE__.snapshot(options?)`

모니터를 하나라도 초기화하면 생기는 전역 함수예요. 최근 로그·네트워크·성능 엔트리를 담은 JSON 문자열을 돌려줘요. `options.limit`(기본값 `100`)으로 컬렉션별 개수를 제한해요. Lynx DevTool 에서 평가하는 용도예요.
