"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DESTINATIONS } from "@/data/destinations";
import { DESTINATION_THEMES } from "@/data/destinations.schema";

/**
 * CMP-SCR001-HERO — SCR-001 Section 1 검색 Hero(`component.search-bar-pill`).
 *
 * REQ-FUNC-003: 클라이언트 키워드 부분일치 검색만 수행한다(서버 요청 없음).
 * `?q=` URL 쿼리는 `CMP-SCR001-DESTINATION-GRIDS`가 읽어 필터링하는 것과 같은
 * 프로토콜이다 — 두 컴포넌트는 prop 전달 없이 URL을 공유 상태로 사용한다.
 * 도시·국가는 여행지 이름으로, 테마는 고정 6개 테마 값으로 자동완성한다.
 */

interface Suggestion {
  type: "destination" | "theme";
  label: string;
  value: string;
}

const MAX_SUGGESTIONS = 6;

function buildSuggestions(query: string): Suggestion[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const destinationMatches: Suggestion[] = [];
  const seenNames = new Set<string>();
  for (const destination of DESTINATIONS) {
    if (destinationMatches.length >= MAX_SUGGESTIONS) break;
    if (seenNames.has(destination.name)) continue;
    const matchesName = destination.name.toLowerCase().includes(needle);
    const matchesCountry = destination.countryName
      .toLowerCase()
      .includes(needle);
    if (matchesName || matchesCountry) {
      destinationMatches.push({
        type: "destination",
        label: `${destination.name} · ${destination.countryName}`,
        value: destination.name,
      });
      seenNames.add(destination.name);
    }
  }

  const themeMatches: Suggestion[] = DESTINATION_THEMES.filter((theme) =>
    theme.toLowerCase().includes(needle),
  ).map((theme) => ({ type: "theme", label: `테마: ${theme}`, value: theme }));

  return [...destinationMatches, ...themeMatches].slice(0, MAX_SUGGESTIONS);
}

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => buildSuggestions(query), [query]);

  function runSearch(keyword: string) {
    const trimmed = keyword.trim();
    setIsOpen(false);
    if (!trimmed) return;
    router.push(`/?q=${encodeURIComponent(trimmed)}`);
  }

  function selectSuggestion(suggestion: Suggestion) {
    setIsOpen(false);
    if (suggestion.type === "theme") {
      setQuery("");
      router.push(`/?theme=${encodeURIComponent(suggestion.value)}`);
    } else {
      setQuery(suggestion.value);
      router.push(`/?q=${encodeURIComponent(suggestion.value)}`);
    }
  }

  return (
    <section className="mx-auto flex max-w-[1240px] flex-col items-center px-md py-section-mobile text-center md:py-section-desktop">
      <h1 className="text-display-xl text-text-primary">
        어디로 떠나고 싶으세요?
      </h1>
      <p className="mt-xs text-body-md text-text-secondary">
        국내외 여행지와 국가별 안전정보를 검색해 보세요.
      </p>

      <div className="relative mt-lg w-full max-w-[560px]">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="flex h-14 items-center rounded-pill border border-hairline bg-canvas px-lg"
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(query.trim().length > 0)}
            onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
            placeholder="도시, 국가, 테마로 검색"
            aria-label="여행지 검색"
            className="h-full flex-1 bg-transparent text-body-sm text-text-primary outline-none placeholder:text-text-muted"
          />
          <button type="submit" className="text-button text-primary">
            검색
          </button>
        </form>

        {isOpen && suggestions.length > 0 ? (
          <ul className="absolute inset-x-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-md bg-canvas shadow-card">
            {suggestions.map((suggestion) => (
              <li key={`${suggestion.type}-${suggestion.value}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className="block w-full px-md py-sm text-left text-body-sm text-text-primary hover:bg-surface-soft"
                >
                  {suggestion.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Link
        href="/travel-tools"
        className="mt-lg inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
      >
        여행 준비 시작하기
      </Link>
    </section>
  );
}
