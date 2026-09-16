# Free Traveler — Root Agent Rules (CLAUDE.md)

이 문서는 이 저장소(`traveler/app/`)에서 작업하는 모든 Agent의 규칙을 **다른 규칙
파일을 참조하지 않고 이 파일 안에 직접** 담는다. 이 파일이 유일한 진입점이며, 여기 없는
규칙은 아래 "정본 문서"에서 찾는다.

## Harness Marker

```
HARNESS_SCHEMA=traveler-screen-route-v1
DESIGN_PATH=design-reference/D-001/DESIGN.md
SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json
PROJECT_SCOPE=docs/PROJECT_SCOPE.md
PLAYWRIGHT_ENABLED=true
PLAYWRIGHT_SCOPE=chromium-smoke
AUTO_MERGE=false
AWS_ENABLED=false
```

| Marker | 의미 |
|---|---|
| `HARNESS_SCHEMA` | Screen/Route 계약의 스키마 버전. `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `schema_version`과 항상 같아야 한다. |
| `DESIGN_PATH` | 디자인 정본 파일 위치(LOCKED). |
| `SCREEN_CONTRACT` | Screen·Route·Page Entry 정본 파일 위치(기계 판독용). |
| `PROJECT_SCOPE` | IMPLEMENT/EXCLUDED 판정 정본 파일 위치. |
| `PLAYWRIGHT_ENABLED` | E2E 테스트를 이 프로젝트에서 사용함(`true`). |
| `PLAYWRIGHT_SCOPE` | E2E 범위는 Chromium 대상 Smoke Test로 한정(`chromium-smoke`) — 다른 값으로 확장하지 않는다. |
| `AUTO_MERGE` | 자동 Merge를 쓰지 않음(`false`) — PR 병합은 항상 사람이 한다. |
| `AWS_ENABLED` | AWS/EC2 인프라를 쓰지 않음(`false`) — Vercel + Supabase만 사용한다. |

## 정본 문서(Source of Truth)

| 영역 | 정본 |
|---|---|
| SRS(요구사항) | `docs/06_SRS_UIUX_REVISED.md` |
| 구현 범위(IMPLEMENT/EXCLUDED) | `docs/PROJECT_SCOPE.md` |
| 디자인 토큰·컴포넌트 | `design-reference/D-001/DESIGN.md` |
| Screen·Route·Page Entry | `design-reference/SCREEN_ROUTE_CONTRACT.json` |
| Requirement ↔ Screen ↔ Route ↔ Task 추적 | `docs/UIUX_TRACEABILITY.md` |
| Task 목록·상세 | `TASKS/00_TASK_LIST.md`, `TASKS/TASK-<ID>.md` |
| 아키텍처 경계 | `docs/ARCHITECTURE.md` |
| 확정 의사결정 이력 | `docs/DECISION_LOG.md` |

## 필수 규칙

1. **작업 전 `package.json`과 현재 Next.js 문서를 확인한다.** 이 저장소의 Next.js
   버전은 학습 데이터의 관례와 다를 수 있다(Breaking Change 가능) — 코드를 쓰기 전
   `node_modules/next/dist/docs/`(이 파일 기준 상대 경로로 해석, 모노레포에서는
   `next` 패키지가 저장소 루트에서 보이지 않을 수 있음)의 해당 가이드를 읽고,
   Deprecation 공지를 따른다.
2. **SRS 정본은 `docs/06_SRS_UIUX_REVISED.md`다.** 요구사항 문구·우선순위·수용 기준은
   이 문서(및 그 기반인 `docs/02_SRS_BASELINE.md`)를 따른다.
3. **Scope 분류 정본은 `docs/PROJECT_SCOPE.md`다.** 어떤 Requirement를 구현하고
   어떤 것을 EXCLUDED로 둘지는 이 문서의 판정을 따른다.
4. **디자인 정본은 `design-reference/D-001/DESIGN.md`다.** 색상·타이포·spacing·radius·
   shadow·컴포넌트 정의는 이 문서에 없는 값을 임의로 추가하지 않는다.
5. **Screen 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`이다.** Screen 목록,
   Route, Page Entry, Section 순서, 최소 콘텐츠 수는 이 파일을 최우선으로 따른다.
6. **`/run-wave WXX`를 표준 개발 명령으로 사용한다.** 새로운 임시 절차를 만들지 않는다.
7. **Wave 내부 Task를 Depends On 순서로 한 번에 하나만 구현한다.** 여러 Task를
   동시에 병렬로 진행하지 않는다.
8. **현재 Task의 Expected Files 밖 파일은 수정하지 않는다.** 다른 Task 소관 파일을
   건드려야 할 것 같으면 먼저 사람에게 알린다.
9. **Page Owner Task는 Page Entry에서 Component를 실제 조립한다.** Page Owner가
   하위 Component를 새로 만들지 않는다 — Component는 각자의 Component Task 소관이다.
10. **SCR-001 완료 시 Next.js Starter를 제거한다.** `create-next-app` 기본 문구·로고·
    기본 스타일이 결과물에 남아 있으면 완료로 보지 않는다.
11. **SCR-003은 항공·숙소·동행 탭을 모두 조립한다.** 셋 중 하나라도 빈 탭으로 남기지
    않는다.
12. **항공·숙소 입력값은 서버·DB·URL·로그·분석으로 보내지 않는다.** Client Component의
    일시 상태로만 유지한다.
13. **Supabase 쓰기는 Auth·동행·신고·설정 범위로 제한한다.** 즉 `user_profile`,
    `mate_post`, `mate_application`, `user_block`, `report`,
    `external_link_settings` 6개 테이블 밖으로 쓰기 경로를 확장하지 않는다.
14. **RLS를 우회하는 Client 코드를 작성하지 않는다.** 클라이언트에서 필터링만으로
    비공개 데이터를 가리는 방식(RLS 없이 UI로만 숨기는 패턴)을 쓰지 않는다.
15. **Service Role Key를 Client에서 사용하지 않는다.** `SUPABASE_SERVICE_ROLE_KEY`는
    서버 전용 코드에서만 참조하고 클라이언트 번들에 포함되지 않게 한다.
16. **여행지·안전·대표는 정적 Data를 사용한다.** `src/data/*`의 TypeScript 모듈로
    관리하고 DB 테이블을 만들지 않는다.
17. **Prisma·ORM·AWS·EC2를 추가하지 않는다.** DB 접근은 Supabase 클라이언트 쿼리
    헬퍼만 사용하고, 인프라는 Vercel + Supabase로 한정한다.
18. **Playwright는 핵심 Smoke만 작성한다.** Chromium 대상 Smoke Task 외의 브라우저
    매트릭스나 전체 E2E 회귀 스위트를 추가하지 않는다.
19. **EXCLUDED 기능을 임의로 구현하지 않는다.** `docs/PROJECT_SCOPE.md`에서 EXCLUDED로
    판정된 Requirement는 어떤 Task에서도 구현하지 않는다.
20. **destructive Git 명령을 임의로 사용하지 않는다.** `git reset --hard`,
    `git push --force`, `git clean -f`, 브랜치 강제 삭제 등은 사람이 명시적으로
    요청한 경우에만 사용한다.
21. **자동 PR·자동 Merge를 실행하지 않는다.** PR 생성과 Merge는 사람이 직접 수행한다.
22. **사람의 Preview 확인 후 다음 화면 Wave로 진행한다.** 현재 Wave의 결과를 사람이
    확인하기 전에 다음 Screen의 Wave를 임의로 시작하지 않는다.
23. **작업 완료 시 변경 파일·검증 결과·남은 제한사항을 보고한다.** 구현이 끝났다고
    보고할 때는 반드시 (a) 변경된 파일 목록, (b) 실행한 검증(포맷/Unit Test/Playwright)
    결과, (c) 아직 해결되지 않은 제한사항을 함께 말한다.

## Task 완료 순서

모든 Task는 아래 순서를 그대로 따른다. 단계를 건너뛰거나 순서를 바꾸지 않는다.

1. **Task 읽기** — 해당 `TASKS/TASK-<ID>.md`의 Context/AC/Forbidden을 전부 읽는다.
2. **입력 확인** — Requirement Ref, Design Ref, Depends On이 실제로 준비됐는지
   확인한다(선행 Task 산출물 존재 여부 포함).
3. **구현** — Expected Files 안에서만 코드를 작성한다.
4. **관련 포맷·Unit Test** — 린트/포맷을 적용하고, 해당 Task에 관련된 Unit Test가
   있으면 실행한다.
5. **필요 시 Playwright** — 해당 Task가 E2E Smoke 대상이면 Chromium Smoke를 실행한다
   (`PLAYWRIGHT_SCOPE=chromium-smoke` 범위를 넘지 않는다).
6. **Diff 확인** — 변경된 파일이 Expected Files와 정확히 일치하는지 확인한다.
7. **완료 보고** — 규칙 23에 따라 변경 파일·검증 결과·남은 제한사항을 보고한다.
