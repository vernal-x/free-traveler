"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  acceptApplicationAction,
  rejectApplicationAction,
  withdrawApplicationAction,
} from "@/lib/actions/mate-application";
import type { MateApplicationRow } from "@/lib/supabase/queries/mate-application";

/**
 * CMP-SCR005-MY-ACTIVITY — SCR-005 `my_activity_requests` 탭(REQ-FUNC-036, 040).
 *
 * "받은 요청"(내 글에 들어온 신청)과 "보낸 요청"(내가 보낸 신청)은 전용 조회
 * 함수가 없어 브라우저 Supabase 클라이언트로 직접 조합한다 — RLS
 * (`mate_application_select_own_or_post_author`)가 신청자 본인과 글 작성자
 * 양쪽의 조회를 이미 허용하므로 추가 우회 없이 그대로 조회된다. 승인/거절/
 * 취소는 `SA-MATE-APPLICATION`의 기존 Server Action을 호출하며, "누가 어떤
 * 상태로 바꿀 수 있는지"는 그 계층(`mate-state.ts`)이 최종 검증한다.
 */

type Tab = "received" | "sent";
type LoadState = "loading" | "signed_out" | "ready";

interface EnrichedApplication extends MateApplicationRow {
  postTitle: string;
  applicantNickname: string | null;
}

const STATUS_LABEL: Record<MateApplicationRow["status"], string> = {
  PENDING: "대기중",
  ACCEPTED: "승인됨",
  REJECTED: "거절됨",
  WITHDRAWN: "취소됨",
};

const STATUS_BADGE: Record<MateApplicationRow["status"], string> = {
  PENDING: "bg-warning",
  ACCEPTED: "bg-success",
  REJECTED: "bg-danger",
  WITHDRAWN: "bg-text-muted",
};

function StatusBadge({ status }: { status: MateApplicationRow["status"] }) {
  return (
    <span
      className={`rounded-pill px-xs py-0 text-badge text-on-primary ${STATUS_BADGE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function MyRequests() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [tab, setTab] = useState<Tab>("received");
  const [received, setReceived] = useState<EnrichedApplication[]>([]);
  const [sent, setSent] = useState<EnrichedApplication[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAll = useCallback(async (userId: string) => {
    const supabase = createClient();

    const { data: myPosts } = await supabase
      .from("mate_post")
      .select("id, title")
      .eq("author_id", userId);
    const myPostMap = new Map(
      (myPosts ?? []).map((p) => [p.id as string, p.title as string]),
    );
    const myPostIds = Array.from(myPostMap.keys());

    let receivedRows: MateApplicationRow[] = [];
    if (myPostIds.length > 0) {
      const { data } = await supabase
        .from("mate_application")
        .select("*")
        .in("mate_post_id", myPostIds)
        .order("created_at", { ascending: false });
      receivedRows = data ?? [];
    }

    const { data: sentRows } = await supabase
      .from("mate_application")
      .select("*")
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false });

    const sentPostIds = Array.from(
      new Set((sentRows ?? []).map((r) => r.mate_post_id)),
    );
    let sentPostMap = new Map<string, string>();
    if (sentPostIds.length > 0) {
      const { data: sentPosts } = await supabase
        .from("mate_post")
        .select("id, title")
        .in("id", sentPostIds);
      sentPostMap = new Map(
        (sentPosts ?? []).map((p) => [p.id as string, p.title as string]),
      );
    }

    const applicantIds = Array.from(
      new Set(receivedRows.map((r) => r.applicant_id)),
    );
    let nicknameMap = new Map<string, string>();
    if (applicantIds.length > 0) {
      const { data: authors } = await supabase
        .from("mate_author_public")
        .select("id, nickname")
        .in("id", applicantIds);
      nicknameMap = new Map(
        (authors ?? []).map((a) => [a.id as string, a.nickname as string]),
      );
    }

    setReceived(
      receivedRows.map((r) => ({
        ...r,
        postTitle: myPostMap.get(r.mate_post_id) ?? "(삭제된 글)",
        applicantNickname: nicknameMap.get(r.applicant_id) ?? null,
      })),
    );
    setSent(
      (sentRows ?? []).map((r) => ({
        ...r,
        postTitle: sentPostMap.get(r.mate_post_id) ?? "(삭제된 글)",
        applicantNickname: null,
      })),
    );
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
      await loadAll(user.id);
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
    if (user) await loadAll(user.id);
  }

  async function handleAccept(id: string) {
    setBusyId(id);
    const result = await acceptApplicationAction(id);
    if (result.error) setErrorMessage(result.error);
    await refresh();
    setBusyId(null);
  }

  async function handleReject(id: string) {
    setBusyId(id);
    const result = await rejectApplicationAction(id);
    if (result.error) setErrorMessage(result.error);
    await refresh();
    setBusyId(null);
  }

  async function handleWithdraw(id: string) {
    setBusyId(id);
    const result = await withdrawApplicationAction(id);
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

  const list = tab === "received" ? received : sent;

  return (
    <div className="space-y-md">
      <div className="flex gap-xs">
        <button
          type="button"
          onClick={() => setTab("received")}
          className={`h-9 rounded-pill border px-md text-body-sm ${
            tab === "received"
              ? "border-primary bg-primary-tint text-primary-active"
              : "border-border-strong bg-canvas text-text-secondary"
          }`}
        >
          받은 요청
        </button>
        <button
          type="button"
          onClick={() => setTab("sent")}
          className={`h-9 rounded-pill border px-md text-body-sm ${
            tab === "sent"
              ? "border-primary bg-primary-tint text-primary-active"
              : "border-border-strong bg-canvas text-text-secondary"
          }`}
        >
          보낸 요청
        </button>
      </div>

      {errorMessage ? (
        <p className="text-caption text-danger">{errorMessage}</p>
      ) : null}

      {list.length === 0 ? (
        <div className="rounded-md bg-surface-soft p-lg text-center">
          <p className="text-body-md text-text-primary">
            {tab === "received"
              ? "받은 참가 요청이 없습니다."
              : "보낸 참가 요청이 없습니다."}
          </p>
          <p className="mt-xxs text-body-sm text-text-secondary">
            {tab === "received"
              ? "동행글을 올리면 여기서 받은 요청을 확인할 수 있어요."
              : "동행 찾기에서 마음에 드는 글에 참가를 신청해보세요."}
          </p>
        </div>
      ) : (
        <ul className="space-y-sm">
          {list.map((application) => (
            <li
              key={application.id}
              className="rounded-md border border-hairline p-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-xs">
                <StatusBadge status={application.status} />
                <span className="text-caption text-text-muted">
                  {new Date(application.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <p className="mt-xs text-title-sm text-text-primary">
                {application.postTitle}
              </p>
              {tab === "received" && application.applicantNickname ? (
                <p className="mt-xxs text-body-sm text-text-secondary">
                  신청자: {application.applicantNickname}
                </p>
              ) : null}
              <p className="mt-xxs text-body-sm text-text-secondary">
                {application.message}
              </p>

              {tab === "received" && application.status === "PENDING" ? (
                <div className="mt-sm flex gap-xs">
                  <button
                    type="button"
                    disabled={busyId === application.id}
                    onClick={() => handleAccept(application.id)}
                    className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-md text-button text-on-primary disabled:opacity-40"
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    disabled={busyId === application.id}
                    onClick={() => handleReject(application.id)}
                    className="inline-flex h-9 items-center justify-center rounded-sm border border-border-strong bg-canvas px-md text-button text-text-primary disabled:opacity-40"
                  >
                    거절
                  </button>
                </div>
              ) : null}

              {tab === "sent" && application.status === "PENDING" ? (
                <div className="mt-sm">
                  <button
                    type="button"
                    disabled={busyId === application.id}
                    onClick={() => handleWithdraw(application.id)}
                    className="inline-flex h-9 items-center justify-center rounded-sm border border-border-strong bg-canvas px-md text-button text-text-primary disabled:opacity-40"
                  >
                    요청 취소
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
