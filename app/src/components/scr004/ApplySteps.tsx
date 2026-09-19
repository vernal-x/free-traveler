/**
 * CMP-SCR004-APPLY-FLOW — SCR-004 "참가 신청 방법 3단계 안내"(REQ-FUNC-034 보조).
 *
 * 정적 안내 카드 3개(`docs/04_UIUX_PLAN.md` §6.4 Section 5와 동일한 3단계).
 */

const STEPS = [
  {
    step: "1",
    title: "모집글 확인",
    desc: "국가·기간·인원·여행 스타일을 확인하세요.",
  },
  {
    step: "2",
    title: "참가 메시지 작성",
    desc: "최대 500자로 자기소개나 참가 이유를 남겨주세요.",
  },
  {
    step: "3",
    title: "작성자 승인 대기",
    desc: "작성자가 승인하면 서비스 내에서 일정을 조율할 수 있어요.",
  },
];

export default function ApplySteps() {
  return (
    <section className="mx-auto max-w-[1240px] px-md py-md">
      <h2 className="text-title-md text-text-primary">
        참가 요청은 이렇게 진행돼요
      </h2>
      <div className="mt-sm grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        {STEPS.map((s) => (
          <div key={s.step} className="rounded-md border border-hairline p-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-primary-tint text-badge text-primary-active">
              {s.step}
            </span>
            <p className="mt-xs text-title-sm text-text-primary">{s.title}</p>
            <p className="mt-xxs text-body-sm text-text-secondary">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
