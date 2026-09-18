import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

/** `supabase/migrations/0001_core_schema.sql`의 user_block 테이블과 1:1 대응. */
export interface UserBlockRow {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

const createUserBlockSchema = z
  .object({
    blockerId: z.string().uuid(),
    blockedId: z.string().uuid(),
  })
  .refine((v) => v.blockerId !== v.blockedId, {
    message: "자기 자신을 차단할 수 없습니다",
    path: ["blockedId"],
  });

export type CreateUserBlockInput = z.infer<typeof createUserBlockSchema>;

/** REQ-FUNC-040: 사용자 차단. */
export async function createUserBlock(
  client: SupabaseClient,
  input: CreateUserBlockInput,
): Promise<UserBlockRow> {
  const parsed = createUserBlockSchema.parse(input);

  const { data, error } = await client
    .from("user_block")
    .insert({ blocker_id: parsed.blockerId, blocked_id: parsed.blockedId })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUserBlock(
  client: SupabaseClient,
  blockerId: string,
  blockedId: string,
): Promise<void> {
  const { error } = await client
    .from("user_block")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId);

  if (error) throw error;
}

/** 차단한 상대 id 목록. `listMatePosts`의 `excludeAuthorIds` 등에 사용(REQ-FUNC-030). */
export async function listBlockedUserIds(
  client: SupabaseClient,
  blockerId: string,
): Promise<string[]> {
  const { data, error } = await client
    .from("user_block")
    .select("blocked_id")
    .eq("blocker_id", blockerId);

  if (error) throw error;
  return (data ?? []).map((row: { blocked_id: string }) => row.blocked_id);
}
