---
description: TASKS/00_TASK_LIST.md와 TASKS/TASK-*.md를 scripts/audit_tasks.py의 18개 규칙으로 재검증한다(생성 없이 검증만).
---

`traveler-project-pipeline` Skill을 로드한다. 이 명령은 새로운 Task나 상세 파일을
만들지 않고 `python3 scripts/audit_tasks.py`만 실행해 기존 산출물(`TASKS/00_TASK_LIST.md`,
`TASKS/TASK-*.md`)을 검증한다.

## 공통 원칙

- **`traveler-project-pipeline` Skill을 사용한다.** 시작 전에 로드한다.
- **실제 파일을 읽는다.** `scripts/audit_tasks.py`가 스스로 `TASKS/00_TASK_LIST.md`와
  `TASKS/TASK-*.md`를 읽는다 — 그 출력(콘솔 로그, `TASKS/TASK_AUDIT_REPORT.md`)을
  그대로 사용자에게 전달하고, 결과를 요약하거나 재해석할 때 실제 출력에 없는 내용을
  지어내지 않는다.
- **구현 코드를 만들지 않는다.** 이 명령은 순수 검증 전용이며 어떤 코드나 문서도
  수정하지 않는다.
- **Task Audit 실패를 무시하지 않는다.** `AUDIT_FAIL`(exit 1)이 나오면 어떤 경우에도
  "대체로 통과", "사소한 문제" 같은 식으로 축소 보고하지 않는다. 실패한 검사 번호와
  메시지를 전부 사용자에게 보여준다.

## 절차

1. `python3 scripts/audit_tasks.py`를 실행한다. 이 스크립트는 항상
   `TASKS/TASK_MANIFEST.csv`와 `TASKS/TASK_AUDIT_REPORT.md`를 (재)생성한다.

2. 종료 코드에 따라 보고한다.
   - **0(`AUDIT_PASS`)** — 콘솔에 출력된 "AUDIT_PASS — N/18 checks passed"를 그대로
     인용하고, `TASKS/TASK_AUDIT_REPORT.md`의 18개 검사 표를 근거로 Page Owner 5개,
     Requirement 커버리지 114건(IMPLEMENT+EXCLUDED), Chromium Smoke Task 존재 등
     핵심 결과를 요약해 보고한다.
   - **1(`AUDIT_FAIL`)** — 콘솔에 출력된 실패 검사 번호·메시지 전부와
     `TASKS/TASK_AUDIT_REPORT.md`의 해당 절을 사용자에게 보여준다. 오류를 다음 두
     범주로 분류해 정리한다.
     - **Task List 수준 문제**(예: Page Owner가 5개가 아님, 의존성 사이클, Route/Page
       Entry가 `SCREEN_ROUTE_CONTRACT.json`과 불일치, DB 테이블 6개 초과, EC2·AWS·
       자동 Merge 키워드 발견, Requirement 커버리지 114건 불일치) → `/gen-tasklist`를
       다시 실행해 `TASKS/00_TASK_LIST.md`를 고치라고 안내한다.
     - **상세 파일 수준 문제**(예: 상세 파일 누락/orphan, 필수 14개 절 누락, SCR-001/
       003/005 특화 AC 문구 누락) → `/gen-task-details`를 다시 실행하라고 안내한다.
   - **2(`TASKS/00_TASK_LIST.md` 없음)** — Task List가 아직 생성되지 않았다는 뜻이다.
     `/gen-tasklist`를 먼저 실행하라고 안내하고 멈춘다.

3. 경고(warning)는 실패로 취급하지 않지만 그대로 사용자에게 전달한다. 특히 Task
   개수가 45~65 범위를 벗어난다는 경고는 정보 제공용이며 실패 조건이 아니라는 점을
   함께 설명한다(`traveler-project-pipeline` Skill — Task 개수는 완료 조건이 아님).

4. 이 명령 자체는 코드나 문서를 수정하지 않는다 — 순수 검증 전용이다. `AUDIT_FAIL`을
   해결하려면 `/gen-tasklist` 또는 `/gen-task-details`를 다시 실행해야 하며, 그
   재실행은 이 명령이 아니라 사용자 또는 위 두 명령이 수행한다.
