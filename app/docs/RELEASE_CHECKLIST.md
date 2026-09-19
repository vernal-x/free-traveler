# RELEASE-VERCEL-SUPABASE-CHECK — 배포 전 확인

**정본 Verify:** Manual(배포 담당자 실행). 이 문서는 배포 담당자가 실제 Vercel/
Supabase 계정으로 수행해야 할 항목(TC-1)과, 코드 상태만으로 이미 자동 확인 가능한
항목(TC-2)을 분리해서 담는다 — TC-2는 아래 §2에서 실제로 실행한 결과를 기록했다.

## 1. TC-1 — 배포 담당자가 실제 계정으로 확인할 항목(미실시, 자동화 대상 아님)

이 프로젝트는 아직 Vercel에 연결되지 않았다(`.vercel/` 없음, `vercel.json` 없음) —
아래는 실제 배포 시 배포 담당자가 Vercel/Supabase 대시보드에서 직접 확인해야 한다.

### 1.1 Vercel 프로젝트 환경변수

다음 이름의 환경변수가 Vercel 프로젝트 설정(Production + Preview 둘 다)에
등록되어 있는지 확인한다(**값은 이 문서에 적지 않는다**):

| 변수 이름 | 용도 | Vercel Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL(공개) | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key(공개, RLS로 제한됨) | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 관리자 키(**절대 공개 금지**) | Production, Preview(서버 전용으로만 노출되게 "Sensitive" 표시) |
| `FLIGHT_OUTBOUND_URL_DEFAULT` | 항공 외부 이동 기본 URL(seed용) | Production |
| `HOTEL_OUTBOUND_URL_DEFAULT` | 숙소 외부 이동 기본 URL(seed용) | Production |

- [ ] 위 5개 변수가 모두 등록되어 있다.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 Vercel의 "Sensitive Environment Variable"로
      표시되어 대시보드에서도 값이 다시 노출되지 않는다.
- [ ] Preview 배포(PR별)에도 같은 Supabase 프로젝트(또는 별도 스테이징
      프로젝트)를 가리키도록 값이 설정되어 있다.

### 1.2 HTTPS 기본 적용

- [ ] Vercel이 발급한 도메인(`*.vercel.app` 또는 커스텀 도메인)이 HTTP 요청을
      HTTPS로 자동 리다이렉트한다(Vercel 기본 동작 — 커스텀 도메인 연결 시
      인증서 발급 완료 여부만 대시보드에서 확인).

### 1.3 월 비용이 무료/저비용 티어 내인지

- [ ] Vercel 프로젝트가 Hobby(무료) 또는 팀의 의도된 유료 티어 한도 내에서
      운영되는지 Vercel 대시보드 "Usage" 탭에서 확인한다.
- [ ] Supabase 프로젝트가 Free 또는 의도된 유료 티어 한도(DB 용량, 월간 Active
      User, Auth 이메일 발송 한도 등) 내에서 운영되는지 Supabase 대시보드
      "Usage" 탭에서 확인한다(이번 개발 세션 중 이메일 발송 rate limit에 여러
      차례 도달한 이력이 있음 — §3 참고).

## 2. TC-2 — 비밀키 클라이언트 번들 미포함 확인(자동 실행 완료)

`SUPABASE_SERVICE_ROLE_KEY`가 실제로 클라이언트에 전달되는 빌드 산출물
(`.next/static/**`)에 포함되지 않는지 `next build` 결과물을 직접 스캔해 확인했다.

**방법**: `npx next build`로 프로덕션 빌드를 생성한 뒤, `.env.local`의
`SUPABASE_SERVICE_ROLE_KEY` 실제 값과 그 변수명 문자열을 `.next/static/`
전체에서 검색했다. 검증 방법이 유효함을 확인하기 위해, 공개용으로 의도된
`NEXT_PUBLIC_SUPABASE_ANON_KEY` 값도 같은 방식으로 검색해 실제로 포함되어
있음을 대조 확인했다(같은 방법으로 찾을 수 있어야 "값이 없다"는 결과를 신뢰할
수 있다).

| 검색 대상 | `.next/static/` 내 발견 | `.next/server/` 내 발견 |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` 실제 값 | **0건(미포함, 정상)** | 1건(서버 전용 코드, 정상) |
| `SUPABASE_SERVICE_ROLE_KEY` 변수명 문자열 | 0건 | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` 실제 값(대조군) | 1건(포함, 의도된 정상 동작) | — |

- [x] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 포함되지 않음을 확인했다.

## 3. 참고 — 이번 개발 세션 중 발견한 운영상 주의사항

- 개발/테스트에 사용한 공유 Supabase 프로젝트가 이메일 발송(가입 확인·비밀번호
  재설정) rate limit에 여러 차례 도달했다. 실제 운영 배포 전, Supabase
  대시보드에서 이메일 발송 한도를 확인하고 필요하면 커스텀 SMTP 연결을
  검토한다(REQ-FUNC-043 축소 범위와는 별개로, Auth 기본 이메일 발송 자체의
  한도 문제).
- 로그아웃 UI는 이번 세션에서 새로 추가되었다(`HeaderShell`, 커밋
  `0092d5c`) — 배포 후 실제 브라우저에서 로그인→로그아웃 흐름을 한 번 더
  확인하는 것을 권장한다.
