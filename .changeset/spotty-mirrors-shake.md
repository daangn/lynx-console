---
"lynx-console": patch
---

빌드 설정 문서에 `fetch: "lynx.fetch"` define 을 추가했어요. 앱에서 그냥 쓴 `fetch()` 가
`initNetworkMonitor()` 가 패치하는 `lynx.fetch` 로 연결돼요
