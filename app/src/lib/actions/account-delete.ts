"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { deidentifyUserProfile } from "@/lib/supabase/queries/user-profile";

export interface AccountDeleteResult {
  error: string | null;
}

/**
 * SA-ACCOUNT-DELETE — REQ-FUNC-045(축소): 탈퇴 시 즉시 프로필 비식별화.
 *
 * `user_profile` 행 자체는 지우지 않고 남겨 둔다. 스키마상 `mate_post.author_id`,
 * `mate_application.applicant_id`, `user_block.blocker_id`/`blocked_id`,
 * `report.reporter_id`가 모두 `user_profile(id)`를 `on delete cascade`로
 * 참조하므로, 이 행을 실제로 삭제하면 그동안의 동행글·요청·차단 이력이 통째로
 * 연쇄 삭제된다. 게다가 `report.target_id`는 다형 참조라 FK 자체가 없어(신고
 * 대상이 이 사용자인 기존 신고 건), 행이 사라지면 존재하지 않는 사용자를
 * 가리키는 orphan 참조가 그대로 남는다. 행을 보존한 채 비식별화만 하는
 * `deidentifyUserProfile`이 Security/Privacy AC("orphan 남기지 않음")를 만족하는
 * 방법이다. 30일 유예·법적 보존 예외 배치는 축소 범위로 제외한다
 * (`docs/PROJECT_SCOPE.md` REQ-FUNC-045).
 */
export async function deleteAccountAction(): Promise<AccountDeleteResult> {
  const supabase = await createClient();
  const user = await requireUser(supabase);

  try {
    await deidentifyUserProfile(supabase, user.id);
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "탈퇴 처리에 실패했습니다.",
    };
  }

  await supabase.auth.signOut();
  redirect("/");
}
