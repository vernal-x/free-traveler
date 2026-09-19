import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  listMatePosts,
  resolveMatePostDisplayStatus,
  type MatePostRow,
} from "@/lib/supabase/queries/mate-post";

/**
 * CMP-SCR001-MATE-TEASER — SCR-001 Section 6 "최근 동행글" 3개 또는 완성형
 * Empty State.
 *
 * `mate_post`는 RLS 원칙 2에 따라 Public 조회 가능하므로 서버 컴포넌트에서
 * 익명 세션으로도 목록을 가져올 수 있다. `listMatePosts`는 `mate_post`
 * 테이블만 조회하므로 비공개 신청 메시지(`mate_application`)는 애초에
 * 응답에 포함되지 않는다(Security/Privacy AC). 카드에는 공개 연락처를 넣지
 * 않는다 — `mate_post` 스키마 자체에 연락처 필드가 없다.
 */

const USAGE_STEPS = [
  "동행 모집글을 작성해 함께 여행할 사람을 찾아보세요.",
  "관심 있는 모집글에 참가 신청을 보낼 수 있어요.",
  "작성자가 신청을 수락하면 서비스 내에서 일정을 조율하세요.",
];

function MatePostCard({ post }: { post: MatePostRow }) {
  const status = resolveMatePostDisplayStatus(post);

  return (
    <Link
      href="/mates"
      className="block rounded-md border border-hairline bg-canvas p-sm transition-shadow hover:shadow-card"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-pill bg-surface-strong px-xs py-0 text-badge text-text-secondary">
          {post.country_code}
          {post.region ? ` · ${post.region}` : ""}
        </span>
        <span
          className={`rounded-pill px-xs py-0 text-badge text-on-primary ${
            status === "RECRUITING" ? "bg-success" : "bg-text-muted"
          }`}
        >
          {status === "RECRUITING" ? "모집중" : "마감"}
        </span>
      </div>

      <h3 className="mt-xs text-title-md text-text-primary">{post.title}</h3>
      <p className="mt-xxs text-body-sm text-text-secondary">
        {post.start_date} ~ {post.end_date} · {post.headcount}명
      </p>

      {post.travel_style.length > 0 ? (
        <div className="mt-xs flex flex-wrap gap-xxs">
          {post.travel_style.map((style) => (
            <span
              key={style}
              className="rounded-pill bg-surface-soft px-xs py-0 text-caption text-text-secondary"
            >
              {style}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

function MateTeaserEmptyState() {
  return (
    <div className="mt-lg rounded-md bg-surface-soft px-md py-xxl text-center">
      <p className="text-title-md text-text-primary">
        아직 등록된 동행글이 없어요
      </p>
      <ol className="mx-auto mt-sm max-w-[420px] space-y-xxs text-left text-body-sm text-text-secondary">
        {USAGE_STEPS.map((step, i) => (
          <li key={i}>
            {i + 1}. {step}
          </li>
        ))}
      </ol>
      <Link
        href="/travel-tools"
        className="mt-md inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
      >
        동행글 작성하기
      </Link>
    </div>
  );
}

export default async function MateTeaser() {
  let posts: MatePostRow[] = [];
  try {
    const supabase = await createClient();
    posts = await listMatePosts(supabase, { limit: 3 });
  } catch {
    posts = [];
  }

  return (
    <section className="mx-auto max-w-[1240px] px-md py-section-mobile md:py-section-desktop">
      <div className="flex items-center justify-between">
        <h2 className="text-display-md text-text-primary">최근 동행글</h2>
        {posts.length > 0 ? (
          <Link href="/mates" className="text-button text-primary">
            모두 보기
          </Link>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <MateTeaserEmptyState />
      ) : (
        <div className="mt-lg grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {posts.map((post) => (
            <MatePostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
