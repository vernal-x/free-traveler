# SRS Revision — UI/UX 화면 통합 반영 (Free Traveler)

**Document ID:** SRS-TRAVEL-001-REV-UIUX
**기반 문서:** `02_SRS_BASELINE.md`(Baseline, 변경 없음), `PROJECT_SCOPE.md`, `03_UI_COVERAGE_ANALYSIS.md`,
`design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `05_UIUX_APPROVED.md`
**대상:** 개발팀, QA, Product Owner
**상태:** SRS Baseline에 대한 부분 개정(Route/Page Inventory 한정)

---

## 1. 목적과 개정 범위

`02_SRS_BASELINE.md`는 여전히 **요구사항의 원본(Baseline)**이며 이 문서로 대체되지 않는다.
본 개정 문서는 오직 아래 두 가지만 변경한다.

1. **§3.5 Page and Route Inventory** — 기존에 나열된 다중 Public Route(`/destinations/*`,
   `/flights`, `/hotels`, `/mates/*`, `/safety/*`, `/auth/*`, `/my/*`, `/admin/*` 등)를 승인된
   **5개 디자인 Screen**(SCR-001~005)의 Route/Tab/Drawer/Modal 구조로 통합한다.
2. **개별 요구사항의 "구현 위치" 참조** — 각 REQ-FUNC/REQ-NF가 어느 Screen·Route·Page Entry에
   대응하는지를 `UIUX_TRACEABILITY.md`에 위임한다.

**변경하지 않는 것**: 요구사항 ID·문구·우선순위(M/S/C)·수용 기준(AC)·비기능 목표치, §2
Stakeholders/Role Permission Matrix, §4 Data Model, §5.1/§5.2 Traceability(REQ↔TC 접미사
대응 규칙)는 Baseline SRS를 그대로 따른다. `PROJECT_SCOPE.md`의 IMPLEMENT/EXCLUDED 판정도
변경하지 않는다.

---

## 2. Revised Page and Route Inventory (Baseline §3.5 대체)

| Screen ID | Route | Page Entry | 통합된 기존 Route | 통합 방식 |
|---|---|---|---|---|
| SCR-001 | `/` | `src/app/page.tsx` | `/`, `/destinations`, `/destinations/domestic`, `/destinations/overseas`, `/destinations/[slug]`, `/safety`, `/safety/[countryCode]` | 목록·필터는 Section 상태로, 상세는 같은 화면의 Drawer/Modal로 통합(별도 Route 없음) |
| SCR-002 | `/about` | `src/app/about/page.tsx` | `/about` | Route 그대로 유지 |
| SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | `/flights`, `/hotels`, `/mates/new` | 항공·숙소·동행 작성을 3개 Tab으로 통합(각 Tab 독립 상태) |
| SCR-004 | `/mates` | `src/app/mates/page.tsx` | `/mates`, `/mates/[id]` | 상세를 Desktop 목록+상세 분할 / Mobile Drawer로 통합(별도 Route 없음) |
| SCR-005 | `/account` | `src/app/account/page.tsx` | `/auth/*`, `/my/*`, `/admin/*` | 인증(Guest)·프로필·내 활동(Member)·간단 관리자(Admin)를 역할별 Tab으로 통합 |

### 기술 Route (Screen 수에 포함하지 않음)

| 유형 | Route/Path | 비고 |
|---|---|---|
| 인증 콜백 | `src/app/auth/callback/route.ts` | Supabase 이메일 인증 콜백 |
| API Route Handler | `src/app/api/**/route.ts` | 신고 접수 등 최소 범위 서버 로직. 항공·호텔 폼은 API를 만들지 않음(Baseline §6.1 각주 유지) |
| 404 | `src/app/not-found.tsx` | 전역 |
| 오류 경계 | `src/app/error.tsx` | 전역 |

상세 근거와 Section 구성, 화면 간 이동 관계는 `design-reference/UI_CONTRACT.md`와
`design-reference/SCREEN_ROUTE_CONTRACT.json`을 정본으로 한다.

---

## 3. Role Permission Matrix 적용 방식 개정

Baseline §2.2 Role Permission Matrix(Guest/Adult Member/Editor/Moderator/Admin)의 **권한
내용은 변경하지 않는다.** 다만 이 권한이 화면에 드러나는 방식이 개정된다.

- 이전: `/my/*`, `/admin/*`가 별도 Route로 존재하고 역할별로 접근을 차단.
- 개정: SCR-005 하나의 Route(`/account`) 안에서 역할별 **Tab 노출 여부**로 표현한다. 권한이
  없는 Tab은 비활성화가 아니라 **아예 렌더링하지 않는다**(`SCREEN_ROUTE_CONTRACT.json`의
  `tab_visibility` 참고).
- Editor 역할이 담당하던 콘텐츠 CRUD(`/admin/destinations`, `/admin/safety`,
  `/admin/media`)는 `PROJECT_SCOPE.md`에 따라 **EXCLUDED**이므로 SCR-005에 어떤 형태로도
  포함하지 않는다. SCR-005의 Admin Tab은 "신고 상태 변경"과 "외부 URL 설정" 2가지로만
  축소된다(REQ-FUNC-041, REQ-FUNC-077).

---

## 4. 요구사항 보존 확인

REQ-FUNC-001~080, REQ-NF-001~034 **총 114건 전부가 Baseline SRS와 동일한 ID·개수로
보존된다.** 이 개정 문서는 어떤 요구사항도 삭제·재번호화하지 않았다.

| 구분 | Baseline 건수 | 본 개정 후 건수 | 차이 |
|---|---:|---:|---:|
| REQ-FUNC-001~080 | 80 | 80 | 0 |
| REQ-NF-001~034 | 34 | 34 | 0 |
| **합계** | **114** | **114** | **0** |

요구사항별 Implementation Status(IMPLEMENT/IMPLEMENT(축소)/EXCLUDED), 배치 Screen, Route,
Page Entry, Task, Test, 작업 상태의 **전체 매핑은 `UIUX_TRACEABILITY.md`에 114건 모두
1행씩 기록되어 있으며, 이 개정 문서에서 중복 기재하지 않는다.**

### EXCLUDED 요구사항 처리 방식

`PROJECT_SCOPE.md`에서 EXCLUDED로 판정된 24건(REQ-FUNC 11건, REQ-NF 13건)은 이 개정에서도
**ID와 원문이 그대로 남아 있으며 삭제되지 않는다.** 다만 어떤 Screen·Route·Tab에도 배치하지
않고, `UIUX_TRACEABILITY.md`에서 Screen/Route/Page Entry/Task/Test를 전부 `N/A`로 표기한다.
EXCLUDED 판정을 이 문서 또는 후속 문서에서 임의로 뒤집어 특정 Screen에 재배치하지 않는다.

---

## 5. 구현 상태 정직성 고지

이 개정 문서와 `UIUX_TRACEABILITY.md`는 **설계·라우트 계약**을 기록한 것이며, 코드
구현 완료를 의미하지 않는다.

- 현재 `src/app`에는 `layout.tsx`, `page.tsx`(기본 스캐폴드), `globals.css`, `favicon.ico`만
  존재하고, SCR-002~005에 해당하는 `about/`, `travel-tools/`, `mates/`, `account/` 디렉터리는
  아직 생성되지 않았다.
- `UIUX_TRACEABILITY.md`의 `Task` 열이 전부 `PENDING_TASK_GENERATION`인 것은 실제 구현
  Task가 아직 생성되지 않았기 때문이며, `Status` 열이 전부 `READY_FOR_TASK_GENERATION` 또는
  `EXCLUDED`인 것도 같은 이유다. 이 문서 어디에도 특정 요구사항이 "구현되었다"고 기록하지
  않는다.
- Stitch에서 승인된 5개 화면(`STITCH_VALIDATION_REPORT.md` 기준 전 항목 PASS)은 **디자인
  목업 승인**이며 Next.js 코드 구현과는 별개다.

---

## 6. 참고

- Route/Page/Section/컴포넌트 상세: `design-reference/UI_CONTRACT.md`
- 기계 판독용 Route 계약: `design-reference/SCREEN_ROUTE_CONTRACT.json`
- 요구사항별 구현 범위 판정 근거: `PROJECT_SCOPE.md`
- 요구사항의 UI 성격 분류(UI_DIRECT/UI_STATE/NON_UI/OPERATIONS): `03_UI_COVERAGE_ANALYSIS.md`
- 화면 승인 근거: `STITCH_VALIDATION_REPORT.md`, `design-reference/D-001/DESIGN.md`,
  `design-reference/DESIGN_MANIFEST.md`
- 전체 Requirement ↔ Screen ↔ Route ↔ Task ↔ Test 매핑: `UIUX_TRACEABILITY.md`
- 승인 선언과 Release Acceptance Criteria: `05_UIUX_APPROVED.md`
