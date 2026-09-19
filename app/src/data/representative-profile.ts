/**
 * DATA-REPRESENTATIVE — SCR-002(대표 소개) 정적 데이터 단일 소스.
 *
 * DB 테이블이 아니라 정적 TypeScript 모듈이다(DEC-004, `CLAUDE.md` 규칙 16). 이 Task의
 * Expected Files는 이 파일 하나뿐이라(`package.json` 범위 밖) zod 등 외부 검증
 * 라이브러리 없이 순수 TypeScript 타입 + 런타임 검증 함수로 REQ-FUNC-057~063이 요구하는
 * 수량 조건(50+ Trips, 30개국, Timeline 6개↑, Gallery 8장↑)을 강제한다.
 *
 * `CMP-SCR002-HERO-STATS`/`INTRO-PHILOSOPHY`/`TIMELINE`/`COUNTRIES-CHIPS`/`GALLERY`/
 * `RECOMMEND-CTA` Component Task가 이 모듈만 import해서 조립한다(`recommendedDestinationIds`는
 * `src/data/destinations.ts`의 `id`를 가리키는 참조 키일 뿐, 이 파일이 목적지 상세 데이터를
 * 중복 보관하지 않는다).
 */

export interface RepresentativeGalleryImage {
  /** 실제 배포 시 최적화된 이미지 URL로 교체한다. */
  url: string;
  /** REQ-FUNC-061(축소): 접근성을 위한 실제 장소 서술 대체 텍스트, 필수. */
  alt: string;
  /** 출처/장소명 등 축소된 캡션. 라이선스 승인 워크플로는 범위 밖(REQ-FUNC-061 축소). */
  caption?: string;
}

export interface RepresentativeTimelineEntry {
  /** 예: "2019" 또는 "2019-08". */
  year: string;
  place: string;
  summary: string;
}

/** SCR-002 Section 5 방문 국가 Chip 4개 권역 그룹과 1:1로 대응. */
export const VISITED_COUNTRY_REGIONS = [
  "아시아",
  "유럽",
  "북미",
  "오세아니아",
] as const;
export type VisitedCountryRegion = (typeof VISITED_COUNTRY_REGIONS)[number];

export interface VisitedCountryGroup {
  region: VisitedCountryRegion;
  countries: string[];
}

export interface RepresentativeProfile {
  name: string;
  /** Hero Section의 한 줄 소개. */
  tagline: string;
  heroImage: RepresentativeGalleryImage;
  /** Section 2 여행 지표 3개 카드 중 `50+ Trips`. */
  tripsCount: number;
  /** Section 2 여행 지표 3개 카드 중 `30+ Countries`. `visitedCountries` 총합과 일치해야 한다. */
  countriesCount: number;
  /** Section 2 여행 지표 3개 카드 중 대륙 수. `visitedCountries`의 region 개수와 일치해야 한다. */
  continentsCount: number;
  /** Section 3: 자기소개→계기→철학 인용→편집 원칙 순 2~4문단. */
  philosophy: string[];
  /** Section 4: 6개 이상 시점, 각 항목 연도·장소·요약. */
  timeline: RepresentativeTimelineEntry[];
  /** Section 5: 권역 4그룹, 총 정확히 30개국. */
  visitedCountries: VisitedCountryGroup[];
  /** Section 6: 서로 다른 장소 8장 이상. */
  gallery: RepresentativeGalleryImage[];
  /**
   * Section 7: 기억에 남는 여행지 4곳. `src/data/destinations.ts`의 `Destination.id`를
   * 가리키는 참조 키만 보관한다(중복 데이터 보관 금지) — 실제 카드 콘텐츠는
   * `CMP-SCR002-RECOMMEND-CTA`가 `destinations.ts`에서 조회해 조립한다.
   */
  recommendedDestinationIds: string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** REQ-FUNC-057~063이 요구하는 수량·필드 조건을 검증한다(TC-1, TC-2). */
export function validateRepresentativeProfile(
  p: RepresentativeProfile,
): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(p.name)) errors.push("name 누락");
  if (!isNonEmptyString(p.tagline)) errors.push("tagline 누락");
  if (!isNonEmptyString(p.heroImage?.url)) errors.push("heroImage.url 누락");
  if (!isNonEmptyString(p.heroImage?.alt)) {
    errors.push("heroImage.alt 누락(REQ-FUNC-061)");
  }

  if (p.tripsCount < 50) {
    errors.push(`tripsCount는 50 이상이어야 함(현재 ${p.tripsCount})`);
  }
  if (p.countriesCount < 30) {
    errors.push(`countriesCount는 30 이상이어야 함(현재 ${p.countriesCount})`);
  }

  if (
    !Array.isArray(p.philosophy) ||
    p.philosophy.length < 2 ||
    p.philosophy.length > 4
  ) {
    errors.push(
      `philosophy는 2~4문단이어야 함(현재 ${p.philosophy?.length ?? 0}문단)`,
    );
  } else if (p.philosophy.some((paragraph) => !isNonEmptyString(paragraph))) {
    errors.push("philosophy에 빈 문단이 포함됨");
  }

  if (!Array.isArray(p.timeline) || p.timeline.length < 6) {
    errors.push(
      `timeline은 6개 이상이어야 함(현재 ${p.timeline?.length ?? 0}개)`,
    );
  } else {
    p.timeline.forEach((entry, i) => {
      if (!isNonEmptyString(entry.year))
        errors.push(`timeline[${i}].year 누락`);
      if (!isNonEmptyString(entry.place))
        errors.push(`timeline[${i}].place 누락`);
      if (!isNonEmptyString(entry.summary))
        errors.push(`timeline[${i}].summary 누락`);
    });
  }

  if (!Array.isArray(p.visitedCountries) || p.visitedCountries.length !== 4) {
    errors.push(
      `visitedCountries는 정확히 4개 권역이어야 함(현재 ${p.visitedCountries?.length ?? 0}개)`,
    );
  } else {
    const seenRegions = new Set<string>();
    let totalCountries = 0;
    for (const group of p.visitedCountries) {
      if (!VISITED_COUNTRY_REGIONS.includes(group.region)) {
        errors.push(`알 수 없는 권역: ${group.region}`);
      }
      if (seenRegions.has(group.region))
        errors.push(`중복 권역: ${group.region}`);
      seenRegions.add(group.region);
      if (!Array.isArray(group.countries) || group.countries.length < 1) {
        errors.push(`${group.region} 권역에 국가가 1개 이상 필요`);
      } else {
        totalCountries += group.countries.length;
      }
    }
    if (totalCountries !== 30) {
      errors.push(
        `방문 국가는 정확히 30개국이어야 함(현재 ${totalCountries}개국)`,
      );
    }
    if (totalCountries !== p.countriesCount) {
      errors.push(
        `countriesCount(${p.countriesCount})와 visitedCountries 총합(${totalCountries})이 일치해야 함`,
      );
    }
    if (seenRegions.size !== p.continentsCount) {
      errors.push(
        `continentsCount(${p.continentsCount})와 visitedCountries 권역 수(${seenRegions.size})가 일치해야 함`,
      );
    }
  }

  if (!Array.isArray(p.gallery) || p.gallery.length < 8) {
    errors.push(
      `gallery는 8장 이상이어야 함(현재 ${p.gallery?.length ?? 0}장)`,
    );
  } else {
    p.gallery.forEach((img, i) => {
      if (!isNonEmptyString(img.url)) errors.push(`gallery[${i}].url 누락`);
      if (!isNonEmptyString(img.alt)) {
        errors.push(`gallery[${i}].alt 누락(REQ-FUNC-061)`);
      }
    });
  }

  if (
    !Array.isArray(p.recommendedDestinationIds) ||
    p.recommendedDestinationIds.length !== 4
  ) {
    errors.push(
      `recommendedDestinationIds는 정확히 4개여야 함(현재 ${p.recommendedDestinationIds?.length ?? 0}개)`,
    );
  }

  return errors;
}

/** 검증 실패 시 즉시 예외를 던진다(모듈 로드 시점 fail-fast). */
export function assertValidRepresentativeProfile(
  p: RepresentativeProfile,
): void {
  const errors = validateRepresentativeProfile(p);
  if (errors.length > 0) {
    throw new Error(
      `representative-profile.ts 데이터가 스키마를 위반합니다:\n- ${errors.join("\n- ")}`,
    );
  }
}

export const REPRESENTATIVE_PROFILE: RepresentativeProfile = {
  name: "여행 큐레이터 강지우",
  tagline: "50개국 넘게 걸어본 발로, 진짜 갈 만한 곳만 추립니다.",
  heroImage: {
    url: "https://picsum.photos/seed/representative-hero-jiwoo/800/600",
    alt: "배낭을 메고 산 정상에서 카메라를 향해 웃고 있는 대표 강지우의 모습",
    caption: "뉴질랜드 퀸스타운 트레킹 중, 2023",
  },
  tripsCount: 54,
  countriesCount: 30,
  continentsCount: 4,
  philosophy: [
    "여행을 처음 시작한 건 20대 초반 배낭 하나 메고 떠난 동남아시아 여행이었습니다. 정해진 일정도, 화려한 계획도 없이 그저 발길 닿는 대로 걸었던 그 몇 달이 지금까지 이어진 여행 인생의 출발점이었습니다.",
    "그 뒤로 10년 넘게 매년 최소 서너 번씩 짐을 싸며 깨달은 것은, 정말 좋은 여행지는 화려한 SNS 사진 몇 장으로는 절대 알 수 없다는 사실이었습니다. 직접 걸어보고, 현지 음식을 먹어보고, 실패도 해봐야 비로소 그 여행지의 진짜 얼굴이 보이기 시작했습니다.",
    '"여행은 목적지가 아니라 그곳에서 보낸 시간의 밀도로 기억된다" — 이 문장은 제가 여행지를 고르고 소개할 때마다 되새기는 원칙입니다. 아무리 유명한 명소라도 머무는 시간이 얕으면 기억에 남지 않고, 반대로 이름 없는 골목이라도 충분히 머물면 평생 잊지 못할 장면이 됩니다.',
    "그래서 이 사이트에 올리는 모든 여행지 정보는 직접 다녀왔거나 신뢰할 수 있는 공식 자료로 교차 확인한 내용만 담습니다. 별점이나 순위로 줄 세우지 않고, 있는 그대로의 정보와 실용적인 팁만 전달하는 것이 제 편집 원칙입니다.",
  ],
  timeline: [
    {
      year: "2013",
      place: "태국 방콕·치앙마이",
      summary:
        "첫 배낭여행, 3개월간 동남아시아 5개국을 무계획으로 순회하며 여행의 재미에 눈뜬 해.",
    },
    {
      year: "2015",
      place: "네팔 히말라야",
      summary:
        "안나푸르나 베이스캠프 트레킹 완주, 고산 지대 여행의 매력과 준비의 중요성을 배운 계기.",
    },
    {
      year: "2017",
      place: "유럽 8개국 배낭여행",
      summary:
        "6개월간 프랑스·이탈리아·스페인 등을 기차로 이동하며 유럽 미식·건축 문화를 집중 탐구.",
    },
    {
      year: "2019",
      place: "뉴질랜드·호주",
      summary:
        "워킹홀리데이로 1년 체류, 오세아니아 대자연 액티비티와 로컬 생활 문화를 깊이 경험.",
    },
    {
      year: "2021",
      place: "국내 구석구석",
      summary:
        "팬데믹 기간 해외여행이 어려워지며 국내 30여 개 도시를 재발견, 숨은 국내 명소 콘텐츠 축적.",
    },
    {
      year: "2022",
      place: "튀르키예·그리스",
      summary:
        "카파도키아 열기구 투어와 산토리니 섬 여행, 지중해·중동 문화권 여행지 취재.",
    },
    {
      year: "2023",
      place: "뉴질랜드 퀸스타운",
      summary:
        "익스트림 액티비티 전문 취재를 위해 재방문, 번지점프·패러글라이딩 등 직접 체험.",
    },
    {
      year: "2024",
      place: "인도네시아 발리·자카르타",
      summary:
        "동남아 힐링 여행지와 대도시 여행을 함께 소개하기 위한 심층 취재 여행.",
    },
  ],
  visitedCountries: [
    {
      region: "아시아",
      countries: [
        "대한민국",
        "일본",
        "태국",
        "베트남",
        "대만",
        "인도네시아",
        "싱가포르",
        "말레이시아",
        "필리핀",
        "캄보디아",
      ],
    },
    {
      region: "유럽",
      countries: [
        "프랑스",
        "이탈리아",
        "스페인",
        "영국",
        "스위스",
        "그리스",
        "튀르키예",
        "독일",
        "네덜란드",
        "포르투갈",
        "오스트리아",
        "체코",
      ],
    },
    {
      region: "북미",
      countries: ["미국", "캐나다", "멕시코", "코스타리카"],
    },
    {
      region: "오세아니아",
      countries: ["호주", "뉴질랜드", "피지", "파푸아뉴기니"],
    },
  ],
  gallery: [
    {
      url: "https://picsum.photos/seed/representative-gallery-01/800/600",
      alt: "네팔 안나푸르나 베이스캠프 정상에서 촬영한 설산 파노라마",
      caption: "안나푸르나 베이스캠프, 네팔 2015",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-02/800/600",
      alt: "프랑스 파리 에펠탑 앞에서 촬영한 야간 조명쇼 장면",
      caption: "에펠탑 야경, 프랑스 2017",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-03/800/600",
      alt: "뉴질랜드 퀸스타운 와카티푸 호수 앞 카약 체험 장면",
      caption: "와카티푸 호수 카약, 뉴질랜드 2019",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-04/800/600",
      alt: "제주 성산일출봉 앞 유채꽃밭에서 촬영한 봄 풍경",
      caption: "성산일출봉 유채꽃, 제주 2021",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-05/800/600",
      alt: "튀르키예 카파도키아 상공에 떠오른 수십 개의 열기구",
      caption: "열기구 투어, 튀르키예 2022",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-06/800/600",
      alt: "그리스 산토리니 이아마을 파란 돔 지붕과 에게해 일몰",
      caption: "이아마을 일몰, 그리스 2022",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-07/800/600",
      alt: "뉴질랜드 퀸스타운에서 번지점프를 뛰어내리는 순간",
      caption: "카와라우 다리 번지점프, 뉴질랜드 2023",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-08/800/600",
      alt: "인도네시아 발리 우붓 테갈랄랑 라이스 테라스 계단식 논",
      caption: "테갈랄랑 라이스 테라스, 발리 2024",
    },
    {
      url: "https://picsum.photos/seed/representative-gallery-09/800/600",
      alt: "베트남 다낭 바나힐 골든브릿지 위에서 내려다본 산악 전경",
      caption: "골든브릿지, 베트남 2024",
    },
  ],
  recommendedDestinationIds: [
    "kr-gyeongju",
    "it-rome",
    "gr-santorini",
    "nz-queenstown",
  ],
};

assertValidRepresentativeProfile(REPRESENTATIVE_PROFILE);
