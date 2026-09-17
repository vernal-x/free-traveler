import {
  assertValidCountrySafetyDataset,
  type CountrySafetyInfo,
} from "./country-safety.schema.js";

/**
 * DATA-SAFETY — 국가 안전정보 정적 데이터.
 *
 * DB 테이블이 아니라 정적 TypeScript 모듈이다(DEC-004, `CLAUDE.md` 규칙 16).
 * `src/data/destinations.ts`의 해외(OVERSEAS) 15개국과 동일한 국가를 커버한다
 * (REQ-FUNC-046 — 게시 해외 국가 수와 안전 데이터 국가 수 일치는 이후
 * `TOOL-CONTENT-VALIDATION-SCRIPT`가 교차 검증). 각 항목은 8개 필수 카테고리, 출처·
 * 확인일·편집자, 경보 범위(scope_type/scope_text), 긴급연락처를 모두 포함한다.
 */

const VERIFIED_AT = "2026-09-10";
const EDITOR = "안전정보팀 박서연";

function buildCategories(
  summaries: Record<
    | "치안·범죄"
    | "자연재해"
    | "의료·위생"
    | "교통"
    | "사기·바가지"
    | "정치·시위"
    | "입국·비자"
    | "응급연락처",
    string
  >,
): CountrySafetyInfo["categories"] {
  return [
    { category: "치안·범죄", summary: summaries["치안·범죄"] },
    { category: "자연재해", summary: summaries["자연재해"] },
    { category: "의료·위생", summary: summaries["의료·위생"] },
    { category: "교통", summary: summaries["교통"] },
    { category: "사기·바가지", summary: summaries["사기·바가지"] },
    { category: "정치·시위", summary: summaries["정치·시위"] },
    { category: "입국·비자", summary: summaries["입국·비자"] },
    { category: "응급연락처", summary: summaries["응급연락처"] },
  ];
}

export const COUNTRY_SAFETY_INFO: CountrySafetyInfo[] = [
  {
    countryCode: "JP",
    countryName: "일본",
    alertLevel: "안전",
    alertLabel: "특별한 경보 없음 — 일반 안전수칙 준수 권고",
    scopeType: "COUNTRY",
    scopeText: "전역",
    categories: buildCategories({
      "치안·범죄":
        "전반적으로 치안이 양호하나 관광지·전철에서 소매치기에 유의해야 한다.",
      자연재해:
        "환태평양 지진대에 위치해 지진·태풍이 잦으니 대피 요령을 사전에 숙지한다.",
      "의료·위생":
        "의료 수준이 높으나 진료비가 비싸 해외여행자보험 가입을 권장한다.",
      교통: "좌측통행이며 대중교통이 매우 정확하나 러시아워 혼잡도가 높다.",
      "사기·바가지":
        "번화가 호객 바(캬바쿠라) 바가지 요금 피해 사례가 있어 주의가 필요하다.",
      "정치·시위": "정치적으로 안정적이며 대규모 시위는 드물다.",
      "입국·비자": "관광 목적 90일 이내 무비자 입국 가능(단기체류).",
      응급연락처: "경찰 110, 구급·화재 119.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "110(경찰)/119(구급·화재)",
      embassyPhone: "+81-3-3452-7611(주일한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=73",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "TH",
    countryName: "태국",
    alertLevel: "여행유의",
    alertLabel: "남부 일부 지역 여행자제 — 나머지 지역은 여행유의",
    scopeType: "REGION",
    scopeText: "남부 3개주(얄라·빠따니·나라티왓) 및 인접 지역",
    categories: buildCategories({
      "치안·범죄":
        "관광지 소매치기·오토바이 날치기 사례가 있어 귀중품 관리에 유의한다.",
      자연재해:
        "우기(6~10월) 홍수·스콜성 폭우가 잦으니 이동 일정에 여유를 둔다.",
      "의료·위생":
        "방콕 등 대도시는 의료 수준이 높으나 지방은 시설이 제한적이다.",
      교통: "툭툭·오토바이 택시 사고가 잦아 헬멧 착용과 안전벨트를 확인한다.",
      "사기·바가지":
        "보석 사기, 택시 미터기 미사용 바가지 요금 사례가 빈번하다.",
      "정치·시위": "간헐적 정치 집회가 발생할 수 있어 집회 장소 접근을 피한다.",
      "입국·비자": "관광 목적 30일 이내 무비자 입국 가능.",
      응급연락처: "관광경찰 1155, 구급 1669.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "191(경찰)/1669(구급)/1155(관광경찰)",
      embassyPhone: "+66-2-481-6000(주태국한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=147",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "VN",
    countryName: "베트남",
    alertLevel: "안전",
    alertLabel: "특별한 경보 없음 — 일반 안전수칙 준수 권고",
    scopeType: "COUNTRY",
    scopeText: "전역",
    categories: buildCategories({
      "치안·범죄":
        "오토바이 날치기, 관광지 소매치기 사례가 있어 가방을 몸 안쪽으로 멘다.",
      자연재해: "중북부 지역 우기(7~11월) 태풍·홍수에 유의한다.",
      "의료·위생":
        "대도시 외 지역은 의료 인프라가 제한적이라 상비약을 준비한다.",
      교통: "오토바이 통행량이 극히 많아 도로 횡단·차량 이용 시 각별히 주의한다.",
      "사기·바가지": "택시 미터기 조작, 환전 사기 사례가 보고된다.",
      "정치·시위": "정치적으로 안정적이며 대규모 시위는 드물다.",
      "입국·비자": "관광 목적 45일 이내 무비자 입국 가능.",
      응급연락처: "경찰 113, 구급 115, 화재 114.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "113(경찰)/115(구급)/114(화재)",
      embassyPhone: "+84-24-3831-5111(주베트남한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=239",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "FR",
    countryName: "프랑스",
    alertLevel: "여행유의",
    alertLabel: "테러 경계 강화 지역 있음 — 혼잡 관광지 주의",
    scopeType: "REGION",
    scopeText: "파리 등 주요 관광지 및 대중교통 혼잡 구역",
    categories: buildCategories({
      "치안·범죄":
        "지하철·관광명소에서 소매치기, 집단 소매치기(집시 소매치기단) 피해가 빈번하다.",
      자연재해:
        "대형 자연재해 위험은 낮으나 폭염·한파 시기 이동 계획에 유의한다.",
      "의료·위생":
        "의료 수준이 높으며 여행자보험 가입 시 응급 진료 이용이 원활하다.",
      교통: "대중교통이 발달했으나 파업이 잦아 사전에 운행 정보를 확인한다.",
      "사기·바가지":
        "가짜 서명 요청 후 소매치기, 관광지 인근 바가지 레스토랑에 유의한다.",
      "정치·시위":
        "정기적으로 대규모 시위·파업이 발생하며 교통 통제가 동반될 수 있다.",
      "입국·비자": "무비자 90일 이내 체류 가능(솅겐 협정).",
      응급연락처: "경찰 17, 구급 15, 화재 18, 통합 112.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "17(경찰)/15(구급)/18(화재)/112(통합)",
      embassyPhone: "+33-1-4753-6996(주프랑스한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=57",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "IT",
    countryName: "이탈리아",
    alertLevel: "여행유의",
    alertLabel: "주요 관광지 소매치기 다발 — 유의 필요",
    scopeType: "REGION",
    scopeText: "로마·밀라노·피렌체 등 주요 관광도시",
    categories: buildCategories({
      "치안·범죄":
        "기차역·관광명소 인근 소매치기, 오토바이 날치기 사례가 매우 빈번하다.",
      자연재해:
        "일부 지역 지진 위험이 있으며, 화산 활동 지역(시칠리아 등)은 주의가 필요하다.",
      "의료·위생": "의료 수준이 높으나 응급실 대기시간이 길 수 있다.",
      교통: "대중교통 파업이 잦고 스쿠터 통행량이 많아 보행 시 주의한다.",
      "사기·바가지":
        "관광지 인근 식당 바가지 요금, 가짜 팔찌 강매 사기가 흔하다.",
      "정치·시위":
        "간헐적 시위·파업이 발생할 수 있어 교통 통제 정보를 확인한다.",
      "입국·비자": "무비자 90일 이내 체류 가능(솅겐 협정).",
      응급연락처: "경찰 113, 구급 118, 화재 115, 통합 112.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "113(경찰)/118(구급)/115(화재)/112(통합)",
      embassyPhone: "+39-06-802461(주이탈리아한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=75",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "ES",
    countryName: "스페인",
    alertLevel: "여행유의",
    alertLabel: "관광지 소매치기 다발 — 유의 필요",
    scopeType: "REGION",
    scopeText: "바르셀로나·마드리드 등 주요 관광도시",
    categories: buildCategories({
      "치안·범죄":
        "람블라스 거리 등 관광 밀집지에서 소매치기·날치기 피해가 매우 잦다.",
      자연재해: "여름철 폭염, 남동부 일부 지역 가뭄·산불에 유의한다.",
      "의료·위생": "의료 수준이 높으며 응급 상황 시 112로 신고 가능하다.",
      교통: "대중교통이 발달했으나 대도시 소매치기가 전철 내에서도 발생한다.",
      "사기·바가지":
        "가짜 탄원서 서명 유도 후 소매치기, 관광지 바가지 요금에 유의한다.",
      "정치·시위": "카탈루냐 지역 등에서 정치적 시위가 간헐적으로 발생한다.",
      "입국·비자": "무비자 90일 이내 체류 가능(솅겐 협정).",
      응급연락처: "통합 112, 국가경찰 091.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "112(통합)/091(국가경찰)",
      embassyPhone: "+34-91-353-2000(주스페인한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=79",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "US",
    countryName: "미국",
    alertLevel: "여행유의",
    alertLabel: "일부 대도시 총기·강력범죄 유의",
    scopeType: "REGION",
    scopeText: "대도시 우범지역(치안 취약 구역)",
    categories: buildCategories({
      "치안·범죄":
        "일부 대도시 우범지역에서 총기 사건 등 강력범죄 발생 가능성이 있다.",
      자연재해:
        "허리케인(남동부), 산불(서부), 토네이도(중부) 등 지역별 자연재해에 유의한다.",
      "의료·위생":
        "의료 수준은 높으나 진료비가 매우 비싸 여행자보험 가입이 필수적이다.",
      교통: "렌터카 이용이 많아 주별 교통 법규 차이를 사전에 확인해야 한다.",
      "사기·바가지":
        "관광지 인근 바가지 요금, 신용카드 스키밍 사기에 유의한다.",
      "정치·시위": "대도시 중심가에서 정치적 집회·시위가 발생할 수 있다.",
      "입국·비자":
        "ESTA 사전 승인 후 90일 이내 무비자 체류 가능(비자면제프로그램).",
      응급연락처: "통합 911.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "911(통합 긴급)",
      embassyPhone: "+1-202-939-5600(주미국한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=225",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "AU",
    countryName: "호주",
    alertLevel: "안전",
    alertLabel: "특별한 경보 없음 — 자연환경 위험요소 주의",
    scopeType: "COUNTRY",
    scopeText: "전역",
    categories: buildCategories({
      "치안·범죄":
        "전반적으로 치안이 매우 양호하나 야간 유흥가는 소란·취객에 유의한다.",
      자연재해: "산불(여름철), 사이클론(북부) 등 계절성 자연재해에 유의한다.",
      "의료·위생":
        "의료 수준이 높으며 여행자보험 가입 시 응급 진료 이용이 원활하다.",
      교통: "좌측통행이며 장거리 아웃백 운전 시 연료·식수를 충분히 준비한다.",
      "사기·바가지":
        "일부 관광 액티비티 업체의 환불 불가 약관 관련 분쟁 사례가 있다.",
      "정치·시위": "정치적으로 매우 안정적이며 대규모 시위는 드물다.",
      "입국·비자":
        "전자여행허가(ETA) 사전 신청 필요, 관광 목적 최대 3개월 체류.",
      응급연락처: "통합 000.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "000(통합 긴급)",
      embassyPhone: "+61-2-6270-4100(주호주한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=6",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "NZ",
    countryName: "뉴질랜드",
    alertLevel: "안전",
    alertLabel: "특별한 경보 없음 — 자연환경 위험요소 주의",
    scopeType: "COUNTRY",
    scopeText: "전역",
    categories: buildCategories({
      "치안·범죄":
        "치안이 매우 양호하나 렌터카 차량 내 귀중품 도난 사례가 있다.",
      자연재해: "지진대에 위치해 있으며 일부 지역 화산 활동에 유의한다.",
      "의료·위생": "의료 수준이 높으며 여행자보험 가입을 권장한다.",
      교통: "좌측통행이며 산악 도로에서 렌터카 운전 시 서행이 필요하다.",
      "사기·바가지": "액티비티 예약 관련 환불 분쟁 외 큰 사기 사례는 드물다.",
      "정치·시위": "정치적으로 매우 안정적이며 대규모 시위는 드물다.",
      "입국·비자":
        "전자여행허가(NZeTA) 사전 신청 필요, 관광 목적 최대 3개월 체류.",
      응급연락처: "통합 111.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "111(통합 긴급)",
      embassyPhone: "+64-4-473-9073(주뉴질랜드한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=119",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "GB",
    countryName: "영국",
    alertLevel: "여행유의",
    alertLabel: "테러 경계 수준 상시 유지 — 혼잡 지역 주의",
    scopeType: "REGION",
    scopeText: "런던 등 주요 관광지 및 대중교통 혼잡 구역",
    categories: buildCategories({
      "치안·범죄":
        "지하철·관광명소 인근 소매치기, 최근 휴대폰 날치기 사례가 증가했다.",
      자연재해: "대형 자연재해 위험은 낮으나 겨울철 폭풍·홍수에 유의한다.",
      "의료·위생":
        "NHS 응급실 이용 가능하나 대기시간이 길 수 있어 여행자보험이 유용하다.",
      교통: "좌측통행이며 대중교통(튜브) 파업이 잦아 사전 확인이 필요하다.",
      "사기·바가지":
        "관광지 인근 택시 바가지 요금, 가짜 자선 서명 사기에 유의한다.",
      "정치·시위":
        "정기적으로 정치 집회가 발생하며 교통 통제가 동반될 수 있다.",
      "입국·비자": "관광 목적 6개월 이내 무비자 입국 가능.",
      응급연락처: "통합 999/112.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "999(통합 긴급)/112(대체 통합)",
      embassyPhone: "+44-20-7227-5500(주영국한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=91",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "CH",
    countryName: "스위스",
    alertLevel: "안전",
    alertLabel: "특별한 경보 없음 — 산악 안전수칙 준수 권고",
    scopeType: "COUNTRY",
    scopeText: "전역",
    categories: buildCategories({
      "치안·범죄": "치안이 매우 양호하나 관광지 소매치기는 소수 발생한다.",
      자연재해: "산악 지역 눈사태·낙석 위험이 있어 겨울철 등산 시 유의한다.",
      "의료·위생":
        "의료 수준이 매우 높으나 진료비가 비싸 여행자보험 가입이 필수적이다.",
      교통: "대중교통이 매우 정확하며 산악 열차 이용 시 시간표를 사전에 확인한다.",
      "사기·바가지":
        "큰 사기 사례는 드물며 일부 관광지 물가가 매우 높은 편이다.",
      "정치·시위": "정치적으로 매우 안정적이며 대규모 시위는 드물다.",
      "입국·비자": "무비자 90일 이내 체류 가능(솅겐 협정 준회원).",
      응급연락처: "경찰 117, 구급 144, 화재 118.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "117(경찰)/144(구급)/118(화재)",
      embassyPhone: "+41-31-356-2444(주스위스한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=157",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "TW",
    countryName: "대만",
    alertLevel: "안전",
    alertLabel: "특별한 경보 없음 — 태풍철 유의",
    scopeType: "COUNTRY",
    scopeText: "전역",
    categories: buildCategories({
      "치안·범죄": "치안이 매우 양호하며 강력범죄 발생률이 매우 낮다.",
      자연재해: "태풍(7~9월)·지진이 잦으니 기상 정보를 수시로 확인한다.",
      "의료·위생": "의료 수준이 높으며 응급 진료 접근성이 좋다.",
      교통: "대중교통(MRT)이 매우 편리하며 스쿠터 통행량이 많아 보행 시 주의한다.",
      "사기·바가지": "큰 사기 사례는 드물며 야시장 흥정 문화는 일반적이다.",
      "정치·시위": "정치적으로 안정적이며 대규모 시위는 드물다.",
      "입국·비자": "관광 목적 90일 이내 무비자 입국 가능.",
      응급연락처: "경찰 110, 구급·화재 119.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "110(경찰)/119(구급·화재)",
      embassyPhone: "+886-2-2758-8320(주타이베이한국대표부)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=185",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "ID",
    countryName: "인도네시아",
    alertLevel: "여행유의",
    alertLabel: "일부 지역 여행자제 — 발리 등 관광지는 여행유의",
    scopeType: "REGION",
    scopeText: "파푸아 등 일부 지역은 여행자제, 발리·자카르타는 여행유의",
    categories: buildCategories({
      "치안·범죄":
        "관광지 소매치기, 오토바이 날치기 사례가 있어 귀중품 관리에 유의한다.",
      자연재해:
        "환태평양 지진대·화산대에 위치해 지진·화산 분화·쓰나미 위험이 있다.",
      "의료·위생": "대도시 외 지역은 의료 시설이 제한적이라 상비약을 준비한다.",
      교통: "오토바이 통행량이 많고 도로 상태가 열악한 지역이 있어 주의한다.",
      "사기·바가지": "환전 사기, 관광지 바가지 요금 사례가 보고된다.",
      "정치·시위":
        "일부 지역에서 종교·정치적 갈등에 따른 시위가 발생할 수 있다.",
      "입국·비자": "관광 목적 30일 이내 무비자 입국 가능(연장 가능).",
      응급연락처: "경찰 110, 구급 118, 화재 113.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "110(경찰)/118(구급)/113(화재)",
      embassyPhone: "+62-21-2967-2555(주인도네시아한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=101",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "GR",
    countryName: "그리스",
    alertLevel: "안전",
    alertLabel: "특별한 경보 없음 — 여름철 폭염·산불 유의",
    scopeType: "COUNTRY",
    scopeText: "전역",
    categories: buildCategories({
      "치안·범죄":
        "전반적으로 치안이 양호하나 아테네 일부 지역 소매치기에 유의한다.",
      자연재해: "여름철 폭염·산불이 잦으니 야외활동 시 기상 정보를 확인한다.",
      "의료·위생": "의료 수준이 준수하며 응급 진료 접근성이 양호하다.",
      교통: "도서 지역 간 이동은 페리에 의존하며 기상에 따라 결항될 수 있다.",
      "사기·바가지":
        "관광지 인근 식당 바가지 요금, 택시 미터기 미사용 사례가 있다.",
      "정치·시위":
        "간헐적으로 총파업·시위가 발생해 대중교통이 영향을 받을 수 있다.",
      "입국·비자": "무비자 90일 이내 체류 가능(솅겐 협정).",
      응급연락처: "통합 112, 경찰 100, 구급 166.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "112(통합)/100(경찰)/166(구급)",
      embassyPhone: "+30-210-698-4080(주그리스한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=61",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
  {
    countryCode: "TR",
    countryName: "튀르키예",
    alertLevel: "여행유의",
    alertLabel: "국경 인접 지역 여행자제 — 그 외 지역 여행유의",
    scopeType: "REGION",
    scopeText:
      "시리아 국경 인접 남동부 지역은 여행자제, 이스탄불·카파도키아는 여행유의",
    categories: buildCategories({
      "치안·범죄":
        "대도시 관광지 소매치기, 남동부 국경 지역 테러 위험에 유의한다.",
      자연재해: "지진대에 위치해 있으며 대규모 지진 발생 이력이 있다.",
      "의료·위생":
        "대도시는 의료 수준이 양호하나 지방은 시설이 제한적일 수 있다.",
      교통: "장거리 버스 이용이 보편적이며 산악 도로 운전 시 주의가 필요하다.",
      "사기·바가지": "카펫·보석 판매 강매, 택시 바가지 요금 사례가 흔하다.",
      "정치·시위":
        "간헐적으로 정치 집회·시위가 발생할 수 있어 집회 장소를 피한다.",
      "입국·비자":
        "전자비자(e-Visa) 사전 발급 필요, 관광 목적 90일 이내 체류 가능.",
      응급연락처: "경찰 155, 구급 112, 화재 110.",
    }),
    emergencyContacts: {
      localEmergencyNumber: "155(경찰)/112(구급)/110(화재)",
      embassyPhone: "+90-312-468-4822(주튀르키예한국대사관)",
    },
    source: {
      name: "외교부 해외안전여행",
      url: "https://www.0404.go.kr/dev/country.mofa?idx=193",
      verifiedAt: VERIFIED_AT,
      editor: EDITOR,
    },
  },
];

assertValidCountrySafetyDataset(COUNTRY_SAFETY_INFO);

export function getCountrySafetyInfo(
  countryCode: string,
): CountrySafetyInfo | undefined {
  return COUNTRY_SAFETY_INFO.find((info) => info.countryCode === countryCode);
}
