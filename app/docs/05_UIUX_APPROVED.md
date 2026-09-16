# Free Traveler — UI/UX 승인 문서 (05_UIUX_APPROVED)

**Document ID:** UIUXAPPROVED-TRAVEL-001
**기반 문서:** `02_SRS_BASELINE.md`, `PROJECT_SCOPE.md`, `03_UI_COVERAGE_ANALYSIS.md`,
`04_UIUX_PLAN.md`, `STITCH_VALIDATION_REPORT.md`, `design-reference/D-001/DESIGN.md`,
`design-reference/DESIGN_MANIFEST.md`, `design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`
**대상:** Product Owner, 개발팀, QA
**상태:** UI/UX 설계 단계 승인 게이트

---

## 1. 목적

이 문서는 Free Traveler의 UI/UX 설계 산출물(디자인 정본, 승인된 5개 Stitch 화면, Route
계약)이 **다음 단계(Task 생성·코드 구현)로 넘어가도 되는 상태인지**를 판정하는 승인
문서다. 승인 대상은 어디까지나 **설계·계약**이며, 코드 구현 여부는 별개다 — 현재
`src/app`에는 기본 Next.js 스캐폴드만 있고 5개 Screen의 실제 페이지 구현은 아직
시작되지 않았다.

---

## 2. Screen 승인 상태 요약

| Screen ID | Route | Stitch 승인 화면 ID | 검증 상태(`STITCH_VALIDATION_REPORT.md`) | 디자인 정본 |
|---|---|---|---|---|
| SCR-001 | `/` | `72967519ed3542f89d1aacf726bb2a8c`(Desktop), `e0421a1eafb54285a8e416b54664de5d`(Mobile) | PASS | `design-reference/D-001/DESIGN.md`(LOCKED) |
| SCR-002 | `/about` | `25abc0425c354dfbb865d6d73fe219ce`(정본, Desktop) | PASS(수정 반영 후) | 상동 |
| SCR-003 | `/travel-tools` | `193011d274cb4536bfedfe9df330d3ac`(Desktop), `d8cea87bdb0247f9a0c62ea332837632`(Mobile) | PASS | 상동 |
| SCR-004 | `/mates` | `0d36171b01de4567a734f7e2dbe68ca3`(Desktop) | PASS(수정 반영 후) | 상동 |
| SCR-005 | `/account` | `d9ced155cb31490daa897d6f981dbc21`(Desktop) | PASS | 상동 |

**전체 판정: 5개 Screen 모두 PASS.** SCR-002·SCR-004는 최초 검증에서 발견된 카피 위반
(방문 국가 수 미달·별점 배지, "매너온도" 평판 점수)을 승인 전 수정해 PASS로 전환했다
(수정 이력은 `STITCH_VALIDATION_REPORT.md` §6 참고).

### 미해결 행정 항목(설계 승인을 막지 않음, 배포 전 정리 필요)

| 항목 | 내용 | 조치 |
|---|---|---|
| SCR-002 Desktop 중복 화면 | `745aecb65dd84ee79c76d9c8763fb010`이 정본과 별도로 Stitch 프로젝트에 남아 있음(BLOCKED) | Stitch UI에서 수동 삭제 필요. 구현 시 정본(`25abc0425c354dfbb865d6d73fe219ce`)만 참조 |
| SCR-005 외부 URL 예시 명칭 | "Skyscanner"로 표기, SRS 기본값은 Google Flights | 다음 Stitch 수정 세션에서 명칭 교체 권장(비차단) |

---

## 3. 기존 SRS Route → 승인된 5 Screen 통합

| 기존 Route(Baseline SRS §3.5) | 기존 화면 | 통합 대상 | 통합 방식 |
|---|---|---|---|
| `/` | 홈 | SCR-001 | Route 유지 |
| `/destinations` | 전체 여행지 | SCR-001 | 국내/해외 탭 상태로 통합(별도 Route 없음) |
| `/destinations/domestic` | 국내 여행지 | SCR-001 | 상동 |
| `/destinations/overseas` | 해외 여행지 | SCR-001 | 상동 |
| `/destinations/[slug]` | 여행지 상세 | SCR-001 | 동일 화면 Drawer/Modal로 통합 |
| `/flights` | 비행기 찾기 | SCR-003 | "항공편" Tab으로 통합 |
| `/hotels` | 호텔 찾기 | SCR-003 | "숙소" Tab으로 통합 |
| `/mates` | 동행 모집글 목록 | SCR-004 | Route 유지 |
| `/mates/[id]` | 모집글 상세 | SCR-004 | 목록+상세 분할(Desktop)/Drawer(Mobile)로 통합 |
| `/mates/new` | 모집글 작성 | SCR-003 | "동행 구하기" Tab으로 통합 |
| `/safety` | 국가별 주의사항 목록 | SCR-001 | Card Grid Section으로 통합 |
| `/safety/[countryCode]` | 국가별 주의사항 상세 | SCR-001 | 동일 화면 Drawer/Modal로 통합 |
| `/about` | 대표 소개 | SCR-002 | Route 유지 |
| `/auth/*` | 가입·로그인·성인 확인 | SCR-005 | Guest Tab으로 통합 |
| `/my/*` | 내 글·참가 요청·차단 | SCR-005 | Member "내 활동" Tab으로 통합 |
| `/admin/*` | 콘텐츠·신고·설정 | SCR-005 | Admin Tab으로 통합(신고 상태·외부 URL 설정으로 축소, 콘텐츠 CRUD는 EXCLUDED) |

Route/Page Entry 상세 계약은 §4와 `design-reference/UI_CONTRACT.md`, 개정된 SRS Route
Inventory 전문은 `06_SRS_UIUX_REVISED.md` §2를 정본으로 한다.

---

## 4. UI Route Contract 요약

기계 판독용 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`
(`schema_version: traveler-screen-route-v1`)이다.

| Screen | Route | Page Entry | 구분 | Device |
|---|---|---|---|---|
| SCR-001 | `/` | `src/app/page.tsx` | 핵심 | Desktop 1440 + Mobile 390 |
| SCR-002 | `/about` | `src/app/about/page.tsx` | 보조 | Desktop 1440 |
| SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | 핵심 | Desktop 1440 + Mobile 390 |
| SCR-004 | `/mates` | `src/app/mates/page.tsx` | 핵심 | Desktop 1440 |
| SCR-005 | `/account` | `src/app/account/page.tsx` | 핵심 | Desktop 1440 |

- 5개 Screen 모두 `page_owner_task_required: true`, `preview_required: true`.
- `starter_template_forbidden: true`는 SCR-001에만 적용 — Next.js 기본 스캐폴드 문구를 남긴
  채 완료 처리하지 않는다.
- `technical_routes`(Screen 수 미포함): `src/app/auth/callback/route.ts`(인증 콜백),
  `src/app/api/**/route.ts`(API Route Handler), `src/app/not-found.tsx`(404),
  `src/app/error.tsx`(오류 경계).
- `required_navigation` 19건(공통 Header 내비게이션 5건 포함)이 화면 간 실제 이동 관계를
  기록한다 — 상세는 JSON 원본 및 `UI_CONTRACT.md` "다른 화면으로의 이동" 절 참고.
- 완료 조건(JSON `completion_checks`): Route 중복 없음, Page Entry 중복 없음, Screen 수 5,
  핵심 4(SCR-001/003/004/005)·보조 1(SCR-002) 구분 존재 — **모두 충족.**

---

## 5. 제외 기능(EXCLUDED) 선언

`PROJECT_SCOPE.md` 기준 REQ-FUNC 11건, REQ-NF 13건, 총 24건이 EXCLUDED다. 이 문서는 그
판정을 뒤집지 않으며, 5개 Screen 어디에도 다음 범주를 배치하지 않는다.

- 전체 콘텐츠 CMS(REQ-FUNC-055, 072, 074, 075)
- 미디어 업로드·라이선스 승인 워크플로(REQ-FUNC-073, REQ-NF-029)
- 범용 감사 로그(REQ-FUNC-042, 056, 076, REQ-NF-022, 032)
- 자동 백업·장애 알림·부하 테스트(REQ-NF-007~011, 019관련 수치 검증, 020, 021, 033)
- 외부 이메일 사업자 연동(REQ-FUNC-043은 Toast로 축소 구현)
- 통합검색·URL 공유·분석 이벤트 계측(REQ-FUNC-067, 069, 071)
- 개인정보 자기서비스 내보내기(REQ-NF-018)
- 기타 REQ-NF-024 자동 접근성 검사, REQ-NF-020 SLA 자동 트래킹

전체 24건의 REQ ID와 사유는 `PROJECT_SCOPE.md` §5~6, 개별 Screen 배치 여부는
`UIUX_TRACEABILITY.md`에서 `EXCLUDED`/`N/A`로 일관되게 확인할 수 있다.

---

## 6. Release Acceptance Criteria

UI/UX 설계 단계를 "승인 완료"로 선언하기 위한 조건이다. 코드 구현 단계의 완료 조건이
아니다(코드 구현 완료 조건은 Task 생성 시 별도로 정의한다).

| # | 기준 | 충족 여부 |
|---|---|---|
| 1 | SCR-001~005 5개 Screen 모두 Stitch 구조 검사 1~13 PASS | ✅ 충족 |
| 2 | 디자인 정본 `D-001/DESIGN.md`가 `LOCKED` 상태이고 토큰 외 임의 색상이 없음 | ✅ 충족 |
| 3 | `UI_CONTRACT.md`와 `SCREEN_ROUTE_CONTRACT.json`의 Screen ID/Route/Page Entry가 서로 일치 | ✅ 충족 |
| 4 | Route 중복 없음, Page Entry 중복 없음, Screen 수 정확히 5, 핵심 4·보조 1 구분 존재 | ✅ 충족(JSON `completion_checks`) |
| 5 | REQ-FUNC-001~080, REQ-NF-001~034 114건이 `UIUX_TRACEABILITY.md`에 삭제·중복 없이 각 1행씩 존재 | ✅ 충족 |
| 6 | EXCLUDED 24건이 어떤 Screen에도 재배치되지 않고 Screen/Route/Task/Test가 모두 `N/A`로 일관 기록 | ✅ 충족 |
| 7 | Task 열은 실제 Task가 생성되기 전까지 `PENDING_TASK_GENERATION`만 사용(허위 진행 상태 금지) | ✅ 충족 |
| 8 | 어떤 문서도 `src/app`의 미구현 Route를 "구현 완료"로 표기하지 않음 | ✅ 충족 |
| 9 | Playwright 핵심 Smoke Test 시나리오(`PROJECT_SCOPE.md` §7, 10개)가 승인된 Screen 흐름과 대응됨 | ✅ 충족 |
| 10 | Stitch 프로젝트의 미해결 행정 항목(SCR-002 중복 화면, SCR-005 URL 명칭)이 문서화되어 있음 | ✅ 충족(§2 참고, 배포 전 정리 필요) |

**판정: UI/UX 설계 단계 승인(APPROVED).** §2의 미해결 행정 항목 2건은 설계 승인 자체를
막지 않으나, 실제 배포 전 반드시 정리한다.

---

## 7. 다음 단계

1. `UIUX_TRACEABILITY.md`의 `Status = READY_FOR_TASK_GENERATION` 90건을 기준으로 구현
   Task를 생성하고 `Task` 열을 `PENDING_TASK_GENERATION`에서 실제 Task ID로 갱신한다.
2. SCR-001부터 순서대로 `src/app/page.tsx` 등 5개 Page Entry를 구현하고, 구현 완료 시점에만
   해당 행의 `Status`를 갱신한다(설계 승인 문서인 이 파일은 갱신 대상이 아니다).
3. Stitch 프로젝트의 SCR-002 중복 화면을 수동 삭제한다.
