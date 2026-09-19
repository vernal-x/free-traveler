"use client";

import { useState, type ReactNode } from "react";

/**
 * CMP-SCR003-INTRO-TABS — SCR-003 Section 2 "Tab 셸(항공편/숙소/동행 구하기)".
 *
 * 탭 id·라벨은 `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `screens[].tabs`
 * (flight/hotel/mate)와 고정 1:1 대응한다. 실제 폼 콘텐츠는 이후 CMP-SCR003-* Task가
 * 채우므로 이 컴포넌트는 각 탭의 콘텐츠를 prop으로만 받는다. "탭 전환 시 다른 탭
 * 입력값 유지"(Functional AC)를 위해 비활성 탭도 DOM에서 언마운트하지 않고
 * `hidden` 속성으로만 감춘다 — 각 탭 콘텐츠 내부 상태(폼 입력값)가 탭 전환으로
 * 사라지지 않는다.
 */

export interface TabsProps {
  flightContent: ReactNode;
  hotelContent: ReactNode;
  mateContent: ReactNode;
}

const TAB_ITEMS = [
  { id: "flight", label: "항공편" },
  { id: "hotel", label: "숙소" },
  { id: "mate", label: "동행 구하기" },
] as const;

type TabId = (typeof TAB_ITEMS)[number]["id"];

export default function Tabs({
  flightContent,
  hotelContent,
  mateContent,
}: TabsProps) {
  const [active, setActive] = useState<TabId>("flight");
  const contentByTab: Record<TabId, ReactNode> = {
    flight: flightContent,
    hotel: hotelContent,
    mate: mateContent,
  };

  return (
    <div className="mx-auto max-w-[1240px] px-md">
      <div
        role="tablist"
        aria-label="여행 준비 탭"
        className="flex w-full border-b border-hairline sm:w-auto sm:gap-lg"
      >
        {TAB_ITEMS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`flex-1 border-b-2 px-sm py-sm text-title-sm sm:flex-none ${
                isActive
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-muted"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {TAB_ITEMS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="py-lg"
        >
          {contentByTab[tab.id]}
        </div>
      ))}
    </div>
  );
}
