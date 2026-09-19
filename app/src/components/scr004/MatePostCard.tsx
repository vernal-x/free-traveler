"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  resolveMatePostDisplayStatus,
  type MatePostRow,
} from "@/lib/supabase/queries/mate-post";

/**
 * CMP-SCR004-MATE-LIST — 동행글 카드 1개.
 *
 * 작성자 닉네임은 `mate_author_public`(id/nickname/role만 노출)에서 조회한다.
 * `mate_post`에 연락처 필드가 없어 REQ-FUNC-033(공개 연락처·실명 과다 노출 금지)이
 * 구조적으로 지켜진다 — 닉네임 하나만 표시한다.
 */

export interface MatePostCardProps {
  post: MatePostRow;
  onSelect?: (post: MatePostRow) => void;
}

export default function MatePostCard({ post, onSelect }: MatePostCardProps) {
  const [authorNickname, setAuthorNickname] = useState<string | null>(null);
  const status = resolveMatePostDisplayStatus(post);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("mate_author_public")
      .select("nickname")
      .eq("id", post.author_id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setAuthorNickname(data?.nickname ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [post.author_id]);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(post)}
      className="block w-full rounded-md border border-hairline bg-canvas p-sm text-left transition-shadow hover:shadow-card"
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
      <p className="mt-xxs text-caption text-text-muted">
        {authorNickname ?? "작성자"}
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
    </button>
  );
}
