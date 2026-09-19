import Link from "next/link";

/**
 * CMP-SCR003-DISCLOSURE-TIPS — SCR-003 Section 5 "입력값 비전달 고지 + 여행 팁
 * Card 3개".
 *
 * REQ-FUNC-015/017/023/025: 국가·지역·날짜 입력값이 서버 API·DB·로그로 전달되지
 * 않는다는 고지를 상시 노출한다(DEC-007). REQ-FUNC-054: 항공 요약이 공식 가격·
 * 일정 확정을 대체하지 않는다는 고지도 함께 둔다. 안전정보 팁은 SCR-001(`/`)로
 * 이동해 이용자가 직접 국가를 골라 안전정보 Drawer를 열어보도록 안내한다(이
 * Task의 Expected Files는 이 파일 하나뿐이라, SCR-001의 `SafetyGrid`에 특정
 * 국가로 자동 진입하는 URL 파라미터를 새로 만들지 않는다).
 */

const TIPS = [
  {
    title: "항공권은 최적 시기에 검색하세요",
    desc: "출발일보다 너무 이르거나 임박한 검색은 가격 변동 폭이 큽니다. 보통 출발 1~3개월 전이 비교적 안정적입니다.",
  },
  {
    title: "숙소는 교통 접근성부터 확인하세요",
    desc: "공항·기차역·주요 관광지까지의 이동 수단과 소요 시간을 먼저 확인하면 숙소 선택이 쉬워집니다.",
  },
  {
    title: "떠나기 전 안전정보를 다시 확인하세요",
    desc: "출국 전 최신 안전정보를 다시 확인하세요.",
    href: "/",
    linkLabel: "안전정보 확인하기",
  },
];

export default function DisclosureTips() {
  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <p className="rounded-md bg-surface-soft px-sm py-sm text-body-sm text-text-secondary">
        입력하신 국가·지역·날짜 정보는 서버로 전송되거나 저장되지 않으며, 이
        브라우저에서만 임시로 사용됩니다. 위 요약은 참고용이며 실제 가격·일정은
        이동한 외부 사이트에서 반드시 다시 확인하세요.
      </p>

      <div className="mt-lg grid grid-cols-1 gap-4 md:grid-cols-3">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="rounded-md border border-hairline p-sm"
          >
            <h3 className="text-title-sm text-text-primary">{tip.title}</h3>
            <p className="mt-xxs text-body-sm text-text-secondary">
              {tip.desc}
            </p>
            {tip.href ? (
              <Link
                href={tip.href}
                className="mt-xs inline-block text-button text-primary"
              >
                {tip.linkLabel}
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
