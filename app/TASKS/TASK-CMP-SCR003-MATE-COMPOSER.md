# CMP-SCR003-MATE-COMPOSER — 동행 작성 Form/로그인 안내 + 안전 안내

**Seq:** 23 · **Category:** COMPONENT · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 23 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

동행 작성 Form/로그인 안내 + 안전 안내을(를) 담당하는 COMPONENT Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT(축소)**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 23 행과 동일)
- 관련 Requirement: REQ-FUNC-027~029, 031, 032, 080
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).
- **범위 축소 주의**: 이 Task는 `PROJECT_SCOPE.md`가 정의한 축소된 범위까지만 구현한다 — 정량 SLA 측정·부하 테스트·완전 자동화 등 축소된 부분을 임의로 추가 구현하지 않는다.

## Requirement Ref

REQ-FUNC-027~029, 031, 032, 080

## Screen / Route / Page Entry

- Screen: SCR-003
- Route: —
- Page Entry: —

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-003 — 통합 여행 준비
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-003" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` 컴포넌트 정의: Form·Tabs
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- AUTH-EMAIL-ADULT
- SA-MATE-POST
- TOOL-POLICY-PAGES

## Expected Files

- 생성: `src/components/scr003/MateComposer.tsx`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- 비로그인/미성년: 로그인 안내 카드. 로그인+성인 인증 완료: 제목/국가/지역/기간/인원/스타일/설명/안전수칙 동의 폼, 연락처 패턴 감지 시 인라인 오류로 제출 차단

## Visual AC

- 폼 필드 `radius.sm`, 오류는 `color.danger`

## Security/Privacy AC

- 전화번호·이메일·메신저ID 정규식 탐지, 미탐지 케이스는 수동 확인(UNIT-CONTACT-DETECTION)

## Test Cases

- [ ] TC-1: 비로그인/미성년: 로그인 안내 카드. 로그인+성인 인증 완료: 제목/국가/지역/기간/인원/스타일/설명/안전수칙 동의 폼, 연락처 패턴 감지 시 인라인 오류로 제출 차단
- [ ] TC-2(보안/개인정보): 전화번호·이메일·메신저ID 정규식 탐지, 미탐지 케이스는 수동 확인(UNIT-CONTACT-DETECTION)

## Verify

- UNIT-CONTACT-DETECTION, E2E-MATE-AUTH

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
