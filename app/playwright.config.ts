import { defineConfig, devices } from "@playwright/test";

/**
 * Chromium Smoke만 사용한다(`CLAUDE.md` PLAYWRIGHT_SCOPE=chromium-smoke) —
 * 다른 브라우저 프로젝트를 추가하지 않는다.
 *
 * PLAYWRIGHT_BASE_URL이 있으면 그 값(Vercel Preview URL 등 이미 배포된 대상)을
 * baseURL로 쓰고, 이 경우 로컬 `npm run dev`를 기동하지 않는다 — 이미 살아있는
 * 원격 대상을 검사하는 것이므로 webServer 자체가 필요 없다.
 */
const LOCAL_BASE_URL = "http://127.0.0.1:3000";
const previewBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = previewBaseURL || LOCAL_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: previewBaseURL
    ? undefined
    : {
        command: "npm run dev",
        url: LOCAL_BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
