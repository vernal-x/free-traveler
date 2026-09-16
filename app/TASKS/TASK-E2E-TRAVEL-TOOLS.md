# E2E-TRAVEL-TOOLS — 항공/숙소/동행 탭 Smoke

**Seq:** 61 · **Category:** E2E_TEST · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 61 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

항공/숙소/동행 탭 Smoke을(를) 담당하는 E2E_TEST Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 61 행과 동일)
- 관련 Requirement: REQ-FUNC-011~026, 031, 054
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-011~026, 031, 054

## Screen / Route / Page Entry

- Screen: SCR-003
- Route: `/travel-tools`
- Page Entry: N/A

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-003 — 통합 여행 준비
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-003" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` 컴포넌트 정의: Form·Tabs
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- PAGE-SCR003

## Expected Files

- 생성: `e2e/travel-tools-smoke.spec.ts`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- 흐름: 항공 입력→검증오류→유효입력→요약→외부 새 탭, 숙소 동일, 동행 탭 로그인 유도 확인

## Visual AC

- **Chromium만**, Desktop+Mobile 390px 각 1회

## Security/Privacy AC

- 외부 이동 시 입력값이 URL query에 없는지 확인

## Test Cases

- [ ] TC-1: 흐름: 항공 입력→검증오류→유효입력→요약→외부 새 탭, 숙소 동일, 동행 탭 로그인 유도 확인
- [ ] TC-2(보안/개인정보): 외부 이동 시 입력값이 URL query에 없는지 확인

## Verify

- `npx playwright test e2e/travel-tools-smoke.spec.ts --project=chromium`

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
- 항공·숙소 입력값(국가·지역·날짜)을 저장하는 서버 API Route(`api/flights/*`, `api/hotels/*`)를 만들지 않는다. 서버 DB·로그·분석 이벤트에도 원시 입력값을 기록하지 않는다.
- Playwright 프로젝트 설정에 Chromium 외 브라우저(Firefox/WebKit)를 추가하지 않는다.
- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능을 이 Task 범위 안에서 임의로 복원하지 않는다.
