import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/queries/user-profile";
import GuestAuthCards from "@/components/scr005/GuestAuthCards";
import ProfileForm from "@/components/scr005/ProfileForm";
import MyPosts from "@/components/scr005/MyPosts";
import MyRequests from "@/components/scr005/MyRequests";
import MyBlocklist from "@/components/scr005/MyBlocklist";
import AdminReports from "@/components/scr005/AdminReports";
import ExternalUrlSettings from "@/components/scr005/ExternalUrlSettings";

/**
 * PAGE-SCR005 — SCR-005 계정·관리 페이지 조립(Page Owner).
 *
 * 역할(Guest/Member/Admin, RLS가 실제로 강제하는 MODERATOR 포함)은 서버에서
 * 먼저 계산한 뒤 그 역할에 맞는 탭만 서버 렌더링한다 — "역할에 없는 탭은
 * 렌더링 자체를 하지 않음"(비활성화가 아님)을 CSS 숨김이 아니라 실제로 그
 * 마크업 자체를 만들지 않는 방식으로 지킨다. `report_management`는 RLS
 * (`report_select_own_or_moderator`)가 MODERATOR도 허용하므로 Admin과 함께
 * 노출하고, `external_url_settings`는 RLS(`external_link_settings_admin_only`)가
 * ADMIN만 허용하므로 ADMIN에게만 노출한다(Task의 Guest/Member/Admin 3분류를
 * 실제 RLS 경계에 맞춰 세분화). 탭 선택 상태는 `?tab=`로 URL에 반영한다(SCR-001/
 * 004와 동일한 URL-쿼리 프로토콜). 하위 Component는 모두 CMP-SCR005-* Task의
 * 산출물을 그대로 import만 하고, 이 파일 안에서 새 Component 파일을 만들지
 * 않는다(`CLAUDE.md` 규칙 9).
 */

export const metadata: Metadata = {
  title: "계정 — 로그인·프로필·내 활동 관리",
  description:
    "로그인·회원가입, 프로필 편집, 내가 쓴 동행글과 참가 요청, 차단 목록을 한곳에서 관리하세요.",
  alternates: { canonical: "/account" },
  openGraph: {
    title: "계정 — 로그인·프로필·내 활동 관리",
    description: "로그인 후 프로필과 동행 활동을 관리할 수 있는 계정 화면.",
    type: "website",
  },
};

interface AccountPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const MEMBER_TABS = [
  { id: "profile", label: "프로필" },
  { id: "my_posts", label: "내 글" },
  { id: "my_requests", label: "참가 요청" },
  { id: "my_blocklist", label: "차단 목록" },
] as const;

const MODERATOR_TABS = [{ id: "admin_reports", label: "신고 관리" }] as const;

const ADMIN_ONLY_TABS = [{ id: "admin_url", label: "외부 URL 설정" }] as const;

type TabId =
  | (typeof MEMBER_TABS)[number]["id"]
  | (typeof MODERATOR_TABS)[number]["id"]
  | (typeof ADMIN_ONLY_TABS)[number]["id"];

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main>
        <section className="mx-auto max-w-[1240px] px-md py-lg">
          <h1 className="text-display-md text-text-primary">계정</h1>
          <p className="mt-xs text-body-md text-text-secondary">
            로그인하면 동행 참가 신청, 내가 쓴 글 관리, 차단 목록 등을 이용할 수
            있어요.
          </p>
        </section>
        <section className="mx-auto max-w-[1240px] px-md pb-2xl">
          <GuestAuthCards />
        </section>
      </main>
    );
  }

  const profile = await getUserProfile(supabase, user.id).catch(() => null);
  const role = profile?.role ?? "MEMBER";
  const isModerator = role === "MODERATOR" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  const tabs: { id: TabId; label: string }[] = [
    ...MEMBER_TABS,
    ...(isModerator ? MODERATOR_TABS : []),
    ...(isAdmin ? ADMIN_ONLY_TABS : []),
  ];

  const requestedTab = params.tab as TabId | undefined;
  const activeTab: TabId =
    requestedTab && tabs.some((t) => t.id === requestedTab)
      ? requestedTab
      : "profile";

  return (
    <main>
      <section className="mx-auto max-w-[1240px] px-md py-lg">
        <h1 className="text-display-md text-text-primary">계정</h1>
        <p className="mt-xs text-body-md text-text-secondary">
          {profile?.nickname ?? "회원"}님, 환영합니다.{" "}
          <span
            className={profile?.is_adult ? "text-success" : "text-text-muted"}
          >
            성인 인증 {profile?.is_adult ? "완료" : "미완료"}
          </span>
        </p>
        <Link
          href="/travel-tools"
          className="mt-md inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          새 동행글 작성하기
        </Link>
      </section>

      <section className="mx-auto max-w-[1240px] gap-lg px-md pb-2xl md:grid md:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="mb-md flex gap-xs overflow-x-auto md:mb-0 md:flex-col md:gap-xxs md:overflow-visible">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/account?tab=${tab.id}`}
              className={`whitespace-nowrap rounded-sm px-sm py-xs text-title-sm md:border-l-2 ${
                activeTab === tab.id
                  ? "border-primary text-text-primary md:bg-primary-tint"
                  : "border-transparent text-text-muted"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div>
          {activeTab === "profile" ? <ProfileForm /> : null}
          {activeTab === "my_posts" ? <MyPosts /> : null}
          {activeTab === "my_requests" ? <MyRequests /> : null}
          {activeTab === "my_blocklist" ? <MyBlocklist /> : null}
          {activeTab === "admin_reports" && isModerator ? (
            <AdminReports />
          ) : null}
          {activeTab === "admin_url" && isAdmin ? (
            <ExternalUrlSettings />
          ) : null}
        </div>
      </section>
    </main>
  );
}
