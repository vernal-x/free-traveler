"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  resolveMatePostDisplayStatus,
  type MatePostRow,
} from "@/lib/supabase/queries/mate-post";

/**
 * CMP-SCR004-MATE-DETAIL — SCR-004 "상세 패널"(Desktop Split / Mobile Drawer).
 *
 * 작성자 닉네임은 공개 View `mate_author_public`(id/nickname/role만 노출,
 * REQ-FUNC-033)에서 조회한다 — `mate_post`에 연락처 필드가 애초에 없어 별도
 * 비노출 처리가 필요 없다. 모집 상태 배지는 `resolveMatePostDisplayStatus`로
 * 종료일 경과를 배치 잡 없이 계산한다(REQ-FUNC-037). Desktop에서는 일반 흐름의
 * 패널로 렌더링해(부모가 목록과 나란히 2단 배치) 목록이 함께 보이고, Mobile에서는
 * 하단 고정 오버레이로 전체 화면까지 확장된다.
 *
 * **공개 범위 결정(확정, `docs/04_UIUX_PLAN.md` §6.4)**: 비로그인 Guest도 목록과
 * 제목은 볼 수 있지만, 상세 내용(작성자·기간·조건·설명 등)은 로그인 후에만 볼 수
 * 있다. 로그인 여부는 브라우저 Supabase 클라이언트로 확인하며, 실제 쓰기 권한은
 * 여전히 RLS·Server Action이 강제한다 — 이 체크는 UX 게이트일 뿐 보안 경계가
 * 아니다.
 *
 * `children`(범위 확장, 사용자 승인, PAGE-SCR004 소관): `CMP-SCR004-APPLY-FLOW`/
 * `REPORT-BLOCK`의 참가 요청 폼·신고/차단 진입점을 이 패널의 스크롤 영역 안에
 * 함께 렌더링하기 위한 슬롯이다 — Mobile에서 이 패널이 전체화면 고정 오버레이라,
 * 형제 요소로 배치하면 화면 뒤에 가려 접근할 수 없어 슬롯이 필요했다. 로그인
 * 상태일 때만 렌더링한다(비로그인 시 위 로그인 안내만 보인다).
 */

export interface MateDetailPanelProps {
  post: MatePostRow | null;
  onClose: () => void;
  children?: ReactNode;
}

const STATUS_LABEL: Record<"RECRUITING" | "CLOSED", string> = {
  RECRUITING: "모집중",
  CLOSED: "마감",
};

export default function MateDetailPanel({
  post,
  onClose,
  children,
}: MateDetailPanelProps) {
  const [authorNickname, setAuthorNickname] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setIsSignedIn(Boolean(data.user));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!post) return;
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
  }, [post]);

  if (!post) return null;

  const status = resolveMatePostDisplayStatus(post);

  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/50 md:hidden"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${post.title} 상세`}
        className="fixed inset-x-0 bottom-0 z-40 max-h-[90vh] overflow-y-auto rounded-t-lg bg-canvas p-md shadow-card md:static md:z-auto md:max-h-none md:rounded-md md:border md:border-hairline md:p-lg md:shadow-none"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-title-md text-text-primary">{post.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-title-md text-text-primary md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="mt-xs flex items-center gap-xs">
          <span
            className={`rounded-pill px-xs py-0 text-badge text-on-primary ${
              status === "RECRUITING" ? "bg-success" : "bg-text-muted"
            }`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>

        {isSignedIn ? (
          <>
            <p className="mt-xs text-body-sm text-text-secondary">
              {authorNickname ?? "작성자"}
            </p>

            <dl className="mt-md space-y-sm">
              <div>
                <dt className="text-title-sm text-text-primary">여행지</dt>
                <dd className="mt-xxs text-body-sm text-text-secondary">
                  {post.country_code}
                  {post.region ? ` · ${post.region}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-title-sm text-text-primary">기간</dt>
                <dd className="mt-xxs text-body-sm text-text-secondary">
                  {post.start_date} ~ {post.end_date}
                </dd>
              </div>
              <div>
                <dt className="text-title-sm text-text-primary">인원</dt>
                <dd className="mt-xxs text-body-sm text-text-secondary">
                  {post.headcount}명
                </dd>
              </div>
              {post.preferred_conditions ? (
                <div>
                  <dt className="text-title-sm text-text-primary">
                    희망 조건
                  </dt>
                  <dd className="mt-xxs text-body-sm text-text-secondary">
                    {post.preferred_conditions}
                  </dd>
                </div>
              ) : null}
            </dl>

            {post.travel_style.length > 0 ? (
              <div className="mt-md flex flex-wrap gap-xxs">
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

            <div className="mt-md">
              <h3 className="text-title-sm text-text-primary">설명</h3>
              <p className="mt-xxs whitespace-pre-line text-body-md text-text-secondary">
                {post.description}
              </p>
            </div>

            {children ? <div className="mt-lg space-y-md">{children}</div> : null}
          </>
        ) : (
          <div className="mt-md rounded-md bg-surface-soft p-md text-center">
            <p className="text-body-md text-text-primary">
              상세 내용은 로그인 후 확인할 수 있어요
            </p>
            <p className="mt-xxs text-body-sm text-text-secondary">
              작성자 소개·조건·설명 확인과 참가 신청은 로그인한 회원만 이용할
              수 있습니다.
            </p>
            <Link
              href="/account"
              className="mt-md inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
            >
              로그인하고 계속하기
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
