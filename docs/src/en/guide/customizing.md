---
title: Custom Tabs & Ref
description: Custom tabs, opening the console from code, and button placement.
---

# Custom Tabs & Ref

## Adding your own tab

You can put any debugging information you need into a console tab.

```tsx
import LynxConsole, { type CustomTab } from 'lynx-console';

const customTabs: CustomTab[] = [
  {
    key: 'debug',
    label: 'Debug',
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

## Controlling the console from code

`LynxConsoleHandle` lets you open and close the panel yourself.

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

Wire `close()` into your back-press handler to dismiss the console with the back button.

## Placing the floating button

The default is `{ right: 16, bottom: 84 }`, and each side is independent:

```tsx
<LynxConsole initialPosition={{ top: 50, left: 16 }} />
```

Once the user drags the button, the dragged position wins over `initialPosition`.

## Theme and safe area

```tsx
<LynxConsole theme="dark" safeAreaInsetBottom="34px" />
```

`safeAreaInsetBottom` defaults to `"50px"`.
