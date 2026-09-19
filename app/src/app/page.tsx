import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DESTINATIONS } from "@/data/destinations";
import type { Destination } from "@/data/destinations.schema";
import HeroSearch from "@/components/scr001/HeroSearch";
import DestinationGrid from "@/components/scr001/DestinationGrid";
import DestinationDrawer from "@/components/scr001/DestinationDrawer";
import ThemeChips from "@/components/scr001/ThemeChips";
import SafetyGrid from "@/components/scr001/SafetyGrid";
import MateTeaser from "@/components/scr001/MateTeaser";
import AboutSummary from "@/components/scr001/AboutSummary";

/**
 * PAGE-SCR001 — SCR-001 메인 페이지 조립(Page Owner).
 *
 * 이 파일은 하위 Component를 새로 만들지 않고 이미 완성된 CMP-SCR001-* Component를
 * import해 7개 Section을 정해진 순서로 조립하기만 한다(`CLAUDE.md` 규칙 9).
 *
 * 여행지 카드 클릭 → 상세 Drawer 열기는 `?destination=<id>` URL 쿼리로 상태를
 * 표현한다. `DestinationGrid`(Client Component)는 Server Component인 이 페이지로부터
 * 일반 클로저 함수를 prop으로 받을 수 없으므로, `"use server"` 인라인 Server Action을
 * 콜백으로 넘긴다 — 이 방식은 새 파일을 만들지 않고 `src/app/page.tsx` 안에서만
 * 해결되므로 "Page Owner는 하위 Component를 새로 만들지 않는다"는 제약을 지킨다.
 * `SafetyGrid`는 자체적으로 `SafetyDrawer` 상태를 관리하므로 여기서 별도로 연결할
 * 필요가 없다.
 */

export const metadata: Metadata = {
  title: {
    default: "Free Traveler — 국내외 여행지·안전정보·동행 찾기",
    template: "%s",
  },
  description:
    "국내외 여행지 정보와 국가별 안전정보를 한눈에 확인하고, 항공·숙소 조건을 정리한 뒤 함께할 동행까지 찾아보세요.",
};

interface HomeProps {
  searchParams: Promise<{ destination?: string }>;
}

function MateTeaserSkeleton() {
  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <div className="h-8 w-40 animate-pulse rounded-sm bg-surface-strong" />
      <div className="mt-lg grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-md bg-surface-soft"
          />
        ))}
      </div>
    </section>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const selectedDestination: Destination | null =
    DESTINATIONS.find((d) => d.id === params.destination) ?? null;

  async function openDestinationDrawer(destination: Destination) {
    "use server";
    redirect(`/?destination=${encodeURIComponent(destination.id)}`);
  }

  async function closeDestinationDrawer() {
    "use server";
    redirect("/");
  }

  return (
    <main>
      {/* ① Hero(검색창 + /travel-tools CTA) */}
      <HeroSearch />

      {/* ② 국내 인기 여행지 Card Grid 6 */}
      <DestinationGrid
        scope="DOMESTIC"
        title="국내에서 먼저 떠나볼 만한 곳"
        description="가까운 국내 여행지 6곳을 골라봤어요. 카드를 눌러 일정과 예산까지 확인하세요."
        onSelectDestination={openDestinationDrawer}
      />

      {/* ③ 해외 인기 여행지 Card Grid 6 */}
      <DestinationGrid
        scope="OVERSEAS"
        title="지금 가장 많이 찾는 해외 도시"
        description="15개국 30개 도시 중 여행자들이 자주 검색하는 6곳입니다."
        onSelectDestination={openDestinationDrawer}
      />

      {/* ④ 여행 동기·테마 Chip 6 */}
      <ThemeChips />

      {/* ⑤ 국가별 주의사항 Card 6 + 안전정보 Drawer(SafetyGrid가 자체 관리) */}
      <SafetyGrid />

      {/* ⑥ 최근 동행글 3 또는 완성형 Empty State — 유일한 실제 비동기 구간이라
          여기에만 Suspense 스켈레톤을 둔다(②~⑤는 정적 데이터라 로딩 구간이 없음) */}
      <Suspense fallback={<MateTeaserSkeleton />}>
        <MateTeaser />
      </Suspense>

      {/* ⑦ free_traveler 소개 요약 + /about CTA */}
      <AboutSummary />

      <DestinationDrawer
        destination={selectedDestination}
        onClose={closeDestinationDrawer}
        onSelectRelated={openDestinationDrawer}
      />
    </main>
  );
}
