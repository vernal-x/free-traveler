import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/queries/user-profile";

/**
 * AUTH-EMAIL-ADULT — 쓰기 Server Action용 인증/성인 확인 가드.
 *
 * REQ-FUNC-027(미들웨어로 쓰기 API 보호)의 실제 강제 지점을 전역 middleware가
 * 아니라 각 쓰기 Server Action이 이 가드를 호출하는 방식으로 둔다 — Supabase의
 * 공식 권고(미들웨어는 세션 쿠키 갱신용, 인가 판단은 각 쓰기 지점에서)를 따른
 * 것이며, 이 Task의 Expected Files(`src/lib/auth/*.ts`)만으로 완결된다. Server
 * Action은 raw HTTP 응답을 만들지 않으므로 "401" 대신 `redirect()`로 SCR-005
 * (`/account`)로 보낸다(Security/Privacy AC: "401/리다이렉트" 중 리다이렉트 방식).
 */
export async function requireUser(client?: SupabaseClient): Promise<User> {
  const supabase = client ?? (await createClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account");
  }

  return user;
}

/** REQ-FUNC-027/028: 동행 쓰기 작업은 이메일 인증 + 성인 확인을 모두 요구한다. */
export async function requireAdultUser(client?: SupabaseClient): Promise<User> {
  const supabase = client ?? (await createClient());
  const user = await requireUser(supabase);

  const profile = await getUserProfile(supabase, user.id);
  if (!profile || !profile.is_adult || profile.account_status !== "ACTIVE") {
    redirect("/account");
  }

  return user;
}
