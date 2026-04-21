# lynx-console

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
