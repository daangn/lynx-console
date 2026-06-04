---
"lynx-console": patch
---

`LynxConsole`에서 `usePerformance`로 전체 `performances` 배열을 컴포넌트 상태에 복사해 들고 있던 패턴을, FCP만 구독하는 `useLatestFcp` 훅으로 분리.

- 불필요한 컴포넌트 상태 제거 — `performances` 원본은 `__LYNX_CONSOLE__.state`에 그대로 있어 이중 보관할 필요가 없었음
- 매 호출마다 새 배열이 들어와 사실상 무효였던 `useMemo` 제거
- `useState` lazy initializer로 마운트 시점 FCP 값을 첫 렌더에 잡도록 변경 (기존엔 `useEffect` 후에야 채워짐)
