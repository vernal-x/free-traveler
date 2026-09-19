---
id: D-001
version: 1.0.0
name: Free Traveler Design System
status: LOCKED
description: >
  성인 인증 기반 동행 커뮤니티와 여행 준비 허브를 위한 Free Traveler 전용 디자인 정본.
  사진 중심 카드, 낮은 밀도 대비(여유로운 Hero/소개 vs 촘촘한 Card Grid), 부드러운 radius,
  단일 그림자 단계 같은 Airbnb의 구조적 레이아웃 패턴만 참고하고, Rausch 컬러·Airbnb Cereal
  폰트·3-tab 상품 내비게이션·Guest favorite 배지 등 상표적 요소는 전혀 가져오지 않는다.
  Free Traveler는 코랄(`#FF6B4A`) 단일 강조색과 Inter 기반 서체 스택을 사용하며, 실시간 채팅·
  가격비교·예약결제·별점 리뷰처럼 PRD/SRS가 명시적으로 제외한 기능은 이 정본에도 존재하지 않는다.
vendor_reference: design-reference/vendor/airbnb/DESIGN-airbnb.md
vendor_reference_scope: 구조적 레이아웃 패턴(카드 밀도, 섹션 리듬, 그림자 단계, radius 언어)만 참고 — 색상·폰트·로고·상품명·배지는 미사용
approved_screens: [SCR-001, SCR-002, SCR-003, SCR-004, SCR-005]
mobile_variants: [SCR-001, SCR-003]
source_documents:
  - app/docs/04_UIUX_PLAN.md
  - app/docs/STITCH_VALIDATION_REPORT.md
  - app/docs/01_PRD.md
  - app/docs/02_SRS_BASELINE.md
  - app/docs/PROJECT_SCOPE.md

colors:
  canvas: "#FFFFFF"
  surface-soft: "#F7F8F9"
  surface-strong: "#F0F1F3"
  text-primary: "#2A2D33"
  text-secondary: "#565B63"
  text-muted: "#868C94"
  text-muted-soft: "#AEB3BA"
  hairline: "#E3E6EA"
  hairline-soft: "#EEF0F3"
  border-strong: "#C7CCD2"
  primary: "#FF6B4A"
  primary-active: "#E5502E"
  primary-tint: "#FFE4DA"
  on-primary: "#FFFFFF"
  danger: "#D93A3A"
  danger-strong: "#B42323"
  warning: "#C9770A"
  success: "#1E8E5A"
  focus-ring: "#2A2D33"

typography:
  display-xl:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.3
  display-lg:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.35
  display-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
  title-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  title-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.4
  body-md:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
  badge:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
  button:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.3

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section-desktop: 80px
  section-mobile: 48px

rounded:
  sm: 8px
  md: 14px
  lg: 20px
  pill: 9999px

shadow:
  card: "0 0 0 1px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.08)"
  none: "none"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    minHeight: "44px"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    border: "1px solid {colors.border-strong}"
    padding: "11px 19px"
    minHeight: "44px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    typography: "{typography.button}"
  search-bar-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    border: "1px solid {colors.hairline}"
    height: "56px"
    padding: "14px 24px"
  filter-chip:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    minHeight: "44px"
  filter-chip-active:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary-active}"
    rounded: "{rounded.pill}"
  destination-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    typography: "{typography.title-md}"
    rounded: "{rounded.md}"
    shadow: "{shadow.none}"
    shadowOnHover: "{shadow.card}"
  mate-post-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    typography: "{typography.title-md}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline}"
    padding: "16px"
  status-badge:
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  tab-active:
    textColor: "{colors.text-primary}"
    typography: "{typography.title-sm}"
    borderBottom: "2px solid {colors.primary}"
  tab-inactive:
    textColor: "{colors.text-muted}"
    typography: "{typography.title-sm}"
  drawer-panel:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    shadow: "{shadow.card}"
    widthDesktop: "480px"
  modal-scrim:
    backgroundColor: "rgba(0,0,0,0.5)"
  toast:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  alert-badge-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
  alert-badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-primary}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
  alert-badge-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    border: "1px solid {colors.hairline}"
    height: "48px"
    padding: "12px 14px"
  empty-state:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "48px 24px"
---

## Overview / Visual Theme

Free Traveler는 **여행 편집물 + 안전 신뢰 정보 + 동행 커뮤니티**를 한 화면 흐름에서 보여주는
서비스다. 시각적으로는 흰 캔버스 위에 사진 중심 카드를 배치하고, 코랄(`{colors.primary}`)
하나만 브랜드 강조색으로 쓰는 절제된 톤을 유지한다. Airbnb 레퍼런스(`vendor/airbnb/DESIGN-airbnb.md`)
에서 가져오는 것은 **딱 세 가지 구조적 습관**뿐이다: (1) Hero는 여유 있게, Card Grid는 16~24px
간격으로 촘촘하게 배치하는 밀도 대비, (2) 카드·Drawer·드롭다운에 단일 그림자 단계만 사용하는
절제된 elevation, (3) 버튼 8px·카드 14px·검색바/칩 pill 같은 부드러운 radius 언어. 색상 값,
폰트, 로고, 상품 구조, 배지 디자인은 그대로 가져오지 않는다 — 아래 Color/Typography/Component
정의가 유일한 출처(source of truth)다.

신뢰 신호(안전정보 경보, 출처·확인일)는 코랄과 분리된 semantic color(`danger`/`warning`/`success`)
로만 표현해 마케팅 톤과 안전 고지가 섞이지 않게 한다. 빈 상태(동행글 없음, 참가 요청 없음 등)도
안내문·이용 방법·CTA를 갖춘 완성된 화면으로 취급한다.

## Color Token

| 토큰 | 값 | 용도 |
|---|---|---|
| `color.canvas` | `#FFFFFF` | 페이지 기본 배경 |
| `color.surface-soft` | `#F7F8F9` | 카드 그룹 배경, 필터 바, Empty State 배경 |
| `color.surface-strong` | `#F0F1F3` | 아이콘 버튼 배경, 비활성 칩 배경 |
| `color.text-primary` | `#2A2D33` | 본문·헤딩 기본색(짙은 회색, 순검정 아님) |
| `color.text-secondary` | `#565B63` | 설명 문단, 카드 메타 |
| `color.text-muted` | `#868C94` | 보조 라벨, 타임스탬프, 비활성 탭 |
| `color.text-muted-soft` | `#AEB3BA` | 완전 비활성 텍스트 |
| `color.hairline` | `#E3E6EA` | 카드·구분선 1px 보더 |
| `color.hairline-soft` | `#EEF0F3` | 섹션 내부 옅은 구분선 |
| `color.border-strong` | `#C7CCD2` | 입력창 기본 보더, 비활성 버튼 외곽선 |
| `color.primary` (코랄) | `#FF6B4A` | 유일한 브랜드 강조색 — 주요 CTA, 활성 탭 밑줄, 필수 배지 |
| `color.primary-active` | `#E5502E` | 코랄 버튼 press 상태 |
| `color.primary-tint` | `#FFE4DA` | 코랄 배경 위 은은한 톤(활성 필터 칩, 하이라이트) |
| `color.on-primary` | `#FFFFFF` | 코랄 배경 위 텍스트 |
| `color.danger` | `#D93A3A` | 오류 메시지, 폼 검증 실패, 출국권고 경보(3단계) |
| `color.danger-strong` | `#B42323` | 최상위 여행경보(여행금지, 4단계) 배지 |
| `color.warning` | `#C9770A` | 여행자제 경보(2단계), stale(재확인 필요) 배지 |
| `color.info` | `#2563EB` | 여행유의 경보(1단계) 배지 |
| `color.success` | `#1E8E5A` | 모집중, 승인완료 등 긍정 상태 배지 |
| `color.focus-ring` | `#2A2D33` | 키보드 포커스 링(2px, 코랄과 별도) |

**규칙**: 이 표에 없는 임의의 hex 색상을 화면에 새로 추가하지 않는다. 새로운 의미가 필요하면
반드시 이 표에 토큰을 먼저 추가한 뒤 사용한다. `danger`/`danger-strong`/`warning`/`info`는
`primary`와 색 계열이 겹치지 않도록 각각 붉은색·황토색·파란색 계열로 분리해 "위험 안내"와
"브랜드 CTA"가 혼동되지 않게 한다. 안전정보 경보는 여행유의(1단계, `info`)·여행자제(2단계,
`warning`)·출국권고(3단계, `danger`)·여행금지(4단계, `danger-strong`) 4단계로 표현한다(확정,
`04_UIUX_PLAN.md` §3.1과 동일).

## Typography

**서체 스택**: `Inter, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic",
"Noto Sans KR", sans-serif` — 라틴 문자·숫자는 Inter, 한글은 OS 기본 한글 시스템 폰트로 자연스럽게
폴백된다. Proprietary 폰트 파일(예: Airbnb Cereal VF)을 프로젝트에 포함하지 않는다.

| 토큰 | 크기 / 두께 / 행간 | 용도 |
|---|---|---|
| `type.display-xl` | 32px / 700 / 1.3 | Hero 제목(SCR-001, SCR-002) |
| `type.display-lg` | 24px / 700 / 1.35 | Section 제목(H2) |
| `type.display-md` | 20px / 600 / 1.4 | 서브 섹션 제목, Drawer/Modal 제목 |
| `type.title-md` | 16px / 600 / 1.4 | 카드 제목 |
| `type.title-sm` | 15px / 500 / 1.4 | 폼 라벨, 탭 라벨, 필터 그룹 제목 |
| `type.body-md` | 16px / 400 / 1.6 | 본문 설명 |
| `type.body-sm` | 14px / 400 / 1.5 | 카드 메타, 캡션 |
| `type.caption` | 13px / 500 / 1.4 | 배지 하단 보조 문구, 타임스탬프 |
| `type.badge` | 12px / 600 / 1.3 | 상태 배지 텍스트 |
| `type.button` | 15px / 600 / 1.3 | 버튼 라벨 |

## Spacing

| 토큰 | 값 |
|---|---|
| `space.xxs`~`space.xxl` | 4 / 8 / 12 / 16 / 24 / 32 / 48px |
| `space.section-desktop` | 80px (허용 범위 64~96px) |
| `space.section-mobile` | 48px (허용 범위 40~64px) |
| `grid.card-gap-desktop` | 20px |
| `grid.card-gap-mobile` | 16px, 1열 |

## Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius.sm` | 8px | 버튼, 입력창 |
| `radius.md` | 14px | 카드, Action Card |
| `radius.lg` | 20px | Drawer 패널, Modal |
| `radius.pill` | 9999px | 검색바, Chip, 상태 배지 |

## Shadow

| 토큰 | 값 | 용도 |
|---|---|---|
| `shadow.card` | `0 0 0 1px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.08)` | 카드 hover, Drawer, 드롭다운 — **유일한 그림자 단계** |
| `shadow.none` | 없음 | 본문·Hero·Footer 등 표면의 95% |

여러 단계의 elevation을 만들지 않는다. 깊이는 사진, 백색 표면 분리, radius 클리핑으로 표현하고
그림자는 `shadow.card` 하나만 존재한다(Airbnb 레퍼런스와 동일한 절제 원칙).

## Desktop·Mobile 규칙 / Page Section 여백

- **브레이크포인트**: Desktop 기준 1440px(콘텐츠 최대 폭 1200~1280px, 기준 1240px), Tablet
  744~1279px(Card Grid 2~3열), Mobile 기준 390px(좌우 패딩 20px, Card 1열).
- **Section 상하 여백**: Desktop `space.section-desktop`(기준 80px, 범위 64~96px), Mobile
  `space.section-mobile`(기준 48px, 범위 40~64px). Section마다 값을 이 범위 안에서만 조정한다.
- **Header**: Desktop 72px(하단 1px hairline), Mobile 56px. **Footer**: Desktop 4컬럼(24px
  거터), Mobile 1컬럼.
- 모든 화면은 `Header → Section 1..N → Footer` 순서로만 구성하고 그 사이에 다른 전역 UI를
  배치하지 않는다.
- 모바일 터치 대상(버튼·아이콘 버튼·칩·체크박스)은 최소 44×44px을 확보한다.

## Hero 규칙 (다음 Section 노출)

Hero는 **뷰포트 전체를 채우지 않는다.** Desktop 1440px 기준 뷰포트의 55~65%까지만 채우고
(권장 높이 560~640px), 스크롤 없이도 다음 Section의 제목 일부가 화면 하단에 보이도록 한다.
Mobile에서는 세로 스택으로 검색·CTA가 풀폭을 차지하되 동일 원칙(다음 Section 일부 노출)을
지킨다. Hero 아래 긴 빈 공간이 생기지 않도록 Hero와 다음 Section 사이 여백은 `space.section-*`
범위를 넘지 않는다.

## Section 시각적 리듬 (제목·설명·본문·CTA 계층)

모든 Section은 예외 없이 다음 4단 계층을 따른다:

1. **제목** — `type.display-lg`(H2), Section당 정확히 1개.
2. **설명** — `type.body-md` 보조색(`text-secondary`), 1~3문장. 마케팅 카피가 아니라 이 Section이
   무엇을 보여주는지 설명하는 문장이어야 한다.
3. **본문(콘텐츠)** — Card Grid / 좌우 분할 / Chip 목록 / 3단계 안내 / Tab / Filter Bar 중 하나의
   패턴으로 실제 데이터를 담는다.
4. **CTA(선택)** — 명확한 다음 행동 1개. 없어도 되지만 있다면 텍스트가 모호해서는 안 된다("자세히
   보기" 대신 "3일 코스 보기"처럼 구체적으로).

**리듬 대비**: Hero·소개형 Section(SCR-002 자기소개 등)은 여유 있게(넉넉한 줄 간격, 단일 컬럼
텍스트), Card Grid Section은 `grid.card-gap-desktop`(20px)/`grid.card-gap-mobile`(16px)로
촘촘하게 배치해 정보 탐색 속도와 편집 콘텐츠의 여유를 한 화면 안에서 교차시킨다.

## Components

### Header·Footer

**Header** (5개 화면 공통) — 좌: "Free Traveler" 워드마크 텍스트(코랄 포인트 1글자 또는 밑줄만,
마스코트 없음). 중앙: 텍스트 내비게이션 4개(홈/여행 준비/동행 찾기/대표 소개, 활성 항목은 코랄
밑줄). 우: 비로그인 시 "로그인" 텍스트 버튼 + "회원가입" 코랄 버튼, 로그인 시 프로필 아이콘
버튼. Mobile은 워드마크만 남기고 나머지는 햄버거 시트로 이동. 스크롤 8px 이상일 때만
`shadow.card`로 살짝 구분한다(기본은 그림자 없음).

**Footer** (5개 화면 공통) — 4컬럼(브랜드/서비스/정책/안전 고지). 안전 고지 컬럼에는 "안전정보는
참고용이며 출국 전 외교부 해외안전여행에서 최신 정보를 다시 확인하세요." 문구와 외부 링크를
항상 포함한다. Mobile은 1컬럼으로 쌓고 정책 링크는 가로 wrap.

### Search·Filter

**Search Bar** (`component.search-bar-pill`) — SCR-001 Hero 전용. `radius.pill`, 56px 높이,
키워드 검색창(도시·국가·테마 자동완성) + 코랄 텍스트 버튼. 가격·재고·실시간 결과를 직접
보여주지 않고, 어디까지나 여행지 탐색/필터링 입력일 뿐이다.

**Filter Bar** (SCR-004 동행 조회) — 국가/지역/기간/연령대/성별/여행스타일/모집상태 7개 필터를
`component.filter-chip`(비활성) / `component.filter-chip-active`(코랄 틴트)로 표현하고, 적용
결과 건수를 텍스트("총 N건")로 항상 함께 보여준다.

**Chip 목록** (SCR-001 테마, SCR-002 방문국가) — 가로 pill 버튼 그룹, Desktop은 줄바꿈 wrap,
Mobile은 가로 스크롤 1줄.

### Destination Card

여행지 탐색(SCR-001 국내/해외, SCR-002 추천 4곳)에서 쓰는 유일한 카드 유형.

- 구조: 대표 이미지(4:3~16:10, `radius.md` 클리핑) → 제목(`type.title-md`) → 메타 설명
  1줄(`type.body-sm`, `text-secondary`, 추천 시기 등) → 텍스트 CTA(예: "3일 코스 보기").
- 안전정보 카드 변형: 이미지 대신/함께 `alert-badge-*`(위험도별 색) + "최종 확인일"
  캡션(`type.caption`)을 카드 상단에 노출한다.
- 기본은 `shadow.none`, hover 시에만 `shadow.card` 1단계.
- **금지**: 가격(₩/야) 배지, 별점(★) 오버레이, "Guest favorite" 류 차용 배지, 하트/좋아요
  카운터. 즐겨찾기 토글은 허용하되 숫자 카운트나 순위를 노출하지 않는다.

### Form·Tabs

**Tab** — SCR-003(항공편/숙소/동행 구하기), SCR-005(프로필/내 활동/관리자). 활성 탭:
`component.tab-active`(코랄 밑줄 2px + `type.title-sm` bold). 비활성: `component.tab-inactive`
(`text-muted`). 역할에 없는 탭은 렌더링 자체를 하지 않는다(예: 일반 회원에게 관리자 탭 없음).

**Form** — 입력창은 `component.text-input`(48px 높이, `radius.sm`, 1px hairline 보더, 포커스 시
2px `focus-ring`). 라벨은 `type.title-sm` 상단 고정. 오류는 `color.danger` 텍스트 + 입력과
`aria-describedby`로 연결. select는 국가→지역 종속 관계를 유지한다.

### Mate Post Card

동행 모집글 목록(SCR-004)에서만 쓰는 카드.

- 구조: 목적지 배지 → 기간 → 모집 인원 → 여행 스타일 `filter-chip` 1~3개 → 모집중/마감
  상태 배지(`alert-badge-success` / `text-muted` 톤) → 작성자 닉네임만(실명·사진 과다 노출 없음).
- 카드 자체는 목록 요약이며 클릭 시 상세(List+Detail Split 또는 Drawer)로 이동한다.
- **금지**: 카드 위 실시간 채팅 아이콘/버튼, 공개 연락처(전화번호·메신저ID·이메일) 텍스트,
  참가 신청 버튼을 카드에서 바로 노출(신청은 상세 화면의 폼에서만), 별점·리뷰 배지, "매너온도"·
  "매너 점수"·신뢰도(%) 같은 평판 수치(2026-09-15 SCR-004 승인 전 검증에서 실제로 발견되어
  제거된 항목 — 성인 인증 뱃지·참여 횟수 같은 사실 정보는 평판 점수가 아니므로 허용).

### Drawer·Modal

| 유형 | 열리는 방식 | Desktop | Mobile |
|---|---|---|---|
| 여행지 상세 Drawer | Destination Card 클릭 | 우측 슬라이드, 폭 480px, `radius.lg`, `shadow.card` | 전체화면 Modal, 상단 닫기 버튼 |
| 국가 안전정보 Drawer | 안전정보 카드/링크 | 우측 슬라이드, 폭 480px | 전체화면 Modal |
| 동행글 상세 | List+Detail Split(Desktop) | 우측 패널(목록 유지) | 하단→전체 Drawer |
| 로그인/회원가입/비번재설정 | 계정 Card 클릭 | Modal, 최대폭 480px | 전체화면 Modal |

배경은 `component.modal-scrim`(50% 검정)을 사용하고, Drawer/Modal 내부 표면은 `shadow.card`
1단계만 적용한다.

### Alert·Toast

**Alert Badge** — 위험도 4단계(여행유의/자제/철수권고/금지)는 `alert-badge-warning`(자제 이하)과
`alert-badge-danger`/`danger-strong`(철수권고/금지)로 매핑하고, **항상 텍스트 라벨을 색상과
함께** 표기한다(색상만으로 상태를 구분하지 않는다). stale(정보 재확인 필요) 배지는
`alert-badge-warning`을 재사용한다.

**Toast** (`component.toast`) — 성공 피드백 전용(예: "로그인되었습니다", "저장되었습니다").
짙은 중립색 배경(`text-primary`) + 흰 텍스트, 3~4초 후 자동 소멸, 화면 하단 중앙 또는 상단에
고정. 오류는 Toast가 아니라 해당 필드/Section 인라인 메시지(`color.danger`)로 표시한다.

## Loading·Empty·Error 상태

| 상태 | 규칙 |
|---|---|
| **Loading** | 카드 형태의 스켈레톤(제목·이미지 영역만 회색 블록). 스피너 단독 사용 금지(레이아웃 흔들림 방지). |
| **Success** | 정상 콘텐츠 렌더 또는 `component.toast`로 완료 피드백. |
| **Empty** | 아이콘 + 제목 + 1~2문장 설명 + 1차 CTA + 보조 링크(이용 방법 요약)를 모두 갖춘 **완성된 화면**으로 취급한다. 목록 자리 하나를 그대로 비워두지 않는다. |
| **Error** | "정보를 불러오지 못했어요, 다시 시도" 형태 + 재시도 버튼. 원인을 사용자 탓으로 돌리는 문구를 쓰지 않는다. |
| **Unauthorized** | 콘텐츠 대신 로그인/성인 인증 유도 카드로 대체하며, 접근 권한이 없는 탭은 아예 렌더링하지 않는다(빈 탭을 보여주지 않는다). |

**완성형 Empty State·Placeholder 금지 규칙**: 다음 문구·상태는 최종 화면 어디에도 남기지 않는다.

- Lorem ipsum 및 그에 준하는 의미 없는 텍스트
- "준비 중"
- "정보 확인 필요"
- 제목만 있고 이미지·설명·CTA가 전혀 없는 빈 카드

## 화면별 Section 순서 / 최소 콘텐츠 수 (승인된 Stitch 화면 기준)

`STITCH_VALIDATION_REPORT.md`(2026-09-15) 검사 1~13 전 항목에서 PASS로 확인된 Section 구성을
그대로 정본으로 삼는다. 최초 조회 시 SCR-002(방문 국가 28개, 추천 카드 별점 `★ 4.9` 등)와
SCR-004(상세 패널 "매너온도 98%" 평판 점수)에서 카피 레벨 위반이 발견되었으나, 승인 전 수정을
거쳐 두 화면 모두 PASS로 전환되었다 — 이 정본의 최소 콘텐츠 수·금지 목록은 **수정 이후의
승인된 상태**를 기준으로 작성됐다. 유일하게 남은 항목은 SCR-002 Desktop 중복 화면(정본
`25abc0425c354dfbb865d6d73fe219ce` 외 중복본 `745aecb65dd84ee79c76d9c8763fb010`)이며, 이는
콘텐츠·디자인 위반이 아니라 Stitch 프로젝트의 화면 정리(수동 삭제) 문제로 BLOCKED 상태다.

| Screen | Section 수·순서 | 최소 콘텐츠 수 |
|---|---|---|
| **SCR-001** `/` 메인 (Mobile 변형 있음) | Hero → 국내 여행지 → 해외 여행지 → 테마 Chip → 국가별 안전정보 → 최근 동행글/Empty → 소개 요약 (7개) | 국내 카드 6, 해외 카드 6, 테마 Chip 6, 안전정보 카드 6, 동행글 카드 3(또는 Empty) |
| **SCR-002** `/about` 대표 소개 | Hero → 여행 지표 → 자기소개 → 여행 타임라인 → 방문 국가 → 사진 Gallery → 추천 여행지+CTA (7개) | 지표 카드 3, 타임라인 항목 6 이상, 방문 국가 Chip 30개, Gallery 사진 8장 이상, 추천 카드 4 |
| **SCR-003** `/travel-tools` 통합 여행 준비 (Mobile 변형 있음) | Intro → Tab(항공편/숙소/동행 구하기) → 조건 입력 Form → 입력 요약+외부 이동 → 비전달 고지+여행 팁 → 동행 구하기 탭 (6개) | 탭 3개 전량(항공·숙소·동행), 여행 팁 카드 3 |
| **SCR-004** `/mates` 동행 조회 | Intro → 필터+결과 요약 → 동행글 목록/Empty → 목록+상세 Split(Desktop)/Drawer(Mobile) → 참가 신청 방법 → 안전 안내 (6개) | 목록(카드그리드)과 상세 영역 모두 존재, 카드 최대 8(그 이상은 페이지네이션), 신청 안내 3단계 |
| **SCR-005** `/account` 계정·관리 | Guest(로그인 유도) / Member(프로필·내 글·참가 요청·차단 목록) / Admin(신고 관리·외부 URL 설정) — 역할별 탭 | 단순 로그인 화면 아님: Guest·Member·Admin 3개 상태를 모두 표현할 수 있어야 함 |

## Do / Do Not

### Do

- 모든 색상은 위 Color Token 표에서만 가져온다.
- Inter + OS 기본 한글 폰트 스택만 사용한다(Proprietary 폰트 파일 프로젝트 포함 금지).
- Airbnb에서는 "사진 우선 카드, 단일 그림자 단계, 부드러운 radius, Section 밀도 대비"라는
  **구조적 패턴만** 참고한다.
- 안전 신호(`danger`/`danger-strong`/`warning`)는 브랜드 색(`primary`)과 분리해서 쓴다.
- Empty State도 완성된 화면으로 만든다(아이콘+제목+설명+CTA+보조 링크).
- 배지는 색상과 텍스트 라벨을 항상 함께 표기한다.
- 모바일 터치 대상 44×44px 이상, 키보드 포커스 링(`focus-ring`) 항상 표시.
- Hero는 뷰포트의 55~65%만 채워 다음 Section이 첫 화면에서부터 이어져 보이게 한다.

### Do Not

- **Airbnb 상표 요소**: Rausch(`#ff385c`) 색상, Airbnb Cereal/Circular 폰트, 워드마크·마스코트,
  Homes/Experiences/Services 3-tab 구조, "Guest favorite" 배지 디자인을 그대로 가져오지 않는다.
- **구매·예약·결제 UI**: 가격 계산기, 장바구니, 결제 폼, 날짜별 요금 합산, "지금 예약"류 버튼을
  만들지 않는다 — 외부 사이트로 새 탭 연결만 허용한다.
- **실시간 가격비교/최저가**: "실시간 최저가", "가격 비교", "재고 확인" 문구나 UI를 넣지 않는다.
- **별점·리뷰**: ★ 숫자, 리뷰 카드, 평점 배지, "매너온도"·매너 점수·신뢰도(%) 같은 평판 수치를
  넣지 않는다(OS-08).
- **실시간 채팅/화상통화/위치공유**: 채팅창, 채팅 아이콘, "실시간", "인앱 채팅" 표현을 넣지
  않는다(OS-04). 동행 참가는 1회성 참가 메시지 폼으로만 처리한다.
- **공개 연락처 노출**: 전화번호·메신저 ID·이메일을 본문/카드에 노출하는 UI를 만들지 않는다
  (OS-07).
- **미성년자 동행 허용 UI**: 연령 입력·모집 조건에 미성년을 포함하는 UI를 만들지 않는다(OS-05).
- **신분증 기반 신원보증 UI**: 신분증 업로드/검증 플로우를 만들지 않는다(OS-06).
- **디자인 토큰 없는 임의 색상**: Color Token 표에 없는 hex 값을 코드나 디자인 파일에 직접
  추가하지 않는다.
- **Placeholder류 문구**: Lorem ipsum, "준비 중", "정보 확인 필요", 빈 카드(제목만 있고 내용
  없음)를 최종 화면에 남기지 않는다.
- Hero가 뷰포트 전체를 채워 다음 Section이 첫 화면에서 전혀 보이지 않는 레이아웃을 만들지
  않는다.
