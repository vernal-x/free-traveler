import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sanitizeText } from "./sanitize";

/** `supabase/migrations/0001_core_schema.sql`의 mate_application 테이블과 1:1 대응. */
export interface MateApplicationRow {
  id: string;
  mate_post_id: string;
  applicant_id: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  created_at: string;
  updated_at: string;
}

const createMateApplicationSchema = z.object({
  matePostId: z.string().uuid(),
  applicantId: z.string().uuid(),
  message: z.string().min(1).max(500),
});

export type CreateMateApplicationInput = z.infer<
  typeof createMateApplicationSchema
>;

/**
 * REQ-FUNC-034, 035: 500자 이하 비공개 메시지, PENDING 저장. 동일 사용자의 동일 글
 * 중복 PENDING/ACCEPTED 요청은 `mate_application_unique_active_idx`(부분 유니크
 * 인덱스)가 DB 레벨에서 차단하며, 위반 시 Postgres가 unique violation 에러를 던진다.
 */
export async function createMateApplication(
  client: SupabaseClient,
  input: CreateMateApplicationInput,
): Promise<MateApplicationRow> {
  const parsed = createMateApplicationSchema.parse(input);

  const { data, error } = await client
    .from("mate_application")
    .insert({
      mate_post_id: parsed.matePostId,
      applicant_id: parsed.applicantId,
      message: sanitizeText(parsed.message),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getMateApplicationById(
  client: SupabaseClient,
  id: string,
): Promise<MateApplicationRow | null> {
  const { data, error } = await client
    .from("mate_application")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listMateApplicationsForPost(
  client: SupabaseClient,
  matePostId: string,
): Promise<MateApplicationRow[]> {
  const { data, error } = await client
    .from("mate_application")
    .select("*")
    .eq("mate_post_id", matePostId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listMateApplicationsByApplicant(
  client: SupabaseClient,
  applicantId: string,
): Promise<MateApplicationRow[]> {
  const { data, error } = await client
    .from("mate_application")
    .select("*")
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** REQ-FUNC-036: 작성자만 ACCEPTED/REJECTED로 전환(작성자 검증은 RLS·호출측 책임). */
export async function updateMateApplicationStatus(
  client: SupabaseClient,
  id: string,
  status: MateApplicationRow["status"],
): Promise<MateApplicationRow> {
  const { data, error } = await client
    .from("mate_application")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
