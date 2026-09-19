"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import {
  createReport,
  listReports,
  updateReportStatus,
  type ReportRow,
} from "@/lib/supabase/queries/report";

/**
 * SA-REPORT — 신고 접수 + 상태 변경 Server Action.
 *
 * "신고자/피신고자 상세는 Moderator/Admin만"(TC-2)은 RLS
 * (`report_select_own_or_moderator`/`report_update_moderator_only`)가 실제
 * 경계를 강제한다 — 신고자 본인은 자신이 낸 신고만 보이고(자기 것이니 당연히
 * 허용), 그 외 전체 목록·상태 변경은 Moderator/Admin만 가능하다. 일반 회원이
 * `updateReportStatusAction`을 호출하면 RLS가 0건을 갱신해 `.single()`이 에러를
 * 던지므로 이 계층에서 별도 역할 검사를 반복하지 않는다. 개별 제재 기능은
 * 범위 밖(EXCLUDED)이라 상태 변경(OPEN→RESOLVED/DISMISSED)만 지원한다.
 */

export interface ReportActionResult {
  error: string | null;
  reportId?: string;
}

export async function createReportAction(input: {
  targetType: ReportRow["target_type"];
  targetId: string;
  reasonCode: string;
  description?: string;
}): Promise<ReportActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  try {
    const report = await createReport(supabase, {
      reporterId: user.id,
      targetType: input.targetType,
      targetId: input.targetId,
      reasonCode: input.reasonCode,
      description: input.description,
    });
    revalidatePath("/mates");
    return { error: null, reportId: report.id };
  } catch {
    return { error: "신고 접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}

/** Moderator/Admin 전용 — RLS가 그 외 역할에는 본인이 낸 신고만 반환한다. */
export async function listReportsAction(
  status?: ReportRow["status"],
): Promise<ReportRow[]> {
  await requireUser();
  const supabase = await createClient();
  return listReports(supabase, status);
}

export async function updateReportStatusAction(
  id: string,
  status: "RESOLVED" | "DISMISSED",
): Promise<ReportActionResult> {
  await requireUser();
  const supabase = await createClient();

  try {
    await updateReportStatus(supabase, id, status);
    revalidatePath("/account");
    return { error: null, reportId: id };
  } catch {
    return {
      error: "권한이 없거나 처리 중 문제가 발생했습니다.",
    };
  }
}
