#!/usr/bin/env python3
"""Traveler Harness Validator.

Checks that the agent-operating-system layer for this project — CLAUDE.md,
the traveler-project-pipeline Skill, and the 7 pipeline Commands — actually
exists and encodes the required rules, and cross-references it against the
real design/contract files it claims to point to
(design-reference/D-001/DESIGN.md, design-reference/SCREEN_ROUTE_CONTRACT.json).

This is a "meta" check: scripts/validate_inputs.py validates the SRS/Design/
Screen source docs before Task generation, scripts/audit_tasks.py validates
the generated Task List/Task details, and this script validates the harness
(CLAUDE.md/Skill/Commands) that governs the whole pipeline.

This script only reads files; it never modifies anything.

Exit codes:
  0  all 13 checks passed (prints VALIDATE_HARNESS_PASS)
  1  one or more checks failed (prints the offending file(s) and missing rule(s))
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = PROJECT_ROOT.parent

CLAUDE_MD = PROJECT_ROOT / "CLAUDE.md"
SKILL_MD = PROJECT_ROOT / ".claude" / "skills" / "traveler-project-pipeline" / "SKILL.md"
COMMANDS_DIR = PROJECT_ROOT / ".claude" / "commands"
AUDIT_SCRIPT = PROJECT_ROOT / "scripts" / "audit_tasks.py"

DESIGN_MD_REL = "design-reference/D-001/DESIGN.md"
SCREEN_CONTRACT_REL = "design-reference/SCREEN_ROUTE_CONTRACT.json"
DESIGN_MD = REPO_ROOT / "design-reference" / "D-001" / "DESIGN.md"
SCREEN_CONTRACT_JSON = REPO_ROOT / "design-reference" / "SCREEN_ROUTE_CONTRACT.json"

REQUIRED_COMMANDS = [
    "gen-tasklist.md",
    "gen-task-details.md",
    "audit-tasks.md",
    "prepare-task.md",
    "implement-task.md",
    "run-wave.md",
    "release-check.md",
]

DB_TABLE_ALLOWLIST = [
    "user_profile",
    "mate_post",
    "mate_application",
    "user_block",
    "report",
    "external_link_settings",
]

HARNESS_SCHEMA_VALUE = "traveler-screen-route-v1"


class Check:
    def __init__(self, number: int, name: str):
        self.number = number
        self.name = name
        self.passed = True
        self.details: list[str] = []
        self.files: list[str] = []

    def fail(self, file: str, rule: str) -> None:
        self.passed = False
        self.files.append(file)
        self.details.append(f"[{file}] {rule}")


results: list[Check] = []


def run_check(number: int, name: str, fn) -> Check:
    c = Check(number, name)
    try:
        fn(c)
    except Exception as e:  # a check crashing is itself a failure, not a script crash
        c.fail(str(getattr(e, "path", "?")), f"check raised an exception: {e!r}")
    results.append(c)
    return c


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


# ---------------------------------------------------------------------------
# Checks 1-13
# ---------------------------------------------------------------------------

def check_1_claude_md_exists(c: Check) -> None:
    if not CLAUDE_MD.exists():
        c.fail(rel(CLAUDE_MD), "CLAUDE.md가 존재하지 않음")


def check_2_skill_exists(c: Check) -> None:
    if not SKILL_MD.exists():
        c.fail(rel(SKILL_MD), "traveler-project-pipeline Skill 파일이 존재하지 않음")
        return
    text = read(SKILL_MD)
    if "name: traveler-project-pipeline" not in text:
        c.fail(rel(SKILL_MD), "frontmatter에 name: traveler-project-pipeline 없음")


def check_3_seven_commands_exist(c: Check) -> None:
    missing = [name for name in REQUIRED_COMMANDS if not (COMMANDS_DIR / name).exists()]
    for name in missing:
        c.fail(rel(COMMANDS_DIR / name), "필수 Command 파일이 존재하지 않음")
    if not (COMMANDS_DIR).exists():
        c.fail(rel(COMMANDS_DIR), ".claude/commands/ 디렉터리가 존재하지 않음")


def check_4_harness_schema_marker(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    if f"HARNESS_SCHEMA={HARNESS_SCHEMA_VALUE}" not in claude_text:
        c.fail(rel(CLAUDE_MD), f"HARNESS_SCHEMA={HARNESS_SCHEMA_VALUE} Marker 줄이 없음")

    if not SCREEN_CONTRACT_JSON.exists():
        c.fail(rel(SCREEN_CONTRACT_JSON), "파일이 없어 schema_version을 대조할 수 없음")
        return
    try:
        data = json.loads(SCREEN_CONTRACT_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        c.fail(rel(SCREEN_CONTRACT_JSON), f"JSON 파싱 실패: {e}")
        return
    if data.get("schema_version") != HARNESS_SCHEMA_VALUE:
        c.fail(
            rel(SCREEN_CONTRACT_JSON),
            f"schema_version={data.get('schema_version')!r} != {HARNESS_SCHEMA_VALUE!r}(CLAUDE.md Marker와 불일치)",
        )


def check_5_design_path_matches(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    if f"DESIGN_PATH={DESIGN_MD_REL}" not in claude_text:
        c.fail(rel(CLAUDE_MD), f"DESIGN_PATH={DESIGN_MD_REL} Marker 줄이 없음")

    if not DESIGN_MD.exists():
        c.fail(rel(DESIGN_MD), f"CLAUDE.md의 DESIGN_PATH가 가리키는 파일이 실제로 없음")
        return
    design_text = read(DESIGN_MD)
    if "status: LOCKED" not in design_text:
        c.fail(rel(DESIGN_MD), "frontmatter에 status: LOCKED가 없음(디자인 정본이 잠금 상태가 아님)")
    if "id: D-001" not in design_text:
        c.fail(rel(DESIGN_MD), "frontmatter에 id: D-001이 없음")


def check_6_screen_contract_matches(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    if f"SCREEN_CONTRACT={SCREEN_CONTRACT_REL}" not in claude_text:
        c.fail(rel(CLAUDE_MD), f"SCREEN_CONTRACT={SCREEN_CONTRACT_REL} Marker 줄이 없음")

    if not SCREEN_CONTRACT_JSON.exists():
        c.fail(rel(SCREEN_CONTRACT_JSON), "CLAUDE.md의 SCREEN_CONTRACT가 가리키는 파일이 실제로 없음")
        return
    try:
        data = json.loads(SCREEN_CONTRACT_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        c.fail(rel(SCREEN_CONTRACT_JSON), f"JSON 파싱 실패: {e}")
        return
    screens = data.get("screens", [])
    if len(screens) != 5:
        c.fail(rel(SCREEN_CONTRACT_JSON), f"screens[] 길이가 5가 아님(실제 {len(screens)})")


def check_7_page_owner_five_rule(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    skill_text = read(SKILL_MD)
    combined = claude_text + "\n" + skill_text

    if "Page Owner" not in combined:
        c.fail(rel(CLAUDE_MD) + " / " + rel(SKILL_MD), "'Page Owner' 관련 규칙 텍스트가 없음")

    five_owner_evidence = (
        "정확히 5개" in combined
        or ("PAGE-SCR001" in combined and "PAGE-SCR005" in combined)
    )
    if not five_owner_evidence:
        c.fail(
            rel(SKILL_MD),
            "Page Owner가 Screen당 정확히 5개(PAGE-SCR001~005)라는 근거 텍스트가 없음",
        )

    assembly_evidence = "조립" in combined
    if not assembly_evidence:
        c.fail(rel(CLAUDE_MD), "Page Owner가 Page Entry를 '조립'한다는 규칙 텍스트가 없음")

    if SCREEN_CONTRACT_JSON.exists():
        try:
            data = json.loads(SCREEN_CONTRACT_JSON.read_text(encoding="utf-8"))
            checks = data.get("completion_checks", {})
            if checks.get("screen_count") != 5:
                c.fail(rel(SCREEN_CONTRACT_JSON), f"completion_checks.screen_count != 5(실제 {checks.get('screen_count')!r})")
            if len(checks.get("core_screens", [])) != 4 or len(checks.get("auxiliary_screens", [])) != 1:
                c.fail(rel(SCREEN_CONTRACT_JSON), "completion_checks의 core_screens(4)/auxiliary_screens(1) 구성이 어긋남")
        except json.JSONDecodeError:
            pass  # already reported by check 4/6


def check_8_db_six_tables_rule(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    skill_text = read(SKILL_MD)
    combined = claude_text + "\n" + skill_text

    missing_tables = [t for t in DB_TABLE_ALLOWLIST if t not in combined]
    if missing_tables:
        c.fail(
            rel(CLAUDE_MD) + " / " + rel(SKILL_MD),
            f"DB 6개 테이블 화이트리스트에서 문서에 언급되지 않은 테이블: {missing_tables}",
        )
    if "6개" not in combined:
        c.fail(rel(CLAUDE_MD) + " / " + rel(SKILL_MD), "'6개' 테이블로 제한한다는 문구가 없음")


def check_9_no_external_input_persistence_rule(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    skill_text = read(SKILL_MD)
    combined = claude_text + "\n" + skill_text

    has_flight_hotel = ("항공" in combined) and ("숙소" in combined)
    has_no_persist = bool(re.search(r"(서버|API|DB|URL|로그).{0,20}(보내지|전달하지|저장하지)\s*않", combined))
    if not (has_flight_hotel and has_no_persist):
        c.fail(
            rel(CLAUDE_MD) + " / " + rel(SKILL_MD),
            "항공·숙소 입력값을 서버/API/DB/URL/로그로 보내지 않는다는 불변조건 문구가 없음",
        )


def check_10_playwright_chromium_smoke_rule(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    skill_text = read(SKILL_MD)
    combined = claude_text + "\n" + skill_text

    if "PLAYWRIGHT_ENABLED=true" not in claude_text:
        c.fail(rel(CLAUDE_MD), "PLAYWRIGHT_ENABLED=true Marker 줄이 없음")
    if "PLAYWRIGHT_SCOPE=chromium-smoke" not in claude_text:
        c.fail(rel(CLAUDE_MD), "PLAYWRIGHT_SCOPE=chromium-smoke Marker 줄이 없음")
    if "Chromium" not in combined or ("Smoke" not in combined and "스모크" not in combined):
        c.fail(rel(CLAUDE_MD) + " / " + rel(SKILL_MD), "Chromium Smoke 범위 제한 규칙 텍스트가 없음")


def check_11_auto_merge_false(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    if "AUTO_MERGE=false" not in claude_text:
        c.fail(rel(CLAUDE_MD), "AUTO_MERGE=false Marker 줄이 없음")


def check_12_aws_enabled_false(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    if "AWS_ENABLED=false" not in claude_text:
        c.fail(rel(CLAUDE_MD), "AWS_ENABLED=false Marker 줄이 없음")


def check_13_excluded_protection_rule(c: Check) -> None:
    claude_text = read(CLAUDE_MD)
    skill_text = read(SKILL_MD)
    combined = claude_text + "\n" + skill_text

    if "EXCLUDED" not in combined:
        c.fail(rel(CLAUDE_MD) + " / " + rel(SKILL_MD), "EXCLUDED 관련 규칙 텍스트가 전혀 없음")

    has_no_arbitrary_impl = bool(re.search(r"EXCLUDED.{0,30}(임의로 구현하지|구현하지 않)", combined))
    if not has_no_arbitrary_impl:
        c.fail(
            rel(CLAUDE_MD) + " / " + rel(SKILL_MD),
            "'EXCLUDED 기능을 임의로 구현하지 않는다' 류 보호 규칙 문구가 없음",
        )

    if not AUDIT_SCRIPT.exists():
        c.fail(rel(AUDIT_SCRIPT), "scripts/audit_tasks.py가 없어 EXCLUDED 보호가 실제로 강제되는지 확인 불가")
        return
    audit_text = read(AUDIT_SCRIPT)
    if "EXCLUDED" not in audit_text:
        c.fail(
            rel(AUDIT_SCRIPT),
            "audit_tasks.py에 EXCLUDED 처리 로직이 없음 — 규칙이 문서에만 있고 실제로 강제되지 않음",
        )


CHECKS = [
    (1, "CLAUDE.md 존재", check_1_claude_md_exists),
    (2, "Claude Code Skill 파일 존재", check_2_skill_exists),
    (3, "7개 Command 존재", check_3_seven_commands_exist),
    (4, f"{HARNESS_SCHEMA_VALUE} Marker 존재", check_4_harness_schema_marker),
    (5, "D-001 DESIGN 경로 일치", check_5_design_path_matches),
    (6, "Screen Contract 경로 일치", check_6_screen_contract_matches),
    (7, "Page Owner 5개 규칙 존재", check_7_page_owner_five_rule),
    (8, "DB Table 6개 기본 범위 존재", check_8_db_six_tables_rule),
    (9, "외부 입력 비저장 규칙 존재", check_9_no_external_input_persistence_rule),
    (10, "Playwright Chromium Smoke 규칙 존재", check_10_playwright_chromium_smoke_rule),
    (11, "AUTO_MERGE=false", check_11_auto_merge_false),
    (12, "AWS_ENABLED=false", check_12_aws_enabled_false),
    (13, "EXCLUDED 보호 규칙 존재", check_13_excluded_protection_rule),
]


def main() -> None:
    for number, name, fn in CHECKS:
        run_check(number, name, fn)

    failed = [r for r in results if not r.passed]

    for r in results:
        status = "PASS" if r.passed else "FAIL"
        print(f"[validate_harness] check {r.number:>2}/{len(results)} [{status}] {r.name}")
        if not r.passed:
            for d in r.details:
                print(f"    x {d}")

    print()
    if failed:
        print(f"[validate_harness] VALIDATE_HARNESS_FAIL — {len(failed)}/{len(results)} check(s) failed.")
        sys.exit(1)

    print(f"VALIDATE_HARNESS_PASS — {len(results)}/{len(results)} checks passed.")
    sys.exit(0)


if __name__ == "__main__":
    main()
