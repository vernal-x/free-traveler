# PAGE-SCR003 — SCR-003 통합 여행 준비 페이지 조립

**Seq:** 3 · **Category:** PAGE_OWNER · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 3 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

SCR-003 통합 여행 준비 페이지 조립을(를) 담당하는 PAGE_OWNER Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 3 행과 동일)
- 관련 Requirement: REQ-FUNC-011~032, 054, 080
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-011~032, 054, 080

## Screen / Route / Page Entry

- Screen: SCR-003
- Route: `/travel-tools`
- Page Entry: `src/app/travel-tools/page.tsx`

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-003 — 통합 여행 준비
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-003" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- CMP-SCR003-INTRO-TABS
- CMP-SCR003-FLIGHT-FORM
- CMP-SCR003-HOTEL-FORM
- CMP-SCR003-DISCLOSURE-TIPS
- CMP-SCR003-MATE-COMPOSER
- TOOL-POLICY-PAGES
- AUTH-EMAIL-ADULT
- SA-MATE-POST
- TOOL-LAYOUT-SHELL

## Expected Files

- 생성: `src/app/travel-tools/page.tsx`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- Section 순서 정확히 6개, 탭별 입력·검증·완료 상태 독립 유지: ① Intro(3단계 요약) ② Tab(항공편/숙소/동행 구하기) ③ 여행정보 Form(항공: 국가·지역·출발일·귀국일 / 숙소: 국가·지역·체크인·체크아웃) ④ 입력 요약+외부 이동 Action Card ⑤ 입력값 비전달 고지+찾기 Tip 3개 ⑥ 동행 작성 Form(로그인·성인인증 미완료 시 로그인 안내로 대체)+안전 안내
- 세 탭 전환 시 다른 탭의 입력값이 사라지지 않음(세션 내 유지)
- **Loading State**(`SCREEN_ROUTE_CONTRACT.json` states=loading,success,error,unauthorized): 외부 이동/동행글 등록 처리 중 해당 버튼에 로딩 인디케이터 표시
- **Error State**: 외부 링크 생성·동행글 등록 실패 시 재시도 안내 카드 표시(입력값 유지)
- **Unauthorized State**: Section⑥ 동행 작성 Form은 로그인·성인인증 미완료 시 로그인 안내 카드로 전면 대체(위 Section⑥ 정의와 동일 — 상태명으로 재확인)

## Visual AC

- Desktop 1440px 좌(Form)·우(안내 카드) 분할, Mobile 390px 세로 스택, 3-Tip Card는 Desktop 가로 3열/Mobile 세로 1열
- Intro는 텍스트 중심 축소형 밴드(사진 Hero 아님)로 Desktop 첫 화면에서 Tab 상단이 보임

## Security/Privacy AC

- 항공·숙소 입력값(국가·지역·날짜)은 Client Component 상태로만 처리, 서버 DB·로그·분석 이벤트·외부 URL query/body/cookie로 전달 금지(REQ-FUNC-017,025, REQ-NF-017)
- 동행 작성 폼에 안전수칙 동의 체크박스 필수(REQ-FUNC-080)

## Test Cases

- [ ] TC-1: Section 순서 정확히 6개, 탭별 입력·검증·완료 상태 독립 유지: ① Intro(3단계 요약) ② Tab(항공편/숙소/동행 구하기) ③ 여행정보 Form(항공: 국가·지역·출발일·귀국일 / 숙소: 국가·지역·체크인·체크아웃) ④ 입력 요약+외부 이동 Action Card ⑤ 입력값 비전달 고지+찾기 Tip 3개 ⑥ 동행 작성 Form(로그인·성인인증 미완료 시 로그인 안내로 대체)+안전 안내
- [ ] TC-2: 세 탭 전환 시 다른 탭의 입력값이 사라지지 않음(세션 내 유지)
- [ ] TC-3(보안/개인정보): 항공·숙소 입력값(국가·지역·날짜)은 Client Component 상태로만 처리, 서버 DB·로그·분석 이벤트·외부 URL query/body/cookie로 전달 금지(REQ-FUNC-017,025, REQ-NF-017)
- [ ] TC-4(보안/개인정보): 동행 작성 폼에 안전수칙 동의 체크박스 필수(REQ-FUNC-080)
- [ ] TC-5: Loading State — 외부 이동/글 등록 처리 중 로딩 인디케이터 표시
- [ ] TC-6: Error State — 외부 링크 생성·동행글 등록 실패 시 재시도 안내 카드 표시
- [ ] TC-7: Unauthorized State — 로그인·성인인증 미완료 시 동행 작성 Form이 로그인 안내 카드로 대체됨
- [ ] TC-8: 이 Task의 diff에 `src/components/**` 신규 파일이 없음(Component 생성은 별도 CMP-* Task 소관)

## Verify

- E2E-TRAVEL-TOOLS

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
