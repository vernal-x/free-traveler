/**
 * TOOL-CONTENT-VALIDATION-SCRIPT — 정적 데이터 완전성/수량 검증 스크립트.
 *
 * `src/data/destinations.ts`와 `src/data/country-safety.ts`는 각각 모듈 로드 시점에
 * 자체 필드 스키마(REQ-FUNC-004/007/047~053)와 자기 완결적 수량 조건(REQ-FUNC-008)을
 * 이미 강제한다(fail-fast). 이 스크립트가 추가로 담당하는 것은 그 두 정적 데이터
 * 모듈 사이의 교차 검증뿐이다:
 *
 *   REQ-FUNC-046: 게시된 해외(OVERSEAS) 국가 수 == 안전정보 데이터의 국가 수
 *                 (국가 코드 집합이 정확히 일치해야 함)
 *
 * REQ-NF-026/027/028: 이 검증은 별도 배치 잡이나 DB 없이, CI 빌드 시점에 정적 데이터를
 * 직접 읽어 계산한다(런타임 요청마다 재계산하지 않음).
 *
 * 실행: `npx tsx scripts/validate_content.ts` (레포에 `.js` 확장자로 상호 참조하는
 * ESM TypeScript 소스를 그대로 실행하려면 tsx가 필요하다 — 순정 `node`의 타입
 * 스트리핑은 이 확장자 재작성을 지원하지 않는다). 필수 필드 검증은 아래 두 모듈을
 * import하는 순간 자체적으로 발생하므로, import 자체가 실패하면 그 메시지를 그대로
 * FAIL로 보고한다.
 */

async function main(): Promise<number> {
  const errors: string[] = [];

  let destinationsModule: typeof import("../src/data/destinations.js");
  try {
    destinationsModule = await import("../src/data/destinations.js");
  } catch (e) {
    console.error(
      "✗ FAIL: src/data/destinations.ts 로드 실패(필드 스키마 위반)",
    );
    console.error(e instanceof Error ? e.message : e);
    return 1;
  }

  let countrySafetyModule: typeof import("../src/data/country-safety.js");
  try {
    countrySafetyModule = await import("../src/data/country-safety.js");
  } catch (e) {
    console.error(
      "✗ FAIL: src/data/country-safety.ts 로드 실패(필드 스키마 위반)",
    );
    console.error(e instanceof Error ? e.message : e);
    return 1;
  }

  const { DESTINATIONS } = destinationsModule;
  const { COUNTRY_SAFETY_INFO } = countrySafetyModule;

  // REQ-FUNC-008(재확인): 국내 10개↑, 해외 15개국 30도시↑는 이미 모듈 로드 시점에
  // assertValidDestinationsDataset()이 강제했으므로 여기서는 개수만 보고한다.
  const domesticCount = DESTINATIONS.filter(
    (d) => d.scope === "DOMESTIC",
  ).length;
  const overseas = DESTINATIONS.filter((d) => d.scope === "OVERSEAS");
  const overseasCountryCodes = new Set(overseas.map((d) => d.countryCode));

  console.log(`국내 여행지: ${domesticCount}개`);
  console.log(
    `해외 여행지: ${overseas.length}개 도시, ${overseasCountryCodes.size}개국`,
  );

  // REQ-FUNC-046: 해외 국가 커버리지 == 안전정보 국가 커버리지(교집합·차집합 모두 검사)
  const safetyCountryCodes = new Set(
    COUNTRY_SAFETY_INFO.map((c) => c.countryCode),
  );

  const missingFromSafety = [...overseasCountryCodes].filter(
    (code) => !safetyCountryCodes.has(code),
  );
  const extraInSafety = [...safetyCountryCodes].filter(
    (code) => !overseasCountryCodes.has(code),
  );

  if (missingFromSafety.length > 0) {
    errors.push(
      `REQ-FUNC-046 위반: 안전정보 데이터에 없는 해외 국가 - ${missingFromSafety.join(", ")}`,
    );
  }
  if (extraInSafety.length > 0) {
    errors.push(
      `REQ-FUNC-046 위반: destinations.ts 해외 국가에 없는 안전정보 국가 - ${extraInSafety.join(", ")}`,
    );
  }
  if (missingFromSafety.length === 0 && extraInSafety.length === 0) {
    console.log(
      `✓ REQ-FUNC-046: 해외 국가 커버리지 100% 일치(${safetyCountryCodes.size}개국)`,
    );
  }

  if (errors.length > 0) {
    console.error("\n✗ FAIL: 정적 데이터 교차 검증 실패");
    for (const err of errors) console.error(`- ${err}`);
    return 1;
  }

  console.log("\n✓ PASS: 모든 정적 데이터 검증을 통과했습니다.");
  return 0;
}

main()
  .then((exitCode) => process.exit(exitCode))
  .catch((e) => {
    console.error("✗ FAIL: 검증 스크립트 실행 중 예기치 않은 오류");
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
