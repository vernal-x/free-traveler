import Link from "next/link";

/**
 * TOOL-ERROR-NOTFOUND — 전역 404. Header/Footer는 별도로 렌더링하지 않는다
 * (Visual AC "Header/Footer 유지" — 이 파일은 `src/app/layout.tsx`의 자식으로
 * 그대로 렌더링되므로, 이후 `TOOL-LAYOUT-SHELL`이 Header/Footer를 레이아웃에
 * 추가하면 이 페이지에도 자동으로 적용된다).
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-[480px] flex-1 flex-col items-center justify-center px-md py-xxl text-center text-text-primary">
      <p className="text-display-md text-text-muted">404</p>
      <h1 className="mt-xs text-display-lg">페이지를 찾을 수 없습니다</h1>
      <p className="mt-xs text-body-md text-text-secondary">
        요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-lg inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
