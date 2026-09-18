-- DB-RLS-BASE — RLS 정책(단순 3원칙, `docs/ARCHITECTURE.md` §10).
--
-- 1. 본인 데이터 우선: user_profile, mate_application(신청자 관점), user_block은
--    auth.uid()가 소유자/당사자인 행만 조회·수정 가능.
-- 2. 공개 필드만 공개 조회: mate_post는 목록·상세를 Public이 조회 가능하되, 쓰기는
--    인증+성인 확인 사용자만.
-- 3. 역할 기반 관리자 접근: report, external_link_settings는 Moderator/Admin
--    역할만 조회·수정 가능(일반 사용자는 report 생성만 가능).
--
-- 위 원칙을 문자 그대로 적용하면 두 가지 실사용 충돌이 생긴다: (a) mate_post 카드에
-- 작성자 닉네임을 표시해야 하는데(REQ-FUNC-033) user_profile이 본인 전용이라 다른
-- 사용자가 조회할 수 없고, (b) SCR-003(공개 화면)이 항공/숙소 URL을 읽어야 하는데
-- external_link_settings가 Moderator/Admin 전용이다. 기본 테이블의 RLS는 원칙 그대로
-- 잠가 두고, 꼭 필요한 최소 컬럼만 노출하는 공개 VIEW 2개를 별도로 추가해 해결한다
-- (베이스 테이블 정책을 느슨하게 만들지 않는다).

-- ============================================================================
-- 1. user_profile — 본인만 조회/수정, 가입 시 본인 행만 생성
-- ============================================================================
create policy user_profile_select_own
  on public.user_profile for select
  using (auth.uid() = id);

create policy user_profile_insert_own
  on public.user_profile for insert
  with check (auth.uid() = id);

create policy user_profile_update_own
  on public.user_profile for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- mate_post 카드에 필요한 "작성자 닉네임만"(REQ-FUNC-033) 노출용 최소 공개 VIEW.
-- bio/gender/travel_style 등 비공개 필드는 포함하지 않는다.
create view public.mate_author_public
  with (security_invoker = false) as
  select id, nickname, role from public.user_profile;

grant select on public.mate_author_public to anon, authenticated;

-- ============================================================================
-- 2. mate_post — Public 조회, 쓰기는 인증+성인 확인된 본인만
-- ============================================================================
create policy mate_post_select_public
  on public.mate_post for select
  using (true);

create policy mate_post_insert_own_adult
  on public.mate_post for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.user_profile
      where id = auth.uid()
        and is_adult = true
        and account_status = 'ACTIVE'
    )
  );

create policy mate_post_update_own
  on public.mate_post for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy mate_post_delete_own
  on public.mate_post for delete
  using (auth.uid() = author_id);

-- ============================================================================
-- 3. mate_application — 신청자 본인 또는 대상 글 작성자만 조회, 성인 확인된
--    본인만 생성. 상태 전이(ACCEPTED/REJECTED/WITHDRAWN)의 역할별 제한은
--    Server Action(SA-MATE-APPLICATION)이 앱 레벨에서 검증한다(원칙 "단순하게").
-- ============================================================================
create policy mate_application_select_own_or_post_author
  on public.mate_application for select
  using (
    auth.uid() = applicant_id
    or auth.uid() = (
      select author_id from public.mate_post where id = mate_post_id
    )
  );

create policy mate_application_insert_own_adult
  on public.mate_application for insert
  with check (
    auth.uid() = applicant_id
    and exists (
      select 1 from public.user_profile
      where id = auth.uid()
        and is_adult = true
        and account_status = 'ACTIVE'
    )
  );

create policy mate_application_update_own_or_post_author
  on public.mate_application for update
  using (
    auth.uid() = applicant_id
    or auth.uid() = (
      select author_id from public.mate_post where id = mate_post_id
    )
  )
  with check (
    auth.uid() = applicant_id
    or auth.uid() = (
      select author_id from public.mate_post where id = mate_post_id
    )
  );

-- ============================================================================
-- 4. user_block — 차단한 본인만 조회/생성/삭제(차단당한 사람은 볼 수 없음)
-- ============================================================================
create policy user_block_select_own
  on public.user_block for select
  using (auth.uid() = blocker_id);

create policy user_block_insert_own
  on public.user_block for insert
  with check (auth.uid() = blocker_id);

create policy user_block_delete_own
  on public.user_block for delete
  using (auth.uid() = blocker_id);

-- ============================================================================
-- 5. report — 신고자 본인 또는 Moderator/Admin만 조회, 누구나 생성 가능,
--    상태 변경은 Moderator/Admin만(REQ-FUNC-041/042 — 개별 제재 기능은 없음)
-- ============================================================================
create policy report_select_own_or_moderator
  on public.report for select
  using (
    auth.uid() = reporter_id
    or exists (
      select 1 from public.user_profile
      where id = auth.uid() and role in ('MODERATOR', 'ADMIN')
    )
  );

create policy report_insert_own
  on public.report for insert
  with check (auth.uid() = reporter_id);

create policy report_update_moderator_only
  on public.report for update
  using (
    exists (
      select 1 from public.user_profile
      where id = auth.uid() and role in ('MODERATOR', 'ADMIN')
    )
  )
  with check (
    exists (
      select 1 from public.user_profile
      where id = auth.uid() and role in ('MODERATOR', 'ADMIN')
    )
  );

-- ============================================================================
-- 6. external_link_settings — Admin만 조회/수정. SCR-003(공개 화면)이 URL을
--    읽을 수 있도록 url만 노출하는 최소 공개 VIEW를 별도로 둔다(updated_by 제외).
-- ============================================================================
-- `for all`은 select/insert/update/delete를 모두 포괄한다(using은 select·update·
-- delete에, with check는 insert·update에 적용) — 별도 select 정책을 두지 않는다.
create policy external_link_settings_admin_only
  on public.external_link_settings for all
  using (
    exists (
      select 1 from public.user_profile
      where id = auth.uid() and role = 'ADMIN'
    )
  )
  with check (
    exists (
      select 1 from public.user_profile
      where id = auth.uid() and role = 'ADMIN'
    )
  );

create view public.external_link_settings_public
  with (security_invoker = false) as
  select key, url from public.external_link_settings;

grant select on public.external_link_settings_public to anon, authenticated;
