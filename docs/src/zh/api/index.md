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
| `renderFloatingButton` | `false \| ((props: FloatingButtonRenderProps) => ReactNode)` | `undefined` | 替换默认按钮及重新加载按钮，接收 `open` 和 `isOpen`。返回 `null` 可隐藏按钮。自定义按钮自行处理位置和手势；`initialPosition` 仅适用于默认按钮。传入 `false` 或省略此属性会使用默认按钮。可以通过 `enabled && renderer` 按条件切换。回调返回 `null` 时仍会隐藏按钮。 |

## `CustomTab`

标签页是内容标签页或日志筛选标签页两者之一。筛选标签页和内置的 `Log` / `Network` / `Perf` 标签页并排，可以同时选中多个；内容标签页排在分隔线之后，会替换整个正文。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `key` | `string` | 标签页的唯一标识。 |
| `label` | `string` | 标签页的显示文字。 |
| `renderContent` | `() => ReactNode` | 内容标签页：渲染标签页的内容。 |
| `filter` | `string \| RegExp \| (entry: LogEntry) => boolean` | 筛选标签页：只显示匹配的控制台条目。字符串在打印出来的文本（应用 `%c` / `%s` 之后）包含它时匹配，正则在该文本通过 test 时匹配。 |
| `renderEntry` | `(entry: LogEntry) => ReactNode` | 筛选标签页，可选：只选中该标签页时，用它渲染一条匹配的条目。默认和普通日志行的样式相同。 |

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

只有初始化过的监视器，才会显示对应的标签页。一个标签页都没选中时，显示全部条目。

`options.console`（默认 `true`）会把每条收集到的 entry 以一行带 `%c` 样式的摘要加 entry 对象的形式也打印到控制台，这样在 Lynx DevTool 里也能看到。`"plain"` 打印无样式文本，`false` 则不打印。参见 [Lynx DevTool](/zh/guide/devtool)。

## `isNetworkLog(entry)` / `isPerformanceLog(entry)`

返回一个 `LogEntry` 是否是网络监视器或性能监视器打印的行。用于筛选标签页：`filter: isNetworkLog`。

## `useFloatingButtonDrag`

为自定义按钮添加拖动的公开 Hook。可从 `lynx-console` 导入，同时提供 `UseFloatingButtonDragOptions` 和 `InitialPosition` 类型。

```tsx
const drag = useFloatingButtonDrag({ onTap: open, initialPosition: { right: 16, bottom: 84 } });
```

| Option | Type | Description |
| --- | --- | --- |
| `onTap` | `() => void` | 未拖动的点击回调。 |
| `initialPosition` | `InitialPosition` | 初始位置，单位 px，默认为 `{ right: 16, bottom: 84 }`。 |

| Return | Description |
| --- | --- |
| `positionStyle` | 展开到 fixed 容器的 style 中。 |
| `dragHandlers` | 展开到拖动容器，已包含点击处理。 |
| `stopDragHandlers` | 展开到独立子按钮，再绑定该按钮自己的 `bindtap`。 |
| `dragOverlayHandlers` | 非 null 时展开到全屏透明遮罩上（网页端）。 |
| `phase` | `idle`、`dragging` 或 `releasing`，可用于视觉反馈。 |
