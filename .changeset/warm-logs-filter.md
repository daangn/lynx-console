---
"lynx-console": minor
---

네트워크 요청과 FCP 를 `%c` 로 꾸민 요약 한 줄과 엔트리 객체로 콘솔에도 찍어요 (Lynx DevTool 에서 보려고요). `initNetworkMonitor({ console: "plain" })` 이면 스타일 없는 텍스트로, `false` 면 안 찍어요.
`__LYNX_CONSOLE__.snapshot()` 이 수집한 로그·네트워크·성능 엔트리를 JSON 문자열로 돌려줘요.
커스텀 탭에 `filter` 를 주면 조건에 맞는 콘솔 로그만 모아 보여줘요. `renderEntry` 로 한 줄을 직접 그릴 수도 있고, `isNetworkLog` 로 네트워크 줄만 고를 수 있어요.
바텀시트의 "Lynx Console" 제목을 없앴어요.
