# lynx-console

Lynx 앱에 내장할 수 있는 인앱 개발자 콘솔이에요. 콘솔 로그, 네트워크 요청, 성능 지표를 실시간으로 확인할 수 있어요.

## 특징

- **콘솔 로그** — `console.log`, `console.error` 등의 출력을 실시간으로 확인해요
- **메인 스레드 콘솔** — 메인 스레드의 로그도 캡처해요
- **네트워크 모니터** — `fetch` 요청의 메서드, 헤더, 바디, 응답을 확인할 수 있어요
- **성능 모니터** — FCP(First Contentful Paint) 등 성능 지표를 추적해요
- **플로팅 버튼** — FCP 수치를 표시하는 플로팅 버튼으로 콘솔을 열고 닫을 수 있어요
- **라이트/다크 테마** 지원

## 설치

```bash
yarn add lynx-console
```

### Peer Dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
```

## 사용법

### 1. 모니터 초기화

앱 진입점에서 모니터링 함수를 호출해요. 이 설정은 `LynxConsole` 컴포넌트보다 **먼저** 실행되어야 해요.

```typescript
import {
  initLogMonitor,
  initMainThreadConsole,
  initNetworkMonitor,
  initPerformanceMonitor,
} from "lynx-console/setup";

initLogMonitor();
initMainThreadConsole();
initNetworkMonitor();
initPerformanceMonitor();
```

### 2. 컴포넌트 렌더링

```tsx
import LynxConsole from "lynx-console";

function App() {
  return (
    <view>
      {/* 앱 콘텐츠 */}
      <LynxConsole theme="light" safeAreaInsetBottom="34px" />
    </view>
  );
}
```

### ref로 제어하기

`LynxConsoleHandle`을 통해 프로그래밍 방식으로 콘솔을 열고 닫을 수 있어요.

```tsx
import LynxConsole, { type LynxConsoleHandle } from "lynx-console";
import { useRef } from "@lynx-js/react";

function App() {
  const consoleRef = useRef<LynxConsoleHandle>(null);

  const toggleConsole = () => {
    if (consoleRef.current?.isOpen()) {
      consoleRef.current.close();
    } else {
      consoleRef.current?.open();
    }
  };

  return (
    <view>
      <LynxConsole ref={consoleRef} />
    </view>
  );
}
```

## API

### `LynxConsole` Props

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `theme` | `"light" \| "dark"` | `"light"` | 콘솔 UI 테마 |
| `safeAreaInsetBottom` | `string` | `"50px"` | 하단 Safe Area 여백 |

### `LynxConsoleHandle`

| 메서드 | 설명 |
|--------|------|
| `open()` | 콘솔을 열어요 |
| `close()` | 콘솔을 닫아요 |
| `isOpen()` | 콘솔이 열려 있는지 확인해요 |

### 모니터 초기화 함수

| 함수 | 설명 |
|------|------|
| `initLogMonitor()` | `console.log`, `console.error` 등을 캡처해요 |
| `initMainThreadConsole()` | 메인 스레드의 콘솔 출력을 캡처해요 |
| `initNetworkMonitor()` | `fetch` 요청을 가로채서 기록해요 |
| `initPerformanceMonitor()` | 성능 지표를 수집해요 |
