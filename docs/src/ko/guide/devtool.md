---
title: Lynx DevTool
description: Lynx DevTool 과 MCP 에서 네트워크·성능 데이터를 읽는 방법이에요.
---

# Lynx DevTool

Lynx DevTool 에는 Network 패널이 없어요. 그래서 네트워크 모니터와 성능 모니터가 수집한 내용을 콘솔에도 같이 찍어요.

## 무엇이 찍히나요

완료된 요청마다 요약 한 줄과 엔트리 객체를 찍어요. 줄은 `%c` 스타일이 들어가 있어서, Lynx DevTool 에서도 콘솔의 Log 탭에서도 메서드는 색 칩으로, 상태는 초록·빨강으로 보여요.

```
GET 200 https://api.example.com/items 123ms  ▸ {url, method, requestHeaders, responseBody, …}
```

실패한 요청은 `console.error`로 찍혀서, DevTool CLI 의 `--level error`로 걸러져요. 성능 엔트리도 같은 방식으로 전부 찍혀요. `pipeline loadBundle FCP 812.34ms` 한 줄과 엔트리 객체예요.

콘솔 자체의 Log 탭에서는 이 줄들이 텍스트로 보이지 않아요. 네트워크 줄은 Network 탭과 같은 행으로 그려져서 누르면 General · Request · Response 가 열리고, 성능 줄은 Perf 탭과 같은 행으로 그려져요.

이 줄만 따로 모아 보려면 `filter: isNetworkLog`나 `filter: isPerformanceLog`를 준 [필터 탭](/ko/guide/customizing#콘솔-로그를-골라-탭으로-보기)을 만들어요.

## 텍스트로만 찍거나 끄기

logcat, CI 로그, `get-console`을 읽는 에이전트처럼 `%c`를 못 그리는 곳에서는 스타일 문자열이 노이즈가 돼요. `"plain"`을 주면 스타일 없는 텍스트로 찍고, `false`를 주면 안 찍어요.

```typescript
initNetworkMonitor({ console: "plain" });
initPerformanceMonitor({ console: false });
```
