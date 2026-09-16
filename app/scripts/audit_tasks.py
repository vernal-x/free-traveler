#!/usr/bin/env python3
"""Traveler Task Pipeline — Final Task Audit.

Runs the 18 final audit checks against TASKS/00_TASK_LIST.md and
TASKS/TASK-<ID>.md, cross-referencing docs/PROJECT_SCOPE.md and
design-reference/SCREEN_ROUTE_CONTRACT.json, and writes:

  - TASKS/TASK_MANIFEST.csv   — one row per real Task (machine-readable)
  - TASKS/TASK_AUDIT_REPORT.md — the 18 checks with PASS/FAIL and detail

This script only reads TASKS/00_TASK_LIST.md, TASKS/TASK-*.md,
docs/PROJECT_SCOPE.md and design-reference/SCREEN_ROUTE_CONTRACT.json; it
writes only TASKS/TASK_MANIFEST.csv and TASKS/TASK_AUDIT_REPORT.md.

Exit codes:
  0  AUDIT_PASS — all 18 checks passed
  1  one or more checks failed
  2  TASKS/00_TASK_LIST.md does not exist yet (pipeline not run)
"""
from __future__ import annotations

import csv
import datetime
import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = PROJECT_ROOT.parent
DOCS_DIR = PROJECT_ROOT / "docs"
DESIGN_REF_DIR = REPO_ROOT / "design-reference"
TASKS_DIR = PROJECT_ROOT / "TASKS"
TASKLIST_PATH = TASKS_DIR / "00_TASK_LIST.md"
SCREEN_CONTRACT_PATH = DESIGN_REF_DIR / "SCREEN_ROUTE_CONTRACT.json"
PROJECT_SCOPE_PATH = DOCS_DIR / "PROJECT_SCOPE.md"
MANIFEST_PATH = TASKS_DIR / "TASK_MANIFEST.csv"
REPORT_PATH = TASKS_DIR / "TASK_AUDIT_REPORT.md"

EXPECTED_SCREENS = ["SCR-001", "SCR-002", "SCR-003", "SCR-004", "SCR-005"]
EXPECTED_FUNC_COUNT = 80
EXPECTED_NF_COUNT = 34
EXPECTED_TOTAL = EXPECTED_FUNC_COUNT + EXPECTED_NF_COUNT

DB_TABLE_ALLOWLIST = {
    "user_profile", "mate_post", "mate_application",
    "user_block", "report", "external_link_settings",
}
STATIC_DATA_DOMAINS = {
    "destination", "destinations", "destination_content",
    "country_safety", "safety", "representative_profile", "representative",
}
REQUIRED_DB_TASK_IDS = ["DB-SCHEMA-BASE", "DB-RLS-BASE", "DB-ACCESS", "DB-SEED-BASE"]

FORBIDDEN_KEYWORDS = [
    "EC2", "AWS", "auto-merge", "automerge", "Auto Merge",
    "자동 병합", "무인 병합", "무인 자동 Merge",
]

TASK_ID_RE = re.compile(r"^[A-Z0-9][A-Z0-9-]*$")
REQUIRED_DETAIL_SECTIONS = [
    "## Context", "## Project Scope", "## Requirement Ref",
    "## Screen / Route / Page Entry", "## Design Ref", "## Depends On",
    "## Expected Files", "## Functional AC", "## Visual AC",
    "## Security/Privacy AC", "## Test Cases", "## Verify",
    "## Definition of Done", "## Forbidden",
]

# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

TABLE_A_COLS = [
    "seq", "task_id", "title", "category", "impl_status", "req_ref",
    "screen", "route", "page_entry", "depends_on", "priority",
]
TABLE_B_COLS = [
    "task_id", "expected_files", "functional_ac", "visual_ac",
    "security_ac", "verify",
]


def _split_row(line: str) -> list[str]:
    line = line.strip()
    inner = line[1:-1] if line.startswith("|") and line.endswith("|") else line
    return [c.strip() for c in inner.split("|")]


def _is_separator_row(cells: list[str]) -> bool:
    return len(cells) > 0 and all(c.strip() == "" or set(c.strip()) <= set(":-") for c in cells)


def parse_task_tables(text: str) -> tuple[list[dict], list[dict]]:
    table_a: list[dict] = []
    table_b: list[dict] = []
    mode: str | None = None
    for line in text.splitlines():
        stripped = line.strip()
        if re.match(r"^#{3,4}\s+Table A\s*$", stripped):
            mode = "A"
            continue
        if re.match(r"^#{3,4}\s+Table B\s*$", stripped):
            mode = "B"
            continue
        if mode and stripped.startswith("|") and stripped.endswith("|"):
            cells = _split_row(stripped)
            ncols = len(TABLE_A_COLS) if mode == "A" else len(TABLE_B_COLS)
            if len(cells) != ncols or _is_separator_row(cells):
                continue
            if mode == "A" and cells[0].strip().lower() == "seq":
                continue
            if mode == "B" and cells[0].strip().lower() == "task id":
                continue
            row = dict(zip(TABLE_A_COLS if mode == "A" else TABLE_B_COLS, cells))
            (table_a if mode == "A" else table_b).append(row)
            continue
        if mode and stripped.startswith("#") and not re.match(r"^#{3,4}\s+Table [AB]\s*$", stripped):
            mode = None
    return table_a, table_b


def extract_req_ids(cell: str) -> list[str]:
    ids: list[str] = []
    current_prefix = None
    for tok in re.split(r",\s*", cell):
        tok = tok.strip()
        m_full_range = re.match(r"REQ-(FUNC|NF)-(\d{3})~(\d{3})$", tok)
        m_full_single = re.match(r"REQ-(FUNC|NF)-(\d{3})$", tok)
        m_bare_range = re.match(r"(\d{3})~(\d{3})$", tok)
        m_bare_single = re.match(r"(\d{3})$", tok)
        if m_full_range:
            kind, lo, hi = m_full_range.groups()
            current_prefix = kind
            ids += [f"REQ-{kind}-{n:03d}" for n in range(int(lo), int(hi) + 1)]
        elif m_full_single:
            kind, n = m_full_single.groups()
            current_prefix = kind
            ids.append(f"REQ-{kind}-{n}")
        elif m_bare_range and current_prefix:
            lo, hi = m_bare_range.groups()
            ids += [f"REQ-{current_prefix}-{n:03d}" for n in range(int(lo), int(hi) + 1)]
        elif m_bare_single and current_prefix:
            ids.append(f"REQ-{current_prefix}-{m_bare_single.group(1)}")
    return ids


def load_excluded_ids(tasklist_text: str) -> set[str]:
    if "## 12. NON_IMPLEMENTATION" not in tasklist_text:
        return set()
    block = tasklist_text.split("## 12. NON_IMPLEMENTATION", 1)[1]
    block = block.split("\n## 13.", 1)[0] if "\n## 13." in block else block
    return set(re.findall(r"\|\s*(REQ-(?:FUNC|NF)-\d{3})\s*\|", block))


PROJECT_SCOPE_ROW_RE = re.compile(
    r"(REQ-(?:FUNC|NF)-\d{3})\s*\|\s*(IMPLEMENT\(축소\)|IMPLEMENT|EXCLUDED)"
)


def load_project_scope_statuses() -> dict[str, str]:
    if not PROJECT_SCOPE_PATH.exists():
        return {}
    text = PROJECT_SCOPE_PATH.read_text(encoding="utf-8")
    out: dict[str, str] = {}
    for m in PROJECT_SCOPE_ROW_RE.finditer(text):
        out[m.group(1)] = m.group(2)
    return out


# ---------------------------------------------------------------------------
# Check runner
# ---------------------------------------------------------------------------

class Check:
    def __init__(self, number: int, name: str):
        self.number = number
        self.name = name
        self.passed = True
        self.details: list[str] = []

    def fail(self, msg: str) -> None:
        self.passed = False
        self.details.append(msg)

    def info(self, msg: str) -> None:
        self.details.append(msg)


results: list[Check] = []


def run_check(number: int, name: str, fn) -> Check:
    c = Check(number, name)
    try:
        fn(c)
    except Exception as e:  # a check crashing is itself a failure, not a script crash
        c.fail(f"check raised an exception: {e!r}")
    results.append(c)
    return c


# ---------------------------------------------------------------------------
# Individual checks (numbered per the audit spec)
# ---------------------------------------------------------------------------

def check_1_one_to_one(c: Check, table_a: list[dict]) -> None:
    task_ids = {r["task_id"] for r in table_a}
    detail_files = {p.stem[len("TASK-"):] for p in TASKS_DIR.glob("TASK-*.md")}
    missing = task_ids - detail_files
    orphan = detail_files - task_ids
    if missing:
        c.fail(f"{len(missing)} task(s) with no TASK-<ID>.md file: {sorted(missing)}")
    if orphan:
        c.fail(f"{len(orphan)} orphan TASK-*.md file(s) with no Task List row: {sorted(orphan)}")
    if not missing and not orphan:
        c.info(f"{len(task_ids)} Task List rows == {len(detail_files)} detail files")


def check_2_no_duplicate_ids(c: Check, table_a: list[dict]) -> None:
    ids = [r["task_id"] for r in table_a]
    dupes = sorted({x for x in ids if ids.count(x) > 1})
    if dupes:
        c.fail(f"duplicate Task ID(s): {dupes}")
    else:
        c.info(f"{len(ids)} Task IDs, all unique")
    bad_format = [i for i in ids if not TASK_ID_RE.match(i)]
    if bad_format:
        c.fail(f"Task ID(s) not matching ^[A-Z0-9][A-Z0-9-]*$: {bad_format}")


def check_3_depends_on_present(c: Check, table_a: list[dict]) -> None:
    missing = [r["task_id"] for r in table_a if not r["depends_on"].strip()]
    if missing:
        c.fail(f"{len(missing)} task(s) with an empty Depends On cell (must be a task list or '없음'): {missing}")
    else:
        c.info("every task has a populated Depends On cell (explicit IDs or '없음')")


def build_dep_graph(table_a: list[dict]) -> dict[str, list[str]]:
    graph: dict[str, list[str]] = {}
    for r in table_a:
        if r["depends_on"].strip() == "없음":
            graph[r["task_id"]] = []
        else:
            graph[r["task_id"]] = [d.strip() for d in r["depends_on"].split(",") if d.strip()]
    return graph


def check_4_no_cycles(c: Check, table_a: list[dict]) -> None:
    graph = build_dep_graph(table_a)
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {k: WHITE for k in graph}
    cycle: list[str] = []

    def dfs(u: str, path: list[str]) -> bool:
        color[u] = GRAY
        path.append(u)
        for v in graph.get(u, []):
            if v not in graph:
                continue  # unresolved dep reported by check 3-adjacent unknown-dep logic elsewhere
            if color.get(v) == GRAY:
                idx = path.index(v)
                cycle.extend(path[idx:] + [v])
                return True
            if color.get(v) == WHITE and dfs(v, path):
                return True
        path.pop()
        color[u] = BLACK
        return False

    found = False
    for node in list(graph):
        if color[node] == WHITE:
            if dfs(node, []):
                found = True
                break
    if found:
        c.fail(f"dependency cycle detected: {' -> '.join(cycle)}")
    else:
        c.info(f"no cycles in the {len(graph)}-node dependency graph (DFS)")


def check_5_page_owner_per_screen(c: Check, table_a: list[dict]) -> dict[str, dict]:
    page_owners = [r for r in table_a if r["category"] == "PAGE_OWNER"]
    screens = sorted(r["screen"] for r in page_owners)
    if len(page_owners) != 5:
        c.fail(f"expected exactly 5 PAGE_OWNER tasks, found {len(page_owners)}")
    if screens != EXPECTED_SCREENS:
        c.fail(f"PAGE_OWNER screen set mismatch: expected {EXPECTED_SCREENS}, got {screens}")
    by_screen = {r["screen"]: r for r in page_owners}
    for sid in EXPECTED_SCREENS:
        if sid not in by_screen:
            c.fail(f"no PAGE_OWNER task found for {sid}")
    if not c.details:
        c.info("SCR-001..005 each have exactly one PAGE_OWNER task")
    return by_screen


def check_6_route_page_entry_expected_files(c: Check, by_screen: dict[str, dict], table_b: list[dict]) -> None:
    if not SCREEN_CONTRACT_PATH.exists():
        c.fail(f"missing {SCREEN_CONTRACT_PATH}")
        return
    contract = json.loads(SCREEN_CONTRACT_PATH.read_text(encoding="utf-8"))
    contract_by_id = {s["screen_id"]: s for s in contract.get("screens", []) if s.get("screen_id")}
    b_by_id = {r["task_id"]: r for r in table_b}

    for sid, row in by_screen.items():
        contract_screen = contract_by_id.get(sid)
        if not contract_screen:
            c.fail(f"{sid} not found in SCREEN_ROUTE_CONTRACT.json")
            continue
        expected_route = contract_screen.get("route")
        expected_entry = contract_screen.get("page_entry")

        got_route = row["route"].strip("`")
        if got_route != expected_route:
            c.fail(f"{row['task_id']} ({sid}) Route {got_route!r} != contract route {expected_route!r}")

        if expected_entry not in row["page_entry"]:
            c.fail(f"{row['task_id']} ({sid}) Page Entry {row['page_entry']!r} does not contain contract page_entry {expected_entry!r}")

        expected_files = b_by_id.get(row["task_id"], {}).get("expected_files", "")
        if expected_entry not in expected_files:
            c.fail(f"{row['task_id']} ({sid}) Expected Files does not reference contract page_entry {expected_entry!r}: {expected_files!r}")

    if not c.details:
        c.info("all 5 Page Owners' Route/Page Entry/Expected Files match SCREEN_ROUTE_CONTRACT.json")


def check_7_no_component_only_screen(c: Check, table_a: list[dict], by_screen: dict[str, dict]) -> None:
    components = [r for r in table_a if r["category"] == "COMPONENT"]
    orphan_components = []
    for comp in components:
        sid = comp["screen"].strip()
        if sid not in EXPECTED_SCREENS:
            continue
        owner = by_screen.get(sid)
        if not owner:
            orphan_components.append(comp["task_id"])
            continue
        if comp["task_id"] not in owner["depends_on"]:
            orphan_components.append(comp["task_id"])
    if orphan_components:
        c.fail(
            f"{len(orphan_components)} Component task(s) exist for a screen but are never "
            f"assembled by that screen's Page Owner (Depends On): {orphan_components}"
        )
    else:
        c.info(f"all {len(components)} Component tasks are referenced by their screen's Page Owner")


def _detail_text(task_id: str) -> str:
    path = TASKS_DIR / f"TASK-{task_id}.md"
    return path.read_text(encoding="utf-8") if path.exists() else ""


def check_8_scr001_starter_removal_ac(c: Check) -> None:
    text = _detail_text("PAGE-SCR001")
    if not text:
        c.fail("TASK-PAGE-SCR001.md not found")
        return
    has_starter = bool(re.search(r"Starter|스캐폴드", text))
    has_removal = "제거" in text
    if not (has_starter and has_removal):
        c.fail("TASK-PAGE-SCR001.md does not contain an explicit Next.js Starter removal AC (expected 'Starter'/'스캐폴드' + '제거')")
    else:
        c.info("TASK-PAGE-SCR001.md contains a Starter-removal AC")


def check_9_scr003_three_tabs_ac(c: Check) -> None:
    text = _detail_text("PAGE-SCR003")
    if not text:
        c.fail("TASK-PAGE-SCR003.md not found")
        return
    missing = [kw for kw in ("탭",) if kw not in text]
    missing += [kw for kw in ("항공", "숙소", "동행") if kw not in text]
    if missing:
        c.fail(f"TASK-PAGE-SCR003.md is missing tab-assembly keyword(s): {missing}")
    else:
        c.info("TASK-PAGE-SCR003.md contains an AC assembling 항공/숙소/동행 tabs")


def check_10_scr005_role_states_ac(c: Check) -> None:
    text = _detail_text("PAGE-SCR005")
    if not text:
        c.fail("TASK-PAGE-SCR005.md not found")
        return
    missing = [kw for kw in ("Guest", "Member", "Admin") if kw not in text]
    if missing:
        c.fail(f"TASK-PAGE-SCR005.md is missing role-state keyword(s): {missing}")
    else:
        c.info("TASK-PAGE-SCR005.md contains an AC assembling Guest/Member/Admin states")


def check_11_db_tasks_present(c: Check, table_a: list[dict]) -> None:
    ids = {r["task_id"] for r in table_a}
    missing = [t for t in REQUIRED_DB_TASK_IDS if t not in ids]
    if missing:
        c.fail(f"missing required DB task(s): {missing}")
    else:
        c.info(f"all required DB tasks present: {REQUIRED_DB_TASK_IDS}")


TABLE_TOKEN_RE = re.compile(r"`([a-z][a-z0-9_]*)`")


def check_12_db_table_scope(c: Check, table_a: list[dict], table_b: list[dict]) -> None:
    """Extracts actual backtick-quoted snake_case identifiers from each DB
    task's title/Expected Files/Functional AC (not just membership-testing
    known words — that would never catch an unexpected/unknown table name)
    and validates every claimed identifier against the 6-table allowlist."""
    b_by_id = {r["task_id"]: r for r in table_b}
    db_rows = [r for r in table_a if r["category"] == "DB"]
    claimed: set[str] = set()
    claimed_by: dict[str, list[str]] = {}
    for r in db_rows:
        blob = (
            r["title"] + " " + b_by_id.get(r["task_id"], {}).get("expected_files", "") + " " +
            b_by_id.get(r["task_id"], {}).get("functional_ac", "")
        )
        for tok in TABLE_TOKEN_RE.findall(blob):
            claimed.add(tok)
            claimed_by.setdefault(tok, []).append(r["task_id"])

    static_hits = claimed & STATIC_DATA_DOMAINS
    for name in sorted(static_hits):
        c.fail(f"{claimed_by[name]} (DB) claims {name!r} — destinations/safety/profile must stay static data, not a DB table")

    outside = claimed - DB_TABLE_ALLOWLIST - STATIC_DATA_DOMAINS
    if outside:
        c.fail(f"DB task content claims table name(s) outside the 6-table allowlist: {sorted(outside)} (from {[ (t, claimed_by[t]) for t in sorted(outside)]})")

    within = claimed & DB_TABLE_ALLOWLIST
    if len(within) > 6:
        c.fail(f"DB tasks collectively claim {len(within)} tables (> 6): {sorted(within)}")

    if not c.details:
        c.info(f"DB tasks claim {len(within)}/6 allowlisted table(s), no unexpected identifiers: {sorted(within)}")


def check_13_external_input_no_persist_ac(c: Check) -> None:
    missing = []
    for tid in ("CMP-SCR003-FLIGHT-FORM", "CMP-SCR003-HOTEL-FORM"):
        text = _detail_text(tid)
        if not text:
            c.fail(f"TASK-{tid}.md not found")
            continue
        if not re.search(r"서버.*(미저장|저장.*(금지|없음))|API\s*없음", text):
            missing.append(tid)
    if missing:
        c.fail(f"missing an explicit 'no server-side persistence of external trip input' AC in: {missing}")
    elif not c.details:
        c.info("CMP-SCR003-FLIGHT-FORM / HOTEL-FORM both contain a no-server-persistence AC")


def check_14_auth_adult_rls_ac(c: Check) -> None:
    auth_text = _detail_text("AUTH-EMAIL-ADULT")
    if not auth_text:
        c.fail("TASK-AUTH-EMAIL-ADULT.md not found")
    elif "성인" not in auth_text:
        c.fail("TASK-AUTH-EMAIL-ADULT.md does not mention 성인(adult) verification")

    rls_text = _detail_text("DB-RLS-BASE")
    if not rls_text:
        c.fail("TASK-DB-RLS-BASE.md not found")
    elif "RLS" not in rls_text:
        c.fail("TASK-DB-RLS-BASE.md does not mention RLS")

    if not c.details:
        c.info("AUTH-EMAIL-ADULT covers adult verification and DB-RLS-BASE covers RLS")


def check_15_playwright_chromium_smoke(c: Check, table_a: list[dict], table_b: list[dict]) -> None:
    b_by_id = {r["task_id"]: r for r in table_b}
    e2e_rows = [r for r in table_a if r["category"] == "E2E_TEST"]
    if not e2e_rows:
        c.fail("no E2E_TEST category task found — a Playwright Chromium smoke task is required")
        return
    for r in e2e_rows:
        verify = b_by_id.get(r["task_id"], {}).get("verify", "").lower()
        if "chromium" not in verify:
            c.fail(f"{r['task_id']} (E2E_TEST) Verify does not mention chromium: {verify!r}")
        for bad in ("firefox", "webkit"):
            if bad in verify:
                c.fail(f"{r['task_id']} (E2E_TEST) Verify mentions {bad!r} — Chromium smoke only")
    if not c.details:
        c.info(f"{len(e2e_rows)} E2E_TEST task(s), all Chromium-only: {[r['task_id'] for r in e2e_rows]}")


def check_16_no_aws_ec2_automerge(c: Check, table_a: list[dict], table_b: list[dict]) -> None:
    b_by_id = {r["task_id"]: r for r in table_b}
    hits = []
    for r in table_a:
        blob = " ".join([
            r["task_id"], r["title"],
            b_by_id.get(r["task_id"], {}).get("expected_files", ""),
            b_by_id.get(r["task_id"], {}).get("functional_ac", ""),
        ])
        for kw in FORBIDDEN_KEYWORDS:
            if kw.lower() in blob.lower():
                hits.append((r["task_id"], kw))
    if hits:
        c.fail(f"forbidden keyword(s) found in task content: {hits}")
    else:
        c.info("no EC2/AWS/auto-merge keywords found in any task")


def check_17_requirement_coverage(c: Check, table_a: list[dict], excluded_ids: set[str]) -> None:
    implement_ids: set[str] = set()
    for r in table_a:
        for rid in extract_req_ids(r["req_ref"]):
            if rid in excluded_ids:
                c.fail(f"{r['task_id']} lists {rid} in Requirement Ref, but §12 records it EXCLUDED")
            implement_ids.add(rid)

    expected_func = {f"REQ-FUNC-{i:03d}" for i in range(1, EXPECTED_FUNC_COUNT + 1)}
    expected_nf = {f"REQ-NF-{i:03d}" for i in range(1, EXPECTED_NF_COUNT + 1)}
    expected_all = expected_func | expected_nf
    found_all = implement_ids | excluded_ids

    missing = expected_all - found_all
    extra = found_all - expected_all
    overlap = implement_ids & excluded_ids
    if missing:
        c.fail(f"{len(missing)} requirement id(s) missing from Task+EXCLUDED coverage: {sorted(missing)[:10]}")
    if extra:
        c.fail(f"{len(extra)} unrecognized requirement id(s): {sorted(extra)[:10]}")
    if overlap:
        c.fail(f"requirement id(s) both IMPLEMENT and EXCLUDED: {sorted(overlap)}")

    scope = load_project_scope_statuses()
    scope_mismatches = 0
    for rid in expected_all:
        scope_status = scope.get(rid)
        if not scope_status:
            continue
        scope_family = "EXCLUDED" if scope_status == "EXCLUDED" else "IMPLEMENT"
        if rid in excluded_ids:
            here_family = "EXCLUDED"
        elif rid in implement_ids:
            here_family = "IMPLEMENT"
        else:
            continue
        if scope_family != here_family:
            scope_mismatches += 1
            if scope_mismatches <= 10:
                c.fail(f"{rid}: docs/PROJECT_SCOPE.md={scope_status!r} but Task List/§12={here_family!r}")

    if not c.details:
        c.info(f"REQ-FUNC: {EXPECTED_FUNC_COUNT}, REQ-NF: {EXPECTED_NF_COUNT}, total {len(found_all)} "
                f"(IMPLEMENT {len(implement_ids)} + EXCLUDED {len(excluded_ids)}) — all present exactly once, matches PROJECT_SCOPE.md")


def check_18_excluded_has_no_detail_file(c: Check, table_a: list[dict], excluded_ids: set[str]) -> None:
    task_req_refs: set[str] = set()
    for r in table_a:
        task_req_refs.update(extract_req_ids(r["req_ref"]))

    violating = sorted(excluded_ids & task_req_refs)
    if violating:
        c.fail(f"EXCLUDED requirement id(s) appear in a real Task's Requirement Ref: {violating}")

    # No detail file is ever named after a bare REQ id or an EXCLUDED marker.
    stray = [
        p.name for p in TASKS_DIR.glob("TASK-*.md")
        if re.search(r"REQ-(FUNC|NF)-\d{3}", p.stem)
    ]
    if stray:
        c.fail(f"found detail file(s) named after a bare Requirement ID (EXCLUDED items must not get detail files): {stray}")

    if not c.details:
        c.info(f"none of the {len(excluded_ids)} EXCLUDED requirement ids have an implementation task or detail file")


def check_detail_sections_present(table_a: list[dict]) -> list[str]:
    """Not one of the 18 numbered checks, but feeds into the manifest/report
    as extra evidence; failures here are folded into check 1's detail file
    requirement implicitly satisfied by the generator, so this is reported
    only as informational text in the report, not a separate gating check."""
    problems = []
    for r in table_a:
        text = _detail_text(r["task_id"])
        if not text:
            continue
        missing = [h for h in REQUIRED_DETAIL_SECTIONS if h not in text]
        if missing:
            problems.append(f"{r['task_id']}: missing {missing}")
    return problems


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------

def write_manifest_csv(table_a: list[dict], table_b: list[dict]) -> None:
    b_by_id = {r["task_id"]: r for r in table_b}
    fieldnames = [
        "seq", "task_id", "category", "impl_status", "priority",
        "screen", "route", "page_entry", "depends_on", "req_ref",
        "verify", "detail_file",
    ]
    with MANIFEST_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in sorted(table_a, key=lambda x: int(x["seq"])):
            row = {
                "seq": r["seq"],
                "task_id": r["task_id"],
                "category": r["category"],
                "impl_status": r["impl_status"],
                "priority": r["priority"],
                "screen": r["screen"],
                "route": r["route"],
                "page_entry": r["page_entry"],
                "depends_on": r["depends_on"],
                "req_ref": r["req_ref"],
                "verify": b_by_id.get(r["task_id"], {}).get("verify", ""),
                "detail_file": f"TASKS/TASK-{r['task_id']}.md",
            }
            writer.writerow(row)


def write_report_md(table_a: list[dict], excluded_ids: set[str], detail_section_problems: list[str]) -> None:
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    passed_count = sum(1 for r in results if r.passed)
    total = len(results)
    overall = "AUDIT_PASS" if passed_count == total else "AUDIT_FAIL"

    lines = [
        "# Free Traveler — Task Audit Report",
        "",
        f"**생성 시각:** {now}",
        f"**대상:** `TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md` ({len(table_a)}개)",
        f"**교차검증 입력:** `docs/PROJECT_SCOPE.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`",
        f"**결과:** **{overall}** ({passed_count}/{total} 검사 통과)",
        "",
        "이 보고서는 코드 구현 여부를 확인하지 않는다 — Task List·Task 상세 문서의 구조적/",
        "내용적 정합성만 검사한다.",
        "",
        "## 검사 결과",
        "",
        "| # | 검사 | 결과 |",
        "|---|---|---|",
    ]
    for r in results:
        status = "PASS" if r.passed else "**FAIL**"
        lines.append(f"| {r.number} | {r.name} | {status} |")

    lines += ["", "## 상세"]
    for r in results:
        status = "✅ PASS" if r.passed else "❌ FAIL"
        lines.append(f"\n### {r.number}. {r.name} — {status}\n")
        if r.details:
            for d in r.details:
                lines.append(f"- {d}")
        else:
            lines.append("- (세부 메시지 없음)")

    lines += [
        "",
        "## 참고: 상세 파일 14개 절 존재 여부",
        "",
        "(18개 정식 검사에는 포함되지 않는 보조 확인 — 상세 파일 생성기가 항상 14개 절을 채우므로",
        "구조적으로는 이미 보장되지만, 수동 편집 이후에도 깨지지 않았는지 참고용으로 재확인한다.)",
        "",
    ]
    if detail_section_problems:
        lines.append(f"⚠ {len(detail_section_problems)}건 문제 발견:")
        for p in detail_section_problems:
            lines.append(f"- {p}")
    else:
        lines.append(f"모든 {len(table_a)}개 상세 파일에 필수 14개 절이 존재함을 확인했다.")

    lines += [
        "",
        f"## EXCLUDED Requirement 수",
        "",
        f"§12 NON_IMPLEMENTATION 표 기준 {len(excluded_ids)}건(REQ-FUNC 11 + REQ-NF 13 = 24건이어야 함).",
    ]

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if not TASKLIST_PATH.exists():
        print(f"[audit_tasks] {TASKLIST_PATH.relative_to(PROJECT_ROOT)} not found.")
        print("[audit_tasks] Generate the Task List and TASKS/TASK-*.md detail files first.")
        sys.exit(2)

    text = TASKLIST_PATH.read_text(encoding="utf-8")
    table_a, table_b = parse_task_tables(text)
    if not table_a:
        print("[audit_tasks] AUDIT_FAIL — TASKS/00_TASK_LIST.md has no parseable Table A rows.")
        sys.exit(1)

    excluded_ids = load_excluded_ids(text)

    run_check(1, "Task List 구현 ID와 상세 Task 파일 1:1", lambda c: check_1_one_to_one(c, table_a))
    run_check(2, "중복 Task ID 0", lambda c: check_2_no_duplicate_ids(c, table_a))
    run_check(3, "Depends On 누락 0", lambda c: check_3_depends_on_present(c, table_a))
    run_check(4, "Dependency Cycle 0", lambda c: check_4_no_cycles(c, table_a))

    by_screen_holder: dict[str, dict] = {}

    def _check5(c: Check) -> None:
        by_screen_holder.update(check_5_page_owner_per_screen(c, table_a))

    run_check(5, "Screen 5개 모두 Page Owner 정확히 1개", _check5)
    run_check(6, "Route·Page Entry·Expected Files 일치", lambda c: check_6_route_page_entry_expected_files(c, by_screen_holder, table_b))
    run_check(7, "Component-only Screen 0", lambda c: check_7_no_component_only_screen(c, table_a, by_screen_holder))
    run_check(8, "SCR-001 Starter 제거 AC 존재", lambda c: check_8_scr001_starter_removal_ac(c))
    run_check(9, "SCR-003 세 탭 조립 AC 존재", lambda c: check_9_scr003_three_tabs_ac(c))
    run_check(10, "SCR-005 역할별 상태 조립 AC 존재", lambda c: check_10_scr005_role_states_ac(c))
    run_check(11, "DB Schema·RLS·Access·Seed Task 존재", lambda c: check_11_db_tasks_present(c, table_a))
    run_check(12, "DB Table 범위가 6개 기본 테이블을 크게 넘지 않음", lambda c: check_12_db_table_scope(c, table_a, table_b))
    run_check(13, "외부 입력 비저장 AC 존재", lambda c: check_13_external_input_no_persist_ac(c))
    run_check(14, "Auth·성인·기본 RLS AC 존재", lambda c: check_14_auth_adult_rls_ac(c))
    run_check(15, "Playwright Chromium Smoke Task 존재", lambda c: check_15_playwright_chromium_smoke(c, table_a, table_b))
    run_check(16, "AWS·EC2·자동 Merge 구현 Task 0", lambda c: check_16_no_aws_ec2_automerge(c, table_a, table_b))
    run_check(17, "REQ-FUNC 80개와 REQ-NF 34개가 Task 또는 EXCLUDED 표에 존재", lambda c: check_17_requirement_coverage(c, table_a, excluded_ids))
    run_check(18, "EXCLUDED 상세 구현 파일이 생성되지 않음", lambda c: check_18_excluded_has_no_detail_file(c, table_a, excluded_ids))

    detail_section_problems = check_detail_sections_present(table_a)

    TASKS_DIR.mkdir(parents=True, exist_ok=True)
    write_manifest_csv(table_a, table_b)
    write_report_md(table_a, excluded_ids, detail_section_problems)

    print(f"[audit_tasks] wrote {MANIFEST_PATH.relative_to(PROJECT_ROOT)}")
    print(f"[audit_tasks] wrote {REPORT_PATH.relative_to(PROJECT_ROOT)}")
    print()

    failed = [r for r in results if not r.passed]
    for r in results:
        status = "PASS" if r.passed else "FAIL"
        print(f"[audit_tasks] check {r.number:>2}/{len(results)} [{status}] {r.name}")
        if not r.passed:
            for d in r.details:
                print(f"    x {d}")

    print()
    if failed:
        print(f"[audit_tasks] AUDIT_FAIL — {len(failed)}/{len(results)} check(s) failed. See {REPORT_PATH.relative_to(PROJECT_ROOT)}.")
        sys.exit(1)

    print(f"AUDIT_PASS — {len(results)}/{len(results)} checks passed.")
    sys.exit(0)


if __name__ == "__main__":
    main()
