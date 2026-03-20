---
"lynx-console": patch
---

CSS 변수(`var()`)를 inline style로 전환하여 Lynx 런타임 호환성 개선

- 모든 CSS 변수 기반 스타일을 JS 객체 기반 inline style로 전환
- ThemeContext를 통한 light/dark 테마 색상 관리
- tsdown 빌드 설정을 index/setup 엔트리별로 분리하여 lazy loading 시 CSS가 async chunk에 포함되도록 수정
