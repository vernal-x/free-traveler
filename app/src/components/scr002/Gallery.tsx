import { REPRESENTATIVE_PROFILE } from "@/data/representative-profile";

/**
 * CMP-SCR002-GALLERY — SCR-002 Section 6 "여행 사진 Gallery 8장 이상".
 *
 * `REPRESENTATIVE_PROFILE.gallery`(9장, `assertValidRepresentativeProfile`가
 * 8장 이상·alt 필수를 모듈 로드 시점에 이미 강제)를 그대로 렌더링한다(REQ-FUNC-061,
 * 축소 범위 — 라이선스 승인 워크플로 없음). 별점/평점 배지는 넣지 않는다(재발
 * 방지 — 2026-09-15 발견 항목).
 */

export default function Gallery() {
  const { gallery } = REPRESENTATIVE_PROFILE;

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <h2 className="text-display-md text-text-primary">여행 사진</h2>
      <p className="mt-xs text-body-md text-text-secondary">
        직접 다녀온 곳에서 남긴 순간들입니다.
      </p>

      <div className="mt-lg grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {gallery.map((image) => (
          <figure
            key={image.url}
            className="overflow-hidden rounded-md bg-surface-soft"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- 자리표시자 이미지 도메인, next.config.ts 미등록(범위 밖) */}
              <img
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
            </div>
            {image.caption ? (
              <figcaption className="px-xs py-xxs text-caption text-text-muted">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
