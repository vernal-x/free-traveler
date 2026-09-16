---
description: prepare-task가 READY_TO_IMPLEMENT로 판정한 Task 하나를 실제로 구현한다. Expected Files 안에서만 작업하고, 기본적으로 Commit/Push/PR을 하지 않는다.
argument-hint: <WAVE_ID> <TASK_ID> [--commit]
---

`traveler-project-pipeline` Skill을 로드하고 `CLAUDE.md`의 Harness Marker·23개 규칙과
Task 완료 순서(Task 읽기 → 입력 확인 → 구현 → 관련 포맷·Unit Test → 필요 시 Playwright →
Diff 확인 → 완료 보고)를 그대로 따른다. **이 Command는 이 파이프라인에서 실제로 구현
코드를 작성하는 유일한 Command다** — `/gen-tasklist`, `/gen-task-details`,
`/audit-tasks`, `/prepare-task`는 모두 문서/검증 전용이었다.

## 이 Command가 하는 일 / 하지 않는 일

- 지정한 **Task 하나**의 구현만 담당한다. 여러 Task를 한 번에 구현하지 않는다
  (`CLAUDE.md` 규칙 7 — Wave 내부 Task는 한 번에 하나만).
- **기본적으로 Commit·Push·PR을 자동 수행하지 않는다.** 사용자가 명시적으로
  요청한 경우에만 이 Task 범위의 변경사항을 **Task 단위 Commit 하나**까지 만들 수
  있다. **Push와 PR 생성은 사용자가 요청해도 이 Command가 하지 않는다**(DEC-012,
  `CLAUDE.md` 규칙 21 — Merge·Push는 항상 사람이 수동으로 한다).

## 0. 전제 — `/prepare-task` 재확인(규칙 1)

구현을 시작하기 전에 반드시 `/prepare-task WAVE_ID TASK_ID`를 실행(또는 같은 턴 안의
최신 실행 결과를 재사용하되, 그 사이 Working Tree가 바뀌지 않았는지 `git status
--porcelain`으로 다시 확인)한다.

- 마지막 줄 STATUS가 **`READY_TO_IMPLEMENT`가 아니면 구현을 시작하지 않는다.** 받은
  `BLOCKED_INPUT` / `BLOCKED_DEPENDENCY` / `BLOCKED_DIRTY_TREE` / `BLOCKED_SCOPE`와
  그 근거를 그대로 보고하고 멈춘다.
- `READY_TO_IMPLEMENT`일 때만 아래 절차로 진행한다.

## 절차

1. **Task 읽기.** `TASKS/TASK-<TASK_ID>.md`의 14개 절(Context, Project Scope,
   Requirement Ref, Screen/Route/Page Entry, Design Ref, Depends On, Expected Files,
   Functional AC, Visual AC, Security/Privacy AC, Test Cases, Verify, Definition of
   Done, Forbidden)을 전부 읽는다.

2. **Expected Files 확정.** § Expected Files에 적힌 파일 목록을 그대로 작업 대상으로
   확정한다. **이 목록 밖의 파일은 만들거나 고치지 않는다**(규칙 2, `CLAUDE.md`
   규칙 8). 목록에 "생성"이라고 쓰인 파일은 새로 만들고, "수정(교체)"라고 쓰인
   파일(예: SCR-001의 `src/app/page.tsx`)은 기존 내용을 교체한다.

3. **구현.** Category에 따라 아래 원칙을 지킨다.
   - **PAGE_OWNER**: 해당 Screen의 실제 **Page Entry**(`CLAUDE.md`의 Page Entry
     표)를 조립한다(규칙 4). `Depends On`에 있는 Component/Data/Server Action의
     결과물을 **import해서 화면을 구성**하고, `src/components/**` 아래 새 컴포넌트
     파일을 이 Task에서 만들지 않는다(Skill §5). Section 순서는 § Functional AC에
     적힌 순서를 그대로 따른다.
   - **COMPONENT / DATA / DB / AUTH / SERVER_ACTION / TOOLING / UNIT_TEST /
     E2E_TEST**: § Expected Files 안에서 실제 코드(또는 테스트 코드, 정적 데이터,
     SQL 마이그레이션)를 작성한다.
   - 모든 카테고리 공통: § **Functional AC**, **Visual AC**, **Security/Privacy AC**
     를 전부 만족하도록 구현한다(규칙 3). Visual AC는 `design-reference/D-001/
     DESIGN.md`에 없는 색상·폰트·컴포넌트를 임의로 추가하지 않고 그 토큰만 사용한다.
     Security/Privacy AC에 항공·숙소 입력값 서버 미저장, RLS, Service Role Key
     클라이언트 미사용 등이 있으면 그대로 지킨다(Skill §7·§8).

4. **관련 Unit Test 실행(규칙 5).** 이 Task와 관련된 Vitest 테스트가 있으면
   실행한다. **`package.json`에 아직 `vitest`가 설치돼 있지 않다면**(현재 상태),
   이 Task가 그 설치 자체를 담당하는 Task가 아닌 한 임의로 설치하지 않는다 — 대신
   "관련 Unit Test 미실행(테스트 인프라 미설치)"이라고 완료 보고에 정직하게 남긴다.
   테스트가 존재하고 실행했다면 통과/실패 결과를 그대로 보고한다(실패를 숨기거나
   축소하지 않는다).

5. **Playwright는 PAGE_OWNER 또는 E2E_TEST일 때만(규칙 6).** 이번 Task의 Category가
   `PAGE_OWNER` 또는 `E2E_TEST`일 때만 § Verify에 적힌 Chromium Smoke를 실행한다
   (`PLAYWRIGHT_SCOPE=chromium-smoke` — Firefox/WebKit로 확장하지 않는다). 그 외
   Category(Component/Data/DB/Auth/Server Action/Tooling/Unit Test)에서는 Playwright를
   실행하지 않는다. Playwright가 아직 설치돼 있지 않다면 4번과 같은 방식으로
   "미실행(인프라 미설치)"을 정직하게 보고한다.

6. **금지 사항 재확인(규칙 7).** 작성한 코드에 아래가 섞이지 않았는지 diff를 직접
   훑어 확인한다.
   - AWS·EC2 등 AWS 리소스 프로비저닝 코드/설정(`CLAUDE.md` 규칙 17, Skill §12)
   - Prisma 등 ORM 의존성·스키마 파일(DB 접근은 Supabase 클라이언트 쿼리 헬퍼만,
     Skill §6)
   - 자동 Merge/자동 병합 파이프라인 코드나 GitHub Actions 설정(`CLAUDE.md` 규칙 21,
     Skill §12)
   - `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능(`CLAUDE.md` 규칙 19)
   하나라도 발견되면 해당 코드를 제거하고 다시 확인한다.

7. **Diff 확인.** `git status --porcelain`(읽기 전용)으로 변경된 파일 목록을 뽑아,
   § Expected Files와 정확히 일치하는지 확인한다. 목록 밖 파일이 바뀌었다면 의도한
   변경이 아니므로 원복하거나 사용자에게 보고하고 지시를 받는다 — 임의로 추가
   커밋 대상에 포함하지 않는다.

8. **(부가, 있는 경우만) `TASKS/WAVE_STATE.json` 갱신.** `TASKS/WAVE_STATE.json`이
   이미 존재한다면(`/prepare-task`가 이 파일로 검사 3을 수행했다는 뜻), 이
   `TASK_ID`의 `status`만 `DONE`으로 갱신한다(구현 시작 시 `IN_PROGRESS`로 먼저
   갱신했다면 그 값을 덮어쓴다) — 다른 Task의 상태나 파일의 다른 필드를 건드리지
   않는다. 이 파일이 아직 없다면(Wave 계획 미수립) 아무것도 하지 않는다 — 이
   Command가 `TASKS/WAVE_PLAN.md`나 `TASKS/WAVE_STATE.json`을 새로 만들지 않는다
   (그건 `/run-wave`가 오케스트레이션할 때, 또는 별도 Wave 계획 절차의 책임이다).
   `/run-wave`가 이 Command를 호출하는 경우, `IN_PROGRESS`/`DONE` 갱신은 `/run-wave`
   쪽 책임이 될 수도 있다 — 이미 그쪽에서 갱신했다면 중복 갱신하지 않는다.

9. **(선택, 사용자가 명시적으로 요청한 경우만) Task 단위 Commit.** 사용자가 이번
   요청에서 "커밋해줘"처럼 명시적으로 요청했을 때만, 이 Task의 변경 파일만(7번에서
   확정한 목록) `git add`한 뒤 Task ID를 포함한 커밋 메시지로 커밋 하나를 만든다.
   Push나 PR 생성은 요청받아도 하지 않는다 — 그 요청이 오면 "Push/PR은 사람이
   직접 한다(DEC-012)"고 안내한다.

10. **완료 보고(규칙 8).** 아래 형식으로 보고한다.

```
IMPLEMENT_TASK_RESULT
WAVE_ID: <입력값>
TASK_ID: <입력값>

변경 파일:
- <Expected Files와 실제 git diff 목록 — 생성/수정 구분>

검증:
- Unit Test: 실행함(PASS/FAIL, 케이스 수) | 미실행(사유)
- Playwright: 실행함(PASS/FAIL) | 해당 없음(Category가 PAGE_OWNER/E2E_TEST 아님) | 미실행(사유)
- 금지 사항 재확인: AWS/EC2/ORM/자동 Merge/EXCLUDED 기능 없음 확인함

남은 제약·후속 조치:
- <예: Unit Test 인프라 미설치로 자동 검증 못 함, TASKS/WAVE_STATE.json 없어 상태 갱신 못 함,
  이 Task의 Definition of Done 중 사람 확인이 필요한 항목 등>

Commit: 수행 안 함 | <사용자 요청으로 수행, 커밋 해시>
Push/PR: 수행 안 함(항상 사람이 수동으로 진행)
```

- 이 보고에 실제로 실행/확인하지 않은 것을 "통과"라고 적지 않는다. 미실행은
  미실행이라고 쓴다.

## 금지 사항 요약

- Expected Files 밖 파일 수정 금지.
- AWS·EC2, Prisma 등 ORM, 자동 Merge 관련 코드·설정 추가 금지.
- `docs/PROJECT_SCOPE.md` EXCLUDED 기능 구현 금지.
- Playwright는 PAGE_OWNER/E2E_TEST Task에서만, Chromium Smoke로만 실행.
- 사용자가 요청하지 않는 한 Commit 금지, 요청해도 Push·PR은 항상 금지.
- `git reset --hard`/`push --force`/`clean -f` 등 destructive Git 명령 금지
  (`CLAUDE.md` 규칙 20).
