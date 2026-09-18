import { createBrowserClient } from "@supabase/ssr";

/**
 * DB-ACCESS — Browser(Client Component) 전용 Supabase 클라이언트.
 *
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 사용하며(RLS로 제한된 권한), 절대
 * `SUPABASE_SERVICE_ROLE_KEY`를 여기서 참조하지 않는다(`CLAUDE.md` 규칙 15,
 * `docs/ARCHITECTURE.md` §9).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
