"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  type UserProfileRow,
} from "@/lib/supabase/queries/user-profile";
import { deleteAccountAction } from "@/lib/actions/account-delete";
import { DESTINATION_THEMES } from "@/data/destinations.schema";

/**
 * CMP-SCR005-PROFILE — SCR-005 `profile` 탭: 프로필 편집 + 탈퇴(REQ-FUNC-029, 045).
 *
 * `signUp`(AUTH-EMAIL-ADULT)은 가입 직후 `user_profile` 행을 만들지 않으므로
 * (닉네임/연령대가 아직 없음), 이 화면이 최초 진입 시 `createUserProfile`로
 * 행을 생성하고, 이후에는 `updateUserProfile`로 수정한다 — 둘 다 RLS
 * (`user_profile_insert_own`/`update_own`)가 본인 행만 허용하므로 브라우저
 * Supabase 클라이언트로 직접 호출한다. 여행 스타일 선택지는 SCR-001과 동일한
 * `DESTINATION_THEMES`를 그대로 재사용해 값 체계를 통일한다. 탈퇴는
 * `SA-ACCOUNT-DELETE`(`deleteAccountAction`)를 그대로 호출한다.
 */

const AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대 이상"];
const GENDERS = ["여성", "남성", "기타"];

type LoadState = "loading" | "signed_out" | "ready";

export default function ProfileForm() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);

  const [nickname, setNickname] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const [saveState, setSaveState] = useState<
    | { status: "idle" }
    | { status: "saving" }
    | { status: "error"; message: string }
    | { status: "success" }
  >({ status: "idle" });
  const [deleteBusy, setDeleteBusy] = useState(false);

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
      setUserId(user.id);
      const existing = await getUserProfile(supabase, user.id);
      if (cancelled) return;
      if (existing) {
        setProfile(existing);
        setNickname(existing.nickname);
        setAgeGroup(existing.age_group);
        setGender(existing.gender ?? "");
        setTravelStyle(existing.travel_style);
        setBio(existing.bio ?? "");
      }
      setLoadState("ready");
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleStyle(style: string) {
    setTravelStyle((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style],
    );
  }

  async function handleSave() {
    if (!userId) return;
    if (nickname.trim().length === 0 || ageGroup.trim().length === 0) {
      setSaveState({
        status: "error",
        message: "닉네임과 연령대는 필수입니다.",
      });
      return;
    }
    setSaveState({ status: "saving" });
    const supabase = createClient();
    try {
      if (profile) {
        const updated = await updateUserProfile(supabase, userId, {
          nickname,
          ageGroup,
          gender: gender || null,
          travelStyle,
          bio: bio || null,
        });
        setProfile(updated);
      } else {
        const created = await createUserProfile(supabase, {
          id: userId,
          nickname,
          ageGroup,
          gender: gender || undefined,
          travelStyle,
          bio: bio || undefined,
        });
        setProfile(created);
      }
      setSaveState({ status: "success" });
    } catch (e) {
      setSaveState({
        status: "error",
        message:
          e instanceof Error ? e.message : "저장 중 문제가 발생했습니다.",
      });
    }
  }

  async function handleDelete() {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "정말 탈퇴하시겠습니까? 즉시 처리되며 되돌릴 수 없습니다.",
      )
    ) {
      return;
    }
    setDeleteBusy(true);
    await deleteAccountAction();
  }

  if (loadState === "loading") {
    return <div className="h-64 animate-pulse rounded-md bg-surface-soft" />;
  }
  if (loadState === "signed_out") {
    return (
      <p className="text-body-md text-text-secondary">
        로그인 후 이용할 수 있습니다.
      </p>
    );
  }

  return (
    <div className="space-y-lg">
      <div className="space-y-sm rounded-md border border-hairline p-md">
        <div>
          <label
            htmlFor="profile-nickname"
            className="block text-title-sm text-text-primary"
          >
            닉네임
          </label>
          <input
            id="profile-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          />
        </div>

        <div>
          <label
            htmlFor="profile-age"
            className="block text-title-sm text-text-primary"
          >
            연령대
          </label>
          <select
            id="profile-age"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          >
            <option value="">선택</option>
            {AGE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="profile-gender"
            className="block text-title-sm text-text-primary"
          >
            성별(선택)
          </label>
          <select
            id="profile-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-xxs h-12 w-full rounded-sm border border-hairline px-sm text-body-md"
          >
            <option value="">선택 안 함</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-title-sm text-text-primary">
            여행 스타일
          </span>
          <div className="mt-xxs flex flex-wrap gap-xs">
            {DESTINATION_THEMES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`h-9 rounded-pill border px-md text-body-sm ${
                  travelStyle.includes(style)
                    ? "border-primary bg-primary-tint text-primary-active"
                    : "border-border-strong bg-canvas text-text-secondary"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-bio"
            className="block text-title-sm text-text-primary"
          >
            자기소개(선택)
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1000}
            rows={4}
            className="mt-xxs w-full rounded-sm border border-hairline px-sm py-xs text-body-md"
          />
        </div>

        {profile ? (
          <p className="text-caption text-text-muted">
            성인 인증:{" "}
            <span
              className={
                profile.is_adult ? "text-success" : "text-text-muted"
              }
            >
              {profile.is_adult ? "완료" : "미완료"}
            </span>
          </p>
        ) : null}

        {saveState.status === "error" ? (
          <p className="text-caption text-danger">{saveState.message}</p>
        ) : null}
        {saveState.status === "success" ? (
          <p className="text-caption text-success">저장되었습니다.</p>
        ) : null}

        <button
          type="button"
          disabled={saveState.status === "saving"}
          onClick={handleSave}
          className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-primary px-lg text-button text-on-primary disabled:opacity-40"
        >
          {saveState.status === "saving"
            ? "저장 중..."
            : profile
              ? "저장"
              : "프로필 만들기"}
        </button>
      </div>

      <div className="rounded-md border border-hairline p-md">
        <p className="text-body-sm text-text-secondary">
          탈퇴하면 닉네임·성별·자기소개가 즉시 비식별화되고 계정이
          비활성화됩니다. 30일 유예 기간은 없습니다.
        </p>
        <button
          type="button"
          disabled={deleteBusy}
          onClick={handleDelete}
          className="mt-sm inline-flex h-9 items-center justify-center rounded-sm border border-danger px-md text-button text-danger disabled:opacity-40"
        >
          탈퇴하기
        </button>
      </div>
    </div>
  );
}
