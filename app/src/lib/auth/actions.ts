"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { markUserAdultVerified } from "@/lib/supabase/queries/user-profile";
import {
  requestPasswordResetSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  type RequestPasswordResetInput,
  type SignInInput,
  type SignUpInput,
  type UpdatePasswordInput,
} from "./schemas";
import { requireUser } from "./guards";

export interface AuthActionResult {
  error: string | null;
}

/** 배포 환경(Vercel Preview 포함)마다 다른 도메인에서도 올바로 동작하도록,
 * 고정 환경변수 대신 요청 헤더에서 origin을 계산한다. */
async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return host ? `${protocol}://${host}` : "";
}

/**
 * REQ-FUNC-066: 이메일 가입. 이메일 확인 링크는 `src/app/auth/callback/route.ts`로
 * 돌아온다. 가입 직후에는 아직 닉네임/연령대가 없어 `public.user_profile` 행을 여기서
 * 만들지 않는다 — 프로필 입력 폼(향후 `CMP-SCR005-PROFILE` 등)이 최초 입력 시 생성한다.
 */
export async function signUp(input: SignUpInput): Promise<AuthActionResult> {
  const parsed = signUpSchema.parse(input);
  const supabase = await createClient();

  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  return { error: error?.message ?? null };
}

export async function signIn(input: SignInInput): Promise<AuthActionResult> {
  const parsed = signInSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  input: RequestPasswordResetInput,
): Promise<AuthActionResult> {
  const parsed = requestPasswordResetSchema.parse(input);
  const supabase = await createClient();

  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
    redirectTo: `${origin}/auth/callback?next=/account`,
  });

  return { error: error?.message ?? null };
}

/** 재설정 링크로 돌아온 뒤(이미 인증 세션 있음) 새 비밀번호로 갱신한다. */
export async function updatePassword(
  input: UpdatePasswordInput,
): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.parse(input);
  const supabase = await createClient();
  await requireUser(supabase);

  const { error } = await supabase.auth.updateUser({
    password: parsed.password,
  });

  return { error: error?.message ?? null };
}

/**
 * REQ-FUNC-028: 성인 확인 단계. 정확한 생년월일은 입력받지 않고 "만 19세 이상"
 * 자기 확인 체크만으로 `is_adult`/`adult_verified_at`을 저장한다.
 */
export async function confirmAdult(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  try {
    await markUserAdultVerified(supabase, user.id);
    return { error: null };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "성인 확인 처리에 실패했습니다.",
    };
  }
}
