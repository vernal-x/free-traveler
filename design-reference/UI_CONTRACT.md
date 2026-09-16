# Free Traveler — UI Contract (Next.js App Router)

**Document ID:** UICONTRACT-TRAVEL-001
**기반 문서:** `app/docs/03_UI_COVERAGE_ANALYSIS.md`, `app/docs/04_UIUX_PLAN.md`, `app/docs/STITCH_VALIDATION_REPORT.md`, `design-reference/D-001/DESIGN.md`
**대상:** 프론트엔드 구현 담당자
**상태:** Implementation Contract (구현 착수 기준)

이 문서는 `design-reference/D-001/DESIGN.md`(디자인 정본, LOCKED)와 승인된 Stitch 화면
(`STITCH_VALIDATION_REPORT.md` 2026-09-15, 전 항목 PASS)을 **Next.js App Router 라우트/페이지
단위 구현 계약**으로 변환한다. 기계 판독용 대응 파일은 `design-reference/SCREEN_ROUTE_CONTRACT.json`이며,
두 파일은 항상 동기화되어야 한다(Screen ID, Route, Page Entry가 서로 일치).

핵심 디자인 Screen은 정확히 5개이며, 이 중 **핵심(core) 4개** — SCR-001, SCR-003, SCR-004,
SCR-005 — 와 **보조(auxiliary) 1개** — SCR-002 — 로 구분한다(`PROJECT_SCOPE.md`의 "핵심 화면
4개와 보조 화면 1개" 정의를 그대로 계승).

---

## SCR-001 — 메인

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-001 |
| **구분** | 핵심(core) |
| **Route** | `/` |
| **Page Entry** | `src/app/page.tsx` |
| **Stitch 승인 화면** | `projects/2834073564133627186/screens/72967519ed3542f89d1aacf726bb2a8c` (Desktop, PASS) / `.../screens/e0421a1eafb54285a8e416b54664de5d` (Mobile, PASS) |

### 영역 순서 (7개 Section, `Header → 1..7 → Footer`)

1. 여행지 검색 Hero(검색창 + `/travel-tools` CTA)
2. 국내 인기 여행지 Card Grid(6)
3. 해외 인기 여행지 Card Grid(6)
4. 여행 동기·테마 Chip(6)
5. 국가별 주의사항 Card Grid(6) + 안전정보 Drawer 연결
6. 최근 동행글 Card(3) 또는 완성형 Empty State
7. free_traveler 소개 요약(좌우 분할) + `/about` CTA

### 주요 Component

`component.search-bar-pill`, `component.destination-card`(국내·해외·안전정보 변형),
`component.filter-chip`(테마 Chip), `component.drawer-panel`(여행지 상세 / 국가 안전정보 —
동일 화면 내 Drawer·Mobile은 전체화면 Modal), `component.mate-post-card`(홈 티저, 최대 3장),
`component.empty-state`, `component.alert-badge-*`(안전정보 경보 단계), `component.button-primary`.

### 상태

| 상태 | 적용 범위 |
|---|---|
| Loading | Section 2·3·5·6 카드 목록(스켈레톤) |
| Success | 전체 정상 렌더 |
| Empty | Section 4 필터 적용 후 결과 없음 / Section 6 동행글 없음(완성형 Empty State) |
| Error | 여행지·안전정보 데이터 로드 실패("정보를 불러오지 못했어요, 다시 시도") |

Unauthorized 상태 없음(전 구간 Public).

### 사용자 행동

검색어 입력·자동완성 선택, 테마 Chip으로 필터링, 여행지 카드 클릭 → 같은 화면에서 상세 Drawer
오픈, Drawer 내부에서 "안전정보 보기"로 안전정보 Drawer 전환, 즐겨찾기 토글(localStorage),
동행글 카드 클릭(→ SCR-004 상세로 이동), 각 CTA 클릭.

### 다른 화면으로의 이동

- Hero CTA "여행 준비 시작하기" → SCR-003
- Section 6 "모두 보기" / 동행 카드 클릭 → SCR-004
- Section 7 "대표 소개 보러가기" → SCR-002
- Header "로그인/회원가입" 또는 프로필 아이콘 → SCR-005
- Header nav(홈/여행 준비/동행 찾기/대표 소개) → 자기 자신 포함 전 화면

### Desktop·Mobile 규칙

- Desktop 1440px: 콘텐츠 최대 폭 1200~1280px(기준 1240px), Section 상하 여백 64~96px(기준 80px),
  Card Grid 4열(안전정보는 3열), 카드 간격 20px, 여행지 상세/안전정보는 우측 480px Drawer.
- Mobile 390px: 좌우 패딩 20px, Section 여백 40~64px(기준 48px), Card 1열·16px 간격, 테마 Chip은
  가로 스크롤 1줄, Drawer는 전체화면 Modal(상단 닫기 버튼).
- Hero는 뷰포트의 55~65%만 채워 Desktop 1440px 첫 화면에서 Section 2 상단이 보이게 한다.
- `starter_template_forbidden = true` — Next.js 기본 스캐폴드(`create-next-app` 기본 페이지) 문구·로고를
  남긴 채 배포하지 않는다.

### 금지 기능

Airbnb 상표 요소, 실시간 가격비교/최저가 UI, 별점·리뷰 배지(여행지 카드·안전정보 카드 모두),
구매·예약·결제 UI, 실시간 채팅, Lorem ipsum/"준비 중"/"정보 확인 필요"/빈 카드, Color Token
표(`D-001/DESIGN.md`)에 없는 임의 색상.

---

## SCR-002 — 대표 소개

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-002 |
| **구분** | 보조(auxiliary) |
| **Route** | `/about` |
| **Page Entry** | `src/app/about/page.tsx` |
| **Stitch 승인 화면** | `projects/2834073564133627186/screens/25abc0425c354dfbb865d6d73fe219ce` (정본, Desktop, PASS — 방문 국가 30개국·별점 제거 반영됨). 중복 화면 `screens/745aecb65dd84ee79c76d9c8763fb010`은 BLOCKED이며 구현 참조 금지(`DESIGN_MANIFEST.md` 참고). |

### 영역 순서 (7개 Section)

1. 대표 Hero(대표 사진 + 한 줄 소개)
2. 여행 지표(`50+ Trips` / `30+ Countries` / 대륙 수)
3. 자기소개·여행 철학(좌우 분할, 2~4문단)
4. 여행 Timeline(6개 이상 시점)
5. 방문 국가 Chip(권역별 그룹, 총 30개국)
6. 여행 사진 Gallery(서로 다른 장소 8장 이상)
7. 기억에 남는 여행지 4개 Card + CTA Banner

### 주요 Component

`component.destination-card`(추천 4곳, **별점/평점 배지 없음**), `component.filter-chip`(방문
국가, 클릭 비활성 — 순수 목록용), Timeline 전용 리스트(좌측 코랄 타임라인 도트), Gallery Grid
(4열), `component.button-primary`/`button-secondary`(CTA Banner).

### 상태

| 상태 | 적용 범위 |
|---|---|
| Loading | 사진·타임라인 스켈레톤 |
| Success | 정상 렌더(정적 콘텐츠) |

Empty·Error·Unauthorized 상태 정의하지 않음(정적 콘텐츠, DB 의존 목록 없음). 이미지 로드
실패 시에만 대체 텍스트(alt) 표시.

### 사용자 행동

Gallery 이미지 확대(선택), 방문 국가 Chip 탐색(비인터랙티브 정보 열람), 추천 여행지 카드 클릭,
CTA 버튼 클릭.

### 다른 화면으로의 이동

- Section 7 카드 클릭 → SCR-001(해당 여행지 상세 Drawer)
- Section 7 CTA "여행 조건을 정리하고 싶다면" → SCR-003
- Section 7 CTA "함께할 동행을 찾고 싶다면" → SCR-004
- Header nav → 전 화면 공통

### Desktop·Mobile 규칙

- Desktop 1440px: 콘텐츠 최대 폭 1200~1280px, Section 여백 64~96px, Gallery 4열.
- Mobile 변형 없음(승인 화면 인벤토리 기준 Desktop만 존재) — 반응형 CSS로 1열 스택 대응은
  필요하나 별도 Stitch 승인 Mobile 스크린은 없음.
- Hero는 뷰포트 전체를 채우지 않고 Section 2 상단이 첫 화면에 보이게 한다.

### 금지 기능

Airbnb 상표 요소, **별점·리뷰 배지**(2026-09-15 검증에서 실제 발견되어 제거된 항목, 재추가
금지), 구매·예약·결제 UI, 실시간 채팅, Lorem ipsum/"준비 중"류 문구, 토큰 없는 임의 색상.

---

## SCR-003 — 통합 여행 준비

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-003 |
| **구분** | 핵심(core) |
| **Route** | `/travel-tools` |
| **Page Entry** | `src/app/travel-tools/page.tsx` |
| **Stitch 승인 화면** | `.../screens/193011d274cb4536bfedfe9df330d3ac` (Desktop, PASS) / `.../screens/d8cea87bdb0247f9a0c62ea332837632` (Mobile, PASS) |

### 영역 순서 (6개 Section, 탭별 독립 상태)

1. Intro(이용 순서 3단계 요약)
2. Tab(항공편 / 숙소 / 동행 구하기 — 각 탭은 입력·검증·완료 상태를 독립적으로 유지)
3. 조건 입력 Form(항공: 국가·지역·출발일·귀국일 / 숙소: 국가·지역·체크인·체크아웃)
4. 입력 요약 + 외부 이동 Action Card("항공편/숙소 보러 가기" 버튼, 오류 시 재시도 버튼)
5. 입력값 비전달 고지 + 여행 팁 Card(3)
6. 동행 구하기 탭 콘텐츠(비로그인: 로그인 안내 / 로그인·성인인증 완료: 작성 Form + 안전수칙 동의)

### 주요 Component

`component.tab-active`/`tab-inactive`, `component.text-input`(select·date picker 포함),
Action Card(`radius.md`, `shadow.card` on hover), `component.filter-chip`(여행 스타일 다중
선택, 동행 작성 폼), 3-Tip Card Row, `component.button-primary`("~ 보러 가기"), 동행 작성
Form(안전수칙 동의 체크박스 필수).

### 상태

| 상태 | 적용 범위 |
|---|---|
| Loading | 국가/지역 select 옵션 로드 |
| Success | Section 4 요약 완료, 이동 버튼 활성화 |
| Error | Section 4 외부 URL 연결 실패("현재 외부 사이트에 연결할 수 없어요" + 재시도) |
| Unauthorized | Section 6 동행 탭에서 비로그인·미성년 접근 시 폼 대신 로그인 유도 카드 |

Empty 상태 없음(목록형 화면이 아닌 폼 화면).

### 사용자 행동

탭 전환(항공/숙소/동행, 상태 독립 유지), 국가 선택 → 지역 옵션 재계산, 날짜 입력·검증, 요약
확인 후 외부 사이트 새 탭 이동(`noopener,noreferrer`), 동행 탭에서 로그인 유도 클릭 또는
모집글 작성·제출(연락처 패턴 감지 시 제출 차단).

### 다른 화면으로의 이동

- Section 4 "항공편/숙소 보러 가기" → 외부 사이트(Google Flights / Booking.com, 새 탭, 내부
  화면 전환 아님)
- Section 5 안전정보 팁 링크 → SCR-001 안전정보 Drawer
- Section 6 "로그인하고 계속하기" → SCR-005
- Section 6 작성 완료 → SCR-004(작성한 글 상세)
- Header nav → 전 화면 공통

### Desktop·Mobile 규칙

- Desktop 1440px: 콘텐츠 최대 폭 1200~1280px, 조건 입력 Form은 좌(Form)·우(안내 카드) 분할.
- Mobile 390px: Form/안내 카드 세로 스택, 3-Tip Card가 1열로 스택, 탭은 상단 풀폭 세그먼트
  컨트롤.
- Intro는 텍스트 중심 축소형 밴드로 구성하고 Desktop 1440px 첫 화면에서 Section 2(Tab) 상단이
  바로 보이게 한다(사진 Hero 아님).

### 금지 기능

Airbnb 상표 요소, **구매·예약·결제 UI**(가격 계산기, 장바구니, "지금 예약" 버튼 — 외부 새 탭
연결만 허용), **실시간 가격비교/최저가 UI**, 입력값(국가·지역·날짜)의 서버 DB·로그·분석 이벤트
저장, 외부 URL query/body/cookie로 입력값 전달, 공개 연락처(전화번호·메신저ID·이메일) 노출
허용, Lorem ipsum류 문구.

---

## SCR-004 — 동행 조회

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-004 |
| **구분** | 핵심(core) |
| **Route** | `/mates` |
| **Page Entry** | `src/app/mates/page.tsx` |
| **Stitch 승인 화면** | `.../screens/0d36171b01de4567a734f7e2dbe68ca3` (Desktop, PASS — "매너온도" 평판 점수 제거 반영됨) |

### 영역 순서 (6개 Section)

1. Intro(목적 설명 + "동행글 작성하기" CTA)
2. Filter(국가·지역·기간·연령대·성별·여행스타일·모집상태) + 결과 요약("총 N건")
3. 동행글 목록(Card Grid, 최대 8장, 9번째부터 페이지네이션) 또는 완성형 Empty State
4. 목록+상세 분할(Desktop: 좌 목록 유지 + 우 상세 패널 / Mobile: 카드 클릭 시 하단→전체 Drawer)
5. 참가 신청 방법 3단계 안내
6. 안전·신고·차단 안내 배너 + `/travel-tools` CTA

### 주요 Component

`component.filter-chip`/`filter-chip-active`, `component.mate-post-card`(목적지 배지·기간·
인원·스타일 Chip·모집상태 배지, **평판 점수 없음**), List+Detail Split(Desktop) /
`component.drawer-panel`(Mobile), `component.text-input`(참가 메시지 textarea, 500자 제한),
`component.alert-badge-success`(모집중) / 중립 톤(마감), `component.empty-state`, 3-Step Guide
Card.

### 상태

| 상태 | 적용 범위 |
|---|---|
| Loading | Section 3 카드 스켈레톤 8개 |
| Success | Section 3·4 정상 렌더 |
| Empty | Section 3 결과 없음 — 필터 초기화 + "먼저 글을 등록해 보세요" CTA + 이용 방법 3줄 |
| Error | 목록/상세 로드 실패("동행글을 불러오지 못했어요, 다시 시도") |
| Unauthorized | Section 4 참가 요청/신고/차단 시도 시 비로그인·미성년 인라인 안내 + "로그인하고 계속하기" |

### 사용자 행동

필터 적용/초기화, 동행글 카드 클릭 → 상세 패널/Drawer 오픈, 참가 메시지(최대 500자) 작성·
제출, 신고 제출(사유 코드+설명), 차단(작성자/신청자 대상).

### 다른 화면으로의 이동

- Section 1·3 "동행글 작성하기" → SCR-003(동행 구하기 탭)
- 참가 요청/신고/차단 시도 중 비로그인 → SCR-005
- Section 6 "여행 조건도 함께 정리해 보세요" → SCR-003
- 내 글/받은 요청 관리는 SCR-005 "내 활동" 탭에서 처리(본 화면에서는 조회·신청만)
- Header nav → 전 화면 공통

### Desktop·Mobile 규칙

- Desktop 1440px: 콘텐츠 최대 폭 1200~1280px, Filter Bar는 가로 1행, 목록+상세는 2단 분할.
- Mobile 390px: Filter는 접이식/Chip 가로 스크롤, 카드 1열, 상세는 전체화면 Drawer로 전환.
- Intro는 텍스트 중심 축소형 밴드로 Desktop 1440px 첫 화면에서 Section 2(Filter) 상단이 보이게
  한다.

### 금지 기능

Airbnb 상표 요소, **실시간 채팅/화상통화/실시간 위치공유**(참가는 1회성 참가 메시지 폼으로만
처리), **공개 연락처 노출**(전화번호·메신저ID·이메일 — 본문 등록 시 탐지·차단), **별점·리뷰·
매너 점수/평판 지수**(2026-09-15 검증에서 "매너온도 98%"가 실제 발견되어 제거된 항목, 재추가
금지 — 성인 인증 뱃지·참여 횟수 같은 사실 정보는 허용), **미성년자 동행 모집/참가 UI**,
구매·예약·결제 UI, Lorem ipsum류 문구.

---

## SCR-005 — 계정·관리

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-005 |
| **구분** | 핵심(core) |
| **Route** | `/account` |
| **Page Entry** | `src/app/account/page.tsx` |
| **Stitch 승인 화면** | `.../screens/d9ced155cb31490daa897d6f981dbc21` (Desktop, PASS) |

### 영역 순서 (역할별 탭, 없는 탭은 렌더링하지 않음)

| 탭 ID | 노출 대상 | 내용 |
|---|---|---|
| `account_intro_guest` | Guest | 계정 기능 Intro |
| `auth_cards` | Guest | 로그인 / 회원가입(이메일+성인확인) / 비밀번호 재설정 Card 3개 |
| `post_login_benefits` | Guest | 로그인 후 가능한 기능 3단계 안내 |
| `security_notice` | Guest | 보안·개인정보 고지 CTA Banner |
| `profile` | Member, Admin | 닉네임·연령대·성별(선택)·여행 스타일·자기소개, 성인 인증 배지, 탈퇴 |
| `my_activity_posts` | Member, Admin | 내가 쓴 동행글(수정/마감/삭제) 또는 Empty State |
| `my_activity_requests` | Member, Admin | 받은 요청(승인/거절) + 보낸 요청 상태 목록 또는 Empty State |
| `my_activity_blocklist` | Member, Admin | 차단 목록(해제) 또는 Empty State |
| `report_management` | Admin | 신고 상태 필터(OPEN/RESOLVED/DISMISSED) + 목록 + 상태 변경 |
| `external_url_settings` | Admin | 항공·숙소 외부 URL 설정 Form(HTTPS 검증) |

Guest는 `auth_cards` 이하만, Member는 `profile`~`my_activity_blocklist`만, Admin은 Member
탭 전체 + `report_management`/`external_url_settings`까지 노출한다.

### 주요 Component

`component.text-input`(로그인·프로필·URL 설정 Form), `component.button-primary`/`button-secondary`,
`component.mate-post-card`(내 글 목록 재사용), `component.empty-state`(내 글/요청/차단/신고
목록 없음), `component.alert-badge-*`(신고 상태 배지), `component.toast`(로그인 성공 등),
`component.tab-active`/`tab-inactive`(역할별 탭 셸).

### 상태

| 상태 | 적용 범위 |
|---|---|
| Loading | 프로필/내 활동 목록 스켈레톤 |
| Success | 로그인 성공, 프로필 저장 성공(Toast) |
| Empty | 내 글/받은·보낸 요청/차단/신고 목록 없음 — 각각 완성형 Empty State |
| Error | 로그인 실패, 저장 실패, URL 검증 실패(필드 인라인 오류) |
| Unauthorized | Member/Admin 탭에 권한 없는 역할로 접근 시 해당 탭을 렌더링하지 않고 Guest Intro로 대체 |

### 사용자 행동

로그인/회원가입/비밀번호 재설정 제출, 성인 확인 진행, 프로필 편집·저장, 내 글 수정/마감/삭제,
참가 요청 승인/거절, 차단 해제, (Admin) 신고 상태 변경, (Admin) 외부 URL 저장, 탈퇴.

### 다른 화면으로의 이동

- 내 글/받은·보낸 요청 항목 클릭 → SCR-004(해당 동행글 상세 패널)
- 로그아웃 → SCR-001
- Header nav → 전 화면 공통
- (진입 전) SCR-003·SCR-004의 "로그인하고 계속하기" → 본 화면으로 유입

### Desktop·Mobile 규칙

- Desktop 1440px: 콘텐츠 최대 폭 1200~1280px, 좌측 세로 탭(Member/Admin) 또는 상단 탭(Guest
  Card 3열).
- Mobile 변형 없음(승인 화면 인벤토리 기준 Desktop만 존재) — 반응형 CSS로 좌측 탭 → 상단
  드롭다운/세그먼트 전환은 필요하나 별도 Stitch 승인 Mobile 스크린은 없음.

### 금지 기능

Airbnb 상표 요소, **복잡한 관리자 Dashboard**(차트·그래프·실시간 통계 위젯 — 신고 관리는
상태 개수 요약 + 목록 + 상태 변경만), **신분증 기반 신원보증 업로드 UI**, **범용 감사 로그
UI**(신고 상태 변경 이력만 최소 기록, 전체 관리자 행위 로그 뷰 없음), 정확한 생년월일 저장/노출
UI(성인 여부·확인 시각만), Lorem ipsum류 문구.

---

## 기술 Route (Screen 수에 포함하지 않음)

| 유형 | Route/Path | 설명 |
|---|---|---|
| 인증 콜백 | `src/app/auth/callback/route.ts` | Supabase 이메일 인증·매직링크 콜백 처리 |
| API Route Handler | `src/app/api/**/route.ts` | 신고 접수, 참가 요청 처리 등 서버 로직(필요한 최소 범위) |
| 404 | `src/app/not-found.tsx` | 전역 404, "홈으로" 복구 행동 포함 |
| 오류 경계 | `src/app/error.tsx` | 전역 500 오류 경계, "다시 시도" 복구 행동 포함 |

이 4가지는 URL은 갖지만 디자인 Screen(SCR-xxx)으로 세지 않는다. 항공·호텔 폼(SCR-003)은
서버 API를 만들지 않고 Client Component 상태로만 검증·요약·외부 이동을 처리한다.

---

## 완료 조건 자체 점검

| 조건 | 결과 |
|---|---|
| Route 중복 없음 | `/`, `/about`, `/travel-tools`, `/mates`, `/account` — 5개 모두 고유 |
| Page Entry 중복 없음 | `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/travel-tools/page.tsx`, `src/app/mates/page.tsx`, `src/app/account/page.tsx` — 5개 모두 고유 |
| Screen 수 5 | SCR-001~005 |
| 핵심 4 · 보조 1 구분 | 핵심: SCR-001, SCR-003, SCR-004, SCR-005 / 보조: SCR-002 |
