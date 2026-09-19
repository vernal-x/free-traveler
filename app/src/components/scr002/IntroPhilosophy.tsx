import { REPRESENTATIVE_PROFILE } from "@/data/representative-profile";

/**
 * CMP-SCR002-INTRO-PHILOSOPHY — SCR-002 Section 3 "소개·철학"(자기소개→계기→
 * 철학 인용→편집 원칙 순 2~4문단).
 *
 * `REPRESENTATIVE_PROFILE.philosophy`(4문단, `assertValidRepresentativeProfile`가
 * 2~4문단·빈 문단 없음을 모듈 로드 시점에 이미 강제)를 순서 그대로 표시한다
 * (REQ-FUNC-058). 우측 사진은 별도 데이터 필드가 없어 `gallery[0]`을 재사용한다
 * (중복 데이터를 새로 만들지 않음).
 */

export default function IntroPhilosophy() {
  const { philosophy, gallery } = REPRESENTATIVE_PROFILE;
  const sideImage = gallery[0];

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <div className="grid grid-cols-1 gap-lg md:grid-cols-2 md:items-center md:gap-xl">
        <div className="order-2 space-y-md md:order-1">
          {philosophy.map((paragraph, i) => (
            <p
              key={i}
              className="text-body-md text-text-secondary whitespace-pre-line"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="order-1 overflow-hidden rounded-md md:order-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- 자리표시자 이미지 도메인, next.config.ts 미등록(범위 밖) */}
          <img
            src={sideImage.url}
            alt={sideImage.alt}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
