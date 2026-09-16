# PAGE-SCR001 — SCR-001 메인 페이지 조립

**Seq:** 1 · **Category:** PAGE_OWNER · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 1 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

SCR-001 메인 페이지 조립을(를) 담당하는 PAGE_OWNER Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 1 행과 동일)
- 관련 Requirement: REQ-FUNC-001~010, 047~054, 057, 068
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-001~010, 047~054, 057, 068

## Screen / Route / Page Entry

- Screen: SCR-001
- Route: `/`
- Page Entry: `src/app/page.tsx`

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-001 — 메인
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-001" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- CMP-SCR001-HERO
- CMP-SCR001-DESTINATION-GRIDS
- CMP-SCR001-DESTINATION-DRAWER
- CMP-SCR001-THEME-CHIPS
- CMP-SCR001-SAFETY-GRID-DRAWER
- CMP-SCR001-MATE-TEASER
- CMP-SCR001-ABOUT-SUMMARY
- DATA-DESTINATIONS
- DATA-SAFETY
- DATA-REPRESENTATIVE
- TOOL-LAYOUT-SHELL

## Expected Files

- 수정(교체): `src/app/page.tsx`(현재 Next.js 기본 스캐폴드 — Starter 문구·로고·기본 스타일 완전 제거)

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- Section 순서 정확히 7개, 순서 변경 불가: ① Hero(검색창+`/travel-tools` CTA) ② 국내 여행지 Card Grid 6개(출처: `src/data/destinations.ts`, scope=DOMESTIC) ③ 해외 여행지 Card Grid 6개(출처: 동일 파일, scope=OVERSEAS) ④ 여행 동기·테마 Chip 6개(출처: destinations의 `themes` 집계, 필터 연동) ⑤ 국가별 주의사항 Card 6개(출처: `src/data/country-safety.ts`) + 클릭 시 안전정보 Drawer ⑥ 최근 동행글 카드 3개(출처: `mate_post` 테이블) — 0건이면 완성형 Empty State(안내문+이용 방법 3줄+"동행글 작성하기" CTA→`/travel-tools`) ⑦ free_traveler 소개 요약(출처: `src/data/representative-profile.ts`)+`/about` CTA
- 카드 클릭 시 같은 화면에서 여행지/안전정보 Drawer(Desktop)·전체화면 Modal(Mobile)을 연다(별도 라우팅 없음)
- Lorem ipsum, "준비 중", "정보 확인 필요", 내용 없는 빈 카드 전면 금지
- **Loading State**(`SCREEN_ROUTE_CONTRACT.json` states=loading,success,empty,error): 여행지·안전정보·동행글 데이터 fetch 완료 전 Section②~⑥에 Skeleton Card 표시(빈 화면 금지)
- **Error State**: 데이터 로드 실패 시 해당 Section에 재시도 버튼 포함 오류 카드 표시(전체 페이지 크래시 금지)

## Visual AC

- Desktop 1440px: 콘텐츠 최대폭 1200~1280px, Section 상하 여백 64~96px, Card Grid 4열(안전정보 3열) 20px 간격
- Mobile 390px: 좌우 패딩 20px, Card 1열 16px 간격, Section 여백 40~64px
- Hero는 뷰포트 55~65%만 채워 Desktop 1440px 첫 화면에서 Section②가 보임(반응형 콘텐츠 밀도 규칙)
- `design-reference/D-001/DESIGN.md` 토큰만 사용(코랄 CTA 1곳, 짙은 회색 텍스트, 흰 배경, Airbnb 상표 요소 없음)

## Security/Privacy AC

- 즐겨찾기는 `localStorage`만 사용, 서버 전송 없음(REQ-FUNC-068)
- 안전정보 Drawer에 "공식 판단 대체 아님" 고지 문구 존재

## Test Cases

- [ ] TC-1: Section 순서 정확히 7개, 순서 변경 불가: ① Hero(검색창+`/travel-tools` CTA) ② 국내 여행지 Card Grid 6개(출처: `src/data/destinations.ts`, scope=DOMESTIC) ③ 해외 여행지 Card Grid 6개(출처: 동일 파일, scope=OVERSEAS) ④ 여행 동기·테마 Chip 6개(출처: destinations의 `themes` 집계, 필터 연동) ⑤ 국가별 주의사항 Card 6개(출처: `src/data/country-safety.ts`) + 클릭 시 안전정보 Drawer ⑥ 최근 동행글 카드 3개(출처: `mate_post` 테이블) — 0건이면 완성형 Empty State(안내문+이용 방법 3줄+"동행글 작성하기" CTA→`/travel-tools`) ⑦ free_traveler 소개 요약(출처: `src/data/representative-profile.ts`)+`/about` CTA
- [ ] TC-2: 카드 클릭 시 같은 화면에서 여행지/안전정보 Drawer(Desktop)·전체화면 Modal(Mobile)을 연다(별도 라우팅 없음)
- [ ] TC-3: Lorem ipsum, "준비 중", "정보 확인 필요", 내용 없는 빈 카드 전면 금지
- [ ] TC-4(보안/개인정보): 즐겨찾기는 `localStorage`만 사용, 서버 전송 없음(REQ-FUNC-068)
- [ ] TC-5(보안/개인정보): 안전정보 Drawer에 "공식 판단 대체 아님" 고지 문구 존재
- [ ] TC-6: Loading State — 데이터 fetch 완료 전 Skeleton Card 표시(빈 화면 금지)
- [ ] TC-7: Error State — 데이터 로드 실패 시 재시도 버튼 포함 오류 카드 표시
- [ ] TC-8: 이 Task의 diff에 `src/components/**` 신규 파일이 없음(Component 생성은 별도 CMP-* Task 소관)

## Verify

- E2E-PUBLIC-SMOKE

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
