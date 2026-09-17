import { test, expect } from "@playwright/test";

/**
 * 비로그인 상태로 접근 가능한 5개 핵심 흐름(E2E-001~005) — Chromium Smoke만.
 * `docs/PROJECT_SCOPE.md` §7 핵심 흐름 1~5에 대응한다.
 *
 * Selector 우선순위: role → label → test id 순(텍스트 위치·CSS 구조 지양).
 * 아래 test id는 아직 구현되지 않은 컴포넌트가 붙여야 할 계약이다 — 실제 구현
 * Task(CMP-SCR001-*, CMP-SCR002-*, CMP-SCR003-*)가 이 이름 그대로 부여해야
 * 이 파일의 테스트가 통과한다:
 *   - destination-card              (SCR-001 여행지 Grid 카드, 국내+해외 반복)
 *   - stat-trips / stat-countries   (SCR-002 여행 지표 카드)
 *   - flight-outbound-link / hotel-outbound-link       (SCR-003 외부 이동 링크)
 *   - flight-outbound-disclosure / hotel-outbound-disclosure (SCR-003 비전달 고지)
 *   - mate-tab-login-notice         (SCR-003 동행 탭, 비로그인 로그인 안내 카드)
 *
 * 외부 사이트로의 실제 새 탭 이동은 열자마자 닫기만 하고 내용을 검사하지
 * 않는다(항공/숙소 링크는 실제 제3자 사이트로 연결되므로). 이미지 src의 HTTP
 * 응답 상태도 검사하지 않는다 — 이 파일 어디에도 그런 네트워크 검사가 없다.
 */

test.describe("E2E-001 메인 페이지의 추천 여행지와 주요 CTA", () => {
  test("Hero의 '여행 준비 시작하기' CTA가 /travel-tools로 이동한다", async ({
    page,
  }) => {
    await page.goto("/");

    const heroCta = page.getByRole("link", { name: "여행 준비 시작하기" });
    await expect(heroCta).toBeVisible();
    await heroCta.click();

    await expect(page).toHaveURL(/\/travel-tools\/?$/);
  });

  test("국내·해외 추천 여행지 카드가 최소 12개(6+6) 노출된다", async ({
    page,
  }) => {
    await page.goto("/");

    const destinationCards = page.getByTestId("destination-card");
    const count = await destinationCards.count();
    expect(count).toBeGreaterThanOrEqual(12);

    // 카드는 접근 가능한 이름(제목)을 가진 클릭 가능 요소여야 한다 — 첫 카드로
    // role 존재를 확인한다(위치/순서로 특정 카드를 지목하지 않음).
    await expect(destinationCards.first()).toBeVisible();
  });
});

test("E2E-002 대표 소개의 free_traveler, 50회 이상, 30개국 이상", async ({
  page,
}) => {
  await page.goto("/about");

  await expect(page.getByText("free_traveler", { exact: false })).toBeVisible();

  const tripsStat = page.getByTestId("stat-trips");
  const countriesStat = page.getByTestId("stat-countries");
  await expect(tripsStat).toBeVisible();
  await expect(countriesStat).toBeVisible();
  // 계약(`TASKS/TASK-CMP-SCR001-ABOUT-SUMMARY.md`)의 리터럴 표기 "50+ Trips"/
  // "30+ Countries"를 기준으로 하되, 최종 한국어 카피로 바뀔 수 있어 숫자 자체
  // (50 이상 / 30 이상)만 정규식으로 느슨하게 확인한다.
  await expect(tripsStat).toContainText(/50\s*\+?/);
  await expect(countriesStat).toContainText(/30\s*\+?/);
});

test("E2E-003 여행 도구의 항공 외부 이동 안내와 href", async ({
  page,
  context,
}) => {
  await page.goto("/travel-tools");

  await page.getByRole("tab", { name: "항공편" }).click();
  const flightPanel = page.getByRole("tabpanel");

  const sampleCountry = "일본";
  const sampleDate = "2026-11-01";
  await flightPanel.getByLabel("국가").fill(sampleCountry);
  await flightPanel.getByLabel("지역").fill("도쿄");
  await flightPanel.getByLabel("출발일").fill(sampleDate);
  await flightPanel.getByLabel("귀국일").fill("2026-11-05");

  // 입력값 비전달 고지 — 안내 문구는 최종 카피가 아직 없으므로 컨테이너
  // test id 노출 여부만 확인한다.
  await expect(page.getByTestId("flight-outbound-disclosure")).toBeVisible();

  const outboundLink = page.getByTestId("flight-outbound-link");
  await expect(outboundLink).toBeVisible();
  const href = await outboundLink.getAttribute("href");
  expect(href).toBeTruthy();
  // REQ-FUNC-017/025: 입력값이 외부 URL로 전달되면 안 된다.
  expect(href).not.toContain(sampleCountry);
  expect(href).not.toContain(sampleDate);

  // 클릭 후 실제로 새 사이트가 열리는지만 확인하고, 그 내용은 검사하지 않는다.
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    outboundLink.click(),
  ]);
  await popup.close();

  // 원래 화면은 그대로 유지되고 고지 문구도 계속 보인다.
  await expect(page.getByTestId("flight-outbound-disclosure")).toBeVisible();
});

test("E2E-004 여행 도구의 숙소 외부 이동 안내와 href", async ({
  page,
  context,
}) => {
  await page.goto("/travel-tools");

  await page.getByRole("tab", { name: "숙소" }).click();
  const hotelPanel = page.getByRole("tabpanel");

  const sampleCountry = "태국";
  const sampleDate = "2026-12-10";
  await hotelPanel.getByLabel("국가").fill(sampleCountry);
  await hotelPanel.getByLabel("지역").fill("방콕");
  await hotelPanel.getByLabel("체크인").fill(sampleDate);
  await hotelPanel.getByLabel("체크아웃").fill("2026-12-14");

  await expect(page.getByTestId("hotel-outbound-disclosure")).toBeVisible();

  const outboundLink = page.getByTestId("hotel-outbound-link");
  await expect(outboundLink).toBeVisible();
  const href = await outboundLink.getAttribute("href");
  expect(href).toBeTruthy();
  expect(href).not.toContain(sampleCountry);
  expect(href).not.toContain(sampleDate);

  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    outboundLink.click(),
  ]);
  await popup.close();

  await expect(page.getByTestId("hotel-outbound-disclosure")).toBeVisible();
});

test("E2E-005 비로그인 동행글 작성의 로그인 안내", async ({ page }) => {
  await page.goto("/travel-tools");

  await page.getByRole("tab", { name: "동행 구하기" }).click();
  const matePanel = page.getByRole("tabpanel");

  // 비로그인 상태: 로그인 안내 카드가 보이고, 실제 작성 Form(안전수칙 동의
  // 체크박스)은 렌더링되지 않아야 한다(`TASKS/TASK-CMP-SCR003-MATE-COMPOSER.md`).
  await expect(matePanel.getByTestId("mate-tab-login-notice")).toBeVisible();
  await expect(
    matePanel.getByRole("checkbox", { name: /안전수칙 동의/ }),
  ).toHaveCount(0);
});
