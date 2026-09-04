---
title: 커스텀 탭과 ref
description: 커스텀 탭, ref 로 열고 닫기, 플로팅 버튼 위치예요.
---

# 커스텀 탭과 ref

## 탭 추가하기

필요한 디버깅 정보를 콘솔 탭으로 넣을 수 있어요.

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

## 코드에서 콘솔 열고 닫기

`LynxConsoleHandle`로 패널을 직접 열고 닫아요.

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

뒤로가기 핸들러에 `close()`를 연결하면 백 버튼으로 콘솔을 닫아요.

## 버튼 위치

기본값은 `{ right: 16, bottom: 84 }` 이고, 각 변이 따로 동작해요.

```tsx
<LynxConsole initialPosition={{ top: 50, left: 16 }} />
```

사용자가 버튼을 한 번 드래그하면 그 위치가 `initialPosition`보다 우선해요.

## 테마와 세이프 에어리어

```tsx
<LynxConsole theme="dark" safeAreaInsetBottom="34px" />
```

`safeAreaInsetBottom` 기본값은 `"50px"` 이에요.
