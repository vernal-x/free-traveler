import Link from "next/link";

/**
 * CMP-SCR004-REPORT-BLOCK — "안전수칙 요약 + CTA Banner"(REQ-FUNC-080).
 *
 * `/legal/mate-safety`(이미 완료된 TOOL-POLICY-PAGES 산출물) 전문으로 링크하고,
 * 여기서는 핵심 3가지만 요약한다. "서비스는 신원·안전을 보증하지 않는다"는
 * Security/Privacy AC 고지를 상시 노출한다.
 */

const SUMMARY_POINTS = [
  "만나기 전 공개 장소에서 먼저 인사하고, 서두르지 마세요.",
  "전화번호·메신저 ID 등 개인 연락처는 신중하게 공유하세요.",
  "불편하거나 위험하다고 느껴지면 즉시 신고하거나 차단하세요.",
];

export default function SafetyBanner() {
  return (
    <section className="mx-auto max-w-[1240px] px-md py-md">
      <div className="rounded-md bg-surface-soft px-md py-lg">
        <h2 className="text-title-md text-text-primary">
          안전한 동행을 위한 안내
        </h2>
        <ul className="mt-sm space-y-xxs text-body-sm text-text-secondary">
          {SUMMARY_POINTS.map((point) => (
            <li key={point}>· {point}</li>
          ))}
        </ul>
        <p className="mt-sm text-caption text-text-muted">
          free_traveler는 회원 간 매칭을 중개할 뿐, 상대방의 신원이나 여행 중
          안전을 보증하지 않습니다.
        </p>

        <div className="mt-md flex flex-col items-start gap-xs sm:flex-row sm:items-center sm:gap-md">
          <Link
            href="/legal/mate-safety"
            className="text-button text-primary underline"
          >
            동행 안전수칙 전문 보기
          </Link>
          <Link
            href="/travel-tools"
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
          >
            여행 조건도 정리하기
          </Link>
        </div>
      </div>
    </section>
  );
}
