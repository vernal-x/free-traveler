# Wave Plan

**생성:** `scripts/build_waves.py` — 2026-09-16T12:47:58Z
**상태:** 정적 문서(사람이 직접 고쳐도 된다) — 실제 실행 순서는 이 표가 아니라 각 Task의 `Depends On`이 결정한다. 이 표는 "이 Wave에 무엇이 포함되는가"와 "어디서 사람이 멈춰서 Preview를 봐야 하는가"만 정의한다(`.claude/commands/run-wave.md`).

## Wave 그룹 요약

| Wave 그룹 | 설명 | Wave 수 | Task 수 |
|---|---|---|---|
| 1. Scaffold, 문서, Harness 확인 | (이 그룹에 해당하는 Task 없음 — Harness/입력 검증은 `scripts/validate_harness.py`·`scripts/validate_inputs.py`가 Wave 밖에서 수행) | 0 | 0 |
| 2. Airbnb 스타일 공통 UI, 정적 데이터, Layout |  | 3 | 10 |
| 3. Supabase Auth, 6개 Table, 기본 RLS |  | 3 | 6 |
| 4. SCR-001 메인 Component와 Page Owner |  | 4 | 9 |
| 5. SCR-002 대표 소개 Component와 Page Owner |  | 2 | 7 |
| 6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner |  | 4 | 7 |
| 7. SCR-004 동행 목록·상세·신청 Component와 Page Owner |  | 4 | 9 |
| 8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner |  | 4 | 8 |
| 9. Unit·Playwright·접근성·CI |  | 2 | 8 |
| 10. Vercel Preview와 Release 확인 |  | 1 | 1 |

## Wave별 Task 배정

| Wave ID | Task ID | Preview Checkpoint |
|---|---|---|
| W01 | DATA-DESTINATIONS |  |
| W01 | DATA-REPRESENTATIVE |  |
| W01 | DATA-SAFETY |  |
| W01 | TOOL-DESIGN-TOKENS |  |
| W01 | TOOL-POLICY-PAGES |  |
| W01 | TOOL-SEO-METADATA |  |
| W02 | SA-TOAST-NOTIFICATIONS |  |
| W02 | TOOL-CONTENT-VALIDATION-SCRIPT |  |
| W02 | TOOL-ERROR-NOTFOUND |  |
| W03 | TOOL-LAYOUT-SHELL |  |
| W04 | DB-SCHEMA-BASE |  |
| W05 | DB-ACCESS |  |
| W05 | DB-RLS-BASE |  |
| W05 | DB-SEED-BASE |  |
| W06 | AUTH-EMAIL-ADULT |  |
| W06 | TEST-RLS-BASIC |  |
| W07 | SA-FAVORITES-LOCALSTORAGE |  |
| W08 | CMP-SCR001-ABOUT-SUMMARY |  |
| W08 | CMP-SCR001-DESTINATION-GRIDS |  |
| W08 | CMP-SCR001-HERO |  |
| W08 | CMP-SCR001-SAFETY-GRID-DRAWER |  |
| W08 | CMP-SCR001-THEME-CHIPS |  |
| W09 | CMP-SCR001-DESTINATION-DRAWER |  |
| W09 | CMP-SCR001-MATE-TEASER |  |
| W10 | PAGE-SCR001 | YES |
| W11 | CMP-SCR002-COUNTRIES-CHIPS |  |
| W11 | CMP-SCR002-GALLERY |  |
| W11 | CMP-SCR002-HERO-STATS |  |
| W11 | CMP-SCR002-INTRO-PHILOSOPHY |  |
| W11 | CMP-SCR002-RECOMMEND-CTA |  |
| W11 | CMP-SCR002-TIMELINE |  |
| W12 | PAGE-SCR002 | YES |
| W13 | CMP-SCR003-INTRO-TABS |  |
| W14 | CMP-SCR003-DISCLOSURE-TIPS |  |
| W14 | CMP-SCR003-FLIGHT-FORM |  |
| W14 | CMP-SCR003-HOTEL-FORM |  |
| W14 | SA-MATE-POST |  |
| W15 | CMP-SCR003-MATE-COMPOSER |  |
| W16 | PAGE-SCR003 | YES |
| W17 | CMP-SCR004-FILTER-BAR |  |
| W17 | SA-BLOCK |  |
| W17 | SA-REPORT |  |
| W18 | CMP-SCR004-MATE-DETAIL |  |
| W18 | CMP-SCR004-MATE-LIST |  |
| W18 | CMP-SCR004-REPORT-BLOCK |  |
| W18 | SA-MATE-APPLICATION |  |
| W19 | CMP-SCR004-APPLY-FLOW |  |
| W20 | PAGE-SCR004 | YES |
| W21 | SA-EXTERNAL-URL-SETTINGS |  |
| W22 | CMP-SCR005-ADMIN-URL-SETTINGS |  |
| W22 | CMP-SCR005-GUEST-AUTH |  |
| W22 | SA-ACCOUNT-DELETE |  |
| W23 | CMP-SCR005-ADMIN-REPORTS |  |
| W23 | CMP-SCR005-MY-ACTIVITY |  |
| W23 | CMP-SCR005-PROFILE |  |
| W24 | PAGE-SCR005 | YES |
| W25 | E2E-PUBLIC-SMOKE |  |
| W25 | UNIT-CONTACT-DETECTION |  |
| W25 | UNIT-MATE-STATE |  |
| W25 | UNIT-TRAVEL-DATES |  |
| W26 | CI-PIPELINE |  |
| W26 | E2E-MATE-AUTH |  |
| W26 | E2E-TRAVEL-TOOLS |  |
| W26 | MANUAL-RESPONSIVE-A11Y-CHECK |  |
| W27 | RELEASE-VERCEL-SUPABASE-CHECK | YES |

## Wave 상세

| Wave ID | Wave 그룹 | Task 수 | Task ID 목록 | 크기 비고 |
|---|---|---|---|---|
| W01 | 2. Airbnb 스타일 공통 UI, 정적 데이터, Layout | 6 | DATA-DESTINATIONS, DATA-REPRESENTATIVE, DATA-SAFETY, TOOL-DESIGN-TOKENS, TOOL-POLICY-PAGES, TOOL-SEO-METADATA |  |
| W02 | 2. Airbnb 스타일 공통 UI, 정적 데이터, Layout | 3 | SA-TOAST-NOTIFICATIONS, TOOL-CONTENT-VALIDATION-SCRIPT, TOOL-ERROR-NOTFOUND | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W03 | 2. Airbnb 스타일 공통 UI, 정적 데이터, Layout | 1 | TOOL-LAYOUT-SHELL | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W04 | 3. Supabase Auth, 6개 Table, 기본 RLS | 1 | DB-SCHEMA-BASE | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W05 | 3. Supabase Auth, 6개 Table, 기본 RLS | 3 | DB-ACCESS, DB-RLS-BASE, DB-SEED-BASE | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W06 | 3. Supabase Auth, 6개 Table, 기본 RLS | 2 | AUTH-EMAIL-ADULT, TEST-RLS-BASIC | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W07 | 4. SCR-001 메인 Component와 Page Owner | 1 | SA-FAVORITES-LOCALSTORAGE | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W08 | 4. SCR-001 메인 Component와 Page Owner | 5 | CMP-SCR001-ABOUT-SUMMARY, CMP-SCR001-DESTINATION-GRIDS, CMP-SCR001-HERO, CMP-SCR001-SAFETY-GRID-DRAWER, CMP-SCR001-THEME-CHIPS |  |
| W09 | 4. SCR-001 메인 Component와 Page Owner | 2 | CMP-SCR001-DESTINATION-DRAWER, CMP-SCR001-MATE-TEASER | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W10 | 4. SCR-001 메인 Component와 Page Owner | 1 | PAGE-SCR001 | Page Owner 통합 Wave(규칙 4) — 정의상 단독 배치 |
| W11 | 5. SCR-002 대표 소개 Component와 Page Owner | 6 | CMP-SCR002-COUNTRIES-CHIPS, CMP-SCR002-GALLERY, CMP-SCR002-HERO-STATS, CMP-SCR002-INTRO-PHILOSOPHY, CMP-SCR002-RECOMMEND-CTA, CMP-SCR002-TIMELINE |  |
| W12 | 5. SCR-002 대표 소개 Component와 Page Owner | 1 | PAGE-SCR002 | Page Owner 통합 Wave(규칙 4) — 정의상 단독 배치 |
| W13 | 6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner | 1 | CMP-SCR003-INTRO-TABS | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W14 | 6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner | 4 | CMP-SCR003-DISCLOSURE-TIPS, CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM, SA-MATE-POST |  |
| W15 | 6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner | 1 | CMP-SCR003-MATE-COMPOSER | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W16 | 6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner | 1 | PAGE-SCR003 | Page Owner 통합 Wave(규칙 4) — 정의상 단독 배치 |
| W17 | 7. SCR-004 동행 목록·상세·신청 Component와 Page Owner | 3 | CMP-SCR004-FILTER-BAR, SA-BLOCK, SA-REPORT | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W18 | 7. SCR-004 동행 목록·상세·신청 Component와 Page Owner | 4 | CMP-SCR004-MATE-DETAIL, CMP-SCR004-MATE-LIST, CMP-SCR004-REPORT-BLOCK, SA-MATE-APPLICATION |  |
| W19 | 7. SCR-004 동행 목록·상세·신청 Component와 Page Owner | 1 | CMP-SCR004-APPLY-FLOW | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W20 | 7. SCR-004 동행 목록·상세·신청 Component와 Page Owner | 1 | PAGE-SCR004 | Page Owner 통합 Wave(규칙 4) — 정의상 단독 배치 |
| W21 | 8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner | 1 | SA-EXTERNAL-URL-SETTINGS | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W22 | 8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner | 3 | CMP-SCR005-ADMIN-URL-SETTINGS, CMP-SCR005-GUEST-AUTH, SA-ACCOUNT-DELETE | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W23 | 8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner | 3 | CMP-SCR005-ADMIN-REPORTS, CMP-SCR005-MY-ACTIVITY, CMP-SCR005-PROFILE | 선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선) |
| W24 | 8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner | 1 | PAGE-SCR005 | Page Owner 통합 Wave(규칙 4) — 정의상 단독 배치 |
| W25 | 9. Unit·Playwright·접근성·CI | 4 | E2E-PUBLIC-SMOKE, UNIT-CONTACT-DETECTION, UNIT-MATE-STATE, UNIT-TRAVEL-DATES |  |
| W26 | 9. Unit·Playwright·접근성·CI | 4 | CI-PIPELINE, E2E-MATE-AUTH, E2E-TRAVEL-TOOLS, MANUAL-RESPONSIVE-A11Y-CHECK |  |
| W27 | 10. Vercel Preview와 Release 확인 | 1 | RELEASE-VERCEL-SUPABASE-CHECK | 배포 직전 Release Checkpoint Wave — 정의상 단독 배치 |
