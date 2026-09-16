# PAGE-SCR004 — SCR-004 동행 조회 페이지 조립

**Seq:** 4 · **Category:** PAGE_OWNER · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 4 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

SCR-004 동행 조회 페이지 조립을(를) 담당하는 PAGE_OWNER Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 4 행과 동일)
- 관련 Requirement: REQ-FUNC-030, 033~041
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-030, 033~041

## Screen / Route / Page Entry

- Screen: SCR-004
- Route: `/mates`
- Page Entry: `src/app/mates/page.tsx`

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-004 — 동행 조회
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-004" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- CMP-SCR004-FILTER-BAR
- CMP-SCR004-MATE-LIST
- CMP-SCR004-MATE-DETAIL
- CMP-SCR004-APPLY-FLOW
- CMP-SCR004-REPORT-BLOCK
- SA-MATE-APPLICATION
- SA-BLOCK
- SA-REPORT
- TOOL-LAYOUT-SHELL

## Expected Files

- 생성: `src/app/mates/page.tsx`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- Section 순서 정확히 6개: ① Intro+"동행글 작성하기" CTA(→`/travel-tools`) ② Filter(국가·지역·기간·연령대·성별·스타일·모집상태)+결과 요약("총 N건") ③ 동행글 Card 목록 최대 8개(9번째부터 페이지네이션) — 0건이면 완성형 Empty State(필터 초기화+"먼저 글을 등록해 보세요" CTA+이용 방법 3줄) ④ Desktop 목록+상세 분할 / Mobile 목록→상세 Drawer ⑤ 참가 신청 방법 3단계 안내 ⑥ 안전·신고·차단 안내 배너+`/travel-tools` CTA
- **Loading State**(`SCREEN_ROUTE_CONTRACT.json` states=loading,success,empty,error,unauthorized): 목록·상세 데이터 fetch 중 Skeleton Card 표시
- **Error State**: 목록/상세 로드 실패 시 재시도 버튼 포함 오류 카드 표시
- **Unauthorized State**: 참가 신청·신고·차단 등 쓰기 액션은 미로그인 시 로그인 안내로 전환(다이얼로그 진입 차단)

## Visual AC

- Desktop 1440px Filter는 가로 1행, 목록+상세 2단 분할
- Mobile 390px Filter는 Chip 가로 스크롤, 카드 1열, 상세는 전체화면 Drawer

## Security/Privacy AC

- 카드·상세 어디에도 전화번호·메신저ID·이메일 등 공개 연락처 노출 금지(REQ-FUNC-033)
- 차단 관계 상호 노출 제한, 참가 요청 중복 차단(REQ-FUNC-035,040)

## Test Cases

- [ ] TC-1: Section 순서 정확히 6개: ① Intro+"동행글 작성하기" CTA(→`/travel-tools`) ② Filter(국가·지역·기간·연령대·성별·스타일·모집상태)+결과 요약("총 N건") ③ 동행글 Card 목록 최대 8개(9번째부터 페이지네이션) — 0건이면 완성형 Empty State(필터 초기화+"먼저 글을 등록해 보세요" CTA+이용 방법 3줄) ④ Desktop 목록+상세 분할 / Mobile 목록→상세 Drawer ⑤ 참가 신청 방법 3단계 안내 ⑥ 안전·신고·차단 안내 배너+`/travel-tools` CTA
- [ ] TC-2(보안/개인정보): 카드·상세 어디에도 전화번호·메신저ID·이메일 등 공개 연락처 노출 금지(REQ-FUNC-033)
- [ ] TC-3(보안/개인정보): 차단 관계 상호 노출 제한, 참가 요청 중복 차단(REQ-FUNC-035,040)
- [ ] TC-4: Loading State — 목록·상세 데이터 fetch 중 Skeleton Card 표시
- [ ] TC-5: Error State — 목록/상세 로드 실패 시 재시도 버튼 포함 오류 카드 표시
- [ ] TC-6: Unauthorized State — 미로그인 상태에서 참가 신청·신고·차단 액션 시도 시 로그인 안내로 전환
- [ ] TC-7: 이 Task의 diff에 `src/components/**` 신규 파일이 없음(Component 생성은 별도 CMP-* Task 소관)

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
