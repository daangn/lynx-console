---
title: 自定义标签页与 ref
description: 自定义标签页、用代码打开控制台，以及按钮位置。
---

# 自定义标签页与 ref

## 用标签页筛选

控制台顶部的标签页可以同时选中多个，选中的标签页会带下划线。

- 一个都不选时，显示全部。
- 选中多个时取并集：同时打开 `Log` 和 `Network`，就能一起看控制台日志和网络日志。
- 再点一次已选中的标签页就会取消。
- 打开 `Log` 后，左侧会出现日志级别下拉框（`Filter ▼`）。
- 只选中 `Network` 时，会切换到带匹配跳转（`▲` `▼`）的网络专用界面。

搜索框不仅看打印出来的文本，也会搜索网络请求的 URL、请求头和请求 / 响应体。命中的网络行会展开到匹配所在的
区块并高亮。搜索词和网络专用界面共用，切换标签页也不会丢。

向上滚动阅读时，列表不会再跟着新日志往下走。期间新增的条数会显示为 `N new ↓`，点一下就回到底部。

## 添加自己的标签页

任何你需要的调试信息，都可以放进控制台的一个标签页里。带 `renderContent` 的标签页排在分隔线之后，
点击后会把整个正文替换成该内容。

```tsx
import LynxConsole, { type CustomTab } from 'lynx-console';

const customTabs: CustomTab[] = [
  {
    key: 'debug',
    label: 'Debug',
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

## 把控制台日志筛进一个标签页

带 `filter` 的标签页会成为筛选标签页，只收集匹配的控制台条目。它和 `Log`、`Network`、`Perf` 并排，既可以和它们一起打开，也可以单独打开。

```tsx
import LynxConsole, { type CustomTab } from 'lynx-console';

const customTabs: CustomTab[] = [
  // 字符串：打印出来的文本包含它就匹配
  { key: 'track', label: 'Track', filter: 'track' },
  // 正则：打印出来的文本通过 test 就匹配
  { key: 'auth', label: 'Auth', filter: /^auth / },
  // 函数：逐条自行判断
  { key: 'errors', label: 'Errors', filter: (entry) => entry.level === 'error' },
];

console.log('%ctrack%c screen_view', 'color:#db2777;font-weight:bold', '', { screen: 'home' }); // 打开 Track 标签页后就能看到
```

字符串和正则筛选看的是实际打印出来的文本：先去掉 `%c` 样式字符串，并应用 `%s` / `%d`。`%c` 样式在标签页里同样会渲染，所以用彩色标签标记一类日志很方便。

匹配的条目按普通日志行的样式渲染。想自己绘制每一条，传 `renderEntry`，它在只选中该标签页时生效：

```tsx
import { isNetworkLog } from 'lynx-console';

{
  key: 'net',
  label: 'Net',
  filter: isNetworkLog, // 只要网络监视器打印的那些行
  renderEntry: (entry) => <text>{String(entry.args[0])}</text>,
}
```

## 用代码开关控制台

通过 `LynxConsoleHandle` 可以自己打开和关闭面板。

```tsx
import { type LynxConsoleHandle } from 'lynx-console';
import { lazy, useRef } from '@lynx-js/react';

const LynxConsole = lazy(() => import('lynx-console'));

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

把 `close()` 接到返回键的处理逻辑里，按返回键就能关掉控制台。

## 悬浮按钮的位置

默认是 `{ right: 16, bottom: 84 }`，四个方向互相独立：

```tsx
<LynxConsole initialPosition={{ top: 50, left: 16 }} />
```

用户拖动过按钮之后，拖出来的位置会盖过 `initialPosition`。

## 主题和安全区域

```tsx
<LynxConsole theme="dark" safeAreaInsetBottom="34px" />
```

`safeAreaInsetBottom` 默认是 `"50px"`。

## 宽屏上的侧边面板

当 LynxView 的宽度大于高度时，控制台会作为贴在右侧的侧边面板打开。

判断依据是 LynxView 而不是设备：控制台在打开时测量 root，并跟随 `onWindowResize`，
所以折叠或旋转会在两种形态之间切换。

侧边面板会一直顶到屏幕上方，因此内容会留出 `safeAreaInsetTop`（默认 `"24px"`）的内边距。
如果宿主的状态栏高度不同，可以自行传入。

```tsx
<LynxConsole safeAreaInsetTop="44px" />
```

## 替换悬浮按钮

### 1. 使用自己的按钮

传入 `renderFloatingButton` 可替换整个默认按钮，包括重新加载按钮。将 `open` 绑定到点击事件即可打开控制台，`isOpen` 表示面板是否打开。按钮的外观和位置由你决定。

```tsx
import LynxConsole from 'lynx-console';

<LynxConsole
  renderFloatingButton={({ open }) => (
    <view
      style={{ position: 'fixed', right: '16px', bottom: '84px', zIndex: 9997 }}
      bindtap={open}
    >
      <text>Open console</text>
    </view>
  )}
/>
```

### 2. 添加拖动和重新加载按钮

在按钮组件中使用公开的 `useFloatingButtonDrag` Hook。将 `dragHandlers` 展开到可拖动容器，将 `stopDragHandlers` 展开到重新加载等独立操作按钮。Hook 会处理触摸和鼠标的差异，并避免点击重新加载时同时打开控制台。

```tsx
import LynxConsole, { useFloatingButtonDrag } from 'lynx-console';

function MyFloatingButton({ open }: { open: () => void }) {
  const { positionStyle, dragHandlers, stopDragHandlers, dragOverlayHandlers } =
    useFloatingButtonDrag({
      onTap: open,
      initialPosition: { right: 16, bottom: 84 },
    });

  return (
    <>
      {dragOverlayHandlers && (
        <view
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh', zIndex: 9996,
          }}
          {...dragOverlayHandlers}
        />
      )}
      <view
        style={{
          position: 'fixed', ...positionStyle, zIndex: 9997,
          display: 'flex', flexDirection: 'row', alignItems: 'center',
          padding: '8px', gap: '12px', borderRadius: '16px',
          backgroundColor: '#eeeeee',
        }}
        {...dragHandlers}
      >
        <text style={{ color: '#222222' }}>Console</text>
        <view
          {...stopDragHandlers}
          bindtap={() => lynx.reload({}, () => {})}
        >
          <text style={{ color: '#222222' }}>↻</text>
        </view>
      </view>
    </>
  );
}

<LynxConsole renderFloatingButton={({ open }) => <MyFloatingButton open={open} />} />
```

当 `dragOverlayHandlers` 存在时，请渲染透明遮罩，以便网页端的鼠标离开按钮后仍可继续拖动。遮罩的 z-index 应高于页面内容、低于按钮。不要再给拖动容器绑定 `bindtap={open}`，Hook 已处理点击。

请在 `MyFloatingButton` 组件内调用 Hook，不要直接在 `renderFloatingButton` 回调中调用。自定义按钮的初始位置应传给 Hook；`LynxConsole.initialPosition` 仅影响默认按钮。Hook 会记住当前运行时中最后拖动的位置，锚点相同时与默认按钮共享。

### 3. 切换回默认按钮

```tsx
<LynxConsole
  renderFloatingButton={
    enabled && (({ open }) => <MyFloatingButton open={open} />)
  }
/>
```

`enabled` 为 false 时显示默认按钮，省略此属性也一样。渲染回调返回 `null` 则隐藏按钮，此时可通过其他控件调用 `ref.open()`。
