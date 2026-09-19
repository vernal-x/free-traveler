"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createReportAction } from "@/lib/actions/report";
import {
  blockUserAction,
  unblockUserAction,
  getMyBlockedUserIds,
} from "@/lib/actions/block";
import type { ReportRow } from "@/lib/supabase/queries/report";

/**
 * CMP-SCR004-REPORT-BLOCK — "신고 폼 + 차단/해제 진입점"(REQ-FUNC-039, 040).
 *
 * 신고 접수는 `SA-REPORT`(`createReportAction`)를 그대로 호출하며, 접수번호는
 * Server Action 응답을 받는 즉시 표시한다(REQ-NF-019가 단건 insert로 지연을
 * 최소화하도록 이미 설계돼 있어 별도 로딩 지연 시뮬레이션이 필요 없다).
 * 차단/해제는 `SA-BLOCK`을 그대로 호출하고, 현재 차단 여부는 마운트 시
 * `getMyBlockedUserIds`로 확인한다.
 */

const REASON_CODES = [
  { value: "SPAM", label: "스팸/광고성 게시물" },
  { value: "CONTACT_INFO_EXPOSED", label: "연락처 등 개인정보 노출" },
  { value: "INAPPROPRIATE_CONTENT", label: "부적절한 콘텐츠" },
  { value: "SAFETY_CONCERN", label: "안전 우려" },
  { value: "OTHER", label: "기타" },
] as const;

export interface ReportFormProps {
  targetType: ReportRow["target_type"];
  targetId: string;
  /** 신고 대상과 함께 차단할 사용자(작성자 등)가 있으면 전달한다. */
  reportedUserId?: string;
}

export default function ReportForm({
  targetType,
  targetId,
  reportedUserId,
}: ReportFormProps) {
  const [reasonCode, setReasonCode] = useState<string>(REASON_CODES[0].value);
  const [description, setDescription] = useState("");
  const [submitState, setSubmitState] = useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "error"; message: string }
    | { status: "success"; reportId: string }
  >({ status: "idle" });

  const [isBlocked, setIsBlocked] = useState(false);
  const [blockPending, setBlockPending] = useState(false);

  useEffect(() => {
    const targetUserId = reportedUserId;
    if (!targetUserId) return;
    let cancelled = false;

    async function checkBlockStatus(userId: string) {
      // `getMyBlockedUserIds`는 인증을 요구해 비로그인 사용자에게는
      // `requireUser()`가 `/account`로 redirect한다 — 이 폼은 비로그인
      // 사용자에게도 노출될 수 있으므로, 로그인 여부를 먼저 클라이언트에서
      // 확인한 뒤에만 호출한다.
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const ids = await getMyBlockedUserIds().catch((): string[] => []);
      if (!cancelled) setIsBlocked(ids.includes(userId));
    }

    checkBlockStatus(targetUserId);
    return () => {
      cancelled = true;
    };
  }, [reportedUserId]);

  async function handleSubmit() {
    setSubmitState({ status: "submitting" });
    const result = await createReportAction({
      targetType,
      targetId,
      reasonCode,
      description: description || undefined,
    });
    if (result.error || !result.reportId) {
      setSubmitState({
        status: "error",
        message: result.error ?? "신고 접수 중 문제가 발생했습니다.",
      });
      return;
    }
    setSubmitState({ status: "success", reportId: result.reportId });
  }

  async function handleToggleBlock() {
    if (!reportedUserId) return;
    setBlockPending(true);
    const result = isBlocked
      ? await unblockUserAction(reportedUserId)
      : await blockUserAction(reportedUserId);
    setBlockPending(false);
    if (!result.error) setIsBlocked(!isBlocked);
  }

  return (
    <div className="rounded-md border border-hairline p-md">
      {submitState.status === "success" ? (
        <div className="rounded-sm bg-surface-soft p-sm">
          <p className="text-title-sm text-text-primary">
            신고가 접수되었습니다
          </p>
          <p className="mt-xxs text-body-sm text-text-secondary">
            접수번호: {submitState.reportId}
          </p>
        </div>
      ) : (
        <form
          className="space-y-sm"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          aria-label="신고하기"
        >
          <div>
            <label
              htmlFor="report-reason"
              className="block text-title-sm text-text-primary"
            >
              신고 사유
            </label>
            <select
              id="report-reason"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="mt-xxs h-11 w-full rounded-sm border border-hairline px-sm text-body-sm"
            >
              {REASON_CODES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="report-description"
              className="block text-title-sm text-text-primary"
            >
              상세 설명(선택)
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={3}
              className="mt-xxs w-full rounded-sm border border-hairline px-sm py-xs text-body-sm"
            />
          </div>

          {submitState.status === "error" ? (
            <p className="text-body-sm text-danger">{submitState.message}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitState.status === "submitting"}
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
          >
            {submitState.status === "submitting" ? "접수 중..." : "신고하기"}
          </button>
        </form>
      )}

      {reportedUserId ? (
        <button
          type="button"
          onClick={handleToggleBlock}
          disabled={blockPending}
          className="mt-sm inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary disabled:opacity-40"
        >
          {isBlocked ? "차단 해제" : "이 사용자 차단하기"}
        </button>
      ) : null}
    </div>
  );
}
