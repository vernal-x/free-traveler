import Link from "next/link";
import { REPRESENTATIVE_PROFILE } from "@/data/representative-profile";

/**
 * CMP-SCR001-ABOUT-SUMMARY — SCR-001 Section 7 "free_traveler 소개 요약".
 *
 * `50+ Trips`/`30+ Countries`는 `representative-profile.ts`(단일 정적 데이터
 * 소스)에서만 가져와, SCR-002 대표 소개 페이지와 항상 같은 값을 보여준다
 * (REQ-FUNC-057). 좌우 분할 레이아웃(Visual AC), "대표 소개 보러가기" CTA는
 * SCR-002(`/about`)로 이동한다.
 *
 * `next/image` 대신 일반 `<img>`를 쓴다 — 데이터의 이미지 URL은 아직 실제 CDN이
 * 아닌 자리표시자 도메인이라(`src/data/representative-profile.ts` 주석 참고)
 * `next.config.ts`의 `images.remotePatterns`에 없고, 그 파일은 이 Task의 Expected
 * Files 밖이라 지금 등록할 수 없다.
 */
export default function AboutSummary() {
  const { name, tagline, heroImage, tripsCount, countriesCount } =
    REPRESENTATIVE_PROFILE;

  return (
    <section className="mx-auto grid max-w-[1240px] gap-xl px-md py-section-mobile md:grid-cols-2 md:items-center md:py-section-desktop">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element -- 자리표시자 도메인, next.config.ts 미등록(범위 밖) */}
        <img
          src={heroImage.url}
          alt={heroImage.alt}
          className="h-full w-full object-cover"
        />
      </div>

      <div>
        <p className="text-title-sm text-text-muted">free_traveler 소개</p>
        <h2 className="mt-xs text-display-lg text-text-primary">{name}</h2>
        <p className="mt-xs text-body-md text-text-secondary">{tagline}</p>

        <dl className="mt-lg flex gap-xl">
          <div>
            <dt className="text-body-sm text-text-muted">누적 여행</dt>
            <dd className="text-display-md text-primary">
              {tripsCount}+ Trips
            </dd>
          </div>
          <div>
            <dt className="text-body-sm text-text-muted">방문 국가</dt>
            <dd className="text-display-md text-primary">
              {countriesCount}+ Countries
            </dd>
          </div>
        </dl>

        <Link
          href="/about"
          className="mt-lg inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          대표 소개 보러가기
        </Link>
      </div>
    </section>
  );
}
