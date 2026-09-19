"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  confirmAdult,
  requestPasswordReset,
  signIn,
  signUp,
} from "@/lib/auth/actions";
import { showToast } from "@/lib/toast";

/**
 * CMP-SCR005-GUEST-AUTH — SCR-005 Guest 전용 탭 3개(`auth_cards`,
 * `post_login_benefits`, `security_notice`)를 하나의 Component로 묶는다
 * (REQ-FUNC-028, 066).
 *
 * 가입 Card는 정확한 생년월일을 입력받지 않고 "만 19세 이상" 자기 확인
 * 체크박스만으로 성인확인 UI를 구성한다(REQ-FUNC-028). 실제 `is_adult`/
 * `adult_verified_at` 저장(`confirmAdult`)은 `user_profile` 행이 이미 있어야
 * 가능한데(가입 직후에는 아직 없음 — `signUp` 주석 참고), 이 화면에서 로그인이
 * 성공해 세션이 즉시 생기는 경우(예: 이메일 확인 없이 재가입/재로그인)에 한해
 * best-effort로 호출한다 — 프로필 행이 아직 없어 실패하더라도 로그인/가입 자체는
 * 정상 처리된 것이므로 그 실패를 화면에 노출하지 않는다.
 */

type CardStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

const BENEFIT_STEPS = [
  {
    title: "동행글 작성·참가 신청",
    desc: "로그인 후에는 동행글을 직접 작성하거나, 다른 동행글에 참가를 신청할 수 있어요.",
  },
  {
    title: "승인된 상대와 연락",
    desc: "작성자가 신청을 승인하면 그때부터 서로의 연락 수단을 확인할 수 있어요.",
  },
  {
    title: "내 활동 관리",
    desc: "내가 쓴 글, 받은/보낸 요청, 차단 목록을 계정 화면 한곳에서 관리해요.",
  },
];

function CardShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-hairline bg-canvas p-md shadow-card">
      <h3 className="text-title-sm text-text-primary">{title}</h3>
      {children}
    </div>
  );
}

function StatusMessage({ status }: { status: CardStatus }) {
  if (status.kind === "error") {
    return <p className="mt-xs text-caption text-danger">{status.message}</p>;
  }
  if (status.kind === "success") {
    return (
      <p className="mt-xs text-caption text-success">{status.message}</p>
    );
  }
  return null;
}

/** `confirmAdult` 호출 실패(주로 아직 없는 `user_profile` 행)는 조용히 무시한다. */
async function tryConfirmAdult(): Promise<void> {
  try {
    await confirmAdult();
  } catch {
    // best-effort — 가입/로그인 결과 자체에는 영향을 주지 않는다.
  }
}

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<CardStatus>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "submitting" });
    const result = await signIn({ email, password });
    if (result.error) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    await tryConfirmAdult();
    setStatus({ kind: "success", message: "로그인되었습니다." });
    showToast("로그인되었습니다.", "success");
  }

  return (
    <CardShell title="로그인">
      <form className="mt-sm space-y-sm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" className="sr-only">
            이메일
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="sr-only">
            비밀번호
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
        </div>
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
        >
          {status.kind === "submitting" ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <StatusMessage status={status} />
    </CardShell>
  );
}

function SignUpCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdultChecked, setIsAdultChecked] = useState(false);
  const [status, setStatus] = useState<CardStatus>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAdultChecked) {
      setStatus({
        kind: "error",
        message: "만 19세 이상 확인에 동의해야 가입할 수 있습니다.",
      });
      return;
    }
    setStatus({ kind: "submitting" });
    const result = await signUp({ email, password });
    if (result.error) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    await tryConfirmAdult();
    setStatus({
      kind: "success",
      message: "가입 확인 이메일을 보냈습니다. 메일함에서 링크를 눌러 인증을 완료해 주세요.",
    });
  }

  return (
    <CardShell title="회원가입">
      <form className="mt-sm space-y-sm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-email" className="sr-only">
            이메일
          </label>
          <input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="sr-only">
            비밀번호(8자 이상)
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호(8자 이상)"
            className="h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
        </div>
        <label className="flex items-start gap-xxs text-body-sm text-text-secondary">
          <input
            type="checkbox"
            checked={isAdultChecked}
            onChange={(e) => setIsAdultChecked(e.target.checked)}
            className="mt-[3px]"
          />
          <span>
            만 19세 이상입니다. 정확한 생년월일은 입력받지 않으며, 이 확인
            여부와 확인 시각만 저장됩니다.
          </span>
        </label>
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
        >
          {status.kind === "submitting" ? "가입 중..." : "회원가입"}
        </button>
      </form>
      <StatusMessage status={status} />
    </CardShell>
  );
}

function ResetCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<CardStatus>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "submitting" });
    const result = await requestPasswordReset({ email });
    if (result.error) {
      setStatus({ kind: "error", message: result.error });
      return;
    }
    setStatus({
      kind: "success",
      message: "비밀번호 재설정 안내 메일을 보냈습니다.",
    });
  }

  return (
    <CardShell title="비밀번호 재설정">
      <form className="mt-sm space-y-sm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reset-email" className="sr-only">
            이메일
          </label>
          <input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
        </div>
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-sm border border-border-strong bg-canvas px-lg text-button text-text-primary disabled:opacity-40"
        >
          {status.kind === "submitting" ? "전송 중..." : "재설정 메일 받기"}
        </button>
      </form>
      <StatusMessage status={status} />
    </CardShell>
  );
}

function PostLoginBenefits() {
  return (
    <section>
      <h2 className="text-title-md text-text-primary">
        로그인하면 이런 것을 할 수 있어요
      </h2>
      <ol className="mt-sm grid gap-md md:grid-cols-3">
        {BENEFIT_STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-md bg-surface-soft p-md text-body-sm text-text-secondary"
          >
            <span className="text-title-sm text-primary">{i + 1}</span>
            <p className="mt-xxs text-title-sm text-text-primary">
              {step.title}
            </p>
            <p className="mt-xxs">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SecurityNotice() {
  return (
    <div className="rounded-md bg-surface-soft px-md py-lg">
      <h2 className="text-title-md text-text-primary">
        보안·개인정보 안내
      </h2>
      <p className="mt-sm text-body-sm text-text-secondary">
        비밀번호는 안전하게 암호화되어 저장되며, 정확한 생년월일은 어떤
        경우에도 요청하지 않습니다. 성인 여부와 확인 시각만 최소한으로
        저장합니다.
      </p>
    </div>
  );
}

export default function GuestAuthCards() {
  return (
    <div className="space-y-xl">
      <div className="grid gap-md md:grid-cols-3">
        <LoginCard />
        <SignUpCard />
        <ResetCard />
      </div>
      <PostLoginBenefits />
      <SecurityNotice />
    </div>
  );
}
