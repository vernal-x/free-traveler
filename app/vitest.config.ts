import { defineConfig } from "vitest/config";

/**
 * Unit-test scope only. Playwright owns `e2e/` (Chromium Smoke, see
 * `TASKS/TASK-E2E-*.md`) — this config must never pick those specs up, so
 * both `e2e/` and a possible `tests/e2e/` are excluded explicitly.
 *
 * `passWithNoTests: true` because no UNIT-* Task has been implemented yet
 * (see `TASKS/00_TASK_LIST.md` §7) — `npm run test:unit` must exit 0, not
 * fail, until the first real spec file exists.
 */
export default defineConfig({
  test: {
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["e2e/**", "tests/e2e/**", "node_modules/**", ".next/**"],
    passWithNoTests: true,
  },
});
