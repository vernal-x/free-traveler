# MANUAL-RESPONSIVE-A11Y-CHECK — 반응형(1440/390) + 접근성 점검 기록

**대상:** SCR-001(`/`), SCR-002(`/about`), SCR-003(`/travel-tools`), SCR-004(`/mates`), SCR-005(`/account`)
**환경:** 로컬 `npm run dev`, Chromium(Playwright), Desktop 1440×900 / Mobile 390×844
**점검 방식에 대한 정직한 고지**: 이 Task의 정본 `Verify`는 "Manual(개발자/QA 실행)"이다.
아래 결과는 실제 사람이 마우스 없이 키보드만 사용하는 방식과 동일한 조작(Tab/Enter/
Escape/타이핑)을 Playwright로 재현해 얻은 것으로, "키보드만으로 조작 가능한가"에는
직접적인 증거가 된다. 다만 **실제 스크린리더(VoiceOver/NVDA 등) 음성 출력이 흐름을
이해할 수 있게 들리는지는 사람이 실제 스크린리더를 켜고 들어봐야 확인되는 부분이라,
이번 점검은 그 대역으로 ARIA 구조(role·접근 가능한 이름·대체 텍스트)만 자동으로
확인했다** — 이 부분은 아래 "남은 항목"에 명시한다.

## 1. 반응형 — 가로 스크롤/겹침 확인

5개 화면 모두 Desktop 1440px·Mobile 390px에서 `document.documentElement.scrollWidth`가
`clientWidth`를 넘지 않음(가로 스크롤 없음)을 확인했다.

| 화면 | Route | 1440px | 390px |
|---|---|---|---|
| SCR-001 | `/` | PASS | PASS |
| SCR-002 | `/about` | PASS | PASS |
| SCR-003 | `/travel-tools` | PASS | PASS |
| SCR-004 | `/mates` | PASS | PASS |
| SCR-005 | `/account` | PASS | PASS |

레이아웃 겹침은 각 화면을 두 뷰포트에서 스크린샷으로 육안 확인했으며, 카드 Grid·
Drawer·탭·Form이 두 크기 모두에서 의도한 반응형 규칙(Desktop 4열/3열 Grid → Mobile
1열, 좌측 세로 탭 → 상단 가로 스크롤 탭 등, `design-reference/UI_CONTRACT.md` 각 화면
"Desktop·Mobile 규칙")대로 재배치됨을 확인했다.

## 2. 구조적 접근성 기본 점검(대체 텍스트·접근 가능한 이름)

| 화면 | alt 없는 `img` | 접근 가능한 이름 없는 `button` | 접근 가능한 이름 없는 `a` |
|---|---|---|---|
| `/` | 0 | 0 | 0 |
| `/about` | 0 | 0 | 0 |
| `/travel-tools` | 0 | 0 | 0 |
| `/mates` | 0 | 0 | 0 |
| `/account` | 0 | 0 | 0 |

모든 이미지가 대체 텍스트를 갖고 있고, 아이콘만 있는 버튼(즐겨찾기 하트 등)도
`aria-label`로 접근 가능한 이름을 갖고 있어 스크린리더가 "이름 없는 버튼"으로
읽을 요소가 없음을 확인했다.

## 3. 화면별 키보드 조작 점검(TC-1)

### SCR-001(`/`) — 검색 + 여행지 상세 열기/닫기(모달)

- [x] Tab만으로 Hero 검색창(`input`)까지 도달 가능
- [x] 여행지 카드의 "3일 코스 보기" 버튼에 포커스 후 Enter로 상세 Drawer가 열림
- [x] Drawer 안의 "닫기" 버튼에 포커스 후 Enter로 Drawer가 닫힘
- [ ] **발견된 이슈**: Drawer가 열려도 포커스가 자동으로 Drawer 안으로 이동하지
      않는다(포커스가 여전히 배경의 트리거 버튼에 남음). Escape 키로도 닫히지
      않는다(클릭 기반 닫기만 지원). `DestinationDrawer`/`SafetyDrawer`/
      `MateDetailPanel` 3개 모두 코드 확인 결과 동일한 패턴(포커스 관리·Escape
      핸들러 없음) — 이 Task의 Expected Files(`docs/MANUAL_CHECK_LOG.md`)만으로는
      고칠 수 없어 발견 사실만 기록한다(§5 "남은 항목" 참고).

### SCR-002(`/about`) — 정적 콘텐츠 탐색

- [x] Tab만으로 Gallery·추천 여행지 카드·CTA까지 순서대로 도달 가능(포커스 트랩 없음)

### SCR-003(`/travel-tools`) — 폼 입력

- [x] 국가 `<select>`에 포커스 후 키보드 타이핑("일본")만으로 옵션 선택 가능(브라우저
      기본 select typeahead)
- [x] 날짜 `<input type="date">`에 포커스 후 키보드 숫자 입력만으로 값 입력 가능
- [x] Tab으로 항공/숙소/동행 구하기 탭 버튼까지 도달 가능(단, 탭 버튼 사이 이동은
      일반 ARIA Tab 패턴의 화살표 키가 아니라 Tab 키로만 가능 — `role="tab"`을
      쓰면서도 화살표 키 핸들러가 없음. 기능은 동작하나 표준 ARIA Tab 패턴과는
      다르다는 점을 기록)

### SCR-004(`/mates`) — 신고 제출

- [x] 로그인 상태에서 상세 패널의 "신고하기" Form이 키보드로 도달 가능
- [x] 신고 사유 `<select>`가 화살표 키로 조작 가능
- [x] "신고하기" 제출 버튼까지 Tab으로 도달해 포커스 가능
- [ ] SCR-001과 동일하게, 상세 패널이 열릴 때 포커스 자동 이동은 없음(위 이슈와
      동일 패턴)

### SCR-005(`/account`) — 로그인 폼

- [x] 이메일·비밀번호 입력 → 로그인 버튼까지 Tab 이동 및 Enter/클릭 제출 가능
      (E2E-MATE-AUTH Smoke가 이미 이 흐름을 실제 계정으로 반복 검증함)

## 4. 검증에 사용한 임시 데이터

`tmp.a11y.check@example.com` 계정(MEMBER)과 검증용 동행글 1건을 Supabase Admin API로
만들어 점검한 뒤 점검 종료 직후 모두 삭제했다(계정 삭제 시 `mate_post`가 on delete
cascade로 함께 정리됨).

## 5. 남은 항목(사람 확인 필요)

- **실제 스크린리더 음성 확인 미실시.** 위 §2·§3은 ARIA 구조(role·이름·대체 텍스트)와
  키보드 조작성만 자동으로 확인한 것이며, VoiceOver/NVDA 등 실제 스크린리더로 5개
  화면의 주요 흐름(검색 → 상세 → 안전정보, 동행 신청, 신고 제출 등)을 들었을 때 흐름이
  자연스럽게 이해되는지는 사람이 직접 확인해야 한다.
- **Drawer/모달 포커스 관리 미흡(발견된 이슈, 이번 Task 범위 밖 수정).**
  `DestinationDrawer`/`SafetyDrawer`/`MateDetailPanel` 3곳 모두 열릴 때 포커스를
  다이얼로그 안으로 옮기지 않고, Escape로 닫히지도 않는다. 스크린리더·키보드
  사용자의 실사용에는 지장이 없는 수준(Tab으로 여전히 도달·조작 가능)이지만,
  표준 WAI-ARIA Dialog 패턴 대비 개선 여지가 있다 — 별도 Task로 다룰지 사람의 결정이
  필요하다.
- **SCR-003 탭 버튼의 화살표 키 미지원.** `role="tab"`을 쓰면서 화살표 키 전환을
  구현하지 않았다(Tab 키로는 정상 이동). 표준 ARIA Tab 패턴을 엄격히 따르려면
  개선이 필요하나, 기능 자체는 키보드로 100% 조작 가능하다.
