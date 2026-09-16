# Free Traveler — Decision Log

**Document ID:** DECLOG-TRAVEL-001
**대상:** 개발팀, Product Owner
**상태:** 진행 중(신규 결정은 이 파일 하단에 이어서 추가)

이 문서는 프로젝트 진행 중 확정된 의사결정을 시간순으로 기록한다. 각 결정은 고유 ID
(`DEC-NNN`)를 가지며, 번호를 재사용하거나 기존 항목을 삭제하지 않는다. 결정을 뒤집을
때는 기존 항목의 Status를 `Superseded`로 바꾸고 새 `DEC-NNN`을 추가한다.

---

## 색인

| ID | 제목 | Status |
|---|---|---|
| [DEC-001](#dec-001) | 실제 개발 루트는 `traveler/app` | Decided |
| [DEC-002](#dec-002) | 디자인 Screen은 핵심 4개·보조 1개 | Decided |
| [DEC-003](#dec-003) | `/travel-tools`에 항공·숙소·동행 작성을 통합 | Decided |
| [DEC-004](#dec-004) | 여행지·안전·대표는 정적 TypeScript Data | Decided |
| [DEC-005](#dec-005) | Supabase는 Auth와 동행 기능 중심 | Decided |
| [DEC-006](#dec-006) | DB는 6개 Table로 제한 | Decided |
| [DEC-007](#dec-007) | 항공·숙소 입력은 Browser Memory에만 유지 | Decided |
| [DEC-008](#dec-008) | Airbnb DESIGN.md는 vendor 참고본, D-001이 실제 정본 | Decided |
| [DEC-009](#dec-009) | Playwright는 Chromium Smoke만 필수 | Decided |
| [DEC-010](#dec-010) | 사용자의 개발 실행 단위는 Wave | Decided |
| [DEC-011](#dec-011) | Single Agent가 Wave 내부 Task를 순차 수행 | Decided |
| [DEC-012](#dec-012) | PR·Merge는 사용자가 수동 수행 | Decided |
| [DEC-013](#dec-013) | EC2·AWS는 사용하지 않음 | Decided |
| [DEC-014](#dec-014) | 제외 기능은 EXCLUDED로 관리 | Decided |

---

### DEC-001

**실제 개발 루트는 `traveler/app`**

- **Context:** 저장소는 `traveler/`(공유 루트) 아래에 `app/`(Next.js 프로젝트),
  `design-reference/`(디자인 정본, `app/`의 형제 디렉터리), `docs/`(과거 잔재) 등이
  섞여 있어 어느 디렉터리가 실제 개발 기준점인지 모호했다.
- **Decision:** `package.json`, `src/app/`, `.claude/`, `scripts/`, `TASKS/`,
  `docs/`가 위치한 **`traveler/app/`이 실제 개발 루트**다. `CLAUDE.md`/`AGENTS.md`도 이
  디렉터리에 있어 Claude Code가 인식하는 프로젝트 루트와 일치한다. `design-reference/`는
  `traveler/app/`의 한 단계 위(`traveler/`)에 있는 공유 정본이며, 코드에서는
  `../design-reference/...` 상대 경로로 참조한다.
- **Consequences:** 모든 스크립트(`scripts/validate_inputs.py`, `scripts/audit_tasks.py`)와
  문서 경로 표기는 `traveler/app/`를 기준으로 한다.
- **References:** `docs/ARCHITECTURE.md` §1, `scripts/validate_inputs.py`,
  `scripts/audit_tasks.py`

---

### DEC-002

**디자인 Screen은 핵심 4개·보조 1개**

- **Context:** Baseline SRS의 다중 Public Route(`/destinations/*`, `/flights`,
  `/hotels`, `/mates/*`, `/safety/*`, `/auth/*`, `/my/*`, `/admin/*` 등)를 5개
  디자인 Screen으로 통합해야 했다.
- **Decision:** SCR-001(`/`), SCR-003(`/travel-tools`), SCR-004(`/mates`),
  SCR-005(`/account`)는 **핵심(core)**, SCR-002(`/about`)는 **보조(auxiliary)**다.
  핵심 디자인 Screen은 이 4개를 초과하지 않는다.
- **Consequences:** Page Owner Task는 정확히 5개(SCR-001~005), 그중 4개는 핵심 플로우를
  담당하고 대표 소개(SCR-002)는 보조 콘텐츠 화면으로 취급한다.
- **References:** `docs/PROJECT_SCOPE.md`, `docs/03_UI_COVERAGE_ANALYSIS.md`,
  `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`

---

### DEC-003

**`/travel-tools`에 항공·숙소·동행 작성을 통합**

- **Context:** Baseline SRS는 항공(`/flights`)·숙소(`/hotels`)·동행 작성(`/mates/new`)을
  서로 다른 Route로 정의했다.
- **Decision:** 세 기능을 **SCR-003(`/travel-tools`) 하나의 화면 안, 3개 탭**(항공편/
  숙소/동행 구하기)으로 통합한다. 탭별 입력·검증·완료 상태는 서로 독립적으로 유지한다.
- **Consequences:** `/flights`, `/hotels`, `/mates/new`라는 별도 Route는 만들지 않는다.
  Component Task도 `CMP-SCR003-FLIGHT-FORM`/`HOTEL-FORM`/`MATE-COMPOSER`로 분리해
  탭별 책임을 명확히 한다.
- **References:** `docs/05_UIUX_APPROVED.md` §3, `docs/06_SRS_UIUX_REVISED.md` §2

---

### DEC-004

**여행지·안전·대표는 정적 TypeScript Data**

- **Context:** 콘텐츠 CMS(에디터 역할, 게시 워크플로, 미디어 업로드 승인)를 만들 것인지
  결정이 필요했다.
- **Decision:** 여행지, 국가 안전정보, 대표(`free_traveler`) 소개는 **DB 테이블이 아니라
  `src/data/*`의 TypeScript 모듈**로 관리한다. 콘텐츠 갱신은 코드 변경(PR)으로 이루어지며,
  런타임 게시 상태(DRAFT/REVIEW/PUBLISHED) 워크플로나 관리자 편집 화면은 만들지 않는다.
- **Consequences:** 전체 콘텐츠 CMS, 미디어 업로드·라이선스 승인 워크플로는 EXCLUDED
  (DEC-014). 수량·필수 필드 완전성은 빌드/CI 시점 검증 스크립트로 대체한다.
- **References:** `docs/PROJECT_SCOPE.md`, `docs/ARCHITECTURE.md` §6

---

### DEC-005

**Supabase는 Auth와 동행 기능 중심**

- **Context:** Supabase를 범용 백엔드로 쓸지, 특정 기능에만 한정할지 결정이 필요했다.
- **Decision:** Supabase는 **① 이메일 인증·성인 확인, ② 동행(Mate) 기능**(모집글,
  참가 요청, 차단, 신고, 외부 URL 설정)에만 사용한다. 여행지·안전정보·대표소개(DEC-004)는
  Supabase를 거치지 않는다.
- **Consequences:** DB 스키마·RLS·서버 접근 계층 모두 이 범위로 한정해 설계한다(DEC-006).
- **References:** `docs/ARCHITECTURE.md` §7

---

### DEC-006

**DB는 6개 Table로 제한**

- **Context:** DEC-004/DEC-005에 따라 Supabase DB에 실제로 필요한 테이블 범위를
  확정해야 했다.
- **Decision:** DB 테이블은 정확히 **`user_profile`, `mate_post`, `mate_application`,
  `user_block`, `report`, `external_link_settings`** 6개로 제한한다. 이 밖의 테이블
  (여행지·안전정보·대표소개·미디어·범용 감사로그용)은 만들지 않는다.
- **Consequences:** `TASKS/TASK-DB-SCHEMA-BASE.md` 등 DB 관련 Task와
  `scripts/audit_tasks.py`의 DB 화이트리스트 검사가 이 6개를 기준으로 동작한다.
- **References:** `docs/ARCHITECTURE.md` §8, `TASKS/00_TASK_LIST.md` §4

---

### DEC-007

**항공·숙소 입력은 Browser Memory에만 유지**

- **Context:** PRD 원칙 3("항공·호텔 입력값은 MVP에서 외부 사이트로 전달하거나 서버에
  저장하지 않는다")을 구현 수준에서 구체화해야 했다.
- **Decision:** SCR-003 항공·숙소 폼의 국가·지역·날짜 입력값은 **Client Component의
  일시 상태(useState 등)로만 유지**하며, 서버 API·DB·외부 URL 쿼리·서버 로그·분석 이벤트
  어디에도 원시 입력값을 전달하지 않는다.
- **Consequences:** `/api/flights/*`, `/api/hotels/*` 같은 Route Handler를 만들지
  않는다. 외부 이동은 `noopener,noreferrer` 새 탭으로 설정된 일반 URL만 연다.
- **References:** `docs/ARCHITECTURE.md` §4·§5, `docs/01_PRD.md` 제품 원칙 3

---

### DEC-008

**Airbnb DESIGN.md는 vendor 참고본, D-001이 실제 정본**

- **Context:** `design-reference/vendor/airbnb/DESIGN-airbnb.md`를 얼마나, 어떻게
  반영할지 명확히 할 필요가 있었다.
- **Decision:** Airbnb 참고본은 **구조적 레이아웃 패턴(카드 밀도, 섹션 리듬, 단일
  그림자 단계, radius 언어)만 참고**하는 vendor 자료로 취급한다. 색상 값, 폰트, 로고,
  상품 구조, 배지 디자인 등 상표적 요소는 가져오지 않는다. **`design-reference/D-001/
  DESIGN.md`(Status: LOCKED)가 Free Traveler의 실제 디자인 정본**이며, 구현은 이 문서의
  토큰·컴포넌트·Do/Do Not을 따른다.
- **Consequences:** 새 화면/컴포넌트 설계 시 D-001에 토큰이 없는 임의 색상·폰트를
  추가하지 않는다. D-001 개정은 `design-reference/DESIGN_MANIFEST.md`의 변경 이력에
  기록한다.
- **References:** `design-reference/DESIGN_MANIFEST.md`, `design-reference/D-001/DESIGN.md`

---

### DEC-009

**Playwright는 Chromium Smoke만 필수**

- **Context:** E2E 테스트 범위를 전체 브라우저 매트릭스로 할지, 최소 Smoke로 한정할지
  결정이 필요했다.
- **Decision:** Playwright는 **Chromium 대상 핵심 Smoke Task만** 필수로 한다
  (`E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH`). Firefox/WebKit 프로젝트나
  전체 기능 회귀 E2E 매트릭스는 만들지 않는다.
- **Consequences:** `scripts/audit_tasks.py`가 E2E Task의 `Verify`에 Chromium만
  언급되는지 검사하고, Firefox/WebKit 언급 시 실패 처리한다.
- **References:** `docs/PROJECT_SCOPE.md` §11, `docs/ARCHITECTURE.md` §12,
  `TASKS/00_TASK_LIST.md` §9

---

### DEC-010

**사용자의 개발 실행 단위는 Wave**

- **Context:** `TASKS/00_TASK_LIST.md`의 65개 Task를 실제로 착수하는 순서와 단위를
  정할 필요가 있었다.
- **Decision:** 구현 착수는 Task 단위가 아니라 **Wave**라는 실행 단위로 묶어 진행한다.
  Wave는 사용자가 "지금 착수할 Task 묶음"을 지정하는 단위다.
- **Consequences:** Wave별 Task 구성(어떤 Task가 어느 Wave에 속하는지, Wave 간 순서)은
  이 결정만으로는 확정되지 않았다 — **별도 Wave 계획 문서에서 정의될 때까지는 미확정
  상태**로 남긴다. 이 로그는 "Wave 단위로 진행한다"는 결정 자체만 기록한다.
- **References:** `TASKS/00_TASK_LIST.md`, `TASKS/TASK_MANIFEST.csv`(Wave 배정 전 상태)

---

### DEC-011

**Single Agent가 Wave 내부 Task를 순차 수행**

- **Context:** 한 Wave 안의 여러 Task를 여러 Agent로 병렬 수행할지, 한 Agent가 순서대로
  처리할지 결정이 필요했다.
- **Decision:** 하나의 Wave 내부 Task들은 **단일 Agent가 순차적으로** 수행한다. 병렬
  Multi-agent/다중 워커 방식은 사용하지 않는다.
- **Consequences:** Wave 내 Task 간 `Depends On` 순서를 Agent가 실행 순서로 그대로
  따르며, 동시 실행으로 인한 파일 충돌·상태 경합을 설계에서 고려하지 않아도 된다.
- **References:** `TASKS/00_TASK_LIST.md`(Depends On 열), DEC-010

---

### DEC-012

**PR·Merge는 사용자가 수동 수행**

- **Context:** Task 구현 완료 후 PR 생성·병합을 자동화할지 여부를 결정해야 했다.
- **Decision:** PR 생성과 Merge는 **사용자가 직접 수동으로 수행**한다. Agent가 자동으로
  PR을 만들거나 병합하지 않는다.
- **Consequences:** DEC-015(자동 Merge Runner 미사용, `docs/ARCHITECTURE.md` §15)와
  일관된 결정이며, 각 Wave/Task 완료 시점에는 변경 사항을 사용자가 검토할 수 있는 상태로
  남겨두는 것까지가 Agent의 책임이다.
- **References:** `docs/ARCHITECTURE.md` §15, DEC-014(무인 자동 Merge Runner 제외)

---

### DEC-013

**EC2·AWS는 사용하지 않음**

- **Context:** 인프라를 Vercel/Supabase 관리형 서비스로 한정할지, AWS 리소스를 함께
  쓸지 결정이 필요했다.
- **Decision:** 인프라는 **Vercel(애플리케이션 호스팅) + Supabase(DB·Auth)** 조합만
  사용한다. EC2, ECS, Lambda, RDS 등 AWS 리소스를 프로비저닝하지 않는다.
- **Consequences:** IaC(Terraform 등)나 AWS 콘솔 설정 관련 Task를 만들지 않는다.
  `scripts/audit_tasks.py`가 Task 내용에서 "EC2"/"AWS" 키워드를 발견하면 감사를
  실패시킨다.
- **References:** `docs/ARCHITECTURE.md` §14, `TASKS/00_TASK_LIST.md` §10(검사 16)

---

### DEC-014

**제외 기능은 EXCLUDED로 관리**

- **Context:** 범위에서 뺀 요구사항(REQ-FUNC/REQ-NF)을 문서에서 완전히 지울지, 남겨둘지
  결정이 필요했다.
- **Decision:** 제외된 24건(REQ-FUNC 11건 + REQ-NF 13건)은 **삭제하지 않고 EXCLUDED
  상태로 추적표에 남긴다.** `docs/PROJECT_SCOPE.md`가 판정 근거의 정본이며,
  `docs/UIUX_TRACEABILITY.md`와 `TASKS/00_TASK_LIST.md` §12(NON_IMPLEMENTATION)에서
  동일한 EXCLUDED 목록을 유지한다. EXCLUDED 항목은 구현 Task를 만들지 않는다.
- **Consequences:** 향후 누군가 이 기능을 다시 검토하려면 EXCLUDED 판정 근거를 먼저
  확인해야 하며, 어떤 문서에서도 EXCLUDED 요구사항을 임의로 특정 Screen/Task에 재배치하지
  않는다. `scripts/audit_tasks.py`가 EXCLUDED 요구사항이 실제 Task의 Requirement Ref에
  등장하는지 매번 검사한다.
- **References:** `docs/PROJECT_SCOPE.md`, `docs/UIUX_TRACEABILITY.md`,
  `TASKS/00_TASK_LIST.md` §12, `docs/ARCHITECTURE.md` §16
