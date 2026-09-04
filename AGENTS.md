# AGENTS.md

Lynx 앱에 넣는 인앱 개발자 콘솔(`lynx-console`)과, 예제 앱 · 문서 사이트를 함께 두는
모노레포예요.

## 워크스페이스

| 경로 | 이름 | 역할 |
| --- | --- | --- |
| `package/` | `lynx-console` | npm 에 배포하는 라이브러리. tsdown 으로 빌드해요 |
| `example/` | `lynx-console-test` | 예제 앱. rspeedy 로 lynx / web 두 environment 를 빌드하고, `example/web` 은 브라우저용 `<lynx-view>` 호스트 셸이에요 |
| `docs/` | `lynx-console-docs` | Rspress 문서 사이트. 예제 번들을 같이 담아 한 도메인에서 서빙해요 |

## 커맨드

저장소 루트에서 실행해요.

```bash
yarn build          # package 빌드 (다른 빌드보다 먼저 해야 해요)
yarn dev            # package watch 빌드
yarn dev:example    # 예제 앱 실행 (터미널에 QR 코드가 떠요)
yarn build:example  # 예제 번들 빌드 (lynx / web)
yarn dev:docs       # 문서 사이트 개발 서버
yarn build:site     # 문서 + 데모 전체 빌드 → docs/doc_build
yarn check          # biome 검사
yarn format         # biome 자동 수정
```

`package/dist` 는 gitignore 라, 클린 클론에서는 `yarn build` 를 먼저 돌리지 않으면
`lynx-console/setup` 을 찾지 못해 예제 빌드가 깨져요.

## 문서 사이트 규칙

- 콘텐츠는 `docs/src/en` 과 `docs/src/ko` 에 **양쪽 다** 둬요. 한쪽만 고치지 않아요.
- 한국어 문서는 해요체로 써요. 영어를 그대로 옮긴 듯한 문장이나, 코드 스팬 뒤 조사 앞
  띄어쓰기(`` `foo` 는 ``)를 만들지 않아요.
- 기본 언어(en)는 라우트에서 `/en` 접두사가 빠져요. 영문 문서의 내부 링크는 `/guide/...`,
  한국어는 `/ko/guide/...` 로 써요.
- `.md` 에서는 raw HTML/JSX 가 렌더되지 않고 사라져요. `<a>`, `<img>`, style 객체가 필요하면
  파일 확장자를 `.mdx` 로 바꿔요.
- `docs/src/public/` 은 전부 생성물이에요. `docs/scripts/sync-demo.mjs` 가 예제 빌드
  산출물과 Lynx Explorer QR 을 만들어 넣어요. 직접 파일을 두지 않아요.
- 배포 도메인과 데모 번들 주소는 `docs/siteMeta.mjs` 한 곳에 있어요.
- 테마 색과 폰트는 `docs/styles/global.css` 의 CSS 변수로 바꿔요.
- 홈은 기본 테마 대신 `docs/theme/index.tsx` 에서 `HomeLayout` 을 갈아끼워 그려요.

## 배포 (Cloudflare Pages)

빌드 설정은 레포가 아니라 Pages 대시보드에 있어요.

| 항목 | 값 |
| --- | --- |
| Build command | `yarn build:site` |
| Build output directory | `docs/doc_build` |
| 환경변수 `ASSET_PREFIX` | `https://lynx-console.pages.dev/` |

`ASSET_PREFIX` 는 빌드 타임에 Lynx 번들에 박혀요. 빠지면 `example/lynx.config.ts` 의
`getLocalIP()` 폴백이 들어가 배포본의 async chunk 로딩이 깨져요.

## 주의할 점

- `example/lynx.config.ts` 의 `source.include` 에 경로 의존 정규식(`/lynx-console/` 같은)을
  쓰지 않아요. 클론 디렉터리 이름에 우연히 매칭돼 로컬만 통과하고 CI 에서 깨져요.
  `path.resolve(__dirname, ...)` 나 `[\\/]node_modules[\\/]<pkg>[\\/]` 형태로 써요.
- `package/**` 를 고치면 changeset 이 필요해요 (CI 가 검사해요). `yarn changeset` 으로 만들어요.
- 커밋 메시지는 한국어로 써요.

## 참고 문서

- Rspress: https://rspress.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Lynx: https://lynxjs.org
