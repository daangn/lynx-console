---
title: 시작하기
description: 설치, 빌드 설정, 모니터 초기화, 콘솔 렌더까지의 과정이에요.
---

# 시작하기

## 설치

```bash
yarn add lynx-console
```

### Peer dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
yarn add -D @types/react
```

## 0. 빌드 설정 (필수)

`lynx.config.ts`에 다음을 추가해요.

```typescript title="lynx.config.ts"
export default defineConfig({
  source: {
    define: {
      console: 'globalThis.console',
      fetch: 'lynx.fetch',
    },
  },
});
```

- **`console`** — iOS 의 JSC 는 `globalThis.console` 과 다른 `console` 을 주입해요. 치환하지
  않으면 `initLogMonitor()` 가 iOS 에서 동작하지 않아요.
- **`fetch`** — 빌드 설정에 따라 `lynx.fetch` 로 주입하지 않으면 네트워크 로깅이 되지 않을 수 있어요.

## 1. 모니터 초기화하기

`LynxConsole` 이 렌더되기 **전에**, 앱 진입점에서 호출해요.

```typescript title="src/index.tsx"
import {
  initLogMonitor,
  initMainThreadConsole,
  initNetworkMonitor,
  initPerformanceMonitor,
} from 'lynx-console/setup';

initLogMonitor();
initMainThreadConsole();
initNetworkMonitor();
initPerformanceMonitor();
```

:::warning
메인 스레드 콘솔이 로그 모니터 위에서 동작하기 때문에 `initLogMonitor()`를
`initMainThreadConsole()`보다 먼저 호출해야 해요.
:::

초기화하지 않은 모니터는 탭이 렌더링되지 않아요.

## 2. 컴포넌트 렌더하기

```tsx title="src/App.tsx"
import LynxConsole from 'lynx-console';

function App() {
  return (
    <view>
      {/* 앱 콘텐츠 */}
      <LynxConsole theme="light" safeAreaInsetBottom="34px" />
    </view>
  );
}
```

lazy를 통해 메인 번들에서 분리할 수 있어요.

```tsx title="src/App.tsx"
import { lazy, Suspense } from '@lynx-js/react';

const LynxConsole = lazy(() => import('lynx-console'));

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

앱을 실행하고 버튼을 누르면 패널이 열려요.

## 다음으로

- [커스텀 탭과 ref](/ko/guide/customizing) — 탭을 추가하거나 코드에서 콘솔을 열어요.
- [API 레퍼런스](/ko/api/) — prop과 함수를 한 표에서 봐요.
