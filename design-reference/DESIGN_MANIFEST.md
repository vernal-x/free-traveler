# Free Traveler — Design Manifest

이 문서는 어떤 디자인 정본(canon)이 현재 유효한지, 어디서 왔는지, 어떤 화면이 승인되었는지를
한곳에서 추적한다. 프론트엔드/디자인 작업은 항상 `Active File`을 기준으로 한다.

| 항목 | 값 |
|---|---|
| **Active Design Version** | `D-001` |
| **Status** | `LOCKED` |
| **Active File** | `design-reference/D-001/DESIGN.md` |
| **Vendor Reference** | `design-reference/vendor/airbnb/DESIGN-airbnb.md` (구조적 레이아웃 패턴만 참고 — 색상·폰트·로고·상표 요소 미사용) |
| **Approved Screens** | SCR-001, SCR-002, SCR-003, SCR-004, SCR-005 |
| **Mobile Variants** | SCR-001, SCR-003 |
| **Stitch Project ID** | `2834073564133627186` (`https://stitch.withgoogle.com/projects/2834073564133627186`) |
| **Screen 승인 근거** | `app/docs/STITCH_VALIDATION_REPORT.md` (2026-09-15, 검사 1~13 전 항목 PASS — SCR-002·SCR-004는 승인 전 수정 후 PASS) |
| **작성일** | 2026-09-15 |
| **최종 갱신일** | 2026-09-15 |

## Status = LOCKED 의 의미

`design-reference/D-001/DESIGN.md`는 잠금 상태다. 다음 경우가 아니면 이 파일의 토큰·컴포넌트
정의·Do/Do Not 규칙을 직접 수정하지 않는다:

1. 새로운 버전(`D-002` 등)을 별도 디렉터리로 만들고 이 Manifest의 `Active Design Version`을
   갱신하는 정식 개정 절차를 거칠 때.
2. `Active File`이 실제 오류(깨진 토큰 참조, 금지 항목 누락 등)를 담고 있어 핫픽스가 필요할 때 —
   이 경우도 변경 사유를 이 Manifest 하단 "변경 이력"에 기록한다.

## 알려진 미해결 사항

`design-reference/D-001/DESIGN.md`는 **디자인 토큰·컴포넌트·Section 구조**의 정본이다.
2026-09-15 `app/docs/STITCH_VALIDATION_REPORT.md`(Stitch 프로젝트 `2834073564133627186`을
직접 재조회한 결과)에 따르면 구조 검사 1~13 전 항목이 PASS이며, 발견된 카피 레벨 위반은
승인 전에 모두 수정 완료됐다:

- **SCR-002 대표 소개(정본 `25abc0425c354dfbb865d6d73fe219ce`)**: 방문 국가 28개국 →
  30개국으로 보정, 추천 여행지 4개 카드의 별점(`★ 4.9` 등) 제거 — 수정 적용, PASS.
- **SCR-004 동행 조회(`0d36171b01de4567a734f7e2dbe68ca3`)**: 상세 패널의 "매너온도 98%"
  평판 점수 제거(성인 인증 뱃지·참여 횟수는 유지) — 수정 적용, PASS.

수정 한도(최대 2회) 내에서 위 2건만 처리했으며, 다음 두 가지는 **아직 해결되지 않았다**:

1. **SCR-002 Desktop 중복 화면** — `745aecb65dd84ee79c76d9c8763fb010`이 정본과 별개로
   존재한다. 이 세션에는 Stitch 화면 삭제 도구가 없어 자동 정리가 불가능하다. **Stitch UI에서
   이 중복본을 수동으로 삭제하고 정본(`25abc0425c354dfbb865d6d73fe219ce`, 수정 반영됨)만
   남겨야 한다** — 중복본은 수정 이전 상태(28개국·별점 포함)로 남아 있으므로 구현팀이 실수로
   이 화면을 참조하지 않도록 주의한다.
2. **SCR-005 외부 URL 설정 예시 명칭** — "Skyscanner(항공)"로 표기되어 있으나
   `02_SRS_BASELINE.md` 6.2절 기본값은 Google Flights다. 비차단(기능 자체는 정상 동작하는
   자유 텍스트 입력 필드)이므로 PASS 상태지만, 다음 Stitch 수정 세션에서 명칭만 교체를 권장한다.

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|---|---|---|
| 2026-09-15 | D-001 | 최초 작성. `04_UIUX_PLAN.md`(디자인 토큰·Section 설계)와
`vendor/airbnb/DESIGN-airbnb.md`(구조적 레퍼런스), `STITCH_VALIDATION_REPORT.md`(승인 화면
인벤토리·미해결 위반 목록)를 기반으로 `D-001/DESIGN.md` 및 이 Manifest를 신규 작성. |
| 2026-09-15 | D-001 | Stitch 프로젝트를 직접 재조회해 실제 화면 상태를 검증(`app/docs/STITCH_VALIDATION_REPORT.md`
갱신). 이전 항목이 참조하던 2026-09-11 시점의 `STITCH_VALIDATION_NEEDS_HUMAN`(미확인) 상태를
실제 PASS 상태로 정정하고, SCR-002·SCR-004에서 발견한 별점·매너 점수 위반을 수정 완료 처리.
`DESIGN.md`의 Mate Post Card 금지 목록과 전역 Do Not 목록에 "매너 점수/평판 지수" 금지를
명시적으로 추가. "알려진 미해결 사항"을 SCR-002 중복 화면(수동 삭제 필요)과 SCR-005 외부
URL 명칭(경미) 2건으로 갱신. |
