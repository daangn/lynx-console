---
title: 快速开始
description: 安装、配置构建、初始化监视器、渲染控制台。
---

# 快速开始

## 安装

```bash
yarn add lynx-console
```

### Peer dependencies

```bash
yarn add @lynx-js/react @lynx-js/types
yarn add -D @types/react
```

## 0. 配置构建（必需）

在 `lynx.config.ts` 里加上：

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

- **`console`** — iOS 的 JSC 注入的 `console` 并*不是* `globalThis.console`。不做这个替换，
  `initLogMonitor()` 在 iOS 上不会生效。
- **`fetch`** — 取决于你的构建配置，不替换成 `lynx.fetch` 的话网络请求可能不会被记录。

## 1. 初始化监视器

在应用入口调用，要在 `LynxConsole` 渲染**之前**。

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
主线程控制台建立在日志监视器之上，所以 `initLogMonitor()` 必须在 `initMainThreadConsole()`
之前调用。
:::

没有初始化的监视器，不会渲染对应的标签页。

## 2. 渲染组件

```tsx title="src/App.tsx"
import LynxConsole from 'lynx-console';

function App() {
  return (
    <view>
      {/* 你的应用 */}
      <LynxConsole theme="light" safeAreaInsetBottom="34px" />
    </view>
  );
}
```

也可以用 `lazy` 把它从主包里拆出去：

```tsx title="src/App.tsx"
import { lazy, Suspense } from '@lynx-js/react';

const LynxConsole = lazy(() => import('lynx-console'));

function App() {
  return (
    <view>
      {/* 你的应用 */}
      <Suspense>
        <LynxConsole theme="light" safeAreaInsetBottom="34px" />
      </Suspense>
    </view>
  );
}
```

运行应用，点一下悬浮按钮，面板就打开了。

## 下一步

- [自定义标签页与 ref](/zh/guide/customizing) — 添加自己的标签页，或者用代码打开控制台。
- [API 参考](/zh/api/) — 所有 prop 和函数都在一张表里。
