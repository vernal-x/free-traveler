---
description: WAVE_ID·TASK_ID로 지정한 Task를 실제로 구현하기 전에 8개 착수 조건을 검사하고 READY_TO_IMPLEMENT/BLOCKED_* 상태를 보고한다. 코드는 수정하지 않는다.
argument-hint: <WAVE_ID> <TASK_ID>
---

`traveler-project-pipeline` Skill을 로드하고 `CLAUDE.md`의 Harness Marker·23개 규칙,
특히 "Task 완료 순서"의 1~2단계(Task 읽기 → 입력 확인)를 이 명령으로 구체화한다.

## 이 Command는 코드를 수정하지 않는다

- 파일을 쓰거나 지우지 않는다. `git add`/`commit`/`stash`/`reset`/`checkout` 등 상태를
  바꾸는 Git 명령을 실행하지 않는다 — `git status --porcelain`, `git diff --stat`처럼
  **읽기 전용** 명령만 쓴다(`CLAUDE.md` 규칙 20).
- 이 명령의 유일한 산출물은 아래 "출력" 절의 보고 텍스트다. `TASKS/WAVE_PLAN.md`나
  `TASKS/WAVE_STATE.json`이 없어도 이 명령이 대신 만들지 않는다 — 없으면 그 자체가
  `BLOCKED_INPUT` 사유다.
- 검사 결과 `READY_TO_IMPLEMENT`가 나와도 이 명령이 구현을 시작하지 않는다. 실제
  구현(`CLAUDE.md` Task 완료 순서의 3단계 이후)은 별도로 진행한다.

## 입력

| 입력 | 설명 |
|---|---|
| `WAVE_ID` | 예: `W01`. 이 Task를 착수하려는 Wave(`CLAUDE.md` 규칙 6의 `/run-wave WXX`와 동일 체계). |
| `TASK_ID` | 예: `PAGE-SCR001`, `CMP-SCR003-FLIGHT-FORM`. `TASKS/00_TASK_LIST.md`의 실제 Task ID. |
| 선택된 상세 Task 파일 | `TASKS/TASK-<TASK_ID>.md` — 이 명령이 직접 열어 읽는다(추정 금지). |

인자가 비어 있거나 형식이 다르면(`WAVE_ID`가 `W`+숫자가 아님, `TASK_ID`가
`TASKS/00_TASK_LIST.md`에 없음) 즉시 `BLOCKED_INPUT`으로 종료하고 나머지 검사는
생략한다.

## WAVE_PLAN·WAVE_STATE — 검사 2·3의 전제

검사 2·3은 어떤 Task가 어떤 Wave에 속하고(계획) 완료됐는지(상태)를 알아야 한다.
이 정보의 정본은 `/run-wave` 명령이 정의하는 두 파일이다(자세한 스키마는
`.claude/commands/run-wave.md` 참고).

- **`TASKS/WAVE_PLAN.md`**(정적) — `Wave ID | Task ID | Preview Checkpoint` 표.
  검사 2(Wave 포함 여부)는 이 파일에서 `WAVE_ID`+`TASK_ID` 행이 있는지만 본다.
- **`TASKS/WAVE_STATE.json`**(동적) — `{"tasks": {"<Task ID>": {"status": "..."}}}`
  형태. 검사 3(Depends On 완료 여부)은 각 의존 Task의 `status`가 `DONE`인지 본다.

**두 파일 중 하나라도 없으면 이 명령은 파일을 만들지 않고** 검사 2·3을
`BLOCKED_INPUT`으로 보고한다(아직 Wave 계획이 수립되지 않은 정상적인 상태일 수
있다). `WAVE_STATE.json`에 특정 Task의 항목이 아예 없으면 `PENDING`으로 간주한다.
`status`가 `DONE`이 아니면(있으나 값이 다르거나, 아예 없으면) 미완료로 판단하고
**불확실하면 안전한 쪽(미완료)으로 판단**한다 — 파일 존재 여부만으로 완료를
추정하는 폴백 휴리스틱은 쓰지 않는다(`WAVE_STATE.json`이 완료 여부의 유일한
정본이다).

## 절차 — 8개 검사

각 검사는 PASS 또는 FAIL과 근거 메시지를 남긴다. 하나라도 FAIL이면
`READY_TO_IMPLEMENT`를 내지 않는다.

1. **Working Tree 상태.** `git status --porcelain`을 읽기 전용으로 실행한다. 변경된
   파일이 없으면 PASS. 변경된 파일이 있으면, 그 파일들이 **전부** 이번
   `TASK_ID`의 Expected Files 안에만 있는지 확인한다 — 그렇다면 "이전 시도 재개"로
   보고 PASS(정보로 남김), 그 외 파일이 섞여 있으면 FAIL → `BLOCKED_DIRTY_TREE`.

2. **Task가 현재 Wave에 포함되는지.** `TASKS/WAVE_PLAN.md`를 읽어 `Wave ID` 열이
   `WAVE_ID`이고 `Task ID` 열이 `TASK_ID`인 행이 있는지 확인한다. `TASKS/WAVE_PLAN.md`가
   없거나, `WAVE_ID` 행 자체가 없거나, 그 Wave에 이 `TASK_ID`가 없으면 FAIL →
   `BLOCKED_INPUT`.

3. **Depends On 완료 여부.** `TASKS/TASK-<TASK_ID>.md` § Depends On의 각 ID에 대해
   `TASKS/WAVE_STATE.json`의 `tasks[<ID>].status`가 `DONE`인지 확인한다("없음"이면
   검사 통과). `TASKS/WAVE_STATE.json`이 없거나, 하나라도 `DONE`이 아니면(항목이
   아예 없어 `PENDING`으로 간주되는 경우 포함) FAIL → `BLOCKED_DEPENDENCY`. 어떤
   의존 Task가 아직 안 됐는지 전부 나열한다.

4. **Expected Files.** `TASKS/TASK-<TASK_ID>.md` § Expected Files를 읽어, "생성"
   표시 파일은 아직 없어야 하고(있으면 경고로 남기되, SCR-001의 `page.tsx`처럼
   "수정(교체)"로 명시된 예외는 정상), "수정" 표시 파일은 이미 있어야 한다. 경로가
   프로젝트 밖으로 나가거나(`../` 남용) 다른 Screen/Task 소관 디렉터리
   (`src/components/scr0XX/*`를 Page Owner Task가 갖는 경우 등, Skill §5 위반)를
   침범하면 FAIL → `BLOCKED_SCOPE`. 그 외 단순 불일치(파일 존재 여부만 다름)는
   FAIL → `BLOCKED_INPUT`.

5. **SRS·Scope·Design·Screen Ref.** 다음을 실제로 읽어 대조한다.
   - `TASKS/TASK-<TASK_ID>.md` § Requirement Ref의 각 ID가 `docs/PROJECT_SCOPE.md`·
     `docs/UIUX_TRACEABILITY.md`에 존재하고 Implementation Status가 EXCLUDED가
     아닌지.
   - § Screen / Route / Page Entry가 `design-reference/SCREEN_ROUTE_CONTRACT.json`의
     같은 Screen 항목과 일치하는지.
   - § Design Ref가 가리키는 절이 `design-reference/D-001/DESIGN.md`·
     `design-reference/UI_CONTRACT.md`에 실제로 존재하는지.
   불일치가 하나라도 있으면 FAIL → `BLOCKED_INPUT`(참조가 깨진 Task 정의 자체의
   문제이므로 구현을 시작하지 않는다).

6. **필요한 환경변수 이름.** Task의 Category·Expected Files·Depends On을 보고 필요한
   환경변수 **이름만** 판단한다(값은 절대 출력하지 않는다).
   - Supabase Auth/DB/Server Action 관련(`AUTH-*`, `DB-*`, `SA-*` 및 이들에 의존하는
     Component/Page Owner): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
     서버 전용 권한이 필요한 Task(예: `SA-ACCOUNT-DELETE`)는 추가로
     `SUPABASE_SERVICE_ROLE_KEY`.
   - 외부 링크 기본값 관련(`DB-SEED-BASE`, `SA-EXTERNAL-URL-SETTINGS`):
     `FLIGHT_OUTBOUND_URL_DEFAULT`, `HOTEL_OUTBOUND_URL_DEFAULT`.
   - 그 외 Task(정적 Data, Tooling, 순수 UI Component 등): 없음.
   판단된 각 이름이 `.env.local`(또는 동등 환경변수 소스)에 **키로서 존재하는지만**
   확인한다(값 비교·출력 금지). 이 Task에 필요한 이름 중 하나라도 없으면 FAIL →
   `BLOCKED_INPUT`(`docs/ARCHITECTURE.md` §18 착수 차단과 동일한 성격).

7. **Secret 하드코딩 위험.** 이번 Task의 Expected Files 중 이미 존재하는 파일(2번
   재개 시나리오)이 있으면, 그 파일들에서 하드코딩된 비밀값처럼 보이는 패턴(긴
   Base64/hex 토큰, `SUPABASE_SERVICE_ROLE_KEY`·`sk-`·`AKIA` 등으로 시작하는 리터럴,
   `password = "..."`류 리터럴 대입)을 읽기 전용으로 스캔한다. 하나라도 발견하면
   FAIL → `BLOCKED_SCOPE`(`CLAUDE.md` 규칙 15 위반 위험). 아직 파일이 없으면(신규
   생성 예정) 이 검사는 "해당 없음 — 규칙만 재확인"으로 PASS 처리하고, Task 상세의
   Security/Privacy AC·Forbidden에 Service Role Key 클라이언트 사용 금지가 명시돼
   있는지만 확인한다(Supabase 관련 Task인데 명시가 없으면 경고로 남긴다).

8. **EXCLUDED 범위 침범 여부.** `TASKS/TASK-<TASK_ID>.md`의 Functional AC·Expected
   Files·Forbidden 절에서 `docs/PROJECT_SCOPE.md`/`TASKS/00_TASK_LIST.md` §12
   NON_IMPLEMENTATION에 있는 기능(예: 콘텐츠 CMS 편집 UI, 미디어 업로드 승인 워크플로,
   범용 감사 로그, Moderator 개별 제재, 실시간 채팅, 별점/매너 점수, EC2/AWS,
   자동 Merge)을 구현하겠다는 문구가 있는지 찾는다. 발견되면 FAIL → `BLOCKED_SCOPE`.

## 출력

아래 5개 상태 중 정확히 하나를 **마지막 줄에 그대로** 출력한다(대문자, 토큰 그대로 —
`grep` 등으로 파싱 가능해야 한다).

```
READY_TO_IMPLEMENT
BLOCKED_INPUT
BLOCKED_DEPENDENCY
BLOCKED_DIRTY_TREE
BLOCKED_SCOPE
```

보고 형식:

```
PREPARE_TASK_RESULT
WAVE_ID: <입력값>
TASK_ID: <입력값>

1. Working Tree 상태: PASS|FAIL — <근거>
2. Wave 포함 여부: PASS|FAIL — <근거>
3. Depends On 완료 여부: PASS|FAIL — <근거>
4. Expected Files: PASS|FAIL — <근거>
5. SRS·Scope·Design·Screen Ref: PASS|FAIL — <근거>
6. 필요한 환경변수: PASS|FAIL — <필요 이름 목록과 존재 여부, 값은 절대 미출력>
7. Secret 하드코딩 위험: PASS|FAIL — <근거>
8. EXCLUDED 범위 침범 여부: PASS|FAIL — <근거>

<STATUS 토큰 한 줄>
```

- 여러 검사가 동시에 FAIL이면 **모든 FAIL을 다 보여준다**(첫 번째만 보고하지 않는다).
  최종 `STATUS`는 실패한 검사 중 가장 먼저(1→8 순서) 해당하는 카테고리를 대표로
  쓰되, 나머지 실패도 보고 본문에 그대로 남긴다.
- 8개 검사가 모두 PASS일 때만 `READY_TO_IMPLEMENT`를 출력한다.
- 이 보고는 "구현을 해도 좋다/아직 안 된다"는 판단이지, 구현 완료 보고가 아니다 —
  `READY_TO_IMPLEMENT`가 나온 뒤 실제 구현은 `CLAUDE.md`의 Task 완료 순서(3단계
  "구현"부터)를 별도로 따른다.
