---
"lynx-console": minor
---

네트워크 요청과 성능 엔트리를 `%c`로 꾸민 요약 한 줄과 엔트리 객체로 콘솔에도 찍어요 (Lynx DevTool에서 보려고요). `initNetworkMonitor({ console: "plain" })`이면 스타일 없는 텍스트로, `false`면 안 찍어요.
Log 탭에서는 이 로그들이 Network · Perf 탭 항목과 같은 UI로 그려져요.
커스텀 탭에 `filter`를 주면 조건에 맞는 콘솔 로그만 모아 보여줘요. `renderEntry`로 한 줄을 직접 그릴 수도 있고, `isNetworkLog` · `isPerformanceLog`로 모니터 로그만 고를 수 있어요.
바텀시트의 "Lynx Console" 제목을 없애고, 시트 높이 조절과 플로팅 버튼 드래그를 main-thread 워클릿으로 옮겼어요.
