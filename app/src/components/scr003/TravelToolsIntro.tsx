/**
 * CMP-SCR003-INTRO-TABS — SCR-003 Section 1 "Intro(이용 순서 3단계 요약)".
 *
 * 사진 Hero가 아니라 텍스트 중심 축소형 밴드로 구성해 Desktop 1440px 첫 화면에서
 * Section 2(Tab)가 바로 보이도록 한다(UI_CONTRACT.md § SCR-003).
 */

const STEPS = [
  {
    step: "1",
    title: "조건 입력",
    desc: "국가·지역과 날짜만 간단히 입력하세요.",
  },
  {
    step: "2",
    title: "요약 확인",
    desc: "입력한 조건을 한눈에 확인할 수 있어요.",
  },
  {
    step: "3",
    title: "외부에서 비교·예약",
    desc: "항공편·숙소는 새 탭에서 직접 비교하고 예약하세요.",
  },
];

export default function TravelToolsIntro() {
  return (
    <section className="mx-auto max-w-[1240px] px-md py-lg">
      <h1 className="text-display-md text-text-primary">여행 준비 도구</h1>
      <p className="mt-xs text-body-md text-text-secondary">
        항공편·숙소 조건을 정리하고, 함께할 동행까지 한 곳에서 찾아보세요.
      </p>

      <ol className="mt-md grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {STEPS.map((s) => (
          <li key={s.step} className="flex items-start gap-xs">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-primary-tint text-badge text-primary-active">
              {s.step}
            </span>
            <div>
              <p className="text-title-sm text-text-primary">{s.title}</p>
              <p className="mt-xxs text-body-sm text-text-secondary">
                {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
