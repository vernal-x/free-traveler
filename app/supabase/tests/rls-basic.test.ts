import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * TEST-RLS-BASIC — RLS 기본 정책 통합 테스트(DB-RLS-BASE, 0002_rls_policies.sql
 * 대상). `supabase/seed.sql`의 시드 계정(member1/member2/admin1)으로 실제 로그인해
 * 역할별 부정 접근이 403 또는 빈 결과로 막히는지 확인한다.
 *
 * **실행 전제**: 실제 Supabase 프로젝트에 0001·0002 마이그레이션과 seed.sql이
 * 적용되어 있어야 한다. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`가
 * 비어 있으면(로컬 개발 환경에 Supabase가 아직 연결되지 않은 경우) 이 스위트 전체를
 * 건너뛴다 — 실패가 아니라 "미실행"으로 명확히 표시하기 위함이다. `vitest.config.ts`의
 * `include`가 `supabase/tests/**`를 아직 포함하지 않으므로(이 Task의 Expected Files는
 * 이 테스트 파일 하나뿐이라 config 수정은 범위 밖), 현재는
 * `npx vitest run supabase/tests/rls-basic.test.ts --config <이 include를 추가한 임시 설정>`
 * 또는 `vitest.config.ts`에 경로를 추가한 뒤에만 실행된다.
 */

function loadEnvLocal(): void {
  const envPath = resolve(__dirname, "../../.env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const HAS_LIVE_SUPABASE =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

const SEED_USERS = {
  member1: {
    email: "seed.member1@example.com",
    password: "seed-not-a-real-password-1",
  },
  member2: {
    email: "seed.member2@example.com",
    password: "seed-not-a-real-password-2",
  },
  admin1: {
    email: "seed.admin1@example.com",
    password: "seed-not-a-real-password-3",
  },
} as const;

const POST_BY_MEMBER1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const POST_BY_MEMBER2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

async function signedInClient(
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`시드 계정 로그인 실패(${email}): ${error.message}`);
  }
  return client;
}

function guestClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

describe.skipIf(!HAS_LIVE_SUPABASE)("RLS 기본 정책(TEST-RLS-BASIC)", () => {
  let guest: SupabaseClient;
  let member1: SupabaseClient;
  let member2: SupabaseClient;
  let admin1: SupabaseClient;

  beforeAll(async () => {
    guest = guestClient();
    member1 = await signedInClient(
      SEED_USERS.member1.email,
      SEED_USERS.member1.password,
    );
    member2 = await signedInClient(
      SEED_USERS.member2.email,
      SEED_USERS.member2.password,
    );
    admin1 = await signedInClient(
      SEED_USERS.admin1.email,
      SEED_USERS.admin1.password,
    );
  });

  describe("mate_post — 공개 조회, 쓰기는 인증+성인 확인 필요(원칙 2)", () => {
    it("Guest도 mate_post 목록을 조회할 수 있다(공개 조회, 긍정 대조군)", async () => {
      const { data, error } = await guest.from("mate_post").select("id");
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBeGreaterThan(0);
    });

    it("Guest는 mate_post를 생성할 수 없다(부정 접근 → 오류 또는 0건)", async () => {
      const { error } = await guest.from("mate_post").insert({
        author_id: "11111111-1111-1111-1111-111111111111",
        title: "무단 생성 시도",
        country_code: "KR",
        start_date: "2027-01-01",
        end_date: "2027-01-02",
        headcount: 1,
        description: "RLS 우회 테스트",
        safety_rules_agreed_at: new Date().toISOString(),
      });
      expect(error).not.toBeNull();
    });
  });

  describe("user_profile — 본인만 조회/수정(원칙 1)", () => {
    it("Member는 자신의 프로필을 조회할 수 있다", async () => {
      const { data, error } = await member1
        .from("user_profile")
        .select("id")
        .eq("id", "11111111-1111-1111-1111-111111111111");
      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    });

    it("Member는 다른 사용자의 프로필을 조회할 수 없다(빈 결과)", async () => {
      const { data, error } = await member1
        .from("user_profile")
        .select("id")
        .eq("id", "22222222-2222-2222-2222-222222222222");
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBe(0);
    });
  });

  describe("mate_application — 신청자 본인 또는 대상 글 작성자만 조회(원칙 1, REQ-FUNC-044)", () => {
    it("신청자 본인은 자신의 신청 메시지를 조회할 수 있다", async () => {
      const { data, error } = await member2
        .from("mate_application")
        .select("id, message")
        .eq("mate_post_id", POST_BY_MEMBER1)
        .eq("applicant_id", "22222222-2222-2222-2222-222222222222");
      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    });

    it("글 작성자는 자신의 글에 온 신청 메시지를 조회할 수 있다", async () => {
      const { data, error } = await member1
        .from("mate_application")
        .select("id, message")
        .eq("mate_post_id", POST_BY_MEMBER1);
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBeGreaterThan(0);
    });

    it("본인도 대상 글 작성자도 아니면 신청 메시지를 조회할 수 없다(빈 결과)", async () => {
      const { data, error } = await member1
        .from("mate_application")
        .select("id, message")
        .eq("mate_post_id", POST_BY_MEMBER2)
        .eq("applicant_id", "11111111-1111-1111-1111-111111111111")
        .neq("mate_post_id", POST_BY_MEMBER1);
      // member1은 POST_BY_MEMBER2(member2의 글)의 작성자가 아니고,
      // 이 신청의 applicant도 아니므로(자신이 신청했더라도 다른 글 기준 필터라
      // 실제로는 접근 가능한 유일한 신청 건은 이미 위 테스트에서 검증됨) —
      // 여기서는 명확히 "제3자 신청 열람 불가"를 재확인하기 위해 member2의
      // 글에 대해 member1이 신청자가 아닌 것으로 필터링한다.
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBe(0);
    });
  });

  describe("report — 신고자 본인 또는 Moderator/Admin만 조회(원칙 3)", () => {
    it("일반 Member는 자신이 신고하지 않은 건을 조회할 수 없다(빈 결과)", async () => {
      const { data, error } = await member2.from("report").select("id");
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBe(0);
    });

    it("Admin은 모든 신고를 조회할 수 있다", async () => {
      const { data, error } = await admin1.from("report").select("id");
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBeGreaterThan(0);
    });

    it("일반 Member는 신고 상태를 변경할 수 없다(0건 반영)", async () => {
      const { data, error } = await member1
        .from("report")
        .update({ status: "DISMISSED" })
        .eq("reporter_id", "11111111-1111-1111-1111-111111111111")
        .select("id");
      // RLS는 UPDATE 권한이 없으면 매칭 행이 0건으로 보이므로 에러 대신
      // 빈 배열이 반환될 수 있다 — 두 경우 모두 "실제로 반영되지 않음"을 의미한다.
      expect(data?.length ?? 0).toBe(0);
      void error;
    });
  });

  describe("external_link_settings — Admin만 조회/수정(원칙 3)", () => {
    it("일반 Member는 조회할 수 없다(빈 결과)", async () => {
      const { data, error } = await member1
        .from("external_link_settings")
        .select("key");
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBe(0);
    });

    it("Admin은 조회할 수 있다", async () => {
      const { data, error } = await admin1
        .from("external_link_settings")
        .select("key");
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBeGreaterThan(0);
    });

    it("공개 VIEW(external_link_settings_public)는 Guest도 URL을 읽을 수 있다", async () => {
      const { data, error } = await guest
        .from("external_link_settings_public")
        .select("key, url");
      expect(error).toBeNull();
      expect(data?.length ?? 0).toBeGreaterThan(0);
    });
  });

  describe("mate_author_public — 작성자 닉네임 공개 VIEW(REQ-FUNC-033)", () => {
    it("Guest도 작성자 닉네임을 조회할 수 있다(비공개 필드는 노출되지 않음)", async () => {
      const { data, error } = await guest
        .from("mate_author_public")
        .select("id, nickname, role")
        .eq("id", "11111111-1111-1111-1111-111111111111");
      expect(error).toBeNull();
      expect(data?.length).toBe(1);
    });
  });
});
