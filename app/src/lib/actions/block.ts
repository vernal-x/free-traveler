"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import {
  createUserBlock,
  deleteUserBlock,
  listBlockedUserIds,
} from "@/lib/supabase/queries/user-block";

/**
 * SA-BLOCK — 사용자 차단/해제 Server Action.
 *
 * `user_block_unique unique (blocker_id, blocked_id)` DB 제약(TC-2)이 이미
 * 중복 차단을 막고 있으므로, 이미 차단된 상대를 다시 차단하려는 시도는 에러
 * 대신 조용히 성공으로 처리한다(사용자 입장에서는 "차단됨" 상태가 목표이지
 * INSERT 성공 여부가 목표가 아니다). "차단 시 상호 글/프로필/요청 비노출"은
 * `listBlockedUserIds`를 사용하는 쪽(예: `CMP-SCR004-FILTER-BAR`)이 실제로
 * 조회를 필터링해 구현하며, 이 파일은 차단 관계 자체의 CRUD만 담당한다.
 */

export interface BlockActionResult {
  error: string | null;
}

const UNIQUE_VIOLATION = "23505";

export async function blockUserAction(
  blockedId: string,
): Promise<BlockActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  if (user.id === blockedId) {
    return { error: "자기 자신을 차단할 수 없습니다." };
  }

  try {
    await createUserBlock(supabase, {
      blockerId: user.id,
      blockedId,
    });
  } catch (e) {
    const code = (e as { code?: string } | null)?.code;
    if (code !== UNIQUE_VIOLATION) {
      return { error: "차단 처리 중 문제가 발생했습니다." };
    }
    // 이미 차단된 상대 — 목표 상태(차단됨)는 이미 달성됐으므로 성공으로 취급한다.
  }

  revalidatePath("/mates");
  revalidatePath("/account");
  return { error: null };
}

export async function unblockUserAction(
  blockedId: string,
): Promise<BlockActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  try {
    await deleteUserBlock(supabase, user.id, blockedId);
  } catch {
    return { error: "차단 해제 중 문제가 발생했습니다." };
  }

  revalidatePath("/mates");
  revalidatePath("/account");
  return { error: null };
}

export async function getMyBlockedUserIds(): Promise<string[]> {
  const user = await requireUser();
  const supabase = await createClient();
  return listBlockedUserIds(supabase, user.id);
}
