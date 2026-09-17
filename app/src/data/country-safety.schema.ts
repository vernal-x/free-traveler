/**
 * DATA-SAFETY 정적 스키마.
 *
 * 이 Task의 Expected Files는 `src/data/country-safety.ts`와 이 파일뿐이며
 * `package.json`은 범위 밖이라 신규 의존성을 추가할 수 없다(`CLAUDE.md` 규칙 8). zod 등
 * 외부 검증 라이브러리 없이 순수 TypeScript 타입 + 런타임 검증 함수로 REQ-FUNC-046~054가
 * 요구하는 "정적 데이터 스키마 강제"를 구현한다.
 *
 * `src/data/destinations.ts`를 import하지 않는다(이 Task는 `Depends On`이 없는 독립
 * 기반 Task) — 해외 국가 커버리지 일치 여부(REQ-FUNC-046)는 `TOOL-CONTENT-VALIDATION-SCRIPT`
 * (W02)가 두 정적 데이터 모듈을 교차 검증할 몫이다.
 */

/** REQ-FUNC-047: 8개 필수 안전정보 카테고리(고정 집합). */
export const SAFETY_CATEGORIES = [
  "치안·범죄",
  "자연재해",
  "의료·위생",
  "교통",
  "사기·바가지",
  "정치·시위",
  "입국·비자",
  "응급연락처",
] as const;
export type SafetyCategory = (typeof SAFETY_CATEGORIES)[number];

/** REQ-FUNC-051: 중대 경보 단계(외교부 4단계 경보 체계를 준용). */
export const ALERT_LEVELS = [
  "안전",
  "여행유의",
  "여행자제",
  "출국권고",
  "여행금지",
] as const;
export type AlertLevel = (typeof ALERT_LEVELS)[number];

/** REQ-FUNC-052: 경보의 적용 범위가 국가 전역인지 특정 지역인지 구분. */
export const SCOPE_TYPES = ["COUNTRY", "REGION"] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

export interface SafetyCategoryEntry {
  category: SafetyCategory;
  /** 해당 카테고리의 요약 설명. */
  summary: string;
}

export interface SafetySource {
  /** 출처명, 예: "외교부 해외안전여행". */
  name: string;
  /** 원문 링크(REQ-FUNC-049: 새 탭 + noopener,noreferrer로 여는 것은 Component 책임). */
  url: string;
  /** YYYY-MM-DD, REQ-FUNC-050 stale(7일 경과) 계산은 렌더링 시점에 이 값을 기준으로 한다. */
  verifiedAt: string;
  /** 편집자(사내 확인 담당자). */
  editor: string;
}

export interface SafetyEmergencyContacts {
  /** 현지 긴급전화, 예: "110(경찰)/119(구급·화재)". */
  localEmergencyNumber: string;
  /** 대사관/영사관 대표 전화. */
  embassyPhone: string;
}

export interface CountrySafetyInfo {
  /** ISO 3166-1 alpha-2. destinations.ts의 countryCode와 매칭 키(REQ-FUNC-006). */
  countryCode: string;
  countryName: string;
  alertLevel: AlertLevel;
  /** REQ-FUNC-051: 경보와 함께 상단에 노출할 텍스트 라벨. */
  alertLabel: string;
  scopeType: ScopeType;
  /** scopeType이 REGION이면 구체적 지역명, COUNTRY면 "전역". */
  scopeText: string;
  /** REQ-FUNC-047: 정확히 8개, SAFETY_CATEGORIES와 1:1 대응. */
  categories: SafetyCategoryEntry[];
  /** REQ-FUNC-053. */
  emergencyContacts: SafetyEmergencyContacts;
  /** REQ-FUNC-048. */
  source: SafetySource;
}

/** REQ-FUNC-053: 국적에 무관하게 동일한 영사콜센터(대한민국 외교부 24시간 상담). */
export const CONSULAR_CALL_CENTER = {
  label: "영사콜센터(24시간 해외 사건·사고 상담)",
  phone: "+82-2-3210-0404",
} as const;

/** REQ-FUNC-054: 안전 페이지·항공 요약에 함께 표시할 고정 고지 문구. */
export const SAFETY_DISCLAIMER =
  "이 정보는 참고용이며 외교부 등 공식 기관의 최신 판단을 대체하지 않습니다. 출국 전 반드시 외교부 해외안전여행 원문을 확인하세요.";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** 국가 1건의 필수 필드 스키마를 검증한다(REQ-FUNC-047~053). */
export function validateCountrySafetyInfo(info: CountrySafetyInfo): string[] {
  const errors: string[] = [];
  const tag = `[${isNonEmptyString(info.countryCode) ? info.countryCode : "(countryCode 없음)"}]`;

  if (!isNonEmptyString(info.countryCode) || info.countryCode.length < 2) {
    errors.push(`${tag} countryCode는 2자 이상이어야 함`);
  }
  if (!isNonEmptyString(info.countryName))
    errors.push(`${tag} countryName 누락`);

  if (!ALERT_LEVELS.includes(info.alertLevel)) {
    errors.push(`${tag} alertLevel은 고정 경보 단계여야 함(REQ-FUNC-051)`);
  }
  if (!isNonEmptyString(info.alertLabel)) {
    errors.push(`${tag} alertLabel 누락(REQ-FUNC-051)`);
  }

  if (!SCOPE_TYPES.includes(info.scopeType)) {
    errors.push(
      `${tag} scopeType은 COUNTRY 또는 REGION이어야 함(REQ-FUNC-052)`,
    );
  }
  if (!isNonEmptyString(info.scopeText)) {
    errors.push(`${tag} scopeText 누락(REQ-FUNC-052)`);
  }

  if (!Array.isArray(info.categories) || info.categories.length !== 8) {
    errors.push(
      `${tag} categories는 정확히 8개여야 함(REQ-FUNC-047, 현재 ${info.categories?.length ?? 0}개)`,
    );
  } else {
    const seen = new Set<string>();
    for (const entry of info.categories) {
      if (!SAFETY_CATEGORIES.includes(entry.category)) {
        errors.push(`${tag} 알 수 없는 카테고리: ${entry.category}`);
      }
      if (seen.has(entry.category)) {
        errors.push(`${tag} 중복 카테고리: ${entry.category}`);
      }
      seen.add(entry.category);
      if (!isNonEmptyString(entry.summary)) {
        errors.push(`${tag} categories[${entry.category}].summary 누락`);
      }
    }
  }

  if (!isNonEmptyString(info.emergencyContacts?.localEmergencyNumber)) {
    errors.push(
      `${tag} emergencyContacts.localEmergencyNumber 누락(REQ-FUNC-053)`,
    );
  }
  if (!isNonEmptyString(info.emergencyContacts?.embassyPhone)) {
    errors.push(`${tag} emergencyContacts.embassyPhone 누락(REQ-FUNC-053)`);
  }

  if (!isNonEmptyString(info.source?.name))
    errors.push(`${tag} source.name 누락(REQ-FUNC-048)`);
  if (!isNonEmptyString(info.source?.url))
    errors.push(`${tag} source.url 누락(REQ-FUNC-048)`);
  if (!isNonEmptyString(info.source?.editor)) {
    errors.push(`${tag} source.editor 누락(REQ-FUNC-048)`);
  }
  if (
    !isNonEmptyString(info.source?.verifiedAt) ||
    !DATE_PATTERN.test(info.source.verifiedAt)
  ) {
    errors.push(
      `${tag} source.verifiedAt은 YYYY-MM-DD 형식이어야 함(REQ-FUNC-048)`,
    );
  }

  return errors;
}

export interface CountrySafetyDatasetValidationResult {
  itemErrors: string[];
  datasetErrors: string[];
}

/** 개별 필드 스키마(REQ-FUNC-047~053)와 국가 중복 여부를 함께 검증한다. */
export function validateCountrySafetyDataset(
  list: CountrySafetyInfo[],
): CountrySafetyDatasetValidationResult {
  const itemErrors = list.flatMap(validateCountrySafetyInfo);
  const datasetErrors: string[] = [];

  const seenCodes = new Set<string>();
  for (const info of list) {
    if (seenCodes.has(info.countryCode)) {
      datasetErrors.push(`중복 countryCode: ${info.countryCode}`);
    }
    seenCodes.add(info.countryCode);
  }

  if (list.length < 1) {
    datasetErrors.push("해외 국가 안전정보가 1개 이상 필요함(REQ-FUNC-046)");
  }

  return { itemErrors, datasetErrors };
}

/** 검증 실패 시 즉시 예외를 던진다(모듈 로드 시점 fail-fast). */
export function assertValidCountrySafetyDataset(
  list: CountrySafetyInfo[],
): void {
  const { itemErrors, datasetErrors } = validateCountrySafetyDataset(list);
  const allErrors = [...itemErrors, ...datasetErrors];
  if (allErrors.length > 0) {
    throw new Error(
      `country-safety.ts 데이터가 스키마를 위반합니다:\n- ${allErrors.join("\n- ")}`,
    );
  }
}
