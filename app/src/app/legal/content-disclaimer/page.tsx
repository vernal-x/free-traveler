import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "콘텐츠 이용 안내 및 면책 | Free Traveler",
  description:
    "여행지·안전정보 콘텐츠의 성격, 외부 예약 링크와 동행 모집 글에 대한 면책 사항을 안내합니다.",
  alternates: { canonical: "/legal/content-disclaimer" },
  openGraph: {
    title: "콘텐츠 이용 안내 및 면책 | Free Traveler",
    description:
      "여행지·안전정보 콘텐츠의 성격, 외부 예약 링크와 동행 모집 글에 대한 면책 사항을 안내합니다.",
    type: "website",
  },
};

export default function ContentDisclaimerPage() {
  return (
    <main className="mx-auto max-w-[720px] px-md py-xxl text-text-primary">
      <h1 className="text-display-lg">콘텐츠 이용 안내 및 면책</h1>
      <p className="mt-xs text-body-sm text-text-muted">
        시행일: 2026-09-17 · 최종 개정일: 2026-09-17
      </p>

      <section className="mt-xl">
        <h2 className="text-title-md">1. 여행지·안전정보 콘텐츠의 성격</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          Free Traveler가 제공하는 여행지 소개, 국가별 안전정보, 추천 코스 등의
          콘텐츠는 참고용 정보이며, 외교부 등 공식 기관의 최신 판단을 대체하지
          않습니다. 안전정보는 렌더링 시점에 확인일(verified_at) 기준 7일 경과
          여부를 계산해 오래된 정보일 경우 이를 함께 표시하지만, 실제 현지
          상황은 이보다 더 빠르게 변할 수 있습니다. 출국 전 반드시 외교부
          해외안전여행 공식 원문을 확인하시기 바랍니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">
          2. 항공편·숙소 외부 이동 링크에 대한 면책
        </h2>
        <p className="mt-xs text-body-md text-text-secondary">
          서비스는 입력한 조건을 바탕으로 외부 항공권·숙소 예약 사이트로
          이동하는 링크만 제공하며, 해당 외부 사이트의 요금, 재고, 이용 약관,
          결제·환불 절차에 대해 관여하지 않고 책임을 지지 않습니다. 외부
          사이트는 새 창에서 열리며(`noopener,noreferrer`), 이는 서비스가 해당
          사이트의 내용을 보증한다는 의미가 아닙니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">3. 동행 모집 글에 대한 면책</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          동행 모집 글과 참가 신청은 이용자 간에 직접 작성·교환되는 내용으로,
          서비스는 게시글 내용의 진위나 실제 동행 이행 여부를 보증하지 않습니다.
          이용자는{" "}
          <Link
            href="/legal/mate-safety"
            className="text-primary underline underline-offset-2"
          >
            동행 안전수칙
          </Link>
          을 숙지하고 본인의 판단과 책임 하에 참가 여부를 결정해야 합니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">4. 대표 소개·추천 여행지 콘텐츠</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          대표 소개 페이지의 여행 이력, 추천 여행지 등은 편집자의 경험과 기준에
          따라 선정된 콘텐츠이며, 별점·평점 등 정량적 순위를 매기지 않습니다.
          추천 여부가 특정 여행지의 우수성을 공식적으로 인증하는 것은 아닙니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">5. 콘텐츠 저작권</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          서비스에 게재된 사진·글의 저작권은 서비스 또는 정당한 사용권을 확보한
          출처에 있으며, 무단 복제·배포를 금지합니다. 이미지에는 접근성을 위한
          대체 텍스트(alt)가 제공되며, 출처가 있는 경우 캡션으로 표기합니다.
        </p>
      </section>
    </main>
  );
}
