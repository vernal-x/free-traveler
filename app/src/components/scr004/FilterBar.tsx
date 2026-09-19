"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DESTINATIONS } from "@/data/destinations";
import { DESTINATION_THEMES } from "@/data/destinations.schema";
import { listBlockedUserIds } from "@/lib/supabase/queries/user-block";

/**
 * CMP-SCR004-FILTER-BAR — SCR-004 Section 2 "Filter + 결과 요약"(REQ-FUNC-030).
 *
 * 국가/지역/기간/스타일/모집상태 필터를 URL 쿼리(`country`/`region`/`start`/`end`/
 * `style`/`status`)로 반영한다(SCR-001의 `?theme=`/`?q=` 프로토콜과 동일 패턴) —
 * 아직 만들어지지 않은 `CMP-SCR004-MATE-LIST`(다른 Task 소관)가 같은 URL을 읽어
 * 실제 목록을 필터링할 수 있다. "총 N건"은 이 컴포넌트가 직접 `mate_post`를
 * 공개 조회(`mate_post_select_public` RLS)해 계산하며, 로그인한 사용자의 차단
 * 목록(`listBlockedUserIds`)을 제외해 REQ-FUNC-030 "차단 사용자 글 결과 제외"를
 * 만족한다.
 *
 * **연령대·성별 필터는 이 Task에서 제외한다**(사용자 승인) — `mate_post`가
 * 아니라 작성자 `user_profile`에만 있는 값인데, 공개 조회용 `mate_author_public`
 * View가 개인정보 보호를 위해 `id/nickname/role`만 노출하도록 이미 확정돼
 * 있어(W06) 다른 사용자의 연령대·성별로 필터링할 방법이 없다.
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

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "RECRUITING", label: "모집중" },
  { value: "CLOSED", label: "마감" },
] as const;

function FilterBarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const country = searchParams.get("country") ?? "";
  const region = searchParams.get("region") ?? "";
  const startDate = searchParams.get("start") ?? "";
  const endDate = searchParams.get("end") ?? "";
  const activeStyles =
    searchParams.get("style")?.split(",").filter(Boolean) ?? [];
  const status = searchParams.get("status") ?? "";

  const [totalCount, setTotalCount] = useState<number | null>(null);

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleStyle(style: string) {
    const next = activeStyles.includes(style)
      ? activeStyles.filter((s) => s !== style)
      : [...activeStyles, style];
    updateParams({ style: next.length > 0 ? next.join(",") : null });
  }

  function resetFilters() {
    router.push(pathname);
  }

  const regions =
    COUNTRY_GROUPS.find((g) => g.countryCode === country)?.regions ?? [];

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      const supabase = createClient();
      let query = supabase
        .from("mate_post")
        .select("id", { count: "exact", head: true });

      if (country) query = query.eq("country_code", country);
      if (region) query = query.eq("region", region);
      if (startDate) query = query.gte("end_date", startDate);
      if (endDate) query = query.lte("start_date", endDate);
      if (activeStyles.length > 0)
        query = query.overlaps("travel_style", activeStyles);

      const today = new Date().toISOString().slice(0, 10);
      if (status === "RECRUITING") {
        query = query.eq("status", "RECRUITING").gte("end_date", today);
      } else if (status === "CLOSED") {
        // "마감"은 수동 마감이거나 종료일 경과 둘 다 포함하지만, OR 조건에
        // 배치 잡 없이 계산되는 값이 섞여 PostgREST `.or()`로 표현한다.
        query = query.or(`status.eq.CLOSED,end_date.lt.${today}`);
      }

      const { count, error } = await query;
      if (cancelled) return;
      if (error) {
        setTotalCount(null);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setTotalCount(count ?? 0);
        return;
      }
      const blockedIds = await listBlockedUserIds(
        supabase,
        userData.user.id,
      ).catch(() => [] as string[]);
      if (cancelled) return;
      if (blockedIds.length === 0) {
        setTotalCount(count ?? 0);
        return;
      }

      let excludeQuery = supabase
        .from("mate_post")
        .select("id", { count: "exact", head: true })
        .in("author_id", blockedIds);
      if (country) excludeQuery = excludeQuery.eq("country_code", country);
      if (region) excludeQuery = excludeQuery.eq("region", region);
      if (startDate) excludeQuery = excludeQuery.gte("end_date", startDate);
      if (endDate) excludeQuery = excludeQuery.lte("start_date", endDate);
      if (activeStyles.length > 0) {
        excludeQuery = excludeQuery.overlaps("travel_style", activeStyles);
      }
      if (status === "RECRUITING") {
        excludeQuery = excludeQuery
          .eq("status", "RECRUITING")
          .gte("end_date", today);
      } else if (status === "CLOSED") {
        excludeQuery = excludeQuery.or(`status.eq.CLOSED,end_date.lt.${today}`);
      }
      const { count: blockedCount } = await excludeQuery;
      if (cancelled) return;
      setTotalCount(Math.max((count ?? 0) - (blockedCount ?? 0), 0));
    }

    loadCount();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, region, startDate, endDate, status, activeStyles.join(",")]);

  return (
    <section className="mx-auto max-w-[1240px] px-md py-md">
      <div className="flex gap-xs overflow-x-auto md:flex-wrap md:overflow-visible">
        <select
          aria-label="국가"
          value={country}
          onChange={(e) =>
            updateParams({ country: e.target.value || null, region: null })
          }
          className="h-11 shrink-0 rounded-sm border border-hairline px-sm text-body-sm"
        >
          <option value="">국가 전체</option>
          {COUNTRY_GROUPS.map((g) => (
            <option key={g.countryCode} value={g.countryCode}>
              {g.countryName}
            </option>
          ))}
        </select>

        <select
          aria-label="지역"
          value={region}
          onChange={(e) => updateParams({ region: e.target.value || null })}
          disabled={!country}
          className="h-11 shrink-0 rounded-sm border border-hairline px-sm text-body-sm disabled:opacity-40"
        >
          <option value="">지역 전체</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <input
          type="date"
          aria-label="기간 시작"
          value={startDate}
          onChange={(e) => updateParams({ start: e.target.value || null })}
          className="h-11 shrink-0 rounded-sm border border-hairline px-sm text-body-sm"
        />
        <input
          type="date"
          aria-label="기간 종료"
          value={endDate}
          onChange={(e) => updateParams({ end: e.target.value || null })}
          className="h-11 shrink-0 rounded-sm border border-hairline px-sm text-body-sm"
        />

        <select
          aria-label="모집 상태"
          value={status}
          onChange={(e) => updateParams({ status: e.target.value || null })}
          className="h-11 shrink-0 rounded-sm border border-hairline px-sm text-body-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {DESTINATION_THEMES.map((theme) => {
          const active = activeStyles.includes(theme);
          return (
            <button
              key={theme}
              type="button"
              onClick={() => toggleStyle(theme)}
              aria-pressed={active}
              className={`h-11 shrink-0 rounded-pill px-md text-body-sm ${
                active
                  ? "bg-primary-tint text-primary-active"
                  : "bg-surface-soft text-text-secondary"
              }`}
            >
              {theme}
            </button>
          );
        })}

        <button
          type="button"
          onClick={resetFilters}
          className="h-11 shrink-0 rounded-sm border border-border-strong px-md text-body-sm text-text-secondary"
        >
          필터 초기화
        </button>
      </div>

      <p className="mt-sm text-body-sm text-text-secondary">
        총 {totalCount ?? "-"}건
      </p>
    </section>
  );
}

export default function FilterBar() {
  return (
    <Suspense fallback={null}>
      <FilterBarInner />
    </Suspense>
  );
}
