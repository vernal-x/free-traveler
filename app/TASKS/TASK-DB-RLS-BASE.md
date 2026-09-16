# DB-RLS-BASE — RLS 정책

**Seq:** 38 · **Category:** DB · **Priority:** M
**출처:** `TASKS/00_TASK_LIST.md` Seq 38 (Table A/B) — 이 파일이 상세화 대상이며, 두 문서가
어긋나면 `TASKS/00_TASK_LIST.md`를 정본으로 하고 이 파일을 갱신한다.
**상태:** 착수 전(PENDING) — 이 문서는 구현 계약이며 구현 완료를 의미하지 않는다.

## Context

RLS 정책을(를) 담당하는 DB Task다. `docs/06_SRS_UIUX_REVISED.md`와
`docs/UIUX_TRACEABILITY.md`가 정의한 요구사항을, 승인된 Screen 설계(`design-reference/UI_CONTRACT.md`,
`design-reference/SCREEN_ROUTE_CONTRACT.json`)에 맞춰 구현하기 위한 실행 단위다.

## Project Scope

- Implementation Status: **IMPLEMENT**(`docs/PROJECT_SCOPE.md` 분류를 그대로 승계 — `TASKS/00_TASK_LIST.md` Seq 38 행과 동일)
- 관련 Requirement: REQ-FUNC-044, REQ-NF-013, 014
- 각 Requirement의 축소/제외 사유·확인 방법 원문은 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 정본으로 한다(이 파일에서 재서술하지 않음).

## Requirement Ref

REQ-FUNC-044, REQ-NF-013, 014

## Screen / Route / Page Entry

- Screen: 공통
- Route: N/A
- Page Entry: N/A

## Design Ref

- 해당 없음(비-UI Task). `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `db_tables`/`technical_routes`만 참고 대상일 수 있음.

## Depends On

- DB-SCHEMA-BASE

## Expected Files

- 생성: `supabase/migrations/0002_rls_policies.sql`

> 이 Task는 위에 나열된 파일만 생성/수정한다. 범위 밖 파일 수정은 "Forbidden" 절을 따른다.

## Functional AC

- 본인 글/요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터 열람

## Visual AC

- 해당 없음

## Security/Privacy AC

- 권한별 부정 접근 시 403/빈 결과

## Test Cases

- [ ] TC-1: 본인 글/요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터 열람
- [ ] TC-2(보안/개인정보): 권한별 부정 접근 시 403/빈 결과
- [ ] TC-3: 이 Task가 생성/수정하는 테이블이 허용 목록 ['user_profile', 'mate_post', 'mate_application', 'user_block', 'report', 'external_link_settings'] 안에서만 존재

## Verify

- TEST-RLS-BASIC

## Definition of Done

- [ ] 위 Functional AC, Visual AC, Security/Privacy AC 항목이 모두 충족됨
- [ ] Test Cases 체크리스트가 모두 통과함
- [ ] `Verify`에 명시된 검증 수단(Task/커맨드)을 실제로 실행해 통과함
- [ ] Expected Files 목록 밖의 파일을 생성/수정하지 않았음
- [ ] "Forbidden" 절의 금지 항목을 위반하지 않았음
- [ ] Lorem ipsum, "준비 중", "정보 확인 필요", 내용 없는 빈 카드가 결과물에 없음(해당 Task가 UI를 다루는 경우)

## Forbidden

- **Expected Files 밖 수정 금지.** 이 Task는 아래 "Expected Files"에 나열된 파일만 생성/수정한다. 그 외 파일(다른 Task 소관 파일 포함)을 건드리지 않는다.
- 구현 코드는 이 Task 상세 정의를 따르되, 이 markdown 파일 자체의 작성으로 "구현 완료"를 주장하지 않는다.
- Git Branch/Commit을 이 Task 정의 단계에서 만들지 않는다.
- 정의된 6개 테이블(user_profile, mate_post, mate_application, user_block, report, external_link_settings) 외의 테이블을 생성하지 않는다. 특히 여행지·안전정보·대표소개·미디어·감사로그용 테이블을 만들지 않는다(정적 데이터로 유지, 규칙 7/11).
- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능을 이 Task 범위 안에서 임의로 복원하지 않는다.
