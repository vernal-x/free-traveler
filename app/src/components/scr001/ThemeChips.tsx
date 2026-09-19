"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DESTINATION_THEMES } from "@/data/destinations.schema";

/**
 * CMP-SCR001-THEME-CHIPS — SCR-001 Section 4 "여행 동기·테마 Chip 6개".
 *
 * `CMP-SCR001-DESTINATION-GRIDS`와 같은 URL 쿼리(`theme`) 프로토콜을 공유한다
 * (REQ-FUNC-010: `useSearchParams` 기반 필터 상태 URL 반영). 같은 Chip을 다시
 * 누르면 선택 해제(토글)된다. `useSearchParams`는 Suspense 경계가 필요해
 * 내부에서 자체적으로 감싼다.
 */

function ThemeChipsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTheme = searchParams.get("theme") ?? "";

  function toggleTheme(theme: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTheme === theme) {
      params.delete("theme");
    } else {
      params.set("theme", theme);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <h2 className="text-display-md text-text-primary">
        여행 스타일로 골라보기
      </h2>
      <p className="mt-xs text-body-md text-text-secondary">
        자연, 미식, 액티비티 등 원하는 여행 분위기에 맞춰 목록을 좁힐 수 있어요.
      </p>

      <div className="mt-lg flex gap-xs overflow-x-auto md:flex-wrap md:overflow-visible">
        {DESTINATION_THEMES.map((theme) => {
          const active = activeTheme === theme;
          return (
            <button
              key={theme}
              type="button"
              onClick={() => toggleTheme(theme)}
              aria-pressed={active}
              className={`shrink-0 rounded-pill px-md py-xs text-body-sm ${
                active
                  ? "bg-primary-tint text-primary-active"
                  : "bg-surface-soft text-text-secondary"
              }`}
            >
              {theme}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function ThemeChips() {
  return (
    <Suspense fallback={null}>
      <ThemeChipsInner />
    </Suspense>
  );
}
