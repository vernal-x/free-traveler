import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Free Traveler",
  description:
    "Free Traveler가 수집하는 개인정보 항목, 이용 목적, 보유 기간과 이용자 권리를 안내합니다.",
  alternates: { canonical: "/legal/privacy" },
  openGraph: {
    title: "개인정보처리방침 | Free Traveler",
    description:
      "Free Traveler가 수집하는 개인정보 항목, 이용 목적, 보유 기간과 이용자 권리를 안내합니다.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[720px] px-md py-xxl text-text-primary">
      <h1 className="text-display-lg">개인정보처리방침</h1>
      <p className="mt-xs text-body-sm text-text-muted">
        시행일: 2026-09-17 · 최종 개정일: 2026-09-17
      </p>

      <section className="mt-xl">
        <h2 className="text-title-md">제1조(수집하는 개인정보 항목)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          Free Traveler는 회원가입 및 서비스 이용 과정에서 다음 정보를
          수집합니다.
        </p>
        <ul className="mt-xs list-disc space-y-xxs pl-lg text-body-md text-text-secondary">
          <li>이메일 주소(Supabase 이메일 인증)</li>
          <li>성인 인증 여부(is_adult) 및 인증 처리 시각(adult_verified_at)</li>
          <li>동행 모집 글 작성 시 작성한 게시글 내용, 안전수칙 동의 시각</li>
          <li>동행 참가 신청 시 신청 메시지</li>
          <li>신고·차단 처리 내역</li>
        </ul>
        <p className="mt-xs text-body-md text-text-secondary">
          서비스는 정확한 생년월일을 수집·저장하지 않습니다. 항공편·숙소 조건
          입력값(국가·지역·날짜)은 브라우저 내 일시 상태로만 유지되며 서버로
          전송·저장되지 않습니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제2조(개인정보의 수집·이용 목적)</h2>
        <ul className="mt-xs list-disc space-y-xxs pl-lg text-body-md text-text-secondary">
          <li>회원 식별 및 인증, 성인 전용 기능(동행 모집) 접근 제어</li>
          <li>동행 모집 글·참가 신청 처리 및 이용자 간 매칭 지원</li>
          <li>신고 접수 및 부적절한 이용자 차단 처리</li>
          <li>서비스 부정 이용 방지 및 이용약관 위반 대응</li>
        </ul>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제3조(개인정보의 보유 및 이용 기간)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          회원 탈퇴 시 개인정보는 지체 없이 파기합니다. 다만 신고·차단 처리
          이력은 재발 방지 및 분쟁 대응을 위해 탈퇴 후 최대 1년간 별도 보관할 수
          있습니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제4조(개인정보의 제3자 제공)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          서비스는 이용자의 개인정보를 외부에 판매·대여하지 않으며, 법령에
          근거하거나 이용자가 사전에 동의한 경우에만 제한적으로 제공합니다.
          항공편·숙소 외부 이동 시 입력값은 애초에 서버로 전송되지 않으므로 외부
          사이트에 제공되는 개인정보도 없습니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제5조(이용자의 권리)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 계정 설정
          메뉴에서 회원 탈퇴(개인정보 삭제)를 요청할 수 있습니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">
          제6조(개인정보 보호를 위한 기술적 조치)
        </h2>
        <p className="mt-xs text-body-md text-text-secondary">
          서비스는 Supabase의 Row Level Security(RLS)를 적용해 이용자 본인의
          데이터는 본인만 조회·수정할 수 있도록 접근을 제한합니다. 서버 전용
          관리자 키(Service Role Key)는 클라이언트에 노출되지 않도록 서버 측
          코드에서만 사용합니다.
        </p>
      </section>

      <section className="mt-lg">
        <h2 className="text-title-md">제7조(문의처)</h2>
        <p className="mt-xs text-body-md text-text-secondary">
          개인정보 처리와 관련한 문의는 계정 설정 페이지에 안내된 연락 방법을
          통해 접수할 수 있습니다.
        </p>
      </section>
    </main>
  );
}
