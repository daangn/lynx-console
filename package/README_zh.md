[English](https://github.com/daangn/lynx-console/blob/main/package/README.md) | [한국어](https://github.com/daangn/lynx-console/blob/main/package/README_ko.md) | 简体中文

# lynx-console

可以嵌入 Lynx 应用的开发者控制台。实时查看控制台日志、网络请求和性能指标。

📖 **[文档站点](https://lynx-console.pages.dev/zh/)** — 指南、API 参考，以及可以在浏览器里直接运行的在线演示。

## 演示

在浏览器里打开 **[lynx-console.pages.dev](https://lynx-console.pages.dev/zh/)** 就能试用 — 首页内嵌了跑在 Lynx Web Platform 上的示例应用。

https://github.com/user-attachments/assets/dcd874bf-ff2e-4a98-ae03-d83de5fae31c

<img width="492" height="492" alt="lynxconsoleqrcodefullscreen" src="https://github.com/user-attachments/assets/ca735109-c531-44ce-bf81-3a61a61ac2e4" />

用 [Lynx Explorer](https://lynxjs.org/guide/start/quick-start.html#via-lynx-explorer-app) 应用扫描上面的二维码，就能体验演示。

## 功能

- **控制台日志** — 实时查看 `console.log`、`console.error` 等输出。支持级别过滤、关键字搜索、清空日志，还内置了 REPL
- **主线程控制台** — 主线程的日志会和后台线程的日志一起被捕获

https://github.com/user-attachments/assets/539fe31a-aca4-468d-b673-3b070b21cd08

- **网络监视器** — 查看 `fetch` 请求的方法、状态码、请求头、请求体和响应

https://github.com/user-attachments/assets/edda4778-ab8d-4cb9-a3c5-bd8c42c81bde

- **性能监视器** — 追踪 FCP（First Contentful Paint）等性能指标，并附带原始 entry 数据

https://github.com/user-attachments/assets/d231bdf5-71bb-483f-9bdb-5843279c1308

- **悬浮按钮** — 显示最新的 FCP 数值；点击打开控制台，长按拖动可以改变位置
- **可调整面板** — 拖动手柄调整控制台面板高度（200–700px）；向下滑动即可关闭
- **标签页自动隐藏** — 只显示已初始化的监视器对应的标签页，没有初始化的不会出现
- **自定义标签页** — 通过 `customTabs` prop 把自己的标签页加到控制台里
- 支持**浅色/深色主题**

## 安装

```bash
yarn add lynx-console
```

### Peer Dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
yarn add -D @types/react
```

## 使用方法

### 0. 配置构建（必需）

在 `lynx.config.ts` 里加上：

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

- **`console`** — 在 iOS 上，Lynx 运行时（JSC）会注入一个独立于 `globalThis.console` 的 `console` 对象。不在构建时替换这个标识符的话，`initLogMonitor()` 打的补丁在 iOS 上不会生效。
- **`fetch`** — 视构建配置而定，不替换成 `lynx.fetch` 的话，网络请求可能不会被记录。

### 1. 初始化监视器

在应用入口调用这些监视函数。这段初始化必须在 `LynxConsole` 组件渲染**之前**执行。

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

> **注意：** 主线程控制台依赖日志监视器，所以 `initMainThreadConsole()` 必须在 `initLogMonitor()` 之后调用。

### 2. 渲染组件

```tsx
import LynxConsole from "lynx-console";

function App() {
  return (
    <view>
      {/* 你的应用内容 */}
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
      {/* 你的应用内容 */}
      <Suspense>
        <LynxConsole theme="light" safeAreaInsetBottom="34px" />
      </Suspense>
    </view>
  );
}
```

### 添加自定义标签页

可以用 `customTabs` prop 把自己的标签页加进控制台。

```tsx
import LynxConsole, { type CustomTab } from "lynx-console";

const customTabs: CustomTab[] = [
  {
    key: "debug",
    label: "Debug",
    renderContent: () => <text>自定义调试内容</text>,
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

### 用 ref 控制

通过 `LynxConsoleHandle` 可以用代码开关控制台。

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

也可以和返回键的处理逻辑结合，让用户按返回键时关掉控制台。

## API

### `LynxConsole` Props

| Prop                  | 类型                | 默认值      | 说明                             |
| --------------------- | ------------------- | ----------- | -------------------------------- |
| `theme`               | `"light" \| "dark"` | `"light"`   | 控制台 UI 主题                   |
| `safeAreaInsetBottom` | `string`            | `"50px"`    | 底部安全区域内边距               |
| `customTabs`          | `CustomTab[]`       | `undefined` | 要在控制台里额外显示的自定义标签页 |
| `initialPosition`     | `{ top?: number; left?: number; right?: number; bottom?: number }` | `{ right: 16, bottom: 84 }` | 悬浮按钮的初始位置（px）。四个方向互相独立，所以可以吸附到任意一个角（例如 `{ top: 50, left: 16 }`）。同时设置 `top`/`bottom`（或 `left`/`right`）时，`top`/`left` 生效。用户拖动过按钮之后，保存下来的位置优先。 |

### `CustomTab`

| 属性            | 类型              | 说明                   |
| --------------- | ----------------- | ---------------------- |
| `key`           | `string`          | 标签页的唯一标识       |
| `label`         | `string`          | 标签页的文字           |
| `renderContent` | `() => ReactNode` | 渲染标签页内容的函数     |

### `LynxConsoleHandle`

| 方法       | 说明                     |
| ---------- | ------------------------ |
| `open()`   | 打开控制台               |
| `close()`  | 关闭控制台               |
| `isOpen()` | 返回控制台是否处于打开状态 |

### 监视器初始化函数

| 函数                       | 说明                                    |
| -------------------------- | --------------------------------------- |
| `initLogMonitor()`         | 捕获 `console.log`、`console.error` 等  |
| `initMainThreadConsole()`  | 捕获主线程的控制台输出                  |
| `initNetworkMonitor()`     | 拦截并记录 `fetch` 请求                 |
| `initPerformanceMonitor()` | 收集性能指标                            |
