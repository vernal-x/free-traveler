---
description: 배포 직전 최종 게이트. Task·Wave 상태, Page Owner 5개, CI, Playwright Smoke, Supabase 6테이블/RLS 확인 기록, Vercel Preview, EXCLUDED 목록을 검사해 RELEASE_READY/RELEASE_BLOCKED를 판정한다.
---

`traveler-project-pipeline` Skill을 로드하고 `CLAUDE.md`의 Harness Marker·23개 규칙을
따른다. 이 Command는 **파이프라인의 마지막 게이트**다 — `/gen-tasklist` →
`/gen-task-details` → `/audit-tasks` → (`/prepare-task` → `/implement-task`를
반복하는) `/run-wave` 다음, 실제 배포(사람이 수동으로 수행, DEC-012) 직전에 한 번
실행한다.

## 이 Command가 하는 일 / 하지 않는 일

- **읽기·검증 전용이다.** 소스 코드, `TASKS/00_TASK_LIST.md`, `TASKS/TASK-<ID>.md`,
  `TASKS/WAVE_PLAN.md`, `TASKS/WAVE_STATE.json` 등 어떤 파일도 수정하지 않는다.
- 예외적으로 **검증을 위해 테스트를 실행**할 수 있다(Playwright Chromium Smoke —
  아래 검사 4). 이는 코드 수정이 아니라 확인 행위다.
- Branch·PR·Merge·Push를 하지 않는다(`CLAUDE.md` 규칙 21, DEC-012). `RELEASE_READY`가
  나와도 이 Command가 배포를 실행하지 않는다 — 배포는 사람이 한다.

## 검사

각 검사는 PASS/FAIL과 근거를 남긴다. **하나라도 FAIL이면 `RELEASE_BLOCKED`**다.

### 1. Task·Wave 상태

- `python3 scripts/audit_tasks.py`를 실행해 `AUDIT_PASS`(18/18)인지 확인한다.
  `AUDIT_FAIL`이거나 `TASKS/00_TASK_LIST.md`/상세 파일이 없으면 FAIL.
- `TASKS/WAVE_PLAN.md`에 정의된 모든 Wave의 모든 Task가 `TASKS/WAVE_STATE.json`에서
  `status: DONE`인지 확인한다. 하나라도 `PENDING`/`IN_PROGRESS`/`BLOCKED`면 FAIL —
  어떤 Task가 아직 안 됐는지 나열한다. `TASKS/WAVE_PLAN.md`나 `TASKS/WAVE_STATE.json`
  자체가 없으면 FAIL("Wave 실행 기록 없음").

### 2. 5개 Page Owner DONE

- `TASKS/WAVE_STATE.json`에서 `PAGE-SCR001`~`PAGE-SCR005` 5개 모두 `status: DONE`인지
  확인한다(검사 1과 겹치지만 배포 판단에서 가장 중요한 신호이므로 별도로 다시 본다).
- 원장만 믿지 않고 실제 소스를 다시 본다: `CLAUDE.md`의 Page Entry 표(5개 파일)가
  실제로 존재하고, `src/app/page.tsx`(SCR-001)에 `create-next-app` 기본 문구
  ("Get started by editing" 등)·기본 로고가 남아있지 않은지 확인한다. 하나라도
  없거나 Starter 흔적이 남아 있으면 FAIL.

### 3. CI PASS

- `gh` CLI로 현재 브랜치(또는 열린 PR이 있으면 그 PR)의 최신 CI 실행 결과를
  확인한다(`gh pr checks` 또는 `gh run list --branch <branch> --limit 1`).
- `.github/workflows/`가 없거나, CI 실행 기록이 없거나, 최신 실행이 실패했으면 FAIL.
  **참고: 이 저장소에는 현재 `.github/workflows/`가 없다**(`docs/ARCHITECTURE.md` §18
  착수 차단 5번) — `CI-PIPELINE` Task가 구현되기 전까지 이 검사는 항상 FAIL이다.

### 4. Playwright Smoke PASS

- `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH` 3개 스펙을
  `npx playwright test --project=chromium`으로 실제로 실행한다(캐시된 과거 결과를
  믿지 않는다).
- Playwright가 설치돼 있지 않거나(`package.json`에 `@playwright/test` 없음) 스펙
  파일이 없거나 실행이 실패하면 FAIL. **참고: 이 저장소에는 현재 Playwright가
  설치돼 있지 않다** — `TEST-*`/`E2E-*` Task가 구현되기 전까지 이 검사는 항상
  FAIL이다.

### 5. Supabase 6개 Table·기본 RLS 확인 기록

- `supabase/migrations/*.sql`을 읽어 정확히 6개 테이블(`user_profile`, `mate_post`,
  `mate_application`, `user_block`, `report`, `external_link_settings`)만 정의돼
  있는지 정적으로 확인한다(그 외 테이블 정의가 있으면 FAIL — `CLAUDE.md` 규칙 13).
- 이 저장소에서는 **마이그레이션 파일이 실제 Supabase 프로젝트에 적용됐는지를 이
  Command가 직접 확인할 수 없다.** 대신 `docs/RELEASE_CHECKLIST.md`에 사람이 남긴
  확인 기록을 요구한다 — 아래 표에서 "Supabase 6개 테이블 존재 확인"과 "Supabase
  기본 RLS 3원칙 적용 확인" 행에 확인일이 채워져 있어야 한다. 파일이 없거나 해당
  행의 확인일이 비어 있으면 FAIL.

### 6. Vercel Preview Checkpoint

- `TASKS/WAVE_STATE.json`의 `waiting_for_preview`가 `false`인지 확인한다 —
  `true`면 아직 처리하지 못한 Preview Checkpoint가 남아 있다는 뜻이므로 FAIL.
- `docs/RELEASE_CHECKLIST.md`의 "Vercel Preview 배포 확인" 행에 확인일과 Preview
  URL이 채워져 있는지 확인한다. 비어 있으면 FAIL.

### 7. EXCLUDED 목록

- `docs/PROJECT_SCOPE.md`와 `TASKS/00_TASK_LIST.md` §12 NON_IMPLEMENTATION 표를
  대조해 EXCLUDED 24건(REQ-FUNC 11 + REQ-NF 13)이 그대로 남아 있는지 확인한다.
- REQ-FUNC-001~080, REQ-NF-001~034 총 114건이 (IMPLEMENT 계열 Task Requirement Ref)
  ∪ (EXCLUDED 표) 로 정확히 한 번씩만 커버되는지 재확인한다(`scripts/audit_tasks.py`
  검사 17·18과 동일한 로직).
- EXCLUDED였던 Requirement가 어느 Task의 Requirement Ref에 몰래 들어갔거나, 반대로
  구현된 Requirement가 EXCLUDED 표로 옮겨졌으면 FAIL.

## `docs/RELEASE_CHECKLIST.md` 형식

검사 5·6이 요구하는 사람 확인 기록의 정본이다(`TASKS/00_TASK_LIST.md`의
`RELEASE-VERCEL-SUPABASE-CHECK` Task 산출물과 동일 파일). 이 Command는 이 파일을
**만들지 않는다** — 없으면 그 자체가 검사 5·6의 FAIL 사유다.

```markdown
# Release Checklist

| # | 항목 | 확인일 | 확인자 | 근거/URL |
|---|---|---|---|---|
| 1 | Supabase 6개 테이블 존재 확인 | | | |
| 2 | Supabase 기본 RLS 3원칙 적용 확인 | | | |
| 3 | Vercel Preview 배포 확인 | | | |
| 4 | Vercel 환경변수 설정 확인 | | | |
```

각 행의 "확인일"이 비어 있으면 아직 확인되지 않은 것으로 취급한다.

## 판정

```
RELEASE_READY
RELEASE_BLOCKED
```

7개 검사가 **모두 PASS**일 때만 `RELEASE_READY`, 하나라도 FAIL이면
`RELEASE_BLOCKED`다.

## 출력 형식

```
RELEASE_CHECK_RESULT

1. Task·Wave 상태: PASS|FAIL — <근거>
2. 5개 Page Owner DONE: PASS|FAIL — <근거>
3. CI PASS: PASS|FAIL — <근거>
4. Playwright Smoke PASS: PASS|FAIL — <근거>
5. Supabase 6개 Table·기본 RLS 확인 기록: PASS|FAIL — <근거>
6. Vercel Preview Checkpoint: PASS|FAIL — <근거>
7. EXCLUDED 목록: PASS|FAIL — <근거>

<RELEASE_READY 또는 RELEASE_BLOCKED 한 줄>
```

`RELEASE_BLOCKED`면 FAIL한 검사마다 무엇을 먼저 해야 하는지 안내한다(예: "검사 3 →
`CI-PIPELINE` Task 구현 필요", "검사 5 → `docs/RELEASE_CHECKLIST.md`에 Supabase 확인
기록 추가 필요"). 실행하지 않은 검사를 PASS로 적지 않는다 — 확인할 수 없으면
FAIL로 취급한다(불확실하면 배포를 막는 쪽으로 판단).
