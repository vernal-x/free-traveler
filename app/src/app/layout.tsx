import type { Metadata } from "next";
import Link from "next/link";
import HeaderShell from "@/components/shared/HeaderShell";
import Toast from "@/components/shared/Toast";
import "./globals.css";

/**
 * TOOL-LAYOUT-SHELL — 5개 화면 공통 Header/Footer/layout.tsx.
 *
 * Header의 스크롤 감지·모바일 토글 같은 상호작용은 `HeaderShell`(Client
 * Component)로 분리되어 있다 — 이 파일은 `export const metadata`가 있는 Server
 * Component로 유지해야 하므로(둘을 한 파일에서 함께 "use client"로 만들 수
 * 없음, Next.js가 빌드 시점에 차단) 조립만 담당한다. Footer는 상호작용이
 * 필요 없어 이 파일에 그대로 서버 렌더링한다.
 */

export const metadata: Metadata = {
  title: {
    default: "Free Traveler — 국내외 여행지·안전정보·동행 찾기",
    template: "%s",
  },
  description:
    "국내외 여행지 정보와 국가별 안전정보를 한눈에 확인하고, 항공·숙소 조건을 정리한 뒤 함께할 동행까지 찾아보세요.",
};

const FOOTER_SERVICE_LINKS = [
  { href: "/", label: "홈" },
  { href: "/travel-tools", label: "여행 준비" },
  { href: "/mates", label: "동행 찾기" },
  { href: "/about", label: "대표 소개" },
] as const;

const FOOTER_POLICY_LINKS = [
  { href: "/legal/terms", label: "이용약관" },
  { href: "/legal/privacy", label: "개인정보처리방침" },
  { href: "/legal/mate-safety", label: "동행 안전수칙" },
  { href: "/legal/content-disclaimer", label: "콘텐츠 이용 안내" },
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-canvas text-text-primary">
        <HeaderShell />

        <div className="flex flex-1 flex-col">{children}</div>

        <footer className="border-t border-hairline bg-surface-soft">
          <div className="mx-auto grid max-w-[1280px] gap-lg px-md py-xxl md:grid-cols-4">
            <div>
              <p className="text-title-md">
                Free <span className="text-primary">Traveler</span>
              </p>
              <p className="mt-xs text-body-sm text-text-secondary">
                국내외 여행지·안전정보·동행 찾기를 한 곳에서.
              </p>
            </div>

            <div>
              <p className="text-title-sm text-text-primary">서비스</p>
              <ul className="mt-xs space-y-xxs">
                {FOOTER_SERVICE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-title-sm text-text-primary">정책</p>
              <ul className="mt-xs flex flex-wrap gap-x-sm gap-y-xxs md:block md:space-y-xxs">
                {FOOTER_POLICY_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-title-sm text-text-primary">안전 고지</p>
              <p className="mt-xs text-body-sm text-text-secondary">
                안전정보는 참고용이며 출국 전 외교부 해외안전여행에서 최신
                정보를 다시 확인하세요.
              </p>
              <a
                href="https://www.0404.go.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-xs inline-block text-body-sm text-primary underline underline-offset-2"
              >
                외교부 해외안전여행 바로가기
              </a>
            </div>
          </div>
        </footer>

        <Toast />
      </body>
    </html>
  );
}
