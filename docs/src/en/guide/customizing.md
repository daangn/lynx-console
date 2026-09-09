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

## Filtering console logs into a tab

The Log tab always shows everything. A tab with `filter` shows only the console entries that match, so you can keep a clean view of the logs you care about.

```tsx
import LynxConsole, { type CustomTab } from 'lynx-console';

const customTabs: CustomTab[] = [
  // string: matches when the printed text contains it
  { key: 'track', label: 'Track', filter: 'track' },
  // RegExp: matches when the printed text passes the test
  { key: 'auth', label: 'Auth', filter: /^auth / },
  // function: decide per entry
  { key: 'errors', label: 'Errors', filter: (entry) => entry.level === 'error' },
];

console.log('%ctrack%c screen_view', 'color:#db2777;font-weight:bold', '', { screen: 'home' }); // shows up in the Track tab
```

String and RegExp filters look at the text as it is printed: `%c` style strings are dropped and `%s` / `%d` are applied first. `%c` styling is rendered in the tab too, so a colored chip is an easy way to mark a log family.

Matched entries are rendered like the Log tab. Pass `renderEntry` to draw each entry yourself:

```tsx
import { isNetworkLog } from 'lynx-console';

{
  key: 'net',
  label: 'Net',
  filter: isNetworkLog, // only the lines the network monitor prints
  renderEntry: (entry) => <text>{String(entry.args[0])}</text>,
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

## Side panel on wide screens

When the LynxView is wider than it is tall, the console opens as a panel docked to the right edge.

The layout follows the LynxView, not the device: the console measures the root on open and follows
`onWindowResize`, so folding or rotating switches it between the two shapes.

Because a side panel reaches the top of the screen, its content is inset by `safeAreaInsetTop` (`"24px"` by
default). Pass the status bar height of your host if that default does not fit.

```tsx
<LynxConsole safeAreaInsetTop="44px" />
```

