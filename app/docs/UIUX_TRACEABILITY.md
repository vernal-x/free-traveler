# Free Traveler — UI/UX Traceability Matrix

**Document ID:** UIUXTRACE-TRAVEL-001
**기반 문서:** `02_SRS_BASELINE.md`, `PROJECT_SCOPE.md`, `03_UI_COVERAGE_ANALYSIS.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`
**대상:** 개발팀, QA, Product Owner
**상태:** Requirement ↔ Screen ↔ Route ↔ Task ↔ Test 통합 추적표

이 문서는 `REQ-FUNC-001~080`, `REQ-NF-001~034` 총 114건을 **한 건도 삭제하지 않고** 모두
기록하며, 각 요구사항을 승인된 5개 디자인 Screen(SCR-001~005)·Next.js Route·Page Entry와
연결한다. 이 문서에 적힌 상태는 **설계·계약 수준의 승인 상태**이며, 실제 코드 구현 여부를
의미하지 않는다 — `src/app`에는 아직 기본 Next.js 스캐폴드(`layout.tsx`, `page.tsx` 등 기본값)만
존재하고 5개 Route의 실제 페이지 구현은 시작되지 않았다. 따라서 이 문서 어디에도 "구현 완료",
"PASS(코드)" 같은 표현을 사용하지 않는다.

## 열(Column) 정의

| 열 | 의미 |
|---|---|
| **Requirement** | `02_SRS_BASELINE.md`의 요구사항 ID(변경·삭제 없음) |
| **Implementation Status** | `PROJECT_SCOPE.md`의 구현 범위 결정 — `IMPLEMENT` / `IMPLEMENT(축소)` / `EXCLUDED` |
| **Screen** | `03_UI_COVERAGE_ANALYSIS.md`에서 배치된 디자인 Screen(`SCR-001~005`), 화면 없이 전역 적용(`공통`), Screen으로 세지 않는 기술 Route(`기술 Route`), 또는 UI 요소가 없는 백엔드/운영 항목(`N/A(NON_UI)`/`N/A(OPERATIONS)`), EXCLUDED(`N/A(EXCLUDED)`) |
| **Route** | `SCREEN_ROUTE_CONTRACT.json` 기준 실제 Next.js Route |
| **Page Entry** | `SCREEN_ROUTE_CONTRACT.json` 기준 실제 파일 경로 |
| **Task** | 연결된 구현 Task ID. **Task를 아직 생성하지 않았으므로 IMPLEMENT 계열은 전부 `PENDING_TASK_GENERATION`**, EXCLUDED는 `N/A` |
| **Test** | `02_SRS_BASELINE.md` §5(REQ 접미사와 1:1 대응하는 `TC-FUNC-XXX`/`TC-NF-XXX`). **아직 실행되지 않음(NOT_RUN)** — EXCLUDED는 `N/A` |
| **Status** | 이 행의 작업 흐름 상태 — `READY_FOR_TASK_GENERATION`(설계 승인 완료, Task 생성 대기) 또는 `EXCLUDED`(구현 계획 없음) |

Route/Page Entry 매핑: SCR-001→`/`·`src/app/page.tsx`, SCR-002→`/about`·`src/app/about/page.tsx`,
SCR-003→`/travel-tools`·`src/app/travel-tools/page.tsx`, SCR-004→`/mates`·`src/app/mates/page.tsx`,
SCR-005→`/account`·`src/app/account/page.tsx`, 공통→`전 Route 공통`·`src/app/layout.tsx`,
기술 Route→`* (기술 Route)`·`src/app/not-found.tsx, src/app/error.tsx`.

---

## F1. Destination Guide (REQ-FUNC-001~010)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-001 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-001 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-002 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-002 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-003 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-003 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-004 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-004 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-005 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-005 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-006 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-006 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-007 | IMPLEMENT(축소) | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-007 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-008 | IMPLEMENT | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-FUNC-008 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-009 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-009 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-010 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-010 | READY_FOR_TASK_GENERATION |

## F2. Flight Link-out (REQ-FUNC-011~018)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-011 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-011 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-012 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-012 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-013 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-013 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-014 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-014 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-015 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-015 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-016 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-016 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-017 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-FUNC-017 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-018 | IMPLEMENT(축소) | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-018 | READY_FOR_TASK_GENERATION |

## F3. Hotel Link-out (REQ-FUNC-019~026)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-019 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-019 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-020 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-020 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-021 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-021 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-022 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-022 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-023 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-023 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-024 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-024 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-025 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-FUNC-025 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-026 | IMPLEMENT(축소) | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-026 | READY_FOR_TASK_GENERATION |

## F4. Travel Mate (REQ-FUNC-027~045)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-027 | IMPLEMENT | 공통(SCR-003/004/005) | 전 Route 공통 | src/app/layout.tsx | PENDING_TASK_GENERATION | TC-FUNC-027 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-028 | IMPLEMENT | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-028 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-029 | IMPLEMENT | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-029 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-030 | IMPLEMENT | SCR-004 | /mates | src/app/mates/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-030 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-031 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-031 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-032 | IMPLEMENT(축소) | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-032 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-033 | IMPLEMENT | SCR-004 | /mates | src/app/mates/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-033 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-034 | IMPLEMENT | SCR-004 | /mates | src/app/mates/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-034 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-035 | IMPLEMENT | SCR-004 | /mates | src/app/mates/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-035 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-036 | IMPLEMENT | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-036 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-037 | IMPLEMENT | SCR-004 | /mates | src/app/mates/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-037 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-038 | IMPLEMENT | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-038 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-039 | IMPLEMENT | SCR-004 | /mates | src/app/mates/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-039 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-040 | IMPLEMENT | SCR-004, SCR-005 | /mates, /account | src/app/mates/page.tsx, src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-040 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-041 | IMPLEMENT(축소) | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-041 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-042 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-043 | IMPLEMENT(축소) | 공통 | 전 Route 공통 | src/app/layout.tsx | PENDING_TASK_GENERATION | TC-FUNC-043 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-044 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-FUNC-044 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-045 | IMPLEMENT(축소) | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-045 | READY_FOR_TASK_GENERATION |

## F5. Country Safety (REQ-FUNC-046~056)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-046 | IMPLEMENT | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-FUNC-046 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-047 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-047 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-048 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-048 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-049 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-049 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-050 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-050 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-051 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-051 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-052 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-052 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-053 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-053 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-054 | IMPLEMENT | SCR-001, SCR-003 | /, /travel-tools | src/app/page.tsx, src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-054 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-055 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-056 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |

## F6. About free_traveler (REQ-FUNC-057~063)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-057 | IMPLEMENT | SCR-002 | /about | src/app/about/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-057 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-058 | IMPLEMENT | SCR-002 | /about | src/app/about/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-058 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-059 | IMPLEMENT | SCR-002 | /about | src/app/about/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-059 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-060 | IMPLEMENT | SCR-002 | /about | src/app/about/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-060 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-061 | IMPLEMENT(축소) | SCR-002 | /about | src/app/about/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-061 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-062 | IMPLEMENT | SCR-002 | /about | src/app/about/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-062 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-063 | IMPLEMENT | SCR-002 | /about | src/app/about/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-063 | READY_FOR_TASK_GENERATION |

## F7. Common, Admin, Governance (REQ-FUNC-064~080)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-064 | IMPLEMENT | 공통 | 전 Route 공통 | src/app/layout.tsx | PENDING_TASK_GENERATION | TC-FUNC-064 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-065 | IMPLEMENT | 공통 | 전 Route 공통 | src/app/layout.tsx | PENDING_TASK_GENERATION | TC-FUNC-065 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-066 | IMPLEMENT | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-066 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-067 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-068 | IMPLEMENT | SCR-001 | / | src/app/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-068 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-069 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-070 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-FUNC-070 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-071 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-072 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-073 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-074 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-075 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-076 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-FUNC-077 | IMPLEMENT | SCR-005 | /account | src/app/account/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-077 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-078 | IMPLEMENT | 기술 Route | * (기술 Route) | src/app/not-found.tsx, src/app/error.tsx | PENDING_TASK_GENERATION | TC-FUNC-078 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-079 | IMPLEMENT | 공통(NON_UI) | 전 Route 공통 | src/app/layout.tsx | PENDING_TASK_GENERATION | TC-FUNC-079 | READY_FOR_TASK_GENERATION |
| REQ-FUNC-080 | IMPLEMENT | SCR-003 | /travel-tools | src/app/travel-tools/page.tsx | PENDING_TASK_GENERATION | TC-FUNC-080 | READY_FOR_TASK_GENERATION |

---

## NF. Performance (REQ-NF-001~007)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-001 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-001 | READY_FOR_TASK_GENERATION |
| REQ-NF-002 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-002 | READY_FOR_TASK_GENERATION |
| REQ-NF-003 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-003 | READY_FOR_TASK_GENERATION |
| REQ-NF-004 | IMPLEMENT(축소) | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-004 | READY_FOR_TASK_GENERATION |
| REQ-NF-005 | IMPLEMENT(축소) | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-005 | READY_FOR_TASK_GENERATION |
| REQ-NF-006 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-006 | READY_FOR_TASK_GENERATION |
| REQ-NF-007 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |

## NF. Reliability and Recovery (REQ-NF-008~011)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-008 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-009 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-010 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-011 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |

## NF. Security and Privacy (REQ-NF-012~018)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-012 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-012 | READY_FOR_TASK_GENERATION |
| REQ-NF-013 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-013 | READY_FOR_TASK_GENERATION |
| REQ-NF-014 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-014 | READY_FOR_TASK_GENERATION |
| REQ-NF-015 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-015 | READY_FOR_TASK_GENERATION |
| REQ-NF-016 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-016 | READY_FOR_TASK_GENERATION |
| REQ-NF-017 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-017 | READY_FOR_TASK_GENERATION |
| REQ-NF-018 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |

## NF. Safety and Moderation (REQ-NF-019~022)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-019 | IMPLEMENT(축소) | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-019 | READY_FOR_TASK_GENERATION |
| REQ-NF-020 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-021 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-022 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |

## NF. Accessibility (REQ-NF-023~025)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-023 | IMPLEMENT | 공통(NON_UI) | 전 Route 공통 | src/app/layout.tsx | PENDING_TASK_GENERATION | TC-NF-023 | READY_FOR_TASK_GENERATION |
| REQ-NF-024 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-025 | IMPLEMENT | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-025 | READY_FOR_TASK_GENERATION |

## NF. Content, Freshness, SEO, Copyright (REQ-NF-026~030)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-026 | IMPLEMENT | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-026 | READY_FOR_TASK_GENERATION |
| REQ-NF-027 | IMPLEMENT | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-027 | READY_FOR_TASK_GENERATION |
| REQ-NF-028 | IMPLEMENT(축소) | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-028 | READY_FOR_TASK_GENERATION |
| REQ-NF-029 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-030 | IMPLEMENT | N/A(NON_UI) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-030 | READY_FOR_TASK_GENERATION |

## NF. Maintainability, Monitoring, Cost (REQ-NF-031~034)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-031 | IMPLEMENT | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-031 | READY_FOR_TASK_GENERATION |
| REQ-NF-032 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-033 | EXCLUDED | N/A(EXCLUDED) | N/A | N/A | N/A | N/A(EXCLUDED) | EXCLUDED |
| REQ-NF-034 | IMPLEMENT | N/A(OPERATIONS) | N/A | N/A | PENDING_TASK_GENERATION | TC-NF-034 | READY_FOR_TASK_GENERATION |

---

## 집계 검증

| 구분 | 건수 |
|---|---:|
| REQ-FUNC-001~080 | 80 |
| REQ-NF-001~034 | 34 |
| **합계(삭제 없음)** | **114** |
| Implementation Status = IMPLEMENT 계열(IMPLEMENT + IMPLEMENT(축소)) | 90 |
| Implementation Status = EXCLUDED | 24 |
| Status = READY_FOR_TASK_GENERATION | 90 |
| Status = EXCLUDED | 24 |
| Task = PENDING_TASK_GENERATION | 90 |
| Task = N/A(EXCLUDED) | 24 |

90 + 24 = 114로 `PROJECT_SCOPE.md`, `03_UI_COVERAGE_ANALYSIS.md`의 집계와 정확히 일치한다.
REQ-FUNC-040(차단)과 REQ-FUNC-054(안전정보 대체 아님 고지)는 2개 Screen에 걸쳐 있어 Screen/
Route/Page Entry 열에 두 값을 함께 표기했다(요구사항 개수 집계에는 각 1건으로만 반영).

## 주석

- REQ-FUNC-066(이메일 인증)의 UI(로그인/가입 폼)는 SCR-005에 있으나, Supabase 이메일 인증
  콜백 자체는 `src/app/auth/callback/route.ts`(기술 Route, Screen 미집계)에서 처리한다.
  `Page Entry` 열에는 사용자가 보는 화면 기준으로 `src/app/account/page.tsx`만 기록했다.
- 이 문서의 어떤 행도 "구현 완료"를 의미하지 않는다. `Task`가 실제 Task ID로 채워지고 코드가
  작성된 뒤에만 `Status`를 갱신한다(예: `IN_PROGRESS`, `IMPLEMENTED_PENDING_TEST`,
  `VERIFIED`) — 이 개정 체계는 Task 생성 시점에 별도로 정의한다.
