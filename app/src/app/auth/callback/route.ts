import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * AUTH-EMAIL-ADULT — Supabase 이메일 인증/재설정 콜백(기술 Route, 5개 Screen
 * 수에 미포함). `signUp`/`requestPasswordReset`이 보낸 이메일 링크가 `?code=`와
 * 함께 여기로 돌아오면, 코드를 세션으로 교환한 뒤 `next`(기본 `/`)로 리다이렉트한다.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account?error=auth_callback_failed`);
}
