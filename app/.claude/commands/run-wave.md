---
description: Wave 단위 개발의 표준 진입점. WAVE_PLAN·WAVE_STATE를 읽어 READY Task를 Depends On 순서로 하나씩 prepare-task→implement-task로 처리한다. --status/--resume/--dry-run 옵션을 지원하며 자동 Branch·PR·Merge·Push는 하지 않는다.
argument-hint: <WAVE_ID> [--dry-run|--resume|--status]
---

`traveler-project-pipeline` Skill을 로드하고 `CLAUDE.md`의 Harness Marker·23개 규칙
(특히 규칙 6·7·21·22)을 따른다. 이 Command는 `/prepare-task`와 `/implement-task`를
**그대로 호출**하는 오케스트레이터다 — 그 둘의 검사·구현 로직을 이 문서에서 다시
정의하지 않는다.

## 입력

| 입력 | 필수 | 설명 |
|---|---|---|
| `WAVE_ID` | 예 | 예: `W03`. 모든 호출에 항상 필요하다 — `--status`/`--resume`도 예외 없다. |
| `--dry-run` | 선택 | 실행할 Task·파일·검증·Checkpoint만 보여주고 아무것도 바꾸지 않는다. |
| `--resume` | 선택 | 이 Wave에서 `PENDING` 또는 `BLOCKED`(그리고 중단된 `IN_PROGRESS`) 상태인 첫 Task부터 다시 시작한다. |
| `--status` | 선택 | 읽기 전용. 이 Wave와 각 Task의 현재 상태만 보여준다. |

옵션은 최대 1개만 함께 쓴다(`--dry-run --resume`처럼 동시 지정 금지 — 동시 지정 시
`BLOCKED_INPUT`으로 안내하고 멈춘다). 옵션이 없으면 "기본 동작"(아래)을 수행한다.

## 지원 명령

| 명령 | 동작 |
|---|---|
| `/run-wave W03` | 기본 동작 — 이 Wave의 READY Task를 Depends On 순서로 하나씩 prepare→implement(아래 "기본 동작" 참고) |
| `/run-wave W03 --status` | 읽기 전용. 이 Wave의 각 Task 상태, WAITING_FOR_PREVIEW 여부, 다음 READY Task, 그리고 전체 Wave 목록의 한 줄 요약을 보고한다. 아무 것도 실행/변경하지 않는다 |
| `/run-wave W03 --resume` | 이 Wave에서 아직 끝나지 않은 첫 Task(`PENDING`/`BLOCKED`/중단된 `IN_PROGRESS`)부터 기본 동작과 같은 방식으로 이어간다 |
| `/run-wave W03 --dry-run` | 기본 동작과 같은 순서로 Task를 선택하고 `/prepare-task`(읽기 전용)까지 실행하지만, **`/implement-task`는 호출하지 않는다.** 어떤 파일도 쓰지 않고 처리 순서·Expected Files·적용될 검증·Preview Checkpoint 위치만 보고한다 |

## WAVE_PLAN과 WAVE_STATE

이 저장소에는 두 파일이 이미 존재한다(`scripts/build_waves.py`가 생성 —
`TASKS/TASK_MANIFEST.csv`와 각 `TASKS/TASK-<ID>.md`의 `Depends On`을 기준으로
계산됨). 이 Command는 두 파일을 **읽고 갱신**하지만, 없어지면 다시 만들지
않는다(아래 "두 파일이 없을 때" 참고) — Wave 재계산이 필요하면
`python3 scripts/build_waves.py`를 사람이 직접 실행한다.

- **`TASKS/WAVE_PLAN.md`**(정적) — 어떤 Task가 어떤 Wave에 속하는지와 Preview
  Checkpoint 위치를 정의한다.

  ```markdown
  | Wave ID | Task ID | Preview Checkpoint |
  |---|---|---|
  | W01 | TOOL-DESIGN-TOKENS | |
  | W10 | PAGE-SCR001 | YES |
  ```

  실행 순서 자체는 이 표의 행 순서가 아니라 **각 Task의 `Depends On`**(`TASKS/
  TASK-<ID>.md`)이 결정한다 — 이 표는 "이 Wave에 무엇이 포함되는가"와 "어디서 사람이
  멈춰서 봐야 하는가(Preview Checkpoint)"만 정의한다. **Wave ID의 순서**(W01 < W02 <
  … 숫자 오름차순)는 "이전 Wave가 완료됐는가"(규칙 1) 판정에도 쓰인다.

- **`TASKS/WAVE_STATE.json`**(동적, 이 Command가 갱신) — 실행 중 상태를 기록한다.
  두 종류의 상태를 담고 있으며 **서로 다른 용도**다.

  ```json
  {
    "current_wave": "W10",
    "waiting_for_preview": false,
    "tasks": {
      "TOOL-DESIGN-TOKENS": {"status": "DONE", "updated_at": "2026-09-17T00:00:00Z"},
      "PAGE-SCR001": {"status": "IN_PROGRESS", "updated_at": "2026-09-17T00:05:00Z"}
    },
    "last_run": {"wave_id": "W10", "task_id": "PAGE-SCR001", "result": "DONE"},
    "waves": [
      {"wave_id": "W10", "title": "4. SCR-001 메인 Component와 Page Owner",
       "task_ids": ["PAGE-SCR001"], "status": "pending",
       "checkpoint_required": true, "checkpoint_result": null}
    ]
  }
  ```

  - **`tasks["<Task ID>"].status`**(대문자) — Task 단위 진행 상태. `PENDING`(초기값,
    파일에 없으면 PENDING으로 간주) / `IN_PROGRESS` / `DONE` / `BLOCKED` 중 하나다.
    **`READY`는 저장된 값이 아니라 매번 다시 계산한다**: `status == PENDING`이고 그
    Task의 모든 `Depends On`이 `WAVE_STATE`에서 `DONE`이면 READY다.
  - **`waves[].status`**(소문자) — Wave 단위 요약 상태. `pending`(아직 시작 안 함) /
    `in_progress`(처리 중) / `blocked`(Task가 하나라도 BLOCKED로 멈춤) /
    `completed`(이 Wave의 모든 Task가 DONE) 중 하나이며, **이 Command가 각 단계마다
    직접 갱신한다**(아래 "기본 동작" 2·3·7단계). `checkpoint_required`는
    `build_waves.py`가 계산해 넣은 고정값(Page Owner 또는 Release Checkpoint
    Wave 여부)이고, `checkpoint_result`는 사람이 Preview를 확인한 뒤 이 Command가
    `"CONFIRMED"`로 채운다(8단계).

- **두 파일 중 하나라도 없으면 이 Command는 실행할 수 없다** — 임의로 만들지 않고
  "`TASKS/WAVE_PLAN.md`(또는 `WAVE_STATE.json`)가 없어 실행할 수 없음, 먼저
  `python3 scripts/build_waves.py`로 Wave 계획을 만들라"고 보고하고 멈춘다
  (`--status`도 동일하게 차단된다 — 상태를 보여줄 대상 자체가 없다).

## 사전 검사(규칙 1) — 이전 Wave 완료 여부

`--status`를 제외한 모든 호출(기본 동작, `--resume`, `--dry-run`)은 실제 처리를
시작하기 전에 이 검사부터 한다.

1. `TASKS/WAVE_PLAN.md`에 등장하는 모든 Wave ID를 숫자 오름차순으로 나열해, 이번
   `WAVE_ID`보다 앞선 Wave ID 집합을 구한다(`W01`이 대상이면 앞선 Wave가 없어 이
   검사를 통과한 것으로 본다).
2. 앞선 각 Wave에 대해, 그 Wave에 속한 **모든** Task ID의 `TASKS/WAVE_STATE.json`
   `tasks[<ID>].status`가 `DONE`인지 확인한다. 하나라도 `DONE`이 아니면(항목이 아예
   없어 `PENDING`으로 간주되는 경우 포함) 이전 Wave가 미완료인 것이다.
3. 이전 Wave 중 하나라도 미완료면 **이번 Wave를 시작하지 않는다.** `BLOCKED`로
   보고하고 멈춘다 — 어느 Wave의 어느 Task가 아직 `DONE`이 아닌지 전부 나열한다.
   `--dry-run`도 동일하게 차단한다(미리보기 대상 자체가 아직 시작할 수 없는
   Wave이므로, 그 사실을 정직하게 보여주는 것이 dry-run의 역할이다).

## 기본 동작 — `/run-wave W03`

1. **WAVE_PLAN과 WAVE_STATE를 읽는다.** `TASKS/WAVE_PLAN.md`에서 `Wave ID == W03`인
   행을 모두 모아 이 Wave의 Task 집합을 만들고, `TASKS/WAVE_STATE.json`에서 각
   Task의 현재 `status`를 가져온다. 사전 검사(규칙 1)를 통과해야 이 단계로 온다.

2. **Wave 상태를 `in_progress`로 갱신한다(첫 처리 시작 시 1회).**
   `TASKS/WAVE_STATE.json`의 `waves[]`에서 `wave_id == W03`인 항목의 `status`가
   아직 `pending`이면 `in_progress`로 바꾸고, `current_wave`를 `W03`으로 갱신한다.

3. **현재 Wave의 READY Task를 Depends On 순서로 하나 선택한다.** 이 Wave의 Task
   중 `status == PENDING`이고 모든 `Depends On`이 `DONE`인 것을 READY로 분류한다.
   READY가 여러 개면 `TASKS/WAVE_PLAN.md`에 먼저 나오는 행을 선택한다(계획 작성
   시 의존관계를 거스르지 않는 순서로 나열돼 있어야 한다). READY가 하나도 없는데
   아직 `DONE`이 아닌 Task가 남아 있으면 정체(stall) 상태로 보고하고 멈춘다(아래
   "정체 상태" 참고).

4. **이 Wave에 Page Owner Task가 있으면 Browser Checkpoint 설정을 재확인한다
   (규칙 4).** 이 Wave의 Task 중 Category가 `PAGE_OWNER`인 것이 있는데
   `TASKS/WAVE_PLAN.md`의 그 행에 `Preview Checkpoint: YES`가 없으면, 계획 자체의
   결함이므로 **Task 처리를 시작하지 않고** `BLOCKED`로 보고한다("Page Owner
   Task는 Browser Checkpoint 없이 진행할 수 없음 — `TASKS/WAVE_PLAN.md`를
   재생성하거나 수동으로 YES를 추가하라"). 이 재확인은 Wave당 한 번만 하면 된다.

5. **`/prepare-task W03 <선택된 Task ID>`를 실행한다.** 결과가
   `READY_TO_IMPLEMENT`가 아니면:
   - `TASKS/WAVE_STATE.json`의 해당 Task `status`를 `BLOCKED`로 갱신한다.
   - **이 Wave의 `waves[].status`를 `blocked`로 갱신한다(규칙 2).**
   - 받은 `BLOCKED_*` 상태와 근거를 그대로 보고하고 **Wave 처리를 멈춘다**(다른
     Task로 건너뛰지 않는다 — 규칙 7의 "한 번에 하나만" 원칙).

6. **`/implement-task W03 <선택된 Task ID>`를 실행한다.**
   `TASKS/WAVE_STATE.json`의 해당 Task `status`를 먼저 `IN_PROGRESS`로 갱신한 뒤
   호출한다. `--commit`은 사용자가 `/run-wave` 자체를 호출할 때 명시적으로 커밋을
   요청한 경우에만 전달한다 — 기본은 커밋하지 않는다(규칙 6 "자동" Commit
   금지이지, 사람이 그 자리에서 요청한 Commit까지 막는 것은 아니다). Push·PR
   관련 옵션은 애초에 존재하지 않는다(§ "포함하지 않는 기능" 참고).

7. **관련 검증이 PASS하면 Task 상태를 DONE으로 갱신한다(규칙 3).**
   `/implement-task`의 완료 보고에서 해당 Category에 적용되는 검증(Unit Test는
   관련 있으면 항상, Playwright는 Category가 PAGE_OWNER/E2E_TEST일 때만)이
   **실제로 실행되어 PASS**했는지 확인한다.
   - 검증이 적용되고 실제로 PASS했으면 `TASKS/WAVE_STATE.json`의 `status`를
     `DONE`으로 갱신한다.
   - 검증이 FAIL했거나, 적용돼야 하는데 **테스트 인프라 미설치 등으로 실행 자체가
     안 됐다면** `DONE`으로 갱신하지 않는다 — `status`를 `BLOCKED`로,
     `waves[].status`를 `blocked`로 갱신하고 사유(FAIL 내용 또는 "테스트 인프라
     없음")를 그대로 보고한 뒤 Wave 처리를 멈춘다. 검증되지 않은 Task를 다음
     Task의 전제 조건(Depends On DONE)으로 삼지 않는다.

8. **같은 Wave의 다음 READY Task를 계속 처리한다.** 방금 완료한 Task의
   `TASKS/WAVE_PLAN.md` 행에 `Preview Checkpoint`가 없으면 3번으로 돌아가 다음
   Task를 선택한다.

9. **Wave Task가 모두 DONE이면 종료한다.** 이 Wave에 속한 모든 Task의 `status`가
   `DONE`이면 처리를 멈추고, **`waves[].status`를 `completed`로 갱신한 뒤**
   완료를 보고한다(§ 출력 형식). `current_wave`는 그대로 두거나(다음 Wave 시작은
   사람이 `/run-wave W0(N+1)`로 명시적으로 호출) 사용자 안내에 맡긴다 — 이
   Command가 다음 Wave를 임의로 자동 시작하지 않는다(규칙 5).

10. **사람 Browser Checkpoint가 있으면 WAITING_FOR_PREVIEW로 종료한다(규칙 4·5).**
    방금 완료한 Task의 `TASKS/WAVE_PLAN.md` 행이 `Preview Checkpoint: YES`면, 이
    Wave에 READY Task가 더 남아 있어도 여기서 멈춘다. `TASKS/WAVE_STATE.json`의
    `waiting_for_preview`를 `true`로 갱신하고, **`WAITING_FOR_PREVIEW` 상태로
    종료**한다(`CLAUDE.md` 규칙 22 — 사람이 실제 브라우저에서 Preview를 확인하기
    전까지 다음 Wave는 물론 같은 Wave의 남은 Task도 더 진행하지 않는다). 이때
    `checkpoint_result`는 아직 `null`로 둔다 — 사람이 확인했다는 사실은 이
    Command가 추측하지 않는다.

    사람이 실제 브라우저로 확인한 뒤에는 두 가지를 한다: (a) 해당 Screen의
    `docs/preview-checks/SCR-<NNN>.md`에 확인일·확인자·Preview URL을 채운다
    (`scripts/check_screen_contract.py --mode=release`가 이 파일로 검사한다),
    (b) `/run-wave W03 --resume` 또는 같은 `/run-wave W03`를 다시 호출한다 —
    그때 `waiting_for_preview`를 `false`로, `checkpoint_result`를 `"CONFIRMED"`로
    갱신하고 이어간다.

## `--status` 동작

읽기 전용 — 아무것도 쓰지 않는다. 지정한 `WAVE_ID`에 대해 다음을 보여준다:
Task별 현재 `status`, `waiting_for_preview` 여부, 계산된 다음 READY Task, 이 Wave의
`waves[].status`. 덧붙여 `TASKS/WAVE_STATE.json`의 `waves[]` 전체를
`<Wave ID>: <status>` 한 줄 표로 요약해, 다른 Wave들의 진행 상황도 한눈에 보이게
한다(이 요약 표시는 추가 파일을 읽지 않고 이미 읽은 `WAVE_STATE.json`에서만
계산하므로 비용이 없다).

## `--dry-run` 동작

기본 동작의 3·4단계(READY Task 선택, Page Owner Browser Checkpoint 재확인)까지
그대로 수행하고, 선택된 Task에 대해 `/prepare-task`(읽기 전용)를 실제로 실행한다.
**여기서 멈춘다 — `/implement-task`는 호출하지 않고 어떤 파일도 쓰지 않는다**
(`TASKS/WAVE_STATE.json`도 갱신하지 않는다). `READY_TO_IMPLEMENT`가 아니면 그
결과와 근거를 그대로 보여주고 멈춘다(실제로 그 Task부터 막힐 것이라는 뜻이므로,
다음 Task를 임의로 미리보지 않는다). `READY_TO_IMPLEMENT`면 다음을 보고한다:

- 그 Task의 Expected Files(생성/수정 구분)
- Task 완료 순서상 적용될 검증(Unit Test 대상 여부, Playwright 대상 여부 —
  Category가 PAGE_OWNER/E2E_TEST인지로 판단)
- 이 Task 이후 Preview Checkpoint가 걸리는지(`TASKS/WAVE_PLAN.md` 해당 행)
- (선택) 이후 남은 READY 후보들도 같은 방식으로 계속 나열할 수 있으나, 각
  Task는 이전 Task가 실제로 `DONE`이 됐다는 가정 위에서만 유효한 예측이라는 점을
  분명히 밝힌다 — dry-run은 예측이지 보장이 아니다.

## `--resume` 동작

1. 사전 검사(규칙 1)를 동일하게 통과해야 한다.
2. 이 Wave의 Task를 Depends On 순서로 훑어, `status`가 `PENDING`, `BLOCKED`,
   또는 `IN_PROGRESS`인 **첫** Task를 찾는다(이 세 상태 중 어느 것이든 "아직 끝나지
   않음"으로 취급한다 — `BLOCKED`도 사람이 원인을 고친 뒤 다시 시도해 볼 대상으로
   본다는 점이 기본 동작과의 차이다).
3. 그 Task가 `IN_PROGRESS`였다면(직전 실행이 완료 보고 없이 중단된 경우), 먼저
   `/prepare-task`를 다시 실행해 안전하게 재개 가능한지 확인한다(특히 검사 1
   "Working Tree 상태" — 중단된 Task의 Expected Files 밖에 변경이 남아있지 않은지).
   `READY_TO_IMPLEMENT`가 아니면 `BLOCKED`로 보고하고 멈춘다.
4. 그 Task부터 "기본 동작"의 5단계 이후와 동일하게 진행한다(`READY_TO_IMPLEMENT`
   확인 → 구현 → 검증 → DONE, 그다음 Wave의 나머지 Task로 계속).

### 정체(Stall) 상태

READY Task가 없는데 아직 `DONE`이 아닌 Task가 남아 있으면(예: 전부 `BLOCKED`거나,
남은 Task의 `Depends On`이 다른 아직 시작 안 된 Wave의 Task를 가리킴) `STALLED`로
보고하고 멈춘다. 원인(`BLOCKED` Task 목록, 아직 해결 안 된 `Depends On`)을 그대로
보여준다.

## 출력 형식

```
RUN_WAVE_RESULT
Command: /run-wave W03 [--dry-run|--resume|--status]

완료 Task:
- <Task ID>: <제목> — DONE
- ...(이번 호출에서 새로 DONE이 된 Task만. --status/--dry-run이면 "해당 없음")

변경 파일:
- <Task ID>: <Expected Files 중 실제로 생성/수정된 파일 목록>
- ...(여러 Task를 처리했으면 Task별로 구분. --status/--dry-run이면 "해당 없음 — 아무 파일도 쓰지 않음")

통과한 검사:
- <Task ID>: Unit Test PASS(N건) | 해당 없음(Category 무관) | Playwright PASS
- ...

남은 수동 Browser 확인:
- <있으면> "<Screen ID>(<Route>)를 실제 브라우저로 확인 후 docs/preview-checks/<Screen ID>.md에 기록하라"
- <없으면> "해당 없음"

다음에 입력할 명령:
- <상태에 따라 정확히 하나 — 예: "/run-wave W10"(WAITING_FOR_PREVIEW 해소 후 이어가기),
  "/run-wave W11"(다음 Wave 시작), "/run-wave W10 --resume"(BLOCKED 원인 해결 후),
  또는 "없음 — 전체 Wave 완료">

최종 상태: WAVE_COMPLETE | WAITING_FOR_PREVIEW | BLOCKED | STALLED
```

`--status`/`--dry-run` 호출은 "완료 Task"·"변경 파일" 대신 각각 "현재 기록된
상태"(status) 또는 "예정된 처리 순서"(dry-run)를 같은 골격으로 보여주고, 실제로는
아무 것도 바꾸지 않았다는 점을 본문에 명시한다.

## 포함하지 않는 기능

- **자동 Branch 생성.** 이 Command는 Git Branch를 만들거나 전환하지 않는다.
- **자동 PR 생성.** `gh pr create` 등을 호출하지 않는다.
- **자동 Merge.** `AUTO_MERGE=false`(`CLAUDE.md` Harness Marker)를 그대로 따르며,
  어떤 상황에서도 Merge를 시도하지 않는다.
- **자동 Push.** `/implement-task`가 만든 Commit이 있어도 Push하지 않는다.
- **자동 Commit.** 사람이 `/run-wave` 호출 시 그 자리에서 명시적으로 요청하지 않는
  한 Commit도 만들지 않는다(규칙 6의 "자동"은 이 의미다 — 사람이 즉석에서 요청한
  Commit까지 금지하는 것은 아니다. Push·PR·Merge는 요청해도 항상 금지).
- **다음 Wave 자동 시작.** 한 Wave가 끝나거나 `WAITING_FOR_PREVIEW`가 되면, 사람이
  다음 `/run-wave WXX`를 명시적으로 호출하기 전까지 스스로 이어가지 않는다(규칙 5).

Branch·PR·Merge·Push는 전부 사람이 수동으로 수행한다(DEC-012, `CLAUDE.md` 규칙 21).
