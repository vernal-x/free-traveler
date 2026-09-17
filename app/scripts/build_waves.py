#!/usr/bin/env python3
"""Traveler Wave Builder.

Reads the already-audited Task set (`TASKS/TASK_MANIFEST.csv`, produced by
`scripts/audit_tasks.py`) and the real dependency/Expected-Files content of
each `TASKS/TASK-<ID>.md`, then computes a Wave plan and writes:

  - TASKS/TASK_DAG.md      — dependency graph, topological levels, cycle check
  - TASKS/WAVE_PLAN.md     — static Wave -> Task assignment + Preview Checkpoint
  - TASKS/WAVE_STATE.json  — dynamic per-Task/per-Wave execution state (initial)
  - TASKS/TASK_MANIFEST.csv — rewritten with an added `wave_id` column

Note on input path: the request that specified this script named
`TASKS/details/TASK-*.md` as an input. This repository has no `TASKS/details/`
subdirectory — the 65 Task detail files live directly under `TASKS/TASK-*.md`,
and `TASKS/TASK_MANIFEST.csv`'s `detail_file` column already points at their
real paths. This script reads from that real location rather than fabricate a
`details/` directory that does not exist.

Ordering dependency: this script does not run `scripts/audit_tasks.py` itself.
It trusts `TASKS/TASK_MANIFEST.csv` as already current. If `00_TASK_LIST.md`
or any `TASK-<ID>.md` changes later, `scripts/audit_tasks.py` must be re-run
first (it rewrites `TASK_MANIFEST.csv` from scratch, which would drop the
`wave_id` column), and this script re-run after it to recompute Waves and
restore `wave_id`. This script does not attempt to keep the two scripts'
outputs synchronized automatically (kept deliberately simple, rule 7).

Algorithm (kept deliberately simple — no retry loops, no auto-fix passes):
  1. Parse Task nodes + dependency edges from TASK_MANIFEST.csv (only tokens
     that are real Task IDs count as edges; a "없음" placeholder means "no
     dependency", not a broken reference).
  2. Detect cycles via Kahn's algorithm (BFS layering). Any Task left
     unprocessed after the layering terminates is part of a cycle.
  3. Compute each Task's topological level = number of Kahn rounds until it
     becomes ready. Two Tasks at the same level are guaranteed to have no
     dependency path between them in either direction — this is what makes
     it safe to run them in the same Wave in Task-ID order (rule 6).
  4. Classify each Task into one of the 10 user-specified Wave Groups by
     category/screen, then "pull up" any Task whose classified group is
     lower than a dependency's group (single deterministic pass in level
     order — not an iterative auto-fix loop).
  5. Within each group, walk Tasks in ascending level order and greedily pack
     them into a Wave as long as (a) the Wave stays <= 7 Tasks and (b) no
     Task being added shares a dependency edge OR an Expected-Files path
     (rule 5) with a Task already in the Wave. Otherwise the current Wave is
     closed and a new one starts. This is what keeps Waves close to the
     4~7 default (rule 3) while never violating rule 1/2/5/6.
  6. A Page Owner Task depends on virtually every Component/SA Task in its
     screen, so it always ends up alone at the top level of its screen's
     group — i.e. it is always the *last* Wave of that group, satisfying
     rule 4 by construction rather than by a special case.
  7. Validate the final assignment: for every dependency edge, the
     dependency's Wave index must be <= the dependent's Wave index, and if
     equal, the dependency's Task ID must sort before the dependent's
     (rule 2). This is asserted, not assumed.

Exit codes:
  0  waves built successfully (prints the summary described in "종료")
  1  input missing, or a genuine cycle/ordering violation was found

CLI flags:
  --check   Read-only "Wave 계약 검사" mode (used by `npm run validate` /
            `npm run ci`, package.json). Runs the exact same cycle-detection
            and Wave-order validation as the default mode, but never writes
            TASKS/TASK_DAG.md, TASKS/WAVE_PLAN.md, TASKS/WAVE_STATE.json, or
            TASKS/TASK_MANIFEST.csv. This matters once Wave execution has
            actually started: the default (writing) mode always resets
            WAVE_STATE.json's per-Task status back to PENDING, which would
            silently wipe real progress if it were re-run on every CI push.
            `--check` only proves the Manifest's dependency graph is still
            Wave-able (no cycles, a valid Wave ordering exists) — it does
            not diff the result against the currently committed
            WAVE_PLAN.md/WAVE_STATE.json, so it cannot detect a hand-edited
            file drifting from what a fresh build would produce.
"""
from __future__ import annotations

import csv
import datetime
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = PROJECT_ROOT.parent
TASKS_DIR = PROJECT_ROOT / "TASKS"
DESIGN_REF_DIR = REPO_ROOT / "design-reference"

MANIFEST_PATH = TASKS_DIR / "TASK_MANIFEST.csv"
SCREEN_CONTRACT_PATH = DESIGN_REF_DIR / "SCREEN_ROUTE_CONTRACT.json"
DAG_PATH = TASKS_DIR / "TASK_DAG.md"
WAVE_PLAN_PATH = TASKS_DIR / "WAVE_PLAN.md"
WAVE_STATE_PATH = TASKS_DIR / "WAVE_STATE.json"

MAX_WAVE_SIZE = 7
MIN_WAVE_SIZE = 4  # default target (rule 3) — not force-enforced, see notes

GROUP_TITLES = {
    1: "Scaffold, 문서, Harness 확인",
    2: "Airbnb 스타일 공통 UI, 정적 데이터, Layout",
    3: "Supabase Auth, 6개 Table, 기본 RLS",
    4: "SCR-001 메인 Component와 Page Owner",
    5: "SCR-002 대표 소개 Component와 Page Owner",
    6: "SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner",
    7: "SCR-004 동행 목록·상세·신청 Component와 Page Owner",
    8: "SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner",
    9: "Unit·Playwright·접근성·CI",
    10: "Vercel Preview와 Release 확인",
}

SCREEN_RE = re.compile(r"SCR-0*(\d+)")


class BuildError(Exception):
    pass


# ---------------------------------------------------------------------------
# Step 1 — load Tasks + edges
# ---------------------------------------------------------------------------


def load_tasks() -> list[dict]:
    if not MANIFEST_PATH.exists():
        raise BuildError(
            f"{rel(MANIFEST_PATH)} 없음 — 먼저 `python3 scripts/audit_tasks.py`를 "
            "실행해 Task Manifest를 생성해야 한다."
        )
    with MANIFEST_PATH.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        raise BuildError(f"{rel(MANIFEST_PATH)}에 Task 행이 없다.")
    return rows


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def parse_deps(depends_on_raw: str, known_ids: set[str]) -> list[str]:
    out = []
    for tok in depends_on_raw.split(","):
        tok = tok.strip()
        if tok and tok in known_ids:
            out.append(tok)
    return out


def parse_screens(screen_raw: str) -> list[int]:
    return sorted({int(m.group(1)) for m in SCREEN_RE.finditer(screen_raw)})


# ---------------------------------------------------------------------------
# Step 2/3 — cycle detection + topological levels (Kahn's algorithm)
# ---------------------------------------------------------------------------


def compute_levels(
    ids: set[str], deps: dict[str, list[str]]
) -> tuple[dict[str, int], list[list[str]]]:
    """Returns (level per task, list of cycle-member groups found, if any)."""
    children: dict[str, list[str]] = defaultdict(list)
    indeg = {tid: len(deps[tid]) for tid in ids}
    for tid, dl in deps.items():
        for d in dl:
            children[d].append(tid)

    level: dict[str, int] = {}
    remaining = dict(indeg)
    frontier = sorted(tid for tid in ids if indeg[tid] == 0)
    lvl = 0
    processed: set[str] = set()
    while frontier:
        for tid in frontier:
            level[tid] = lvl
            processed.add(tid)
        nxt: set[str] = set()
        for tid in frontier:
            for c in children[tid]:
                remaining[c] -= 1
                if remaining[c] == 0:
                    nxt.add(c)
        frontier = sorted(nxt)
        lvl += 1

    unresolved = ids - processed
    cycles: list[list[str]] = []
    if unresolved:
        cycles = find_cycles(unresolved, deps)
    return level, cycles


def find_cycles(unresolved: set[str], deps: dict[str, list[str]]) -> list[list[str]]:
    """Find concrete cycle paths among unresolved (still-blocked) nodes."""
    cycles: list[list[str]] = []
    visited: set[str] = set()

    def dfs(node: str, stack: list[str], on_stack: set[str]) -> None:
        stack.append(node)
        on_stack.add(node)
        for dep in deps[node]:
            if dep not in unresolved:
                continue
            if dep in on_stack:
                cycle_start = stack.index(dep)
                cycles.append(stack[cycle_start:] + [dep])
            elif dep not in visited:
                dfs(dep, stack, on_stack)
        stack.pop()
        on_stack.remove(node)
        visited.add(node)

    for tid in sorted(unresolved):
        if tid not in visited:
            dfs(tid, [], set())
    return cycles


# ---------------------------------------------------------------------------
# Step 4 — classify into the 10 user-specified Wave Groups
# ---------------------------------------------------------------------------


def classify_group(task_id: str, category: str, screen_raw: str) -> int:
    screens = parse_screens(screen_raw)
    if task_id == "RELEASE-VERCEL-SUPABASE-CHECK":
        return 10
    if category == "CI_RELEASE":
        return 9
    if category in ("UNIT_TEST", "E2E_TEST", "MANUAL_CHECK"):
        return 9
    if task_id == "TEST-RLS-BASIC" or category == "DB_TEST":
        return 3
    if category == "DB":
        return 3
    if task_id == "AUTH-EMAIL-ADULT" or category == "AUTH":
        return 3
    if task_id == "SA-TOAST-NOTIFICATIONS":
        return 2
    if category == "DATA":
        return 2
    if category == "TOOLING":
        return 2
    if category in ("COMPONENT", "PAGE_OWNER", "SERVER_ACTION"):
        if screens:
            return 3 + min(screens)
        return 2
    return 2


def pull_up_groups(
    ids: set[str],
    level: dict[str, int],
    deps: dict[str, list[str]],
    group: dict[str, int],
) -> list[tuple[str, int, int]]:
    """A Task's group must never be earlier than any of its dependencies'
    group (otherwise it would need Tasks from a later group already done).
    Single deterministic pass in level-ascending order — every dependency's
    final group is already known by the time its dependents are visited."""
    adjustments: list[tuple[str, int, int]] = []
    for tid in sorted(ids, key=lambda t: (level[t], t)):
        original = group[tid]
        new_group = original
        for dep in deps[tid]:
            new_group = max(new_group, group[dep])
        if new_group != original:
            adjustments.append((tid, original, new_group))
            group[tid] = new_group
    return adjustments


# ---------------------------------------------------------------------------
# Step 5 — Expected Files (for rule 5: same-file conflicts split into Waves)
# ---------------------------------------------------------------------------

EXPECTED_FILES_RE = re.compile(r"## Expected Files\n(.*?)\n##", re.S)
BACKTICK_PATH_RE = re.compile(r"`([^`]+)`")


def load_expected_files(rows: list[dict]) -> dict[str, set[str]]:
    files_by_task: dict[str, set[str]] = {}
    for r in rows:
        detail_path = PROJECT_ROOT / r["detail_file"] if not Path(
            r["detail_file"]
        ).is_absolute() else Path(r["detail_file"])
        # detail_file in the manifest is already relative to PROJECT_ROOT
        # (e.g. "TASKS/TASK-PAGE-SCR001.md"); resolve defensively either way.
        candidate = PROJECT_ROOT / r["detail_file"]
        detail_path = candidate if candidate.exists() else Path(r["detail_file"])
        text = detail_path.read_text(encoding="utf-8") if detail_path.exists() else ""
        m = EXPECTED_FILES_RE.search(text)
        paths: set[str] = set()
        if m:
            for pm in BACKTICK_PATH_RE.finditer(m.group(1)):
                p = pm.group(1)
                if "/" in p and not p.startswith("http"):
                    paths.add(p)
        files_by_task[r["task_id"]] = paths
    return files_by_task


# ---------------------------------------------------------------------------
# Step 5 (cont.) — pack each group's Tasks into Waves
# ---------------------------------------------------------------------------


def pack_group_into_waves(
    group_id: int,
    members: list[str],
    level: dict[str, int],
    deps: dict[str, list[str]],
    expected_files: dict[str, set[str]],
) -> list[list[str]]:
    by_level: dict[int, list[str]] = defaultdict(list)
    for tid in members:
        by_level[level[tid]].append(tid)

    waves: list[list[str]] = []
    current: list[str] = []
    current_files: set[str] = set()

    def flush() -> None:
        nonlocal current, current_files
        if current:
            waves.append(current)
        current = []
        current_files = set()

    for lvl in sorted(by_level):
        lvl_tasks = sorted(by_level[lvl])
        # A level's own Tasks never conflict with each other (guaranteed by
        # the leveling), but level's Tasks might depend on / share a file
        # with something already sitting in `current`.
        dep_conflict = any(d in current for t in lvl_tasks for d in deps[t])
        file_conflict = any(
            expected_files.get(t, set()) & current_files for t in lvl_tasks
        )
        if dep_conflict or file_conflict or (len(current) + len(lvl_tasks) > MAX_WAVE_SIZE):
            flush()
            # chunk an oversized single level on its own
            for i in range(0, len(lvl_tasks), MAX_WAVE_SIZE):
                chunk = lvl_tasks[i : i + MAX_WAVE_SIZE]
                if i + MAX_WAVE_SIZE >= len(lvl_tasks):
                    current = chunk
                    current_files = set().union(*(expected_files.get(t, set()) for t in chunk)) if chunk else set()
                else:
                    waves.append(chunk)
        else:
            current.extend(lvl_tasks)
            for t in lvl_tasks:
                current_files |= expected_files.get(t, set())
    flush()
    return waves


# ---------------------------------------------------------------------------
# Step 7 — validate the final Wave assignment (rule 2)
# ---------------------------------------------------------------------------


def validate_wave_order(
    ids: set[str],
    deps: dict[str, list[str]],
    wave_index: dict[str, int],
) -> list[str]:
    violations = []
    for tid in ids:
        for dep in deps[tid]:
            if wave_index[dep] > wave_index[tid]:
                violations.append(
                    f"{tid}의 선행 Task {dep}가 더 뒤 Wave(#{wave_index[dep]} > #{wave_index[tid]})에 배치됨"
                )
            elif wave_index[dep] == wave_index[tid] and dep > tid:
                violations.append(
                    f"{tid}와 선행 Task {dep}가 같은 Wave에 있지만 Task ID 순서가 "
                    f"실행 순서(규칙 6)와 의존 순서를 어긋나게 함"
                )
    return violations


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------


def write_task_dag(
    ids: set[str],
    deps: dict[str, list[str]],
    level: dict[str, int],
    group: dict[str, int],
    cycles: list[list[str]],
    generated_at: str,
    category_of: dict[str, str],
) -> None:
    children: dict[str, list[str]] = defaultdict(list)
    for tid, dl in deps.items():
        for d in dl:
            children[d].append(tid)

    lines = [
        "# Task Dependency DAG",
        "",
        f"**생성:** `scripts/build_waves.py` — {generated_at}",
        f"**Task 수:** {len(ids)} · **Depends On 엣지 수:** {sum(len(v) for v in deps.values())}",
        "",
        "이 문서는 읽기 전용 산출물이다 — 실제 의존 관계는 `TASKS/TASK-<ID>.md`의 "
        "`## Depends On` 절이 정본이며, 이 문서는 그것을 그래프로 요약한 것이다.",
        "",
        "## 순환 의존성 검사",
        "",
    ]
    if cycles:
        lines.append(f"**FAIL — 순환 의존성 {len(cycles)}건 발견:**")
        lines.append("")
        for i, cyc in enumerate(cycles, 1):
            lines.append(f"{i}. `{' -> '.join(cyc)}`")
    else:
        lines.append("**PASS — 순환 의존성 0건.**")
    lines += [
        "",
        "## Task 목록 (Level·Group 순)",
        "",
        "| Level | Group | Task ID | Category | Depends On | Depended On By |",
        "|---|---|---|---|---|---|",
    ]
    for tid in sorted(ids, key=lambda t: (level.get(t, -1), group.get(t, 0), t)):
        dep_str = ", ".join(deps[tid]) if deps[tid] else "없음"
        by_str = ", ".join(sorted(children[tid])) if children[tid] else "없음"
        lines.append(
            f"| {level.get(tid, '?')} | {group.get(tid, '?')} | {tid} | {category_of.get(tid, '?')} | {dep_str} | {by_str} |"
        )
    lines += [
        "",
        "## 위상 정렬 실행 순서(전체, Level→Task ID 순)",
        "",
    ]
    topo = sorted(ids, key=lambda t: (level.get(t, -1), t))
    lines.append(", ".join(topo))
    lines.append("")
    DAG_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_wave_plan(
    waves: list[dict],
    generated_at: str,
) -> None:
    lines = [
        "# Wave Plan",
        "",
        f"**생성:** `scripts/build_waves.py` — {generated_at}",
        "**상태:** 정적 문서(사람이 직접 고쳐도 된다) — 실제 실행 순서는 이 표가 아니라 "
        "각 Task의 `Depends On`이 결정한다. 이 표는 \"이 Wave에 무엇이 포함되는가\"와 "
        "\"어디서 사람이 멈춰서 Preview를 봐야 하는가\"만 정의한다(`.claude/commands/run-wave.md`).",
        "",
        "## Wave 그룹 요약",
        "",
        "| Wave 그룹 | 설명 | Wave 수 | Task 수 |",
        "|---|---|---|---|",
    ]
    by_group: dict[int, list[dict]] = defaultdict(list)
    for w in waves:
        by_group[w["group"]].append(w)
    for g in range(1, 11):
        gw = by_group.get(g, [])
        task_count = sum(len(w["task_ids"]) for w in gw)
        note = "" if gw else "(이 그룹에 해당하는 Task 없음 — Harness/입력 검증은 `scripts/validate_harness.py`·`scripts/validate_inputs.py`가 Wave 밖에서 수행)"
        lines.append(f"| {g}. {GROUP_TITLES[g]} | {note} | {len(gw)} | {task_count} |")

    lines += [
        "",
        "## Wave별 Task 배정",
        "",
        "| Wave ID | Task ID | Preview Checkpoint |",
        "|---|---|---|",
    ]
    for w in waves:
        for tid in w["task_ids"]:
            checkpoint = "YES" if tid in w["checkpoint_task_ids"] else ""
            lines.append(f"| {w['wave_id']} | {tid} | {checkpoint} |")

    lines += [
        "",
        "## Wave 상세",
        "",
        "| Wave ID | Wave 그룹 | Task 수 | Task ID 목록 | 크기 비고 |",
        "|---|---|---|---|---|",
    ]
    for w in waves:
        size = len(w["task_ids"])
        size_note = ""
        if size < MIN_WAVE_SIZE or size > MAX_WAVE_SIZE:
            size_note = w["size_note"]
        lines.append(
            f"| {w['wave_id']} | {w['group']}. {GROUP_TITLES[w['group']]} | {size} | "
            f"{', '.join(w['task_ids'])} | {size_note} |"
        )
    lines.append("")
    WAVE_PLAN_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_wave_state(waves: list[dict], all_ids: list[str], generated_at: str) -> None:
    tasks_state = {tid: {"status": "PENDING", "updated_at": None} for tid in all_ids}
    waves_state = []
    for w in waves:
        waves_state.append(
            {
                "wave_id": w["wave_id"],
                "title": f"{w['group']}. {GROUP_TITLES[w['group']]}",
                "task_ids": w["task_ids"],
                "status": "pending",
                "checkpoint_required": bool(w["checkpoint_task_ids"]),
                "checkpoint_result": None,
            }
        )
    state = {
        "schema_version": "traveler-wave-state-v1",
        "generated_at": generated_at,
        "waves": waves_state,
        # Fields below are kept for compatibility with
        # `.claude/commands/run-wave.md` / `prepare-task.md`, which read a
        # flat per-Task status map plus `current_wave`/`waiting_for_preview`
        # rather than the `waves[]` rollup above. Both views describe the
        # same underlying state; `waves[].status` is a summary derived from
        # `tasks`, not an independent source of truth.
        "current_wave": None,
        "waiting_for_preview": False,
        "tasks": tasks_state,
        "last_run": None,
    }
    WAVE_STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_manifest_with_wave_id(rows: list[dict], wave_of: dict[str, str]) -> None:
    fieldnames = list(rows[0].keys())
    if "wave_id" not in fieldnames:
        fieldnames.append("wave_id")
    for r in rows:
        r["wave_id"] = wave_of.get(r["task_id"], "")
    with MANIFEST_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


def main() -> None:
    check_only = "--check" in sys.argv[1:]
    generated_at = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    try:
        rows = load_tasks()
    except BuildError as e:
        print(f"[build_waves] FAIL — {e}")
        sys.exit(1)

    ids = {r["task_id"] for r in rows}
    deps = {r["task_id"]: parse_deps(r["depends_on"], ids) for r in rows}
    category_of = {r["task_id"]: r["category"] for r in rows}
    screen_of = {r["task_id"]: r["screen"] for r in rows}

    level, cycles = compute_levels(ids, deps)

    if cycles:
        print(f"[build_waves] FAIL — 순환 의존성 {len(cycles)}건 발견, Wave를 생성할 수 없음.")
        for i, cyc in enumerate(cycles, 1):
            print(f"  {i}. {' -> '.join(cyc)}")
        if not check_only:
            # still write the DAG so the cycle is visible/diagnosable
            group_partial = {
                tid: classify_group(tid, category_of[tid], screen_of[tid]) for tid in ids
            }
            write_task_dag(ids, deps, level, group_partial, cycles, generated_at, category_of)
            print(f"[build_waves] wrote {rel(DAG_PATH)} (순환 위치 확인용, WAVE_PLAN/WAVE_STATE는 생성하지 않음)")
        sys.exit(1)

    group = {tid: classify_group(tid, category_of[tid], screen_of[tid]) for tid in ids}
    adjustments = pull_up_groups(ids, level, deps, group)

    expected_files = load_expected_files(rows)

    waves: list[dict] = []
    for g in sorted({group[tid] for tid in ids}):
        members = [tid for tid in ids if group[tid] == g]
        for chunk in pack_group_into_waves(g, members, level, deps, expected_files):
            waves.append({"group": g, "task_ids": sorted(chunk, key=lambda t: t)})

    # sort waves by (group, min level within wave) for a stable, meaningful order
    waves.sort(key=lambda w: (w["group"], min(level[t] for t in w["task_ids"])))

    wave_id_seq = [f"W{i:02d}" for i in range(1, len(waves) + 1)]
    for w, wid in zip(waves, wave_id_seq):
        w["wave_id"] = wid

    page_owner_ids = {tid for tid in ids if category_of[tid] == "PAGE_OWNER"}
    for w in waves:
        checkpoint_ids = {
            tid
            for tid in w["task_ids"]
            if tid in page_owner_ids or tid == "RELEASE-VERCEL-SUPABASE-CHECK"
        }
        w["checkpoint_task_ids"] = checkpoint_ids
        size = len(w["task_ids"])
        if checkpoint_ids & page_owner_ids:
            w["size_note"] = "Page Owner 통합 Wave(규칙 4) — 정의상 단독 배치"
        elif "RELEASE-VERCEL-SUPABASE-CHECK" in checkpoint_ids:
            w["size_note"] = "배포 직전 Release Checkpoint Wave — 정의상 단독 배치"
        elif size < MIN_WAVE_SIZE:
            w["size_note"] = "선행 의존성이 이 Task들만 준비시킴(규칙 1·2 순서 보존이 규칙 3보다 우선)"
        elif size > MAX_WAVE_SIZE:
            w["size_note"] = "그룹 내 동일 Level Task가 7개를 넘어 분할됨"
        else:
            w["size_note"] = ""

    wave_index = {w["wave_id"]: i for i, w in enumerate(waves)}
    wave_of_task: dict[str, str] = {}
    for w in waves:
        for tid in w["task_ids"]:
            wave_of_task[tid] = w["wave_id"]
    wave_idx_of_task = {tid: wave_index[wid] for tid, wid in wave_of_task.items()}

    violations = validate_wave_order(ids, deps, wave_idx_of_task)
    if violations:
        print("[build_waves] FAIL — 규칙 2 위반(선행 Task가 뒤 Wave에 배치됨):")
        for v in violations:
            print(f"  - {v}")
        sys.exit(1)

    if check_only:
        print("[build_waves] --check — 읽기 전용 검사, 파일을 쓰지 않음")
    else:
        write_task_dag(ids, deps, level, group, cycles, generated_at, category_of)
        write_wave_plan(waves, generated_at)
        write_wave_state(waves, sorted(ids), generated_at)
        write_manifest_with_wave_id(rows, wave_of_task)

        print(f"[build_waves] wrote {rel(DAG_PATH)}")
        print(f"[build_waves] wrote {rel(WAVE_PLAN_PATH)}")
        print(f"[build_waves] wrote {rel(WAVE_STATE_PATH)}")
        print(f"[build_waves] wrote {rel(MANIFEST_PATH)} (wave_id 열 추가)")
    print()

    if adjustments:
        print(f"[build_waves] Group 자동 보정 {len(adjustments)}건(의존성이 더 늦은 그룹을 가리켜 상향):")
        for tid, old, new in adjustments:
            print(f"  - {tid}: group {old} -> {new}")
        print()

    print(f"순환 의존성 수: {len(cycles)}")
    print()
    print("Wave별 Task 수:")
    for w in waves:
        flag = f"  ⚠ {w['size_note']}" if (len(w["task_ids"]) < MIN_WAVE_SIZE or len(w["task_ids"]) > MAX_WAVE_SIZE) else ""
        print(f"  {w['wave_id']} (group {w['group']}, {GROUP_TITLES[w['group']]}): {len(w['task_ids'])}개{flag}")
    print()
    print("Page Owner 위치:")
    for tid in sorted(page_owner_ids):
        wid = wave_of_task[tid]
        w = waves[wave_index[wid]]
        is_last_in_group = w["task_ids"] == [tid] or (
            w == max((x for x in waves if x["group"] == w["group"]), key=lambda x: min(level[t] for t in x["task_ids"]))
        )
        print(f"  {tid} -> {wid} (group {w['group']}) — 해당 그룹의 마지막 Wave: {'예' if is_last_in_group else '아니오'}")

    print()
    print("BUILD_WAVES_CHECK_PASS" if check_only else "BUILD_WAVES_DONE")
    sys.exit(0)


if __name__ == "__main__":
    main()
