import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sanitizeText } from "./sanitize";

/** `supabase/migrations/0001_core_schema.sql`의 report 테이블과 1:1 대응. */
export interface ReportRow {
  id: string;
  reporter_id: string;
  target_type: "MATE_POST" | "USER" | "MATE_APPLICATION";
  target_id: string;
  reason_code: string;
  description: string | null;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  created_at: string;
  resolved_at: string | null;
}

const createReportSchema = z.object({
  reporterId: z.string().uuid(),
  targetType: z.enum(["MATE_POST", "USER", "MATE_APPLICATION"]),
  targetId: z.string().uuid(),
  reasonCode: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

/** REQ-FUNC-039: 사유코드+설명 신고, 접수번호(id) 즉시 반환. */
export async function createReport(
  client: SupabaseClient,
  input: CreateReportInput,
): Promise<ReportRow> {
  const parsed = createReportSchema.parse(input);

  const { data, error } = await client
    .from("report")
    .insert({
      reporter_id: parsed.reporterId,
      target_type: parsed.targetType,
      target_id: parsed.targetId,
      reason_code: parsed.reasonCode,
      description: parsed.description ? sanitizeText(parsed.description) : null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** REQ-FUNC-041(축소): 상태 필터만 지원(우선순위·증거첨부 큐는 범위 밖). */
export async function listReports(
  client: SupabaseClient,
  status?: ReportRow["status"],
): Promise<ReportRow[]> {
  let query = client.from("report").select("*");
  if (status) query = query.eq("status", status);

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return data ?? [];
}

/** REQ-FUNC-041/042: Moderator/Admin은 상태 변경만 수행(개별 제재 기능 없음, EXCLUDED). */
export async function updateReportStatus(
  client: SupabaseClient,
  id: string,
  status: "RESOLVED" | "DISMISSED",
): Promise<ReportRow> {
  const { data, error } = await client
    .from("report")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
