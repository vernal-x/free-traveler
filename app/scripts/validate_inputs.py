#!/usr/bin/env python3
"""Traveler Task Pipeline — Input Validator.

Run before /gen-tasklist. Confirms the source-of-truth documents are
internally consistent (SCREEN_ROUTE_CONTRACT.json as the Screen list of
record, per rule 2) and machine-readable enough to generate a Task List
from. Also snapshots the *actual* current src/app file tree so /gen-tasklist
can compute honest "Expected Files" instead of assuming a blank slate
(rule 4).

This script does not modify any file under docs/ or design-reference/. It
only writes TASKS/SRC_APP_TREE_SNAPSHOT.json.

Exit codes:
  0  all checks passed
  1  one or more fatal checks failed (see printed report)
"""
from __future__ import annotations

import datetime
import json
import re
import sys
from pathlib import Path

HARNESS_SCHEMA = "traveler-screen-route-v1"

EXPECTED_SCREENS = ["SCR-001", "SCR-002", "SCR-003", "SCR-004", "SCR-005"]
EXPECTED_ROUTES = {
    "SCR-001": "/",
    "SCR-002": "/about",
    "SCR-003": "/travel-tools",
    "SCR-004": "/mates",
    "SCR-005": "/account",
}
EXPECTED_PAGE_ENTRIES = {
    "SCR-001": "src/app/page.tsx",
    "SCR-002": "src/app/about/page.tsx",
    "SCR-003": "src/app/travel-tools/page.tsx",
    "SCR-004": "src/app/mates/page.tsx",
    "SCR-005": "src/app/account/page.tsx",
}
CORE_SCREENS = {"SCR-001", "SCR-003", "SCR-004", "SCR-005"}
AUX_SCREENS = {"SCR-002"}

EXPECTED_FUNC_COUNT = 80
EXPECTED_NF_COUNT = 34
VALID_IMPL_STATUSES = {"IMPLEMENT", "IMPLEMENT(축소)", "EXCLUDED"}

# scripts/validate_inputs.py -> parents[0]=scripts, parents[1]=app (project root)
PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = PROJECT_ROOT.parent
DOCS_DIR = PROJECT_ROOT / "docs"
DESIGN_REF_DIR = REPO_ROOT / "design-reference"
SRC_APP_DIR = PROJECT_ROOT / "src" / "app"
TASKS_DIR = PROJECT_ROOT / "TASKS"

errors: list[str] = []
warnings: list[str] = []


def fail(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def check_screen_route_contract() -> dict | None:
    path = DESIGN_REF_DIR / "SCREEN_ROUTE_CONTRACT.json"
    if not path.exists():
        fail(f"missing {path}")
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        fail(f"{path} is not valid JSON: {e}")
        return None

    if data.get("schema_version") != HARNESS_SCHEMA:
        fail(
            f"SCREEN_ROUTE_CONTRACT.json schema_version must be "
            f"{HARNESS_SCHEMA!r}, got {data.get('schema_version')!r}"
        )
    if data.get("framework") != "nextjs-app-router":
        fail(
            "SCREEN_ROUTE_CONTRACT.json framework must be "
            f"'nextjs-app-router', got {data.get('framework')!r}"
        )

    screens = data.get("screens", [])
    ids = [s.get("screen_id") for s in screens]
    if len(screens) != 5:
        fail(f"expected exactly 5 screens in SCREEN_ROUTE_CONTRACT.json, found {len(screens)}")
    if sorted(x for x in ids if x) != EXPECTED_SCREENS:
        fail(
            "screen_id set mismatch: expected "
            f"{EXPECTED_SCREENS}, got {sorted(x for x in ids if x)}"
        )

    routes = [s.get("route") for s in screens]
    if len(routes) != len(set(routes)):
        fail("duplicate 'route' values found in SCREEN_ROUTE_CONTRACT.json")

    entries = [s.get("page_entry") for s in screens]
    if len(entries) != len(set(entries)):
        fail("duplicate 'page_entry' values found in SCREEN_ROUTE_CONTRACT.json")

    for s in screens:
        sid = s.get("screen_id")
        if sid in EXPECTED_ROUTES and s.get("route") != EXPECTED_ROUTES[sid]:
            fail(f"{sid} route mismatch: expected {EXPECTED_ROUTES[sid]!r}, got {s.get('route')!r}")
        if sid in EXPECTED_PAGE_ENTRIES and s.get("page_entry") != EXPECTED_PAGE_ENTRIES[sid]:
            fail(
                f"{sid} page_entry mismatch: expected "
                f"{EXPECTED_PAGE_ENTRIES[sid]!r}, got {s.get('page_entry')!r}"
            )
        if s.get("page_owner_task_required") is not True:
            fail(f"{sid} must have page_owner_task_required=true")
        if s.get("preview_required") is not True:
            fail(f"{sid} must have preview_required=true")
        if sid == "SCR-001" and s.get("starter_template_forbidden") is not True:
            fail("SCR-001 must have starter_template_forbidden=true")

        stype = s.get("screen_type")
        if sid in CORE_SCREENS and stype != "core":
            fail(f"{sid} expected screen_type='core', got {stype!r}")
        if sid in AUX_SCREENS and stype != "auxiliary":
            fail(f"{sid} expected screen_type='auxiliary', got {stype!r}")

        if not s.get("section_order"):
            fail(f"{sid} is missing 'section_order' — /gen-tasklist needs it for rule 19")

    core_found = {s.get("screen_id") for s in screens if s.get("screen_type") == "core"}
    aux_found = {s.get("screen_id") for s in screens if s.get("screen_type") == "auxiliary"}
    if core_found != CORE_SCREENS:
        fail(f"core screen_type set mismatch: expected {sorted(CORE_SCREENS)}, got {sorted(core_found)}")
    if aux_found != AUX_SCREENS:
        fail(f"auxiliary screen_type set mismatch: expected {sorted(AUX_SCREENS)}, got {sorted(aux_found)}")

    tech = data.get("technical_routes", [])
    if not tech:
        warn(
            "technical_routes is empty — auth callback / API / not-found / "
            "error routes should be listed even though they are not Screens"
        )

    return data


REQ_ROW_RE = re.compile(
    r"REQ-(FUNC|NF)-(\d{3}).*?\|\s*(IMPLEMENT\(축소\)|IMPLEMENT|EXCLUDED)\s*\|"
)


def check_uiux_traceability() -> dict[str, str]:
    path = DOCS_DIR / "UIUX_TRACEABILITY.md"
    if not path.exists():
        fail(f"missing {path}")
        return {}

    text = path.read_text(encoding="utf-8")
    found: dict[str, str] = {}
    for m in REQ_ROW_RE.finditer(text):
        kind, num, status = m.group(1), m.group(2), m.group(3)
        req_id = f"REQ-{kind}-{num}"
        if status not in VALID_IMPL_STATUSES:
            fail(f"{req_id}: unrecognized Implementation Status {status!r}")
        if req_id in found and found[req_id] != status:
            fail(
                f"{req_id}: conflicting Implementation Status values found "
                f"({found[req_id]!r} vs {status!r})"
            )
        found[req_id] = status

    func_ids = [k for k in found if k.startswith("REQ-FUNC-")]
    nf_ids = [k for k in found if k.startswith("REQ-NF-")]
    if len(func_ids) != EXPECTED_FUNC_COUNT:
        fail(f"expected {EXPECTED_FUNC_COUNT} REQ-FUNC ids in UIUX_TRACEABILITY.md, found {len(func_ids)}")
    if len(nf_ids) != EXPECTED_NF_COUNT:
        fail(f"expected {EXPECTED_NF_COUNT} REQ-NF ids in UIUX_TRACEABILITY.md, found {len(nf_ids)}")

    expected_func = {f"REQ-FUNC-{i:03d}" for i in range(1, EXPECTED_FUNC_COUNT + 1)}
    expected_nf = {f"REQ-NF-{i:03d}" for i in range(1, EXPECTED_NF_COUNT + 1)}
    missing_func = expected_func - set(func_ids)
    missing_nf = expected_nf - set(nf_ids)
    if missing_func:
        fail(f"missing REQ-FUNC ids in UIUX_TRACEABILITY.md: {sorted(missing_func)}")
    if missing_nf:
        fail(f"missing REQ-NF ids in UIUX_TRACEABILITY.md: {sorted(missing_nf)}")

    return found


def check_project_scope_cross_reference(traceability_status: dict[str, str]) -> None:
    path = DOCS_DIR / "PROJECT_SCOPE.md"
    if not path.exists():
        fail(f"missing {path}")
        return

    text = path.read_text(encoding="utf-8")
    mismatches: list[str] = []
    for req_id, trace_status in traceability_status.items():
        pat = re.compile(re.escape(req_id) + r"\s*\|\s*(IMPLEMENT\(축소\)|IMPLEMENT|EXCLUDED)")
        m = pat.search(text)
        if not m:
            mismatches.append(f"{req_id}: not found in PROJECT_SCOPE.md")
            continue
        scope_family = "EXCLUDED" if m.group(1) == "EXCLUDED" else "IMPLEMENT"
        trace_family = "EXCLUDED" if trace_status == "EXCLUDED" else "IMPLEMENT"
        if scope_family != trace_family:
            mismatches.append(
                f"{req_id}: PROJECT_SCOPE.md={m.group(1)!r} vs UIUX_TRACEABILITY.md={trace_status!r}"
            )

    if mismatches:
        for line in mismatches[:20]:
            fail(line)
        if len(mismatches) > 20:
            fail(f"...and {len(mismatches) - 20} more PROJECT_SCOPE.md/UIUX_TRACEABILITY.md mismatches")


def check_ui_contract_md(contract_data: dict | None) -> None:
    path = DESIGN_REF_DIR / "UI_CONTRACT.md"
    if not path.exists():
        fail(f"missing {path}")
        return
    if contract_data is None:
        return

    text = path.read_text(encoding="utf-8")
    for s in contract_data.get("screens", []):
        sid, route = s.get("screen_id"), s.get("route")
        if sid and sid not in text:
            warn(f"{sid} not mentioned in UI_CONTRACT.md — check the two files are in sync (rule 2: JSON wins)")
        if route and route not in text:
            warn(f"route {route!r} not mentioned in UI_CONTRACT.md — check the two files are in sync")


def check_design_md() -> None:
    path = DESIGN_REF_DIR / "D-001" / "DESIGN.md"
    if not path.exists():
        fail(f"missing {path}")
        return
    text = path.read_text(encoding="utf-8")
    if "status: LOCKED" not in text:
        warn(
            "design-reference/D-001/DESIGN.md does not declare 'status: LOCKED' — "
            "confirm this is still the approved canon before generating tasks"
        )


def check_srs_uiux_revised() -> None:
    path = DOCS_DIR / "06_SRS_UIUX_REVISED.md"
    if not path.exists():
        fail(f"missing {path}")


def check_package_json() -> dict | None:
    path = PROJECT_ROOT / "package.json"
    if not path.exists():
        fail(f"missing {path}")
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        fail(f"package.json is not valid JSON: {e}")
        return None
    for key in ("dev", "build", "start", "lint"):
        if key not in data.get("scripts", {}):
            warn(f"package.json scripts.{key} is missing")
    return data


def snapshot_src_app_tree() -> tuple[list[str], Path]:
    files: list[str] = []
    if SRC_APP_DIR.exists():
        for p in sorted(SRC_APP_DIR.rglob("*")):
            if p.is_file():
                files.append(str(p.relative_to(PROJECT_ROOT)).replace("\\", "/"))
    else:
        warn(f"{SRC_APP_DIR} does not exist")

    TASKS_DIR.mkdir(parents=True, exist_ok=True)
    snapshot = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "src_app_dir": str(SRC_APP_DIR.relative_to(PROJECT_ROOT)),
        "existing_files": files,
        "note": (
            "gen-tasklist must diff planned Expected Files against existing_files "
            "instead of assuming a blank slate (rule 4)."
        ),
    }
    out = TASKS_DIR / "SRC_APP_TREE_SNAPSHOT.json"
    out.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return files, out


def main() -> None:
    print(f"[validate_inputs] project root: {PROJECT_ROOT}")
    print(f"[validate_inputs] repo root:    {REPO_ROOT}")

    contract_data = check_screen_route_contract()
    traceability_status = check_uiux_traceability()
    if traceability_status:
        check_project_scope_cross_reference(traceability_status)
    check_ui_contract_md(contract_data)
    check_design_md()
    check_srs_uiux_revised()
    check_package_json()
    files, snapshot_path = snapshot_src_app_tree()

    print(f"\n[validate_inputs] current src/app files ({len(files)}):")
    for f in files:
        print(f"  - {f}")
    print(f"[validate_inputs] wrote snapshot -> {snapshot_path.relative_to(PROJECT_ROOT)}")

    if warnings:
        print(f"\n[validate_inputs] {len(warnings)} warning(s):")
        for w in warnings:
            print(f"  ! {w}")

    if errors:
        print(f"\n[validate_inputs] FAILED — {len(errors)} error(s):")
        for e in errors:
            print(f"  x {e}")
        sys.exit(1)

    print("\n[validate_inputs] PASSED — inputs are consistent. Safe to run /gen-tasklist.")
    sys.exit(0)


if __name__ == "__main__":
    main()
