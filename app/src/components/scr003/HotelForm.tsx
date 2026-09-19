"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DESTINATIONS } from "@/data/destinations";
import {
  validateHotelDates,
  hasDateRangeErrors,
} from "@/lib/validation/travel-dates";

/**
 * CMP-SCR003-HOTEL-FORM — SCR-003 Section 3/4 "숙소 조건 입력 Form + 요약·외부
 * 이동"(숙소 탭 전용). `CMP-SCR003-FLIGHT-FORM`과 동일 패턴이며, 체크인/체크아웃
 * 검증 규칙과 `HOTEL_OUTBOUND_URL` 키만 다르다(Functional AC).
 *
 * 국가·지역은 `DATA-DESTINATIONS`에서 국가별로 묶어 재사용한다(REQ-FUNC-019·020).
 * 입력값은 이 컴포넌트의 React 상태로만 존재하며 서버 API·DB·로그로 전달하지
 * 않는다(DEC-007, REQ-FUNC-025). 외부 이동 URL은 `external_link_settings_public`
 * View(공개 읽기 전용)에서 가져오며, 이동 시 URL에 입력값을 붙이지 않는다.
 */

const COUNTRY_GROUPS = (() => {
  const map = new Map<string, { countryName: string; regions: string[] }>();
  for (const d of DESTINATIONS) {
    if (!map.has(d.countryCode)) {
      map.set(d.countryCode, { countryName: d.countryName, regions: [] });
    }
    map.get(d.countryCode)!.regions.push(d.name);
  }
  return Array.from(map.entries()).map(([countryCode, v]) => ({
    countryCode,
    countryName: v.countryName,
    regions: v.regions,
  }));
})();

type OutboundUrlState =
  | { status: "loading" }
  | { status: "success"; url: string }
  | { status: "error" };

async function fetchOutboundUrl(): Promise<string | null> {
  const client = createClient();
  const { data, error } = await client
    .from("external_link_settings_public")
    .select("url")
    .eq("key", "HOTEL_OUTBOUND_URL")
    .maybeSingle();
  if (error || !data?.url) return null;
  return data.url;
}

export default function HotelForm() {
  const [countryCode, setCountryCode] = useState(
    COUNTRY_GROUPS[0]?.countryCode ?? "",
  );
  const [region, setRegion] = useState(COUNTRY_GROUPS[0]?.regions[0] ?? "");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [outbound, setOutbound] = useState<OutboundUrlState>({
    status: "loading",
  });
  const [retryCount, setRetryCount] = useState(0);

  const regions = useMemo(
    () =>
      COUNTRY_GROUPS.find((g) => g.countryCode === countryCode)?.regions ?? [],
    [countryCode],
  );

  useEffect(() => {
    let cancelled = false;
    fetchOutboundUrl().then((url) => {
      if (cancelled) return;
      setOutbound(url ? { status: "success", url } : { status: "error" });
    });
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  function handleCountryChange(nextCountryCode: string) {
    setCountryCode(nextCountryCode);
    const nextRegions =
      COUNTRY_GROUPS.find((g) => g.countryCode === nextCountryCode)?.regions ??
      [];
    setRegion(nextRegions[0] ?? "");
  }

  function handleRetry() {
    setOutbound({ status: "loading" });
    setRetryCount((t) => t + 1);
  }

  const dateErrors =
    checkInDate && checkOutDate
      ? validateHotelDates(checkInDate, checkOutDate)
      : {};
  const hasErrors = hasDateRangeErrors(dateErrors);
  const canSearch =
    countryCode &&
    region &&
    checkInDate &&
    checkOutDate &&
    !hasErrors &&
    outbound.status === "success";

  const countryName =
    COUNTRY_GROUPS.find((g) => g.countryCode === countryCode)?.countryName ??
    "";

  return (
    <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
      <form
        className="space-y-md"
        onSubmit={(e) => e.preventDefault()}
        aria-label="숙소 조건 입력"
      >
        <div>
          <label
            htmlFor="hotel-country"
            className="block text-title-sm text-text-primary"
          >
            국가
          </label>
          <select
            id="hotel-country"
            value={countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          >
            {COUNTRY_GROUPS.map((g) => (
              <option key={g.countryCode} value={g.countryCode}>
                {g.countryName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="hotel-region"
            className="block text-title-sm text-text-primary"
          >
            지역
          </label>
          <select
            id="hotel-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="hotel-checkin"
            className="block text-title-sm text-text-primary"
          >
            체크인
          </label>
          <input
            id="hotel-checkin"
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            aria-describedby="hotel-checkin-error"
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
          {dateErrors.start ? (
            <p
              id="hotel-checkin-error"
              className="mt-xxs text-caption text-danger"
            >
              {dateErrors.start}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="hotel-checkout"
            className="block text-title-sm text-text-primary"
          >
            체크아웃
          </label>
          <input
            id="hotel-checkout"
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            aria-describedby="hotel-checkout-error"
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
          {dateErrors.end ? (
            <p
              id="hotel-checkout-error"
              className="mt-xxs text-caption text-danger"
            >
              {dateErrors.end}
            </p>
          ) : null}
        </div>
      </form>

      <div className="rounded-md border border-hairline p-sm">
        <h3 className="text-title-sm text-text-primary">입력 요약</h3>
        {countryName && region && checkInDate && checkOutDate ? (
          <p className="mt-xs text-body-sm text-text-secondary">
            {countryName} {region} · {checkInDate} ~ {checkOutDate}
          </p>
        ) : (
          <p className="mt-xs text-body-sm text-text-muted">
            국가·지역·날짜를 모두 입력하면 요약이 표시됩니다.
          </p>
        )}

        <p className="mt-sm text-caption text-text-muted">
          입력하신 조건은 이 브라우저에만 임시로 유지되며 서버로 전송되거나
          저장되지 않습니다.
        </p>

        {outbound.status === "error" ? (
          <div className="mt-md rounded-sm bg-danger/10 px-sm py-sm">
            <p className="text-body-sm text-danger">
              현재 외부 사이트에 연결할 수 없어요.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-xs text-button text-primary"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!canSearch}
            onClick={() => {
              if (outbound.status !== "success") return;
              window.open(outbound.url, "_blank", "noopener,noreferrer");
            }}
            className="mt-md inline-flex min-h-[44px] w-full items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
          >
            숙소 보러 가기
          </button>
        )}
      </div>
    </div>
  );
}
