"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMyBlockedUserIds, unblockUserAction } from "@/lib/actions/block";

/**
 * CMP-SCR005-MY-ACTIVITY — SCR-005 `my_activity_blocklist` 탭(REQ-FUNC-040).
 *
 * `getMyBlockedUserIds`(`SA-BLOCK`, 인증 필요)가 반환하는 id 목록에 닉네임을
 * 붙이기 위해 공개 View `mate_author_public`(id/nickname/role만 노출)을
 * 브라우저 Supabase 클라이언트로 조회한다. 로그인 여부를 먼저 확인한 뒤에만
 * `getMyBlockedUserIds`를 호출해, 비로그인 상태에서 인증 필요 Server Action이
 * `/account`로 redirect하며 화면 전체가 사라지는 문제를 피한다.
 */

type LoadState = "loading" | "signed_out" | "ready";

interface BlockedUser {
  id: string;
  nickname: string;
}

export default function MyBlocklist() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const ids = await getMyBlockedUserIds();
    if (ids.length === 0) {
      setBlocked([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("mate_author_public")
      .select("id, nickname")
      .in("id", ids);
    setBlocked(data ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setLoadState("signed_out");
        return;
      }
      await load();
      if (cancelled) return;
      setLoadState("ready");
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUnblock(id: string) {
    setBusyId(id);
    const result = await unblockUserAction(id);
    if (result.error) setErrorMessage(result.error);
    await load();
    setBusyId(null);
  }

  if (loadState === "loading") {
    return <div className="h-24 animate-pulse rounded-md bg-surface-soft" />;
  }
  if (loadState === "signed_out") {
    return (
      <p className="text-body-md text-text-secondary">
        로그인 후 이용할 수 있습니다.
      </p>
    );
  }

  if (blocked.length === 0) {
    return (
      <div className="rounded-md bg-surface-soft p-lg text-center">
        <p className="text-body-md text-text-primary">
          차단한 사용자가 없습니다.
        </p>
        <p className="mt-xxs text-body-sm text-text-secondary">
          불편하거나 위험한 상대는 동행글 상세 화면에서 바로 차단할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      {errorMessage ? (
        <p className="text-caption text-danger">{errorMessage}</p>
      ) : null}
      <ul className="space-y-xs">
        {blocked.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between rounded-md border border-hairline p-md"
          >
            <span className="text-body-md text-text-primary">
              {user.nickname}
            </span>
            <button
              type="button"
              disabled={busyId === user.id}
              onClick={() => handleUnblock(user.id)}
              className="inline-flex h-9 items-center justify-center rounded-sm border border-border-strong bg-canvas px-md text-button text-text-primary disabled:opacity-40"
            >
              차단 해제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
