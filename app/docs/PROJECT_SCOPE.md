# Free Traveler MVP — PROJECT_SCOPE

**Document ID:** SCOPE-TRAVEL-001
**기반 문서:** `01_PRD.md`, `02_SRS_BASELINE.md`, `package.json`, `src/app`
**대상:** 개발팀, QA, Product Owner
**상태:** Draft for Implementation

---

## 1. 목적

본 문서는 `01_PRD.md`, `02_SRS_BASELINE.md`에 정의된 요구사항 중 이번 구현 단계에서 **직접 구현하는 범위(IMPLEMENT)**와 **만들지 않는 범위(EXCLUDED)**를 요구사항 단위로 확정한다. REQ-FUNC-001~080, REQ-NF-001~034를 한 건도 누락 없이 기록하며, 각 항목에 분류·처리 방법·확인 방법을 명시한다.

현재 저장소 상태: `package.json`에는 Next.js 16 / React 19만 설치되어 있고 Supabase, Tailwind 컴포넌트 라이브러리, Playwright 등은 아직 추가되지 않았다. `src/app`은 `next dev`가 생성한 기본 스캐폴드(`layout.tsx`, `page.tsx`, `globals.css`)만 존재한다. 즉 본 문서는 그린필드 구현을 전제로 한다.

---

## 2. 반드시 직접 구현하는 범위

| # | 범위 |
|---|---|
| 1 | 핵심 화면 4개 + 보조 화면 1개 |
| 2 | 여행지 검색·필터와 상세 패널 |
| 3 | 국가 안전정보 패널 |
| 4 | free_traveler 대표 소개 |
| 5 | 항공·숙소 입력·검증·요약·외부 이동 |
| 6 | Supabase 이메일 인증과 성인 확인 |
| 7 | 동행글 작성·조회·수정·마감 |
| 8 | 참가 요청·승인·거절 |
| 9 | 간단한 차단·신고 |
| 10 | 내 활동과 간단한 관리자 탭 |
| 11 | Playwright 핵심 Smoke Test |
| 12 | Vercel 배포 |

### 2-1. 화면 구성 정의

| 구분 | 화면 | 포함 라우트(SRS 3.5 기준) | 비고 |
|---|---|---|---|
| 핵심 ① | 여행지 탐색 | `/destinations`, `/destinations/domestic`, `/destinations/overseas`, `/destinations/[slug]` | 국가 안전정보 패널을 상세 화면에 임베드, `/safety`, `/safety/[countryCode]`도 이 화면군에서 재사용 |
| 핵심 ② | 항공·호텔 찾기 | `/flights`, `/hotels` | 입력폼+요약을 같은 패턴으로 구현 |
| 핵심 ③ | 동행 찾기 | `/mates`, `/mates/[id]`, `/mates/new` | 참가 요청·승인·거절 포함 |
| 핵심 ④ | 내 활동 | `/my/*`(내 글·참가 요청·차단), `/admin/*`(신고 상태·외부 URL 설정만) | 관리자 탭은 `/my` 하위 또는 역할 기반 진입점으로 축소 구현 |
| 보조 | 대표 소개 | `/about` | 정적 콘텐츠 중심 |
| 공통 플로우 | 인증 | `/auth/*` | 화면 수 카운트에서 제외한 횡단 플로우, 모든 핵심 화면에서 진입 |

---

## 3. 구현 방식

| 방식 | 적용 대상 |
|---|---|
| 여행지·안전·대표 콘텐츠는 `src/data` 정적 데이터 | DESTINATION, DESTINATION_CONTENT, COUNTRY_SAFETY, REPRESENTATIVE_PROFILE |
| 즐겨찾기는 localStorage | REQ-FUNC-068 |
| 실제 이메일 알림은 Toast 또는 화면 상태 | REQ-FUNC-043 |
| 자동 마감은 조회 시 종료일 계산 | REQ-FUNC-037 (배치 잡 없이 read-time 계산) |
| 안전정보 stale은 렌더링 시 날짜 계산 | REQ-FUNC-050, REQ-NF-028 (배치 잡 없이 read-time 계산) |
| 이미지는 일반 인터넷 URL과 alt 텍스트만 사용 | REQ-FUNC-007, 061 (라이선스/작가 승인 워크플로 없음) |
| 관리자는 신고 상태와 외부 URL 설정만 다룸 | REQ-FUNC-041, 077 (그 외 관리자 기능은 EXCLUDED) |
| 동행 모집글·참가 요청·신고·차단은 Supabase DB(UGC) | 여행지/안전/대표와 달리 사용자 생성 데이터이므로 정적 데이터 대상 아님 |

---

## 4. 제외 기능

| 제외 항목 | 대응하는 요구사항 축소 |
|---|---|
| 전체 콘텐츠 CMS | REQ-FUNC-055, 072, 074, 075 |
| 미디어 업로드·라이선스 승인 워크플로 | REQ-FUNC-073, REQ-NF-029 |
| 범용 감사 로그 | REQ-FUNC-042, 056, 076, REQ-NF-022, 032 |
| 자동 백업·장애 알림·부하 테스트 | REQ-FUNC-018/026 일부, REQ-NF-004, 005, 007~011, 019, 020, 021, 033 |
| 외부 이메일 사업자 연동 | REQ-FUNC-043 (Toast로 대체) |
| EC2·AWS 인프라 | 해당 요구사항 없음(Vercel+Supabase로 대체, CON-13) |
| 무인 자동 Merge Runner | CI는 Playwright Smoke Test만 게이트로 사용, 자동 병합 없음 |

---

## 5. 요구사항 분류 — 기능 요구사항 (REQ-FUNC-001~080)

### 5.1 F1. Destination Guide

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-001 | IMPLEMENT | `src/data`의 `scope`(DOMESTIC/OVERSEAS) 필드로 탭 분리 렌더링 | Playwright 스모크 테스트 |
| REQ-FUNC-002 | IMPLEMENT | 클라이언트 사이드 AND 필터(국가·도시·계절·테마·기간), p95 실측은 미실시 | 수동 검토 |
| REQ-FUNC-003 | IMPLEMENT | 클라이언트 키워드 부분일치 검색 | 수동 검토 |
| REQ-FUNC-004 | IMPLEMENT | 필수 필드는 정적 데이터 스키마(zod 등)로 빌드/테스트 시점 검증, 런타임 게시 상태 전이는 없음 | 정적 데이터 검증 스크립트 |
| REQ-FUNC-005 | IMPLEMENT | 빈 결과 안내 UI + 필터 초기화 버튼 | Playwright 스모크 테스트 |
| REQ-FUNC-006 | IMPLEMENT | `destination.country_code`와 `safety.country_code` 매칭 링크 | Playwright 스모크 테스트 |
| REQ-FUNC-007 | IMPLEMENT(축소) | alt 텍스트는 필수, 출처·작가·라이선스는 단순 캡션 텍스트로 축소(승인 워크플로 없음) | 코드 리뷰 |
| REQ-FUNC-008 | IMPLEMENT | 국내 10개↑, 해외 15개국 30개 도시↑ 수량을 정적 데이터 검증 스크립트로 확인 | 정적 데이터 검증 스크립트 |
| REQ-FUNC-009 | IMPLEMENT | 같은 국가/테마 상세 하단 추천 최대 6개(Should) | 수동 검토 |
| REQ-FUNC-010 | IMPLEMENT | `useSearchParams` 기반 필터 상태 URL 반영(Should) | 수동 검토 |

### 5.2 F2. Flight Link-out

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-011 | IMPLEMENT | 국가/지역/출발일/귀국일 필수 입력 폼 | Playwright 스모크 테스트 |
| REQ-FUNC-012 | IMPLEMENT | 국가 변경 시 지역 옵션 재계산·초기화 | 수동 검토 |
| REQ-FUNC-013 | IMPLEMENT | 클라이언트 날짜 검증(과거일·역전일 차단) | Playwright 스모크 테스트 |
| REQ-FUNC-014 | IMPLEMENT | React state로 요약 단계 표시, 세션 내 유지 | Playwright 스모크 테스트 |
| REQ-FUNC-015 | IMPLEMENT | 폼·요약에 비전달 고지 문구 상시 노출 | 코드 리뷰 |
| REQ-FUNC-016 | IMPLEMENT | env 변수 `FLIGHT_OUTBOUND_URL`을 `noopener,noreferrer` 새 탭으로 오픈, query 없음 | Playwright 스모크 테스트 |
| REQ-FUNC-017 | IMPLEMENT | 입력값은 클라이언트 상태로만 처리, 서버 API·DB 미사용 | 코드 리뷰 |
| REQ-FUNC-018 | IMPLEMENT(축소) | URL 미설정/허용목록 밖이면 오류 UI+재시도 제공, 관리자 알림 생성은 제외(장애 알림 인프라 제외) | 수동 검토 |

### 5.3 F3. Hotel Link-out

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-019 | IMPLEMENT | 국가/지역/체크인/체크아웃 필수 입력 폼 | Playwright 스모크 테스트 |
| REQ-FUNC-020 | IMPLEMENT | 국가 변경 시 지역 옵션 재계산·초기화 | 수동 검토 |
| REQ-FUNC-021 | IMPLEMENT | 체크인 과거일·체크아웃≤체크인 차단 | Playwright 스모크 테스트 |
| REQ-FUNC-022 | IMPLEMENT | 폼 입력값과 동일한 요약 표시 | Playwright 스모크 테스트 |
| REQ-FUNC-023 | IMPLEMENT | 폼·요약에 비전달 고지 문구 상시 노출 | 코드 리뷰 |
| REQ-FUNC-024 | IMPLEMENT | env 변수 `HOTEL_OUTBOUND_URL`을 `noopener,noreferrer` 새 탭으로 오픈 | Playwright 스모크 테스트 |
| REQ-FUNC-025 | IMPLEMENT | 입력값은 클라이언트 상태로만 처리 | 코드 리뷰 |
| REQ-FUNC-026 | IMPLEMENT(축소) | URL 오류 시 입력값 유지+오류 UI, 운영 오류 로그는 콘솔/Vercel 기본 로그로 대체(전용 알림 제외) | 수동 검토 |

### 5.4 F4. Travel Mate

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-027 | IMPLEMENT | Supabase Auth 세션 검증 미들웨어로 쓰기 API 보호 | Playwright 스모크 테스트 |
| REQ-FUNC-028 | IMPLEMENT | `is_adult`, `adult_verified_at`만 저장, 생년월일 미저장 | 코드 리뷰 |
| REQ-FUNC-029 | IMPLEMENT | 닉네임/연령대/여행스타일 필수, 성별 선택 프로필 폼 | Playwright 스모크 테스트 |
| REQ-FUNC-030 | IMPLEMENT | 국가·지역·기간 겹침·연령대·성별·스타일·상태 필터, 차단 사용자 글 제외 | 수동 검토 |
| REQ-FUNC-031 | IMPLEMENT | 제목/국가/지역/기간/인원/조건/설명/안전수칙 동의 입력 폼 | Playwright 스모크 테스트 |
| REQ-FUNC-032 | IMPLEMENT(축소) | 정규식 기반 전화번호·이메일·메신저 ID 탐지 후 제출 차단, 95%/5% 정량 벤치마크는 미실시(수동 케이스 확인) | 수동 검토 |
| REQ-FUNC-033 | IMPLEMENT | 응답 payload에서 이메일·전화번호 필드 제외 | 코드 리뷰 |
| REQ-FUNC-034 | IMPLEMENT | 500자 이하 비공개 참가 메시지, PENDING 상태 저장 | Playwright 스모크 테스트 |
| REQ-FUNC-035 | IMPLEMENT | (post_id, applicant_id) 단위 unique 제약 + UI 오류 | 수동 검토 |
| REQ-FUNC-036 | IMPLEMENT | 작성자만 ACCEPTED/REJECTED 전환 가능(RLS+API 검증) | Playwright 스모크 테스트 |
| REQ-FUNC-037 | IMPLEMENT | 배치 잡 없이 조회 시 `end_date` 경과 여부 계산해 CLOSED로 표시 | 수동 검토 |
| REQ-FUNC-038 | IMPLEMENT | 작성자 수동 마감/수정/삭제, 승인자 존재 시 경고 | 수동 검토 |
| REQ-FUNC-039 | IMPLEMENT | 사유코드+설명 신고 폼, 접수번호 즉시 표시 | Playwright 스모크 테스트 |
| REQ-FUNC-040 | IMPLEMENT | 차단/해제, 차단 관계 상호 노출 제한 | Playwright 스모크 테스트 |
| REQ-FUNC-041 | IMPLEMENT(축소) | 관리자 탭에서 상태(OPEN/RESOLVED/DISMISSED) 필터만 있는 신고 목록 제공, 우선순위·증거첨부 큐는 제외 | Playwright 스모크 테스트 |
| REQ-FUNC-042 | EXCLUDED | 관리자는 신고 상태 변경만 수행(방침), 경고·콘텐츠 숨김·계정 일시제한 등 개별 제재 기능은 구현하지 않음 | 문서 검토 |
| REQ-FUNC-043 | IMPLEMENT(축소) | 인앱 Toast/화면 상태로 알림 대체, 실제 이메일 발송(SMTP 연동)은 제외 | Playwright 스모크 테스트 |
| REQ-FUNC-044 | IMPLEMENT | Supabase RLS로 본인/대상 작성자/Moderator/Admin만 비공개 데이터 접근 | 수동 검토 |
| REQ-FUNC-045 | IMPLEMENT(축소) | 탈퇴 시 즉시 프로필 비식별화 및 개인정보 삭제 처리, 30일 유예·법적 보존 예외 배치는 제외 | 코드 리뷰 |

### 5.5 F5. Country Safety

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-046 | IMPLEMENT | 게시 해외 국가 수 = 안전 정적 데이터 국가 수를 스크립트로 검증 | 정적 데이터 검증 스크립트 |
| REQ-FUNC-047 | IMPLEMENT | 8개 필수 카테고리 섹션을 정적 데이터 스키마로 강제 | 정적 데이터 검증 스크립트 |
| REQ-FUNC-048 | IMPLEMENT | 출처명·URL·확인일·편집자 필드를 정적 데이터에 포함 | 코드 리뷰 |
| REQ-FUNC-049 | IMPLEMENT | 외교부 원문 링크 새 탭 + `noopener,noreferrer` | Playwright 스모크 테스트 |
| REQ-FUNC-050 | IMPLEMENT | 렌더링 시 `verified_at` 기준 7일 경과 여부 계산해 stale 경고 표시 | 수동 검토 |
| REQ-FUNC-051 | IMPLEMENT | 중대 경보를 텍스트 라벨과 함께 상단 배치 | 수동 검토 |
| REQ-FUNC-052 | IMPLEMENT | `scope_type`/`scope_text` 필드로 국가·지역 범위 구분 표시 | 코드 리뷰 |
| REQ-FUNC-053 | IMPLEMENT | 현지 긴급전화·영사콜센터 정보를 정적 데이터에 포함 | 코드 리뷰 |
| REQ-FUNC-054 | IMPLEMENT | 안전 페이지·항공 요약에 "공식 판단 대체 아님" 고지 문구 | 코드 리뷰 |
| REQ-FUNC-055 | EXCLUDED | Editor/Admin 작성·검수·게시(DRAFT/REVIEW/PUBLISHED) 워크플로는 전체 콘텐츠 CMS 제외 방침에 따라 구현하지 않음, 콘텐츠는 코드 배포로 갱신 | 문서 검토 |
| REQ-FUNC-056 | EXCLUDED | 안전정보 변경 이력 DB 관리는 범용 감사 로그 제외 방침에 따라 구현하지 않음, git 커밋 이력으로 대체 | 문서 검토 |

### 5.6 F6. About free_traveler

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-057 | IMPLEMENT | 대표명·`50+ Trips`·`30+ Countries`를 단일 정적 데이터 소스에서 표시 | Playwright 스모크 테스트 |
| REQ-FUNC-058 | IMPLEMENT | 확정 소개문·철학·편집 원칙 전문 표시 | 코드 리뷰 |
| REQ-FUNC-059 | IMPLEMENT | 방문 국가 목록(30개국 이상) 표시 | 수동 검토 |
| REQ-FUNC-060 | IMPLEMENT | 연도·장소·요약 포함 타임라인 컴포넌트 | 수동 검토 |
| REQ-FUNC-061 | IMPLEMENT(축소) | alt 텍스트 필수, 출처/작가는 단순 캡션으로 축소(승인 워크플로 없음) | 코드 리뷰 |
| REQ-FUNC-062 | IMPLEMENT | 관리자 설정값 기반 문의·SNS 링크(허용 프로토콜만) | 수동 검토 |
| REQ-FUNC-063 | IMPLEMENT | 추천 여행지 6곳을 공개 상세로 연결 | 수동 검토 |

### 5.7 F7. Common, Admin, Governance

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-064 | IMPLEMENT | 전역 레이아웃(nav/footer)을 `layout.tsx`에 공통 구현 | Playwright 스모크 테스트 |
| REQ-FUNC-065 | IMPLEMENT | Tailwind 반응형 유틸리티로 320px~데스크톱 대응 | 수동 검토 |
| REQ-FUNC-066 | IMPLEMENT | Supabase Auth 이메일 가입/인증/로그인/로그아웃/재설정 | Playwright 스모크 테스트 |
| REQ-FUNC-067 | EXCLUDED | 여행지+안전정보 통합검색 UI는 미구현, REQ-FUNC-003의 여행지 키워드 검색으로 대체 | 문서 검토 |
| REQ-FUNC-068 | IMPLEMENT | localStorage 기반 즐겨찾기 토글, 중복 방지 | Playwright 스모크 테스트 |
| REQ-FUNC-069 | EXCLUDED | Web Share API/URL 복사 공유 기능은 이번 범위에서 제외 | 문서 검토 |
| REQ-FUNC-070 | IMPLEMENT | Next.js Metadata API로 title/description/canonical/OG 기본 메타데이터, 구조화 데이터(JSON-LD)는 제외 | 코드 리뷰 |
| REQ-FUNC-071 | EXCLUDED | 별도 분석 이벤트 계측 파이프라인은 이번 범위에서 구현하지 않음(추후 Vercel Analytics 등 도입 검토) | 문서 검토 |
| REQ-FUNC-072 | EXCLUDED | 여행지 CRUD·미리보기·상태 전이 CMS는 전체 콘텐츠 CMS 제외 방침, 콘텐츠는 `src/data` 코드 수정으로 관리 | 문서 검토 |
| REQ-FUNC-073 | EXCLUDED | 미디어 업로드 시 출처/라이선스 필수 입력 워크플로는 미디어 업로드·라이선스 승인 워크플로 제외 | 문서 검토 |
| REQ-FUNC-074 | EXCLUDED | 런타임 게시 완전성 게이트(PUBLISHED 전환 차단)는 CMS 부재로 대체 불가, 빌드/테스트 시점 정적 데이터 검증(REQ-FUNC-004/008)으로 대체 | 문서 검토 |
| REQ-FUNC-075 | EXCLUDED | stale 현황·담당자 대시보드는 간단한 관리자 탭(신고·URL만) 범위 밖 | 문서 검토 |
| REQ-FUNC-076 | EXCLUDED | 관리자 변경/신고 처리/권한 변경 전반의 범용 감사 로그는 구현하지 않음, 신고 레코드 자체의 상태·수정시각 필드만 유지 | 문서 검토 |
| REQ-FUNC-077 | IMPLEMENT | Admin이 항공/호텔/외부URL을 허용목록 내 HTTPS로만 설정 가능한 간단 설정 폼 | Playwright 스모크 테스트 |
| REQ-FUNC-078 | IMPLEMENT | Next.js `not-found.tsx`/`error.tsx`에 홈·재시도 등 복구 액션 제공 | 수동 검토 |
| REQ-FUNC-079 | IMPLEMENT | 시맨틱 HTML+ARIA 속성 적용(폼/모달/탭/알림) | 수동 검토 |
| REQ-FUNC-080 | IMPLEMENT | 이용약관/개인정보처리방침/동행 안전수칙/콘텐츠 면책 정적 페이지 + 동행 글 작성 시 동의 시각 저장 | Playwright 스모크 테스트 |

---

## 6. 요구사항 분류 — 비기능 요구사항 (REQ-NF-001~034)

### 6.1 Performance

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-001 | IMPLEMENT | 이미지 최적화·코드 분할 등 설계 원칙으로 반영, RUM 모니터링 대시보드는 미구축 | 수동 검토 |
| REQ-NF-002 | IMPLEMENT | 클라이언트 상호작용을 가벼운 상태관리로 유지, 정식 INP 계측 도구는 미구축 | 수동 검토 |
| REQ-NF-003 | IMPLEMENT | 이미지 크기 고정, 스켈레톤 사용으로 레이아웃 이동 최소화 | 수동 검토 |
| REQ-NF-004 | IMPLEMENT(축소) | 클라이언트 정적 필터로 체감 성능 확보, 동시사용자 50명 부하 테스트는 미실시 | 수동 검토 |
| REQ-NF-005 | IMPLEMENT(축소) | 단순 단건 쓰기 API로 설계, 정식 부하 테스트 측정은 미실시 | 수동 검토 |
| REQ-NF-006 | IMPLEMENT | Next.js `<Image>`로 반응형 크기·lazy load·LCP 이미지 priority 적용 | 코드 리뷰 |
| REQ-NF-007 | EXCLUDED | Lighthouse CI 성능 예산 게이트는 구성하지 않음, CI는 Playwright 스모크 테스트만 게이트로 사용 | 문서 검토 |

### 6.2 Reliability and Recovery

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-008 | EXCLUDED | 가동률 모니터링/SLA 리포팅 체계 미구축, Vercel/Supabase 관리형 인프라 가용성에 의존 | 문서 검토 |
| REQ-NF-009 | EXCLUDED | 5xx 비율 모니터링 대시보드 미구축 | 문서 검토 |
| REQ-NF-010 | EXCLUDED | 자동 백업/RPO·RTO 정책 제외 방침, Supabase 기본 백업에 의존 | 문서 검토 |
| REQ-NF-011 | EXCLUDED | 외부 링크 주간 자동 점검·Admin 알림은 구현하지 않음(장애 알림 제외), 필요 시 수동 점검 | 문서 검토 |
| REQ-NF-012 | IMPLEMENT | Vercel 기본 HTTPS/TLS 1.2+ 적용 | 코드 리뷰 |
| REQ-NF-013 | IMPLEMENT | Supabase Auth+RLS로 서버 측 권한 검증 | 수동 검토 |
| REQ-NF-014 | IMPLEMENT | SameSite 쿠키 및 Server Action/Route Handler CSRF 기본 방어 적용 | 코드 리뷰 |
| REQ-NF-015 | IMPLEMENT | 서버측 입력 검증(zod)과 React 기본 이스케이프로 저장 XSS 차단 | 코드 리뷰 |
| REQ-NF-016 | IMPLEMENT | Supabase 키 등 비밀값은 Vercel 환경변수로 관리, 클라이언트 번들 미포함 | 코드 리뷰 |
| REQ-NF-017 | IMPLEMENT | 항공·호텔 입력값은 클라이언트 상태만 사용, 서버/분석 미전송 | 코드 리뷰 |
| REQ-NF-018 | EXCLUDED | 자기서비스 개인정보 내보내기(export) 기능은 제외, 탈퇴·삭제는 REQ-FUNC-045 즉시 비식별화로 대응 | 문서 검토 |

### 6.3 Safety and Moderation

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-019 | IMPLEMENT(축소) | 단건 insert 기반 신고 접수로 설계상 지연 최소화, 정식 p95 부하 측정은 미실시 | 수동 검토 |
| REQ-NF-020 | EXCLUDED | 24시간 SLA 자동 트래킹/대시보드는 미구축, 신고 목록의 접수 시각 표시로만 지원(운영 프로세스에 의존) | 문서 검토 |
| REQ-NF-021 | EXCLUDED | 글/요청/신고에 대한 별도 속도 제한(rate limiting) 미들웨어는 이번 범위에서 구현하지 않음 | 문서 검토 |
| REQ-NF-022 | EXCLUDED | Moderator 조치 추적을 위한 감사 로그는 범용 감사 로그 제외 방침에 따라 구현하지 않음 | 문서 검토 |

### 6.4 Accessibility

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-023 | IMPLEMENT | 시맨틱 마크업·명도 대비·포커스 스타일 등 WCAG 2.2 AA 설계 원칙 적용 | 수동 검토 |
| REQ-NF-024 | EXCLUDED | axe-core 등 자동 접근성 검사 파이프라인은 구성하지 않음(스모크 테스트는 Playwright 핵심 흐름만 포함) | 문서 검토 |
| REQ-NF-025 | IMPLEMENT | 핵심 흐름(검색, 폼 입력, 모달, 신고)에 대해 수동 키보드 내비게이션 점검 수행 | 수동 검토 |

### 6.5 Content, Freshness, SEO, Copyright

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-026 | IMPLEMENT | 정적 데이터 스키마 검증으로 여행지 콘텐츠 완전성 확보 | 정적 데이터 검증 스크립트 |
| REQ-NF-027 | IMPLEMENT | 정적 데이터 검증으로 해외 국가 안전정보 커버리지 확보 | 정적 데이터 검증 스크립트 |
| REQ-NF-028 | IMPLEMENT(축소) | 렌더링 시 stale 경고 기능은 구현, "95% 이상 최신 유지"는 콘텐츠 운영 목표로 코드 범위 밖 | 수동 검토 |
| REQ-NF-029 | EXCLUDED | 라이선스 메타데이터 100% 관리 체계는 이미지 정책 단순화 방침(URL+alt)에 따라 구현하지 않음 | 문서 검토 |
| REQ-NF-030 | IMPLEMENT | 공개 페이지 전수 메타데이터 존재를 코드 리뷰로 확인 | 코드 리뷰 |

### 6.6 Maintainability, Monitoring, Cost

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-031 | IMPLEMENT | TypeScript strict, ESLint, 핵심 로직 단위 테스트를 main 병합 전 CI로 검증 | 코드 리뷰 |
| REQ-NF-032 | EXCLUDED | 커스텀 구조화 로깅 체계는 구축하지 않음, Vercel 기본 함수 로그로 대체 | 문서 검토 |
| REQ-NF-033 | EXCLUDED | 5xx·외부링크 실패 자동 알림은 장애 알림 제외 방침에 따라 구현하지 않음 | 문서 검토 |
| REQ-NF-034 | IMPLEMENT | Vercel Hobby + Supabase 무료/저비용 티어로 아키텍처 구성해 월 10만원 이하 목표 충족 | 문서 검토 |

---

## 7. Playwright 핵심 Smoke Test 범위

1. 홈 → 여행지 목록 → 필터 적용 → 상세 진입 → 안전정보 패널 확인
2. 항공 입력 → 검증 오류 확인 → 유효 입력 → 요약 확인 → 외부 사이트 새 탭 이동 확인
3. 호텔 입력 → 동일 플로우
4. 이메일 회원가입 → 로그인 → 성인 확인
5. 동행 모집글 작성(안전수칙 동의) → 목록 노출 확인 → 참가 요청 제출
6. 모집글 작성자 참가 요청 승인/거절
7. 신고 제출 → 접수번호 표시
8. 사용자 차단 → 상호 노출 제한 확인
9. 관리자 로그인 → 신고 상태 변경 → 외부 URL 설정 변경
10. 대표 소개 페이지 진입 확인

이 범위를 벗어나는 세부 시나리오(SRS 6.8.2 Critical Test Scenarios 전체, 접근성 자동 검사, 부하 테스트)는 이번 구현 범위에서 제외한다.

---

## 8. 요약 통계

| 구분 | 전체 | IMPLEMENT | EXCLUDED |
|---|---:|---:|---:|
| REQ-FUNC-001~080 | 80 | 69 | 11 |
| REQ-NF-001~034 | 34 | 21 | 13 |
| 합계 | 114 | 90 | 24 |
