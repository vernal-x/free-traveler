"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DESTINATIONS } from "@/data/destinations";
import {
  validateFlightDates,
  hasDateRangeErrors,
} from "@/lib/validation/travel-dates";

/**
 * CMP-SCR003-FLIGHT-FORM — SCR-003 Section 3/4 "항공 조건 입력 Form + 요약·외부
 * 이동"(항공편 탭 전용).
 *
 * 국가·지역은 `DATA-DESTINATIONS`(`src/data/destinations.ts`)에서 국가별로 묶어
 * 재사용한다(REQ-FUNC-011, 새 국가/지역 데이터를 따로 만들지 않음). 입력값(국가·
 * 지역·날짜)은 이 컴포넌트의 React 상태로만 존재하며 어떤 서버 API·DB·로그로도
 * 전달하지 않는다(DEC-007, REQ-FUNC-017). 외부 이동 URL은 관리자가 설정하는
 * `external_link_settings_public` View(공개 읽기 전용, RLS로 기본 테이블은
 * Admin만 쓰기 가능)에서 가져오며, 이동 시 URL에 입력값을 붙이지 않는다.
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
    .eq("key", "FLIGHT_OUTBOUND_URL")
    .maybeSingle();
  if (error || !data?.url) return null;
  return data.url;
}

export default function FlightForm() {
  const [countryCode, setCountryCode] = useState(
    COUNTRY_GROUPS[0]?.countryCode ?? "",
  );
  const [region, setRegion] = useState(COUNTRY_GROUPS[0]?.regions[0] ?? "");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
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
    departureDate && returnDate
      ? validateFlightDates(departureDate, returnDate)
      : {};
  const hasErrors = hasDateRangeErrors(dateErrors);
  const canSearch =
    countryCode &&
    region &&
    departureDate &&
    returnDate &&
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
        aria-label="항공편 조건 입력"
      >
        <div>
          <label
            htmlFor="flight-country"
            className="block text-title-sm text-text-primary"
          >
            국가
          </label>
          <select
            id="flight-country"
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
            htmlFor="flight-region"
            className="block text-title-sm text-text-primary"
          >
            지역
          </label>
          <select
            id="flight-region"
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
            htmlFor="flight-departure"
            className="block text-title-sm text-text-primary"
          >
            출발일
          </label>
          <input
            id="flight-departure"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            aria-describedby="flight-departure-error"
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
          {dateErrors.start ? (
            <p
              id="flight-departure-error"
              className="mt-xxs text-caption text-danger"
            >
              {dateErrors.start}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="flight-return"
            className="block text-title-sm text-text-primary"
          >
            귀국일
          </label>
          <input
            id="flight-return"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            aria-describedby="flight-return-error"
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
          {dateErrors.end ? (
            <p
              id="flight-return-error"
              className="mt-xxs text-caption text-danger"
            >
              {dateErrors.end}
            </p>
          ) : null}
        </div>
      </form>

      <div className="rounded-md border border-hairline p-sm">
        <h3 className="text-title-sm text-text-primary">입력 요약</h3>
        {countryName && region && departureDate && returnDate ? (
          <p className="mt-xs text-body-sm text-text-secondary">
            {countryName} {region} · {departureDate} ~ {returnDate}
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
            항공편 보러 가기
          </button>
        )}
      </div>
    </div>
  );
}
