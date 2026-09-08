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

## 콘솔 로그를 골라 탭으로 보기

Log 탭에는 항상 전부 보여요. `filter`를 준 탭은 그중 조건에 맞는 로그만 모아 보여줘서, 보고 싶은 로그만 깔끔하게 볼 수 있어요.

```tsx
import LynxConsole, { type CustomTab } from 'lynx-console';

const customTabs: CustomTab[] = [
  // 문자열: 찍힌 텍스트에 포함되면 매칭돼요
  { key: 'track', label: 'Track', filter: 'track' },
  // 정규식: 찍힌 텍스트가 통과하면 매칭돼요
  { key: 'auth', label: 'Auth', filter: /^auth / },
  // 함수: 엔트리마다 직접 판정해요
  { key: 'errors', label: 'Errors', filter: (entry) => entry.level === 'error' },
];

console.log('%ctrack%c screen_view', 'color:#db2777;font-weight:bold', '', { screen: 'home' }); // Track 탭에 보여요
```

문자열·정규식 필터는 실제로 찍히는 텍스트를 봐요. `%c` 스타일 문자열은 빼고 `%s` · `%d` 서식은 적용한 뒤예요. `%c` 스타일은 탭에서도 그대로 그려지니, 색 칩으로 로그 종류를 표시하기 좋아요.

매칭된 로그는 Log 탭과 같은 모양으로 그려요. 한 줄을 직접 그리고 싶으면 `renderEntry`를 줘요.

```tsx
import { isNetworkLog } from 'lynx-console';

{
  key: 'net',
  label: 'Net',
  filter: isNetworkLog, // 네트워크 모니터가 찍은 줄만
  renderEntry: (entry) => <text>{String(entry.args[0])}</text>,
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
