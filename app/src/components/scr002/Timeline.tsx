import { REPRESENTATIVE_PROFILE } from "@/data/representative-profile";

/**
 * CMP-SCR002-TIMELINE — SCR-002 Section 4 "여행 Timeline 6개 이상"(연도·장소·요약).
 *
 * `REPRESENTATIVE_PROFILE.timeline`(8개, `assertValidRepresentativeProfile`가
 * 6개 이상·필드 누락 없음을 모듈 로드 시점에 이미 강제)를 연대순 그대로
 * 렌더링한다(REQ-FUNC-060). 좌측 코랄(`--color-primary`) 타임라인 도트로
 * 세로 흐름을 표현한다(Visual AC).
 */

export default function Timeline() {
  const { timeline } = REPRESENTATIVE_PROFILE;

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <h2 className="text-display-md text-text-primary">여행 Timeline</h2>
      <p className="mt-xs text-body-md text-text-secondary">
        지금까지의 여행을 시간순으로 정리했습니다.
      </p>

      <ol className="mt-lg space-y-lg border-l-2 border-border-strong pl-md">
        {timeline.map((entry, i) => (
          <li key={i} className="relative">
            <span
              aria-hidden
              className="absolute top-1 -left-[calc(1rem+5px)] h-[10px] w-[10px] rounded-pill bg-primary"
            />
            <p className="text-title-sm text-primary">{entry.year}</p>
            <h3 className="mt-xxs text-title-md text-text-primary">
              {entry.place}
            </h3>
            <p className="mt-xxs text-body-sm text-text-secondary">
              {entry.summary}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
