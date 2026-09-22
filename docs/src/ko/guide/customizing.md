---
title: 커스텀 탭과 ref
description: 커스텀 탭, ref 로 열고 닫기, 플로팅 버튼 위치예요.
---

# 커스텀 탭과 ref

## 탭으로 걸러 보기

콘솔 위쪽 탭은 여러 개를 동시에 켤 수 있어요. 켠 탭에는 밑줄이 생겨요.

- 아무것도 안 켜면 전부 보여줘요
- 여러 개를 켜면 합집합이에요. `Log`와 `Network`를 같이 켜면 콘솔 로그와 네트워크 로그를 함께 봐요
- 켜진 탭을 한 번 더 누르면 꺼져요
- `Log`를 켜면 왼쪽에 레벨 드롭다운(`Filter ▼`)이 나와요
- `Network`만 켜면 매치 순회(`▲` `▼`)가 되는 네트워크 전용 화면으로 바뀌어요

검색창은 찍힌 텍스트뿐 아니라 네트워크 요청의 URL · 헤더 · 본문까지 훑어요. 검색에 걸린 네트워크 줄은
매치가 있는 섹션이 펼쳐진 채로 강조돼요. 검색어는 네트워크 전용 화면과 같이 써서, 탭을 오가도 유지돼요.

## 탭 추가하기

필요한 디버깅 정보를 콘솔 탭으로 넣을 수 있어요. `renderContent`를 준 탭은 구분선 뒤에 놓이고,
누르면 본문을 통째로 그 콘텐츠로 바꿔요.

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

`filter`를 준 탭은 조건에 맞는 로그만 모아 보여주는 필터 탭이 돼요. `Log` · `Network` · `Perf` 옆에 나란히 놓여서, 다른 탭과 같이 켜거나 단독으로 켤 수 있어요.

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

console.log('%ctrack%c screen_view', 'color:#db2777;font-weight:bold', '', { screen: 'home' }); // Track 탭을 켜면 보여요
```

문자열·정규식 필터는 실제로 찍히는 텍스트를 봐요. `%c` 스타일 문자열은 빼고 `%s` · `%d` 서식은 적용한 뒤예요. `%c` 스타일은 탭에서도 그대로 그려지니, 색 칩으로 로그 종류를 표시하기 좋아요.

매칭된 로그는 평소와 같은 모양으로 그려요. 한 줄을 직접 그리고 싶으면 `renderEntry`를 줘요.
`renderEntry`는 그 탭만 단독으로 켰을 때 쓰여요.

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

## 가로가 넓은 화면의 사이드 패널

LynxView의 가로가 세로보다 넓으면 오른쪽에 붙는 사이드 패널로 열려요.

기준은 기기가 아니라 LynxView 예요. 열 때 root 를 재고 `onWindowResize` 를 따라가서, 접거나 회전하면
두 모양 사이를 오가요.

사이드 패널은 화면 맨 위까지 올라오니 콘텐츠에 `safeAreaInsetTop`(기본 `"24px"`) 만큼 여백을 둬요.
호스트의 상태바 높이가 다르면 값을 넘겨요.

```tsx
<LynxConsole safeAreaInsetTop="44px" />
```

