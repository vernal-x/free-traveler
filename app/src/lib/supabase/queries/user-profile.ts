import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sanitizeText } from "./sanitize";

/** `supabase/migrations/0001_core_schema.sql`의 user_profile 테이블과 1:1 대응. */
export interface UserProfileRow {
  id: string;
  nickname: string;
  age_group: string;
  gender: string | null;
  travel_style: string[];
  bio: string | null;
  is_adult: boolean;
  adult_verified_at: string | null;
  account_status: "ACTIVE" | "DELETED";
  role: "MEMBER" | "MODERATOR" | "ADMIN";
  created_at: string;
  updated_at: string;
}

const createUserProfileSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string().min(1).max(30),
  ageGroup: z.string().min(1),
  gender: z.string().max(20).optional(),
  travelStyle: z.array(z.string()).default([]),
  bio: z.string().max(1000).optional(),
});

const updateUserProfileSchema = z.object({
  nickname: z.string().min(1).max(30).optional(),
  ageGroup: z.string().min(1).optional(),
  gender: z.string().max(20).nullable().optional(),
  travelStyle: z.array(z.string()).optional(),
  bio: z.string().max(1000).nullable().optional(),
});

export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export async function getUserProfile(
  client: SupabaseClient,
  id: string,
): Promise<UserProfileRow | null> {
  const { data, error } = await client
    .from("user_profile")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** REQ-FUNC-029: 회원가입 직후 닉네임/연령대/여행스타일 필수, 성별 선택으로 프로필 생성. */
export async function createUserProfile(
  client: SupabaseClient,
  input: CreateUserProfileInput,
): Promise<UserProfileRow> {
  const parsed = createUserProfileSchema.parse(input);

  const { data, error } = await client
    .from("user_profile")
    .insert({
      id: parsed.id,
      nickname: sanitizeText(parsed.nickname),
      age_group: parsed.ageGroup,
      gender: parsed.gender ? sanitizeText(parsed.gender) : null,
      travel_style: parsed.travelStyle,
      bio: parsed.bio ? sanitizeText(parsed.bio) : null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  client: SupabaseClient,
  id: string,
  input: UpdateUserProfileInput,
): Promise<UserProfileRow> {
  const parsed = updateUserProfileSchema.parse(input);

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.nickname !== undefined)
    patch.nickname = sanitizeText(parsed.nickname);
  if (parsed.ageGroup !== undefined) patch.age_group = parsed.ageGroup;
  if (parsed.gender !== undefined) {
    patch.gender = parsed.gender ? sanitizeText(parsed.gender) : null;
  }
  if (parsed.travelStyle !== undefined) patch.travel_style = parsed.travelStyle;
  if (parsed.bio !== undefined)
    patch.bio = parsed.bio ? sanitizeText(parsed.bio) : null;

  const { data, error } = await client
    .from("user_profile")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** REQ-FUNC-028: 성인 확인 완료 시각만 저장(생년월일 미저장). */
export async function markUserAdultVerified(
  client: SupabaseClient,
  id: string,
): Promise<UserProfileRow> {
  const { data, error } = await client
    .from("user_profile")
    .update({
      is_adult: true,
      adult_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** REQ-FUNC-045(축소): 탈퇴 시 즉시 비식별화. */
export async function deidentifyUserProfile(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from("user_profile")
    .update({
      nickname: "탈퇴한 사용자",
      gender: null,
      bio: null,
      account_status: "DELETED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
