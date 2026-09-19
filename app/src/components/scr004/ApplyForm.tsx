"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createMateApplicationAction } from "@/lib/actions/mate-application";
import { listMateApplicationsByApplicant } from "@/lib/supabase/queries/mate-application";

/**
 * CMP-SCR004-APPLY-FLOW — SCR-004 "참가 신청 Form"(REQ-FUNC-034, 035).
 *
 * 로그인 여부와 이미 신청한 이력(PENDING/ACCEPTED)을 마운트 시 브라우저
 * Supabase 클라이언트로 먼저 확인한다 — `SA-MATE-APPLICATION`(`createMateApplicationAction`)
 * 은 `requireAdultUser()`를 호출해 비로그인 시 `/account`로 redirect하므로,
 * `CMP-SCR004-REPORT-BLOCK`에서 발견한 것과 같은 문제(비로그인 사용자가 인증
 * 필요 액션을 의도치 않게 트리거)를 여기서도 피한다. 중복 신청은 DB의 부분
 * 유니크 인덱스가 최종적으로 막지만, 이미 신청한 상태를 미리 보여주면 사용자
 * 경험이 더 명확하다. 메시지는 작성자·요청자 외 비공개(RLS
 * `mate_application_select_own_or_post_author`)이므로 이 컴포넌트 자체가 다른
 * 사람의 메시지를 노출할 방법이 없다.
 */

export interface ApplyFormProps {
  matePostId: string;
  onSuccess?: () => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "already_applied"; applicationStatus: "PENDING" | "ACCEPTED" }
  | { status: "ready" };

export default function ApplyForm({ matePostId, onSuccess }: ApplyFormProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "error"; message: string }
    | { status: "success" }
  >({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setLoadState({ status: "signed_out" });
        return;
      }

      const applications = await listMateApplicationsByApplicant(
        supabase,
        user.id,
      ).catch(() => []);
      if (cancelled) return;

      const existing = applications.find(
        (a) =>
          a.mate_post_id === matePostId &&
          (a.status === "PENDING" || a.status === "ACCEPTED"),
      );
      if (existing) {
        setLoadState({
          status: "already_applied",
          applicationStatus: existing.status as "PENDING" | "ACCEPTED",
        });
        return;
      }
      setLoadState({ status: "ready" });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [matePostId]);

  async function handleSubmit() {
    if (message.trim().length === 0) return;
    setSubmitState({ status: "submitting" });
    const result = await createMateApplicationAction(matePostId, message);
    if (result.error) {
      setSubmitState({ status: "error", message: result.error });
      return;
    }
    setSubmitState({ status: "success" });
    onSuccess?.();
  }

  if (loadState.status === "loading") {
    return <div className="h-24 animate-pulse rounded-md bg-surface-soft" />;
  }

  if (loadState.status === "signed_out") {
    return (
      <div className="rounded-md border border-hairline bg-surface-soft p-md text-center">
        <p className="text-body-md text-text-primary">
          참가 요청은 로그인 후 보낼 수 있어요
        </p>
        <Link
          href="/account"
          className="mt-sm inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          로그인하고 계속하기
        </Link>
      </div>
    );
  }

  if (loadState.status === "already_applied") {
    return (
      <div className="rounded-md border border-hairline bg-surface-soft p-md">
        <p className="text-body-md text-text-primary">
          {loadState.applicationStatus === "ACCEPTED"
            ? "이미 승인된 참가 요청이 있어요."
            : "이미 참가 요청을 보냈어요. 작성자 승인을 기다리고 있어요."}
        </p>
      </div>
    );
  }

  if (submitState.status === "success") {
    return (
      <div className="rounded-md border border-hairline bg-surface-soft p-md">
        <p className="text-body-md text-text-primary">
          참가 요청을 보냈어요. 작성자 승인을 기다려주세요.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-sm"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      aria-label="참가 요청"
    >
      <div>
        <label
          htmlFor="apply-message"
          className="block text-title-sm text-text-primary"
        >
          참가 메시지
        </label>
        <textarea
          id="apply-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="자기소개나 참가하고 싶은 이유를 남겨주세요."
          className="mt-xxs w-full rounded-sm border border-hairline px-sm py-xs text-body-md"
        />
        <p className="mt-xxs text-caption text-text-muted">
          {message.length}/500자
        </p>
      </div>

      {submitState.status === "error" ? (
        <p className="text-body-sm text-danger">{submitState.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={
          message.trim().length === 0 || submitState.status === "submitting"
        }
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
      >
        {submitState.status === "submitting"
          ? "요청 중..."
          : "참가 요청 보내기"}
      </button>
    </form>
  );
}
