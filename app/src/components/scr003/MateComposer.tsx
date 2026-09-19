"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DESTINATIONS } from "@/data/destinations";
import { DESTINATION_THEMES } from "@/data/destinations.schema";
import { createMatePostAction } from "@/lib/actions/mate-post";

/**
 * CMP-SCR003-MATE-COMPOSER — SCR-003 Section 6 "동행 구하기 탭 콘텐츠".
 *
 * 로그인/성인 인증 여부를 이 컴포넌트가 직접 브라우저 Supabase 클라이언트로
 * 확인한다(REQ-FUNC-027, 028) — Server Component(`next/headers`)와 Client
 * 상호작용(폼 상태)을 한 파일 안에 함께 둘 수 없는 Next.js 제약 때문에, 전체를
 * Client Component로 유지하고 `user_profile_select_own` RLS(본인 행만 조회
 * 가능)로 안전하게 본인 프로필을 읽는다. 실제 쓰기 권한·연락처 탐지·안전수칙
 * 동의 시각 기록은 `SA-MATE-POST`(`createMatePostAction`)가 서버에서 다시
 * 검증한다 — 이 컴포넌트의 클라이언트 체크는 UX용이며 보안 경계가 아니다.
 * 국가·지역은 `DATA-DESTINATIONS`, 스타일은 `DESTINATION_THEMES`(SCR-001과
 * 동일 테마 어휘)를 재사용한다.
 */

const COUNTRY_GROUPS = (() => {
  const map = new Map<string, { countryName: string; regions: string[] }>();
  for (const d of DESTINATIONS) {
    if (!map.has(d.countryCode)) {
      map.set(d.countryCode, { countryName: d.countryName, regions: [] });
    }
    map.get(d.countryCode)!.regions.push(d.name);
  }
  return Array.from(map.entries()).map(([countryCode, v]) => ({
    countryCode,
    countryName: v.countryName,
    regions: v.regions,
  }));
})();

type AccessState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "not_adult" }
  | { status: "ready" };

function LoginPromptCard({ reason }: { reason: "signed_out" | "not_adult" }) {
  return (
    <div className="rounded-md border border-hairline bg-surface-soft p-lg text-center">
      <p className="text-title-md text-text-primary">
        {reason === "signed_out"
          ? "로그인 후 동행글을 작성할 수 있어요"
          : "성인 인증 후 동행글을 작성할 수 있어요"}
      </p>
      <p className="mt-xs text-body-sm text-text-secondary">
        {reason === "signed_out"
          ? "동행 구하기는 이메일 로그인을 마친 회원만 이용할 수 있습니다."
          : "안전한 동행 매칭을 위해 성인 인증을 완료한 회원만 작성할 수 있습니다."}
      </p>
      <Link
        href="/account"
        className="mt-md inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
      >
        로그인하고 계속하기
      </Link>
    </div>
  );
}

export default function MateComposer() {
  const [access, setAccess] = useState<AccessState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setAccess({ status: "signed_out" });
        return;
      }
      const { data: profile } = await supabase
        .from("user_profile")
        .select("is_adult, account_status")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (
        !profile ||
        !profile.is_adult ||
        profile.account_status !== "ACTIVE"
      ) {
        setAccess({ status: "not_adult" });
        return;
      }
      setAccess({ status: "ready" });
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (access.status === "loading") {
    return <div className="h-40 animate-pulse rounded-md bg-surface-soft" />;
  }

  if (access.status === "signed_out" || access.status === "not_adult") {
    return <LoginPromptCard reason={access.status} />;
  }

  return <MateComposerForm />;
}

function MateComposerForm() {
  const [countryCode, setCountryCode] = useState(
    COUNTRY_GROUPS[0]?.countryCode ?? "",
  );
  const [region, setRegion] = useState(COUNTRY_GROUPS[0]?.regions[0] ?? "");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [headcount, setHeadcount] = useState(2);
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [preferredConditions, setPreferredConditions] = useState("");
  const [safetyRulesAgreed, setSafetyRulesAgreed] = useState(false);
  const [submitState, setSubmitState] = useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "error"; message: string }
    | { status: "success" }
  >({ status: "idle" });

  const regions =
    COUNTRY_GROUPS.find((g) => g.countryCode === countryCode)?.regions ?? [];

  function handleCountryChange(nextCountryCode: string) {
    setCountryCode(nextCountryCode);
    const nextRegions =
      COUNTRY_GROUPS.find((g) => g.countryCode === nextCountryCode)?.regions ??
      [];
    setRegion(nextRegions[0] ?? "");
  }

  function toggleStyle(style: string) {
    setTravelStyle((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  }

  const dateOrderInvalid = startDate && endDate ? endDate < startDate : false;
  const canSubmit =
    title.trim().length > 0 &&
    countryCode &&
    region &&
    startDate &&
    endDate &&
    !dateOrderInvalid &&
    headcount > 0 &&
    description.trim().length > 0 &&
    safetyRulesAgreed &&
    submitState.status !== "submitting";

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitState({ status: "submitting" });
    const result = await createMatePostAction({
      title,
      countryCode,
      region,
      startDate,
      endDate,
      headcount,
      travelStyle,
      description,
      preferredConditions: preferredConditions || undefined,
      safetyRulesAgreed,
    });
    if (result.error) {
      setSubmitState({ status: "error", message: result.error });
      return;
    }
    setSubmitState({ status: "success" });
  }

  if (submitState.status === "success") {
    return (
      <div className="rounded-md border border-hairline bg-surface-soft p-lg text-center">
        <p className="text-title-md text-text-primary">
          동행글이 등록되었습니다
        </p>
        <p className="mt-xs text-body-sm text-text-secondary">
          동행 목록에서 등록한 글을 확인할 수 있어요.
        </p>
        <Link
          href="/mates"
          className="mt-md inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary"
        >
          동행 목록 보기
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-md"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      aria-label="동행글 작성"
    >
      <div>
        <label
          htmlFor="mate-title"
          className="block text-title-sm text-text-primary"
        >
          제목
        </label>
        <input
          id="mate-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
        />
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div>
          <label
            htmlFor="mate-country"
            className="block text-title-sm text-text-primary"
          >
            국가
          </label>
          <select
            id="mate-country"
            value={countryCode}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          >
            {COUNTRY_GROUPS.map((g) => (
              <option key={g.countryCode} value={g.countryCode}>
                {g.countryName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="mate-region"
            className="block text-title-sm text-text-primary"
          >
            지역
          </label>
          <select
            id="mate-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div>
          <label
            htmlFor="mate-start"
            className="block text-title-sm text-text-primary"
          >
            시작일
          </label>
          <input
            id="mate-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
        </div>
        <div>
          <label
            htmlFor="mate-end"
            className="block text-title-sm text-text-primary"
          >
            종료일
          </label>
          <input
            id="mate-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-describedby="mate-end-error"
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
          {dateOrderInvalid ? (
            <p id="mate-end-error" className="mt-xxs text-caption text-danger">
              종료일은 시작일과 같거나 이후여야 합니다.
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="mate-headcount"
          className="block text-title-sm text-text-primary"
        >
          인원
        </label>
        <input
          id="mate-headcount"
          type="number"
          min={1}
          value={headcount}
          onChange={(e) => setHeadcount(Number(e.target.value))}
          className="mt-xxs h-12 w-full max-w-[160px] rounded-sm border border-hairline px-sm text-body-md"
        />
      </div>

      <div>
        <p className="text-title-sm text-text-primary">여행 스타일</p>
        <div className="mt-xxs flex flex-wrap gap-xs">
          {DESTINATION_THEMES.map((theme) => {
            const active = travelStyle.includes(theme);
            return (
              <button
                key={theme}
                type="button"
                onClick={() => toggleStyle(theme)}
                aria-pressed={active}
                className={`rounded-pill px-md py-xs text-body-sm ${
                  active
                    ? "bg-primary-tint text-primary-active"
                    : "bg-surface-soft text-text-secondary"
                }`}
              >
                {theme}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="mate-preferred"
          className="block text-title-sm text-text-primary"
        >
          희망 조건(선택)
        </label>
        <input
          id="mate-preferred"
          type="text"
          value={preferredConditions}
          onChange={(e) => setPreferredConditions(e.target.value)}
          maxLength={500}
          placeholder="예: 비슷한 연령대, 사진 촬영 좋아하는 분"
          className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
        />
      </div>

      <div>
        <label
          htmlFor="mate-description"
          className="block text-title-sm text-text-primary"
        >
          설명
        </label>
        <textarea
          id="mate-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={3000}
          rows={5}
          className="mt-xxs w-full rounded-sm border border-hairline px-sm py-xs text-body-md"
        />
        <p className="mt-xxs text-caption text-text-muted">
          전화번호·메신저 ID·이메일 등 공개 연락처는 포함할 수 없습니다.
        </p>
      </div>

      <label className="flex items-start gap-xs">
        <input
          type="checkbox"
          checked={safetyRulesAgreed}
          onChange={(e) => setSafetyRulesAgreed(e.target.checked)}
          className="mt-xxs h-5 w-5"
        />
        <span className="text-body-sm text-text-secondary">
          <Link href="/legal/mate-safety" className="text-primary underline">
            동행 안전수칙
          </Link>
          을 확인했으며 이에 동의합니다.
        </span>
      </label>

      {submitState.status === "error" ? (
        <div className="rounded-sm bg-danger/10 px-sm py-sm">
          <p className="text-body-sm text-danger">{submitState.message}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
      >
        {submitState.status === "submitting" ? "등록 중..." : "동행글 등록하기"}
      </button>
    </form>
  );
}
