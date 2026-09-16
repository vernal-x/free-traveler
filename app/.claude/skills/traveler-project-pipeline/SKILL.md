---
name: traveler-project-pipeline
description: Traveler PRD/SRS에서 Task를 생성·상세화·감사하고 5개 Screen과 Wave 개발을 지원하는 프로젝트 Skill
---

# Traveler Project Pipeline

이 Skill은 Free Traveler PRD/SRS로부터 Task를 생성·상세화·감사하고, 승인된 5개 Screen과
Wave 단위 개발을 지원하는 데 필요한 규칙·형식·경계를 정의한다. **`CLAUDE.md`의 Harness
Marker와 23개 필수 규칙이 항상 우선한다** — 이 문서는 그 규칙을 반복하지 않고 Task
파이프라인에 특화된 세부 사항만 추가하며, `CLAUDE.md`와 다르게 읽히는 서술이 있다면
`CLAUDE.md`를 따른다.

## 1. 입력 문서 목록

| 문서 | 역할 |
|---|---|
| `docs/06_SRS_UIUX_REVISED.md` | SRS 정본(Baseline `docs/02_SRS_BASELINE.md` 기반, Route/Page Inventory 개정) |
| `docs/PROJECT_SCOPE.md` | IMPLEMENT/EXCLUDED 판정 정본 |
| `docs/UIUX_TRACEABILITY.md` | Requirement ↔ Screen ↔ Route ↔ Page Entry 매핑 |
| `design-reference/D-001/DESIGN.md` | 디자인 정본(Status: LOCKED) |
| `design-reference/UI_CONTRACT.md` | Screen별 서술형 UI 계약(영역 순서·상태·이동) |
| `design-reference/SCREEN_ROUTE_CONTRACT.json` | Screen·Route·Page Entry 기계판독 정본 |
| `docs/ARCHITECTURE.md` | 구현 경계(Server/Client 구분, DB 범위, 테스트·CI 전략) |
| `docs/DECISION_LOG.md` | 확정 의사결정 이력(DEC-001~014) |
| `TASKS/00_TASK_LIST.md` | Task List 정본 |
| `TASKS/TASK-<ID>.md` | Task 상세 정본(Task List와 1:1) |
| `CLAUDE.md` | 전역 규칙·Harness Marker — 이 Skill보다 우선 |
| 현재 `src/app` 파일 트리, `package.json` | 실제 구현 상태 확인용(`scripts/validate_inputs.py`가 스냅샷 생성) |

## 2. 5개 Screen과 Page Entry

Screen 목록의 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`
(`schema_version: traveler-screen-route-v1` — `CLAUDE.md`의 `HARNESS_SCHEMA`와 항상
동일해야 한다)이다.

| Screen | 구분 | Route | Page Entry |
|---|---|---|---|
| SCR-001 | 핵심 | `/` | `src/app/page.tsx` |
| SCR-002 | 보조 | `/about` | `src/app/about/page.tsx` |
| SCR-003 | 핵심 | `/travel-tools` | `src/app/travel-tools/page.tsx` |
| SCR-004 | 핵심 | `/mates` | `src/app/mates/page.tsx` |
| SCR-005 | 핵심 | `/account` | `src/app/account/page.tsx` |

정확히 5개이며, 핵심 4개(SCR-001, 003, 004, 005)·보조 1개(SCR-002) 구분을 바꾸지
않는다(DEC-002). 인증 콜백·API Route Handler·`not-found.tsx`/`error.tsx`는 URL은
있지만 이 5개 Screen 수에 포함하지 않는 기술 Route다.

## 3. IMPLEMENT·EXCLUDED 상태 처리 규칙

- `docs/PROJECT_SCOPE.md`가 REQ-FUNC-001~080, REQ-NF-001~034 총 114건 각각에
  `IMPLEMENT` / `IMPLEMENT(축소)` / `EXCLUDED`를 부여한 정본이다.
- **IMPLEMENT 계열**: `TASKS/00_TASK_LIST.md` Table A의 `Requirement Ref` 열에
  등장하고, 최소 1개의 실제 Task + 1개의 Verify(테스트/수동 확인 수단)에 연결한다.
- **EXCLUDED**: `TASKS/00_TASK_LIST.md` §12 NON_IMPLEMENTATION 표에만 근거·후속
  방향과 함께 남긴다. 어떤 Task의 Requirement Ref에도 등장시키지 않고, 상세 구현
  파일도 만들지 않는다(§11 참고).
- IMPLEMENT 집합과 EXCLUDED 집합의 합은 항상 114이며, 두 집합은 겹치지 않는다.

## 4. Task List·상세 Task 형식

- **Task List**(`TASKS/00_TASK_LIST.md`): Task ID당 연결된 두 개 표로 기록한다.
  - Table A(식별·라우팅): `Seq, Task ID, 제목, Category, Implementation Status,
    Requirement Ref, Screen, Route, Page Entry, Depends On, Priority`
  - Table B(파일·수용기준·검증): `Task ID, Expected Files, Functional AC, Visual AC,
    Security/Privacy AC, Verify`
  - 한 셀에 여러 항목을 적을 때는 `<br>`로 구분한다. Depends On·Requirement Ref는
    실제 존재하는 ID만 콤마로 나열하고(범위 축약 `~` 사용 시 EXCLUDED ID가 섞이지
    않는지 반드시 확인), 괄호 주석 등 ID가 아닌 텍스트를 섞지 않는다.
- **Task 상세**(`TASKS/TASK-<ID>.md`, Task List와 정확히 1:1): 다음 14개 절을 빠짐없이
  포함한다 — `Context`, `Project Scope`, `Requirement Ref`, `Screen / Route / Page
  Entry`, `Design Ref`, `Depends On`, `Expected Files`, `Functional AC`, `Visual AC`,
  `Security/Privacy AC`, `Test Cases`, `Verify`, `Definition of Done`, `Forbidden`.
- 감사 산출물: `TASKS/TASK_MANIFEST.csv`(기계판독 인덱스), `TASKS/TASK_AUDIT_REPORT.md`
  (18개 검사 결과) — 둘 다 `scripts/audit_tasks.py`가 생성한다(§11 참고).

## 5. Page Owner·Component 분리 규칙

- **Page Owner**(Screen당 정확히 1개, `PAGE-SCR001`~`PAGE-SCR005`): §2의 `Page Entry`
  파일 **하나만** Expected Files로 가진다. Section을 직접 구현하지 않고, 같은 Screen의
  Component·Data·Server Action Task를 import해 **조립**만 한다 — `src/components/**`
  신규 파일을 만들지 않는다(`CLAUDE.md` 규칙 9).
- **Component**: Screen 내부 개별 Section/컴포넌트(Hero, Card Grid, Form, Drawer,
  Filter Bar 등) 하나씩을 책임진다. 소속 Screen의 Page Owner `Depends On`에 반드시
  등장해야 한다 — 등장하지 않으면 "Component-only Screen" 결함이다.
- Page Owner의 `Depends On`은 같은 Screen의 Component·Data·Server Action Task만
  참조한다. 다른 Screen의 Component를 의존하지 않는다.

## 6. DB 6개 Table과 정적 Data 경계

- DB 테이블은 정확히 6개로 제한한다: `user_profile`, `mate_post`, `mate_application`,
  `user_block`, `report`, `external_link_settings`(DEC-006, `CLAUDE.md` 규칙 13).
- 여행지·안전정보·대표소개는 **DB 테이블이 아니라 `src/data/*`의 정적 TypeScript
  모듈**로 만든다(DEC-004, `CLAUDE.md` 규칙 16). DB Task의 Expected Files·Functional
  AC에서 `destination`/`country_safety`/`representative_profile` 같은 이름을 테이블로
  다루지 않는다.
- Prisma 등 ORM을 쓰지 않는다 — Supabase 클라이언트 쿼리 헬퍼만 사용한다(`CLAUDE.md`
  규칙 17). 스키마는 `supabase/migrations/*.sql`로 직접 관리한다.

## 7. 외부 입력 비저장 불변조건

SCR-003 항공·숙소 폼의 국가·지역·날짜 입력값은 **Client Component의 일시 상태로만
유지**하며 다음 어디로도 보내지 않는다(DEC-007, `CLAUDE.md` 규칙 12):

- 서버 API Route(`api/flights/*`, `api/hotels/*` 등)나 Server Action으로 전달하지 않는다.
- Supabase의 어떤 테이블에도 원시 입력값을 저장하지 않는다.
- 외부 이동 URL의 query·body·cookie에 입력값을 붙이지 않는다(`noopener,noreferrer`
  새 탭으로 일반 URL만 연다).
- 서버 로그·분석 이벤트에 국가·지역·정확한 날짜를 기록하지 않는다.

이 불변조건은 `CMP-SCR003-FLIGHT-FORM`/`CMP-SCR003-HOTEL-FORM` Task의 Security/Privacy
AC로 기록하고, `scripts/audit_tasks.py`의 "외부 입력 비저장 AC 존재" 검사로 다시
확인한다.

## 8. 기본 Auth·성인·RLS 규칙

- Auth는 Supabase 이메일 인증만 사용한다. 정확한 생년월일은 저장하지 않고 `is_adult`,
  `adult_verified_at`만 저장한다(DEC-005).
- RLS는 단순한 3원칙만 적용한다: ① 본인 데이터 우선(`user_profile`,
  `mate_application`, `user_block`은 당사자만 조회·수정), ② `mate_post`는 목록·상세를
  공개 조회하되 쓰기는 인증+성인 확인 사용자만, ③ `report`·`external_link_settings`는
  Moderator/Admin만 쓰기.
- **RLS를 우회하는 Client 코드를 작성하지 않는다** — UI 필터링만으로 비공개 데이터를
  가리는 패턴(RLS 없이 클라이언트에서만 숨김)을 쓰지 않는다(`CLAUDE.md` 규칙 14).
- **`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 코드에서만 사용**하고 클라이언트 번들에
  포함하지 않는다(`CLAUDE.md` 규칙 15).

## 9. Playwright Chromium Smoke 범위

`CLAUDE.md`의 `PLAYWRIGHT_ENABLED=true`, `PLAYWRIGHT_SCOPE=chromium-smoke`를 그대로
따른다(DEC-009).

- 정확히 3개의 E2E Task만 둔다: `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`,
  `E2E-MATE-AUTH`.
- 각 Task의 `Verify`는 Chromium만 언급한다(예: `--project=chromium`). Firefox/WebKit
  프로젝트나 전체 기능 회귀 E2E 매트릭스를 추가하지 않는다(`CLAUDE.md` 규칙 18).
- 단위 테스트(Vitest — 날짜 검증, 연락처 탐지, 동행 상태 전이)는 이 범위 제한을
  받지 않는다.

## 10. Wave 내부 순차 실행

- 표준 실행 진입점은 `/run-wave WXX`다(`CLAUDE.md` 규칙 6, DEC-010).
- 한 Wave에 포함된 Task는 **단일 Agent가 `Depends On` 순서로 한 번에 하나씩만**
  구현한다(DEC-011, `CLAUDE.md` 규칙 7) — 병렬 처리나 여러 Task 동시 착수를 하지
  않는다.
- 각 Task는 `CLAUDE.md`의 "Task 완료 순서"(Task 읽기 → 입력 확인 → 구현 → 관련
  포맷·Unit Test → 필요 시 Playwright → Diff 확인 → 완료 보고)를 그대로 따른다.
- 한 Wave가 끝나면 **사람이 Preview를 확인하기 전까지 다음 Screen의 Wave를 시작하지
  않는다**(`CLAUDE.md` 규칙 22).
- PR 생성과 Merge는 사람이 수동으로 한다(DEC-012, `CLAUDE.md` 규칙 21).

## 11. EXCLUDED 보호

EXCLUDED로 판정된 Requirement가 실수로라도 구현되지 않도록 아래 장치를 유지한다
(DEC-014, `CLAUDE.md` 규칙 19).

- `TASKS/00_TASK_LIST.md` §12 NON_IMPLEMENTATION 표에만 존재하고, 다른 어떤 표에도
  중복 등장하지 않는다.
- 어떤 Task의 Requirement Ref에도 EXCLUDED Requirement ID가 들어가지 않는다
  (Requirement Ref에 범위 축약 `~`를 쓸 때 EXCLUDED ID가 실수로 포함되지 않는지
  특히 주의한다).
- EXCLUDED Requirement에 대응하는 `TASKS/TASK-<ID>.md` 상세 파일을 만들지 않는다.
- `scripts/audit_tasks.py`의 검사 17(Requirement 커버리지)·18(EXCLUDED 상세 구현
  파일 미생성)이 이를 자동 검증하며, 위반 시 `AUDIT_FAIL`(exit 1)로 처리한다.
- 제외 판정 자체를 이 Skill이나 Task 작성 과정에서 뒤집지 않는다 — 뒤집으려면
  `docs/PROJECT_SCOPE.md`를 먼저 개정하고 `docs/DECISION_LOG.md`에 새 결정을 남긴다.

## 12. AWS·EC2·자동 Merge 금지

`CLAUDE.md`의 `AWS_ENABLED=false`, `AUTO_MERGE=false`를 그대로 따른다(DEC-012,
DEC-013).

- EC2·ECS·Lambda·RDS 등 AWS 리소스를 프로비저닝하는 Task를 만들지 않는다. 인프라는
  Vercel(호스팅) + Supabase(DB·Auth)로 한정한다.
- 자동 Merge Runner나 bot 기반 자동 병합 파이프라인을 구성하는 Task를 만들지 않는다.
  GitHub Actions는 검증(빌드·Lint·테스트) 게이트로만 사용한다.
- `scripts/audit_tasks.py`의 검사 16(AWS·EC2·자동 Merge 구현 Task 0)이 Task 내용에서
  `EC2`, `AWS`, `auto-merge`류 키워드를 발견하면 감사를 실패시킨다.

---

## 관련 스크립트·명령

- `scripts/validate_inputs.py` — Task 작성/수정 전 입력 문서 일관성 검증
- `scripts/audit_tasks.py` — `TASKS/00_TASK_LIST.md` + `TASKS/TASK-*.md`를 18개
  규칙으로 감사하고 `TASKS/TASK_MANIFEST.csv`·`TASKS/TASK_AUDIT_REPORT.md`를 생성
- `.claude/commands/gen-tasklist.md`, `gen-task-details.md`, `audit-tasks.md` —
  Task List/상세 생성 및 감사 명령. 이 세 명령 파일은 실제 정본 형식(§4의 Markdown
  두 표 + `TASKS/TASK-<ID>.md`, `TASKS/00_TASK_LIST.md`)을 그대로 서술하도록 다시
  작성되었다 — 과거의 JSON 기반 설계(`tasks/TASKLIST.json`)는 더 이상 쓰지 않는다.
- `/run-wave WXX` — Wave 단위 개발 표준 명령(`CLAUDE.md` 규칙 6). 이 Skill은 그
  실행이 따라야 할 규칙(§10)을 정의한다.
