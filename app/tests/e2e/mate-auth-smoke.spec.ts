import { existsSync, readFileSync } from "fs";
import path from "path";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { test, expect, type Page } from "@playwright/test";

/**
 * E2E-MATE-AUTH — `docs/PROJECT_SCOPE.md` §7 핵심 흐름 4~9:
 *   4. 이메일 회원가입 → 로그인 → 성인 확인
 *   5. 동행 모집글 작성(안전수칙 동의) → 목록 노출 확인 → 참가 요청 제출
 *   6. 모집글 작성자 참가 요청 승인/거절
 *   7. 신고 제출 → 접수번호 표시
 *   8. 사용자 차단 → 상호 노출 제한 확인
 *   9. 관리자 로그인 → 신고 상태 변경 → 외부 URL 설정 변경
 * + TC-2: 로그아웃 상태에서 쓰기 요청이 안전하게 차단되는지 확인(이 프로젝트는
 *   Server Action이 raw HTTP 401 대신 `redirect()`로 처리한다 — `src/lib/auth/
 *   guards.ts` 참고. 여기서는 그 결과인 "회원 전용 탭이 Guest 화면으로 대체됨"을
 *   확인한다).
 *
 * 실행마다 Supabase Admin API로 테스트 계정 3개(작성자/신청자/관리자)를 만들고
 * 끝나면 전부 삭제한다(auth.users 삭제 → user_profile/mate_post/mate_application/
 * user_block/report까지 on delete cascade로 함께 정리됨). `SUPABASE_SERVICE_ROLE_KEY`
 * 가 없으면(Secret 미설정 CI 등) 이 파일 전체를 skip한다 — `tests/e2e/
 * public-smoke.spec.ts`와 달리 `.github/workflows/ci.yml`의 필수 Gate가 아니다.
 *
 * 로그아웃 UI가 현재 어디에도 없어(`HeaderShell`이 아직 Auth 연결 전 Guest
 * 고정으로 남아 있음 — 발견된 별도 이슈, 완료 보고에 기록) 사용자 전환은
 * 로그인/로그아웃 대신 Playwright의 격리된 `browser.newContext()`로 한다.
 */

function loadEnvLocal(): Record<string, string> {
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (!existsSync(envPath)) return {};
  const text = readFileSync(envPath, "utf-8");
  return Object.fromEntries(
    text
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const idx = l.indexOf("=");
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
      }),
  );
}

const env = { ...loadEnvLocal(), ...process.env };
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const hasSupabaseEnv = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

const TEST_PASSWORD = "e2e-mate-auth-not-a-real-password-1";
// 순수 숫자 timestamp(예: 13자리 연속 숫자)는 실제 연락처 탐지 정규식
// (`detectContactInfo`의 전화번호 패턴)에 우연히 매칭되어 동행글 등록이
// 차단될 수 있다(실제로 재현됨) — 그래서 제목·설명에 넣는 식별자는 숫자만
// 있는 문자열 대신 36진수(문자+숫자 혼합)를 쓴다.
const RUN_ID = Date.now();
const RUN_TAG = RUN_ID.toString(36);

const AUTHOR_EMAIL = `e2e.mateauth.author.${RUN_ID}@example.com`;
const APPLICANT_EMAIL = `e2e.mateauth.applicant.${RUN_ID}@example.com`;
const ADMIN_EMAIL = `e2e.mateauth.admin.${RUN_ID}@example.com`;
const SIGNUP_EMAIL = `e2e.mateauth.signup.${RUN_ID}@example.com`;

const POST_TITLE = `E2E 동행 스모크 ${RUN_TAG}`;
const REPORT_MARK = `E2E-MATE-AUTH 스모크 신고 ${RUN_TAG}`;

test.describe("E2E-MATE-AUTH 인증·동행·신고·차단·관리자 Smoke", () => {
  test.skip(
    !hasSupabaseEnv,
    "NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY 미설정 — 실제 Supabase 프로젝트가 있어야 실행된다",
  );

  const admin = hasSupabaseEnv
    ? createAdminClient(SUPABASE_URL as string, SERVICE_ROLE_KEY as string, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

  let authorId = "";
  let applicantId = "";
  let adminId = "";

  async function createTestUser(
    email: string,
    nickname: string,
    role: "MEMBER" | "ADMIN",
    isAdult: boolean,
  ): Promise<string> {
    const { data, error } = await admin!.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    const id = data.user.id;
    const { error: profileError } = await admin!.from("user_profile").upsert({
      id,
      nickname,
      age_group: "30대",
      role,
      is_adult: isAdult,
      adult_verified_at: isAdult ? new Date().toISOString() : null,
      account_status: "ACTIVE",
    });
    if (profileError) throw profileError;
    return id;
  }

  test.beforeAll(async () => {
    if (!admin) return;
    authorId = await createTestUser(
      AUTHOR_EMAIL,
      "e2e-작성자",
      "MEMBER",
      false,
    );
    applicantId = await createTestUser(
      APPLICANT_EMAIL,
      "e2e-신청자",
      "MEMBER",
      true,
    );
    adminId = await createTestUser(ADMIN_EMAIL, "e2e-관리자", "ADMIN", true);
  });

  test.afterAll(async () => {
    if (!admin) return;
    // auth.users 삭제 → user_profile → mate_post/mate_application/user_block/
    // report까지 on delete cascade로 함께 정리된다(schema 확인됨). 실패하면
    // (예: cascade 없는 FK가 참조를 붙잡고 있는 경우) 조용히 넘어가지 않고
    // 실패 계정을 알 수 있게 명시적으로 표시한다.
    const failures: string[] = [];
    for (const id of [authorId, applicantId, adminId]) {
      if (!id) continue;
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) failures.push(`${id}: ${error.message}`);
    }
    if (failures.length > 0) {
      throw new Error(`테스트 계정 정리 실패:\n${failures.join("\n")}`);
    }
  });

  async function login(page: Page, email: string): Promise<void> {
    await page.goto("/account");
    await page.locator("#login-email").fill(email);
    await page.locator("#login-password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "로그인" }).click();
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: "load" });
  }

  test("가입→로그인→성인확인→동행작성→참가요청→승인→신고→차단→관리자 처리", async ({
    browser,
  }) => {
    const authorCtx = await browser.newContext();
    const authorPage = await authorCtx.newPage();

    // 흐름 4a: 회원가입 Form 자체 동작 확인(이메일 확인이 필요해 즉시 로그인은
    // 불가능하므로, 로그인 가능한 계정은 setup에서 미리 만든 계정을 쓴다).
    await authorPage.goto("/account");
    await authorPage.locator("#signup-email").fill(SIGNUP_EMAIL);
    await authorPage.locator("#signup-password").fill(TEST_PASSWORD);
    await authorPage
      .locator('label:has-text("만 19세 이상입니다") input[type="checkbox"]')
      .check();
    await authorPage.getByRole("button", { name: "회원가입" }).click();
    // 이 공유 Supabase 프로젝트는 이메일 발송 rate limit에 자주 걸리고
    // (실 운영 세션에서 반복 관찰됨), `@example.com` 도메인을 "invalid"로
    // 거부하는 경우도 실제로 관찰됐다 — 둘 다 "폼이 실제로 제출되어 서버
    // 응답을 받았다"는 증거이므로 정확한 문구가 아니라 "성공 또는 오류
    // 메시지가 떴는지"만 확인한다(이 단계의 목적은 성인확인 체크박스 게이트
    // 를 지나 실제 submit이 일어나는지 확인하는 것이지, 이메일 발송 자체의
    // 성공 여부가 아니다 — 그건 W22에서 이미 별도로 상세 검증함).
    await expect(
      authorPage.getByText(
        /가입 확인 이메일을 보냈습니다|email rate limit exceeded|is invalid/i,
      ),
    ).toBeVisible({ timeout: 15_000 });
    await admin!.auth.admin
      .listUsers()
      .then(({ data }) => data.users.find((u) => u.email === SIGNUP_EMAIL))
      .then((u) => u && admin!.auth.admin.deleteUser(u.id));

    // 흐름 4b: 로그인 → 성인 확인(로그인 성공 시 best-effort로 confirmAdult 호출).
    await login(authorPage, AUTHOR_EMAIL);
    await expect(authorPage.getByText("성인 인증 완료")).toBeVisible();

    // 흐름 5: 동행 모집글 작성(안전수칙 동의).
    await authorPage.goto("/travel-tools");
    await authorPage.getByRole("tab", { name: "동행 구하기" }).click();
    const matePanel = authorPage.getByRole("tabpanel");
    await matePanel.getByLabel("제목").fill(POST_TITLE);
    await matePanel.getByLabel("국가").selectOption({ label: "일본" });
    await matePanel.getByLabel("지역").selectOption({ label: "도쿄" });
    const start = new Date(Date.now() + 30 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const end = new Date(Date.now() + 33 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    await matePanel.getByLabel("시작일").fill(start);
    await matePanel.getByLabel("종료일").fill(end);
    await matePanel
      .getByLabel("설명")
      .fill("E2E-MATE-AUTH Smoke가 생성한 테스트 동행글입니다.");
    await matePanel.getByRole("checkbox", { name: /안전수칙/ }).check();
    await matePanel.getByRole("button", { name: "동행글 등록하기" }).click();
    await expect(authorPage.getByText("동행글이 등록되었습니다")).toBeVisible();

    const { data: createdPost, error: createdPostError } = await admin!
      .from("mate_post")
      .select("id")
      .eq("author_id", authorId)
      .eq("title", POST_TITLE)
      .single();
    if (createdPostError || !createdPost) {
      throw new Error(
        `생성된 동행글을 찾지 못했습니다: ${createdPostError?.message}`,
      );
    }
    const postId = createdPost.id as string;

    // 목록 노출 확인: 방금 만든 글이 상세 URL로 열린다.
    await authorPage.goto(`/mates?postId=${postId}`);
    await expect(
      authorPage.getByRole("dialog", { name: `${POST_TITLE} 상세` }),
    ).toBeVisible();

    // 흐름 5(계속) + 7 + 8: 신청자 계정으로 참가 요청 → 신고 → 차단.
    const applicantCtx = await browser.newContext();
    const applicantPage = await applicantCtx.newPage();
    await login(applicantPage, APPLICANT_EMAIL);
    await applicantPage.goto(`/mates?postId=${postId}`);

    const applyForm = applicantPage.getByRole("form", { name: "참가 요청" });
    await applyForm.getByLabel("참가 메시지").fill("함께 하고 싶어요!");
    await applyForm.getByRole("button", { name: "참가 요청 보내기" }).click();
    await expect(
      applicantPage.getByText("참가 요청을 보냈어요", { exact: false }),
    ).toBeVisible();

    // 흐름 7: 신고 제출 → 접수번호 표시.
    const reportForm = applicantPage.getByRole("form", { name: "신고하기" });
    await reportForm.getByLabel("신고 사유").selectOption("SPAM");
    await reportForm.getByLabel("상세 설명(선택)").fill(REPORT_MARK);
    await reportForm.getByRole("button", { name: "신고하기" }).click();
    await expect(
      applicantPage.getByText("신고가 접수되었습니다"),
    ).toBeVisible();
    await expect(applicantPage.getByText(/접수번호:/)).toBeVisible();

    // 흐름 8: 사용자 차단 → 상호 노출 제한 확인.
    await applicantPage
      .getByRole("button", { name: "이 사용자 차단하기" })
      .click();
    await expect(
      applicantPage.getByRole("button", { name: "차단 해제" }),
    ).toBeVisible();
    await applicantPage.goto(
      `/mates?country=JP&region=${encodeURIComponent("도쿄")}`,
    );
    await expect(applicantPage.getByText(POST_TITLE)).toHaveCount(0);
    await applicantCtx.close();

    // 흐름 6: 모집글 작성자가 받은 참가 요청을 승인한다.
    await authorPage.goto("/account?tab=my_requests");
    await authorPage.getByRole("button", { name: "받은 요청" }).click();
    const requestItem = authorPage.locator("li", { hasText: POST_TITLE });
    await requestItem.getByRole("button", { name: "승인" }).click();
    await expect(requestItem.getByText("승인됨")).toBeVisible();
    await authorCtx.close();

    // 흐름 9: 관리자 로그인 → 신고 상태 변경 → 외부 URL 설정 변경.
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await login(adminPage, ADMIN_EMAIL);

    await adminPage.goto("/account?tab=admin_reports");
    const reportItem = adminPage.locator("li", { hasText: REPORT_MARK });
    await reportItem.getByRole("button", { name: "해결 처리" }).click();
    await expect(reportItem.getByText("RESOLVED")).toBeVisible();

    const { data: originalSetting } = await admin!
      .from("external_link_settings")
      .select("url, updated_by")
      .eq("key", "FLIGHT_OUTBOUND_URL")
      .single();

    await adminPage.goto("/account?tab=admin_url");
    const flightUrlInput = adminPage.locator("#url-FLIGHT_OUTBOUND_URL");
    await flightUrlInput.fill("https://flights.example.com/e2e-smoke");
    await adminPage.getByRole("button", { name: "저장" }).first().click();
    await expect(adminPage.getByText("저장되었습니다.").first()).toBeVisible();
    // 공유 설정값 원복 — URL뿐 아니라 `updated_by`도 되돌린다. 저장 Server
    // Action이 항상 호출자 id로 `updated_by`를 덮어써서, UI로 URL 값만
    // 되돌려도 이 테스트 계정 id가 그대로 남는다 — 이후 이 계정을 삭제할 때
    // `external_link_settings.updated_by`(cascade 없는 FK)가 참조를 붙잡아
    // 삭제가 조용히 실패한다(실제로 재현되어 발견함). UI에 `updated_by`를
    // 되돌릴 방법이 없어 Admin 클라이언트로 직접 복원한다.
    await flightUrlInput.fill(originalSetting!.url);
    await adminPage.getByRole("button", { name: "저장" }).first().click();
    await expect(adminPage.getByText("저장되었습니다.").first()).toBeVisible();
    await admin!
      .from("external_link_settings")
      .update({ updated_by: originalSetting!.updated_by })
      .eq("key", "FLIGHT_OUTBOUND_URL");
    await adminCtx.close();
  });

  test("TC-2: 로그아웃 상태에서는 회원/관리자 전용 탭이 Guest 화면으로 안전하게 대체된다", async ({
    page,
  }) => {
    await page.goto("/account?tab=admin_url");
    await expect(page.getByRole("button", { name: "회원가입" })).toBeVisible();
    await expect(page.getByText("항공편 외부 URL")).toHaveCount(0);
  });
});
