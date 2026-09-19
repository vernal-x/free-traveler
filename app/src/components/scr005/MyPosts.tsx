"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  closeMatePostAction,
  deleteMatePostAction,
  getMatePostDeletionWarning,
  updateMatePostAction,
} from "@/lib/actions/mate-post";
import {
  resolveMatePostDisplayStatus,
  type MatePostRow,
} from "@/lib/supabase/queries/mate-post";

/**
 * CMP-SCR005-MY-ACTIVITY — SCR-005 `my_activity_posts` 탭(REQ-FUNC-036, 038).
 *
 * "내가 쓴 글" 목록은 전용 조회 함수가 없어(기존 `listMatePosts`는 작성자
 * 필터를 지원하지 않음) 브라우저 Supabase 클라이언트로 `author_id` 필터를
 * 직접 건다 — `mate_post`는 원래 Public 조회 테이블이라 RLS 위반이 아니다.
 * 마감/삭제/수정은 `SA-MATE-POST`의 기존 Server Action을 그대로 호출하고,
 * "작성자만 수정/마감/삭제"는 RLS가 실제로 강제한다. 삭제 전에는
 * `getMatePostDeletionWarning`으로 승인된 신청자 존재 여부를 확인해 경고
 * 확인창을 띄운다(REQ-FUNC-038 "승인자 존재 시 경고", 차단은 아님).
 */

type LoadState = "loading" | "signed_out" | "ready";

export default function MyPosts() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [posts, setPosts] = useState<MatePostRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPosts = useCallback(async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("mate_post")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setLoadState("signed_out");
        return;
      }
      await loadPosts(user.id);
      if (cancelled) return;
      setLoadState("ready");
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) await loadPosts(user.id);
  }

  function startEdit(post: MatePostRow) {
    setErrorMessage(null);
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditDescription(post.description);
  }

  async function saveEdit(id: string) {
    setBusyId(id);
    const result = await updateMatePostAction(id, {
      title: editTitle,
      description: editDescription,
    });
    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setEditingId(null);
      await refresh();
    }
    setBusyId(null);
  }

  async function handleClose(id: string) {
    setBusyId(id);
    const result = await closeMatePostAction(id);
    if (result.error) setErrorMessage(result.error);
    await refresh();
    setBusyId(null);
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    const warning = await getMatePostDeletionWarning(id);
    const confirmMessage = warning.hasAcceptedApplicants
      ? `이미 승인된 참가자가 ${warning.acceptedCount}명 있습니다. 그래도 삭제하시겠습니까?`
      : "이 동행글을 삭제하시겠습니까?";
    if (typeof window !== "undefined" && !window.confirm(confirmMessage)) {
      setBusyId(null);
      return;
    }
    const result = await deleteMatePostAction(id);
    if (result.error) setErrorMessage(result.error);
    await refresh();
    setBusyId(null);
  }

  if (loadState === "loading") {
    return <div className="h-40 animate-pulse rounded-md bg-surface-soft" />;
  }

  if (loadState === "signed_out") {
    return (
      <p className="text-body-md text-text-secondary">
        로그인 후 이용할 수 있습니다.
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-md bg-surface-soft p-lg text-center">
        <p className="text-body-md text-text-primary">
          아직 작성한 동행글이 없습니다.
        </p>
        <p className="mt-xxs text-body-sm text-text-secondary">
          여행 조건을 정리하면서 함께할 동행을 구해보세요.
        </p>
        <Link
          href="/travel-tools"
          className="mt-sm inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          동행글 작성하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {errorMessage ? (
        <p className="text-caption text-danger">{errorMessage}</p>
      ) : null}
      <ul className="space-y-sm">
        {posts.map((post) => {
          const displayStatus = resolveMatePostDisplayStatus(post);
          const isEditing = editingId === post.id;
          const isBusy = busyId === post.id;
          return (
            <li
              key={post.id}
              className="rounded-md border border-hairline p-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-xs">
                <span
                  className={`rounded-pill px-xs py-0 text-badge text-on-primary ${
                    displayStatus === "RECRUITING"
                      ? "bg-success"
                      : "bg-text-muted"
                  }`}
                >
                  {displayStatus === "RECRUITING" ? "모집중" : "마감"}
                </span>
                <span className="text-caption text-text-muted">
                  {post.country_code}
                  {post.region ? ` · ${post.region}` : ""} · {post.start_date}~
                  {post.end_date}
                </span>
              </div>

              {isEditing ? (
                <div className="mt-sm space-y-xs">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-11 w-full rounded-sm border border-hairline px-sm text-body-md"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-sm border border-hairline px-sm py-xs text-body-md"
                  />
                  <div className="flex gap-xs">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => saveEdit(post.id)}
                      className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-md text-button text-on-primary disabled:opacity-40"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex h-9 items-center justify-center rounded-sm border border-border-strong bg-canvas px-md text-button text-text-primary"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-sm text-title-sm text-text-primary">
                    {post.title}
                  </p>
                  <p className="mt-xxs text-body-sm text-text-secondary">
                    {post.description}
                  </p>
                  <div className="mt-sm flex flex-wrap gap-xs">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="inline-flex h-9 items-center justify-center rounded-sm border border-border-strong bg-canvas px-md text-button text-text-primary"
                    >
                      수정
                    </button>
                    {displayStatus === "RECRUITING" ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleClose(post.id)}
                        className="inline-flex h-9 items-center justify-center rounded-sm border border-border-strong bg-canvas px-md text-button text-text-primary disabled:opacity-40"
                      >
                        마감
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(post.id)}
                      className="inline-flex h-9 items-center justify-center rounded-sm border border-danger px-md text-button text-danger disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
