"use client";

import { useFavorites } from "@/lib/favorites";
import type { Destination } from "@/data/destinations.schema";

/**
 * CMP-SCR001-DESTINATION-GRIDS — 여행지 카드(`component.destination-card`).
 *
 * DESIGN.md 구조: 대표 이미지 → 제목 → 메타 설명 1줄 → 텍스트 CTA. 가격 배지,
 * 별점, "Guest favorite"류 배지는 넣지 않는다(Do Not). 즐겨찾기 토글은
 * `useFavorites()`(localStorage만, REQ-FUNC-068)로 처리하고 서버로 전송하지
 * 않는다. 상세 Drawer는 `CMP-SCR001-DESTINATION-DRAWER`(다른 Task, 아직 미구현)의
 * 몫이라 `onSelect`는 선택적 콜백으로만 열어 둔다.
 */

export interface DestinationCardProps {
  destination: Destination;
  onSelect?: (destination: Destination) => void;
}

export default function DestinationCard({
  destination,
  onSelect,
}: DestinationCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(destination.id);
  const image = destination.images[0];

  return (
    <article className="group overflow-hidden rounded-md bg-canvas shadow-none transition-shadow hover:shadow-card">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element -- 자리표시자 이미지 도메인, next.config.ts 미등록(범위 밖) */}
        <img
          src={image.url}
          alt={image.alt}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => toggleFavorite(destination.id)}
          aria-pressed={favorite}
          aria-label={favorite ? "즐겨찾기에서 제거" : "즐겨찾기에 추가"}
          className="absolute right-xs top-xs flex h-9 w-9 items-center justify-center rounded-pill bg-canvas/90 text-title-md text-primary"
        >
          <span aria-hidden>{favorite ? "♥" : "♡"}</span>
        </button>
      </div>

      <div className="p-sm">
        <h3 className="text-title-md text-text-primary">{destination.name}</h3>
        <p className="mt-xxs truncate text-body-sm text-text-secondary">
          {destination.bestSeason}
        </p>
        <button
          type="button"
          onClick={() => onSelect?.(destination)}
          className="mt-xs text-button text-primary"
        >
          3일 코스 보기
        </button>
      </div>
    </article>
  );
}
