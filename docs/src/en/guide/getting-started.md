---
title: Getting Started
description: Install, configure the build, initialize the monitors, render the console.
---

# Getting Started

## Installation

```bash
yarn add lynx-console
```

### Peer dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
yarn add -D @types/react
```

## 0. Configure your build (required)

Add this to your `lynx.config.ts`:

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

- **`console`** — iOS JSC injects a `console` that is *not* `globalThis.console`. Without the
  replacement, `initLogMonitor()` has no effect on iOS.
- **`fetch`** — depending on your build setup, network requests may not be logged unless it is replaced with `lynx.fetch`.

## 1. Initialize the monitors

Call these at your app's entry point, **before** `LynxConsole` renders.

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
The main thread console builds on top of the log monitor, so `initLogMonitor()` must be called
before `initMainThreadConsole()`.
:::

Tabs are not rendered for monitors you did not initialize.

## 2. Render the component

```tsx title="src/App.tsx"
import LynxConsole from 'lynx-console';

function App() {
  return (
    <view>
      {/* your app */}
      <LynxConsole theme="light" safeAreaInsetBottom="34px" />
    </view>
  );
}
```

You can split it out of the main bundle with `lazy`:

```tsx title="src/App.tsx"
import { lazy, Suspense } from '@lynx-js/react';

const LynxConsole = lazy(() => import('lynx-console'));

function App() {
  return (
    <view>
      {/* your app */}
      <Suspense>
        <LynxConsole theme="light" safeAreaInsetBottom="34px" />
      </Suspense>
    </view>
  );
}
```

Run the app, tap the floating button, and the panel opens.

## Next steps

- [Custom Tabs & Ref](/guide/customizing) — add your own tab, or open the console from code.
- [API Reference](/api/) — every prop and function in one table.
