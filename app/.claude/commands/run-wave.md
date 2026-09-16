---
description: Wave 단위 개발의 표준 진입점. WAVE_PLAN·WAVE_STATE를 읽어 READY Task를 Depends On 순서로 하나씩 prepare-task→implement-task로 처리한다. status/resume/dry-run 하위 명령을 지원하며 자동 Branch·PR·Merge는 하지 않는다.
argument-hint: <WXX> | status | resume | dry-run <WXX>
---

`traveler-project-pipeline` Skill을 로드하고 `CLAUDE.md`의 Harness Marker·23개 규칙
(특히 규칙 6·7·21·22)을 따른다. 이 Command는 `/prepare-task`와 `/implement-task`를
**그대로 호출**하는 오케스트레이터다 — 그 둘의 검사·구현 로직을 이 문서에서 다시
정의하지 않는다.

## 지원 명령

| 명령 | 동작 |
|---|---|
| `/run-wave W03` | 지정한 Wave의 READY Task를 순서대로 처리(아래 "W03 동작" 참고) |
| `/run-wave status` | 읽기 전용. WAVE_STATE의 현재 Wave, 각 Task 상태, WAITING_FOR_PREVIEW 여부, 다음 READY Task를 보고한다. 아무 것도 실행/변경하지 않는다 |
| `/run-wave resume` | WAVE_STATE의 `current_wave`를 이어서 처리한다. `IN_PROGRESS`로 남아 있는 Task가 있으면 먼저 그 Task에 대해 `/prepare-task`를 다시 실행해 안전하게 재개 가능한지 확인한 뒤 이어간다 |
| `/run-wave dry-run W03` | 아래 "W03 동작"과 같은 순서로 Task를 선택하고 `/prepare-task`(읽기 전용)까지 실행하지만, **`/implement-task`는 호출하지 않는다.** 어떤 파일도 쓰지 않고 처리 순서·예상 Preview Checkpoint 위치만 보고한다 |

## WAVE_PLAN과 WAVE_STATE

- **`TASKS/WAVE_PLAN.md`**(정적, 사람이 작성) — 어떤 Task가 어떤 Wave에 속하는지와
  Preview Checkpoint 위치를 정의한다.

  ```markdown
  | Wave ID | Task ID | Preview Checkpoint |
  |---|---|---|
  | W01 | TOOL-DESIGN-TOKENS | |
  | W01 | TOOL-LAYOUT-SHELL | |
  | W01 | DATA-DESTINATIONS | |
  | W01 | CMP-SCR001-HERO | |
  | W01 | PAGE-SCR001 | YES |
  ```

  실행 순서 자체는 이 표의 행 순서가 아니라 **각 Task의 `Depends On`**(`TASKS/
  TASK-<ID>.md`)이 결정한다 — 이 표는 "이 Wave에 무엇이 포함되는가"와 "어디서 사람이
  멈춰서 봐야 하는가(Preview Checkpoint)"만 정의한다.

- **`TASKS/WAVE_STATE.json`**(동적, 이 Command가 갱신) — 실행 중 상태를 기록한다.

  ```json
  {
    "current_wave": "W03",
    "waiting_for_preview": false,
    "tasks": {
      "TOOL-DESIGN-TOKENS": {"status": "DONE", "updated_at": "2026-09-17T00:00:00Z"},
      "PAGE-SCR001": {"status": "IN_PROGRESS", "updated_at": "2026-09-17T00:05:00Z"}
    },
    "last_run": {"wave_id": "W01", "task_id": "PAGE-SCR001", "result": "DONE"}
  }
  ```

  `status`는 `PENDING`(초기값, 파일에 없으면 PENDING으로 간주) / `IN_PROGRESS` /
  `DONE` / `BLOCKED` 중 하나다. **`READY`는 저장된 값이 아니라 매번 다시 계산한다**:
  `status == PENDING`이고 그 Task의 모든 `Depends On`이 `WAVE_STATE`에서
  `DONE`이면 READY다.

- **두 파일 중 하나라도 없으면 이 Command는 실행할 수 없다** — 임의로 만들지 않고
  "`TASKS/WAVE_PLAN.md`(또는 `WAVE_STATE.json`)가 없어 실행할 수 없음, 먼저 Wave
  계획을 수립하라"고 보고하고 멈춘다(`/run-wave status`도 동일). **현재 저장소에는
  이 두 파일이 아직 없다** — 즉 지금 `/run-wave`를 호출하면 이 상태를 그대로
  보고하는 것이 정상 동작이다.

## `/run-wave W03` 동작

1. **WAVE_PLAN과 WAVE_STATE를 읽는다.** `TASKS/WAVE_PLAN.md`에서 `Wave ID == W03`인
   행을 모두 모아 이 Wave의 Task 집합을 만들고, `TASKS/WAVE_STATE.json`에서 각
   Task의 현재 `status`를 가져온다.

2. **현재 Wave의 READY Task를 Depends On 순서로 하나 선택한다.** 이 Wave의 Task
   중 `status == PENDING`이고 모든 `Depends On`이 `DONE`인 것을 READY로 분류한다.
   READY가 여러 개면 `TASKS/WAVE_PLAN.md`에 먼저 나오는 행을 선택한다(계획 작성
   시 의존관계를 거스르지 않는 순서로 나열돼 있어야 한다). READY가 하나도 없는데
   아직 DONE이 아닌 Task가 남아 있으면 정체(stall) 상태로 보고하고 멈춘다(아래
   "정체 상태" 참고).

3. **`/prepare-task W03 <선택된 Task ID>`를 실행한다.** 결과가
   `READY_TO_IMPLEMENT`가 아니면:
   - `TASKS/WAVE_STATE.json`의 해당 Task `status`를 `BLOCKED`로 갱신한다.
   - 받은 `BLOCKED_*` 상태와 근거를 그대로 보고하고 **Wave 처리를 멈춘다**(다른
     Task로 건너뛰지 않는다 — 규칙 7의 "한 번에 하나만" 원칙).

4. **`/implement-task W03 <선택된 Task ID>`를 실행한다.**
   `TASKS/WAVE_STATE.json`의 해당 Task `status`를 먼저 `IN_PROGRESS`로 갱신한 뒤
   호출한다. `--commit`은 사용자가 `/run-wave` 자체를 호출할 때 명시적으로 커밋을
   요청한 경우에만 전달한다 — 기본은 커밋하지 않는다. Push·PR 관련 옵션은 애초에
   존재하지 않는다(§ "포함하지 않는 기능" 참고).

5. **관련 검증이 PASS하면 Task 상태를 DONE으로 갱신한다.** `/implement-task`의
   완료 보고에서 해당 Category에 적용되는 검증(Unit Test는 관련 있으면 항상,
   Playwright는 Category가 PAGE_OWNER/E2E_TEST일 때만)이 **실제로 실행되어
   PASS**했는지 확인한다.
   - 검증이 적용되고 실제로 PASS했으면 `TASKS/WAVE_STATE.json`의 `status`를
     `DONE`으로 갱신한다.
   - 검증이 FAIL했거나, 적용돼야 하는데 **테스트 인프라 미설치 등으로 실행 자체가
     안 됐다면** `DONE`으로 갱신하지 않는다 — `status`를 `BLOCKED`로 남기고
     사유(FAIL 내용 또는 "테스트 인프라 없음")를 그대로 보고한 뒤 Wave 처리를
     멈춘다. 검증되지 않은 Task를 다음 Task의 전제 조건(Depends On DONE)으로
     삼지 않는다.

6. **같은 Wave의 다음 READY Task를 계속 처리한다.** 방금 완료한 Task의
   `TASKS/WAVE_PLAN.md` 행에 `Preview Checkpoint`가 없으면 2번으로 돌아가 다음
   Task를 선택한다.

7. **Wave Task가 모두 DONE이면 종료한다.** 이 Wave에 속한 모든 Task의 `status`가
   `DONE`이면 처리를 멈추고 완료를 보고한다(§ 출력 형식). `WAVE_STATE`의
   `current_wave`는 그대로 두거나(다음 Wave 시작은 사람이 `/run-wave W0(N+1)`로
   명시적으로 호출) 사용자 안내에 맡긴다 — 이 Command가 다음 Wave를 임의로 자동
   시작하지 않는다.

8. **사람 Preview Checkpoint가 있으면 WAITING_FOR_PREVIEW로 종료한다.** 방금
   완료한 Task의 `TASKS/WAVE_PLAN.md` 행이 `Preview Checkpoint: YES`면, 이 Wave에
   READY Task가 더 남아 있어도 여기서 멈춘다. `TASKS/WAVE_STATE.json`의
   `waiting_for_preview`를 `true`로 갱신하고, **`WAITING_FOR_PREVIEW` 상태로
   종료**한다(`CLAUDE.md` 규칙 22 — 사람이 Preview를 확인하기 전까지 다음 Wave는
   물론 같은 Wave의 남은 Task도 더 진행하지 않는다). 사람이 확인 후 계속하려면
   `/run-wave resume` 또는 같은 `/run-wave W03`를 다시 호출한다(그때
   `waiting_for_preview`를 `false`로 되돌리고 이어간다).

### 정체(Stall) 상태

READY Task가 없는데 아직 DONE이 아닌 Task가 남아 있으면(예: 전부 BLOCKED거나,
남은 Task의 Depends On이 다른 아직 시작 안 된 Wave의 Task를 가리킴) `STALLED`로
보고하고 멈춘다. 이 상태는 5개 지원 출력(`READY_TO_IMPLEMENT` 계열이 아니라
`/run-wave` 자체의 진행 결과이므로)과 별개로 원인(BLOCKED Task 목록, 아직 해결 안 된
Depends On)을 그대로 보여준다.

## 출력 형식

```
RUN_WAVE_RESULT
Command: /run-wave W03 | status | resume | dry-run W03

처리한 Task(순서대로):
- <Task ID>: READY_TO_IMPLEMENT 확인 → 구현 → 검증 PASS → DONE
- ...

최종 상태: WAVE_COMPLETE | WAITING_FOR_PREVIEW | BLOCKED | STALLED

<상태별 세부 근거 — BLOCKED/STALLED면 원인 Task와 이유, WAITING_FOR_PREVIEW면
어느 Task 뒤에서 멈췄는지>
```

`status`/`dry-run` 호출은 "처리한 Task" 대신 "예정된 처리 순서"(dry-run) 또는
"현재 기록된 상태"(status)를 같은 형식으로 보여주고, 실제로는 아무 것도 바꾸지
않았다는 점을 명시한다.

## 포함하지 않는 기능

- **자동 Branch 생성.** 이 Command는 Git Branch를 만들거나 전환하지 않는다.
- **자동 PR 생성.** `gh pr create` 등을 호출하지 않는다.
- **자동 Merge.** `AUTO_MERGE=false`(`CLAUDE.md` Harness Marker)를 그대로 따르며,
  어떤 상황에서도 Merge를 시도하지 않는다.
- **자동 Push.** `/implement-task`가 만든 Commit이 있어도 Push하지 않는다.
- **다음 Wave 자동 시작.** 한 Wave가 끝나거나 `WAITING_FOR_PREVIEW`가 되면, 사람이
  다음 `/run-wave WXX`를 명시적으로 호출하기 전까지 스스로 이어가지 않는다.

Branch·PR·Merge·Push는 전부 사람이 수동으로 수행한다(DEC-012, `CLAUDE.md` 규칙 21).
