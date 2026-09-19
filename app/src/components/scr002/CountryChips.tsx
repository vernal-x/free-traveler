import { REPRESENTATIVE_PROFILE } from "@/data/representative-profile";

/**
 * CMP-SCR002-COUNTRIES-CHIPS — SCR-002 Section 5 "방문 국가 Chip 30개".
 *
 * `REPRESENTATIVE_PROFILE.visitedCountries`(4권역, 총 정확히 30개국 —
 * `assertValidRepresentativeProfile`가 모듈 로드 시점에 이미 강제)를 그대로
 * 렌더링한다. 필터링 등 상호작용이 없는 순수 표시 Section이라 Server Component로
 * 유지한다(REQ-FUNC-059).
 */

export default function CountryChips() {
  const { visitedCountries } = REPRESENTATIVE_PROFILE;

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <h2 className="text-display-md text-text-primary">
        지금까지 다녀온 {REPRESENTATIVE_PROFILE.countriesCount}개국
      </h2>
      <p className="mt-xs text-body-md text-text-secondary">
        {REPRESENTATIVE_PROFILE.continentsCount}개 대륙을 두 발로 직접
        걸었습니다.
      </p>

      <div className="mt-lg space-y-md">
        {visitedCountries.map((group) => (
          <div key={group.region}>
            <h3 className="text-title-sm text-text-primary">{group.region}</h3>
            <div className="mt-xs flex gap-xs overflow-x-auto md:flex-wrap md:overflow-visible">
              {group.countries.map((country) => (
                <span
                  key={country}
                  className="shrink-0 rounded-pill bg-surface-soft px-md py-xs text-body-sm text-text-secondary"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
