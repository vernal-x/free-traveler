import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sanitizeText } from "./sanitize";

/** `supabase/migrations/0001_core_schema.sql`의 mate_post 테이블과 1:1 대응. */
export interface MatePostRow {
  id: string;
  author_id: string;
  title: string;
  country_code: string;
  region: string | null;
  start_date: string;
  end_date: string;
  headcount: number;
  preferred_conditions: string | null;
  travel_style: string[];
  description: string;
  safety_rules_agreed_at: string;
  status: "RECRUITING" | "CLOSED";
  created_at: string;
  updated_at: string;
}

/**
 * REQ-FUNC-037: 배치 잡 없이 조회 시 end_date 경과 여부로 CLOSED를 계산한다.
 * DB의 `status` 컬럼은 작성자의 수동 마감만 반영하고, 이 함수가 날짜 경과를 더해
 * 화면에 보여줄 최종 상태를 만든다.
 */
export function resolveMatePostDisplayStatus(
  row: Pick<MatePostRow, "status" | "end_date">,
): "RECRUITING" | "CLOSED" {
  if (row.status === "CLOSED") return "CLOSED";
  const today = new Date().toISOString().slice(0, 10);
  return row.end_date < today ? "CLOSED" : "RECRUITING";
}

const createMatePostSchema = z
  .object({
    authorId: z.string().uuid(),
    title: z.string().min(1).max(80),
    countryCode: z.string().min(2).max(2),
    region: z.string().max(80).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    headcount: z.number().int().positive(),
    preferredConditions: z.string().max(500).optional(),
    travelStyle: z.array(z.string()).default([]),
    description: z.string().min(1).max(3000),
    safetyRulesAgreedAt: z.string().datetime(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "종료일은 시작일보다 빠를 수 없습니다",
    path: ["endDate"],
  });

export type CreateMatePostInput = z.infer<typeof createMatePostSchema>;

export interface ListMatePostsFilters {
  countryCode?: string;
  region?: string;
  status?: "RECRUITING" | "CLOSED";
  excludeAuthorIds?: string[];
  limit?: number;
  offset?: number;
}

/** REQ-FUNC-031, 032, 080: 필수 필드·날짜·연락처 패턴 탐지는 Server Action(SA-MATE-POST)의 몫이다. */
export async function createMatePost(
  client: SupabaseClient,
  input: CreateMatePostInput,
): Promise<MatePostRow> {
  const parsed = createMatePostSchema.parse(input);

  const { data, error } = await client
    .from("mate_post")
    .insert({
      author_id: parsed.authorId,
      title: sanitizeText(parsed.title),
      country_code: parsed.countryCode,
      region: parsed.region ? sanitizeText(parsed.region) : null,
      start_date: parsed.startDate,
      end_date: parsed.endDate,
      headcount: parsed.headcount,
      preferred_conditions: parsed.preferredConditions
        ? sanitizeText(parsed.preferredConditions)
        : null,
      travel_style: parsed.travelStyle,
      description: sanitizeText(parsed.description),
      safety_rules_agreed_at: parsed.safetyRulesAgreedAt,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getMatePostById(
  client: SupabaseClient,
  id: string,
): Promise<MatePostRow | null> {
  const { data, error } = await client
    .from("mate_post")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** REQ-FUNC-030: 국가·지역·모집상태 필터, 차단 사용자 글 제외. */
export async function listMatePosts(
  client: SupabaseClient,
  filters: ListMatePostsFilters = {},
): Promise<MatePostRow[]> {
  let query = client.from("mate_post").select("*");

  if (filters.countryCode)
    query = query.eq("country_code", filters.countryCode);
  if (filters.region) query = query.eq("region", filters.region);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.excludeAuthorIds && filters.excludeAuthorIds.length > 0) {
    query = query.not(
      "author_id",
      "in",
      `(${filters.excludeAuthorIds.join(",")})`,
    );
  }

  query = query
    .order("created_at", { ascending: false })
    .range(
      filters.offset ?? 0,
      (filters.offset ?? 0) + (filters.limit ?? 20) - 1,
    );

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

const updateMatePostSchema = z.object({
  title: z.string().min(1).max(80).optional(),
  description: z.string().min(1).max(3000).optional(),
  preferredConditions: z.string().max(500).nullable().optional(),
  headcount: z.number().int().positive().optional(),
  status: z.enum(["RECRUITING", "CLOSED"]).optional(),
});

export type UpdateMatePostInput = z.infer<typeof updateMatePostSchema>;

/** REQ-FUNC-038: 작성자가 수동으로 마감/수정한다(작성자 검증은 RLS·호출측 책임). */
export async function updateMatePost(
  client: SupabaseClient,
  id: string,
  input: UpdateMatePostInput,
): Promise<MatePostRow> {
  const parsed = updateMatePostSchema.parse(input);

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.title !== undefined) patch.title = sanitizeText(parsed.title);
  if (parsed.description !== undefined) {
    patch.description = sanitizeText(parsed.description);
  }
  if (parsed.preferredConditions !== undefined) {
    patch.preferred_conditions = parsed.preferredConditions
      ? sanitizeText(parsed.preferredConditions)
      : null;
  }
  if (parsed.headcount !== undefined) patch.headcount = parsed.headcount;
  if (parsed.status !== undefined) patch.status = parsed.status;

  const { data, error } = await client
    .from("mate_post")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMatePost(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client.from("mate_post").delete().eq("id", id);
  if (error) throw error;
}
