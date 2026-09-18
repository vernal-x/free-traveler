-- DB-SCHEMA-BASE — Supabase 핵심 스키마(정확히 6개 테이블).
--
-- `docs/ARCHITECTURE.md` §8이 정의한 6개 테이블(user_profile, mate_post,
-- mate_application, user_block, report, external_link_settings)만 만든다.
-- 여행지·안전정보·대표소개는 `src/data/*` 정적 데이터로 관리하므로 이 마이그레이션에
-- 포함하지 않는다(DEC-004, `CLAUDE.md` 규칙 16). 감사 로그·세분화된 제재 테이블도
-- REQ-FUNC-042 EXCLUDED에 따라 만들지 않는다.
--
-- RLS는 모든 테이블에서 활성화하되 정책은 이 마이그레이션에서 추가하지 않는다
-- (기본값으로 완전 차단 — 실제 정책은 `TASKS/TASK-DB-RLS-BASE.md`가 별도 마이그레이션으로
-- 추가한다). ORM을 쓰지 않고 SQL로 직접 관리한다(`docs/ARCHITECTURE.md` §11).

-- ============================================================================
-- 1. user_profile — 닉네임·연령대·성별(선택)·여행 스타일·자기소개·성인 확인·계정 상태
-- ============================================================================
create table public.user_profile (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  age_group text not null,
  gender text,
  travel_style text[] not null default '{}',
  bio text,
  is_adult boolean not null default false,
  adult_verified_at timestamptz,
  account_status text not null default 'ACTIVE'
    check (account_status in ('ACTIVE', 'DELETED')),
  role text not null default 'MEMBER'
    check (role in ('MEMBER', 'MODERATOR', 'ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_profile is
  '동행 프로필. 정확한 생년월일은 저장하지 않고 is_adult/adult_verified_at만 저장한다(REQ-FUNC-028).';

alter table public.user_profile enable row level security;

-- ============================================================================
-- 2. mate_post — 동행 모집글(국가·지역·기간·인원·설명·모집 상태)
-- ============================================================================
create table public.mate_post (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.user_profile (id) on delete cascade,
  title text not null,
  country_code text not null,
  region text,
  start_date date not null,
  end_date date not null,
  headcount integer not null check (headcount > 0),
  preferred_conditions text,
  travel_style text[] not null default '{}',
  description text not null,
  safety_rules_agreed_at timestamptz not null,
  status text not null default 'RECRUITING'
    check (status in ('RECRUITING', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mate_post_date_range check (end_date >= start_date)
);

comment on table public.mate_post is
  '동행 모집글. safety_rules_agreed_at은 /legal/mate-safety 동의 시각(REQ-FUNC-031, 080).';

create index mate_post_country_code_idx on public.mate_post (country_code);
create index mate_post_status_idx on public.mate_post (status);

alter table public.mate_post enable row level security;

-- ============================================================================
-- 3. mate_application — 참가 요청(비공개 메시지, PENDING/ACCEPTED/REJECTED/WITHDRAWN)
-- ============================================================================
create table public.mate_application (
  id uuid primary key default gen_random_uuid(),
  mate_post_id uuid not null references public.mate_post (id) on delete cascade,
  applicant_id uuid not null references public.user_profile (id) on delete cascade,
  message text not null check (char_length(message) <= 500),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.mate_application is
  '동행 참가 요청. 비공개 메시지는 작성자·요청자만 열람(REQ-FUNC-034, 044).';

-- REQ-FUNC-035: 동일 사용자의 동일 글에 대한 PENDING/ACCEPTED 중복 요청 차단.
create unique index mate_application_unique_active_idx
  on public.mate_application (mate_post_id, applicant_id)
  where status in ('PENDING', 'ACCEPTED');

alter table public.mate_application enable row level security;

-- ============================================================================
-- 4. user_block — 사용자 차단 관계
-- ============================================================================
create table public.user_block (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.user_profile (id) on delete cascade,
  blocked_id uuid not null references public.user_profile (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_block_not_self check (blocker_id <> blocked_id),
  constraint user_block_unique unique (blocker_id, blocked_id)
);

comment on table public.user_block is
  '사용자 차단 관계. 차단 시 상호 글·프로필·요청 노출을 제한한다(REQ-FUNC-040).';

alter table public.user_block enable row level security;

-- ============================================================================
-- 5. report — 신고(대상·사유·상태: OPEN/RESOLVED/DISMISSED)
-- ============================================================================
create table public.report (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.user_profile (id) on delete cascade,
  target_type text not null
    check (target_type in ('MATE_POST', 'USER', 'MATE_APPLICATION')),
  target_id uuid not null,
  reason_code text not null,
  description text,
  status text not null default 'OPEN'
    check (status in ('OPEN', 'RESOLVED', 'DISMISSED')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

comment on table public.report is
  '신고. target_id는 target_type에 따라 mate_post/user_profile/mate_application을 가리키는 다형 참조라 FK를 걸지 않는다(REQ-FUNC-039, 041).';

create index report_status_idx on public.report (status);

alter table public.report enable row level security;

-- ============================================================================
-- 6. external_link_settings — Admin이 설정하는 항공/숙소 외부 URL(HTTPS 허용목록)
-- ============================================================================
create table public.external_link_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique
    check (key in ('FLIGHT_OUTBOUND_URL', 'HOTEL_OUTBOUND_URL')),
  url text not null check (url like 'https://%'),
  updated_by uuid references public.user_profile (id),
  updated_at timestamptz not null default now()
);

comment on table public.external_link_settings is
  'Admin이 관리하는 항공/숙소 외부 이동 URL. HTTPS만 허용(REQ-FUNC-024). 초기값은 DB-SEED-BASE가 채운다.';

alter table public.external_link_settings enable row level security;
