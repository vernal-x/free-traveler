"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * TOOL-ERROR-NOTFOUND — 전역 500/런타임 오류 경계.
 *
 * Next.js 규칙상 `error.tsx`는 Client Component여야 한다. Header/Footer는
 * 이 파일이 직접 렌더링하지 않는다 — 이 경계는 `src/app/layout.tsx` 자식으로
 * 렌더링되므로, `TOOL-LAYOUT-SHELL`이 추가할 Header/Footer가 그대로 적용된다
 * (Visual AC "Header/Footer 유지").
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 운영 환경 로그 수집기(Sentry 등)는 이 Task 범위 밖 — 개발 중 확인용 콘솔 출력만 남긴다.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-[480px] flex-1 flex-col items-center justify-center px-md py-xxl text-center text-text-primary">
      <p className="text-display-md text-danger">오류</p>
      <h1 className="mt-xs text-display-lg">문제가 발생했습니다</h1>
      <p className="mt-xs text-body-md text-text-secondary">
        일시적인 오류로 페이지를 표시할 수 없습니다. 다시 시도하시거나 홈으로
        돌아가 주세요.
      </p>
      <div className="mt-lg flex gap-sm">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
