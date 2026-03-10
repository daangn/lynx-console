# lynx-console

An in-app developer console that can be embedded in Lynx apps. View console logs, network requests, and performance metrics in real time.

## Features

- **Console Logs** — View output from `console.log`, `console.error`, and more in real time
- **Main Thread Console** — Capture logs from the main thread
- **Network Monitor** — Inspect method, headers, body, and response of `fetch` requests
- **Performance Monitor** — Track performance metrics such as FCP (First Contentful Paint)
- **Floating Button** — Open and close the console with a floating button that displays the FCP value
- **Light/Dark Theme** support
- **Seed Design** based UI

## Installation

```bash
yarn add lynx-console
```

### Peer Dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
```

## Usage

### 1. Initialize Monitors

Call the monitoring functions at your app's entry point. This setup must run **before** the `LynxConsole` component is rendered.

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

### 2. Render the Component

```tsx
import LynxConsole from "lynx-console";

function App() {
  return (
    <view>
      {/* Your app content */}
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
      {/* Your app content */}
      <Suspense>
        <LynxConsole theme="light" safeAreaInsetBottom="34px" />
      <Suspense>
    </view>
  );
}
```

### Controlling with ref

You can programmatically open and close the console using `LynxConsoleHandle`.

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
      <Suspense>
    </view>
  );
}
```

## API

### `LynxConsole` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `"light" \| "dark"` | `"light"` | Console UI theme |
| `safeAreaInsetBottom` | `string` | `"50px"` | Bottom safe area inset |

### `LynxConsoleHandle`

| Method | Description |
|--------|-------------|
| `open()` | Opens the console |
| `close()` | Closes the console |
| `isOpen()` | Returns whether the console is open |

### Monitor Initialization Functions

| Function | Description |
|----------|-------------|
| `initLogMonitor()` | Captures `console.log`, `console.error`, etc. |
| `initMainThreadConsole()` | Captures console output from the main thread |
| `initNetworkMonitor()` | Intercepts and records `fetch` requests |
| `initPerformanceMonitor()` | Collects performance metrics |
