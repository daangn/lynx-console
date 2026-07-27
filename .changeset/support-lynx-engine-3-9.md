---
"lynx-console": minor
---

Lynx 엔진 3.9까지 지원

- `@lynx-js/types` 3.6~3.9 전 버전에서 타입체크 통과 확인, devDependency를 `^3.9.0`으로 업데이트
- Lynx 3.7+에서 FCP 지표가 `pipeline`(`loadBundle`/`reloadBundle`) 엔트리에 실려오는 변경 대응 — deprecated된 `metric`(`fcp`) 엔트리와 새 방식 모두에서 FCP를 추출하도록 개선 (`useLatestFcp`, `PerformancePanel`)
- 존재하지 않는 `colors.fg.accent` 토큰 참조로 typecheck가 실패하던 문제 수정 (`NetworkDetailSection`)
