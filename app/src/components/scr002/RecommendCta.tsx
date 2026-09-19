import Link from "next/link";
import { REPRESENTATIVE_PROFILE } from "@/data/representative-profile";
import { DESTINATIONS } from "@/data/destinations";

/**
 * CMP-SCR002-RECOMMEND-CTA — SCR-002 Section 7 "기억에 남는 여행지 4곳" +
 * CTA Banner.
 *
 * `REPRESENTATIVE_PROFILE.recommendedDestinationIds`(정확히 4개,
 * `assertValidRepresentativeProfile`가 이미 강제)를 `DESTINATIONS`에서 조회해
 * 조립한다(REQ-FUNC-063, 중복 데이터 보관 금지). 카드는 SCR-001의
 * `?destination=<id>` 프로토콜(`PAGE-SCR001`)로 링크해 상세 Drawer가 열리도록
 * 한다(Visual AC). 별점/평점 배지는 넣지 않는다.
 */

export default function RecommendCta() {
  const recommended = REPRESENTATIVE_PROFILE.recommendedDestinationIds
    .map((id) => DESTINATIONS.find((d) => d.id === id))
    .filter((d): d is NonNullable<typeof d> => d != null);

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <h2 className="text-display-md text-text-primary">
        기억에 남는 여행지
      </h2>
      <p className="mt-xs text-body-md text-text-secondary">
        직접 다녀와서 자신 있게 추천하는 곳들입니다.
      </p>

      <div className="mt-lg grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {recommended.map((destination) => (
          <Link
            key={destination.id}
            href={`/?destination=${encodeURIComponent(destination.id)}`}
            className="group block overflow-hidden rounded-md bg-canvas transition-shadow hover:shadow-card"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element -- 자리표시자 이미지 도메인, next.config.ts 미등록(범위 밖) */}
              <img
                src={destination.images[0].url}
                alt={destination.images[0].alt}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-sm">
              <h3 className="text-title-md text-text-primary">
                {destination.name}
              </h3>
              <p className="mt-xxs text-body-sm text-text-secondary">
                {destination.countryName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-xl flex flex-col items-center gap-sm rounded-md bg-surface-soft px-md py-xl text-center md:flex-row md:justify-center md:gap-lg">
        <Link
          href="/travel-tools"
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          여행 조건 정리
        </Link>
        <Link
          href="/mates"
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary"
        >
          동행 찾기
        </Link>
      </div>
    </section>
  );
}
