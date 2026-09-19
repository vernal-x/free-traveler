import type { Metadata } from "next";
import TravelToolsIntro from "@/components/scr003/TravelToolsIntro";
import Tabs from "@/components/scr003/Tabs";
import FlightForm from "@/components/scr003/FlightForm";
import HotelForm from "@/components/scr003/HotelForm";
import DisclosureTips from "@/components/scr003/DisclosureTips";
import MateComposer from "@/components/scr003/MateComposer";

/**
 * PAGE-SCR003 — SCR-003 통합 여행 준비 페이지 조립(Page Owner).
 *
 * 하위 Component를 새로 만들지 않고 이미 완성된 CMP-SCR003-* Component를
 * import해 6개 Section을 조립한다(`CLAUDE.md` 규칙 9). Section ③④(조건 입력
 * Form+요약·외부이동)와 ⑤(비전달 고지+Tip)는 항공/숙소 탭에서만 의미가 있어
 * 각 탭 콘텐츠 안에 함께 넣고, Section ⑥(동행 작성)은 동행 탭 콘텐츠로 넣는다
 * (`design-reference/SCREEN_ROUTE_CONTRACT.json`의 `section_order`와 일치).
 * `Tabs`가 비활성 탭도 DOM에 유지하므로(`hidden` 속성) 탭 전환 시 각 탭의
 * 입력값이 사라지지 않는다(TC-2, `CMP-SCR003-INTRO-TABS`가 이미 보장).
 */

export const metadata: Metadata = {
  title: "여행 준비 도구 — 항공·숙소·동행 찾기",
  description:
    "항공편·숙소 조건을 정리해 외부 사이트에서 비교하고, 함께 여행할 동행도 찾아보세요.",
  alternates: { canonical: "/travel-tools" },
  openGraph: {
    title: "여행 준비 도구 — 항공·숙소·동행 찾기",
    description: "항공편·숙소 조건을 정리하고 동행을 찾는 통합 여행 준비 도구.",
    type: "website",
  },
};

export default function TravelToolsPage() {
  return (
    <main>
      <TravelToolsIntro />
      <Tabs
        flightContent={
          <>
            <FlightForm />
            <DisclosureTips />
          </>
        }
        hotelContent={
          <>
            <HotelForm />
            <DisclosureTips />
          </>
        }
        mateContent={<MateComposer />}
      />
    </main>
  );
}
