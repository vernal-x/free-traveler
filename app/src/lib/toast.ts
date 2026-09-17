/**
 * SA-TOAST-NOTIFICATIONS — 인앱 Toast 알림 스토어.
 *
 * REQ-FUNC-043(축소): 참가요청·승인·거절·신고 접수 등의 알림은 인앱 Toast/화면 상태로만
 * 대체하고 실제 이메일(SMTP) 발송은 구현하지 않는다. 외부 패키지(`package.json`은 이
 * Task의 Expected Files 밖) 없이 구독 가능한 모듈 스코프 스토어로 최소 구현한다.
 * `src/components/shared/Toast.tsx`가 `subscribe`로 이 상태를 구독해 렌더링한다.
 */

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
  /** 자동 소멸까지 걸리는 시간(ms). Visual AC: 3~4초. */
  durationMs: number;
}

type Listener = (toasts: ToastMessage[]) => void;

const DEFAULT_DURATION_MS = 3500;

let toasts: ToastMessage[] = [];
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener(toasts);
}

function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

/** 새 Toast를 큐에 추가한다. 자동 소멸 타이머는 Toast.tsx가 아니라 여기서 관리한다. */
export function showToast(
  message: string,
  variant: ToastVariant = "info",
  durationMs: number = DEFAULT_DURATION_MS,
): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  toasts = [...toasts, { id, message, variant, durationMs }];
  notify();

  if (typeof window !== "undefined") {
    window.setTimeout(() => dismissToast(id), durationMs);
  }

  return id;
}

/** 구독 시 즉시 현재 상태를 한 번 전달하고, 이후 변경 시마다 다시 호출된다. */
export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function getToasts(): ToastMessage[] {
  return toasts;
}

export { dismissToast };

/** 참가요청/승인/거절/신고 접수 등 동행 도메인 이벤트용 편의 함수(REQ-FUNC-043). */
export const mateToast = {
  applicationSubmitted: () => showToast("참가 요청을 보냈습니다.", "success"),
  applicationApproved: () =>
    showToast("참가 요청이 승인되었습니다.", "success"),
  applicationRejected: () => showToast("참가 요청이 거절되었습니다.", "info"),
  reportSubmitted: () => showToast("신고가 접수되었습니다.", "success"),
  actionFailed: (reason?: string) =>
    showToast(
      reason ?? "요청을 처리하지 못했습니다. 다시 시도해 주세요.",
      "error",
    ),
};
