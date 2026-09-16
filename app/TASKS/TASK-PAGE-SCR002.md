# PAGE-SCR002 — SCR-002 대표 소개 페이지 조립

**Seq:** 2 · **Category:** PAGE_OWNER · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 2 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

SCR-002 대표 소개 페이지 조립을(를) 담당하는 PAGE_OWNER Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 2 행과 동일)
- 관련 Requirement: REQ-FUNC-057~063
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-057~063

## Screen / Route / Page Entry

- Screen: SCR-002
- Route: `/about`
- Page Entry: `src/app/about/page.tsx`

## Design Ref

- `design-reference/UI_CONTRACT.md` § SCR-002 — 대표 소개
- `design-reference/SCREEN_ROUTE_CONTRACT.json` → `screens[]` 중 screen_id="SCR-002" 항목의 `section_order`/`min_content_counts`/`states`/`prohibited_features`
- `design-reference/D-001/DESIGN.md` Color/Typography/Spacing/Radius/Shadow 토큰(§3) 및 Do/Do Not(최하단)

## Depends On

- CMP-SCR002-HERO-STATS
- CMP-SCR002-INTRO-PHILOSOPHY
- CMP-SCR002-TIMELINE
- CMP-SCR002-COUNTRIES-CHIPS
- CMP-SCR002-GALLERY
- CMP-SCR002-RECOMMEND-CTA
- DATA-REPRESENTATIVE
- TOOL-LAYOUT-SHELL

## Expected Files

- 생성: `src/app/about/page.tsx`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- Section 순서 정확히 7개: ① Profile Hero ② 여행 지표(`50+ Trips`/`30+ Countries`/대륙 수) ③ 소개·철학(2~4문단) ④ Timeline 최소 6개 시점(출처: `representative-profile.ts`의 `timeline`) ⑤ 방문 국가 Chip 최소 30개, 권역별 그룹(출처: 동일 파일의 `visited_countries`) ⑥ Gallery 최소 8장, 서로 다른 장소(출처: 동일 파일의 media 목록, 각 alt에 실제 장소 서술) ⑦ 기억에 남는 여행지 4개 Card + CTA Banner(→`/travel-tools`, `/mates`)
- 별점·리뷰·평점 배지 금지(2026-09-15 Stitch 검증에서 발견되어 제거된 항목, 재도입 금지)
- Lorem ipsum/"준비 중" 금지, 빈 카드 금지
- **Loading State**(`SCREEN_ROUTE_CONTRACT.json` states=loading,success — Empty/Error 상태 정의 없음): 대표소개 데이터(Timeline/Chip/Gallery) fetch 완료 전 Skeleton 표시, 빈 화면 금지

## Visual AC

- Desktop 1440px 콘텐츠 최대폭 1200~1280px, Section 여백 64~96px, Gallery 4열
- Mobile 390px는 반응형 CSS로 1열 스택(승인된 Stitch Mobile 화면은 없음, 반응형 구현은 이 Task 책임)

## Security/Privacy AC

- 이미지에 alt 필수(실제 장소 서술), 출처/작가는 축소된 캡션만(라이선스 승인 워크플로 없음)

## Test Cases

- [ ] TC-1: Section 순서 정확히 7개: ① Profile Hero ② 여행 지표(`50+ Trips`/`30+ Countries`/대륙 수) ③ 소개·철학(2~4문단) ④ Timeline 최소 6개 시점(출처: `representative-profile.ts`의 `timeline`) ⑤ 방문 국가 Chip 최소 30개, 권역별 그룹(출처: 동일 파일의 `visited_countries`) ⑥ Gallery 최소 8장, 서로 다른 장소(출처: 동일 파일의 media 목록, 각 alt에 실제 장소 서술) ⑦ 기억에 남는 여행지 4개 Card + CTA Banner(→`/travel-tools`, `/mates`)
- [ ] TC-2: 별점·리뷰·평점 배지 금지(2026-09-15 Stitch 검증에서 발견되어 제거된 항목, 재도입 금지)
- [ ] TC-3: Lorem ipsum/"준비 중" 금지, 빈 카드 금지
- [ ] TC-4(보안/개인정보): 이미지에 alt 필수(실제 장소 서술), 출처/작가는 축소된 캡션만(라이선스 승인 워크플로 없음)
- [ ] TC-5: Loading State — 데이터 fetch 완료 전 Skeleton 표시(빈 화면 금지)
- [ ] TC-6: 이 Task의 diff에 `src/components/**` 신규 파일이 없음(Component 생성은 별도 CMP-* Task 소관)

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
