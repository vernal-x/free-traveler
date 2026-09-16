# Free Traveler — Project State

**Document ID:** STATE-TRAVEL-001
**상태:** Living Document — 아래 값은 이 문서를 마지막으로 갱신한 시점의 스냅샷이다.
`/implement-task`, `/run-wave`, `/release-check`가 진행 상황에 따라 해당 필드를
갱신하며, 사람이 직접 고쳐도 된다. **이 문서 자체가 실제 코드 구현 여부를
증명하지 않는다** — 근거는 항상 `TASKS/WAVE_STATE.json`, `TASKS/TASK_AUDIT_REPORT.md`,
실제 소스 트리다.

**마지막 갱신:** 2026-09-17 — 초기값(아직 어떤 Task도 착수하지 않은 상태)

---

## 현재 상태

| 필드 | 값 |
|---|---|
| **Harness Schema** | `traveler-screen-route-v1`(`CLAUDE.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`) |
| **Design Version** | `D-001`(Status: `LOCKED`, `design-reference/D-001/DESIGN.md`) |
| **Scope Mode** | `docs/PROJECT_SCOPE.md` 기준 — IMPLEMENT 계열 90건 / EXCLUDED 24건(총 114건) |
| **Current Wave** | 없음 — `TASKS/WAVE_PLAN.md`가 아직 없어 Wave 계획 미수립 |
| **Current Task** | 없음 |
| **Completed Tasks** | 0 / 65 (`TASKS/00_TASK_LIST.md` 기준 총 65개 구현 Task) |
| **Blocked Tasks** | 0건(Task 레벨 — 아직 어떤 Task도 착수하지 않아 BLOCKED로 기록된 것이 없음). 단 착수 자체를 막는 환경 차단이 6건 있음 — `docs/ARCHITECTURE.md` §18 참고(env 파일, Supabase/테스트 패키지, `supabase/` 디렉터리, `.github/workflows/`, 외부 URL 기본값 env 미설정) |
| **Latest CI** | 없음 — `.github/workflows/`가 아직 없어 실행 이력 자체가 없음(`CI-PIPELINE` Task 미착수) |
| **Supabase State** | 미연결 — `.env.local` 없음, `@supabase/supabase-js`/`@supabase/ssr` 미설치, `supabase/` 마이그레이션 디렉터리 없음(`DB-SCHEMA-BASE` 등 DB Task 미착수) |
| **Vercel Preview URL** | 없음 — 배포 이력 없음 |
| **Screen Checkpoints** | 아래 "Screen Checkpoints" 표 참고 — 전부 `PENDING` |
| **Playwright State** | 미설치 — `package.json`에 `@playwright/test` 없음, `e2e/` 스펙 파일 없음(`E2E-*` Task 미착수) |
| **Deferred Items** | 24건 EXCLUDED(REQ-FUNC 11 + REQ-NF 13) — `docs/PROJECT_SCOPE.md`, `TASKS/00_TASK_LIST.md` §12 NON_IMPLEMENTATION 참고 |
| **Next Action** | 아래 "다음 행동" 참고 |

## Screen Checkpoints

| Screen | Route | 상태 |
|---|---|---|
| SCR-001 | `/` | `PENDING` |
| SCR-002 | `/about` | `PENDING` |
| SCR-003 | `/travel-tools` | `PENDING` |
| SCR-004 | `/mates` | `PENDING` |
| SCR-005 | `/account` | `PENDING` |
| FINAL | — | `PENDING` |

각 Screen 행은 해당 Page Owner Task(`PAGE-SCR00X`)가 `TASKS/WAVE_STATE.json`에서
`DONE`이 되고 사람이 Vercel Preview로 실제 확인(`CLAUDE.md` 규칙 22)한 뒤에만
`PENDING` → `DONE`으로 바꾼다. `FINAL`은 5개 Screen이 모두 `DONE`이고
`/release-check`가 `RELEASE_READY`를 낸 뒤에만 `DONE`으로 바꾼다.

## 다음 행동(Next Action)

1. `docs/ARCHITECTURE.md` §18의 착수 차단 6건을 해소한다(`.env.local` 작성,
   `@supabase/supabase-js`·`@playwright/test`·`vitest` 설치, `supabase/` 초기화,
   `.github/workflows/` 추가, 외부 URL 기본값 env 설정).
2. `TASKS/WAVE_PLAN.md`를 작성해 Wave별 Task 구성을 확정한다
   (`.claude/commands/run-wave.md`의 형식 참고).
3. `TASKS/WAVE_STATE.json`을 초기화한다(모든 Task `PENDING`).
4. `/run-wave W01`로 첫 Wave를 시작한다.

이 문서의 다른 필드(Current Wave, Completed Tasks, Screen Checkpoints 등)는 위
1~4단계가 진행되는 대로 갱신한다.
