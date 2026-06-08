# lynx-console

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
