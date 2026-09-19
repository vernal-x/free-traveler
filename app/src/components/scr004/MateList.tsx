"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MatePostRow } from "@/lib/supabase/queries/mate-post";
import { listBlockedUserIds } from "@/lib/supabase/queries/user-block";
import MatePostCard from "./MatePostCard";

/**
 * CMP-SCR004-MATE-LIST — SCR-004 Section 3 "동행글 Card 목록"(REQ-FUNC-033, 037).
 *
 * `CMP-SCR004-FILTER-BAR`가 쓰는 URL 쿼리(`country`/`region`/`start`/`end`/
 * `style`/`status`)를 그대로 읽어 필터링한다(같은 프로토콜 공유). 페이지당
 * 최대 8개, `page` 쿼리로 페이지네이션한다. 차단한 사용자의 글은 제외한다
 * (REQ-FUNC-030과 동일 원칙). 카드 선택은 `onSelectPost` 콜백으로 알린다 —
 * `PAGE-SCR004`(향후 Task)가 `CMP-SCR001-DESTINATION-GRIDS`/`PAGE-SCR001`과
 * 동일한 패턴으로 URL 기반 상세 패널 연결을 조립할 수 있다.
 */

const PAGE_SIZE = 8;

export interface MateListProps {
  onSelectPost?: (post: MatePostRow) => void;
}

function MateListInner({ onSelectPost }: MateListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const country = searchParams.get("country") ?? "";
  const region = searchParams.get("region") ?? "";
  const startDate = searchParams.get("start") ?? "";
  const endDate = searchParams.get("end") ?? "";
  const styles = searchParams.get("style")?.split(",").filter(Boolean) ?? [];
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "error" }
    | { status: "success"; posts: MatePostRow[]; total: number }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);

      function applyFilters<T>(q: T): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query = q as any;
        if (country) query = query.eq("country_code", country);
        if (region) query = query.eq("region", region);
        if (startDate) query = query.gte("end_date", startDate);
        if (endDate) query = query.lte("start_date", endDate);
        if (styles.length > 0) query = query.overlaps("travel_style", styles);
        if (status === "RECRUITING") {
          query = query.eq("status", "RECRUITING").gte("end_date", today);
        } else if (status === "CLOSED") {
          query = query.or(`status.eq.CLOSED,end_date.lt.${today}`);
        }
        return query;
      }

      let blockedIds: string[] = [];
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        blockedIds = await listBlockedUserIds(supabase, userData.user.id).catch(
          () => [],
        );
      }

      let query = supabase
        .from("mate_post")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      query = applyFilters(query);
      if (blockedIds.length > 0) {
        query = query.not("author_id", "in", `(${blockedIds.join(",")})`);
      }

      const { data, error, count } = await query;
      if (cancelled) return;
      if (error) {
        setState({ status: "error" });
        return;
      }
      setState({
        status: "success",
        posts: (data ?? []) as MatePostRow[],
        total: count ?? 0,
      });
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, region, startDate, endDate, status, styles.join(","), page]);

  function resetFilters() {
    router.push(pathname);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  if (state.status === "loading") {
    return (
      <section className="mx-auto max-w-[1240px] px-md py-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
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

  if (state.status === "error") {
    return (
      <section className="mx-auto max-w-[1240px] px-md py-md">
        <div className="rounded-md bg-danger/10 px-md py-lg text-center">
          <p className="text-body-md text-danger">
            목록을 불러오지 못했어요.
          </p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-sm text-button text-primary"
          >
            다시 시도
          </button>
        </div>
      </section>
    );
  }

  if (state.posts.length === 0) {
    return (
      <section className="mx-auto max-w-[1240px] px-md py-md">
        <div className="rounded-md bg-surface-soft px-md py-xxl text-center">
          <p className="text-title-md text-text-primary">
            조건에 맞는 동행글이 없어요
          </p>
          <ol className="mx-auto mt-sm max-w-[420px] space-y-xxs text-left text-body-sm text-text-secondary">
            <li>1. 필터를 초기화하면 더 많은 글을 볼 수 있어요.</li>
            <li>2. 원하는 조건의 글이 없다면 직접 등록해 보세요.</li>
            <li>3. 등록한 글은 마감 전까지 목록에 노출됩니다.</li>
          </ol>
          <div className="mt-md flex flex-col items-center gap-xs sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary"
            >
              필터 초기화
            </button>
            <Link
              href="/travel-tools"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
            >
              동행글 작성하기
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));

  return (
    <section className="mx-auto max-w-[1240px] px-md py-md">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        {state.posts.map((post) => (
          <MatePostCard key={post.id} post={post} onSelect={onSelectPost} />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-lg flex items-center justify-center gap-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="h-9 rounded-sm border border-hairline px-sm text-body-sm disabled:opacity-40"
          >
            이전
          </button>
          <span className="text-body-sm text-text-secondary">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="h-9 rounded-sm border border-hairline px-sm text-body-sm disabled:opacity-40"
          >
            다음
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default function MateList(props: MateListProps) {
  return (
    <Suspense fallback={null}>
      <MateListInner {...props} />
    </Suspense>
  );
}
