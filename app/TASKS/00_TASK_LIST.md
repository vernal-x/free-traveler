# Free Traveler — Task List

**Document ID:** TASKLIST-TRAVEL-001
**기반 문서:** `docs/02_SRS_BASELINE.md`, `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`,
`docs/UIUX_TRACEABILITY.md`, `design-reference/D-001/DESIGN.md`, `design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`, 실제 `src/app` 파일 트리
**선행 검사:** `python3 scripts/validate_inputs.py` — **PASSED**(오류 0건, 경고 0건). 현재
`src/app`에는 `favicon.ico`, `globals.css`, `layout.tsx`, `page.tsx`(Next.js 기본 스캐폴드)
4개 파일만 존재하며, 그 외 5개 Screen의 Page Entry는 아직 생성되지 않았다.
**상태:** 코드 구현 없음 — 이 문서는 Task 계약이며 구현 완료를 의미하지 않는다.

이 문서는 아래 두 개의 연결된 표로 각 Task의 16개 속성(Seq, Task ID, 제목, Category,
Implementation Status, Requirement Ref, Screen, Route, Page Entry, Depends On, Priority /
Expected Files, Functional AC, Visual AC, Security·Privacy AC, Verify)을 모두 기록한다.
16개 열을 하나의 표에 모두 넣으면 각 행이 지나치게 길어져 읽을 수 없으므로, **Task ID를
연결 키로 하는 Table A(식별·라우팅)와 Table B(파일·수용기준·검증)**로 분리했다 — 열 자체를
생략한 것이 아니다.

---

## 0. 요약

### 0-1. Task 총 개수 및 Category별 개수

| Category | 개수 | Task ID |
|---|---:|---|
| PAGE_OWNER | 5 | PAGE-SCR001~005 |
| COMPONENT | 28 | CMP-SCR00X-* |
| DATA | 3 | DATA-DESTINATIONS, DATA-SAFETY, DATA-REPRESENTATIVE |
| DB | 4 | DB-SCHEMA-BASE, DB-RLS-BASE, DB-ACCESS, DB-SEED-BASE |
| AUTH / SERVER_ACTION | 9 | AUTH-EMAIL-ADULT, SA-* |
| TOOLING | 6 | TOOL-* |
| UNIT_TEST | 3 | UNIT-TRAVEL-DATES, UNIT-CONTACT-DETECTION, UNIT-MATE-STATE |
| DB_TEST | 1 | TEST-RLS-BASIC |
| E2E_TEST | 3 | E2E-PUBLIC-SMOKE, E2E-TRAVEL-TOOLS, E2E-MATE-AUTH |
| CI_RELEASE | 2 | CI-PIPELINE, RELEASE-VERCEL-SUPABASE-CHECK |
| MANUAL_CHECK | 1 | MANUAL-RESPONSIVE-A11Y-CHECK |
| **합계** | **65** | (약 45~65 예상 범위 내 — 개수 자체는 완료 조건 아님) |

### 0-2. Requirement 커버리지

| 구분 | 건수 |
|---|---:|
| REQ-FUNC-001~080 | 80 |
| REQ-NF-001~034 | 34 |
| **합계(삭제 없음)** | **114** |
| Implementation Status = IMPLEMENT 계열 → 구현 Task + Verify Task 연결됨 | 90 |
| Implementation Status = EXCLUDED → §5 NON_IMPLEMENTATION 표에 근거·후속 방향 기록 | 24 |
| **90 + 24** | **114 — 일치** |

**빠진 Requirement ID: 없음.** §6 "Requirement → Task 매핑 검증"에서 90건 전부가 실제
`tasks[]`의 Requirement Ref에 등장함을, §5에서 24건 전부가 EXCLUDED로 기록됨을 각각
확인했다.

---

## 1. PAGE_OWNER (5)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | PAGE-SCR001 | SCR-001 메인 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-001~010, 047~054, 057, 068 | SCR-001 | `/` | `src/app/page.tsx` | CMP-SCR001-HERO, CMP-SCR001-DESTINATION-GRIDS, CMP-SCR001-DESTINATION-DRAWER, CMP-SCR001-THEME-CHIPS, CMP-SCR001-SAFETY-GRID-DRAWER, CMP-SCR001-MATE-TEASER, CMP-SCR001-ABOUT-SUMMARY, DATA-DESTINATIONS, DATA-SAFETY, DATA-REPRESENTATIVE, TOOL-LAYOUT-SHELL | M |
| 2 | PAGE-SCR002 | SCR-002 대표 소개 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-057~063 | SCR-002 | `/about` | `src/app/about/page.tsx` | CMP-SCR002-HERO-STATS, CMP-SCR002-INTRO-PHILOSOPHY, CMP-SCR002-TIMELINE, CMP-SCR002-COUNTRIES-CHIPS, CMP-SCR002-GALLERY, CMP-SCR002-RECOMMEND-CTA, DATA-REPRESENTATIVE, TOOL-LAYOUT-SHELL | M |
| 3 | PAGE-SCR003 | SCR-003 통합 여행 준비 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-011~032, 054, 080 | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | CMP-SCR003-INTRO-TABS, CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM, CMP-SCR003-DISCLOSURE-TIPS, CMP-SCR003-MATE-COMPOSER, TOOL-POLICY-PAGES, AUTH-EMAIL-ADULT, SA-MATE-POST, TOOL-LAYOUT-SHELL | M |
| 4 | PAGE-SCR004 | SCR-004 동행 조회 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-030, 033~041 | SCR-004 | `/mates` | `src/app/mates/page.tsx` | CMP-SCR004-FILTER-BAR, CMP-SCR004-MATE-LIST, CMP-SCR004-MATE-DETAIL, CMP-SCR004-APPLY-FLOW, CMP-SCR004-REPORT-BLOCK, SA-MATE-APPLICATION, SA-BLOCK, SA-REPORT, TOOL-LAYOUT-SHELL | M |
| 5 | PAGE-SCR005 | SCR-005 계정·관리 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-028, 029, 036, 038, 040, 041, 045, 066, 077 | SCR-005 | `/account` | `src/app/account/page.tsx` | CMP-SCR005-GUEST-AUTH, CMP-SCR005-PROFILE, CMP-SCR005-MY-ACTIVITY, CMP-SCR005-ADMIN-REPORTS, CMP-SCR005-ADMIN-URL-SETTINGS, AUTH-EMAIL-ADULT, SA-ACCOUNT-DELETE, SA-EXTERNAL-URL-SETTINGS, TOOL-LAYOUT-SHELL | M |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| PAGE-SCR001 | 수정(교체): `src/app/page.tsx`(현재 Next.js 기본 스캐폴드 — Starter 문구·로고·기본 스타일 완전 제거) | Section 순서 정확히 7개, 순서 변경 불가: ① Hero(검색창+`/travel-tools` CTA) ② 국내 여행지 Card Grid 6개(출처: `src/data/destinations.ts`, scope=DOMESTIC) ③ 해외 여행지 Card Grid 6개(출처: 동일 파일, scope=OVERSEAS) ④ 여행 동기·테마 Chip 6개(출처: destinations의 `themes` 집계, 필터 연동) ⑤ 국가별 주의사항 Card 6개(출처: `src/data/country-safety.ts`) + 클릭 시 안전정보 Drawer ⑥ 최근 동행글 카드 3개(출처: `mate_post` 테이블) — 0건이면 완성형 Empty State(안내문+이용 방법 3줄+"동행글 작성하기" CTA→`/travel-tools`) ⑦ free_traveler 소개 요약(출처: `src/data/representative-profile.ts`)+`/about` CTA<br>카드 클릭 시 같은 화면에서 여행지/안전정보 Drawer(Desktop)·전체화면 Modal(Mobile)을 연다(별도 라우팅 없음)<br>Lorem ipsum, "준비 중", "정보 확인 필요", 내용 없는 빈 카드 전면 금지<br>**Loading State**(`SCREEN_ROUTE_CONTRACT.json` states): 여행지·안전정보·동행글 데이터 fetch 완료 전 Section②~⑥에 Skeleton Card 표시(빈 화면 금지)<br>**Error State**: 데이터 로드 실패 시 해당 Section에 재시도 버튼 포함 오류 카드 표시(전체 페이지 크래시 금지) | Desktop 1440px: 콘텐츠 최대폭 1200~1280px, Section 상하 여백 64~96px, Card Grid 4열(안전정보 3열) 20px 간격<br>Mobile 390px: 좌우 패딩 20px, Card 1열 16px 간격, Section 여백 40~64px<br>Hero는 뷰포트 55~65%만 채워 Desktop 1440px 첫 화면에서 Section②가 보임(반응형 콘텐츠 밀도 규칙)<br>`design-reference/D-001/DESIGN.md` 토큰만 사용(코랄 CTA 1곳, 짙은 회색 텍스트, 흰 배경, Airbnb 상표 요소 없음) | 즐겨찾기는 `localStorage`만 사용, 서버 전송 없음(REQ-FUNC-068)<br>안전정보 Drawer에 "공식 판단 대체 아님" 고지 문구 존재 | E2E-PUBLIC-SMOKE |
| PAGE-SCR002 | 생성: `src/app/about/page.tsx` | Section 순서 정확히 7개: ① Profile Hero ② 여행 지표(`50+ Trips`/`30+ Countries`/대륙 수) ③ 소개·철학(2~4문단) ④ Timeline 최소 6개 시점(출처: `representative-profile.ts`의 `timeline`) ⑤ 방문 국가 Chip 최소 30개, 권역별 그룹(출처: 동일 파일의 `visited_countries`) ⑥ Gallery 최소 8장, 서로 다른 장소(출처: 동일 파일의 media 목록, 각 alt에 실제 장소 서술) ⑦ 기억에 남는 여행지 4개 Card + CTA Banner(→`/travel-tools`, `/mates`)<br>별점·리뷰·평점 배지 금지(2026-09-15 Stitch 검증에서 발견되어 제거된 항목, 재도입 금지)<br>Lorem ipsum/"준비 중" 금지, 빈 카드 금지<br>**Loading State**(`SCREEN_ROUTE_CONTRACT.json` states=loading,success만 — Empty/Error 상태 정의 없음): 대표소개 데이터(Timeline/Chip/Gallery) fetch 완료 전 Skeleton 표시, 빈 화면 금지 | Desktop 1440px 콘텐츠 최대폭 1200~1280px, Section 여백 64~96px, Gallery 4열<br>Mobile 390px는 반응형 CSS로 1열 스택(승인된 Stitch Mobile 화면은 없음, 반응형 구현은 이 Task 책임) | 이미지에 alt 필수(실제 장소 서술), 출처/작가는 축소된 캡션만(라이선스 승인 워크플로 없음) | E2E-PUBLIC-SMOKE |
| PAGE-SCR003 | 생성: `src/app/travel-tools/page.tsx` | Section 순서 정확히 6개, 탭별 입력·검증·완료 상태 독립 유지: ① Intro(3단계 요약) ② Tab(항공편/숙소/동행 구하기) ③ 여행정보 Form(항공: 국가·지역·출발일·귀국일 / 숙소: 국가·지역·체크인·체크아웃) ④ 입력 요약+외부 이동 Action Card ⑤ 입력값 비전달 고지+찾기 Tip 3개 ⑥ 동행 작성 Form(로그인·성인인증 미완료 시 로그인 안내로 대체)+안전 안내<br>세 탭 전환 시 다른 탭의 입력값이 사라지지 않음(세션 내 유지)<br>**Loading State**(`SCREEN_ROUTE_CONTRACT.json` states): 외부 이동/글 등록 처리 중 해당 버튼에 로딩 인디케이터 표시<br>**Error State**: 외부 링크 생성·동행글 등록 실패 시 재시도 안내 카드 표시(입력값 유지)<br>**Unauthorized State**: Section⑥은 로그인·성인인증 미완료 시 로그인 안내 카드로 전면 대체(이미 위 Section⑥ 정의와 동일 — 상태명으로 재확인) | Desktop 1440px 좌(Form)·우(안내 카드) 분할, Mobile 390px 세로 스택, 3-Tip Card는 Desktop 가로 3열/Mobile 세로 1열<br>Intro는 텍스트 중심 축소형 밴드(사진 Hero 아님)로 Desktop 첫 화면에서 Tab 상단이 보임 | 항공·숙소 입력값(국가·지역·날짜)은 Client Component 상태로만 처리, 서버 DB·로그·분석 이벤트·외부 URL query/body/cookie로 전달 금지(REQ-FUNC-017,025, REQ-NF-017)<br>동행 작성 폼에 안전수칙 동의 체크박스 필수(REQ-FUNC-080) | E2E-TRAVEL-TOOLS |
| PAGE-SCR004 | 생성: `src/app/mates/page.tsx` | Section 순서 정확히 6개: ① Intro+"동행글 작성하기" CTA(→`/travel-tools`) ② Filter(국가·지역·기간·연령대·성별·스타일·모집상태)+결과 요약("총 N건") ③ 동행글 Card 목록 최대 8개(9번째부터 페이지네이션) — 0건이면 완성형 Empty State(필터 초기화+"먼저 글을 등록해 보세요" CTA+이용 방법 3줄) ④ Desktop 목록+상세 분할 / Mobile 목록→상세 Drawer ⑤ 참가 신청 방법 3단계 안내 ⑥ 안전·신고·차단 안내 배너+`/travel-tools` CTA<br>**Loading State**(`SCREEN_ROUTE_CONTRACT.json` states): 목록·상세 데이터 fetch 중 Skeleton Card 표시<br>**Error State**: 목록/상세 로드 실패 시 재시도 버튼 포함 오류 카드 표시<br>**Unauthorized State**: 참가 신청·신고·차단 등 쓰기 액션은 미로그인 시 로그인 안내로 전환(다이얼로그 진입 차단) | Desktop 1440px Filter는 가로 1행, 목록+상세 2단 분할<br>Mobile 390px Filter는 Chip 가로 스크롤, 카드 1열, 상세는 전체화면 Drawer | 카드·상세 어디에도 전화번호·메신저ID·이메일 등 공개 연락처 노출 금지(REQ-FUNC-033)<br>차단 관계 상호 노출 제한, 참가 요청 중복 차단(REQ-FUNC-035,040) | E2E-MATE-AUTH |
| PAGE-SCR005 | 생성: `src/app/account/page.tsx` | 역할별(Guest/Member/Admin) Intro→핵심 작업→도움말/다음 행동 구조. 역할에 없는 탭은 렌더링 자체를 하지 않음(비활성화 아님)<br>Guest: 계정 기능 Intro + 로그인/가입/비밀번호 재설정 Card + 로그인 후 가능한 기능 3단계 + 보안 안내<br>Member: 프로필·성인 확인 요약 + 내 글 + 참가 요청(받은/보낸) + 차단 목록 + 새 동행글 작성 CTA(→`/travel-tools`), 각 목록 0건이면 완성형 Empty State<br>Admin: 관리 Intro + 신고 상태 변경(OPEN/RESOLVED/DISMISSED) + 항공·숙소 외부 URL 설정, 복잡한 Dashboard(차트/그래프) 없음<br>**Loading State**(`SCREEN_ROUTE_CONTRACT.json` states): 프로필·내 글·신청·차단 목록 fetch 중 Skeleton 표시<br>**Error State**: 각 목록 로드 실패 시 재시도 카드 표시<br>**Unauthorized State**: Admin 탭은 관리자 아닌 사용자에게 렌더링 자체 금지, Member 전용 데이터는 비로그인 시 Guest 분기로 대체 | Desktop 1440px 좌측 세로 탭(Member/Admin) 또는 상단 Card 3열(Guest)<br>Mobile은 반응형 CSS로 좌측 탭→상단 드롭다운/세그먼트 전환(별도 승인 Mobile 화면 없음) | 정확한 생년월일 저장/노출 UI 없음, 성인 여부·확인 시각만(REQ-FUNC-028)<br>탈퇴 시 즉시 비식별화, 신분증 업로드 UI 없음, 범용 감사 로그 UI 없음(REQ-FUNC-045, EXCLUDED 042/076과 구분) | E2E-MATE-AUTH |

---

## 2. COMPONENT (28)

### 2-1. SCR-001 (7)

#### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 6 | CMP-SCR001-HERO | 검색 Hero(검색창+CTA) | COMPONENT | IMPLEMENT | REQ-FUNC-003, 064 | SCR-001 | — (PAGE-SCR001 소속) | — | TOOL-DESIGN-TOKENS | M |
| 7 | CMP-SCR001-DESTINATION-GRIDS | 국내·해외 여행지 Card Grid | COMPONENT | IMPLEMENT | REQ-FUNC-001, 002, 004, 005, 007, 009, 010, 068, REQ-NF-004 | SCR-001 | — | — | DATA-DESTINATIONS, TOOL-DESIGN-TOKENS, SA-FAVORITES-LOCALSTORAGE | M |
| 8 | CMP-SCR001-DESTINATION-DRAWER | 여행지 상세 Drawer/Modal | COMPONENT | IMPLEMENT | REQ-FUNC-004, 006, 007, 009 | SCR-001 | — | — | DATA-DESTINATIONS, CMP-SCR001-SAFETY-GRID-DRAWER | M |
| 9 | CMP-SCR001-THEME-CHIPS | 여행 동기·테마 Chip 6 | COMPONENT | IMPLEMENT | REQ-FUNC-002, 010 | SCR-001 | — | — | DATA-DESTINATIONS, TOOL-DESIGN-TOKENS | S |
| 10 | CMP-SCR001-SAFETY-GRID-DRAWER | 국가별 주의사항 Card 6 + 안전정보 Drawer | COMPONENT | IMPLEMENT | REQ-FUNC-006, 047~054 | SCR-001 | — | — | DATA-SAFETY, TOOL-DESIGN-TOKENS | M |
| 11 | CMP-SCR001-MATE-TEASER | 최근 동행글 3개/Empty State | COMPONENT | IMPLEMENT | (직접 REQ 없음 — `mate_post` 데이터 재사용) | SCR-001 | — | — | DB-ACCESS, TOOL-DESIGN-TOKENS | S |
| 12 | CMP-SCR001-ABOUT-SUMMARY | free_traveler 소개 요약 | COMPONENT | IMPLEMENT | REQ-FUNC-057 | SCR-001 | — | — | DATA-REPRESENTATIVE | S |

#### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| CMP-SCR001-HERO | 생성: `src/components/scr001/HeroSearch.tsx` | 키워드 검색창(도시·국가·테마 자동완성), "여행 준비 시작하기" 버튼(→`/travel-tools`) | `radius.pill` 검색바, 코랄 CTA 1개 | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR001-DESTINATION-GRIDS | 생성: `src/components/scr001/DestinationGrid.tsx`, `DestinationCard.tsx` | 국내 6·해외 6 최소 카드 수, 필터 AND 조건, 빈 결과 시 안내+초기화 버튼(Lorem/빈 카드 금지), 즐겨찾기 토글은 `localStorage`에만 저장 | Desktop 4열/Mobile 1열, 카드 hover 시만 `shadow.card` | 즐겨찾기 데이터는 클라이언트 저장만, 서버 전송 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR001-DESTINATION-DRAWER | 생성: `src/components/scr001/DestinationDrawer.tsx` | 소개 300자↑, 명소 5개↑, 1일/3일 일정, 예산, 교통, 음식 3개↑, 에티켓 3개↑, 출처·수정일, 관련 여행지 최대 6개, "안전정보 보기" 전환 | Desktop 우측 480px Drawer, Mobile 전체화면 Modal | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR001-THEME-CHIPS | 생성: `src/components/scr001/ThemeChips.tsx` | Chip 6개, 클릭 시 URL query 필터 상태 반영 | Desktop wrap, Mobile 가로 스크롤 1줄 | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR001-SAFETY-GRID-DRAWER | 생성: `src/components/scr001/SafetyGrid.tsx`, `SafetyDrawer.tsx` | 8개 카테고리, 경보 범위(국가/지역 구분), stale(7일 초과) 배지 렌더링 시 계산, 외교부 원문 링크(`noopener,noreferrer`), "공식 판단 대체 아님" 고지 | 중대 경보는 텍스트 라벨과 함께 상단 배치(색상만 사용 금지) | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR001-MATE-TEASER | 생성: `src/components/scr001/MateTeaser.tsx` | 최근 3개 카드 또는 완성형 Empty State(안내문+이용 방법 3줄+"동행글 작성하기" CTA) | 카드에 공개 연락처 미노출 | 목록 조회는 공개 필드만(비공개 신청 메시지 제외) | E2E-PUBLIC-SMOKE |
| CMP-SCR001-ABOUT-SUMMARY | 생성: `src/components/scr001/AboutSummary.tsx` | `50+ Trips`/`30+ Countries` 전역 일관, "대표 소개 보러가기" CTA | 좌우 분할 레이아웃 | 해당 없음 | E2E-PUBLIC-SMOKE |

### 2-2. SCR-002 (6)

#### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 13 | CMP-SCR002-HERO-STATS | Profile Hero + 여행 지표 | COMPONENT | IMPLEMENT | REQ-FUNC-057 | SCR-002 | — | — | DATA-REPRESENTATIVE | M |
| 14 | CMP-SCR002-INTRO-PHILOSOPHY | 소개·철학 2~4문단 | COMPONENT | IMPLEMENT | REQ-FUNC-058 | SCR-002 | — | — | DATA-REPRESENTATIVE | M |
| 15 | CMP-SCR002-TIMELINE | 여행 Timeline 6개↑ | COMPONENT | IMPLEMENT | REQ-FUNC-060 | SCR-002 | — | — | DATA-REPRESENTATIVE | S |
| 16 | CMP-SCR002-COUNTRIES-CHIPS | 방문 국가 Chip 30개 | COMPONENT | IMPLEMENT | REQ-FUNC-059 | SCR-002 | — | — | DATA-REPRESENTATIVE | S |
| 17 | CMP-SCR002-GALLERY | 여행 사진 Gallery 8장↑ | COMPONENT | IMPLEMENT(축소) | REQ-FUNC-061 | SCR-002 | — | — | DATA-REPRESENTATIVE | S |
| 18 | CMP-SCR002-RECOMMEND-CTA | 추천 여행지 4 + CTA Banner | COMPONENT | IMPLEMENT | REQ-FUNC-062, 063 | SCR-002 | — | — | DATA-REPRESENTATIVE, DATA-DESTINATIONS | S |

#### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| CMP-SCR002-HERO-STATS | 생성: `src/components/scr002/ProfileHero.tsx` | `50+ Trips`/`30+ Countries`/대륙 수 카드 3개, 대표명·한 줄 소개 | Hero는 뷰포트 55~65%만 채움 | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR002-INTRO-PHILOSOPHY | 생성: `src/components/scr002/IntroPhilosophy.tsx` | 자기소개→계기→철학 인용→편집 원칙 순 2~4문단, Lorem/빈 문단 금지 | 좌(텍스트)·우(사진) 분할 | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR002-TIMELINE | 생성: `src/components/scr002/Timeline.tsx` | 최소 6개 시점, 각 항목 연도·장소·요약 | 좌측 코랄 타임라인 도트 | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR002-COUNTRIES-CHIPS | 생성: `src/components/scr002/CountryChips.tsx` | 정확히 30개국(2026-09-15 Stitch 검증에서 28→30 보정된 값), 권역 4그룹(아시아/유럽/북미/오세아니아) | Desktop wrap, Mobile 가로 스크롤 | 해당 없음 | E2E-PUBLIC-SMOKE |
| CMP-SCR002-GALLERY | 생성: `src/components/scr002/Gallery.tsx` | 서로 다른 장소 8장↑, 각 alt에 실제 장소 서술, **별점/평점 배지 금지**(재발 방지 — 2026-09-15 발견 항목) | Desktop 4열 Grid | 이미지 alt 필수, 출처/작가는 축소 캡션만 | MANUAL-RESPONSIVE-A11Y-CHECK |
| CMP-SCR002-RECOMMEND-CTA | 생성: `src/components/scr002/RecommendCta.tsx` | 4개 Card(별점 배지 금지)+CTA Banner("여행 조건 정리"→`/travel-tools`, "동행 찾기"→`/mates`) | 카드 클릭 시 SCR-001 상세 Drawer로 이동 | 해당 없음 | E2E-PUBLIC-SMOKE |

### 2-3. SCR-003 (5)

#### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 19 | CMP-SCR003-INTRO-TABS | Intro + 탭 셸(항공/숙소/동행) | COMPONENT | IMPLEMENT | REQ-FUNC-064 | SCR-003 | — | — | TOOL-DESIGN-TOKENS | M |
| 20 | CMP-SCR003-FLIGHT-FORM | 항공 Form·검증·요약·외부이동 | COMPONENT | IMPLEMENT(축소 일부) | REQ-FUNC-011~018, REQ-NF-017 | SCR-003 | — | — | CMP-SCR003-INTRO-TABS, TOOL-DESIGN-TOKENS | M |
| 21 | CMP-SCR003-HOTEL-FORM | 숙소 Form·검증·요약·외부이동 | COMPONENT | IMPLEMENT(축소 일부) | REQ-FUNC-019~026, REQ-NF-017 | SCR-003 | — | — | CMP-SCR003-INTRO-TABS, TOOL-DESIGN-TOKENS | M |
| 22 | CMP-SCR003-DISCLOSURE-TIPS | 비전달 고지 + Tip 3개 | COMPONENT | IMPLEMENT | REQ-FUNC-015, 017, 023, 025, 054 | SCR-003 | — | — | CMP-SCR001-SAFETY-GRID-DRAWER | S |
| 23 | CMP-SCR003-MATE-COMPOSER | 동행 작성 Form/로그인 안내 + 안전 안내 | COMPONENT | IMPLEMENT(축소) | REQ-FUNC-027~029, 031, 032, 080 | SCR-003 | — | — | AUTH-EMAIL-ADULT, SA-MATE-POST, TOOL-POLICY-PAGES | M |

#### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| CMP-SCR003-INTRO-TABS | 생성: `src/components/scr003/TravelToolsIntro.tsx`, `Tabs.tsx` | 3단계 요약 문구, 탭 3개(항공편/숙소/동행 구하기), 탭 전환 시 다른 탭 입력값 유지 | 활성 탭 코랄 밑줄, Mobile 세그먼트 컨트롤 | 해당 없음 | E2E-TRAVEL-TOOLS |
| CMP-SCR003-FLIGHT-FORM | 생성: `src/components/scr003/FlightForm.tsx` | 국가→지역 종속, 출발일 과거/귀국일<출발일 차단, 요약+비전달 고지, "항공편 보러 가기"(새 탭, `noopener,noreferrer`), URL 미설정 시 오류+재시도 | Desktop 좌우 분할, Mobile 세로 스택 | **서버 API 없음(`api/flights/*` 생성 금지)**, DB·로그·분석 이벤트에 원시 입력값 저장 금지 | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS |
| CMP-SCR003-HOTEL-FORM | 생성: `src/components/scr003/HotelForm.tsx` | 체크인 과거/체크아웃≤체크인 차단, 나머지 FlightForm과 동일 패턴 | 동일 | **서버 API 없음(`api/hotels/*` 생성 금지)**, 원시 입력값 미저장 | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS |
| CMP-SCR003-DISCLOSURE-TIPS | 생성: `src/components/scr003/DisclosureTips.tsx` | 고지 문구 상시 노출, 팁 카드 3개(항공권 검색 시기/숙소 교통 접근성/안전정보 재확인, 안전정보 링크는 SCR-001 Drawer로 연결) | Desktop 3열, Mobile 1열 | 해당 없음 | E2E-TRAVEL-TOOLS |
| CMP-SCR003-MATE-COMPOSER | 생성: `src/components/scr003/MateComposer.tsx` | 비로그인/미성년: 로그인 안내 카드. 로그인+성인 인증 완료: 제목/국가/지역/기간/인원/스타일/설명/안전수칙 동의 폼, 연락처 패턴 감지 시 인라인 오류로 제출 차단 | 폼 필드 `radius.sm`, 오류는 `color.danger` | 전화번호·이메일·메신저ID 정규식 탐지, 미탐지 케이스는 수동 확인(UNIT-CONTACT-DETECTION) | UNIT-CONTACT-DETECTION, E2E-MATE-AUTH |

### 2-4. SCR-004 (5)

#### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 24 | CMP-SCR004-FILTER-BAR | Filter + 결과 요약 | COMPONENT | IMPLEMENT | REQ-FUNC-030, REQ-NF-005 | SCR-004 | — | — | DB-ACCESS, TOOL-DESIGN-TOKENS | M |
| 25 | CMP-SCR004-MATE-LIST | 동행글 목록/Empty State | COMPONENT | IMPLEMENT | REQ-FUNC-033, 037 | SCR-004 | — | — | SA-MATE-POST, DB-ACCESS | M |
| 26 | CMP-SCR004-MATE-DETAIL | 상세 패널(Split/Drawer) | COMPONENT | IMPLEMENT | REQ-FUNC-033, 037 | SCR-004 | — | — | SA-MATE-POST, DB-ACCESS | M |
| 27 | CMP-SCR004-APPLY-FLOW | 참가 신청 Form + 3단계 안내 | COMPONENT | IMPLEMENT | REQ-FUNC-034, 035 | SCR-004 | — | — | SA-MATE-APPLICATION, AUTH-EMAIL-ADULT | M |
| 28 | CMP-SCR004-REPORT-BLOCK | 신고/차단 진입 + 안전 안내 | COMPONENT | IMPLEMENT | REQ-FUNC-039, 040, 080 | SCR-004 | — | — | SA-REPORT, SA-BLOCK, TOOL-POLICY-PAGES | M |

#### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| CMP-SCR004-FILTER-BAR | 생성: `src/components/scr004/FilterBar.tsx` | 국가/지역/기간/연령대/성별/스타일/모집상태 필터, 차단 사용자 글 결과 제외, "총 N건" 표시 | Desktop 1행, Mobile Chip 가로 스크롤 | 차단 관계 상호 비노출 | E2E-MATE-AUTH |
| CMP-SCR004-MATE-LIST | 생성: `src/components/scr004/MateList.tsx`, `MatePostCard.tsx` | 최대 8개 + 페이지네이션, 모집중/CLOSED 배지는 조회 시 종료일 계산(배치 잡 없음), 0건 시 완성형 Empty State(필터 초기화+작성 CTA+이용 방법 3줄) | Desktop Grid, Mobile 1열 | 카드에 공개 연락처·실명 과다 노출 없음 | E2E-MATE-AUTH |
| CMP-SCR004-MATE-DETAIL | 생성: `src/components/scr004/MateDetailPanel.tsx` | 작성자 소개·조건·설명·상태 배지 표시, 연락처 비노출 | Desktop 우측 패널(목록 유지), Mobile 하단→전체 Drawer | 비공개 신청 메시지는 작성자·요청자만 열람(RLS) | E2E-MATE-AUTH |
| CMP-SCR004-APPLY-FLOW | 생성: `src/components/scr004/ApplyForm.tsx`, `ApplySteps.tsx` | 참가 메시지 500자 제한, 중복 PENDING/ACCEPTED 요청 차단, 3단계 안내 카드 | Desktop 3열, Mobile 1열 | 메시지는 작성자·요청자 외 비공개 | UNIT-MATE-STATE, E2E-MATE-AUTH |
| CMP-SCR004-REPORT-BLOCK | 생성: `src/components/scr004/ReportForm.tsx`, `SafetyBanner.tsx` | 신고 사유코드+설명, 접수번호 3초 이내 표시, 차단/해제 진입점, 안전수칙 요약+"여행 조건도 정리"(→`/travel-tools`) CTA | CTA Banner 패턴 | 서비스는 신원·안전을 보증하지 않는다는 고지 표시 | E2E-MATE-AUTH |

### 2-5. SCR-005 (5)

#### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 29 | CMP-SCR005-GUEST-AUTH | 로그인/가입/재설정 Card + 성인확인 | COMPONENT | IMPLEMENT | REQ-FUNC-028, 066 | SCR-005 | — | — | AUTH-EMAIL-ADULT | M |
| 30 | CMP-SCR005-PROFILE | 프로필 편집 + 탈퇴 | COMPONENT | IMPLEMENT(축소) | REQ-FUNC-029, 045 | SCR-005 | — | — | DB-ACCESS, SA-ACCOUNT-DELETE | M |
| 31 | CMP-SCR005-MY-ACTIVITY | 내 글/받은·보낸 요청/차단 목록 | COMPONENT | IMPLEMENT | REQ-FUNC-036, 038, 040 | SCR-005 | — | — | SA-MATE-POST, SA-MATE-APPLICATION, SA-BLOCK | M |
| 32 | CMP-SCR005-ADMIN-REPORTS | 신고 상태 관리(축소) | COMPONENT | IMPLEMENT(축소) | REQ-FUNC-041 | SCR-005 | — | — | SA-REPORT | M |
| 33 | CMP-SCR005-ADMIN-URL-SETTINGS | 외부 URL 설정 | COMPONENT | IMPLEMENT | REQ-FUNC-077 | SCR-005 | — | — | SA-EXTERNAL-URL-SETTINGS | M |

#### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| CMP-SCR005-GUEST-AUTH | 생성: `src/components/scr005/GuestAuthCards.tsx` | 로그인/가입(성인확인 포함)/비밀번호 재설정 3개 Card, 로그인 후 가능한 기능 3단계, 보안 안내 배너 | Desktop 3열 Card, Mobile 1열 | 정확한 생년월일 미저장, 성인 여부+확인 시각만 저장 | E2E-MATE-AUTH |
| CMP-SCR005-PROFILE | 생성: `src/components/scr005/ProfileForm.tsx` | 닉네임/연령대/성별(선택)/스타일/자기소개 편집, 탈퇴 버튼(즉시 비식별화, 30일 유예·법적 보존 예외는 이번 범위 제외) | 폼 표준 스타일 | 탈퇴 즉시 처리, 신분증 업로드 UI 없음 | E2E-MATE-AUTH |
| CMP-SCR005-MY-ACTIVITY | 생성: `src/components/scr005/MyPosts.tsx`, `MyRequests.tsx`, `MyBlocklist.tsx` | 3개 하위 목록 각각 0건이면 완성형 Empty State(안내+이용 방법+CTA), 승인/거절·마감/수정/삭제·차단 해제 동작 | 탭/서브탭 구조 | 본인 데이터만 RLS로 열람 | E2E-MATE-AUTH |
| CMP-SCR005-ADMIN-REPORTS | 생성: `src/components/scr005/AdminReports.tsx` | 상태 필터(OPEN/RESOLVED/DISMISSED)만 있는 목록 + 상태 변경, 경고/계정정지 등 개별 제재 UI는 만들지 않음(REQ-FUNC-042 EXCLUDED 준수) | 단순 목록형(차트 없음) | Admin/Moderator 역할만 접근(RLS) | E2E-MATE-AUTH |
| CMP-SCR005-ADMIN-URL-SETTINGS | 생성: `src/components/scr005/ExternalUrlSettings.tsx` | 항공/숙소 URL 입력 필드, HTTPS·허용목록 검증, 저장 버튼 | 폼 표준 스타일 | HTTP/`javascript:`/`data:` URL 저장 차단 | E2E-MATE-AUTH |

---

## 3. DATA (3, 필수 ID)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 34 | DATA-DESTINATIONS | 여행지 정적 데이터(국내 10·해외 15개국 30도시) | DATA | IMPLEMENT | REQ-FUNC-001, 002, 003, 004, 005, 007, 008, 009, 010 | SCR-001 | N/A | N/A | 없음 | M |
| 35 | DATA-SAFETY | 국가 안전정보 정적 데이터 | DATA | IMPLEMENT | REQ-FUNC-046~054 | SCR-001 | N/A | N/A | 없음 | M |
| 36 | DATA-REPRESENTATIVE | 대표 소개 정적 데이터 | DATA | IMPLEMENT | REQ-FUNC-057~063 | SCR-002 | N/A | N/A | 없음 | M |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| DATA-DESTINATIONS | 생성: `src/data/destinations.ts`, `src/data/destinations.schema.ts` | **정적 TypeScript 모듈, DB 테이블 아님.** 국내 10개↑·해외 15개국 30도시↑, 필수 필드(소개 300자↑, 명소 5개↑, 1일/3일 일정, 예산, 교통, 음식 3개↑, 에티켓 3개↑, 출처·수정일) 스키마로 강제 | 해당 없음(데이터 레이어) | 이미지는 URL+alt만, 라이선스 승인 워크플로 없음 | TOOL-CONTENT-VALIDATION-SCRIPT, CI-PIPELINE |
| DATA-SAFETY | 생성: `src/data/country-safety.ts`, `src/data/country-safety.schema.ts` | **정적 TypeScript 모듈, DB 테이블 아님.** 해외 국가 전체 커버리지, 8개 카테고리, 출처·확인일·경보범위 필수 | 해당 없음 | 해당 없음 | TOOL-CONTENT-VALIDATION-SCRIPT, CI-PIPELINE |
| DATA-REPRESENTATIVE | 생성: `src/data/representative-profile.ts` | **정적 TypeScript 모듈, DB 테이블 아님.** `50+ Trips`/`30+ Countries` 단일 소스, Timeline 6개↑, 방문국가 30개, Gallery 8장↑ | 해당 없음 | 이미지 alt 필수 | CI-PIPELINE |

---

## 4. DB (4, 필수 ID)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 37 | DB-SCHEMA-BASE | Supabase 스키마 마이그레이션(6테이블) | DB | IMPLEMENT | REQ-NF-013 | 공통 | N/A | N/A | 없음 | M |
| 38 | DB-RLS-BASE | RLS 정책 | DB | IMPLEMENT | REQ-FUNC-044, REQ-NF-013, 014 | 공통 | N/A | N/A | DB-SCHEMA-BASE | M |
| 39 | DB-ACCESS | 타입 안전 Supabase 접근 레이어 | DB | IMPLEMENT | REQ-NF-015, 017 | 공통 | N/A | N/A | DB-SCHEMA-BASE | M |
| 40 | DB-SEED-BASE | 개발용 Seed 데이터 | DB | IMPLEMENT | (직접 REQ 없음 — 개발/QA 보조) | 공통 | N/A | N/A | DB-SCHEMA-BASE | S |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| DB-SCHEMA-BASE | 생성: `supabase/migrations/0001_core_schema.sql` | **정확히 6개 테이블만**: `user_profile`, `mate_post`, `mate_application`, `user_block`, `report`, `external_link_settings`. 여행지·안전·대표·미디어·감사로그 테이블 생성 금지 | 해당 없음 | 개인정보 최소 수집(생년월일 컬럼 없음, `is_adult`+`adult_verified_at`만) | TEST-RLS-BASIC, CI-PIPELINE |
| DB-RLS-BASE | 생성: `supabase/migrations/0002_rls_policies.sql` | 본인 글/요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터 열람 | 해당 없음 | 권한별 부정 접근 시 403/빈 결과 | TEST-RLS-BASIC |
| DB-ACCESS | 생성: `src/lib/supabase/client.ts`, `server.ts`, `queries/*.ts` | 6개 테이블에 대한 타입 안전 CRUD 헬퍼만 제공(다른 테이블 접근 함수 추가 금지) | 해당 없음 | 입력 검증(zod) 후 쿼리, XSS 이스케이프 | TEST-RLS-BASIC, CI-PIPELINE |
| DB-SEED-BASE | 생성: `supabase/seed.sql` 또는 `scripts/seed.ts` | 동행글 Empty/Non-Empty 두 상태를 로컬에서 재현할 수 있는 샘플 데이터(연락처 패턴 포함 테스트 케이스 포함) | 해당 없음 | 실제 개인정보 아닌 합성 데이터만 사용 | E2E-MATE-AUTH |

---

## 5. AUTH / SERVER_ACTION (9)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 41 | AUTH-EMAIL-ADULT | Supabase 이메일 인증 + 성인 확인 | AUTH | IMPLEMENT | REQ-FUNC-027, 028, 066 | SCR-005 | N/A | N/A | DB-SCHEMA-BASE, DB-RLS-BASE | M |
| 42 | SA-MATE-POST | 동행글 CRUD·자동/수동 마감 | SERVER_ACTION | IMPLEMENT | REQ-FUNC-031, 032, 037, 038 | SCR-003, SCR-004, SCR-005 | N/A | N/A | DB-ACCESS, AUTH-EMAIL-ADULT | M |
| 43 | SA-MATE-APPLICATION | 참가 요청 생성/승인/거절 | SERVER_ACTION | IMPLEMENT | REQ-FUNC-034, 035, 036 | SCR-004, SCR-005 | N/A | N/A | DB-ACCESS, SA-MATE-POST | M |
| 44 | SA-BLOCK | 차단/해제 | SERVER_ACTION | IMPLEMENT | REQ-FUNC-040 | SCR-004, SCR-005 | N/A | N/A | DB-ACCESS, AUTH-EMAIL-ADULT | M |
| 45 | SA-REPORT | 신고 접수 + 상태 변경 | SERVER_ACTION | IMPLEMENT(축소) | REQ-FUNC-039, 041, REQ-NF-019 | SCR-004, SCR-005 | N/A | N/A | DB-ACCESS, AUTH-EMAIL-ADULT | M |
| 46 | SA-EXTERNAL-URL-SETTINGS | 외부 URL 설정 저장 | SERVER_ACTION | IMPLEMENT | REQ-FUNC-077 | SCR-005 | N/A | N/A | DB-ACCESS | M |
| 47 | SA-ACCOUNT-DELETE | 탈퇴 즉시 비식별화 | SERVER_ACTION | IMPLEMENT(축소) | REQ-FUNC-045 | SCR-005 | N/A | N/A | DB-ACCESS, AUTH-EMAIL-ADULT | M |
| 48 | SA-FAVORITES-LOCALSTORAGE | 즐겨찾기(localStorage) | SERVER_ACTION | IMPLEMENT | REQ-FUNC-068 | SCR-001 | N/A | N/A | 없음 | S |
| 49 | SA-TOAST-NOTIFICATIONS | Toast 알림(인앱) | SERVER_ACTION | IMPLEMENT(축소) | REQ-FUNC-043 | 공통 | N/A | N/A | TOOL-DESIGN-TOKENS | S |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| AUTH-EMAIL-ADULT | 생성: `src/lib/auth/*.ts`, `src/app/auth/callback/route.ts`(기술 Route) | 이메일 가입/로그인/로그아웃/재설정, 성인확인 단계(생년월일 미저장) | 해당 없음 | 미인증 쓰기 요청 401/리다이렉트 | E2E-MATE-AUTH |
| SA-MATE-POST | 생성: `src/lib/actions/mate-post.ts` | 필수 필드·날짜 검증, 연락처 정규식 탐지 후 제출 차단, 조회 시 종료일 경과로 CLOSED 계산(배치 잡 없음) | 해당 없음 | 작성자만 수정/마감/삭제 | UNIT-CONTACT-DETECTION, UNIT-MATE-STATE, E2E-MATE-AUTH |
| SA-MATE-APPLICATION | 생성: `src/lib/actions/mate-application.ts` | 500자 제한, 중복 PENDING/ACCEPTED 차단, 작성자만 승인/거절 | 해당 없음 | 신청 메시지는 작성자·요청자만 열람 | UNIT-MATE-STATE, E2E-MATE-AUTH |
| SA-BLOCK | 생성: `src/lib/actions/block.ts` | 차단 시 상호 글/프로필/요청 비노출 | 해당 없음 | (blocker, blocked) UNIQUE 제약 | E2E-MATE-AUTH |
| SA-REPORT | 생성: `src/lib/actions/report.ts` | 사유코드+설명 접수, 접수번호 즉시 반환, 상태(OPEN/RESOLVED/DISMISSED) 변경만 지원(개별 제재 없음) | 해당 없음 | 신고자/피신고자 상세는 Moderator/Admin만 | E2E-MATE-AUTH |
| SA-EXTERNAL-URL-SETTINGS | 생성: `src/lib/actions/external-url-settings.ts` | HTTPS·허용목록 검증 후 저장 | 해당 없음 | Admin만 쓰기 가능(RLS) | E2E-MATE-AUTH |
| SA-ACCOUNT-DELETE | 생성: `src/lib/actions/account-delete.ts` | 즉시 비식별화 + 비필수 개인정보 삭제(30일 유예 배치 없음, 축소 범위 명시) | 해당 없음 | 처리 결과를 `report`/`user_block` 등 관련 레코드에 orphan 남기지 않음 | E2E-MATE-AUTH |
| SA-FAVORITES-LOCALSTORAGE | 생성: `src/lib/favorites.ts` | **localStorage만 사용**, 서버 저장/동기화 없음, 중복 즐겨찾기 방지 | 해당 없음 | 서버로 전송하지 않음 | E2E-PUBLIC-SMOKE |
| SA-TOAST-NOTIFICATIONS | 생성: `src/components/shared/Toast.tsx`, `src/lib/toast.ts` | **인앱 Toast/화면 상태만 사용, 실제 이메일(SMTP) 발송 없음.** 참가요청/승인/거절/신고 접수 알림 | 3~4초 자동 소멸, 화면 상단/하단 고정 | 해당 없음 | E2E-MATE-AUTH |

---

## 6. TOOLING (6)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 50 | TOOL-DESIGN-TOKENS | Tailwind + D-001 토큰 반영 | TOOLING | IMPLEMENT | REQ-FUNC-065, 079, REQ-NF-001~003, 006, 023 | 공통 | N/A | N/A | 없음 | M |
| 51 | TOOL-LAYOUT-SHELL | 전역 Header/Footer/layout.tsx | TOOLING | IMPLEMENT(축소) | REQ-FUNC-027, 043, 064, 065, 079 | 공통 | N/A | `src/app/layout.tsx`(기존 파일 수정) | TOOL-DESIGN-TOKENS, SA-TOAST-NOTIFICATIONS | M |
| 52 | TOOL-ERROR-NOTFOUND | 404/오류 경계 화면 | TOOLING | IMPLEMENT | REQ-FUNC-078 | 기술 Route | `*` | `src/app/not-found.tsx`, `src/app/error.tsx` | TOOL-DESIGN-TOKENS | M |
| 53 | TOOL-SEO-METADATA | 페이지별 메타데이터 | TOOLING | IMPLEMENT | REQ-FUNC-070, REQ-NF-030 | 공통 | N/A | N/A | 없음 | S |
| 54 | TOOL-CONTENT-VALIDATION-SCRIPT | 정적 데이터 완전성/수량 검증 스크립트 | TOOLING | IMPLEMENT | REQ-FUNC-008, 046, REQ-NF-026, 027, 028 | N/A | N/A | N/A | DATA-DESTINATIONS, DATA-SAFETY | M |
| 55 | TOOL-POLICY-PAGES | 정적 정책 페이지(약관/개인정보/안전수칙/면책) | TOOLING | IMPLEMENT | REQ-FUNC-080 | 비핵심 정적 페이지 | `/legal/*` | `src/app/legal/*/page.tsx` | 없음 | M |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| TOOL-DESIGN-TOKENS | 생성/수정: `tailwind.config.ts`, `src/app/globals.css` | `design-reference/D-001/DESIGN.md` 색상/타이포/spacing/radius/shadow 토큰만 반영, 이 표에 없는 임의 색상 추가 금지, Proprietary 폰트 파일 미포함(Inter+시스템 한글 폰트) | 44px 이상 터치 영역, 포커스 링 색상 코랄과 분리 | 해당 없음 | MANUAL-RESPONSIVE-A11Y-CHECK |
| TOOL-LAYOUT-SHELL | 수정: `src/app/layout.tsx`(현재 Next.js 기본 스캐폴드 — 교체) | Header(로고/nav 4개/로그인·계정)·Footer(4컬럼) 5개 화면 공통, 미인증 쓰기 시도 시 SCR-005로 리다이렉트, Toast 컴포넌트 마운트 | Desktop 72px/Mobile 56px Header, 스크롤 8px↑에서만 `shadow.card` | 해당 없음 | E2E-PUBLIC-SMOKE |
| TOOL-ERROR-NOTFOUND | 생성: `src/app/not-found.tsx`, `src/app/error.tsx` | 홈 복귀/재시도 등 복구 행동 최소 1개 포함 | Header/Footer 유지 | 해당 없음 | MANUAL-RESPONSIVE-A11Y-CHECK |
| TOOL-SEO-METADATA | 생성: 각 `page.tsx`의 `generateMetadata`/`metadata` export | title/description/canonical/OG 기본 메타데이터, 구조화 데이터(JSON-LD)는 범위 밖 | 해당 없음 | 해당 없음 | CI-PIPELINE |
| TOOL-CONTENT-VALIDATION-SCRIPT | 생성: `scripts/validate_content.py` 또는 `.ts` | 국내 10개↑·해외 15개국 30도시↑, 해외국가=안전정보 커버리지 100%, 필수 필드 누락 시 빌드 실패 | 해당 없음 | 해당 없음 | CI-PIPELINE |
| TOOL-POLICY-PAGES | 생성: `src/app/legal/terms/page.tsx`, `privacy/page.tsx`, `mate-safety/page.tsx`, `content-disclaimer/page.tsx` | 이용약관/개인정보처리방침/동행 안전수칙/콘텐츠 이용 안내 4종, 동행 작성 시 안전수칙 동의 시각 저장과 연동 | Footer에서 링크, 5개 핵심 Screen 수에 미포함 | 해당 없음 | E2E-MATE-AUTH |

---

## 7. UNIT_TEST (3, 필수 ID)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 56 | UNIT-TRAVEL-DATES | 날짜 검증 단위 테스트 | UNIT_TEST | IMPLEMENT | REQ-FUNC-013, 021 | SCR-003 | N/A | N/A | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM | M |
| 57 | UNIT-CONTACT-DETECTION | 연락처 탐지 단위 테스트 | UNIT_TEST | IMPLEMENT | REQ-FUNC-032 | SCR-003 | N/A | N/A | SA-MATE-POST | M |
| 58 | UNIT-MATE-STATE | 동행 상태 전이 단위 테스트 | UNIT_TEST | IMPLEMENT | REQ-FUNC-035, 036, 037 | SCR-004 | N/A | N/A | SA-MATE-POST, SA-MATE-APPLICATION | M |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| UNIT-TRAVEL-DATES | 생성: `src/lib/validation/__tests__/travel-dates.test.ts` | 경계값(오늘/어제/출발=귀국/역전) 포함, 항공·숙소 두 규칙 모두 커버 | 해당 없음 | 해당 없음 | 자체 실행(CI-PIPELINE에 포함) |
| UNIT-CONTACT-DETECTION | 생성: `src/lib/validation/__tests__/contact-detection.test.ts` | 전화번호/이메일/카카오톡·텔레그램 ID 패턴 기준 테스트셋으로 탐지율 확인(정량 목표 미실시, 케이스 기반 확인으로 축소) | 해당 없음 | 해당 없음 | 자체 실행(CI-PIPELINE에 포함) |
| UNIT-MATE-STATE | 생성: `src/lib/actions/__tests__/mate-state.test.ts` | OPEN→CLOSED(종료일 경과, 수동), PENDING→ACCEPTED/REJECTED/WITHDRAWN 상태 전이 및 중복 요청 차단 | 해당 없음 | 해당 없음 | 자체 실행(CI-PIPELINE에 포함) |

---

## 8. DB_TEST (1, 필수 ID)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 59 | TEST-RLS-BASIC | RLS 기본 정책 통합 테스트 | DB_TEST | IMPLEMENT | REQ-FUNC-044, REQ-NF-013, 014 | 공통 | N/A | N/A | DB-RLS-BASE, DB-ACCESS | M |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| TEST-RLS-BASIC | 생성: `supabase/tests/rls-basic.test.ts` | 역할별(Guest/Member/Moderator/Admin) 부정 접근 시나리오 전부 403 또는 빈 결과 | 해당 없음 | 본인 아닌 신청 메시지·신고 상세 접근 차단 확인 | 자체 실행(CI-PIPELINE에 포함) |

---

## 9. E2E_TEST (3, 필수 ID — Playwright Chromium Smoke만)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 60 | E2E-PUBLIC-SMOKE | 공개 화면 Smoke(홈·여행지·안전정보·대표소개) | E2E_TEST | IMPLEMENT | REQ-FUNC-001~010, 046~054, 057~063, 064, 068 | SCR-001, SCR-002 | `/`, `/about` | N/A | PAGE-SCR001, PAGE-SCR002 | M |
| 61 | E2E-TRAVEL-TOOLS | 항공/숙소/동행 탭 Smoke | E2E_TEST | IMPLEMENT | REQ-FUNC-011~026, 031, 054 | SCR-003 | `/travel-tools` | N/A | PAGE-SCR003 | M |
| 62 | E2E-MATE-AUTH | 인증·동행·신고·차단·관리자 Smoke | E2E_TEST | IMPLEMENT | REQ-FUNC-027~041, 043~045, 066, 077, 080 | SCR-004, SCR-005 | `/mates`, `/account` | N/A | PAGE-SCR004, PAGE-SCR005 | M |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| E2E-PUBLIC-SMOKE | 생성: `e2e/public-smoke.spec.ts` | 흐름: 홈→필터→여행지 상세 Drawer→안전정보 Drawer→대표소개(`docs/PROJECT_SCOPE.md` §7 핵심 흐름 10개 중 흐름 1·10) | **Chromium 브라우저만**, Desktop 1440px 뷰포트 | 해당 없음 | `npx playwright test e2e/public-smoke.spec.ts --project=chromium` |
| E2E-TRAVEL-TOOLS | 생성: `e2e/travel-tools-smoke.spec.ts` | 흐름: 항공 입력→검증오류→유효입력→요약→외부 새 탭, 숙소 동일, 동행 탭 로그인 유도 확인 | **Chromium만**, Desktop+Mobile 390px 각 1회 | 외부 이동 시 입력값이 URL query에 없는지 확인 | `npx playwright test e2e/travel-tools-smoke.spec.ts --project=chromium` |
| E2E-MATE-AUTH | 생성: `e2e/mate-auth-smoke.spec.ts` | 흐름: 가입→로그인→성인확인→동행작성→참가요청→승인/거절→신고→차단→관리자 신고처리/URL설정 | **Chromium만** | 로그아웃 상태에서 쓰기 API 401 확인 | `npx playwright test e2e/mate-auth-smoke.spec.ts --project=chromium` |

---

## 10. CI_RELEASE (2)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 63 | CI-PIPELINE | GitHub Actions CI(lint/typecheck/unit/smoke) | CI_RELEASE | IMPLEMENT | REQ-NF-031 | N/A | N/A | N/A | UNIT-TRAVEL-DATES, UNIT-CONTACT-DETECTION, UNIT-MATE-STATE, TEST-RLS-BASIC, TOOL-CONTENT-VALIDATION-SCRIPT | M |
| 64 | RELEASE-VERCEL-SUPABASE-CHECK | Vercel/Supabase 배포 전 확인 | CI_RELEASE | IMPLEMENT | REQ-NF-012, 016, 034 | N/A | N/A | N/A | CI-PIPELINE | M |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| CI-PIPELINE | 생성: `.github/workflows/ci.yml` | PR마다 TypeScript strict, ESLint, Unit Test, Chromium Smoke 실행, main 병합 전 필수 | 해당 없음 | 해당 없음 | GitHub Actions 실행 결과(자체 검증) |
| RELEASE-VERCEL-SUPABASE-CHECK | 생성: `docs/RELEASE_CHECKLIST.md` | Vercel 프로젝트 env 변수(외부 URL, Supabase 키) 확인, HTTPS 기본 적용 확인, 월 비용이 무료/저비용 티어 내인지 확인 — **자동화 아님, 배포 담당자가 수행하는 Manual/Release Check** | 해당 없음 | 비밀키가 클라이언트 번들에 없는지 `next build` 산출물 검사 | Manual(배포 담당자 실행) |

---

## 11. MANUAL_CHECK (1)

### Table A

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| 65 | MANUAL-RESPONSIVE-A11Y-CHECK | 반응형(1440/390) + 접근성 수동 점검 | MANUAL_CHECK | IMPLEMENT | REQ-FUNC-007, 061, 065, 078, 079, REQ-NF-001~003, 006, 023, 025 | SCR-001, SCR-002, SCR-003, SCR-004, SCR-005 | 전체 | N/A | PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005 | S |

### Table B

| Task ID | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify |
|---|---|---|---|---|---|
| MANUAL-RESPONSIVE-A11Y-CHECK | 생성: `docs/MANUAL_CHECK_LOG.md` | 5개 화면에서 키보드만으로 검색/폼 입력/모달 닫기/신고 제출 가능한지, 스크린리더로 주요 흐름 확인 가능한지 점검·기록 | Desktop 1440px·Mobile 390px 실제 브라우저에서 레이아웃 확인(가로 스크롤·겹침 없음) | 해당 없음 | Manual(개발자/QA 실행 후 이 파일에 결과 기록) |

---

## 12. NON_IMPLEMENTATION — EXCLUDED (24)

`PROJECT_SCOPE.md` 판정을 그대로 따른다. 아래 24건은 **상세 구현 Task를 만들지 않는다.**
어떤 Task의 Requirement Ref에도 등장하지 않으며, 이 표에만 근거와 후속 방향을 남긴다.

| Requirement | 근거(요약) | 후속 방향 |
|---|---|---|
| REQ-FUNC-042 | Moderator 개별 제재(경고/숨김/계정정지)는 "간단한 관리자 탭"(신고 상태+외부URL만) 범위 밖 | 운영 규모가 커지면 별도 Epic으로 재검토 |
| REQ-FUNC-055 | 안전정보 Editor 작성·검수·게시 워크플로는 전체 콘텐츠 CMS 제외 방침 | 콘텐츠는 코드 배포(PR)로 갱신, CMS 도입 시 재검토 |
| REQ-FUNC-056 | 안전정보 변경 이력 DB 관리는 범용 감사 로그 제외 방침 | git 커밋 이력으로 대체, 감사로그 시스템 도입 시 재검토 |
| REQ-FUNC-067 | 여행지+안전정보 통합검색은 MVP 범위 밖 | REQ-FUNC-003 키워드 검색으로 대체, 사용량 확인 후 재검토 |
| REQ-FUNC-069 | URL 공유(Web Share API) 미구현 | 브라우저 기본 주소창 복사로 대체 가능 |
| REQ-FUNC-071 | 분석 이벤트 계측 파이프라인 미구축 | Vercel Analytics 등 도입 시 재검토 |
| REQ-FUNC-072 | 여행지 CRUD·미리보기·게시 상태 워크플로 CMS 제외 | `src/data` 코드 수정으로 관리 |
| REQ-FUNC-073 | 미디어 업로드·라이선스 승인 워크플로 제외 | 이미지 정책 단순화(URL+alt)로 대체 |
| REQ-FUNC-074 | 런타임 게시 완전성 게이트(PUBLISHED 전환) CMS 부재로 불가 | TOOL-CONTENT-VALIDATION-SCRIPT(빌드/CI 시점 검증)로 대체 |
| REQ-FUNC-075 | stale 현황·담당자 대시보드는 간단 관리자 탭 범위 밖 | 콘텐츠 운영 규모 확대 시 재검토 |
| REQ-FUNC-076 | 관리자 변경/신고처리/권한변경 범용 감사 로그 제외 | `report` 테이블의 상태·수정시각 필드만 유지 |
| REQ-NF-007 | Lighthouse CI 성능 게이트 미구성 | CI-PIPELINE은 Chromium Smoke만 게이트로 사용 |
| REQ-NF-008 | 가동률 모니터링 미구축 | Vercel/Supabase 관리형 인프라 가용성에 의존 |
| REQ-NF-009 | 5xx 비율 모니터링 미구축 | 상동 |
| REQ-NF-010 | 자동 백업/RPO·RTO 정책 제외 | Supabase 기본 백업에 의존 |
| REQ-NF-011 | 외부 링크 주간 자동 점검+Admin 알림 미구현 | RELEASE-VERCEL-SUPABASE-CHECK에서 배포 시 수동 점검으로 부분 대체 |
| REQ-NF-018 | 개인정보 자기서비스 내보내기(export) 제외 | SA-ACCOUNT-DELETE(탈퇴·삭제)로 부분 대응, 문의 시 수동 대응 |
| REQ-NF-020 | 신고 1차 검토 24h SLA 자동 트래킹 미구축 | SA-REPORT의 접수 시각 표시로만 지원, 운영 프로세스에 의존 |
| REQ-NF-021 | 글/요청/신고 속도 제한(rate limiting) 미구현 | 운영 고도화 항목으로 후속 처리 |
| REQ-NF-022 | Moderator 조치 추적용 감사 로그 제외 | REQ-FUNC-076과 동일 |
| REQ-NF-024 | axe 등 자동 접근성 검사 파이프라인 미구성 | MANUAL-RESPONSIVE-A11Y-CHECK(수동)로 대체 |
| REQ-NF-029 | 라이선스 메타데이터 100% 관리 체계 제외 | 이미지 정책 단순화 방침과 동일 |
| REQ-NF-032 | 커스텀 구조화 로깅 체계 제외 | Vercel 기본 함수 로그로 대체 |
| REQ-NF-033 | 5xx·외부링크 실패 자동 알림 제외 | REQ-NF-011과 동일 |

24건 합계 확인: FUNC 11건(042, 055, 056, 067, 069, 071~076) + NF 13건(007~011, 018, 020~022, 024, 029, 032, 033) = **24 — 일치.**

---

## 13. Requirement → Task 매핑 검증 (IMPLEMENT 90건 전수)

아래 표는 §0-2의 90건이 실제로 어떤 Task에 연결되어 있는지 REQ 기준으로 역추적한 것이다.
`docs/UIUX_TRACEABILITY.md`의 Screen 배치와 그대로 정합한다.

### F1 (001~010)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-FUNC-001 | IMPLEMENT | CMP-SCR001-DESTINATION-GRIDS, DATA-DESTINATIONS | E2E-PUBLIC-SMOKE |
| REQ-FUNC-002 | IMPLEMENT | CMP-SCR001-DESTINATION-GRIDS, CMP-SCR001-THEME-CHIPS | E2E-PUBLIC-SMOKE |
| REQ-FUNC-003 | IMPLEMENT | CMP-SCR001-HERO | E2E-PUBLIC-SMOKE |
| REQ-FUNC-004 | IMPLEMENT | CMP-SCR001-DESTINATION-DRAWER, DATA-DESTINATIONS | E2E-PUBLIC-SMOKE |
| REQ-FUNC-005 | IMPLEMENT | CMP-SCR001-DESTINATION-GRIDS | E2E-PUBLIC-SMOKE |
| REQ-FUNC-006 | IMPLEMENT | CMP-SCR001-DESTINATION-DRAWER, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-007 | IMPLEMENT(축소) | DATA-DESTINATIONS, CMP-SCR001-DESTINATION-GRIDS | MANUAL-RESPONSIVE-A11Y-CHECK |
| REQ-FUNC-008 | IMPLEMENT | TOOL-CONTENT-VALIDATION-SCRIPT, DATA-DESTINATIONS | CI-PIPELINE |
| REQ-FUNC-009 | IMPLEMENT | CMP-SCR001-DESTINATION-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-010 | IMPLEMENT | CMP-SCR001-DESTINATION-GRIDS | E2E-PUBLIC-SMOKE |

### F2 (011~018)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-FUNC-011 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-012 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-013 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS |
| REQ-FUNC-014 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-015 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-DISCLOSURE-TIPS | E2E-TRAVEL-TOOLS |
| REQ-FUNC-016 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-017 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-DISCLOSURE-TIPS | E2E-TRAVEL-TOOLS |
| REQ-FUNC-018 | IMPLEMENT(축소) | CMP-SCR003-FLIGHT-FORM | E2E-TRAVEL-TOOLS |

### F3 (019~026)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-FUNC-019 | IMPLEMENT | CMP-SCR003-HOTEL-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-020 | IMPLEMENT | CMP-SCR003-HOTEL-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-021 | IMPLEMENT | CMP-SCR003-HOTEL-FORM | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS |
| REQ-FUNC-022 | IMPLEMENT | CMP-SCR003-HOTEL-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-023 | IMPLEMENT | CMP-SCR003-HOTEL-FORM, CMP-SCR003-DISCLOSURE-TIPS | E2E-TRAVEL-TOOLS |
| REQ-FUNC-024 | IMPLEMENT | CMP-SCR003-HOTEL-FORM | E2E-TRAVEL-TOOLS |
| REQ-FUNC-025 | IMPLEMENT | CMP-SCR003-HOTEL-FORM, CMP-SCR003-DISCLOSURE-TIPS | E2E-TRAVEL-TOOLS |
| REQ-FUNC-026 | IMPLEMENT(축소) | CMP-SCR003-HOTEL-FORM | E2E-TRAVEL-TOOLS |

### F4 (027~045)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-FUNC-027 | IMPLEMENT | AUTH-EMAIL-ADULT, TOOL-LAYOUT-SHELL | E2E-MATE-AUTH |
| REQ-FUNC-028 | IMPLEMENT | AUTH-EMAIL-ADULT, CMP-SCR005-GUEST-AUTH | E2E-MATE-AUTH |
| REQ-FUNC-029 | IMPLEMENT | CMP-SCR005-PROFILE | E2E-MATE-AUTH |
| REQ-FUNC-030 | IMPLEMENT | CMP-SCR004-FILTER-BAR | E2E-MATE-AUTH |
| REQ-FUNC-031 | IMPLEMENT | CMP-SCR003-MATE-COMPOSER, SA-MATE-POST | E2E-MATE-AUTH |
| REQ-FUNC-032 | IMPLEMENT(축소) | CMP-SCR003-MATE-COMPOSER, SA-MATE-POST | UNIT-CONTACT-DETECTION, E2E-MATE-AUTH |
| REQ-FUNC-033 | IMPLEMENT | CMP-SCR004-MATE-LIST, CMP-SCR004-MATE-DETAIL | E2E-MATE-AUTH |
| REQ-FUNC-034 | IMPLEMENT | CMP-SCR004-APPLY-FLOW, SA-MATE-APPLICATION | E2E-MATE-AUTH |
| REQ-FUNC-035 | IMPLEMENT | SA-MATE-APPLICATION | UNIT-MATE-STATE, E2E-MATE-AUTH |
| REQ-FUNC-036 | IMPLEMENT | CMP-SCR005-MY-ACTIVITY, SA-MATE-APPLICATION | UNIT-MATE-STATE, E2E-MATE-AUTH |
| REQ-FUNC-037 | IMPLEMENT | SA-MATE-POST, CMP-SCR004-MATE-LIST | UNIT-MATE-STATE |
| REQ-FUNC-038 | IMPLEMENT | CMP-SCR005-MY-ACTIVITY, SA-MATE-POST | E2E-MATE-AUTH |
| REQ-FUNC-039 | IMPLEMENT | CMP-SCR004-REPORT-BLOCK, SA-REPORT | E2E-MATE-AUTH |
| REQ-FUNC-040 | IMPLEMENT | CMP-SCR004-REPORT-BLOCK, CMP-SCR005-MY-ACTIVITY, SA-BLOCK | E2E-MATE-AUTH |
| REQ-FUNC-041 | IMPLEMENT(축소) | CMP-SCR005-ADMIN-REPORTS, SA-REPORT | E2E-MATE-AUTH |
| REQ-FUNC-043 | IMPLEMENT(축소) | SA-TOAST-NOTIFICATIONS, TOOL-LAYOUT-SHELL | E2E-MATE-AUTH |
| REQ-FUNC-044 | IMPLEMENT | DB-RLS-BASE | TEST-RLS-BASIC |
| REQ-FUNC-045 | IMPLEMENT(축소) | SA-ACCOUNT-DELETE, CMP-SCR005-PROFILE | E2E-MATE-AUTH |

### F5 (046~054, 055/056은 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-FUNC-046 | IMPLEMENT | DATA-SAFETY, TOOL-CONTENT-VALIDATION-SCRIPT | CI-PIPELINE |
| REQ-FUNC-047 | IMPLEMENT | DATA-SAFETY, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-048 | IMPLEMENT | DATA-SAFETY, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-049 | IMPLEMENT | DATA-SAFETY, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-050 | IMPLEMENT | DATA-SAFETY, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-051 | IMPLEMENT | DATA-SAFETY, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-052 | IMPLEMENT | DATA-SAFETY, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-053 | IMPLEMENT | DATA-SAFETY, CMP-SCR001-SAFETY-GRID-DRAWER | E2E-PUBLIC-SMOKE |
| REQ-FUNC-054 | IMPLEMENT | CMP-SCR001-SAFETY-GRID-DRAWER, CMP-SCR003-DISCLOSURE-TIPS | E2E-PUBLIC-SMOKE, E2E-TRAVEL-TOOLS |

### F6 (057~063)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-FUNC-057 | IMPLEMENT | DATA-REPRESENTATIVE, CMP-SCR002-HERO-STATS, CMP-SCR001-ABOUT-SUMMARY | E2E-PUBLIC-SMOKE |
| REQ-FUNC-058 | IMPLEMENT | DATA-REPRESENTATIVE, CMP-SCR002-INTRO-PHILOSOPHY | E2E-PUBLIC-SMOKE |
| REQ-FUNC-059 | IMPLEMENT | DATA-REPRESENTATIVE, CMP-SCR002-COUNTRIES-CHIPS | E2E-PUBLIC-SMOKE |
| REQ-FUNC-060 | IMPLEMENT | DATA-REPRESENTATIVE, CMP-SCR002-TIMELINE | E2E-PUBLIC-SMOKE |
| REQ-FUNC-061 | IMPLEMENT(축소) | DATA-REPRESENTATIVE, CMP-SCR002-GALLERY | MANUAL-RESPONSIVE-A11Y-CHECK |
| REQ-FUNC-062 | IMPLEMENT | CMP-SCR002-RECOMMEND-CTA | E2E-PUBLIC-SMOKE |
| REQ-FUNC-063 | IMPLEMENT | CMP-SCR002-RECOMMEND-CTA, DATA-DESTINATIONS | E2E-PUBLIC-SMOKE |

### F7 (064~080, EXCLUDED 8건은 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-FUNC-064 | IMPLEMENT | TOOL-LAYOUT-SHELL, CMP-SCR003-INTRO-TABS(nav 활성표시) | E2E-PUBLIC-SMOKE |
| REQ-FUNC-065 | IMPLEMENT | TOOL-DESIGN-TOKENS, TOOL-LAYOUT-SHELL | MANUAL-RESPONSIVE-A11Y-CHECK |
| REQ-FUNC-066 | IMPLEMENT | AUTH-EMAIL-ADULT, CMP-SCR005-GUEST-AUTH | E2E-MATE-AUTH |
| REQ-FUNC-068 | IMPLEMENT | SA-FAVORITES-LOCALSTORAGE, CMP-SCR001-DESTINATION-GRIDS | E2E-PUBLIC-SMOKE |
| REQ-FUNC-070 | IMPLEMENT | TOOL-SEO-METADATA | CI-PIPELINE |
| REQ-FUNC-077 | IMPLEMENT | CMP-SCR005-ADMIN-URL-SETTINGS, SA-EXTERNAL-URL-SETTINGS | E2E-MATE-AUTH |
| REQ-FUNC-078 | IMPLEMENT | TOOL-ERROR-NOTFOUND | MANUAL-RESPONSIVE-A11Y-CHECK |
| REQ-FUNC-079 | IMPLEMENT | TOOL-DESIGN-TOKENS, TOOL-LAYOUT-SHELL | MANUAL-RESPONSIVE-A11Y-CHECK |
| REQ-FUNC-080 | IMPLEMENT | CMP-SCR003-MATE-COMPOSER, TOOL-POLICY-PAGES | E2E-MATE-AUTH |

### NF Performance (001~006, 007은 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-NF-001 | IMPLEMENT | TOOL-DESIGN-TOKENS | RELEASE-VERCEL-SUPABASE-CHECK |
| REQ-NF-002 | IMPLEMENT | TOOL-DESIGN-TOKENS | RELEASE-VERCEL-SUPABASE-CHECK |
| REQ-NF-003 | IMPLEMENT | TOOL-DESIGN-TOKENS | RELEASE-VERCEL-SUPABASE-CHECK |
| REQ-NF-004 | IMPLEMENT(축소) | CMP-SCR001-DESTINATION-GRIDS | RELEASE-VERCEL-SUPABASE-CHECK |
| REQ-NF-005 | IMPLEMENT(축소) | CMP-SCR004-FILTER-BAR | RELEASE-VERCEL-SUPABASE-CHECK |
| REQ-NF-006 | IMPLEMENT | TOOL-DESIGN-TOKENS, DATA-DESTINATIONS | MANUAL-RESPONSIVE-A11Y-CHECK |

### NF Security/Privacy (012~017, 018은 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-NF-012 | IMPLEMENT | RELEASE-VERCEL-SUPABASE-CHECK | RELEASE-VERCEL-SUPABASE-CHECK |
| REQ-NF-013 | IMPLEMENT | DB-RLS-BASE, DB-SCHEMA-BASE | TEST-RLS-BASIC |
| REQ-NF-014 | IMPLEMENT | AUTH-EMAIL-ADULT, DB-ACCESS | TEST-RLS-BASIC |
| REQ-NF-015 | IMPLEMENT | DB-ACCESS, CMP-SCR003-MATE-COMPOSER | CI-PIPELINE |
| REQ-NF-016 | IMPLEMENT | RELEASE-VERCEL-SUPABASE-CHECK | RELEASE-VERCEL-SUPABASE-CHECK |
| REQ-NF-017 | IMPLEMENT | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM | E2E-TRAVEL-TOOLS |

### NF Safety/Moderation (019, 020~022는 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-NF-019 | IMPLEMENT(축소) | SA-REPORT | E2E-MATE-AUTH |

### NF Accessibility (023, 025, 024는 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-NF-023 | IMPLEMENT | TOOL-DESIGN-TOKENS | MANUAL-RESPONSIVE-A11Y-CHECK |
| REQ-NF-025 | IMPLEMENT | MANUAL-RESPONSIVE-A11Y-CHECK | MANUAL-RESPONSIVE-A11Y-CHECK |

### NF Content/SEO (026~028, 030, 029는 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-NF-026 | IMPLEMENT | TOOL-CONTENT-VALIDATION-SCRIPT, DATA-DESTINATIONS | CI-PIPELINE |
| REQ-NF-027 | IMPLEMENT | TOOL-CONTENT-VALIDATION-SCRIPT, DATA-SAFETY | CI-PIPELINE |
| REQ-NF-028 | IMPLEMENT(축소) | CMP-SCR001-SAFETY-GRID-DRAWER, DATA-SAFETY | E2E-PUBLIC-SMOKE |
| REQ-NF-030 | IMPLEMENT | TOOL-SEO-METADATA | CI-PIPELINE |

### NF Maintainability (031, 034, 032/033은 §12)

| Requirement | Implementation Status | Task ID(s) | Verify |
|---|---|---|---|
| REQ-NF-031 | IMPLEMENT | CI-PIPELINE | CI-PIPELINE |
| REQ-NF-034 | IMPLEMENT | RELEASE-VERCEL-SUPABASE-CHECK | RELEASE-VERCEL-SUPABASE-CHECK |

**행 수 확인:** F1 10 + F2 8 + F3 8 + F4 18 + F5 9 + F6 7 + F7 9 + NF Perf 6 + NF Sec 6 +
NF Safety 1 + NF A11y 2 + NF Content 4 + NF Maint 2 = **90행 — §0-2의 IMPLEMENT 90건과 일치,
누락 없음.**

---

## 14. 완료 조건 자체 점검

| 조건 | 결과 |
|---|---|
| REQ-FUNC-001~080, REQ-NF-001~034 전부 추적표에 포함(규칙 1) | ✅ §0-2, §12, §13에서 90+24=114 전수 확인 |
| IMPLEMENT는 구현 Task+Verify Task 연결(규칙 2) | ✅ §13 전 행에 Task ID(s)+Verify 기재 |
| 정적 데이터/localStorage/Toast 구현 방법을 AC에 명시(규칙 3) | ✅ DATA-*, SA-FAVORITES-LOCALSTORAGE, SA-TOAST-NOTIFICATIONS Table B |
| 브라우저 확인 필요 항목은 Manual/Release Check에 연결(규칙 4) | ✅ MANUAL-RESPONSIVE-A11Y-CHECK, RELEASE-VERCEL-SUPABASE-CHECK |
| EXCLUDED는 NON_IMPLEMENTATION 표에 근거·후속 방향 기록(규칙 5) | ✅ §12, 24건 전수 |
| 5개 Screen마다 Page Owner 정확히 1개(규칙 6) | ✅ PAGE-SCR001~005 |
| Page Owner Expected Files에 page_entry 포함(규칙 7) | ✅ §1 Table B |
| Page Owner는 자신이 조립할 Component·Data·API Task에 의존(규칙 8) | ✅ §1 Table A Depends On |
| SCR-003 항공·숙소·동행 작성 Component 분리(규칙 9) | ✅ CMP-SCR003-FLIGHT-FORM/HOTEL-FORM/MATE-COMPOSER |
| SCR-004 목록·필터·상세·참가·신고·차단 분리(규칙 10) | ✅ CMP-SCR004-FILTER-BAR/MATE-LIST/MATE-DETAIL/APPLY-FLOW/REPORT-BLOCK |
| SCR-005 Auth·Profile·My Activity·Admin 분리(규칙 11) | ✅ CMP-SCR005-GUEST-AUTH/PROFILE/MY-ACTIVITY/ADMIN-REPORTS/ADMIN-URL-SETTINGS |
| DB Schema/RLS/Access를 별도 Task로(규칙 12) | ✅ DB-SCHEMA-BASE/DB-RLS-BASE/DB-ACCESS |
| 날짜 검증·연락처 탐지·상태 전이 Unit Test(규칙 13) | ✅ UNIT-TRAVEL-DATES/UNIT-CONTACT-DETECTION/UNIT-MATE-STATE |
| Playwright 핵심 흐름을 소수 Task로(규칙 14) | ✅ `docs/PROJECT_SCOPE.md` §7의 10개 흐름을 E2E-PUBLIC-SMOKE(흐름 1·10)/E2E-TRAVEL-TOOLS(흐름 2·3)/E2E-MATE-AUTH(흐름 4~9) 3개 Task로 전수 커버, Chromium만 |
| CI와 Vercel/Supabase 확인 Task(규칙 15) | ✅ CI-PIPELINE, RELEASE-VERCEL-SUPABASE-CHECK |
| 하나의 Task가 여러 Page Entry를 동시에 소유하지 않음(규칙 16) | ✅ Page Owner 5개만 각 1개 page_entry 소유, 나머지는 소유 없음 |
| Page Owner AC에 Section 순서·데이터 출처·최소 수·반응형 밀도(규칙 17) | ✅ §1 Table B Functional/Visual AC |
| Page Owner AC에 Placeholder 금지+완성형 Empty State(규칙 18) | ✅ §1 Table B Functional AC |

**빠진 Requirement ID: 없음.** 이 문서는 코드 구현 완료를 보고하지 않는다 — 모든 Task는
착수 전 상태(`PENDING`)이며, 실제 구현은 후속 단계에서 각 Task ID 기준으로 진행한다.
