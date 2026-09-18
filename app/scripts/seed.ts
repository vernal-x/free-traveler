import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

/**
 * DB-SEED-BASE — 로컬 개발/QA용 합성(synthetic) 시드 데이터.
 *
 * `supabase/seed.sql`(순수 SQL로 `auth.users`에 직접 INSERT하는 방식)을 대체한다 —
 * 실제 프로젝트에 적용해보니 `auth.identities` 등 GoTrue 내부 스키마가 버전마다
 * 달라 로그인 자체가 500 에러로 실패했다. 이 스크립트는 Supabase Admin API
 * (`auth.admin.createUser`)를 사용해 항상 올바른 내부 스키마로 계정을 생성한다
 * (Expected Files가 애초에 `supabase/seed.sql` **또는** `scripts/seed.ts`를
 * 허용했으므로, 검증 결과에 따라 후자로 전환한다).
 *
 * 실행: `npx tsx scripts/seed.ts` — `SUPABASE_SERVICE_ROLE_KEY`가 필요하다
 * (RLS를 우회해 시드 데이터를 넣기 위함, `CLAUDE.md` 규칙 15에 따라 이 키는 이
 * 서버 전용 스크립트 밖으로 나가지 않는다). 실제 개인정보를 전혀 포함하지 않는다
 * (Security/Privacy AC) — 모든 이메일은 `@example.com`이다. 여러 번 실행해도
 * 안전하도록(idempotent) upsert만 사용한다.
 */

function loadEnvLocal(): void {
  const envPath = resolve(__dirname, "../.env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "✗ NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다(.env.local 확인).",
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_USERS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "seed.member1@example.com",
    password: "seed-not-a-real-password-1",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "seed.member2@example.com",
    password: "seed-not-a-real-password-2",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "seed.admin1@example.com",
    password: "seed-not-a-real-password-3",
  },
] as const;

const POST_BY_MEMBER1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const POST_BY_MEMBER2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

async function seedAuthUsers(): Promise<void> {
  for (const user of SEED_USERS) {
    const { error } = await admin.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (
      error &&
      !error.message.toLowerCase().includes("already been registered")
    ) {
      throw new Error(`시드 계정 생성 실패(${user.email}): ${error.message}`);
    }
    console.log(`✓ auth user ready: ${user.email}`);
  }
}

async function seedUserProfiles(): Promise<void> {
  const { error } = await admin.from("user_profile").upsert(
    [
      {
        id: "11111111-1111-1111-1111-111111111111",
        nickname: "여행러구름",
        age_group: "30대",
        gender: null,
        travel_style: ["배낭여행", "자연·힐링"],
        bio: "동남아 배낭여행을 좋아하는 시드 계정입니다(합성 데이터).",
        is_adult: true,
        adult_verified_at: new Date().toISOString(),
        account_status: "ACTIVE",
        role: "MEMBER",
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        nickname: "별빛여행자",
        age_group: "20대",
        gender: "여성",
        travel_style: ["커플 여행", "미식 탐방"],
        bio: "유럽 미식 여행 동행을 찾는 시드 계정입니다(합성 데이터).",
        is_adult: true,
        adult_verified_at: new Date().toISOString(),
        account_status: "ACTIVE",
        role: "MEMBER",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        nickname: "운영자시드",
        age_group: "40대",
        gender: null,
        travel_style: [],
        bio: "신고·외부 링크 설정 테스트용 관리자 시드 계정입니다(합성 데이터).",
        is_adult: true,
        adult_verified_at: new Date().toISOString(),
        account_status: "ACTIVE",
        role: "ADMIN",
      },
    ],
    { onConflict: "id" },
  );
  if (error) throw new Error(`user_profile 시드 실패: ${error.message}`);
  console.log("✓ user_profile seeded");
}

async function seedMatePosts(): Promise<void> {
  const { error } = await admin.from("mate_post").upsert(
    [
      {
        id: POST_BY_MEMBER1,
        author_id: "11111111-1111-1111-1111-111111111111",
        title: "도쿄 벚꽃 배낭여행 동행 구해요",
        country_code: "JP",
        region: "도쿄",
        start_date: "2027-04-01",
        end_date: "2027-04-05",
        headcount: 3,
        preferred_conditions: "같은 또래 배낭여행 선호",
        travel_style: ["배낭여행"],
        description:
          "도쿄 시내 위주로 4박 5일 배낭여행 계획 중입니다. 벚꽃 명소와 시장 위주로 다닐 예정이에요.",
        safety_rules_agreed_at: new Date().toISOString(),
        status: "RECRUITING",
      },
      {
        // QA 픽스처: 연락처 패턴(전화번호)이 본문에 포함된 시드 케이스.
        // REQ-FUNC-032(연락처 탐지) 관련 UI/신고 흐름을 수동 QA로 확인할 때 사용한다.
        id: POST_BY_MEMBER2,
        author_id: "22222222-2222-2222-2222-222222222222",
        title: "방콕 미식 투어 같이 가실 분",
        country_code: "TH",
        region: "방콕",
        start_date: "2027-05-10",
        end_date: "2027-05-14",
        headcount: 2,
        preferred_conditions: "미식 위주 일정 선호",
        travel_style: ["미식 탐방", "커플 여행"],
        description:
          "방콕 로컬 맛집 위주로 다닐 예정입니다. 관심 있으신 분은 010-1234-5678로 연락 주세요.",
        safety_rules_agreed_at: new Date().toISOString(),
        status: "RECRUITING",
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        author_id: "11111111-1111-1111-1111-111111111111",
        title: "파리 미술관 투어 동행(마감)",
        country_code: "FR",
        region: "파리",
        start_date: "2026-11-01",
        end_date: "2026-11-06",
        headcount: 2,
        preferred_conditions: null,
        travel_style: ["도심 액티비티"],
        description:
          "파리 주요 미술관과 박물관을 함께 둘러볼 동행을 찾았던 모집글입니다(마감).",
        safety_rules_agreed_at: new Date().toISOString(),
        status: "CLOSED",
      },
      {
        // 날짜 경과 자동 CLOSED 계산(REQ-FUNC-037) 확인용: status는 RECRUITING이지만
        // end_date가 과거라 resolveMatePostDisplayStatus()가 CLOSED로 표시해야 한다.
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        author_id: "22222222-2222-2222-2222-222222222222",
        title: "다낭 힐링 여행 동행(기간 경과 테스트용)",
        country_code: "VN",
        region: "다낭",
        start_date: "2025-01-05",
        end_date: "2025-01-09",
        headcount: 4,
        preferred_conditions: null,
        travel_style: ["자연·힐링", "가족과 함께"],
        description:
          "다낭 해변 위주 힐링 여행이었습니다. 기간이 지난 모집글 표시 테스트용 시드입니다.",
        safety_rules_agreed_at: new Date().toISOString(),
        status: "RECRUITING",
      },
    ],
    { onConflict: "id" },
  );
  if (error) throw new Error(`mate_post 시드 실패: ${error.message}`);
  console.log("✓ mate_post seeded");
}

async function seedMateApplications(): Promise<void> {
  // upsert 대상 unique key가 (mate_post_id, applicant_id) 부분 유니크 인덱스뿐이라
  // 먼저 지우고 다시 넣는 방식으로 idempotent하게 만든다.
  await admin
    .from("mate_application")
    .delete()
    .in("mate_post_id", [POST_BY_MEMBER1, POST_BY_MEMBER2]);

  const { error } = await admin.from("mate_application").insert([
    {
      mate_post_id: POST_BY_MEMBER1,
      applicant_id: "22222222-2222-2222-2222-222222222222",
      message: "안녕하세요! 같은 일정에 도쿄 여행 가는데 함께하고 싶어요.",
      status: "PENDING",
    },
    {
      mate_post_id: POST_BY_MEMBER2,
      applicant_id: "11111111-1111-1111-1111-111111111111",
      message: "방콕 미식 투어 관심 있습니다, 참가하고 싶어요!",
      status: "ACCEPTED",
    },
  ]);
  if (error) throw new Error(`mate_application 시드 실패: ${error.message}`);
  console.log("✓ mate_application seeded");
}

async function seedUserBlock(): Promise<void> {
  const { error } = await admin.from("user_block").upsert(
    [
      {
        blocker_id: "11111111-1111-1111-1111-111111111111",
        blocked_id: "22222222-2222-2222-2222-222222222222",
      },
    ],
    { onConflict: "blocker_id,blocked_id" },
  );
  if (error) throw new Error(`user_block 시드 실패: ${error.message}`);
  console.log("✓ user_block seeded");
}

async function seedReport(): Promise<void> {
  await admin.from("report").delete().eq("target_id", POST_BY_MEMBER2);

  const { error } = await admin.from("report").insert([
    {
      reporter_id: "11111111-1111-1111-1111-111111111111",
      target_type: "MATE_POST",
      target_id: POST_BY_MEMBER2,
      reason_code: "CONTACT_INFO_EXPOSED",
      description: "본문에 전화번호가 노출되어 있습니다(시드 QA 픽스처 신고).",
      status: "OPEN",
    },
  ]);
  if (error) throw new Error(`report 시드 실패: ${error.message}`);
  console.log("✓ report seeded");
}

async function seedExternalLinkSettings(): Promise<void> {
  const { error } = await admin.from("external_link_settings").upsert(
    [
      {
        key: "FLIGHT_OUTBOUND_URL",
        url: "https://www.google.com/travel/flights",
        updated_by: "33333333-3333-3333-3333-333333333333",
      },
      {
        key: "HOTEL_OUTBOUND_URL",
        url: "https://www.google.com/travel/hotels",
        updated_by: "33333333-3333-3333-3333-333333333333",
      },
    ],
    { onConflict: "key" },
  );
  if (error)
    throw new Error(`external_link_settings 시드 실패: ${error.message}`);
  console.log("✓ external_link_settings seeded");
}

async function main(): Promise<void> {
  await seedAuthUsers();
  await seedUserProfiles();
  await seedMatePosts();
  await seedMateApplications();
  await seedUserBlock();
  await seedReport();
  await seedExternalLinkSettings();
  console.log("\n✓ 시드 완료");
}

main().catch((e) => {
  console.error("✗ 시드 실패:", e instanceof Error ? e.message : e);
  process.exit(1);
});
