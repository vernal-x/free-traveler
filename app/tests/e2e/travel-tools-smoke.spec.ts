import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * E2E-TRAVEL-TOOLS — `docs/PROJECT_SCOPE.md` §7 핵심 흐름 2·3 + 동행 탭
 * 로그인 유도 확인(Chromium Smoke, Desktop·Mobile 390px 각 1회):
 *   흐름 2: 항공 입력 → 검증 오류 확인 → 유효 입력 → 요약 확인 → 외부 새 탭
 *   흐름 3: 호텔 입력 → 동일 플로우
 *   + 동행 탭: 비로그인 시 로그인 유도 카드(작성 Form 미노출)
 * + TC-2(보안/개인정보): 외부 이동 시 입력값(국가·날짜)이 새 탭 URL에 없는지
 *   확인한다(DEC-007, `CMP-SCR003-FLIGHT-FORM`/`HOTEL-FORM`).
 *
 * `window.open()`으로 여는 새 탭이라 `<a href>`가 없다 — `context.waitForEvent
 * ("page")`로 실제로 열린 새 탭의 최종 URL을 확인하고, 내용은 검사하지 않고
 * 바로 닫는다(외부 제3자 사이트라 응답을 검증할 수 없고 검증할 필요도 없다).
 */

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

async function runFlightFlow(
  page: Page,
  context: BrowserContext,
): Promise<void> {
  await page.goto("/travel-tools");
  const flightPanel = page.getByRole("tabpanel");

  await flightPanel.getByLabel("국가").selectOption({ label: "일본" });
  await flightPanel.getByLabel("지역").selectOption({ label: "도쿄" });

  // 검증 오류 확인: 귀국일이 출발일보다 이전(역전).
  const departure = isoDaysFromNow(10);
  const invalidReturn = isoDaysFromNow(5);
  await flightPanel.getByLabel("출발일").fill(departure);
  await flightPanel.getByLabel("귀국일").fill(invalidReturn);
  await expect(
    flightPanel.getByText("귀국일은 출발일과 같거나 이후여야 합니다."),
  ).toBeVisible();
  await expect(
    flightPanel.getByRole("button", { name: "항공편 보러 가기" }),
  ).toBeDisabled();

  // 유효 입력 → 요약 확인.
  const validReturn = isoDaysFromNow(15);
  await flightPanel.getByLabel("귀국일").fill(validReturn);
  await expect(
    flightPanel.getByText("귀국일은 출발일과 같거나 이후여야 합니다."),
  ).toHaveCount(0);
  await expect(
    flightPanel.getByText(`일본 도쿄 · ${departure} ~ ${validReturn}`),
  ).toBeVisible();
  await expect(
    flightPanel.getByText(
      "입력하신 조건은 이 브라우저에만 임시로 유지되며 서버로 전송되거나 저장되지 않습니다.",
    ),
  ).toBeVisible();

  // 외부 새 탭 이동 확인 + TC-2: 입력값이 URL에 없어야 한다.
  const outboundButton = flightPanel.getByRole("button", {
    name: "항공편 보러 가기",
  });
  await expect(outboundButton).toBeEnabled();
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    outboundButton.click(),
  ]);
  await popup.waitForLoadState("domcontentloaded").catch(() => {});
  const popupUrl = popup.url();
  expect(popupUrl).not.toContain("일본");
  expect(popupUrl).not.toContain("도쿄");
  expect(popupUrl).not.toContain(departure);
  expect(popupUrl).not.toContain(validReturn);
  await popup.close();
}

async function runHotelFlow(
  page: Page,
  context: BrowserContext,
): Promise<void> {
  await page.goto("/travel-tools");
  await page.getByRole("tab", { name: "숙소" }).click();
  const hotelPanel = page.getByRole("tabpanel");

  await hotelPanel.getByLabel("국가").selectOption({ label: "태국" });
  await hotelPanel.getByLabel("지역").selectOption({ label: "방콕" });

  // 검증 오류 확인: 체크아웃=체크인(당일 불가).
  const checkIn = isoDaysFromNow(10);
  await hotelPanel.getByLabel("체크인").fill(checkIn);
  await hotelPanel.getByLabel("체크아웃").fill(checkIn);
  await expect(
    hotelPanel.getByText("체크아웃은 체크인 이후 날짜여야 합니다."),
  ).toBeVisible();
  await expect(
    hotelPanel.getByRole("button", { name: "숙소 보러 가기" }),
  ).toBeDisabled();

  // 유효 입력 → 요약 확인.
  const checkOut = isoDaysFromNow(12);
  await hotelPanel.getByLabel("체크아웃").fill(checkOut);
  await expect(
    hotelPanel.getByText("체크아웃은 체크인 이후 날짜여야 합니다."),
  ).toHaveCount(0);
  await expect(
    hotelPanel.getByText(`태국 방콕 · ${checkIn} ~ ${checkOut}`),
  ).toBeVisible();

  // 외부 새 탭 이동 확인 + TC-2.
  const outboundButton = hotelPanel.getByRole("button", {
    name: "숙소 보러 가기",
  });
  await expect(outboundButton).toBeEnabled();
  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    outboundButton.click(),
  ]);
  await popup.waitForLoadState("domcontentloaded").catch(() => {});
  const popupUrl = popup.url();
  expect(popupUrl).not.toContain("태국");
  expect(popupUrl).not.toContain("방콕");
  expect(popupUrl).not.toContain(checkIn);
  expect(popupUrl).not.toContain(checkOut);
  await popup.close();
}

test.describe("E2E-TRAVEL-TOOLS 항공/숙소/동행 탭 Smoke", () => {
  test("Desktop: 항공 입력→검증오류→유효입력→요약→외부 새 탭", async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await runFlightFlow(page, context);
  });

  test("Mobile 390px: 항공 흐름이 동일하게 동작한다", async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await runFlightFlow(page, context);
  });

  test("숙소 탭도 항공과 동일한 플로우로 동작한다", async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await runHotelFlow(page, context);
  });

  test("동행 탭은 비로그인 상태에서 로그인 유도 카드를 보여주고 작성 Form은 렌더링하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/travel-tools");
    await page.getByRole("tab", { name: "동행 구하기" }).click();
    const matePanel = page.getByRole("tabpanel");

    await expect(
      matePanel.getByText("로그인 후 동행글을 작성할 수 있어요"),
    ).toBeVisible();
    await expect(
      matePanel.getByRole("form", { name: "동행글 작성" }),
    ).toHaveCount(0);
  });
});
