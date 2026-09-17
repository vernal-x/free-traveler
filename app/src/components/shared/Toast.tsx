"use client";

import { useEffect, useState } from "react";
import {
  dismissToast,
  subscribeToasts,
  type ToastMessage,
  type ToastVariant,
} from "@/lib/toast";

/**
 * SA-TOAST-NOTIFICATIONS — 인앱 Toast 렌더러.
 *
 * Visual AC: 3~4초 자동 소멸(만료 타이머는 `src/lib/toast.ts`가 관리), 화면 하단에
 * 고정 노출한다. 색상은 `design-reference/D-001/DESIGN.md`의 `components.toast`
 * 토큰(배경 text-primary, 텍스트 on-primary, radius sm, padding 12px 16px)만
 * 사용하고, 경보 계열 배지(danger/warning/success)를 좌측 인디케이터로 함께 표기해
 * "배지는 색상과 텍스트 라벨을 항상 함께 표기한다"(Do)는 규칙을 따른다.
 */

const VARIANT_INDICATOR: Record<ToastVariant, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-on-primary/60",
};

const VARIANT_LABEL: Record<ToastVariant, string> = {
  success: "성공",
  error: "오류",
  info: "안내",
};

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-xl z-50 flex flex-col items-center gap-xs px-md"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex max-w-[420px] items-center gap-xs rounded-sm bg-text-primary px-md py-sm text-body-sm text-on-primary shadow-card"
        >
          <span
            aria-hidden
            className={`h-2 w-2 shrink-0 rounded-pill ${VARIANT_INDICATOR[toast.variant]}`}
          />
          <span className="sr-only">{VARIANT_LABEL[toast.variant]}:</span>
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="알림 닫기"
            className="ml-xs text-on-primary/70 hover:text-on-primary"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
