# lynx-console docs site

[Rspress](https://rspress.dev) 로 만든 문서 사이트예요. 문서와 함께 example 앱의 번들도 같은
출력 디렉터리에 담아서, 한 도메인에서 문서와 데모를 모두 서빙해요.

배포된 사이트: https://lynx-console.pages.dev

## 구조

```
docs/
  src/             # 문서 콘텐츠 (en / ko)
  components/      # 홈 히어로 · 기능 그리드 · 설치 3단계 섹션
  theme/           # rspress HomeLayout 교체
  styles/          # 테마 색과 폰트 (CSS 변수)
  scripts/         # example 빌드 산출물을 src/public 으로 옮기는 스크립트
  doc_build/       # 빌드 출력 (gitignore)
```

빌드 결과물은 이런 URL 로 서빙돼요.

| URL | 내용 |
| --- | --- |
| `/` | 문서 (영문) |
| `/ko/` | 문서 (한국어) |
| `/main.lynx.bundle` | Lynx Explorer 용 example 번들 |
| `/main.web.bundle` | Lynx Web Platform 용 example 번들 |
| `/async/*.bundle` | lynx-console lazy chunk |
| `/demo/` | `<lynx-view>` 호스트 셸 (홈에서 iframe 으로 임베드) |

`src/public/`은 전부 생성물이에요. `scripts/sync-demo.mjs`가 `example/dist`와
`example/web/dist`를 복사하고 Lynx Explorer 용 QR 코드를 만들어요.

## 로컬 실행

```bash
# 저장소 루트에서
yarn build && yarn build:example   # 데모 번들을 먼저 만들어요
yarn dev:docs
```

번들을 만들지 않고 `yarn dev:docs`만 실행하면 문서는 뜨지만 `/demo/`는 비어 있어요.

전체 사이트를 한 번에 빌드하려면 저장소 루트에서 이렇게 해요.

```bash
yarn build:site
```

## Cloudflare Pages 설정

빌드 설정은 Pages 대시보드에 있어요. 값은 다음과 같아요.

| 항목 | 값 |
| --- | --- |
| Build command | `yarn build:site` |
| Build output directory | `docs/doc_build` |
| 환경변수 `ASSET_PREFIX` | `https://lynx-console.pages.dev/` |

`ASSET_PREFIX`는 빌드 타임에 Lynx 번들에 박혀요. 없으면 `example/lynx.config.ts`의
`getLocalIP()` 폴백이 들어가서 배포된 번들의 async chunk 로딩이 깨져요.
