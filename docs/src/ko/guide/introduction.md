---
title: 소개
description: lynx-console 이 무엇인지, 무엇을 보여주는지, 어디서 도는지 정리했어요.
---

# 소개

`lynx-console`은 [Lynx](https://lynxjs.org) 앱에 넣는 인앱 개발자 콘솔이에요.
디버거 없이도 실기기에서 콘솔 로그, `fetch` 요청, 성능 지표를 봐요.

## 뭘 볼 수 있나

- **콘솔** — `console.log`, `console.warn`, `console.error` 출력이요. 레벨 필터, 키워드 검색,
  REPL 을 지원해요.
- **메인 스레드 콘솔** — `'main thread'` 함수에서 찍은 로그도 같이 잡아요.
- **네트워크** — `fetch` 요청의 메서드, 상태 코드, 헤더, 요청 바디, 응답이요.
- **성능** — FCP를 비롯한 Lynx 성능 엔트리와 원시 데이터요.

초기화하지 않은 모니터는 탭이 렌더링되지 않아요.

## 지원 플랫폼

| 플랫폼 | 상태 |
| --- | --- |
| iOS / Android (Lynx 런타임) | 지원해요. iOS는 [빌드 타임 `console` 치환](/ko/guide/getting-started#0-빌드-설정-필수)이 필요해요. |
| [Lynx Web Platform](https://lynxjs.org/guide/start/quick-start.html) | 지원해요. 이 사이트의 [라이브 데모](/ko/guide/demo)가 여기서 돌아가요. |

## 다음으로

- [시작하기](/ko/guide/getting-started) — 설치하고 콘솔을 띄워봐요.
- [데모 실행해보기](/ko/guide/demo) — 브라우저나 Lynx Explorer로 예제를 돌려봐요.
- [API 레퍼런스](/ko/api/) — props, handle, 모니터 초기화 함수요.
