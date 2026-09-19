"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth/actions";

/**
 * TOOL-LAYOUT-SHELL의 Header 상호작용 부분만 담당하는 Client Component.
 *
 * `src/app/layout.tsx`는 `export const metadata`가 있는 Server Component여야
 * 하므로 그 파일 전체에 `"use client"`를 붙일 수 없다(Next.js가 빌드 시점에
 * 명시적으로 차단함). 스크롤 감지(Visual AC: 8px 이상 스크롤 시에만
 * `shadow.card`)와 모바일 햄버거 토글처럼 클라이언트 상태가 필요한 부분만
 * 분리해 여기서 구현하고, layout.tsx는 이 컴포넌트를 import해 조립만 한다.
 *
 * 로그인 여부는 브라우저 Supabase 클라이언트로 확인한다(AUTH-EMAIL-ADULT
 * 이후 실제로 연결됨 — 이 컴포넌트가 "항상 Guest로만 렌더링"하던 이전 상태는
 * 로그아웃 UI가 앱 전체에 없다는 실제 버그로 이어져 있었다, 발견 후 수정).
 * `signIn`/`signOut`(`src/lib/auth/actions.ts`)이 모두 Server Action이라
 * 브라우저 클라이언트의 `onAuthStateChange`가 반응하지 않으므로, 대신
 * 페이지 이동(`pathname` 변경)마다 다시 확인한다 — `signOut()`은 항상 `/`로
 * redirect하므로 로그아웃 직후에는 반드시 재확인된다.
 */

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/travel-tools", label: "여행 준비" },
  { href: "/mates", label: "동행 찾기" },
  { href: "/about", label: "대표 소개" },
] as const;

export default function HeaderShell() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // 경로가 바뀌면 렌더 중에 모바일 메뉴를 닫는다(React 권장 패턴 — effect 대신
  // 렌더 중 setState로 "prop 변경에 따른 상태 조정"을 처리해 불필요한 추가
  // 렌더 사이클을 피한다).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setIsSignedIn(Boolean(data.user));
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleSignOut() {
    // `signOut()`은 항상 `/`로 redirect하는데, 로그아웃을 이미 `/`에서
    // 눌렀다면 pathname이 바뀌지 않아 위 재확인 effect가 다시 실행되지
    // 않는다(실제로 재현된 문제) — 그래서 여기서 즉시 상태를 반영한다.
    setIsSignedIn(false);
    await signOut();
  }

  return (
    <header
      className={`sticky top-0 z-40 h-[56px] border-b border-hairline bg-canvas md:h-[72px] ${
        scrolled ? "shadow-card" : "shadow-none"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-md">
        <Link
          href="/"
          className="text-title-md font-semibold text-text-primary"
        >
          Free <span className="text-primary">Traveler</span>
        </Link>

        <nav className="hidden items-center gap-lg md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 pb-xxs text-title-sm ${
                  active
                    ? "border-primary text-text-primary"
                    : "border-transparent text-text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-sm md:flex">
          {isSignedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary"
            >
              로그아웃
            </button>
          ) : (
            <>
              <Link
                href="/account"
                className="px-sm text-button text-text-primary"
              >
                로그인
              </Link>
              <Link
                href="/account"
                className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-sheet"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="flex h-11 w-11 items-center justify-center rounded-sm text-title-md text-text-primary md:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav-sheet"
          className="border-t border-hairline bg-canvas px-md py-sm md:hidden"
        >
          <ul className="flex flex-col gap-xxs">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-sm text-title-sm text-text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-sm flex gap-sm">
            {isSignedIn ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 rounded-sm border border-border-strong px-md py-sm text-center text-button text-text-primary"
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link
                  href="/account"
                  className="flex-1 rounded-sm border border-border-strong px-md py-sm text-center text-button text-text-primary"
                >
                  로그인
                </Link>
                <Link
                  href="/account"
                  className="flex-1 rounded-sm bg-primary px-md py-sm text-center text-button text-on-primary"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
