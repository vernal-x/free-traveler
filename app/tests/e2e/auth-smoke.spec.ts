import { test, expect } from "@playwright/test";

/**
 * 로그인이 필요한 2개 흐름(E2E-006~007)의 골격. `docs/PROJECT_SCOPE.md` §7
 * 핵심 흐름 4~9(가입/로그인/동행 작성/참가/승인/신고/차단/관리자)를
 * SA-MATE-POST, CMP-SCR004-*, CMP-SCR005-* Task 구현 이후 이 파일에서
 * 채운다. 지금은 실제 Supabase 테스트 계정 없이도 파일 자체는 항상 로드
 * 가능해야 하므로, 인증 환경변수가 없으면 이 파일의 모든 테스트를
 * 명시적으로 skip한다(CI에 실제 Supabase Secret이 없을 때 이 파일 전체를
 * 건너뛰는 근거).
 *
 * 필요 환경변수(둘 다 있어야 실행):
 *   - E2E_AUTH_EMAIL    : 테스트 전용 Supabase 계정 이메일(성인 인증 완료 상태)
 *   - E2E_AUTH_PASSWORD : 위 계정 비밀번호
 *
 * Selector는 public-smoke.spec.ts와 같은 우선순위(role → label → test id)를
 * 따른다. 아직 없는 test id(mate-composer-*, my-activity-sent-requests 등)는
 * 구현 Task가 이 이름 그대로 부여해야 하는 계약이다.
 */

const AUTH_EMAIL = process.env.E2E_AUTH_EMAIL;
const AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD;
const hasAuthEnv = Boolean(AUTH_EMAIL && AUTH_PASSWORD);

test.describe("동행 인증 흐름 (Skeleton)", () => {
  test.skip(
    !hasAuthEnv,
    "E2E_AUTH_EMAIL/E2E_AUTH_PASSWORD 미설정 — CI에 실제 Supabase 인증 Secret이 없으면 이 파일 전체를 skip한다",
  );

  async function login(page: import("@playwright/test").Page) {
    await page.goto("/account");
    await page.getByLabel(/이메일|email/i).fill(AUTH_EMAIL as string);
    await page.getByLabel(/비밀번호|password/i).fill(AUTH_PASSWORD as string);
    await page.getByRole("button", { name: /로그인/ }).click();
  }

  test("E2E-006 로그인 사용자의 동행글 작성과 목록·상세 확인", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/travel-tools");
    await page.getByRole("tab", { name: "동행 구하기" }).click();
    const matePanel = page.getByRole("tabpanel");

    const postTitle = `E2E-006 테스트 동행글 ${Date.now()}`;
    await matePanel.getByTestId("mate-composer-title").fill(postTitle);
    await matePanel.getByLabel("국가").fill("일본");
    await matePanel.getByLabel("지역").fill("오사카");
    await matePanel
      .getByTestId("mate-composer-content")
      .fill("E2E Smoke 자동 생성 게시물입니다.");
    await matePanel.getByRole("checkbox", { name: /안전수칙 동의/ }).check();
    await matePanel.getByTestId("mate-composer-submit").click();

    await page.goto("/mates");
    const postCard = page
      .getByTestId("mate-post-card")
      .filter({ hasText: postTitle });
    await expect(postCard).toBeVisible();

    await postCard.click();
    await expect(page.getByTestId("mate-post-detail")).toContainText(postTitle);
  });

  test("E2E-007 동행글 신청과 계정 화면의 내 활동 확인", async ({ page }) => {
    await login(page);

    await page.goto("/mates");
    const anyPostCard = page.getByTestId("mate-post-card").first();
    await anyPostCard.click();

    await page.getByRole("button", { name: /참가 신청/ }).click();
    // 신청 후 확인 문구(정확한 카피는 미확정 — 컨테이너만 확인)
    await expect(page.getByTestId("apply-flow-confirmation")).toBeVisible();

    await page.goto("/account");
    const sentRequests = page.getByTestId("my-activity-sent-requests");
    await expect(sentRequests).toBeVisible();
    await expect(sentRequests.getByTestId("mate-post-card")).not.toHaveCount(0);
  });
});
