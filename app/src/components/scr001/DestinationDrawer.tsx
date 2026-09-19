"use client";

import { useState } from "react";
import { DESTINATIONS } from "@/data/destinations";
import type { Destination } from "@/data/destinations.schema";
import { getCountrySafetyInfo } from "@/data/country-safety";
import { useFavorites } from "@/lib/favorites";
import SafetyDrawer from "./SafetyDrawer";

/**
 * CMP-SCR001-DESTINATION-DRAWER — 여행지 상세 Drawer/Modal.
 *
 * Desktop 우측 480px Drawer / Mobile 전체화면 Modal(DESIGN.md Drawer·Modal
 * 정의, `SafetyDrawer`와 동일한 레이아웃 패턴). "안전정보 보기"는 이미 구현된
 * `SafetyDrawer`를 그대로 재사용해 같은 화면 안에서 전환한다(REQ-FUNC-006:
 * `destination.countryCode` ↔ `CountrySafetyInfo.countryCode` 매칭).
 * 관련 여행지는 같은 국가 또는 겹치는 테마를 가진 여행지 중 최대 6개(REQ-FUNC-009).
 */

const MAX_RELATED = 6;

function getRelatedDestinations(destination: Destination): Destination[] {
  return DESTINATIONS.filter((d) => {
    if (d.id === destination.id) return false;
    const sameCountry = d.countryCode === destination.countryCode;
    const sharesTheme = d.themes.some((theme) =>
      destination.themes.includes(theme),
    );
    return sameCountry || sharesTheme;
  }).slice(0, MAX_RELATED);
}

export interface DestinationDrawerProps {
  destination: Destination | null;
  onClose: () => void;
  onSelectRelated?: (destination: Destination) => void;
}

export default function DestinationDrawer({
  destination,
  onClose,
  onSelectRelated,
}: DestinationDrawerProps) {
  const [showSafety, setShowSafety] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!destination) return null;

  const favorite = isFavorite(destination.id);
  const safetyInfo = getCountrySafetyInfo(destination.countryCode) ?? null;
  const related = getRelatedDestinations(destination);
  const image = destination.images[0];

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${destination.name} 상세`}
        className="absolute inset-0 overflow-y-auto bg-canvas md:inset-y-0 md:right-0 md:left-auto md:w-[480px] md:rounded-l-lg md:shadow-card"
      >
        <div className="flex items-center justify-between border-b border-hairline px-md py-sm">
          <h2 className="text-title-md text-text-primary">
            {destination.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-title-md text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="px-md py-lg">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md">
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

          <p className="mt-md text-body-md text-text-secondary">
            {destination.overview}
          </p>

          <div className="mt-lg">
            <h3 className="text-title-sm text-text-primary">추천 명소</h3>
            <ul className="mt-xs list-disc space-y-xxs pl-lg text-body-sm text-text-secondary">
              {destination.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>

          <div className="mt-lg grid grid-cols-1 gap-md md:grid-cols-2">
            <div>
              <h3 className="text-title-sm text-text-primary">1일 코스</h3>
              <ol className="mt-xs space-y-xxs text-body-sm text-text-secondary">
                {destination.itinerary.oneDay.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-title-sm text-text-primary">3일 코스</h3>
              <ol className="mt-xs space-y-xxs text-body-sm text-text-secondary">
                {destination.itinerary.threeDay.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <dl className="mt-lg space-y-sm">
            <div>
              <dt className="text-title-sm text-text-primary">예산</dt>
              <dd className="mt-xxs text-body-sm text-text-secondary">
                {destination.budgetRange}
              </dd>
            </div>
            <div>
              <dt className="text-title-sm text-text-primary">교통</dt>
              <dd className="mt-xxs text-body-sm text-text-secondary">
                {destination.transport}
              </dd>
            </div>
            <div>
              <dt className="text-title-sm text-text-primary">음식</dt>
              <dd className="mt-xxs text-body-sm text-text-secondary">
                {destination.food.join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-title-sm text-text-primary">에티켓</dt>
              <ul className="mt-xxs list-disc space-y-xxs pl-lg text-body-sm text-text-secondary">
                {destination.etiquette.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </dl>

          {safetyInfo ? (
            <button
              type="button"
              onClick={() => setShowSafety(true)}
              className="mt-lg inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary"
            >
              안전정보 보기
            </button>
          ) : null}

          {related.length > 0 ? (
            <div className="mt-xl">
              <h3 className="text-title-sm text-text-primary">
                이런 여행지는 어때요?
              </h3>
              <ul className="mt-xs space-y-xs">
                {related.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelectRelated?.(r)}
                      className="text-body-sm text-primary"
                    >
                      {r.name} · {r.countryName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-lg text-caption text-text-muted">
            출처: {destination.source} · 최종 수정일: {destination.lastUpdated}
          </p>
        </div>
      </div>

      <SafetyDrawer
        info={showSafety ? safetyInfo : null}
        onClose={() => setShowSafety(false)}
      />
    </div>
  );
}
