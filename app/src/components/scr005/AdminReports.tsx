"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listReportsAction,
  updateReportStatusAction,
} from "@/lib/actions/report";
import type { ReportRow } from "@/lib/supabase/queries/report";

/**
 * CMP-SCR005-ADMIN-REPORTS — SCR-005 `report_management` 탭(REQ-FUNC-041, 축소).
 *
 * 상태 필터 + 목록 + 상태 변경(OPEN → RESOLVED/DISMISSED)만 제공한다. 우선순위
 * 큐, 증거 첨부, 경고/계정정지 등 개별 제재 UI는 REQ-FUNC-042 EXCLUDED로
 * 이 Task 범위 밖이라 만들지 않는다. "Admin/Moderator만 접근"은 RLS
 * (`report_select_own_or_moderator`/`report_update_moderator_only`)가 실제
 * 경계를 강제하므로, 이 화면은 역할을 다시 판정하지 않는다 — 다만
 * `CMP-SCR005-ADMIN-URL-SETTINGS`에서 발견한 문제(마운트 시 무조건 인증 필요
 * 액션을 호출하면 비로그인 상태에서 `/account`로 리다이렉트되어 화면 전체가
 * 사라짐)와 같은 이유로, 로그인 여부를 클라이언트에서 먼저 확인한 뒤에만
 * `listReportsAction`을 호출한다.
 */

type StatusFilter = "ALL" | ReportRow["status"];

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "OPEN", label: "OPEN" },
  { value: "RESOLVED", label: "RESOLVED" },
  { value: "DISMISSED", label: "DISMISSED" },
];

const STATUS_BADGE: Record<ReportRow["status"], string> = {
  OPEN: "bg-warning",
  RESOLVED: "bg-success",
  DISMISSED: "bg-text-muted",
};

function StatusBadge({ status }: { status: ReportRow["status"] }) {
  return (
    <span
      className={`rounded-pill px-xs py-0 text-badge text-on-primary ${STATUS_BADGE[status]}`}
    >
      {status}
    </span>
  );
}

export default function AdminReports() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReports = useCallback(async (nextFilter: StatusFilter) => {
    const rows = await listReportsAction(
      nextFilter === "ALL" ? undefined : nextFilter,
    );
    setReports(rows);
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
        setIsSignedIn(false);
        setLoaded(true);
        return;
      }
      setIsSignedIn(true);
      await loadReports(filter);
      if (cancelled) return;
      setLoaded(true);
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFilterChange(nextFilter: StatusFilter) {
    setFilter(nextFilter);
    setLoaded(false);
    await loadReports(nextFilter);
    setLoaded(true);
  }

  async function handleStatusChange(
    id: string,
    status: "RESOLVED" | "DISMISSED",
  ) {
    setUpdatingId(id);
    setErrorMessage(null);
    const result = await updateReportStatusAction(id, status);
    if (result.error) {
      setErrorMessage(result.error);
      setUpdatingId(null);
      return;
    }
    await loadReports(filter);
    setUpdatingId(null);
  }

  if (!loaded) {
    return <div className="h-40 animate-pulse rounded-md bg-surface-soft" />;
  }

  if (!isSignedIn) {
    return (
      <p className="text-body-md text-text-secondary">
        로그인 후 이용할 수 있습니다.
      </p>
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex flex-wrap gap-xs">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => handleFilterChange(f.value)}
            className={`h-9 rounded-pill border px-md text-body-sm ${
              filter === f.value
                ? "border-primary bg-primary-tint text-primary-active"
                : "border-border-strong bg-canvas text-text-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {errorMessage ? (
        <p className="text-caption text-danger">{errorMessage}</p>
      ) : null}

      {reports.length === 0 ? (
        <div className="rounded-md bg-surface-soft p-lg text-center">
          <p className="text-body-md text-text-secondary">
            해당 조건의 신고가 없습니다.
          </p>
        </div>
      ) : (
        <ul className="space-y-sm">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded-md border border-hairline p-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-xs">
                <div className="flex items-center gap-xs">
                  <StatusBadge status={report.status} />
                  <span className="text-body-sm text-text-secondary">
                    {report.target_type} · {report.reason_code}
                  </span>
                </div>
                <span className="text-caption text-text-muted">
                  {new Date(report.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <p className="mt-xs text-caption text-text-muted">
                대상 ID: {report.target_id}
              </p>
              {report.description ? (
                <p className="mt-xs text-body-sm text-text-primary">
                  {report.description}
                </p>
              ) : null}
              {report.status === "OPEN" ? (
                <div className="mt-sm flex gap-xs">
                  <button
                    type="button"
                    disabled={updatingId === report.id}
                    onClick={() => handleStatusChange(report.id, "RESOLVED")}
                    className="inline-flex h-9 items-center justify-center rounded-sm bg-primary px-md text-button text-on-primary disabled:opacity-40"
                  >
                    해결 처리
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === report.id}
                    onClick={() => handleStatusChange(report.id, "DISMISSED")}
                    className="inline-flex h-9 items-center justify-center rounded-sm border border-border-strong bg-canvas px-md text-button text-text-primary disabled:opacity-40"
                  >
                    기각
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
