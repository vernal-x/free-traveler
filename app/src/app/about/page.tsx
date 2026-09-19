import type { Metadata } from "next";
import ProfileHero from "@/components/scr002/ProfileHero";
import IntroPhilosophy from "@/components/scr002/IntroPhilosophy";
import Timeline from "@/components/scr002/Timeline";
import CountryChips from "@/components/scr002/CountryChips";
import Gallery from "@/components/scr002/Gallery";
import RecommendCta from "@/components/scr002/RecommendCta";

/**
 * PAGE-SCR002 — SCR-002 대표 소개 페이지 조립(Page Owner).
 *
 * 하위 Component를 새로 만들지 않고 이미 완성된 CMP-SCR002-* Component를
 * import해 7개 Section을 정해진 순서로 조립하기만 한다(`CLAUDE.md` 규칙 9).
 * 모든 Component가 `REPRESENTATIVE_PROFILE` 정적 데이터만 동기적으로 읽는
 * Server Component라 SCR-001과 달리 Client 상태·콜백 연결이 필요 없다.
 */

export const metadata: Metadata = {
  title: "free_traveler 소개 — 여행 큐레이터 강지우",
  description:
    "50개국 넘게 다녀온 여행 큐레이터가 직접 다녀온 곳만 소개합니다. 여행 지표, 철학, Timeline, 방문 국가, 사진, 추천 여행지를 확인하세요.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "free_traveler 소개 — 여행 큐레이터 강지우",
    description:
      "50개국 넘게 다녀온 여행 큐레이터가 직접 다녀온 곳만 소개합니다.",
    type: "profile",
  },
};

export default function AboutPage() {
  return (
    <main>
      {/* ① Profile Hero + ② 여행 지표 카드 3개 */}
      <ProfileHero />

      {/* ③ 소개·철학 2~4문단 */}
      <IntroPhilosophy />

      {/* ④ 여행 Timeline 최소 6개 시점 */}
      <Timeline />

      {/* ⑤ 방문 국가 Chip 최소 30개, 권역별 그룹 */}
      <CountryChips />

      {/* ⑥ 여행 사진 Gallery 최소 8장 */}
      <Gallery />

      {/* ⑦ 기억에 남는 여행지 4개 Card + CTA Banner */}
      <RecommendCta />
    </main>
  );
}
