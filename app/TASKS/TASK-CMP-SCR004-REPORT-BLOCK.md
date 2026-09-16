# CMP-SCR004-REPORT-BLOCK — 신고/차단 진입 + 안전 안내

**Seq:** 28 · **Category:** COMPONENT · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 28 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

신고/차단 진입 + 안전 안내을(를) 담당하는 COMPONENT Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 28 행과 동일)
- 관련 Requirement: REQ-FUNC-039, 040, 080
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-039, 040, 080

## Screen / Route / Page Entry

- Screen: SCR-004
- Route: —
- Page Entry: —

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-004 — 동행 조회
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-004" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- SA-REPORT
- SA-BLOCK
- TOOL-POLICY-PAGES

## Expected Files

- 생성: `src/components/scr004/ReportForm.tsx`, `SafetyBanner.tsx`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- 신고 사유코드+설명, 접수번호 3초 이내 표시, 차단/해제 진입점, 안전수칙 요약+"여행 조건도 정리"(→`/travel-tools`) CTA

## Visual AC

- CTA Banner 패턴

## Security/Privacy AC

- 서비스는 신원·안전을 보증하지 않는다는 고지 표시

## Test Cases

- [ ] TC-1: 신고 사유코드+설명, 접수번호 3초 이내 표시, 차단/해제 진입점, 안전수칙 요약+"여행 조건도 정리"(→`/travel-tools`) CTA
- [ ] TC-2(보안/개인정보): 서비스는 신원·안전을 보증하지 않는다는 고지 표시

## Verify

- E2E-MATE-AUTH

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
- Airbnb 상표 요소(Rausch 컬러, Airbnb Cereal 폰트, 워드마크/마스코트, 3-tab 상품 내비게이션, "Guest favorite" 배지 디자인)를 그대로 가져오지 않는다. 구매·예약·결제 UI, 실시간 가격비교, 별점·리뷰·매너 점수류 UI를 추가하지 않는다.
- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능을 이 Task 범위 안에서 임의로 복원하지 않는다.
