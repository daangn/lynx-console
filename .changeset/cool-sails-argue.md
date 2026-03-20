---
"lynx-console": patch
---

fix: tsdown 빌드 설정을 index/setup 엔트리별로 분리하여 lazy loading 시 CSS가 async chunk에 포함되도록 수정

- setup.mjs에서 불필요한 CSS banner(`import "./index.css"`) 제거
- PerformancePanel 디버그 버튼 제거
