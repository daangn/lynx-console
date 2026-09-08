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

실패한 요청은 `console.error`로 찍혀서, DevTool CLI 의 `--level error`로 걸러져요. FCP 는 `FCP 812.34ms` 형태로 원본 성능 엔트리와 함께 찍혀요.

찍히는 객체의 요청·응답 바디는 2,000자에서 잘려요. Network 탭에는 전체가 남아 있어요.

이 줄만 따로 모아 보려면 `filter: isNetworkLog`를 준 [필터 탭](/ko/guide/customizing#콘솔-로그를-골라-탭으로-보기)을 만들어요.

## 텍스트로만 찍거나 끄기

logcat, CI 로그, `get-console`을 읽는 에이전트처럼 `%c`를 못 그리는 곳에서는 스타일 문자열이 노이즈가 돼요. `"plain"`을 주면 스타일 없는 텍스트로 찍고, `false`를 주면 안 찍어요.

```typescript
initNetworkMonitor({ console: "plain" });
initPerformanceMonitor({ console: false });
```

## 한 번에 전부 읽기

DevTool CLI 의 `get-console`은 몇 초만 듣고, 객체는 `objectId`로만 보여줘요. 전체 이력이 필요하면 DevTool 이나 MCP 에서 이 식을 평가해요.

```javascript
__LYNX_CONSOLE__.snapshot()
```

최근 로그·네트워크·성능 엔트리를 담은 JSON 문자열을 돌려줘요. `{ limit: 50 }`을 넘기면 컬렉션별 개수를 바꿀 수 있어요(기본값 100). 순환 참조, `Map`, `Set`, `Error`도 안전하게 직렬화해요.
