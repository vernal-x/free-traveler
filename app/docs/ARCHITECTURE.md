# Free Traveler — Architecture

**Document ID:** ARCH-TRAVEL-001
**기반 문서:** `package.json`, `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`,
`design-reference/D-001/DESIGN.md`, `design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`, `TASKS/TASK_MANIFEST.csv`
**대상:** 개발팀
**상태:** 구현 경계 정의(Implementation Boundary) — 이 문서는 "무엇을 어떻게 만들지"의 기술
경계만 다루며, 요구사항 자체(REQ-FUNC/REQ-NF)와 Task별 상세 AC는 각각
`docs/UIUX_TRACEABILITY.md`와 `TASKS/TASK-<ID>.md`가 정본이다.

---

## 1. 기술 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js App Router**(현재 `next@16.3.4`) | `src/app/` 디렉터리 라우팅, React Server Component 기본 |
| 언어 | **TypeScript**(`strict: true`, `tsconfig.json` 확인됨) | `@/*` → `src/*` path alias 사용 |
| UI 런타임 | React 19 | `react@19.2.8`, `react-dom@19.2.8` |
| 스타일 | Tailwind CSS v4(CSS-first, `@import "tailwindcss"` — `tailwind.config.*` 파일 불필요) | 토큰은 `design-reference/D-001/DESIGN.md`를 정본으로 CSS 변수/유틸리티에 반영 |
| 데이터/인증 | **Supabase**(PostgreSQL + Auth) | 범위는 §7 참고 — 범용 백엔드가 아니다 |
| DB 접근 | Supabase JS 클라이언트의 타입 안전 쿼리 헬퍼 | **Prisma 등 ORM 미사용**(§11) |
| 테스트 | **Vitest**(단위) + **Playwright(Chromium만, Smoke)**(§12) | 미설치 상태 — §16 착수 차단 참고 |
| CI/CD | **GitHub Actions** + **Vercel Preview** 배포 | AWS/EC2 미사용(§14), 자동 Merge 미사용(§15) |

---

## 2. 화면 구조 — 핵심 4개 · 보조 1개

`SCREEN_ROUTE_CONTRACT.json`(`schema_version: traveler-screen-route-v1`)이 Screen 목록의
정본이다. 정확히 5개 Screen이 존재하며, **핵심(core) 4개**와 **보조(auxiliary) 1개**로
구분한다.

| Screen ID | 구분 | Route | Page Entry |
|---|---|---|---|
| SCR-001 | 핵심 | `/` | `src/app/page.tsx` |
| SCR-002 | 보조 | `/about` | `src/app/about/page.tsx` |
| SCR-003 | 핵심 | `/travel-tools` | `src/app/travel-tools/page.tsx` |
| SCR-004 | 핵심 | `/mates` | `src/app/mates/page.tsx` |
| SCR-005 | 핵심 | `/account` | `src/app/account/page.tsx` |

Page Entry 5개는 `TASKS/TASK_MANIFEST.csv`의 `PAGE_OWNER` 카테고리 5행(`PAGE-SCR001`~
`PAGE-SCR005`)과 1:1 대응한다. 그 외 라우트(여행지/안전정보 상세, 동행글 상세 등)는 별도
Route를 만들지 않고 같은 Screen 안의 Drawer/Modal/Tab/List+Detail 상태로 흡수한다
(`design-reference/UI_CONTRACT.md` 참고).

인증 콜백(`src/app/auth/callback/route.ts`), API Route Handler, `not-found.tsx`,
`error.tsx`는 URL은 있지만 "기술 Route"로 분류하며 5개 Screen 수에 포함하지 않는다.

---

## 3. Server Component / Client Component 구분

기본 원칙: **모든 컴포넌트는 Server Component로 시작하고, 상호작용(상태·이벤트·브라우저
API)이 필요한 최소 단위에서만 `"use client"`를 선언한다.**

| 구분 | 사용처 | 이유 |
|---|---|---|
| **Server Component**(기본) | 5개 Page Entry 자체, 여행지/안전정보/대표소개 렌더링, 동행글 목록 초기 로드, Header/Footer 셸 | 정적 데이터(`src/data/*`)·Supabase 서버 조회 결과를 클라이언트 번들 없이 렌더링 |
| **Client Component**(`"use client"`) | 검색·필터 인터랙션, 여행지/안전정보 Drawer 열고 닫기, **항공·숙소 입력 Form**(§4), 동행글 작성/신청 Form, 로그인/프로필 Form, Toast, 즐겨찾기 토글(localStorage) | 브라우저 상태(useState/localStorage)·이벤트 핸들러·Web API 필요 |

Page Owner(`PAGE-SCR00X`)는 Server Component로 작성하고, Client 상호작용이 필요한
부분만 하위 Client Component로 위임한다(Task 경계는 `TASKS/TASK_MANIFEST.csv`의
`PAGE_OWNER`/`COMPONENT` 구분과 동일 — Page Owner는 조립만, 실제 Section 구현은
Component Task 소관).

---

## 4. 항공·숙소 입력 Form — Client 전용 일시 상태

SCR-003(`/travel-tools`)의 항공편/숙소 탭은 **Client Component의 일시 상태(ephemeral
client state)만 사용**한다.

- 국가·지역·출발일(체크인)·귀국일(체크아웃)은 `useState`(또는 `useReducer`)로만 보관한다.
- 탭 간 값은 세션 동안만 유지되며(같은 브라우저 탭의 React 상태), 새로고침 시 사라져도
  무방하다 — 영속화가 목적이 아니다.
- 서버 상태 관리 라이브러리(React Query 등)로 캐시하거나 Server Action에 전달하지 않는다.

## 5. 항공·숙소 입력값 미전달 원칙

항공·숙소 입력값(국가·지역·날짜)은 **다음 어디로도 전송하지 않는다**:

| 금지 경로 | 구체적 금지 사항 |
|---|---|
| API | `src/app/api/flights/*`, `src/app/api/hotels/*` 같은 Route Handler를 만들지 않는다. Server Action으로도 전달하지 않는다. |
| DB | Supabase의 어떤 테이블에도 원시 입력값(국가·지역·날짜)을 저장하지 않는다(§8의 6개 테이블 중 이 값을 담는 테이블은 없다). |
| URL | 외부 사이트(Google Flights/Booking.com류) 이동 시 query string·path에 입력값을 붙이지 않는다. `window.open(url, "_blank", "noopener,noreferrer")`로 설정된 일반 URL만 연다. |
| 로그 | 서버 로그, 분석 이벤트(`flight_form_start` 등)에 국가·지역·정확한 날짜를 기록하지 않는다(허용 속성은 `provider`, `source_page` 등 비식별 값뿐). |

이 원칙은 `TASK-CMP-SCR003-FLIGHT-FORM.md` / `TASK-CMP-SCR003-HOTEL-FORM.md`의
Security/Privacy AC와 동일하다.

---

## 6. 정적 데이터 계층 — `src/data`

여행지, 국가 안전정보, 대표(`free_traveler`) 소개는 **DB 테이블이 아니라 `src/data`의
TypeScript 모듈**로 관리한다.

```
src/data/
  destinations.ts              # 국내 10개↑ · 해외 15개국 30도시↑
  destinations.schema.ts       # 필수 필드 스키마(zod 등)
  country-safety.ts            # 해외 국가 전체 커버리지, 8개 카테고리
  country-safety.schema.ts
  representative-profile.ts    # 50+ Trips / 30+ Countries, Timeline, 방문국가 30개, Gallery
```

- 콘텐츠 갱신은 코드 변경(PR)으로 이루어진다 — 별도 CMS나 관리자 편집 화면을 만들지
  않는다(§ CMS 제외, PROJECT_SCOPE.md EXCLUDED: REQ-FUNC-055·056·072~076).
- 게시 전 수량·필수 필드 완전성은 `TOOL-CONTENT-VALIDATION-SCRIPT`(빌드/CI 시점 스크립트)로
  검증하며, 런타임 게시 상태(DRAFT/REVIEW/PUBLISHED) 워크플로는 두지 않는다.
- 이미지는 일반 URL + `alt` 텍스트만 사용한다(라이선스 승인 워크플로 없음).

---

## 7. Supabase 사용 범위 — Auth와 동행 기능 중심

Supabase는 **범용 백엔드가 아니라 두 가지 목적에만 사용**한다.

1. **Auth**: 이메일 가입/로그인/로그아웃/비밀번호 재설정, 성인 확인 상태 저장
   (`is_adult`, `adult_verified_at`만 — 생년월일 자체는 저장하지 않는다).
2. **동행(Mate) 기능**: 동행글, 참가 요청, 차단, 신고, 그리고 관리자가 설정하는 외부
   항공/숙소 URL.

여행지·안전정보·대표소개(§6)는 Supabase를 거치지 않는다. 결제·예약·실시간 검색 결과 같은
데이터도 Supabase에 존재하지 않는다(해당 기능 자체가 범위 밖).

---

## 8. DB 스키마 — 정확히 6개 테이블

| # | 테이블 | 역할 |
|---|---|---|
| 1 | `user_profile` | 닉네임·연령대·성별(선택)·여행 스타일·자기소개·성인 확인 상태·계정 상태 |
| 2 | `mate_post` | 동행 모집글(국가·지역·기간·인원·설명·모집 상태) |
| 3 | `mate_application` | 참가 요청(비공개 메시지, PENDING/ACCEPTED/REJECTED/WITHDRAWN) |
| 4 | `user_block` | 사용자 차단 관계 |
| 5 | `report` | 신고(대상·사유·상태: OPEN/RESOLVED/DISMISSED) |
| 6 | `external_link_settings` | Admin이 설정하는 항공/숙소 외부 URL(HTTPS 허용목록) |

이 6개를 넘는 테이블(여행지·안전정보·대표소개·미디어·감사로그 등)을 만들지 않는다 —
해당 콘텐츠는 §6의 정적 데이터로, 감사로그는 `PROJECT_SCOPE.md` EXCLUDED 항목으로
이미 범위에서 제외됐다. `TASKS/TASK-DB-SCHEMA-BASE.md`가 이 경계의 구현 계약이다.

---

## 9. Supabase Client — Browser / Server 분리

| 클라이언트 | 위치(제안) | 사용처 | 권한 |
|---|---|---|---|
| Browser Client | `src/lib/supabase/client.ts` | Client Component(로그인 폼, 동행 작성 폼 등)에서 사용자 세션 기준 조회/쓰기 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` — RLS로 제한된 익명/사용자 권한만 |
| Server Client | `src/lib/supabase/server.ts` | Server Component·Server Action에서 요청 컨텍스트(쿠키) 기준 조회/쓰기 | 사용자 세션 컨텍스트 + RLS |

Service Role 키(`SUPABASE_SERVICE_ROLE_KEY`)는 **클라이언트 번들에 절대 포함하지 않고**,
꼭 필요한 서버 전용 관리 작업(예: 계정 탈퇴 시 비식별화)에서만 서버 사이드 코드로 한정해
사용한다.

---

## 10. RLS 원칙 — 단순하게

복잡한 정책 매트릭스 대신 아래 3가지 단순 원칙만 적용한다.

1. **본인 데이터 우선**: `user_profile`, `mate_application`(신청자 관점), `user_block`은
   `auth.uid()`가 소유자/당사자인 행만 조회·수정 가능.
2. **공개 필드만 공개 조회**: `mate_post`는 비공개 필드(신청 메시지 등은 `mate_application`
   에 있으므로 해당 없음) 없이 목록·상세를 Public이 조회 가능하되, 쓰기는 인증+성인 확인
   사용자만.
3. **역할 기반 관리자 접근**: `report`, `external_link_settings`는 Moderator/Admin
   역할만 조회·수정 가능(일반 사용자는 `report` 생성만 가능).

경고/계정 정지 같은 세분화된 제재 권한, 범용 감사 로그용 정책은 만들지 않는다
(`REQ-FUNC-042`, `REQ-FUNC-076` EXCLUDED와 동일한 경계). 상세는
`TASKS/TASK-DB-RLS-BASE.md`, `TASKS/TASK-TEST-RLS-BASIC.md`.

---

## 11. ORM 미사용

**Prisma·Drizzle 등 ORM을 사용하지 않는다.** `src/lib/supabase/queries/*.ts`에 Supabase
JS 클라이언트(`@supabase/supabase-js` / `@supabase/ssr`)의 쿼리 빌더를 얇게 감싼 타입
안전 헬퍼 함수만 둔다(`TASKS/TASK-DB-ACCESS.md`). 스키마 마이그레이션은 Supabase CLI의
SQL 마이그레이션 파일(`supabase/migrations/*.sql`)로 직접 관리한다.

---

## 12. 테스트 전략

| 종류 | 도구 | 범위 |
|---|---|---|
| 단위 테스트 | **Vitest** | 날짜 검증(`UNIT-TRAVEL-DATES`), 연락처 탐지(`UNIT-CONTACT-DETECTION`), 동행 상태 전이(`UNIT-MATE-STATE`) |
| 통합 테스트 | Vitest + Supabase 로컬/테스트 프로젝트 | RLS 기본 정책(`TEST-RLS-BASIC`) |
| E2E | **Playwright, Chromium만** | 공개 화면/여행 준비/동행·인증 3개 Smoke(`E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH`) — Firefox/WebKit 프로젝트는 추가하지 않는다 |

전체 E2E 매트릭스(여러 브라우저·전 기능 회귀)는 이 프로젝트 범위가 아니다 — 핵심 Smoke
흐름만 자동화한다.

---

## 13. CI/CD — GitHub Actions + Vercel Preview

- **GitHub Actions**(`.github/workflows/ci.yml`, `CI-PIPELINE` Task): PR마다 TypeScript
  strict 빌드, ESLint, Vitest, Playwright Chromium Smoke를 실행하고 main 병합 전
  게이트로 사용한다.
- **Vercel**: PR마다 Preview 배포, main 병합 시 Production 배포. 별도 서버 프로비저닝
  없이 Vercel의 관리형 Next.js 호스팅만 사용한다.
- 배포 전 확인(`RELEASE-VERCEL-SUPABASE-CHECK`)은 자동화된 모니터링이 아니라 배포
  담당자가 수행하는 수동 체크리스트다(§ 명시적 비범위 참고).

---

## 14. AWS·EC2 미사용

인프라는 **Vercel(애플리케이션 호스팅) + Supabase(DB·Auth)** 조합만 사용한다. EC2,
ECS, Lambda, RDS 등 AWS 리소스를 프로비저닝하지 않으며, 관련 Task·Terraform/IaC 코드를
만들지 않는다.

## 15. 자동 Merge 미사용

병합은 사람이 PR을 검토하고 수동으로 승인·병합한다. GitHub Actions는 검증(빌드·테스트)
게이트로만 사용하고, 자동 Merge Runner나 bot 기반 자동 병합 파이프라인을 구성하지 않는다.

---

## 16. 명시적 비범위 (In-Scope 아님)

아래는 "아직 안 만들었다"가 아니라 **이 프로젝트 범위에서 의도적으로 제외**한다
(`docs/PROJECT_SCOPE.md`의 EXCLUDED 판정과 일치).

| 항목 | 상태 |
|---|---|
| 전체 콘텐츠 CMS | 제외 — §6 정적 데이터로 대체 |
| 외부 이메일 발송 공급자(SMTP/서드파티 이메일 API) | 제외 — 인앱 Toast/화면 상태로 대체(`SA-TOAST-NOTIFICATIONS`) |
| Monitoring/Observability(APM, 에러 트래킹, 업타임 모니터링, 커스텀 구조화 로깅) | 제외 — Vercel/Supabase 기본 로그·대시보드에 의존 |
| 자동 백업·장애 알림·부하 테스트 | 제외 |
| AWS·EC2 인프라 | 제외(§14) |
| 자동 Merge Runner | 제외(§15) |
| Prisma 등 ORM | 미사용(§11) |

---

## 17. 디렉터리 구조(제안)

```
src/
  app/
    page.tsx                    # SCR-001 Page Owner
    about/page.tsx               # SCR-002 Page Owner
    travel-tools/page.tsx        # SCR-003 Page Owner
    mates/page.tsx                # SCR-004 Page Owner
    account/page.tsx              # SCR-005 Page Owner
    auth/callback/route.ts        # 기술 Route(Screen 수 미포함)
    not-found.tsx / error.tsx     # 기술 Route
    legal/*/page.tsx               # 정책 페이지(비핵심)
  components/
    scr001/ … scr005/             # Screen별 Component Task 산출물
    shared/                        # Toast 등 공통 컴포넌트
  data/                            # §6 정적 데이터
  lib/
    supabase/                      # §9 Browser/Server Client
    actions/                       # Server Action(mate-post, mate-application, block, report, …)
    auth/
    validation/
    favorites.ts                   # localStorage 전용(§ 즐겨찾기)
supabase/
  migrations/                      # §8 6개 테이블 + RLS
  seed.sql
e2e/                                # Playwright Chromium Smoke
scripts/                            # validate_inputs.py, audit_tasks.py, 콘텐츠 검증
```

---

## 18. 착수 차단(Launch Blockers)

아래는 실제로 저장소를 확인해 **현재 없는 것으로 확인된** 파일·환경변수만 기록한다.
추정이나 일반적 권장 사항은 포함하지 않는다.

| # | 누락 항목 | 확인 방법 | 필요한 이유 |
|---|---|---|---|
| 1 | `.env.local`(또는 동등 환경변수 파일) — 저장소에 존재하지 않음(`.env*`는 `.gitignore` 대상) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 값이 아직 없음 | `AUTH-EMAIL-ADULT`, `DB-*`, `SA-*` Task 착수 전 Supabase 프로젝트 연결 필요 |
| 2 | `@supabase/supabase-js`(또는 `@supabase/ssr`) — `package.json`에 미설치 | `package.json` 확인 | §9 Browser/Server Client 구현 전 설치 필요 |
| 3 | `vitest`, `@testing-library/react`, `@playwright/test` — `package.json`에 미설치 | `package.json` 확인 | `UNIT-*`, `TEST-RLS-BASIC`, `E2E-*` Task 착수 전 설치 필요 |
| 4 | `supabase/` 디렉터리(마이그레이션) — 저장소에 없음 | 파일 트리 확인 | `DB-SCHEMA-BASE` 착수 전 `supabase init` 또는 동등 절차 필요 |
| 5 | `.github/workflows/` — 저장소에 없음 | 파일 트리 확인 | `CI-PIPELINE` Task 착수 전 필요 |
| 6 | `FLIGHT_OUTBOUND_URL_DEFAULT`, `HOTEL_OUTBOUND_URL_DEFAULT` 환경변수 — 정의되지 않음 | 환경변수 미설정 | `DB-SEED-BASE`(초기 `external_link_settings` 값), `SA-EXTERNAL-URL-SETTINGS` 착수 전 필요 |

`src/data/`, `src/components/`, `src/lib/` 등 아직 생성되지 않은 소스 디렉터리는 각
Task가 만드는 정상적인 산출물이므로 착수 차단으로 기록하지 않는다. CMS, 외부 이메일
공급자, Monitoring은 §16에 따라 프로젝트 범위 밖이므로 "누락"이 아니라 애초에 대상이
아니다.
