import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | Free Traveler",
  description:
    "Free Traveler 서비스 이용약관 — 서비스 내용, 성인 인증, 동행 커뮤니티 이용 원칙과 면책 사항을 안내합니다.",
  alternates: { canonical: "/legal/terms" },
  openGraph: {
    title: "이용약관 | Free Traveler",
    description:
      "Free Traveler 서비스 이용약관 — 서비스 내용, 성인 인증, 동행 커뮤니티 이용 원칙과 면책 사항을 안내합니다.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[720px] px-md py-xxl text-text-primary">
      <h1 className="text-display-lg">이용약관</h1>
      <p className="mt-xs text-body-sm text-text-muted">
        시행일: 2026-09-17 · 최종 개정일: 2026-09-17
      </p>

      <section className="mt-xl">
        <h2 className="text-title-md">제1조(목적)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          이 약관은 Free Traveler(이하 &quot;서비스&quot;)가 제공하는 여행지
          정보, 국가별 안전정보, 대표 소개, 통합 여행 준비 도구, 동행 커뮤니티
          이용과 관련하여 서비스와 이용자 간의 권리·의무 및 책임사항을 정하는
          것을 목적으로 합니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제2조(서비스의 내용)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          서비스는 다음 각 호의 기능을 제공합니다.
        </p>
        <ul className="mt-xs list-disc space-y-xxs pl-lg text-body-md text-text-secondary">
          <li>국내·해외 여행지 정보 열람 및 키워드 검색</li>
          <li>국가별 안전정보(경보 범위, 출처, 확인일 포함) 열람</li>
          <li>
            항공편·숙소 조건 입력 후 외부 예약 사이트로의 이동(서비스 내
            결제·예약 기능은 제공하지 않습니다)
          </li>
          <li>동행 모집 글 작성·조회·참가 신청 등 동행 커뮤니티 기능</li>
        </ul>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제3조(성인 인증 및 이용 자격)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          동행 모집 글 작성·참가 신청 등 커뮤니티 기능은 만 19세 이상 성인만
          이용할 수 있습니다. 이용자는 회원가입 시 성인 여부를 확인하는 절차에
          동의해야 하며, 서비스는 실명 확인이나 신분증 업로드가 아닌 자기 확인
          방식으로 성인 여부를 처리합니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">
          제4조(외부 서비스 이동에 대한 책임 제한)
        </h2>
        <p className="mt-xs text-body-md text-text-secondary">
          서비스는 항공편·숙소 예약을 위해 외부 사이트로 이용자를 안내할 뿐,
          외부 사이트에서 발생하는 거래, 결제, 취소·환불 등 어떠한 사항에도
          관여하지 않으며 이에 대한 책임을 지지 않습니다. 입력한 여행 조건
          (국가·지역·날짜)은 서비스 서버에 저장되지 않으며, 이동 시 외부 URL에
          포함되지 않습니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제5조(동행 커뮤니티 이용 원칙)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          동행 모집 글 작성자는 &quot;동행 안전수칙&quot;에 동의한 시각이 함께
          기록되며, 이 동의는 게시글 작성의 전제 조건입니다. 실시간 채팅, 위치
          공유, 연락처(전화번호·메신저 ID·이메일) 게시글 노출은 제공하지 않으며,
          참가 신청은 1회성 메시지 폼으로만 처리됩니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제6조(금지 행위)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          이용자는 다음 행위를 해서는 안 됩니다: 타인의 개인정보(연락처 등)
          게시글 본문 노출, 미성년자를 동행 모집 대상에 포함하는 게시, 허위
          안전정보 유포, 서비스 운영을 방해하는 행위.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제7조(신고 및 차단)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          이용자는 부적절한 게시글·이용자를 신고할 수 있으며, 서비스는 신고
          내용을 검토해 필요한 조치를 취합니다. 이용자는 특정 이용자를 차단해
          해당 이용자의 게시글이 노출되지 않도록 설정할 수 있습니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제8조(면책)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          여행지·안전정보 콘텐츠는 참고용이며 공식 기관의 최신 판단을 대체하지
          않습니다. 자세한 내용은{" "}
          <Link
            href="/legal/content-disclaimer"
            className="text-primary underline underline-offset-2"
          >
            콘텐츠 이용 안내
          </Link>
          를 확인하시기 바랍니다.
        </p>
      </section>
    </main>
  );
}
