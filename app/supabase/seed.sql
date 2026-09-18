-- DB-SEED-BASE — 로컬 개발/QA용 합성(synthetic) 시드 데이터.
--
-- 실제 개인정보를 전혀 포함하지 않는다(Security/Privacy AC). 모든 이메일은
-- `@example.com`, 이름·닉네임은 명백히 가상의 값만 사용한다. `supabase db reset`
-- (또는 `supabase start` 최초 실행) 시 자동 실행된다.
--
-- 주의: `auth.users` 삽입에 필요한 컬럼 구성은 Supabase Auth 스키마 버전에 따라
-- 달라질 수 있다. 이 파일은 널리 쓰이는 표준 컬럼 집합만 사용했으나, 실제
-- Supabase 프로젝트에 적용해 검증한 적은 없다(샌드박스에 로컬 Postgres/Supabase가
-- 없음) — 버전 불일치로 실패하면 프로젝트의 `auth.users` 스키마에 맞게 조정한다.

-- ============================================================================
-- 1. auth.users — user_profile의 FK 대상이 되는 최소 인증 사용자 3명
--    (member1, member2: 일반 회원 / admin1: 관리자 테스트용)
-- ============================================================================
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'seed.member1@example.com',
    crypt('seed-not-a-real-password-1', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'seed.member2@example.com',
    crypt('seed-not-a-real-password-2', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated',
    'seed.admin1@example.com',
    crypt('seed-not-a-real-password-3', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}', false
  )
on conflict (id) do nothing;

-- ============================================================================
-- 2. user_profile
-- ============================================================================
insert into public.user_profile (
  id, nickname, age_group, gender, travel_style, bio,
  is_adult, adult_verified_at, account_status, role
) values
  (
    '11111111-1111-1111-1111-111111111111',
    '여행러구름', '30대', null, array['배낭여행', '자연·힐링'],
    '동남아 배낭여행을 좋아하는 시드 계정입니다(합성 데이터).',
    true, now(), 'ACTIVE', 'MEMBER'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '별빛여행자', '20대', '여성', array['커플 여행', '미식 탐방'],
    '유럽 미식 여행 동행을 찾는 시드 계정입니다(합성 데이터).',
    true, now(), 'ACTIVE', 'MEMBER'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '운영자시드', '40대', null, array[]::text[],
    '신고·외부 링크 설정 테스트용 관리자 시드 계정입니다(합성 데이터).',
    true, now(), 'ACTIVE', 'ADMIN'
  )
on conflict (id) do nothing;

-- ============================================================================
-- 3. mate_post — Non-Empty 목록 재현용 샘플(국가별 다양화, RECRUITING/CLOSED 혼합)
-- ============================================================================
insert into public.mate_post (
  id, author_id, title, country_code, region, start_date, end_date,
  headcount, preferred_conditions, travel_style, description,
  safety_rules_agreed_at, status
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '도쿄 벚꽃 배낭여행 동행 구해요',
    'JP', '도쿄', '2027-04-01', '2027-04-05',
    3, '같은 또래 배낭여행 선호', array['배낭여행'],
    '도쿄 시내 위주로 4박 5일 배낭여행 계획 중입니다. 벚꽃 명소와 시장 위주로 다닐 예정이에요.',
    now(), 'RECRUITING'
  ),
  (
    -- QA 픽스처: 연락처 패턴(전화번호)이 본문에 포함된 시드 케이스.
    -- REQ-FUNC-032(연락처 탐지) 관련 UI/신고 흐름을 수동 QA로 확인할 때 사용한다.
    -- 실제 앱 흐름(SA-MATE-POST)에서는 이런 입력이 애초에 제출 차단되므로,
    -- 이 행은 seed.sql이 검증 레이어를 우회해 직접 삽입한 것이다.
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    '방콕 미식 투어 같이 가실 분',
    'TH', '방콕', '2027-05-10', '2027-05-14',
    2, '미식 위주 일정 선호', array['미식 탐방', '커플 여행'],
    '방콕 로컬 맛집 위주로 다닐 예정입니다. 관심 있으신 분은 010-1234-5678로 연락 주세요.',
    now(), 'RECRUITING'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    '파리 미술관 투어 동행(마감)',
    'FR', '파리', '2026-11-01', '2026-11-06',
    2, null, array['도심 액티비티'],
    '파리 주요 미술관과 박물관을 함께 둘러볼 동행을 찾았던 모집글입니다(마감).',
    now(), 'CLOSED'
  ),
  (
    -- 날짜 경과 자동 CLOSED 계산(REQ-FUNC-037) 확인용: status는 RECRUITING이지만
    -- end_date가 과거라 resolveMatePostDisplayStatus()가 CLOSED로 표시해야 한다.
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    '다낭 힐링 여행 동행(기간 경과 테스트용)',
    'VN', '다낭', '2025-01-05', '2025-01-09',
    4, null, array['자연·힐링', '가족과 함께'],
    '다낭 해변 위주 힐링 여행이었습니다. 기간이 지난 모집글 표시 테스트용 시드입니다.',
    now(), 'RECRUITING'
  )
on conflict (id) do nothing;

-- ============================================================================
-- 4. mate_application
-- ============================================================================
insert into public.mate_application (
  mate_post_id, applicant_id, message, status
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    '안녕하세요! 같은 일정에 도쿄 여행 가는데 함께하고 싶어요.',
    'PENDING'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    '방콕 미식 투어 관심 있습니다, 참가하고 싶어요!',
    'ACCEPTED'
  )
on conflict do nothing;

-- ============================================================================
-- 5. user_block — 차단 관계 1건(REQ-FUNC-040 노출 제한 QA용)
-- ============================================================================
insert into public.user_block (blocker_id, blocked_id) values
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
  )
on conflict do nothing;

-- ============================================================================
-- 6. report — 연락처 노출 모집글(bbbbbbbb...)에 대한 신고 1건
-- ============================================================================
insert into public.report (
  reporter_id, target_type, target_id, reason_code, description, status
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'MATE_POST',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'CONTACT_INFO_EXPOSED',
    '본문에 전화번호가 노출되어 있습니다(시드 QA 픽스처 신고).',
    'OPEN'
  )
on conflict do nothing;

-- ============================================================================
-- 7. external_link_settings — 항공/숙소 외부 이동 기본 URL(중립적인 플레이스홀더)
-- ============================================================================
insert into public.external_link_settings (key, url, updated_by) values
  (
    'FLIGHT_OUTBOUND_URL',
    'https://www.google.com/travel/flights',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    'HOTEL_OUTBOUND_URL',
    'https://www.google.com/travel/hotels',
    '33333333-3333-3333-3333-333333333333'
  )
on conflict (key) do update set
  url = excluded.url,
  updated_by = excluded.updated_by,
  updated_at = now();
