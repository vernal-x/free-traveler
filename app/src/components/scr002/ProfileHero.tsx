import { REPRESENTATIVE_PROFILE } from "@/data/representative-profile";

/**
 * CMP-SCR002-HERO-STATS — SCR-002 Section 1 "Profile Hero" + Section 2
 * "여행 지표 카드 3개"(`50+ Trips`/`30+ Countries`/대륙 수).
 *
 * `REPRESENTATIVE_PROFILE`(단일 정적 데이터 소스)만 표시하며 별도 상호작용이
 * 없어 Server Component로 유지한다(REQ-FUNC-057). Hero는 뷰포트의 55~65%만
 * 채운다(Visual AC) — `min-h-[55vh] md:min-h-[60vh]`로 근사한다.
 */

export default function ProfileHero() {
  const {
    name,
    tagline,
    heroImage,
    tripsCount,
    countriesCount,
    continentsCount,
  } = REPRESENTATIVE_PROFILE;

  const stats = [
    { label: "Trips", value: `${tripsCount}+` },
    { label: "Countries", value: `${countriesCount}+` },
    { label: "Continents", value: `${continentsCount}` },
  ];

  return (
    <section className="relative flex min-h-[55vh] flex-col justify-end overflow-hidden md:min-h-[60vh]">
      {/* eslint-disable-next-line @next/next/no-img-element -- 자리표시자 이미지 도메인, next.config.ts 미등록(범위 밖) */}
      <img
        src={heroImage.url}
        alt={heroImage.alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1240px] px-md pb-lg pt-xl text-on-primary">
        <h1 className="text-display-xl">{name}</h1>
        <p className="mt-xs text-body-md">{tagline}</p>

        <div className="mt-lg grid grid-cols-3 gap-3 md:max-w-[560px] md:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md bg-canvas/15 px-sm py-md text-center backdrop-blur-sm"
            >
              <p className="text-display-md">{stat.value}</p>
              <p className="mt-xxs text-caption text-on-primary/80">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
