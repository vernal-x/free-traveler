"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import {
  getExternalLinkSetting,
  upsertExternalLinkSetting,
  type ExternalLinkSettingRow,
} from "@/lib/supabase/queries/external-link-settings";

/**
 * SA-EXTERNAL-URL-SETTINGS — 항공/숙소 외부 이동 URL 설정 Server Action.
 *
 * "Admin만 쓰기 가능"(TC-2)은 RLS(`external_link_settings_admin_only`,
 * `role = 'ADMIN'`)가 실제 경계를 강제한다 — 일반 회원이 이 Action을 호출하면
 * upsert가 0건 처리되고 `upsertExternalLinkSetting`의 `.select().single()`이
 * 에러를 던지므로 이 계층이 그 에러를 사용자에게 읽히는 문구로 바꾼다.
 * "허용목록 내 HTTPS로만"(TC-1)은 `upsertExternalLinkSettingSchema`(이미 완료된
 * DB-ACCESS 산출물)가 `key`를 고정 enum(FLIGHT_OUTBOUND_URL/HOTEL_OUTBOUND_URL)
 * 으로, `url`을 `https://` 시작 문자열로 이미 강제한다.
 */

export interface ExternalUrlSettingActionResult {
  error: string | null;
}

export async function updateExternalUrlSettingAction(
  key: ExternalLinkSettingRow["key"],
  url: string,
): Promise<ExternalUrlSettingActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  try {
    await upsertExternalLinkSetting(supabase, {
      key,
      url,
      updatedBy: user.id,
    });
    revalidatePath("/account");
    return { error: null };
  } catch (e) {
    if (e instanceof Error && e.name === "ZodError") {
      return { error: "URL은 https://로 시작하는 올바른 주소여야 합니다." };
    }
    return {
      error: "권한이 없거나 저장 중 문제가 발생했습니다.",
    };
  }
}

export async function getExternalUrlSettingAction(
  key: ExternalLinkSettingRow["key"],
): Promise<ExternalLinkSettingRow | null> {
  await requireUser();
  const supabase = await createClient();
  try {
    return await getExternalLinkSetting(supabase, key);
  } catch {
    return null;
  }
}
