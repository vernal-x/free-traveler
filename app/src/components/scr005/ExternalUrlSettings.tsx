"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getExternalUrlSettingAction,
  updateExternalUrlSettingAction,
} from "@/lib/actions/external-url-settings";
import type { ExternalLinkSettingRow } from "@/lib/supabase/queries/external-link-settings";

/**
 * CMP-SCR005-ADMIN-URL-SETTINGS — SCR-005 Admin 탭 "외부 URL 설정"(REQ-FUNC-077).
 *
 * 저장은 `SA-EXTERNAL-URL-SETTINGS`(`updateExternalUrlSettingAction`)를 그대로
 * 호출한다 — "Admin만 쓰기 가능"은 RLS가 실제 경계를 강제하므로, 이 폼은
 * 클라이언트에서 역할을 재판정하지 않는다(일반 회원이 이 폼에 접근하더라도
 * 저장 시도는 서버에서 안전하게 거부된다). URL 형식은 제출 전에도 미리
 * 검사해 인라인 오류로 즉시 보여준다(TC-2: http/`javascript:`/`data:` 차단).
 *
 * 마운트 시 로그인 여부를 먼저 브라우저 Supabase 클라이언트로 확인한 뒤에만
 * `getExternalUrlSettingAction`(인증 필요)을 호출한다 — `CMP-SCR004-REPORT-BLOCK`/
 * `APPLY-FLOW`에서 발견한 것과 같은 문제(비로그인 상태로 인증 필요 액션을 마운트
 * 시 바로 호출하면 `requireUser()`의 redirect가 화면 전체를 실제로 이동시켜버림)를
 * 이 컴포넌트도 그대로 갖고 있어 같은 방식으로 피한다. 이 화면은 원래 이미
 * 검증된 Admin에게만 부모(PAGE-SCR005)가 조건부로 렌더링할 예정이지만, 그 가정이
 * 깨지는 경우(예: 아직 로그인하지 않은 상태로 렌더링됨)에도 페이지 전체가 깨지지
 * 않도록 방어한다.
 */

type Key = ExternalLinkSettingRow["key"];

const FIELDS: { key: Key; label: string }[] = [
  { key: "FLIGHT_OUTBOUND_URL", label: "항공편 외부 URL" },
  { key: "HOTEL_OUTBOUND_URL", label: "숙소 외부 URL" },
];

type FieldStatus =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "error"; message: string }
  | { status: "success" };

function validateUrl(url: string): string | null {
  if (!/^https:\/\//i.test(url)) {
    return "https://로 시작하는 주소만 입력할 수 있습니다.";
  }
  if (/^\s*(javascript|data):/i.test(url)) {
    return "허용되지 않는 URL 형식입니다.";
  }
  return null;
}

export default function ExternalUrlSettings() {
  const [values, setValues] = useState<Record<Key, string>>({
    FLIGHT_OUTBOUND_URL: "",
    HOTEL_OUTBOUND_URL: "",
  });
  const [fieldStatus, setFieldStatus] = useState<Record<Key, FieldStatus>>({
    FLIGHT_OUTBOUND_URL: { status: "idle" },
    HOTEL_OUTBOUND_URL: { status: "idle" },
  });
  const [loaded, setLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setIsSignedIn(false);
        setLoaded(true);
        return;
      }
      setIsSignedIn(true);

      const entries = await Promise.all(
        FIELDS.map(async (f) => {
          const row = await getExternalUrlSettingAction(f.key);
          return [f.key, row?.url ?? ""] as const;
        }),
      );
      if (cancelled) return;
      setValues((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      setLoaded(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(key: Key) {
    const url = values[key];
    const clientError = validateUrl(url);
    if (clientError) {
      setFieldStatus((prev) => ({
        ...prev,
        [key]: { status: "error", message: clientError },
      }));
      return;
    }

    setFieldStatus((prev) => ({ ...prev, [key]: { status: "saving" } }));
    const result = await updateExternalUrlSettingAction(key, url);
    setFieldStatus((prev) => ({
      ...prev,
      [key]: result.error
        ? { status: "error", message: result.error }
        : { status: "success" },
    }));
  }

  if (!loaded) {
    return <div className="h-32 animate-pulse rounded-md bg-surface-soft" />;
  }

  if (!isSignedIn) {
    return (
      <p className="text-body-md text-text-secondary">
        로그인 후 이용할 수 있습니다.
      </p>
    );
  }

  return (
    <div className="space-y-lg">
      {FIELDS.map((field) => {
        const status = fieldStatus[field.key];
        return (
          <div key={field.key}>
            <label
              htmlFor={`url-${field.key}`}
              className="block text-title-sm text-text-primary"
            >
              {field.label}
            </label>
            <input
              id={`url-${field.key}`}
              type="text"
              value={values[field.key]}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [field.key]: e.target.value,
                }))
              }
              aria-describedby={`url-${field.key}-error`}
              className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
            />
            {status.status === "error" ? (
              <p
                id={`url-${field.key}-error`}
                className="mt-xxs text-caption text-danger"
              >
                {status.message}
              </p>
            ) : null}
            {status.status === "success" ? (
              <p className="mt-xxs text-caption text-success">
                저장되었습니다.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => handleSave(field.key)}
              disabled={status.status === "saving"}
              className="mt-xs inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
            >
              {status.status === "saving" ? "저장 중..." : "저장"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
