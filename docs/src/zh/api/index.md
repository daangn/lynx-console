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
| `safeAreaInsetTop` | `string` | `"24px"` | 顶部安全区域内边距，仅在以侧边面板打开时使用（见下文）。 |
| `customTabs` | `CustomTab[]` | `undefined` | 要在控制台里额外显示的标签页。 |
| `initialPosition` | `{ top?: number; left?: number; right?: number; bottom?: number }` | `{ right: 16, bottom: 84 }` | 悬浮按钮的初始位置（px）。四个方向互相独立，所以可以吸附到任意一个角（例如 `{ top: 50, left: 16 }`）。同时给了 `top` 和 `bottom`（或 `left` 和 `right`）时，`top` / `left` 生效。用户拖动过按钮之后，保存下来的位置优先。 |

## `CustomTab`

标签页是内容标签页或日志筛选标签页两者之一。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 标签页的唯一标识。 |
| `label` | `string` | 标签页的显示文字。 |
| `renderContent` | `() => ReactNode` | 内容标签页：渲染标签页的内容。 |
| `filter` | `string \| RegExp \| (entry: LogEntry) => boolean` | 筛选标签页：只显示匹配的控制台条目。字符串在打印出来的文本（应用 `%c` / `%s` 之后）包含它时匹配，正则在该文本通过 test 时匹配。 |
| `renderEntry` | `(entry: LogEntry) => ReactNode` | 筛选标签页，可选：渲染一条匹配的条目。默认和 Log 标签页的样式相同。 |

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
| `initNetworkMonitor(options?)` | 拦截并记录 `fetch` 请求。 |
| `initPerformanceMonitor(options?)` | 收集性能指标。 |

只有初始化过的监视器，才会显示对应的标签页。

`options.console`（默认 `true`）会把每条收集到的 entry 以一行带 `%c` 样式的摘要加 entry 对象的形式也打印到控制台，这样在 Lynx DevTool 里也能看到。`"plain"` 打印无样式文本，`false` 则不打印。参见 [Lynx DevTool](/zh/guide/devtool)。

## `isNetworkLog(entry)` / `isPerformanceLog(entry)`

返回一个 `LogEntry` 是否是网络监视器或性能监视器打印的行。用于筛选标签页：`filter: isNetworkLog`。
