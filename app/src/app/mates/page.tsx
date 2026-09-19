import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMatePostById, type MatePostRow } from "@/lib/supabase/queries/mate-post";
import FilterBar from "@/components/scr004/FilterBar";
import MateList from "@/components/scr004/MateList";
import MateDetailPanel from "@/components/scr004/MateDetailPanel";
import ApplyForm from "@/components/scr004/ApplyForm";
import ApplySteps from "@/components/scr004/ApplySteps";
import ReportForm from "@/components/scr004/ReportForm";
import SafetyBanner from "@/components/scr004/SafetyBanner";

/**
 * PAGE-SCR004 — SCR-004 동행 조회 페이지 조립(Page Owner).
 *
 * 하위 Component를 새로 만들지 않고 이미 완성된 CMP-SCR004-* Component를
 * import해 6개 Section을 조립한다(`CLAUDE.md` 규칙 9,
 * `design-reference/SCREEN_ROUTE_CONTRACT.json`의 section_order와 동일 순서).
 *
 * 카드 선택 상태는 `?postId=`로 URL에 반영한다(SCR-001의 `?destination=`과 동일
 * 프로토콜). `MateList`(Client Component)는 Server Component인 이 페이지로부터
 * 일반 함수를 prop으로 받을 수 없으므로, `"use server"` 인라인 Server Action을
 * 콜백으로 넘긴다 — 현재 필터 쿼리(country/region/start/end/style/status/page)를
 * 보존한 채 postId만 갱신/제거한다.
 */

export const metadata: Metadata = {
  title: "동행 찾기 — 함께 여행할 사람을 찾아보세요",
  description:
    "국가·지역·기간·모집 상태로 동행 모집글을 찾아보고, 로그인 후 참가를 요청하세요.",
  alternates: { canonical: "/mates" },
  openGraph: {
    title: "동행 찾기 — 함께 여행할 사람을 찾아보세요",
    description: "동행 모집글을 찾아보고 참가를 요청할 수 있는 동행 찾기 화면.",
    type: "website",
  },
};

interface MatesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function MatesPage({ searchParams }: MatesPageProps) {
  const params = await searchParams;
  const postId = params.postId;

  const supabase = await createClient();
  let selectedPost: MatePostRow | null = null;
  if (postId) {
    selectedPost = await getMatePostById(supabase, postId).catch(() => null);
  }

  async function openMateDetail(post: MatePostRow) {
    "use server";
    // 공유 헬퍼 함수를 클로저로 참조하면 Server Action 직렬화가 "use server"
    // 아닌 함수까지 포함하려다 실패하므로(실제로 겪은 오류), 쿼리 조립 로직을
    // 각 액션 안에 그대로 인라인한다.
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "postId") next.set(key, value);
    }
    next.set("postId", post.id);
    const query = next.toString();
    redirect(query ? `/mates?${query}` : "/mates");
  }

  async function closeMateDetail() {
    "use server";
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "postId") next.set(key, value);
    }
    const query = next.toString();
    redirect(query ? `/mates?${query}` : "/mates");
  }

  return (
    <main>
      {/* ① Intro + "동행글 작성하기" CTA */}
      <section className="mx-auto max-w-[1240px] px-md py-lg">
        <h1 className="text-display-md text-text-primary">
          믿을 수 있는 동행을 찾아보세요
        </h1>
        <p className="mt-xs text-body-md text-text-secondary">
          동행글 목록과 제목은 로그인 없이도 볼 수 있어요. 상세 내용 확인과
          참가 요청은 성인 인증을 마친 회원만 이용할 수 있습니다.
        </p>
        <Link
          href="/travel-tools"
          className="mt-md inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          동행글 작성하기
        </Link>
      </section>

      {/* ② Filter + 결과 요약 */}
      <FilterBar />

      {/* ③ 동행글 목록(Empty State 포함) + ④ Desktop 목록/상세 분할 · Mobile Drawer */}
      <div className="md:grid md:grid-cols-[minmax(0,1fr)_480px] md:items-start md:gap-lg">
        <MateList onSelectPost={openMateDetail} />

        <MateDetailPanel post={selectedPost} onClose={closeMateDetail}>
          {selectedPost ? (
            <>
              <ApplyForm matePostId={selectedPost.id} />
              <ReportForm
                targetType="MATE_POST"
                targetId={selectedPost.id}
                reportedUserId={selectedPost.author_id}
              />
            </>
          ) : null}
        </MateDetailPanel>
      </div>

      {/* ⑤ 참가 신청 방법 3단계 안내 */}
      <ApplySteps />

      {/* ⑥ 안전·신고·차단 안내 배너 + /travel-tools CTA */}
      <SafetyBanner />
    </main>
  );
}
