# Free Traveler — UI Coverage Analysis

**Document ID:** UICOV-TRAVEL-001
**기반 문서:** `02_SRS_BASELINE.md`, `PROJECT_SCOPE.md`
**대상:** 디자인, 프론트엔드, QA
**상태:** Draft for Design Handoff

---

## 1. 개요

본 문서는 REQ-FUNC-001~080, REQ-NF-001~034 전체 114건을 5개 디자인 Screen에 배치하고, 각 요구사항이 UI로 어떻게 드러나는지(UI_DIRECT / UI_STATE / NON_UI / OPERATIONS)와 `PROJECT_SCOPE.md`의 구현 여부(IMPLEMENT / IMPLEMENT(축소) / EXCLUDED)를 함께 기록한다. 어떤 요구사항도 삭제하지 않으며, EXCLUDED 항목은 화면에 배치하지 않고 "미배치(EXCLUDED)"로 표기한다.

### 1-1. 분류 기준

| 분류 | 정의 |
|---|---|
| **UI_DIRECT** | 화면에서 사용자가 직접 보거나 조작하는 요소(폼, 버튼, 패널, 배지, 목록)로 구현된다 |
| **UI_STATE** | 새로운 화면 요소는 아니지만 기존 UI의 상태·동작(검증 오류, 활성/비활성, 계산된 배지, 세션 유지)을 결정한다 |
| **NON_UI** | 화면에 독립된 요소로 드러나지 않는 백엔드·데이터·보안·성능 구현이다 |
| **OPERATIONS** | 제품 UI가 아니라 운영·거버넌스·테스트·모니터링·비용 프로세스에 속한다 |

### 1-2. 디자인 Screen 고정 목록

| Screen ID | Route | 명칭 |
|---|---|---|
| SCR-001 | `/` | 메인 |
| SCR-002 | `/about` | 대표 소개 |
| SCR-003 | `/travel-tools` | 통합 여행 준비 |
| SCR-004 | `/mates` | 동행 조회 |
| SCR-005 | `/account` | 계정·관리 |

API Route, 인증 콜백(`/auth/callback` 등), 404/500/오류 처리 라우트는 기술 Route로 간주하며 위 5개 핵심 디자인 Screen 수에 포함하지 않는다. 이용약관·개인정보처리방침 등 정적 정책 문서는 footer에서 접근하는 비핵심 정적 페이지로 5개 Screen 수와 별도로 존재한다.

---

## 2. Screen 정의

### SCR-001 `/` 메인

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 국내·해외 여행지를 탐색해 후보를 좁히고, 필요 시 국가 안전정보까지 이어서 확인한다 |
| 주요 영역 | 전역 nav/footer, 국내·해외 탭, 검색·필터 바(국가·도시·계절·테마·기간), 여행지 카드 목록, 빈 결과 안내, **여행지 상세 Drawer/Modal**(소개·명소·일정·예산·교통·음식·에티켓·출처·즐겨찾기·관련 여행지), **국가 안전정보 Drawer/Modal**(8개 카테고리·경보 범위·stale 배지·출처 링크·긴급연락처) |
| 상태 | 필터 적용/미적용, 검색 결과 있음/없음, 상세 Drawer 열림 대상(여행지 vs 안전정보), 즐겨찾기 토글 on/off, 안전정보 stale/정상, URL query 필터 복원 |
| 이동 목적지 | 안전정보 Drawer 내 외교부 원문 링크(외부 새 탭), 관련 여행지 카드(같은 Drawer 재오픈), 항공/호텔/동행 CTA → SCR-003 / SCR-004, 대표 소개 nav → SCR-002, 로그인 nav → SCR-005 |

### SCR-002 `/about` 대표 소개

| 항목 | 내용 |
|---|---|
| 사용자 목표 | free_traveler의 여행 경험·철학·편집 기준을 확인해 콘텐츠 신뢰도를 판단한다 |
| 주요 영역 | 히어로 이미지+한 줄 소개, `50+ Trips`/`30+ Countries` 수치 카드, 여행 철학·편집 원칙, 방문 국가 목록, 여행 타임라인, 추천 여행지 6곳, 문의·SNS 링크 |
| 상태 | 정적 콘텐츠 중심(별도 인터랙션 상태 최소), 로딩 상태만 존재 |
| 이동 목적지 | 추천 여행지 카드 → SCR-001 상세 Drawer, 문의·SNS → 외부 링크 |

### SCR-003 `/travel-tools` 통합 여행 준비

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 항공·숙소 조건을 정리해 외부 사이트로 이동하거나, 새 동행 모집글을 작성한다 |
| 주요 영역 | 3개 탭(항공 / 숙소 / 동행 작성), 항공·숙소 각각 입력 폼 → 요약 → 비전달 고지 → 외부 이동 버튼, 동행 작성 폼(제목·국가·지역·기간·인원·조건·설명·연락처 탐지 오류·안전수칙 동의) |
| 상태 | 탭 선택, 필드별 검증 오류/통과, 요약 표시 여부, 외부 URL 오류 상태, 동행 작성 시 미인증/미성년 상태(로그인·성인확인 유도로 전환) |
| 이동 목적지 | 항공/숙소 요약 → 외부 사이트 새 탭(google flights/booking.com), 동행 작성 완료 → SCR-004(작성한 글 상세 패널), 미인증 시 → SCR-005 로그인 탭 |

### SCR-004 `/mates` 동행 조회

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 조건이 맞는 동행 모집글을 찾아 참가를 요청한다 |
| 주요 영역 | 필터(국가·지역·기간 겹침·연령대·성별·스타일·모집 상태), 모집글 목록 카드, **동행 상세 패널**(작성자·조건·설명·모집 상태 배지·참가 요청 폼·신고/차단 진입점) |
| 상태 | 필터 적용 상태, 모집중/자동마감(CLOSED) 배지 계산, 참가 요청 제출 전/PENDING/중복 차단 오류, 신고 접수 완료 토스트 |
| 이동 목적지 | 새 글 작성 → SCR-003 동행 작성 탭, 로그인 필요 시 → SCR-005, 내가 쓴 글의 요청 관리 → SCR-005 내 활동 탭 |

### SCR-005 `/account` 계정·관리

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 로그인 상태를 관리하고 내 프로필·내 활동(글·요청·차단)을 확인하며, 권한이 있으면 신고 상태와 외부 URL을 관리한다 |
| 주요 영역 | 4개 탭(로그인·가입·성인확인 / 프로필 / 내 활동 / 간단 관리자), 내 활동 하위(내가 쓴 글 관리·받은 참가요청 승인거절·보낸 참가요청·차단 목록), 관리자 하위(신고 목록+상태 필터+상태 변경, 외부 URL 설정 폼), 탈퇴 |
| 상태 | 로그인/로그아웃, 성인확인 완료/미완료, 역할(일반회원/Moderator/Admin)에 따른 관리자 탭 노출 여부, 각 목록의 빈 상태 |
| 이동 목적지 | 내 글/요청 항목 → SCR-004 상세 패널, 로그아웃 → SCR-001 |

---

## 3. 요구사항 매핑 — 기능 요구사항 (REQ-FUNC-001~080)

### 3.1 F1. Destination Guide (001~010)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-FUNC-001 | IMPLEMENT | UI_DIRECT | SCR-001 | 국내/해외 탭 |
| REQ-FUNC-002 | IMPLEMENT | UI_DIRECT | SCR-001 | 필터 바 |
| REQ-FUNC-003 | IMPLEMENT | UI_DIRECT | SCR-001 | 검색창 |
| REQ-FUNC-004 | IMPLEMENT | UI_DIRECT | SCR-001 | 여행지 상세 Drawer/Modal |
| REQ-FUNC-005 | IMPLEMENT | UI_DIRECT | SCR-001 | 빈 결과 안내 |
| REQ-FUNC-006 | IMPLEMENT | UI_DIRECT | SCR-001 | 상세 Drawer → 안전정보 Drawer 연결 |
| REQ-FUNC-007 | IMPLEMENT(축소) | UI_STATE | SCR-001 | 이미지 alt 속성 + 축소된 캡션 |
| REQ-FUNC-008 | IMPLEMENT | OPERATIONS | 미배치 | 출시 전 콘텐츠 수량 게이트, 화면 요소 아님 |
| REQ-FUNC-009 | IMPLEMENT | UI_DIRECT | SCR-001 | 상세 Drawer 내 관련 여행지 카드 |
| REQ-FUNC-010 | IMPLEMENT | UI_STATE | SCR-001 | 필터 URL 상태 유지 |

### 3.2 F2. Flight Link-out (011~018)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-FUNC-011 | IMPLEMENT | UI_DIRECT | SCR-003 | 항공 탭 입력 폼 |
| REQ-FUNC-012 | IMPLEMENT | UI_STATE | SCR-003 | 국가별 지역 옵션 종속 |
| REQ-FUNC-013 | IMPLEMENT | UI_STATE | SCR-003 | 날짜 검증 오류 상태 |
| REQ-FUNC-014 | IMPLEMENT | UI_DIRECT | SCR-003 | 요약 표시 영역 |
| REQ-FUNC-015 | IMPLEMENT | UI_DIRECT | SCR-003 | 비전달 고지 문구 |
| REQ-FUNC-016 | IMPLEMENT | UI_DIRECT | SCR-003 | 외부 이동 버튼 |
| REQ-FUNC-017 | IMPLEMENT | NON_UI | 미배치 | 서버 미저장 규칙 |
| REQ-FUNC-018 | IMPLEMENT(축소) | UI_DIRECT | SCR-003 | 외부 URL 오류 UI |

### 3.3 F3. Hotel Link-out (019~026)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-FUNC-019 | IMPLEMENT | UI_DIRECT | SCR-003 | 숙소 탭 입력 폼 |
| REQ-FUNC-020 | IMPLEMENT | UI_STATE | SCR-003 | 국가별 지역 옵션 종속 |
| REQ-FUNC-021 | IMPLEMENT | UI_STATE | SCR-003 | 날짜 검증 오류 상태 |
| REQ-FUNC-022 | IMPLEMENT | UI_DIRECT | SCR-003 | 요약 표시 영역 |
| REQ-FUNC-023 | IMPLEMENT | UI_DIRECT | SCR-003 | 비전달 고지 문구 |
| REQ-FUNC-024 | IMPLEMENT | UI_DIRECT | SCR-003 | 외부 이동 버튼 |
| REQ-FUNC-025 | IMPLEMENT | NON_UI | 미배치 | 서버 미저장 규칙 |
| REQ-FUNC-026 | IMPLEMENT(축소) | UI_DIRECT | SCR-003 | 외부 URL 오류 UI |

### 3.4 F4. Travel Mate (027~045)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-FUNC-027 | IMPLEMENT | UI_STATE | 공통(SCR-003/004/005) | 미인증 시 로그인 리다이렉트 |
| REQ-FUNC-028 | IMPLEMENT | UI_DIRECT | SCR-005 | 로그인·가입 탭 내 성인확인 단계 |
| REQ-FUNC-029 | IMPLEMENT | UI_DIRECT | SCR-005 | 프로필 탭 입력 폼 |
| REQ-FUNC-030 | IMPLEMENT | UI_DIRECT | SCR-004 | 동행 목록 필터 |
| REQ-FUNC-031 | IMPLEMENT | UI_DIRECT | SCR-003 | 동행 작성 탭 폼 |
| REQ-FUNC-032 | IMPLEMENT(축소) | UI_STATE | SCR-003 | 연락처 탐지 시 제출 차단 오류 |
| REQ-FUNC-033 | IMPLEMENT | UI_DIRECT | SCR-004 | 목록·상세 표시 요소(연락처 비노출) |
| REQ-FUNC-034 | IMPLEMENT | UI_DIRECT | SCR-004 | 상세 패널 참가 요청 폼 |
| REQ-FUNC-035 | IMPLEMENT | UI_STATE | SCR-004 | 중복 요청 오류 상태 |
| REQ-FUNC-036 | IMPLEMENT | UI_DIRECT | SCR-005 | 내 활동 탭 승인/거절 버튼 |
| REQ-FUNC-037 | IMPLEMENT | UI_STATE | SCR-004 | 모집중/CLOSED 배지 계산(조회 시) |
| REQ-FUNC-038 | IMPLEMENT | UI_DIRECT | SCR-005 | 내 활동 탭 내 글 마감/수정/삭제 |
| REQ-FUNC-039 | IMPLEMENT | UI_DIRECT | SCR-004 | 상세 패널 신고 진입 폼 |
| REQ-FUNC-040 | IMPLEMENT | UI_DIRECT | SCR-004(차단 실행) / SCR-005(차단 목록 관리) | 진입은 상세 패널, 관리는 내 활동 탭 |
| REQ-FUNC-041 | IMPLEMENT(축소) | UI_DIRECT | SCR-005 | 간단 관리자 탭 신고 목록(상태 필터만) |
| REQ-FUNC-042 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 개별 제재(경고·숨김·정지) 조치 |
| REQ-FUNC-043 | IMPLEMENT(축소) | UI_DIRECT | 공통(주로 SCR-004/005) | Toast/화면 상태 알림 |
| REQ-FUNC-044 | IMPLEMENT | NON_UI | 미배치 | Supabase RLS |
| REQ-FUNC-045 | IMPLEMENT(축소) | UI_DIRECT | SCR-005 | 탈퇴 버튼(즉시 비식별화) |

### 3.5 F5. Country Safety (046~056)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-FUNC-046 | IMPLEMENT | OPERATIONS | 미배치 | 해외국가 안전페이지 커버리지 게이트 |
| REQ-FUNC-047 | IMPLEMENT | UI_DIRECT | SCR-001 | 안전정보 Drawer 8개 카테고리 섹션 |
| REQ-FUNC-048 | IMPLEMENT | UI_DIRECT | SCR-001 | 출처·확인일 표시 |
| REQ-FUNC-049 | IMPLEMENT | UI_DIRECT | SCR-001 | 외교부 원문 링크 |
| REQ-FUNC-050 | IMPLEMENT | UI_STATE | SCR-001 | stale 경고 배지(렌더링 시 계산) |
| REQ-FUNC-051 | IMPLEMENT | UI_DIRECT | SCR-001 | 중대 경보 상단 텍스트 |
| REQ-FUNC-052 | IMPLEMENT | UI_DIRECT | SCR-001 | 국가/지역 범위 구분 표시 |
| REQ-FUNC-053 | IMPLEMENT | UI_DIRECT | SCR-001 | 긴급연락처 영역 |
| REQ-FUNC-054 | IMPLEMENT | UI_DIRECT | SCR-001, SCR-003 | 대체 아님 고지(안전 Drawer+항공 요약) |
| REQ-FUNC-055 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | Editor 작성·검수·게시 워크플로 |
| REQ-FUNC-056 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 안전정보 변경 이력 DB 관리 |

### 3.6 F6. About free_traveler (057~063)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-FUNC-057 | IMPLEMENT | UI_DIRECT | SCR-002 | 대표명/수치 카드 |
| REQ-FUNC-058 | IMPLEMENT | UI_DIRECT | SCR-002 | 소개문·철학 영역 |
| REQ-FUNC-059 | IMPLEMENT | UI_DIRECT | SCR-002 | 방문 국가 목록 |
| REQ-FUNC-060 | IMPLEMENT | UI_DIRECT | SCR-002 | 타임라인 |
| REQ-FUNC-061 | IMPLEMENT(축소) | UI_STATE | SCR-002 | 대표 이미지 alt+축소 캡션 |
| REQ-FUNC-062 | IMPLEMENT | UI_DIRECT | SCR-002 | 문의·SNS 링크 |
| REQ-FUNC-063 | IMPLEMENT | UI_DIRECT | SCR-002 | 추천 여행지 6개 카드 |

### 3.7 F7. Common, Admin, Governance (064~080)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-FUNC-064 | IMPLEMENT | UI_DIRECT | 공통(전 화면) | 전역 nav/footer |
| REQ-FUNC-065 | IMPLEMENT | UI_STATE | 공통(전 화면) | 반응형 레이아웃 적응 |
| REQ-FUNC-066 | IMPLEMENT | UI_DIRECT | SCR-005 | 로그인·가입·로그아웃·재설정 폼(콜백은 기술 Route) |
| REQ-FUNC-067 | EXCLUDED | UI_DIRECT | 미배치(EXCLUDED) | 통합검색(여행지+안전) |
| REQ-FUNC-068 | IMPLEMENT | UI_DIRECT | SCR-001 | 즐겨찾기 토글(localStorage) |
| REQ-FUNC-069 | EXCLUDED | UI_DIRECT | 미배치(EXCLUDED) | URL 공유 |
| REQ-FUNC-070 | IMPLEMENT | NON_UI | 미배치 | 페이지 메타데이터(비가시) |
| REQ-FUNC-071 | EXCLUDED | NON_UI | 미배치(EXCLUDED) | 분석 이벤트 계측 |
| REQ-FUNC-072 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 콘텐츠 CMS CRUD |
| REQ-FUNC-073 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 미디어 업로드 워크플로 |
| REQ-FUNC-074 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 게시 완전성 게이트(런타임 워크플로) |
| REQ-FUNC-075 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | stale 대시보드 |
| REQ-FUNC-076 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 범용 감사 로그 |
| REQ-FUNC-077 | IMPLEMENT | UI_DIRECT | SCR-005 | 관리자 외부 URL 설정 폼 |
| REQ-FUNC-078 | IMPLEMENT | UI_DIRECT | 기술 Route(비집계, 전역) | 404/500/권한없음/실패 화면 |
| REQ-FUNC-079 | IMPLEMENT | NON_UI | 공통(전 화면) | ARIA 속성(비가시) |
| REQ-FUNC-080 | IMPLEMENT | UI_DIRECT | SCR-003(동의 체크박스), 정적 정책 페이지(비핵심) | 약관·안전수칙 동의 |

---

## 4. 요구사항 매핑 — 비기능 요구사항 (REQ-NF-001~034)

### 4.1 Performance (001~007)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-NF-001 | IMPLEMENT | NON_UI | 미배치 | LCP 목표 |
| REQ-NF-002 | IMPLEMENT | NON_UI | 미배치 | INP 목표 |
| REQ-NF-003 | IMPLEMENT | NON_UI | 미배치 | CLS 목표 |
| REQ-NF-004 | IMPLEMENT(축소) | NON_UI | 미배치 | 필터 응답 속도(부하테스트 미실시) |
| REQ-NF-005 | IMPLEMENT(축소) | NON_UI | 미배치 | 쓰기 API 응답 속도(부하테스트 미실시) |
| REQ-NF-006 | IMPLEMENT | NON_UI | 미배치 | 이미지 최적화 기법 |
| REQ-NF-007 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | Lighthouse CI 게이트 |

### 4.2 Reliability and Recovery (008~011)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-NF-008 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 가동률 모니터링 |
| REQ-NF-009 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 5xx 비율 모니터링 |
| REQ-NF-010 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 자동 백업 RPO/RTO |
| REQ-NF-011 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 링크 자동 점검+알림 |

### 4.3 Security and Privacy (012~018)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-NF-012 | IMPLEMENT | NON_UI | 미배치 | TLS 1.2+ |
| REQ-NF-013 | IMPLEMENT | NON_UI | 미배치 | 인증·역할·RLS 서버 검증 |
| REQ-NF-014 | IMPLEMENT | NON_UI | 미배치 | CSRF/SameSite |
| REQ-NF-015 | IMPLEMENT | NON_UI | 미배치 | 입력 검증/XSS 방지 |
| REQ-NF-016 | IMPLEMENT | NON_UI | 미배치 | 비밀키 환경변수 관리 |
| REQ-NF-017 | IMPLEMENT | NON_UI | 미배치 | 항공·호텔 원시입력 미보존 |
| REQ-NF-018 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 개인정보 내보내기(삭제는 FUNC-045로 대체) |

### 4.4 Safety and Moderation (019~022)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-NF-019 | IMPLEMENT(축소) | NON_UI | 미배치 | 신고 접수 응답 속도 |
| REQ-NF-020 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 신고 1차 검토 SLA 트래킹 |
| REQ-NF-021 | EXCLUDED | NON_UI | 미배치(EXCLUDED) | 속도 제한(rate limiting) |
| REQ-NF-022 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | Moderator 조치 추적성(감사로그) |

### 4.5 Accessibility (023~025)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-NF-023 | IMPLEMENT | NON_UI | 공통(전 화면) | WCAG 2.2 AA 설계 원칙 |
| REQ-NF-024 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 자동 접근성 검사(axe) |
| REQ-NF-025 | IMPLEMENT | OPERATIONS | 미배치 | 수동 키보드/스크린리더 검사 프로세스 |

### 4.6 Content, Freshness, SEO, Copyright (026~030)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-NF-026 | IMPLEMENT | OPERATIONS | 미배치 | 여행지 콘텐츠 완전성 게이트 |
| REQ-NF-027 | IMPLEMENT | OPERATIONS | 미배치 | 안전정보 커버리지 게이트 |
| REQ-NF-028 | IMPLEMENT(축소) | OPERATIONS | 미배치 | 안전정보 최신성 운영 목표(경고 UI는 FUNC-050) |
| REQ-NF-029 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 라이선스 메타데이터 100% |
| REQ-NF-030 | IMPLEMENT | NON_UI | 미배치 | SEO 메타데이터 누락 0건(FUNC-070과 연계) |

### 4.7 Maintainability, Monitoring, Cost (031~034)

| ID | PROJECT_SCOPE | UI 분류 | 배치 화면 | 비고 |
|---|---|---|---|---|
| REQ-NF-031 | IMPLEMENT | OPERATIONS | 미배치 | TS strict/lint/unit test 병합 게이트 |
| REQ-NF-032 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 구조화 로그 체계 |
| REQ-NF-033 | EXCLUDED | OPERATIONS | 미배치(EXCLUDED) | 핵심 오류 자동 알림 |
| REQ-NF-034 | IMPLEMENT | OPERATIONS | 미배치 | 월 인프라 비용 목표 |

---

## 5. 검증

### 5-1. 요구사항 총수 확인

| 구분 | 건수 |
|---|---:|
| REQ-FUNC-001~080 | 80 |
| REQ-NF-001~034 | 34 |
| **합계** | **114** |

REQ-FUNC-001부터 080까지, REQ-NF-001부터 034까지 각 ID가 위 표에 정확히 1회씩 등장하며 삭제되거나 누락된 항목이 없다.

### 5-2. UI 분류별 통계

| 분류 | FUNC | NF | 합계 |
|---|---:|---:|---:|
| UI_DIRECT | 51 | 0 | 51 |
| UI_STATE | 13 | 0 | 13 |
| NON_UI | 6 | 16 | 22 |
| OPERATIONS | 10 | 18 | 28 |
| **합계** | **80** | **34** | **114** |

### 5-3. PROJECT_SCOPE 분류별 통계

| 분류 | FUNC | NF | 합계 |
|---|---:|---:|---:|
| IMPLEMENT 계열(IMPLEMENT + IMPLEMENT(축소)) | 69 | 21 | 90 |
| EXCLUDED | 11 | 13 | 24 |
| **합계** | **80** | **34** | **114** |

`PROJECT_SCOPE.md`의 집계(IMPLEMENT 90건, EXCLUDED 24건)와 일치한다.

### 5-4. Screen별 배치 건수(UI_DIRECT + UI_STATE 중 화면 지정된 항목)

| Screen | 배치된 요구사항 수 |
|---|---:|
| SCR-001 `/` | 18 |
| SCR-002 `/about` | 7 |
| SCR-003 `/travel-tools` | 18 |
| SCR-004 `/mates` | 7 |
| SCR-005 `/account` | 9 |
| 공통(전 화면 횡단) | 4 |
| 기술 Route(비집계) | 1 |
| 미배치(NON_UI/OPERATIONS/EXCLUDED 64건 중 UI_DIRECT/UI_STATE이나 EXCLUDED라 화면 배치하지 않은 2건 포함) | 52 |

> REQ-FUNC-040(차단)은 SCR-004·SCR-005에, REQ-FUNC-054(대체 아님 고지)는 SCR-001·SCR-003에 중복 배치되어 있어 위 표의 합(116)은 총 요구사항 수(114)보다 2건 많다. 핵심 디자인 Screen은 SCR-001~005 5개로 고정되며 이를 초과하는 화면은 생성하지 않았다.
