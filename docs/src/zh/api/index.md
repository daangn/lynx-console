---
title: API 参考
description: props、console handle 和监视器初始化函数。
---

# API 参考

## `LynxConsole` props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `theme` | `"light" \| "dark"` | `"light"` | 控制台 UI 主题。 |
| `safeAreaInsetBottom` | `string` | `"50px"` | 面板底部的安全区域内边距。 |
| `customTabs` | `CustomTab[]` | `undefined` | 要在控制台里额外显示的标签页。 |
| `initialPosition` | `{ top?: number; left?: number; right?: number; bottom?: number }` | `{ right: 16, bottom: 84 }` | 悬浮按钮的初始位置（px）。四个方向互相独立，所以可以吸附到任意一个角（例如 `{ top: 50, left: 16 }`）。同时给了 `top` 和 `bottom`（或 `left` 和 `right`）时，`top` / `left` 生效。用户拖动过按钮之后，保存下来的位置优先。 |

## `CustomTab`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 标签页的唯一标识。 |
| `label` | `string` | 标签页的文字。 |
| `renderContent` | `() => ReactNode` | 渲染标签页内容。 |

## `LynxConsoleHandle`

通过 `LynxConsole` 上的 `ref` 拿到。

| 方法 | 说明 |
| --- | --- |
| `open()` | 打开控制台。 |
| `close()` | 关闭控制台。 |
| `isOpen()` | 返回控制台是否处于打开状态。 |

## 监视器初始化

从 `lynx-console/setup` 引入，在应用入口调用。

| 函数 | 说明 |
| --- | --- |
| `initLogMonitor()` | 捕获 `console.log`、`console.error` 等输出。 |
| `initMainThreadConsole()` | 捕获主线程的控制台输出。需要先调用 `initLogMonitor()`。 |
| `initNetworkMonitor()` | 拦截并记录 `fetch` 请求。 |
| `initPerformanceMonitor()` | 收集性能指标。 |

只有初始化过的监视器才会渲染对应的标签页。
