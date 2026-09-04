[한국어](https://github.com/daangn/lynx-console/blob/main/package/README_ko.md) | English

# lynx-console

An in-app developer console that can be embedded in Lynx apps. View console logs, network requests, and performance metrics in real time.

📖 **[Documentation](https://lynx-console.pages.dev)** — guides, API reference, and a live demo you can run in your browser.

## Demo

Try it in your browser at **[lynx-console.pages.dev](https://lynx-console.pages.dev)** — the home page embeds the example app running on the Lynx Web Platform.

https://github.com/user-attachments/assets/dcd874bf-ff2e-4a98-ae03-d83de5fae31c

<img width="492" height="492" alt="lynxconsoleqrcodefullscreen" src="https://github.com/user-attachments/assets/ca735109-c531-44ce-bf81-3a61a61ac2e4" />

Scan the QR code above with the [Lynx Explorer](https://lynxjs.org/guide/start/quick-start.html#via-lynx-explorer-app) app to try the demo.

## Features

- **Console Logs** — View output from `console.log`, `console.error`, and more in real time. Supports level filtering, keyword search, log clearing, and a built-in REPL
- **Main Thread Console** — Capture logs from the main thread alongside background thread logs

https://github.com/user-attachments/assets/539fe31a-aca4-468d-b673-3b070b21cd08

- **Network Monitor** — Inspect method, status, headers, request body, and response of `fetch` requests

https://github.com/user-attachments/assets/edda4778-ab8d-4cb9-a3c5-bd8c42c81bde

- **Performance Monitor** — Track FCP (First Contentful Paint) and other performance metrics with raw entry details

https://github.com/user-attachments/assets/d231bdf5-71bb-483f-9bdb-5843279c1308

- **Floating Button** — Displays the latest FCP value; tap to open the console, long-press and drag to reposition it
- **Resizable Panel** — Drag the handle to resize the console panel (200–700px); swipe down to dismiss
- **Tab Visibility** — Only tabs for initialized monitors are shown; uninitialized monitors are automatically hidden
- **Custom Tabs** — Add your own tabs to the console via the `customTabs` prop
- **Light/Dark Theme** support

## Installation

```bash
yarn add lynx-console
```

### Peer Dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
yarn add -D @types/react
```

## Usage

### 0. Configure Build (Required)

Add the following to your `lynx.config.ts`:

```typescript
export default defineConfig({
  source: {
    define: {
      console: "globalThis.console",
      fetch: "lynx.fetch",
    },
  },
});
```

- **`console`** — on iOS, the Lynx runtime (JSC) injects a separate `console` object that is different from `globalThis.console`. Patches applied by `initLogMonitor()` won't take effect on iOS unless you replace the identifier at build time.
- **`fetch`** — depending on your build setup, network requests may not be logged unless it is replaced with `lynx.fetch`.

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

> **Note:** `initLogMonitor()` must be called before `initMainThreadConsole()`, as the main thread console depends on the log monitor being initialized first.

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
      </Suspense>
    </view>
  );
}
```

### Adding Custom Tabs

You can add your own tabs to the console using the `customTabs` prop.

```tsx
import LynxConsole, { type CustomTab } from "lynx-console";

const customTabs: CustomTab[] = [
  {
    key: "debug",
    label: "Debug",
    renderContent: () => <text>Custom debug content</text>,
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
      </Suspense>
    </view>
  );
}
```

You can also integrate it with a back press handler so that the console closes when the back button is pressed.

## API

### `LynxConsole` Props

| Prop                  | Type                | Default     | Description                                      |
| --------------------- | ------------------- | ----------- | ------------------------------------------------ |
| `theme`               | `"light" \| "dark"` | `"light"`   | Console UI theme                                 |
| `safeAreaInsetBottom` | `string`            | `"50px"`    | Bottom safe area inset                           |
| `customTabs`          | `CustomTab[]`       | `undefined` | Additional custom tabs to display in the console |
| `initialPosition`     | `{ top?: number; left?: number; right?: number; bottom?: number }` | `{ right: 16, bottom: 84 }` | Initial position (px) of the floating button. Each side is independent, so you can anchor it to any corner (e.g. `{ top: 50, left: 16 }`). When both `top` and `bottom` (or both `left` and `right`) are set, `top`/`left` win. Once the user drags the button, the saved position takes precedence. |

### `CustomTab`

| Property        | Type              | Description                           |
| --------------- | ----------------- | ------------------------------------- |
| `key`           | `string`          | Unique identifier for the tab         |
| `label`         | `string`          | Tab label text                        |
| `renderContent` | `() => ReactNode` | Function that renders the tab content |

### `LynxConsoleHandle`

| Method     | Description                         |
| ---------- | ----------------------------------- |
| `open()`   | Opens the console                   |
| `close()`  | Closes the console                  |
| `isOpen()` | Returns whether the console is open |

### Monitor Initialization Functions

| Function                   | Description                                   |
| -------------------------- | --------------------------------------------- |
| `initLogMonitor()`         | Captures `console.log`, `console.error`, etc. |
| `initMainThreadConsole()`  | Captures console output from the main thread  |
| `initNetworkMonitor()`     | Intercepts and records `fetch` requests       |
| `initPerformanceMonitor()` | Collects performance metrics                  |
