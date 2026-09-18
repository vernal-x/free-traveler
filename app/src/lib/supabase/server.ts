import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * DB-ACCESS — Server Component/Server Action 전용 Supabase 클라이언트.
 *
 * 요청 컨텍스트(쿠키) 기준으로 사용자 세션을 읽는다(`docs/ARCHITECTURE.md` §9).
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 사용한다 — Service Role Key가 필요한 서버
 * 전용 관리 작업은 이 헬퍼가 아니라 별도의 서버 전용 클라이언트(향후 필요 시
 * 해당 Task에서 추가)에서만 다룬다(`CLAUDE.md` 규칙 15).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 호출되면 쿠키를 쓸 수 없다 — 세션 갱신은
            // 미들웨어가 담당하므로 여기서는 무시한다(Supabase SSR 공식 패턴).
          }
        },
      },
    },
  );
}
