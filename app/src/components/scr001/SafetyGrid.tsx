"use client";

import { useState } from "react";
import { COUNTRY_SAFETY_INFO } from "@/data/country-safety";
import type { CountrySafetyInfo } from "@/data/country-safety.schema";
import SafetyDrawer from "./SafetyDrawer";

/**
 * CMP-SCR001-SAFETY-GRID-DRAWER — SCR-001 Section 5 "국가별 주의사항"
 * Card Grid(`docs/04_UIUX_PLAN.md` 큐레이션 6개국) + Drawer 연결.
 *
 * REQ-FUNC-006: `Destination.countryCode`와 `CountrySafetyInfo.countryCode`가
 * 같은 값 공간(ISO 3166-1 alpha-2)을 쓰므로 두 그리드가 항상 같은 국가 코드로
 * 매칭된다.
 */

const FEATURED_COUNTRY_CODES = ["JP", "TH", "VN", "FR", "IT", "US"] as const;

const ALERT_BADGE_CLASS: Record<CountrySafetyInfo["alertLevel"], string> = {
  안전: "bg-success text-on-primary",
  여행유의: "bg-info text-on-primary",
  여행자제: "bg-warning text-on-primary",
  출국권고: "bg-danger text-on-primary",
  여행금지: "bg-danger-strong text-on-primary",
};

export default function SafetyGrid() {
  const [selected, setSelected] = useState<CountrySafetyInfo | null>(null);

  const featured = FEATURED_COUNTRY_CODES.map((code) =>
    COUNTRY_SAFETY_INFO.find((info) => info.countryCode === code),
  ).filter((info): info is CountrySafetyInfo => Boolean(info));

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <h2 className="text-display-md text-text-primary">
        출국 전 꼭 확인할 국가별 안전정보
      </h2>
      <p className="mt-xs text-body-md text-text-secondary">
        치안, 법규, 재난·보건 정보를 외교부 공식 자료와 함께 확인하세요.
      </p>

      <div className="mt-lg grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {featured.map((info) => (
          <button
            key={info.countryCode}
            type="button"
            onClick={() => setSelected(info)}
            className="rounded-md bg-canvas p-sm text-left shadow-none transition-shadow hover:shadow-card"
          >
            <span
              className={`inline-flex items-center rounded-pill px-xs py-0 text-badge ${ALERT_BADGE_CLASS[info.alertLevel]}`}
            >
              {info.alertLevel}
            </span>
            <h3 className="mt-xs text-title-md text-text-primary">
              {info.countryName}
            </h3>
            <p className="mt-xxs text-caption text-text-muted">
              최종 확인일: {info.source.verifiedAt}
            </p>
          </button>
        ))}
      </div>

      <SafetyDrawer info={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
