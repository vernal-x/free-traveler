# PAGE-SCR005 — SCR-005 계정·관리 페이지 조립

**Seq:** 5 · **Category:** PAGE_OWNER · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 5 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

SCR-005 계정·관리 페이지 조립을(를) 담당하는 PAGE_OWNER Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 5 행과 동일)
- 관련 Requirement: REQ-FUNC-028, 029, 036, 038, 040, 041, 045, 066, 077
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-028, 029, 036, 038, 040, 041, 045, 066, 077

## Screen / Route / Page Entry

- Screen: SCR-005
- Route: `/account`
- Page Entry: `src/app/account/page.tsx`

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-005 — 계정·관리
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-005" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- CMP-SCR005-GUEST-AUTH
- CMP-SCR005-PROFILE
- CMP-SCR005-MY-ACTIVITY
- CMP-SCR005-ADMIN-REPORTS
- CMP-SCR005-ADMIN-URL-SETTINGS
- AUTH-EMAIL-ADULT
- SA-ACCOUNT-DELETE
- SA-EXTERNAL-URL-SETTINGS
- TOOL-LAYOUT-SHELL

## Expected Files

- 생성: `src/app/account/page.tsx`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- 역할별(Guest/Member/Admin) Intro→핵심 작업→도움말/다음 행동 구조. 역할에 없는 탭은 렌더링 자체를 하지 않음(비활성화 아님)
- Guest: 계정 기능 Intro + 로그인/가입/비밀번호 재설정 Card + 로그인 후 가능한 기능 3단계 + 보안 안내
- Member: 프로필·성인 확인 요약 + 내 글 + 참가 요청(받은/보낸) + 차단 목록 + 새 동행글 작성 CTA(→`/travel-tools`), 각 목록 0건이면 완성형 Empty State
- Admin: 관리 Intro + 신고 상태 변경(OPEN/RESOLVED/DISMISSED) + 항공·숙소 외부 URL 설정, 복잡한 Dashboard(차트/그래프) 없음
- **Loading State**(`SCREEN_ROUTE_CONTRACT.json` states=loading,success,empty,error,unauthorized): 프로필·내 글·신청·차단 목록 fetch 중 Skeleton 표시
- **Error State**: 각 목록 로드 실패 시 재시도 카드 표시
- **Unauthorized State**: Admin 탭은 관리자 아닌 사용자에게 렌더링 자체 금지, Member 전용 데이터는 비로그인 시 Guest 분기로 대체

## Visual AC

- Desktop 1440px 좌측 세로 탭(Member/Admin) 또는 상단 Card 3열(Guest)
- Mobile은 반응형 CSS로 좌측 탭→상단 드롭다운/세그먼트 전환(별도 승인 Mobile 화면 없음)

## Security/Privacy AC

- 정확한 생년월일 저장/노출 UI 없음, 성인 여부·확인 시각만(REQ-FUNC-028)
- 탈퇴 시 즉시 비식별화, 신분증 업로드 UI 없음, 범용 감사 로그 UI 없음(REQ-FUNC-045, EXCLUDED 042/076과 구분)

## Test Cases

- [ ] TC-1: 역할별(Guest/Member/Admin) Intro→핵심 작업→도움말/다음 행동 구조. 역할에 없는 탭은 렌더링 자체를 하지 않음(비활성화 아님)
- [ ] TC-2: Guest: 계정 기능 Intro + 로그인/가입/비밀번호 재설정 Card + 로그인 후 가능한 기능 3단계 + 보안 안내
- [ ] TC-3: Member: 프로필·성인 확인 요약 + 내 글 + 참가 요청(받은/보낸) + 차단 목록 + 새 동행글 작성 CTA(→`/travel-tools`), 각 목록 0건이면 완성형 Empty State
- [ ] TC-4: Admin: 관리 Intro + 신고 상태 변경(OPEN/RESOLVED/DISMISSED) + 항공·숙소 외부 URL 설정, 복잡한 Dashboard(차트/그래프) 없음
- [ ] TC-5(보안/개인정보): 정확한 생년월일 저장/노출 UI 없음, 성인 여부·확인 시각만(REQ-FUNC-028)
- [ ] TC-6(보안/개인정보): 탈퇴 시 즉시 비식별화, 신분증 업로드 UI 없음, 범용 감사 로그 UI 없음(REQ-FUNC-045, EXCLUDED 042/076과 구분)
- [ ] TC-7: Loading State — 프로필·내 글·신청·차단 목록 fetch 중 Skeleton 표시
- [ ] TC-8: Error State — 각 목록 로드 실패 시 재시도 카드 표시
- [ ] TC-9: Unauthorized State — Admin 탭은 관리자 아닌 사용자에게 렌더링되지 않음
- [ ] TC-10: 이 Task의 diff에 `src/components/**` 신규 파일이 없음(Component 생성은 별도 CMP-* Task 소관)

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
- 하위 Component/Section 파일(`src/components/scr0XX/*.tsx`)을 이 Task에서 새로 생성하지 않는다 — 그 파일들은 이 Task가 `Depends On`으로 의존하는 CMP-* Task의 소관이며, 이 Task는 그것을 **import하여 Route Page로 조립하는 것**만 범위로 한다(규칙 6).
- Airbnb 상표 요소(Rausch 컬러, Airbnb Cereal 폰트, 워드마크/마스코트, 3-tab 상품 내비게이션, "Guest favorite" 배지 디자인)를 그대로 가져오지 않는다. 구매·예약·결제 UI, 실시간 가격비교, 별점·리뷰·매너 점수류 UI를 추가하지 않는다.
- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능을 이 Task 범위 안에서 임의로 복원하지 않는다.
