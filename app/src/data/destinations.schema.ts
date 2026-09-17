/**
 * DATA-DESTINATIONS 정적 스키마.
 *
 * 이 파일은 zod 등 외부 검증 라이브러리에 의존하지 않는다 — 이 Task의 Expected
 * Files는 `src/data/destinations.ts`와 이 파일뿐이며 `package.json`은 범위 밖이라
 * 신규 의존성을 추가할 수 없다(`docs/ARCHITECTURE.md` §18, `CLAUDE.md` 규칙 8). 대신
 * 순수 TypeScript 타입 + 런타임 검증 함수로 "정적 데이터 스키마 강제"(REQ-FUNC-004)를
 * 구현한다.
 */

export const DESTINATION_SCOPES = ["DOMESTIC", "OVERSEAS"] as const;
export type DestinationScope = (typeof DESTINATION_SCOPES)[number];

/** SCR-001 Section 4 여행 동기·테마 Chip 6개와 1:1로 대응하는 고정 테마 집합. */
export const DESTINATION_THEMES = [
  "자연·힐링",
  "미식 탐방",
  "도심 액티비티",
  "가족과 함께",
  "배낭여행",
  "커플 여행",
] as const;
export type DestinationTheme = (typeof DESTINATION_THEMES)[number];

/** REQ-FUNC-002 "기간" AND 필터에 쓰이는 추천 여행 기간 태그. */
export const DESTINATION_DURATIONS = [
  "당일치기",
  "1박 2일",
  "2박 3일",
  "3박 4일 이상",
] as const;
export type DestinationDuration = (typeof DESTINATION_DURATIONS)[number];

export interface DestinationImage {
  /** 실제 배포 시 최적화된 이미지 URL로 교체한다. */
  url: string;
  /** REQ-FUNC-007: 접근성을 위한 대체 텍스트, 필수. */
  alt: string;
  /** 출처/촬영자 등 축소된 캡션. 라이선스 승인 워크플로는 범위 밖(REQ-FUNC-007 축소). */
  caption?: string;
}

export interface DestinationItinerary {
  oneDay: string[];
  threeDay: string[];
}

export interface Destination {
  id: string;
  /** 도시/여행지 이름(한국어). */
  name: string;
  /** ISO 3166-1 alpha-2 국가 코드(대한민국은 KR). country-safety.ts와 매칭 키(REQ-FUNC-006). */
  countryCode: string;
  countryName: string;
  scope: DestinationScope;
  themes: DestinationTheme[];
  bestSeason: string;
  durationOptions: DestinationDuration[];
  /** REQ-FUNC-003 클라이언트 키워드 부분일치 검색 대상 보조 키워드. */
  keywords: string[];
  images: DestinationImage[];
  /** 300자 이상 소개 문단. */
  overview: string;
  /** 5개 이상의 명소/포인트. */
  highlights: string[];
  itinerary: DestinationItinerary;
  budgetRange: string;
  transport: string;
  /** 3개 이상. */
  food: string[];
  /** 3개 이상. */
  etiquette: string[];
  source: string;
  /** YYYY-MM-DD */
  lastUpdated: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** 여행지 1건의 필수 필드 스키마를 검증한다(REQ-FUNC-004, REQ-FUNC-007). */
export function validateDestination(d: Destination): string[] {
  const errors: string[] = [];
  const tag = `[${isNonEmptyString(d.id) ? d.id : "(id 없음)"}]`;

  if (!isNonEmptyString(d.id)) errors.push(`${tag} id 누락`);
  if (!isNonEmptyString(d.name)) errors.push(`${tag} name 누락`);
  if (!isNonEmptyString(d.countryCode) || d.countryCode.length < 2) {
    errors.push(`${tag} countryCode는 2자 이상이어야 함`);
  }
  if (!isNonEmptyString(d.countryName)) errors.push(`${tag} countryName 누락`);
  if (!DESTINATION_SCOPES.includes(d.scope)) {
    errors.push(`${tag} scope는 DOMESTIC 또는 OVERSEAS여야 함(REQ-FUNC-001)`);
  }

  if (!Array.isArray(d.themes) || d.themes.length < 1) {
    errors.push(`${tag} themes 1개 이상 필요(REQ-FUNC-002)`);
  } else {
    for (const theme of d.themes) {
      if (!DESTINATION_THEMES.includes(theme)) {
        errors.push(`${tag} 알 수 없는 테마: ${theme}`);
      }
    }
  }

  if (!isNonEmptyString(d.bestSeason)) errors.push(`${tag} bestSeason 누락`);

  if (!Array.isArray(d.durationOptions) || d.durationOptions.length < 1) {
    errors.push(`${tag} durationOptions 1개 이상 필요(REQ-FUNC-002)`);
  } else {
    for (const duration of d.durationOptions) {
      if (!DESTINATION_DURATIONS.includes(duration)) {
        errors.push(`${tag} 알 수 없는 기간 태그: ${duration}`);
      }
    }
  }

  if (!Array.isArray(d.keywords) || d.keywords.length < 1) {
    errors.push(`${tag} keywords 1개 이상 필요(REQ-FUNC-003)`);
  }

  if (!Array.isArray(d.images) || d.images.length < 1) {
    errors.push(`${tag} images 1개 이상 필요`);
  } else {
    d.images.forEach((img, i) => {
      if (!isNonEmptyString(img.url))
        errors.push(`${tag} images[${i}].url 누락`);
      if (!isNonEmptyString(img.alt)) {
        errors.push(`${tag} images[${i}].alt 누락(REQ-FUNC-007)`);
      }
    });
  }

  if (!isNonEmptyString(d.overview) || d.overview.length < 300) {
    errors.push(
      `${tag} overview는 300자 이상이어야 함(현재 ${d.overview?.length ?? 0}자)`,
    );
  }

  if (!Array.isArray(d.highlights) || d.highlights.length < 5) {
    errors.push(
      `${tag} highlights는 5개 이상이어야 함(현재 ${d.highlights?.length ?? 0}개)`,
    );
  }

  if (!Array.isArray(d.itinerary?.oneDay) || d.itinerary.oneDay.length < 1) {
    errors.push(`${tag} itinerary.oneDay 1개 이상 필요`);
  }
  if (
    !Array.isArray(d.itinerary?.threeDay) ||
    d.itinerary.threeDay.length < 1
  ) {
    errors.push(`${tag} itinerary.threeDay 1개 이상 필요`);
  }

  if (!isNonEmptyString(d.budgetRange)) errors.push(`${tag} budgetRange 누락`);
  if (!isNonEmptyString(d.transport)) errors.push(`${tag} transport 누락`);

  if (!Array.isArray(d.food) || d.food.length < 3) {
    errors.push(
      `${tag} food는 3개 이상이어야 함(현재 ${d.food?.length ?? 0}개)`,
    );
  }
  if (!Array.isArray(d.etiquette) || d.etiquette.length < 3) {
    errors.push(
      `${tag} etiquette는 3개 이상이어야 함(현재 ${d.etiquette?.length ?? 0}개)`,
    );
  }

  if (!isNonEmptyString(d.source)) errors.push(`${tag} source 누락`);
  if (!isNonEmptyString(d.lastUpdated) || !DATE_PATTERN.test(d.lastUpdated)) {
    errors.push(`${tag} lastUpdated는 YYYY-MM-DD 형식이어야 함`);
  }

  return errors;
}

export interface DatasetValidationResult {
  itemErrors: string[];
  datasetErrors: string[];
}

/**
 * 개별 필드 스키마(REQ-FUNC-004, 007)와 데이터셋 규모(REQ-FUNC-008: 국내 10개↑,
 * 해외 15개국 30도시↑)를 함께 검증한다.
 */
export function validateDestinationsDataset(
  list: Destination[],
): DatasetValidationResult {
  const itemErrors = list.flatMap(validateDestination);
  const datasetErrors: string[] = [];

  const seenIds = new Set<string>();
  for (const d of list) {
    if (seenIds.has(d.id)) datasetErrors.push(`중복 id: ${d.id}`);
    seenIds.add(d.id);
  }

  const domestic = list.filter((d) => d.scope === "DOMESTIC");
  const overseas = list.filter((d) => d.scope === "OVERSEAS");
  const overseasCountries = new Set(overseas.map((d) => d.countryCode));

  if (domestic.length < 10) {
    datasetErrors.push(
      `국내 여행지는 10개 이상이어야 함(REQ-FUNC-008, 현재 ${domestic.length}개)`,
    );
  }
  if (overseasCountries.size < 15) {
    datasetErrors.push(
      `해외 여행지는 15개국 이상을 커버해야 함(REQ-FUNC-008, 현재 ${overseasCountries.size}개국)`,
    );
  }
  if (overseas.length < 30) {
    datasetErrors.push(
      `해외 여행지는 30개 도시 이상이어야 함(REQ-FUNC-008, 현재 ${overseas.length}개 도시)`,
    );
  }

  return { itemErrors, datasetErrors };
}

/** 검증 실패 시 즉시 예외를 던진다(모듈 로드 시점 fail-fast). */
export function assertValidDestinationsDataset(list: Destination[]): void {
  const { itemErrors, datasetErrors } = validateDestinationsDataset(list);
  const allErrors = [...itemErrors, ...datasetErrors];
  if (allErrors.length > 0) {
    throw new Error(
      `destinations.ts 데이터가 스키마를 위반합니다:\n- ${allErrors.join("\n- ")}`,
    );
  }
}
