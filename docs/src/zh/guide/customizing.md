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
