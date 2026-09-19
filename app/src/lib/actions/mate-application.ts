"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdultUser, requireUser } from "@/lib/auth/guards";
import {
  createMateApplication,
  getMateApplicationById,
  updateMateApplicationStatus,
  type MateApplicationRow,
} from "@/lib/supabase/queries/mate-application";
import { getMatePostById } from "@/lib/supabase/queries/mate-post";
import {
  canActorSetApplicationStatus,
  isValidApplicationTransition,
} from "./mate-state";

/**
 * SA-MATE-APPLICATION — 참가 요청 생성/승인/거절/철회 Server Action.
 *
 * RLS(`mate_application_update_own_or_post_author`)는 신청자·글 작성자 모두의
 * UPDATE를 허용하지만 "누가 어떤 상태로 바꿀 수 있는지"는 구분하지 않는다 —
 * 그 구분(신청자는 WITHDRAWN만, 작성자는 ACCEPTED/REJECTED만)은 이 계층이
 * `mate-state.ts`로 검증한다(RLS 정책 주석에 명시된 설계, "단순하게" 원칙).
 * 중복 PENDING/ACCEPTED 신청은 DB의 부분 유니크 인덱스가 막으며, 이 계층은 그
 * 위반을 사용자에게 읽히는 오류 문구로 바꾼다.
 */

export interface MateApplicationActionResult {
  error: string | null;
  applicationId?: string;
}

const UNIQUE_VIOLATION = "23505";

export async function createMateApplicationAction(
  matePostId: string,
  message: string,
): Promise<MateApplicationActionResult> {
  const user = await requireAdultUser();
  const supabase = await createClient();

  try {
    const application = await createMateApplication(supabase, {
      matePostId,
      applicantId: user.id,
      message,
    });
    revalidatePath("/mates");
    return { error: null, applicationId: application.id };
  } catch (e) {
    const code = (e as { code?: string } | null)?.code;
    if (code === UNIQUE_VIOLATION) {
      return {
        error: "이미 이 글에 대기 중이거나 승인된 신청 내역이 있습니다.",
      };
    }
    return { error: "신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}

async function transitionApplicationStatus(
  applicationId: string,
  targetStatus: MateApplicationRow["status"],
): Promise<MateApplicationActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const application = await getMateApplicationById(supabase, applicationId);
  if (!application) {
    return { error: "신청 내역을 찾을 수 없습니다." };
  }

  let role: "APPLICANT" | "POST_AUTHOR" | null = null;
  if (application.applicant_id === user.id) {
    role = "APPLICANT";
  } else {
    const post = await getMatePostById(supabase, application.mate_post_id);
    if (post?.author_id === user.id) role = "POST_AUTHOR";
  }

  if (!role || !canActorSetApplicationStatus(role, targetStatus)) {
    return { error: "이 작업을 수행할 권한이 없습니다." };
  }
  if (!isValidApplicationTransition(application.status, targetStatus)) {
    return { error: "이미 처리된 신청입니다." };
  }

  try {
    await updateMateApplicationStatus(supabase, applicationId, targetStatus);
    revalidatePath("/mates");
    return { error: null, applicationId };
  } catch {
    return { error: "처리 중 문제가 발생했습니다." };
  }
}

/** 글 작성자만 수행 가능(`canActorSetApplicationStatus`가 역할을 재확인). */
export async function acceptApplicationAction(
  applicationId: string,
): Promise<MateApplicationActionResult> {
  return transitionApplicationStatus(applicationId, "ACCEPTED");
}

export async function rejectApplicationAction(
  applicationId: string,
): Promise<MateApplicationActionResult> {
  return transitionApplicationStatus(applicationId, "REJECTED");
}

/** 신청자 본인만 수행 가능. */
export async function withdrawApplicationAction(
  applicationId: string,
): Promise<MateApplicationActionResult> {
  return transitionApplicationStatus(applicationId, "WITHDRAWN");
}
