한국어 | [English](https://github.com/daangn/lynx-console/blob/main/package/README.md)

# lynx-console

Lynx 앱에 내장할 수 있는 인앱 개발자 콘솔이에요. 콘솔 로그, 네트워크 요청, 성능 지표를 실시간으로 확인할 수 있어요.

## 데모

https://github.com/user-attachments/assets/edda4778-ab8d-4cb9-a3c5-bd8c42c81bde

<img width="450" height="450" alt="lynx_bundle_qrcode_fullscreen" src="https://github.com/user-attachments/assets/8bbb9bfe-df2b-436d-ad17-6e4eb4b672c9" />

[Lynx Explorer](https://lynxjs.org/guide/start/quick-start.html#via-lynx-explorer-app) 앱으로 위 QR코드를 스캔해서 데모를 실행해볼 수 있어요.

## 기능

- **콘솔 로그** — `console.log`, `console.error` 등의 출력을 실시간으로 확인해요. 레벨 필터, 키워드 검색, 로그 지우기, 내장 REPL 기능을 지원해요
- **메인 스레드 콘솔** — 백그라운드 스레드 로그와 함께 메인 스레드의 로그도 캡처해요

https://github.com/user-attachments/assets/539fe31a-aca4-468d-b673-3b070b21cd08

- **네트워크 모니터** — `fetch` 요청의 메서드, 상태 코드, 헤더, 요청 바디, 응답을 확인할 수 있어요

https://github.com/user-attachments/assets/edda4778-ab8d-4cb9-a3c5-bd8c42c81bde

- **성능 모니터** — FCP(First Contentful Paint) 등 성능 지표와 원시 엔트리 데이터를 추적해요

https://github.com/user-attachments/assets/d231bdf5-71bb-483f-9bdb-5843279c1308

- **플로팅 버튼** — 최신 FCP 수치를 표시하며, 탭하면 콘솔을 열고, 길게 눌러 드래그하면 위치를 이동할 수 있어요
- **크기 조절 패널** — 핸들을 드래그해 콘솔 패널 높이를 조절하고(200–700px), 아래로 내리면 닫혀요
- **탭 자동 숨김** — 초기화된 모니터의 탭만 표시되고, 초기화하지 않은 모니터의 탭은 표시되지 않아요
- **커스텀 탭** — `customTabs` prop으로 직접 만든 탭을 콘솔에 추가할 수 있어요
- **라이트/다크 모드** 를 지원해요

## 설치

```bash
yarn add lynx-console
```

### Peer Dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
yarn add -D @types/react
```

> **주의:** 각 모니터는 런타임에 해당 Lynx API가 있어야 동작해요. `lynx.fetch`가 없으면 `initNetworkMonitor()`는 경고만 출력하고 건너뛰며, `initPerformanceMonitor()`도 `lynx.performance`가 없으면 동일하게 동작해요.

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

> **주의:** `initMainThreadConsole()`은 로그 모니터에 의존하기 때문에, 반드시 `initLogMonitor()` 이후에 호출해야 해요.

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

```tsx
const LynxConsole = lazy(() => import("lynx-console"));

function App() {
  return (
    <view>
      {/* 앱 콘텐츠 */}
      <Suspense>
        <LynxConsole theme="light" safeAreaInsetBottom="34px" />
      </Suspense>
    </view>
  );
}
```

### 커스텀 탭 추가하기

`customTabs` prop을 사용해 콘솔에 직접 만든 탭을 추가할 수 있어요.

```tsx
import LynxConsole, { type CustomTab } from "lynx-console";

const customTabs: CustomTab[] = [
  {
    key: "debug",
    label: "Debug",
    renderContent: () => <text>커스텀 디버그 콘텐츠</text>,
  },
];

function App() {
  return (
    <view>
      <LynxConsole customTabs={customTabs} />
    </view>
  );
}
```

### ref로 제어하기

`LynxConsoleHandle`을 통해 프로그래밍 방식으로 콘솔을 열고 닫을 수 있어요.

```tsx
import { type LynxConsoleHandle } from "lynx-console";
import { useRef } from "@lynx-js/react";

const LynxConsole = lazy(() => import("lynx-console"));

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
      <Suspense>
        <LynxConsole ref={consoleRef} />
      </Suspense>
    </view>
  );
}
```

back press 핸들러와 연동해서 뒤로 가기 버튼을 눌렀을 때 콘솔을 닫을 수도 있어요.

## API

### `LynxConsole` Props

| 속성                  | 타입                | 기본값      | 설명                         |
| --------------------- | ------------------- | ----------- | ---------------------------- |
| `theme`               | `"light" \| "dark"` | `"light"`   | 콘솔 UI 테마                 |
| `safeAreaInsetBottom` | `string`            | `"50px"`    | 하단 Safe Area 여백          |
| `customTabs`          | `CustomTab[]`       | `undefined` | 콘솔에 추가할 커스텀 탭 목록 |

### `CustomTab`

| 속성            | 타입              | 설명                        |
| --------------- | ----------------- | --------------------------- |
| `key`           | `string`          | 탭의 고유 식별자            |
| `label`         | `string`          | 탭 레이블 텍스트            |
| `renderContent` | `() => ReactNode` | 탭 콘텐츠를 렌더링하는 함수 |

### `LynxConsoleHandle`

| 메서드     | 설명                        |
| ---------- | --------------------------- |
| `open()`   | 콘솔을 열어요               |
| `close()`  | 콘솔을 닫아요               |
| `isOpen()` | 콘솔이 열려 있는지 확인해요 |

### 모니터 초기화 함수

| 함수                       | 설명                                         |
| -------------------------- | -------------------------------------------- |
| `initLogMonitor()`         | `console.log`, `console.error` 등을 캡처해요 |
| `initMainThreadConsole()`  | 메인 스레드의 콘솔 출력을 캡처해요           |
| `initNetworkMonitor()`     | `fetch` 요청을 가로채서 기록해요             |
| `initPerformanceMonitor()` | 성능 지표를 수집해요                         |
