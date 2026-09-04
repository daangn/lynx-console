# lynx-console

## 0.9.1

### Patch Changes

- b2aba5a: README 중국어(간체) 번역을 추가하고, 세 README 의 언어 전환 줄을 맞췄어요

## 0.9.0

### Minor Changes

- 305cc1e: Lynx Web Platform 지원

  `@lynx-js/web-core` 기반 web 환경에서도 콘솔이 동작하도록 플랫폼 분기를 추가했어요. 분기는 `SystemInfo.platform === "web"` 런타임 체크로 통일했고, 네이티브 동작 경로는 그대로예요.

  - web의 `lynx.fetch`는 `LynxFetchModule`이 없어 동작하지 않으므로 worker의 `globalThis.fetch`를 원본으로 사용하도록 개선 (`setupNetworkMonitor`)
  - web `x-list`가 리렌더마다 가로 스크롤을 리셋해 탭이 첫 번째로 돌아가던 문제를 `display` 토글 방식으로 대체 (`Tabs`)
  - web에서 `requestAnimationFrame` 콜백이 유실되면 바텀시트가 열림 애니메이션 시작 상태에 갇히던 문제에 `setTimeout` 폴백 추가 (`BottomSheet`)
  - 데스크톱 마우스 클릭으로도 콘솔이 열리도록 web 전용 `tap` 폴백 추가 (`useDrag`)
  - 열린 콘솔이 플로팅 버튼을 가리도록 `z-index` 조정 (`FloatingButton.css`)
  - web에서 `keyboardstatuschanged` 리스너 등록 시 존재하지 않는 네이티브 모듈을 호출해 패널 마운트가 실패하던 문제 우회 (`useKeyboardHeight`)
  - web lynx-core가 미구현 API 호출 시 찍는 `NYI: ...` 노이즈 로그를 로그 목록에서 제외 (`setupLogMonitor`, `_setupMainThreadConsole`)
  - web에서 performance entry가 전달되지 않을 때 플로팅 버튼의 FCP 표시를 숨김 (`index`)

### Patch Changes

- 026758c: fix: `+json` 접미사 Content-Type(application/graphql-response+json 등) 응답 본문이 Network 탭에 표시되지 않던 문제 수정

## 0.8.0

### Minor Changes

- 0402f09: Lynx 엔진 3.9까지 지원

  - `@lynx-js/types` 3.6~3.9 전 버전에서 타입체크 통과 확인, devDependency를 `^3.9.0`으로 업데이트
  - Lynx 3.7+에서 FCP 지표가 `pipeline`(`loadBundle`/`reloadBundle`) 엔트리에 실려오는 변경 대응 — deprecated된 `metric`(`fcp`) 엔트리와 새 방식 모두에서 FCP를 추출하도록 개선 (`useLatestFcp`, `PerformancePanel`)
  - 존재하지 않는 `colors.fg.accent` 토큰 참조로 typecheck가 실패하던 문제 수정 (`NetworkDetailSection`)

## 0.7.2

### Patch Changes

- abccecb: fix: widen `@lynx-js/react` peer dependency range to `>=0.110.0 <1.0.0`

  In semver, a caret range on a `0.x` version only allows patch updates within the same minor (`^0.110.0` means `>=0.110.0 <0.111.0`), so projects using newer minors like `0.117.x` were getting incorrect peer dependency warnings.

## 0.7.1

### Patch Changes

- ef19145: Make the floating button draggable instantly instead of requiring a long press. This matches vConsole's drag behavior and avoids triggering the native long-press action sheet. Dragging now starts as soon as the finger moves past the threshold; a plain tap still opens the console.

## 0.7.0

### Minor Changes

- 9f59a09: Add search to the Network panel. The search box matches against the request URL, request/response headers, and request/response bodies. Matching requests auto-expand to the tab that contains the hit, the matched text is highlighted, and the list scrolls to the match. Use the ▲/▼ buttons (or Enter) to jump between matches. Request/response headers are collapsed by default and expand on tap or when a match is inside them.

### Patch Changes

- 7652d76: Add a log button to the request/response body section in the Network panel. Tapping it prints the body to console.log, useful for copying body content via Lynx DevTool in environments where clipboard access is unavailable.

## 0.6.1

### Patch Changes

- d3a124a: `LynxConsole`에서 `usePerformance`로 전체 `performances` 배열을 컴포넌트 상태에 복사해 들고 있던 패턴을, FCP만 구독하는 `useLatestFcp` 훅으로 분리.

  - 불필요한 컴포넌트 상태 제거 — `performances` 원본은 `__LYNX_CONSOLE__.state`에 그대로 있어 이중 보관할 필요가 없었음
  - 매 호출마다 새 배열이 들어와 사실상 무효였던 `useMemo` 제거
  - `useState` lazy initializer로 마운트 시점 FCP 값을 첫 렌더에 잡도록 변경 (기존엔 `useEffect` 후에야 채워짐)

- 4eaa62a: `FloatingButton`에서 `consume-slide-event={[[-180, 180]]}` 속성 제거.

  이 속성이 한 군데라도 set되면 iOS는 `UIPanGestureRecognizer`를 LynxView의 root view에 attach해요. 이 root-level recognizer가 UIKit gesture arena에서 list의 `UIScrollView` scroll recognizer와 협상하면서 `shouldBeRequiredToFailByGestureRecognizer: YES` 때문에 list scroll이 매 gesture 시작마다 Lynx pan recognizer의 fail을 기다리게 돼요. 결과적으로 `<list>` 페이지에서 스크롤 시작이 끈적한 느낌을 줘요. (Android는 MotionEvent 인터셉트 방식이라 동일 문제 없음.)

  FloatingButton의 드래그는 `useLongPressDrag`의 long-press 임계로 list scroll과 자연스럽게 구분되므로 이 속성 없이도 동작에 큰 영향 없을 것으로 예상.

- 1409a2a: Add a `fail` handler to the `scrollToPosition` invoke in `LogPanel` to suppress the harmless warning that occurs when an in-progress smooth scroll is interrupted by consecutive logs.

## 0.6.0

### Minor Changes

- c4cb19e: Add `initialPosition` prop to `LynxConsole` so the floating button's initial position can be configured. Accepts any combination of `top`/`left`/`right`/`bottom` in px — only the sides you provide are applied, so the button can be anchored to any corner (e.g. `{ top: 50, left: 16 }`). When both vertical (or both horizontal) sides are set, `top`/`left` win. Defaults to `{ right: 16, bottom: 84 }`. Once the user drags the button, the saved position takes precedence over `initialPosition`.

## 0.5.0

### Minor Changes

- 081666a: Add keyboard avoidance for inputs inside `BottomSheet`. When the on-screen keyboard appears, the sheet expands by the keyboard height (capped at the max) and adds matching bottom padding so `<input>` elements (e.g. search, REPL) stay visible above the keyboard on iOS and Android.

## 0.4.0

### Minor Changes

- d088e07: Support console format specifiers (`%c`, `%s`, `%d`, `%i`, `%f`, `%o`, `%O`, `%%`) in log rendering. `%c` applies inline CSS styles to subsequent text segments, mirroring Chrome DevTools behavior.

## 0.3.1

### Patch Changes

- 8dd20cf: Remove duplicate scrollToBottom call that caused iOS scroll error
- 57962db: fix: main thread에서 Map/Set 등 비-JSON 타입 로깅 시 데이터 손실 수정
- 65adfef: Lower peerDependencies: @lynx-js/react ^0.110.0, @lynx-js/types ^3.6.0
- 2d7384e: Remove `./style.css` export to fix CSS breakage when using dist package in Lynx apps
- 296b3db: Remove unused tokens.json

## 0.3.0

### Minor Changes

- ad9ce9c: update lynx-js version

### Patch Changes

- bbd62f5: refactor style

## 0.2.3

### Patch Changes

- 7ad29cf: fix: tsdown 빌드 설정을 index/setup 엔트리별로 분리하여 lazy loading 시 CSS가 async chunk에 포함되도록 수정

  - setup.mjs에서 불필요한 CSS banner(`import "./index.css"`) 제거
  - PerformancePanel 디버그 버튼 제거

## 0.2.2

### Patch Changes

- 206e58c: CSS 변수(`var()`)를 inline style로 전환하여 Lynx 런타임 호환성 개선

## 0.2.1

### Patch Changes

- 2efcb34: fix: global.css import 누락으로 인한 색상 미적용 문제 수정

## 0.2.0

### Minor Changes

- 701ad51: 커스텀 탭을 지원하고, FadeList의 fade 효과를 제거해요
- 1e4e08e: vanilla-extract 의존성을 제거하고 모든 스타일을 plain CSS로 전환

### Patch Changes

- d5e301f: 사용하지 않는 vanilla-extract webpack plugin 패치 파일 제거
- 6df534e: CSS 변수 prefix를 seed에서 lynx-console로 변경하고 미사용 토큰 제거

## 0.1.1

### Patch Changes

- 55f7e13: fix: list 위에서 FloatingButton 드래그 시 스크롤이 같이 되는 문제 수정
- 1cec832: 패널 버튼 스타일 통일 및 검색 초기화 버튼 추가

  - Network, Performance 패널의 Clear 버튼 사이즈를 Log 패널과 동일하게 축소
  - 버튼 글자색을 진회색(neutralMuted)으로 변경
  - Clear 텍스트를 🗑 아이콘으로 교체
  - 검색어가 있을 때만 표시되는 ✕ 버튼 추가

## 0.1.0

### Minor Changes

- 69f2315: 로그 레벨 필터 드롭다운 추가
- c58fb72: 로그 검색 및 스크롤 fade 효과 추가

### Patch Changes

- 9301716: 드래그 해서 플로팅 위치 변경
- e97f7cb: raise zindex

## 0.0.1

### Patch Changes

- b4b77ef: update readme
