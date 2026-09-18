-- 0003_grants.sql — 6개 테이블에 대한 기본 권한(GRANT) 보강.
--
-- 실제 프로젝트에 0001·0002를 적용한 뒤 TEST-RLS-BASIC을 실행해 보니, `anon`/
-- `authenticated`뿐 아니라 `service_role`까지도 테이블 자체에 대한 GRANT가 없어
-- "permission denied for table ..."(42501)로 전부 막혀 있었다(RLS는 GRANT를
-- 통과한 이후에만 행 단위로 추가 필터링을 하므로, 정책만으로는 접근을 열 수 없고,
-- `service_role`은 RLS 자체는 우회하지만 테이블 GRANT까지 우회하지는 않는다) —
-- Supabase 대시보드로 테이블을 만들면 자동으로 부여되는 GRANT를, 손으로 작성한
-- SQL 마이그레이션에서는 명시적으로 해줘야 한다.
--
-- 뷰(mate_author_public, external_link_settings_public)는 0002에서 이미
-- `grant select ... to anon, authenticated`를 받았으므로 여기서 다루지 않는다.

grant select, insert, update, delete on public.user_profile
  to anon, authenticated, service_role;

grant select, insert, update, delete on public.mate_post
  to anon, authenticated, service_role;

grant select, insert, update, delete on public.mate_application
  to anon, authenticated, service_role;

grant select, insert, update, delete on public.user_block
  to anon, authenticated, service_role;

grant select, insert, update, delete on public.report
  to anon, authenticated, service_role;

grant select, insert, update, delete on public.external_link_settings
  to anon, authenticated, service_role;
