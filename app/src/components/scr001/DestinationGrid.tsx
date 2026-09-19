"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";
import type { Destination, DestinationScope } from "@/data/destinations.schema";
import DestinationCard from "./DestinationCard";

/**
 * CMP-SCR001-DESTINATION-GRIDS — 국내/해외 여행지 Card Grid(Section 2·3 공용).
 *
 * 필터 상태는 URL 쿼리(`theme`, `q`)로 반영한다(REQ-FUNC-010) — `CMP-SCR001-
 * THEME-CHIPS`(테마 Chip)와 `CMP-SCR001-HERO`(검색창)가 각각 이 쿼리를 설정하는
 * 형제 컴포넌트이며, 이 컴포넌트는 그 값을 읽기만 한다(prop drilling 없이
 * URL을 공유 상태로 사용). `useSearchParams`는 Suspense 경계가 필요해
 * 내부에서 자체적으로 감싼다.
 *
 * 필터가 전혀 없을 때는 `docs/04_UIUX_PLAN.md`가 지정한 큐레이션 6곳만 보여주고
 * (REQ-FUNC-001 scope 분리 + "국내 인기"/"해외 인기" 큐레이션 카피와 일치),
 * 필터가 하나라도 있으면 scope 전체에서 AND 조건으로 걸러 보여준다(REQ-FUNC-002).
 * 결과가 0건이면 안내 문구 + 필터 초기화 버튼을 보여준다(REQ-FUNC-005).
 */

const FEATURED_IDS: Record<DestinationScope, string[]> = {
  DOMESTIC: [
    "kr-seoul",
    "kr-busan",
    "kr-jeju",
    "kr-gangneung",
    "kr-gyeongju",
    "kr-jeonju",
  ],
  OVERSEAS: [
    "jp-tokyo",
    "th-bangkok",
    "vn-danang",
    "fr-paris",
    "it-rome",
    "id-bali",
  ],
};

function matchesKeyword(destination: Destination, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  return (
    destination.name.toLowerCase().includes(needle) ||
    destination.countryName.toLowerCase().includes(needle) ||
    destination.keywords.some((k) => k.toLowerCase().includes(needle))
  );
}

export interface DestinationGridProps {
  scope: DestinationScope;
  title: string;
  description?: string;
  onSelectDestination?: (destination: Destination) => void;
}

function DestinationGridInner({
  scope,
  title,
  description,
  onSelectDestination,
}: DestinationGridProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") ?? "";
  const keyword = searchParams.get("q") ?? "";
  const hasFilter = theme.length > 0 || keyword.length > 0;

  const destinations = useMemo(() => {
    const scoped = DESTINATIONS.filter((d) => d.scope === scope);

    if (!hasFilter) {
      const featured = FEATURED_IDS[scope]
        .map((id) => scoped.find((d) => d.id === id))
        .filter((d): d is Destination => Boolean(d));
      if (featured.length > 0) return featured;
    }

    return scoped.filter((d) => {
      const matchesTheme = theme
        ? (d.themes as readonly string[]).includes(theme)
        : true;
      return matchesTheme && matchesKeyword(d, keyword);
    });
  }, [scope, theme, keyword, hasFilter]);

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <h2 className="text-display-md text-text-primary">{title}</h2>
      {description ? (
        <p className="mt-xs text-body-md text-text-secondary">{description}</p>
      ) : null}

      {destinations.length === 0 ? (
        <div className="mt-lg rounded-md bg-surface-soft px-md py-xxl text-center">
          <p className="text-title-md text-text-primary">
            조건에 맞는 여행지가 없어요
          </p>
          <p className="mt-xs text-body-sm text-text-secondary">
            다른 테마나 검색어로 다시 찾아보세요.
          </p>
          <Link
            href={pathname}
            className="mt-md inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary"
          >
            필터 초기화
          </Link>
        </div>
      ) : (
        <div className="mt-lg grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onSelect={onSelectDestination}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function DestinationGrid(props: DestinationGridProps) {
  return (
    <Suspense fallback={null}>
      <DestinationGridInner {...props} />
    </Suspense>
  );
}
