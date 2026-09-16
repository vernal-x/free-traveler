# E2E-PUBLIC-SMOKE — 공개 화면 Smoke(홈·여행지·안전정보·대표소개)

**Seq:** 60 · **Category:** E2E_TEST · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 60 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

공개 화면 Smoke(홈·여행지·안전정보·대표소개)을(를) 담당하는 E2E_TEST Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 60 행과 동일)
- 관련 Requirement: REQ-FUNC-001~010, 046~054, 057~063, 064, 068
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-001~010, 046~054, 057~063, 064, 068

## Screen / Route / Page Entry

- Screen: SCR-001, SCR-002
- Route: `/`, `/about`
- Page Entry: N/A

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-001 — 메인
- `design-reference/UI_CONTRACT.md` § SCR-002 — 대표 소개
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-001", screen_id="SCR-002" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- PAGE-SCR001
- PAGE-SCR002

## Expected Files

- 생성: `e2e/public-smoke.spec.ts`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- 흐름: 홈→필터→여행지 상세 Drawer→안전정보 Drawer→대표소개(`docs/PROJECT_SCOPE.md` §7 핵심 흐름 10개 중 흐름 1·10)

## Visual AC

- **Chromium 브라우저만**, Desktop 1440px 뷰포트

## Security/Privacy AC

- 해당 없음

## Test Cases

- [ ] TC-1: 흐름: 홈→필터→여행지 상세 Drawer→안전정보 Drawer→대표소개(`docs/PROJECT_SCOPE.md` §7 핵심 흐름 10개 중 흐름 1·10)

## Verify

- `npx playwright test e2e/public-smoke.spec.ts --project=chromium`

## Definition of Done

- [ ] 위 Functional AC, Visual AC, Security/Privacy AC 항목이 모두 충족됨
- [ ] Test Cases 체크리스트가 모두 통과함
- [ ] `Verify`에 명시된 검증 수단(Task/커맨드)을 실제로 실행해 통과함
- [ ] Expected Files 목록 밖의 파일을 생성/수정하지 않았음
- [ ] "Forbidden" 절의 금지 항목을 위반하지 않았음
- [ ] Lorem ipsum, "준비 중", "정보 확인 필요", 내용 없는 빈 카드가 결과물에 없음(해당 Task가 UI를 다루는 경우)

## Forbidden

- **Expected Files 밖 수정 금지.** 이 Task는 아래 "Expected Files"에 나열된 파일만 생성/수정한다. 그 외 파일(다른 Task 소관 파일 포함)을 건드리지 않는다.
- 구현 코드는 이 Task 상세 정의를 따르되, 이 markdown 파일 자체의 작성으로 "구현 완료"를 주장하지 않는다.
- Git Branch/Commit을 이 Task 정의 단계에서 만들지 않는다.
- Playwright 프로젝트 설정에 Chromium 외 브라우저(Firefox/WebKit)를 추가하지 않는다.
- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능을 이 Task 범위 안에서 임의로 복원하지 않는다.
