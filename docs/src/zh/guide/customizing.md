---
title: 自定义标签页与 ref
description: 自定义标签页、用代码打开控制台，以及按钮位置。
---

# 自定义标签页与 ref

## 添加自己的标签页

任何你需要的调试信息，都可以放进控制台的一个标签页里。

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

Log 标签页始终显示全部日志。带 `filter` 的标签页只显示匹配的条目，方便只看你关心的那部分。

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

console.log('%ctrack%c screen_view', 'color:#db2777;font-weight:bold', '', { screen: 'home' }); // 会出现在 Track 标签页
```

字符串和正则筛选看的是实际打印出来的文本：先去掉 `%c` 样式字符串，并应用 `%s` / `%d`。`%c` 样式在标签页里同样会渲染，所以用彩色标签标记一类日志很方便。

匹配的条目按 Log 标签页的样式渲染。想自己绘制每一条，传 `renderEntry`：

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
