---
description: TASKS/00_TASK_LIST.md의 각 Task에 대해 TASKS/TASK-<ID>.md 상세 파일을 1:1로 작성/갱신하고 scripts/audit_tasks.py로 검증한다.
---

`traveler-project-pipeline` Skill을 로드하고 그 §1~§12와 `CLAUDE.md`의 Harness
Marker·23개 규칙을 따른다.

## 공통 원칙(모든 절차에 적용)

- **`traveler-project-pipeline` Skill을 사용한다.** 시작 전에 반드시 로드한다.
- **실제 파일을 읽는다.** `TASKS/00_TASK_LIST.md`를 실제로 읽어 Table A/B 내용을
  그대로 가져오고, `design-reference/D-001/DESIGN.md`·
  `design-reference/SCREEN_ROUTE_CONTRACT.json`도 실제로 읽어 Design Ref를 채운다.
  이미 존재하는 `TASKS/TASK-<ID>.md`가 있으면 먼저 그 내용을 읽고, 소스(Task List)와
  달라졌으면 갱신한다 — 이유 없이 처음부터 다시 지어내지 않는다.
- **구현 코드를 만들지 않는다.** 이 명령은 `TASKS/TASK-<ID>.md`(Markdown 상세 계약)만
  작성한다. 그 Task가 다루는 `.tsx`/`.ts`/`.sql` 등 실제 구현 파일은 만들지 않는다.
- **Task Audit 실패를 무시하지 않는다.** 이 명령의 마지막 단계는 반드시
  `scripts/audit_tasks.py` 실행이며, `AUDIT_FAIL`(exit 1)이 나오면 **"완료"로
  보고하지 않는다.** 원인을 고치고 다시 실행해 `AUDIT_PASS`를 확인한 뒤에만 완료로
  보고한다. 여러 번 고쳐도 통과하지 못하면, 통과하지 못했다는 사실과 남은 오류
  목록을 있는 그대로 보고한다 — 통과한 것처럼 요약하지 않는다.

## 절차

1. **전제 확인.** `TASKS/00_TASK_LIST.md`가 없으면 실행을 멈추고 먼저
   `/gen-tasklist`를 실행하라고 안내한다.

2. **Task마다 상세 파일 작성/갱신.** `TASKS/00_TASK_LIST.md`의 Table A 각 행(Task
   List의 실제 구현 Task, 즉 NON_IMPLEMENTATION 표의 EXCLUDED 항목 제외)에 대해
   `TASKS/TASK-<ID>.md`를 정확히 하나씩 만들거나 갱신한다(`traveler-project-pipeline`
   Skill §4 — Task List와 상세 파일은 1:1). 각 파일은 다음 14개 절을 빠짐없이
   포함한다.

   ```markdown
   # <Task ID> — <제목>

   **Seq:** <Seq> · **Category:** <Category> · **Priority:** <Priority>

   ## Context
   <Task List Table A/B에서 가져온 배경 — 이 Task가 무엇을 담당하는지>

   ## Project Scope
   <docs/PROJECT_SCOPE.md 분류(IMPLEMENT/IMPLEMENT(축소))와 근거 문서 참조>

   ## Requirement Ref
   <Table A의 Requirement Ref 그대로>

   ## Screen / Route / Page Entry
   - Screen: <Screen>
   - Route: <Route>
   - Page Entry: <Page Entry>

   ## Design Ref
   <design-reference/UI_CONTRACT.md 해당 Screen 절, design-reference/
   SCREEN_ROUTE_CONTRACT.json의 section_order/min_content_counts, 관련
   D-001/DESIGN.md 컴포넌트/토큰>

   ## Depends On
   <Table A의 Depends On 그대로. 값이 "없음"이면 그대로 "없음"이라고 쓴다>

   ## Expected Files
   <Table B의 Expected Files. TASKS/SRC_APP_TREE_SNAPSHOT.json을 참고해 "생성"과
   "수정"을 구분한다 — 이미 존재하는 파일을 "새로 만든다"고 쓰지 않는다>

   ## Functional AC
   <Table B의 Functional AC>

   ## Visual AC
   <Table B의 Visual AC>

   ## Security/Privacy AC
   <Table B의 Security/Privacy AC>

   ## Test Cases
   <Functional/Security AC를 체크 가능한 항목으로 나열>

   ## Verify
   - <Table B의 Verify>

   ## Definition of Done
   <AC 충족, Test Cases 통과, Verify 실행, Expected Files 밖 미수정, Forbidden 미위반
   등 표준 체크리스트>

   ## Forbidden
   <Expected Files 밖 수정 금지, Page Owner라면 하위 Component 생성 금지, DB
   Task라면 6개 테이블 화이트리스트, 항공·숙소 입력값 서버 저장 금지(해당 시),
   EXCLUDED 기능 임의 복원 금지, 구현 코드/Branch/Commit 생성 금지>
   ```

3. **EXCLUDED는 상세 파일을 만들지 않는다.** `TASKS/00_TASK_LIST.md`의
   NON_IMPLEMENTATION 표에 있는 Requirement는 애초에 Task가 아니므로
   `TASKS/TASK-<ID>.md`도, 그와 비슷한 어떤 파일도 만들지 않는다
   (`traveler-project-pipeline` Skill §11).

4. **감사 실행(필수).** 상세 파일을 모두 쓴 뒤 `python3 scripts/audit_tasks.py`를
   실행한다.
   - **`AUDIT_PASS`(exit 0)**면 통과한 검사 수(18개 중 몇 개)와
     `TASKS/TASK_MANIFEST.csv`·`TASKS/TASK_AUDIT_REPORT.md`가 생성됐음을 보고하고
     끝낸다.
   - **`AUDIT_FAIL`(exit 1)**이면 **실패를 무시하거나 축소해서 보고하지 않는다.**
     출력된 오류 목록을 그대로 사용자에게 보여주고, 각 오류가 `TASKS/00_TASK_LIST.md`
     수정이 필요한지(Task List 수준) 개별 `TASKS/TASK-<ID>.md` 수정이 필요한지(상세
     파일 수준) 구분해 안내한다. 상세 파일 쪽에서 자동으로 고칠 수 있는 것(누락된
     상세 파일 생성, 절 이름 오탈자 등)은 고치고 다시 실행한다. Task List 자체의
     구조적 문제(예: Page Owner가 5개가 아님, Depends On이 존재하지 않는 ID를
     가리킴)는 `/gen-tasklist`부터 다시 실행하라고 안내한다.
   - **exit 2**(`TASKS/00_TASK_LIST.md` 없음)는 1번 단계에서 이미 걸러졌어야 하는
     상태다 — 다시 나오면 같은 안내를 반복한다.

5. **정직성 원칙.** 상세 파일이나 완료 보고에 "구현 완료"라고 쓰지 않는다. 이
   명령은 무엇을 만들어야 하는지 정의하고 그 정의가 감사를 통과하는지 확인하는
   것이지, 실제로 코드를 작성하거나 구현 여부를 확인하는 것이 아니다.
