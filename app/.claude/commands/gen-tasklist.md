---
description: Free Traveler 승인된 5개 Screen과 114개 Requirement로부터 TASKS/00_TASK_LIST.md(Task List)를 생성하거나 갱신한다.
---

`traveler-project-pipeline` Skill을 로드하고 그 §1~§12와 `CLAUDE.md`의 Harness
Marker·23개 규칙을 따른다. 이 명령은 **Task List만** 다룬다 — Task 상세 파일은
`/gen-task-details`, 감사는 `/audit-tasks`의 책임이다.

## 공통 원칙(모든 절차에 적용)

- **`traveler-project-pipeline` Skill을 사용한다.** 시작 전에 반드시 로드한다.
- **실제 파일을 읽는다.** 아래 "정본 읽기" 단계의 문서를 실제로 열어 확인하고,
  기억이나 추정으로 채우지 않는다. `TASKS/00_TASK_LIST.md`가 이미 있으면 먼저 그
  현재 내용을 읽고 그 위에서 갱신한다(새로 지어내 덮어쓰지 않는다).
- **구현 코드를 만들지 않는다.** `.tsx`/`.ts`/`.sql` 등 실제 구현 파일은 이 명령에서
  작성하지 않는다. 산출물은 `TASKS/00_TASK_LIST.md`(Markdown) 하나뿐이다.
- **Task Audit 실패를 무시하지 않는다.** 이 명령 자체는 감사를 실행하지 않지만,
  이후 `/gen-task-details`가 실행할 `scripts/audit_tasks.py`가 검사할 수 있는 형태로
  Task List를 작성해야 한다(Table A/B 열 형식, ID 형식, Requirement Ref 범위 표기
  정확성 등). 완료 보고에서 "감사를 통과했다"고 임의로 단정하지 않는다 — 감사는
  `/gen-task-details` 또는 `/audit-tasks`가 실제로 실행한 뒤에만 그 결과를 보고한다.

## 절차

1. **입력 검증.** `python3 scripts/validate_inputs.py`를 실행한다. 0이 아닌 종료
   코드면 즉시 멈추고 출력된 오류를 그대로 사용자에게 보여준다 — 오류를 임의로
   해석해 넘어가지 않는다. 통과하면 `TASKS/SRC_APP_TREE_SNAPSHOT.json`이 갱신된
   것을 확인한다.

2. **정본 읽기(실제 파일).**
   - `design-reference/SCREEN_ROUTE_CONTRACT.json` — Screen 5개, Route, Page Entry,
     `section_order`, `min_content_counts`, `technical_routes`, `required_navigation`의
     정본(Skill §2).
   - `design-reference/UI_CONTRACT.md` — Screen별 주요 Component, 상태, 사용자 행동,
     화면 이동, 금지 기능(서술형 보충 자료).
   - `docs/UIUX_TRACEABILITY.md` — 114개 Requirement 각각의 Implementation Status/
     Screen/Route/Page Entry.
   - `docs/PROJECT_SCOPE.md` — IMPLEMENT/EXCLUDED 판정 근거, DB 6개 테이블, 정적
     데이터 범위(Skill §3, §6).
   - `TASKS/SRC_APP_TREE_SNAPSHOT.json` — 실제 `src/app` 파일 목록. 이미 존재하는
     파일(예: 현재 `src/app/page.tsx`는 Next.js 기본 스캐폴드)은 "생성"이 아니라
     "수정/교체"로 Expected Files에 기록한다.
   - 이미 `TASKS/00_TASK_LIST.md`가 있다면 그 현재 Table A/B 내용을 읽고, 이번 갱신이
     기존 Task ID·의존관계를 깨뜨리지 않는지 확인한다.

3. **Task 목록 구성.** `traveler-project-pipeline` Skill의 §5(Page Owner·Component
   분리), §6(DB 6개 테이블과 정적 데이터), §9(Playwright 범위), §12(AWS·EC2·자동
   Merge 금지)를 따라 아래를 모두 포함한다.
   - **Page Owner Task 정확히 5개**(SCR-001~005 각 1개). 해당 Screen의 `Page Entry`
     파일 하나만 Expected Files로 갖고, 하위 Component 파일은 만들지 않는다(Skill §5).
     SCR-001은 Next.js Starter 제거 AC, SCR-003은 항공·숙소·동행 3탭 조립 AC,
     SCR-005는 Guest·Member·Admin 3상태 조립 AC를 Functional AC에 명시한다.
   - **Component Task** — 각 Screen의 Section/컴포넌트 단위(Hero, Card Grid, Filter
     Bar, Drawer, Form, Tab Shell 등)로 쪼갠다. 소속 Screen의 Page Owner `Depends On`에
     반드시 등장해야 한다(고아 Component 금지).
   - **Data Task** — 여행지, 국가 안전정보, 대표 소개를 `src/data/*`에 작성하는
     Task(Skill §6). DB 테이블로 만들지 않는다.
   - **DB Task** — `user_profile`, `mate_post`, `mate_application`, `user_block`,
     `report`, `external_link_settings` 6개 테이블 + RLS + Access + Seed만 다룬다.
     다른 테이블을 추가하지 않는다.
   - **Auth Task** — Supabase 이메일 인증 + 성인 확인(생년월일 미저장).
   - **Server Action Task** — 동행글 CRUD, 참가 요청, 차단, 신고, 외부 URL 설정.
     항공·숙소 입력값을 저장하는 API Route는 만들지 않는다(Skill §7).
   - **Test Task** — Playwright는 Chromium Smoke Task만(Skill §9, 보통
     `E2E-PUBLIC-SMOKE`/`E2E-TRAVEL-TOOLS`/`E2E-MATE-AUTH` 3개), Vitest 단위 테스트
     별도.
   - **Tooling/CI/Release Task** — 전역 레이아웃, 디자인 토큰, CI, Vercel/Supabase
     배포 확인. EC2·AWS·자동 Merge Runner Task는 만들지 않는다(Skill §12).

4. **Requirement 커버리지 채우기.** `docs/UIUX_TRACEABILITY.md`의 114개 Requirement
   전부가 아래 둘 중 하나에 정확히 한 번씩 등장하게 한다(Skill §3).
   - IMPLEMENT/IMPLEMENT(축소): 어느 Task의 `Requirement Ref`에 포함.
   - EXCLUDED: `TASKS/00_TASK_LIST.md`의 NON_IMPLEMENTATION 표에만 근거·후속 방향과
     함께 기록하고, 어떤 Task의 `Requirement Ref`에도 넣지 않는다(Skill §11).
   범위 축약(`REQ-FUNC-011~018`류)을 쓸 때는 그 구간에 EXCLUDED Requirement가 섞여
   있지 않은지 반드시 다시 확인한다.

5. **파일 쓰기.** `TASKS/00_TASK_LIST.md` 하나에 Task ID별로 연결된 두 표를 쓴다
   (`traveler-project-pipeline` Skill §4):
   - Table A(식별·라우팅): `Seq, Task ID, 제목, Category, Implementation Status,
     Requirement Ref, Screen, Route, Page Entry, Depends On, Priority`
   - Table B(파일·수용기준·검증): `Task ID, Expected Files, Functional AC, Visual AC,
     Security/Privacy AC, Verify`
   - 요약 절(총 Task 수, Category별 개수, Requirement 커버리지 집계)과
     NON_IMPLEMENTATION 표를 포함한다.

6. **상세 파일은 만들지 않는다.** `TASKS/TASK-<ID>.md`는 `/gen-task-details`의
   책임이다. 이 명령은 Task List까지만 생성/갱신한다.

7. **보고.** 생성/갱신된 Task 총 개수, Category별 개수, Requirement 커버리지가
   정확히 114건(IMPLEMENT 계열 + EXCLUDED)인지, 45~65 범위와의 관계(정보 제공용,
   실패 조건 아님)를 요약해 사용자에게 보고한다. 구현 코드를 만들지 않았고 이것이
   설계 계약이라는 점, 그리고 아직 `scripts/audit_tasks.py`를 실행하지 않았으므로
   최종 감사 결과는 `/gen-task-details` 또는 `/audit-tasks` 실행 후에 나온다는 점을
   명시한다.
