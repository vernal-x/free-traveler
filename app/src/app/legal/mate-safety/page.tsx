import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "동행 안전수칙 | Free Traveler",
  description:
    "동행 모집 글 작성·참가 전 확인해야 할 안전수칙 — 만남 전 확인 사항, 개인정보 보호, 신고·차단 방법을 안내합니다.",
  alternates: { canonical: "/legal/mate-safety" },
  openGraph: {
    title: "동행 안전수칙 | Free Traveler",
    description:
      "동행 모집 글 작성·참가 전 확인해야 할 안전수칙 — 만남 전 확인 사항, 개인정보 보호, 신고·차단 방법을 안내합니다.",
    type: "website",
  },
};

/**
 * 동행 안전수칙. 이 페이지의 "최종 개정일"은 동행 글 작성 시 저장되는 동의 시각과
 * 함께 어느 버전에 동의했는지 추적하는 기준이 된다(REQ-FUNC-080 — 실제 동의 시각
 * 저장 로직은 `SA-MATE-POST` Server Action Task의 책임이며, 이 페이지는 그 동의
 * 대상이 되는 고정 콘텐츠만 제공한다).
 */
export const MATE_SAFETY_VERSION = "2026-09-17";

export default function MateSafetyPage() {
  return (
    <main className="mx-auto max-w-[720px] px-md py-xxl text-text-primary">
      <h1 className="text-display-lg">동행 안전수칙</h1>
      <p className="mt-xs text-body-sm text-text-muted">
        최종 개정일: {MATE_SAFETY_VERSION} (동행 모집 글 작성 시 이 수칙에 대한
        동의 시각이 함께 저장됩니다)
      </p>

      <section className="mt-xl">
        <h2 className="text-title-md">1. 만남 전 확인할 것</h2>
        <ul className="mt-xs list-disc space-y-xxs pl-lg text-body-md text-text-secondary">
          <li>
            상대방의 게시글 이력과 참가 신청 메시지를 충분히 확인한 뒤 만남
            여부를 결정하세요.
          </li>
          <li>
            첫 만남은 공항, 역, 숙소 로비 등 공개된 장소에서 진행하는 것을
            권장합니다.
          </li>
          <li>
            여행 일정, 숙소, 만남 장소를 가족·지인에게 미리 공유해 두세요.
          </li>
        </ul>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">2. 개인정보 보호</h2>
        <ul className="mt-xs list-disc space-y-xxs pl-lg text-body-md text-text-secondary">
          <li>
            전화번호·메신저 ID·이메일 등 연락처를 게시글 본문이나 공개된 곳에
            직접 노출하지 마세요. 서비스는 이러한 연락처 노출을 금지하고
            있습니다.
          </li>
          <li>
            참가 신청은 서비스 내 1회성 메시지 폼으로만 주고받고, 실제 연락
            수단은 신뢰가 형성된 이후 신중하게 교환하세요.
          </li>
        </ul>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">3. 성인 전용 기능임을 유의</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          동행 모집·참가 신청은 성인(만 19세 이상) 전용 기능입니다. 미성년자를
          동행 모집 대상에 포함하는 게시글은 금지되며, 발견 시 신고해 주시기
          바랍니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">4. 여행 중 안전</h2>
        <ul className="mt-xs list-disc space-y-xxs pl-lg text-body-md text-text-secondary">
          <li>
            방문 국가의{" "}
            <Link
              href="/"
              className="text-primary underline underline-offset-2"
            >
              국가별 안전정보
            </Link>
            를 사전에 확인하고, 경보 수준에 맞게 일정을 조정하세요.
          </li>
          <li>
            현지 긴급전화와 영사콜센터(+82-2-3210-0404) 번호를 미리 저장해
            두세요.
          </li>
          <li>
            동행자와 의견 차이나 문제가 발생하면 무리하게 일정을 강행하지 말고
            즉시 각자 이동하는 것도 하나의 선택지임을 기억하세요.
          </li>
        </ul>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">5. 신고와 차단</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          부적절한 언행, 안전을 위협하는 행동, 연락처 노출 등을 경험했다면 즉시
          신고 기능을 이용하고 해당 이용자를 차단하세요. 서비스는 실시간
          채팅·화상통화·위치공유 기능을 제공하지 않으므로, 이러한 기능을
          요구하는 경우 사기 또는 위험 신호일 수 있습니다.
        </p>
      </section>
    </main>
  );
}
