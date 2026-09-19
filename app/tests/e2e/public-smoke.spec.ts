import { test, expect } from "@playwright/test";

/**
 * E2E-PUBLIC-SMOKE — `docs/PROJECT_SCOPE.md` §7 핵심 흐름 10개 중 흐름 1·10만
 * 다룬다(Chromium Smoke, Desktop 1440px):
 *   흐름 1: 홈 → 여행지 목록 → 필터 적용 → 상세 진입 → 안전정보 패널 확인
 *   흐름 10: 대표 소개 페이지 진입 확인
 *
 * 흐름 2~9(항공/숙소 외부 이동, 동행 가입·신청·승인·신고·차단·관리자)는
 * 각각 E2E-TRAVEL-TOOLS/E2E-MATE-AUTH Task의 범위다 — 이 파일에서 다루지 않는다.
 *
 * Selector 우선순위: role → 접근 가능한 이름(라벨/텍스트) 순. 실제 구현
 * 컴포넌트(`CMP-SCR001-*`)에는 `data-testid`가 없으므로(카드 클릭은
 * "3일 코스 보기" 버튼, Drawer는 `role="dialog"` + `aria-label`), 그 구조
 * 그대로를 따른다.
 */

test.use({ viewport: { width: 1440, height: 900 } });

test("E2E-PUBLIC-SMOKE 흐름 1: 홈 → 필터 적용 → 상세 진입 → 안전정보 패널 확인", async ({
  page,
}) => {
  await page.goto("/");

  // 여행지 목록: 필터 없이도 국내/해외 큐레이션 카드가 보인다.
  await expect(
    page.getByRole("heading", { name: "국내에서 먼저 떠나볼 만한 곳" }),
  ).toBeVisible();

  // 필터 적용: "미식 탐방" 테마 Chip을 눌러 URL(`?theme=`)에 반영한다.
  await page.getByRole("button", { name: "미식 탐방" }).click();
  await expect(page).toHaveURL(/[?&]theme=/);

  // 필터가 적용된 해외 여행지 목록에서 "도쿄" 카드의 상세로 진입한다.
  const overseasSection = page
    .locator("section")
    .filter({ hasText: "지금 가장 많이 찾는 해외 도시" });
  const tokyoCard = overseasSection
    .locator("article")
    .filter({ hasText: "도쿄" });
  await expect(tokyoCard).toBeVisible();
  await tokyoCard.getByRole("button", { name: "3일 코스 보기" }).click();

  const destinationDialog = page.getByRole("dialog", { name: "도쿄 상세" });
  await expect(destinationDialog).toBeVisible();

  // 안전정보 패널 확인: 상세 Drawer 안의 "안전정보 보기"로 SafetyDrawer를 연다.
  await destinationDialog
    .getByRole("button", { name: "안전정보 보기" })
    .click();
  const safetyDialog = page.getByRole("dialog", { name: "일본 안전정보" });
  await expect(safetyDialog).toBeVisible();
  await expect(safetyDialog.getByText("최종 확인일", { exact: false })).toBeVisible();
});

test("E2E-PUBLIC-SMOKE 흐름 10: 대표 소개 페이지 진입 확인", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByRole("link", { name: "대표 소개 보러가기" })
    .click();

  await expect(page).toHaveURL(/\/about\/?$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
