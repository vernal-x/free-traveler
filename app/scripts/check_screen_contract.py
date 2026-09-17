#!/usr/bin/env python3
"""Traveler Screen Contract Checker.

Validates that the 5 fixed Screens (SCR-001~005) stay exactly what
`design-reference/SCREEN_ROUTE_CONTRACT.json` says they are — one Page Owner
Task per Screen, no technical Route miscounted as a Screen, no stray new
Page for things that must stay in-screen overlays (destination detail,
country safety), and SCR-003 covering both the travel-input and mate-write
requirements. This is the `screen:contract` check registered in
`package.json` (`npm run screen:contract`), used standalone and as one step
of `npm run validate` / `npm run ci`.

This is a different layer from the other pipeline scripts:
  - scripts/validate_inputs.py  — input docs consistent, before Task generation
  - scripts/audit_tasks.py      — Task List / Task detail content, 18 checks
  - scripts/validate_harness.py — CLAUDE.md/Skill/Commands governance layer
  - scripts/build_waves.py      — Wave assignment + dependency-order validity
  - this script                 — the 5-Screen Route contract specifically,
                                   checked against either the Task plan or the
                                   real src/app filesystem depending on --mode

This script only reads files; it never modifies anything.

Modes (--mode=plan|ci|release, default plan):
  plan     Checks the Task *plan* only (TASKS/TASK_MANIFEST.csv + each Task's
           Expected Files) — safe to run before any Page exists.
  ci       Checks the Task plan AND the real `src/app` filesystem (which
           page.tsx files actually exist) — for use once implementation has
           started.
  release  Everything `ci` checks, plus each Screen's
           `docs/preview-checks/SCR-<NNN>.md` has a filled-in confirmation.

Exit codes:
  0  all applicable checks passed (prints CHECK_SCREEN_CONTRACT_PASS)
  1  one or more checks failed (prints file/screen/hint per error)
"""
from __future__ import annotations

import csv
import fnmatch
import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = PROJECT_ROOT.parent

SCREEN_CONTRACT_PATH = REPO_ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"
SCREEN_CONTRACT_REL = "design-reference/SCREEN_ROUTE_CONTRACT.json"
MANIFEST_PATH = PROJECT_ROOT / "TASKS" / "TASK_MANIFEST.csv"
SRC_APP_DIR = PROJECT_ROOT / "src" / "app"
PREVIEW_CHECKS_DIR = PROJECT_ROOT / "docs" / "preview-checks"

# 고정 화면 5개 — 이 스크립트의 정본은 SCREEN_ROUTE_CONTRACT.json이지만, 사용자가
# 요청 원문에 명시한 값과도 항상 일치해야 하므로 여기 하드코딩해 교차검증한다.
FIXED_SCREENS = {
    "SCR-001": "/",
    "SCR-002": "/about",
    "SCR-003": "/travel-tools",
    "SCR-004": "/mates",
    "SCR-005": "/account",
}

# 허용 기술 경로 — 사용자 화면(5개)으로 세지 않는다. `not_found`는 `*` 라우트로
# 표기되지만 파일은 `not-found.tsx` 하나뿐이라 "not-found"로 매칭한다.
ALLOWED_TECHNICAL_ROUTE_PREFIXES = ["/auth/callback", "/api/"]
ALLOWED_TECHNICAL_ROUTE_NAMES = {"not-found", "error"}

# SCR-001의 여행지 상세/안전정보는 in_screen_overlays(Drawer/Modal)로만 존재해야
# 하고 별도 Page(route)가 되면 안 된다 — 검사 4가 찾는 키워드.
FORBIDDEN_NEW_PAGE_KEYWORDS = {
    "destination": "여행지 상세는 SCR-001의 in_screen Drawer/Modal로만 존재해야 한다 — 새 Route를 만들지 말고 CMP-SCR001-DESTINATION-DRAWER 컴포넌트로 조립하라",
    "safety": "안전정보는 SCR-001의 in_screen Drawer/Modal로만 존재해야 한다 — 새 Route를 만들지 말고 CMP-SCR001-SAFETY-GRID-DRAWER 컴포넌트로 조립하라",
}

EXPECTED_FILES_RE = re.compile(r"## Expected Files\n(.*?)\n##", re.S)
BACKTICK_PATH_RE = re.compile(r"`([^`]+)`")


class CheckError(Exception):
    pass


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


class ErrorCollector:
    def __init__(self) -> None:
        self.items: list[tuple[str, str, str, str]] = []

    def add(self, file: str, screen: str, message: str, hint: str) -> None:
        self.items.append((file, screen, message, hint))

    def __bool__(self) -> bool:
        return bool(self.items)


def load_contract() -> dict:
    if not SCREEN_CONTRACT_PATH.exists():
        raise CheckError(f"{SCREEN_CONTRACT_REL} 없음")
    try:
        return json.loads(SCREEN_CONTRACT_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise CheckError(f"{SCREEN_CONTRACT_REL} JSON 파싱 실패: {e}")


def load_manifest() -> list[dict]:
    if not MANIFEST_PATH.exists():
        raise CheckError(
            f"{rel(MANIFEST_PATH)} 없음 — 먼저 `python3 scripts/audit_tasks.py`를 실행하라"
        )
    with MANIFEST_PATH.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def strip_backticks(s: str) -> str:
    return s.strip().strip("`")


# ---------------------------------------------------------------------------
# Check 1 — 고정 화면 5개가 정확히 존재한다
# ---------------------------------------------------------------------------


def check_1_fixed_screens(contract: dict, errors: ErrorCollector) -> None:
    screens = contract.get("screens", [])
    contract_ids = {s.get("screen_id") for s in screens}

    if len(screens) != 5:
        errors.add(
            SCREEN_CONTRACT_REL,
            "N/A",
            f"screens[] 길이가 5가 아니라 {len(screens)}",
            "screens[] 배열을 정확히 5개(SCR-001~005)로 맞추라",
        )

    for screen_id, expected_route in FIXED_SCREENS.items():
        if screen_id not in contract_ids:
            errors.add(
                SCREEN_CONTRACT_REL,
                screen_id,
                f"{screen_id}가 screens[]에 없음",
                f"screens[]에 screen_id={screen_id}, route={expected_route} 항목을 추가하라",
            )
            continue
        entry = next(s for s in screens if s.get("screen_id") == screen_id)
        actual_route = entry.get("route")
        if actual_route != expected_route:
            errors.add(
                SCREEN_CONTRACT_REL,
                screen_id,
                f"route가 {actual_route!r}인데 고정값 {expected_route!r}과 다름",
                f"{screen_id}의 route를 {expected_route!r}로 고치라(라우트는 계약 변경 대상 아님)",
            )

    extra_ids = contract_ids - set(FIXED_SCREENS)
    for extra in sorted(extra_ids):
        errors.add(
            SCREEN_CONTRACT_REL,
            extra,
            "고정 화면 5개(SCR-001~005) 밖의 Screen ID",
            f"{extra}를 제거하거나, 정말 새 화면이 필요하면 먼저 사람의 승인을 받아 계약을 갱신하라",
        )


# ---------------------------------------------------------------------------
# Check 2 — 각 화면 Page Owner Task가 정확히 하나다
# ---------------------------------------------------------------------------


def check_2_page_owner_unique(
    contract: dict, manifest_rows: list[dict], errors: ErrorCollector
) -> None:
    screens_by_id = {s["screen_id"]: s for s in contract.get("screens", [])}
    for screen_id, expected_route in FIXED_SCREENS.items():
        owners = [
            r
            for r in manifest_rows
            if r.get("category") == "PAGE_OWNER" and r.get("screen") == screen_id
        ]
        if len(owners) == 0:
            errors.add(
                rel(MANIFEST_PATH),
                screen_id,
                "PAGE_OWNER Task가 하나도 없음",
                f"{screen_id}를 담당하는 PAGE_OWNER Task(예: PAGE-{screen_id.replace('SCR-', 'SCR')})를 TASKS/00_TASK_LIST.md에 추가하라",
            )
            continue
        if len(owners) > 1:
            ids = ", ".join(o["task_id"] for o in owners)
            errors.add(
                rel(MANIFEST_PATH),
                screen_id,
                f"PAGE_OWNER Task가 {len(owners)}개({ids}) — 정확히 1개여야 함",
                f"{screen_id}의 Page Owner를 하나만 남기고 나머지는 COMPONENT로 재분류하라",
            )
            continue

        owner = owners[0]
        actual_route = strip_backticks(owner.get("route", ""))
        if actual_route != expected_route:
            errors.add(
                owner.get("detail_file", rel(MANIFEST_PATH)),
                screen_id,
                f"Page Owner({owner['task_id']})의 route가 {actual_route!r}, 계약은 {expected_route!r}",
                "Task의 Screen/Route/Page Entry 절을 SCREEN_ROUTE_CONTRACT.json과 일치시키라",
            )

        expected_entry = screens_by_id.get(screen_id, {}).get("page_entry", "")
        actual_entry = strip_backticks(owner.get("page_entry", ""))
        if expected_entry and actual_entry != expected_entry:
            errors.add(
                owner.get("detail_file", rel(MANIFEST_PATH)),
                screen_id,
                f"Page Owner({owner['task_id']})의 page_entry가 {actual_entry!r}, 계약은 {expected_entry!r}",
                "Task의 Page Entry를 SCREEN_ROUTE_CONTRACT.json의 page_entry와 일치시키라",
            )


# ---------------------------------------------------------------------------
# Check 3 — 기술 경로를 사용자 화면으로 세지 않는다
# ---------------------------------------------------------------------------


def _is_allowed_technical_route(route: str) -> bool:
    if route in ALLOWED_TECHNICAL_ROUTE_NAMES:
        return True
    return any(route.startswith(p) for p in ALLOWED_TECHNICAL_ROUTE_PREFIXES)


def check_3_technical_routes_not_screens(
    manifest_rows: list[dict], errors: ErrorCollector
) -> None:
    for r in manifest_rows:
        if r.get("category") != "PAGE_OWNER":
            continue
        screen = r.get("screen", "")
        route = strip_backticks(r.get("route", ""))
        if screen not in FIXED_SCREENS:
            errors.add(
                r.get("detail_file", rel(MANIFEST_PATH)),
                screen or "N/A",
                f"PAGE_OWNER Task {r['task_id']}의 screen 값 {screen!r}이 고정 화면 5개에 없음",
                "기술 경로(/auth/callback, /api/**, not-found, error)는 Screen이 아니다 — "
                "PAGE_OWNER Category를 잘못 붙였다면 TOOLING/SERVER_ACTION 등으로 재분류하라",
            )
            continue
        if _is_allowed_technical_route(route):
            errors.add(
                r.get("detail_file", rel(MANIFEST_PATH)),
                screen,
                f"PAGE_OWNER Task {r['task_id']}의 route {route!r}가 기술 경로 허용 목록과 겹침",
                "기술 경로는 5개 고정 화면과 별개다 — route를 SCREEN_ROUTE_CONTRACT.json의 "
                "실제 Screen route로 고치라",
            )


# ---------------------------------------------------------------------------
# Check 4 — 여행지 상세·안전정보를 새 Page로 만들지 않았는지 검사
# ---------------------------------------------------------------------------


def collect_allowed_page_globs(manifest_rows: list[dict]) -> list[str]:
    """Pages outside the 5 fixed Screens that a Task explicitly, deliberately
    owns as a non-Screen static page (e.g. TOOL-POLICY-PAGES' `/legal/*` —
    its own Task doc says "5개 핵심 Screen 수에 미포함"). Any manifest row
    whose `screen` is not one of the 5 fixed Screens but which still
    declares a real `page_entry` is treated as such a declared exception,
    so this generalizes to future non-Screen static-page Tasks without
    needing to hardcode each one here."""
    globs: list[str] = []
    for r in manifest_rows:
        if r.get("screen") in FIXED_SCREENS:
            continue
        entry = strip_backticks(r.get("page_entry", ""))
        if entry and entry not in ("N/A", "—", "-"):
            globs.append(entry)
    return globs


def _is_allowed_page(candidate: str, allowed_entries: set[str], allowed_globs: list[str]) -> bool:
    if candidate in allowed_entries:
        return True
    return any(fnmatch.fnmatchcase(candidate, g) for g in allowed_globs)


def _flag_extra_page(path_str: str, source_label: str, errors: ErrorCollector) -> None:
    normalized = path_str.replace("\\", "/").lower()
    for keyword, hint in FORBIDDEN_NEW_PAGE_KEYWORDS.items():
        if keyword in normalized:
            errors.add(source_label, "SCR-001", f"허용되지 않은 새 Page: `{path_str}`", hint)
            return
    errors.add(
        source_label,
        "N/A",
        f"고정 화면 5개(page_entry)·선언된 비-Screen 정적 Page 목록에 없는 새 Page: `{path_str}`",
        "새 화면이 필요하면 SCREEN_ROUTE_CONTRACT.json부터 갱신하고 사람 승인을 받으라 — "
        "임의로 새 Route를 추가하지 말라(정적 페이지라면 TASK_MANIFEST.csv에 screen을 "
        "고정 화면 5개 밖 값으로, page_entry를 실제 경로로 명시하라)",
    )


def check_4_no_new_detail_pages_plan(
    manifest_rows: list[dict],
    allowed_entries: set[str],
    allowed_globs: list[str],
    errors: ErrorCollector,
) -> None:
    seen_detail_files: set[str] = set()
    for r in manifest_rows:
        detail_file = r.get("detail_file", "")
        if not detail_file or detail_file in seen_detail_files:
            continue
        seen_detail_files.add(detail_file)
        detail_path = PROJECT_ROOT / detail_file
        if not detail_path.exists():
            continue  # audit_tasks.py already owns "Task 파일 존재" checks
        text = detail_path.read_text(encoding="utf-8")
        m = EXPECTED_FILES_RE.search(text)
        if not m:
            continue
        for pm in BACKTICK_PATH_RE.finditer(m.group(1)):
            candidate = pm.group(1)
            if not candidate.startswith("src/app/") or not candidate.endswith("page.tsx"):
                continue
            if _is_allowed_page(candidate, allowed_entries, allowed_globs):
                continue
            _flag_extra_page(candidate, detail_file, errors)


def check_4_no_new_detail_pages_ci(
    allowed_entries: set[str], allowed_globs: list[str], errors: ErrorCollector
) -> None:
    if not SRC_APP_DIR.exists():
        return
    for page_file in sorted(SRC_APP_DIR.rglob("page.tsx")):
        candidate = str(page_file.relative_to(PROJECT_ROOT)).replace("\\", "/")
        if _is_allowed_page(candidate, allowed_entries, allowed_globs):
            continue
        _flag_extra_page(candidate, candidate, errors)


# ---------------------------------------------------------------------------
# Check 5 — SCR-003 Task가 여행 입력과 동행 작성 양쪽 요구를 포함한다
# ---------------------------------------------------------------------------

FLIGHT_RE = re.compile(r"FLIGHT", re.I)
HOTEL_RE = re.compile(r"HOTEL", re.I)
MATE_WRITE_RE = re.compile(r"MATE-(COMPOSER|POST)", re.I)


def check_5_scr003_dual_requirement(
    manifest_rows: list[dict], errors: ErrorCollector
) -> None:
    owners = [
        r
        for r in manifest_rows
        if r.get("category") == "PAGE_OWNER" and r.get("screen") == "SCR-003"
    ]
    if not owners:
        return  # check 2 already reports the missing-owner case
    owner = owners[0]
    deps = owner.get("depends_on", "")
    has_flight = bool(FLIGHT_RE.search(deps))
    has_hotel = bool(HOTEL_RE.search(deps))
    has_mate_write = bool(MATE_WRITE_RE.search(deps))

    if not (has_flight and has_hotel):
        errors.add(
            owner.get("detail_file", rel(MANIFEST_PATH)),
            "SCR-003",
            f"{owner['task_id']}의 Depends On에 항공(FLIGHT)·숙소(HOTEL) 입력 Component가 모두 있지 않음",
            "Depends On에 CMP-SCR003-FLIGHT-FORM과 CMP-SCR003-HOTEL-FORM을 모두 추가하라",
        )
    if not has_mate_write:
        errors.add(
            owner.get("detail_file", rel(MANIFEST_PATH)),
            "SCR-003",
            f"{owner['task_id']}의 Depends On에 동행 작성(MATE-COMPOSER/MATE-POST) 요구가 없음",
            "Depends On에 CMP-SCR003-MATE-COMPOSER와 SA-MATE-POST를 추가하라",
        )


# ---------------------------------------------------------------------------
# Check 6 — release 모드: Preview Checkpoint 확인 (docs/preview-checks/SCR-*.md)
# ---------------------------------------------------------------------------

PREVIEW_CHECK_TEMPLATE = """# Preview Check — {screen_id}

| 확인일 | 확인자 | Preview URL | 비고 |
|---|---|---|---|
| | | | |
"""

TABLE_ROW_RE = re.compile(r"^\|(.+)\|\s*$")


def _preview_check_confirmed(text: str) -> bool:
    for line in text.splitlines():
        m = TABLE_ROW_RE.match(line.strip())
        if not m:
            continue
        cells = [c.strip() for c in m.group(1).split("|")]
        if not cells:
            continue
        first = cells[0]
        if first in ("확인일", "") or set(first) <= set(":-"):
            continue
        # first non-header, non-separator row with a non-empty first cell
        # ("확인일") counts as a real human confirmation.
        return True
    return False


def check_6_preview_checkpoints(errors: ErrorCollector) -> None:
    for screen_id in FIXED_SCREENS:
        path = PREVIEW_CHECKS_DIR / f"{screen_id}.md"
        if not path.exists():
            errors.add(
                rel(path),
                screen_id,
                "Preview Check 파일 없음",
                f"`docs/preview-checks/{screen_id}.md`를 만들고 사람이 실제 Vercel Preview를 "
                "확인한 뒤 확인일을 채우라(템플릿: 아래 PREVIEW_CHECK_TEMPLATE 참고)",
            )
            continue
        text = path.read_text(encoding="utf-8")
        if not _preview_check_confirmed(text):
            errors.add(
                rel(path),
                screen_id,
                "확인일이 비어 있음 — 아직 사람이 Preview를 확인하지 않은 것으로 취급",
                f"`docs/preview-checks/{screen_id}.md`의 확인일·확인자·Preview URL 칸을 채우라",
            )


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


def parse_mode(argv: list[str]) -> str:
    mode = "plan"
    for arg in argv:
        if arg.startswith("--mode="):
            mode = arg.split("=", 1)[1]
    if mode not in ("plan", "ci", "release"):
        print(
            f"[check_screen_contract] FAIL — 알 수 없는 --mode 값: {mode!r} "
            "(plan|ci|release 중 하나여야 함)"
        )
        sys.exit(1)
    return mode


def main() -> None:
    mode = parse_mode(sys.argv[1:])
    errors = ErrorCollector()

    try:
        contract = load_contract()
        manifest_rows = load_manifest()
    except CheckError as e:
        print(f"[check_screen_contract] FAIL — {e}")
        sys.exit(1)

    allowed_entries = {
        e for e in (s.get("page_entry") for s in contract.get("screens", [])) if e
    }
    allowed_globs = collect_allowed_page_globs(manifest_rows)

    # Checks 1-3, 5 are plan/ci/release-independent — they validate the
    # Task plan and the contract, not the filesystem.
    check_1_fixed_screens(contract, errors)
    check_2_page_owner_unique(contract, manifest_rows, errors)
    check_3_technical_routes_not_screens(manifest_rows, errors)
    check_5_scr003_dual_requirement(manifest_rows, errors)

    # Check 4 differs by mode: plan reads the Task plan, ci/release reads
    # the real src/app filesystem.
    if mode == "plan":
        check_4_no_new_detail_pages_plan(manifest_rows, allowed_entries, allowed_globs, errors)
    else:
        check_4_no_new_detail_pages_ci(allowed_entries, allowed_globs, errors)

    if mode == "release":
        check_6_preview_checkpoints(errors)

    print(f"[check_screen_contract] mode={mode}")
    if errors:
        print(f"[check_screen_contract] {len(errors.items)}건 오류 발견:")
        for file, screen, message, hint in errors.items:
            print(f"  - file={file} screen={screen}")
            print(f"    문제: {message}")
            print(f"    힌트: {hint}")
        print()
        print(f"CHECK_SCREEN_CONTRACT_FAIL — {len(errors.items)}건")
        sys.exit(1)

    print(f"CHECK_SCREEN_CONTRACT_PASS (mode={mode})")
    sys.exit(0)


if __name__ == "__main__":
    main()
