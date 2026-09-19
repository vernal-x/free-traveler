"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdultUser, requireUser } from "@/lib/auth/guards";
import {
  createMatePost,
  updateMatePost,
  deleteMatePost,
  getMatePostById,
  type CreateMatePostInput,
  type UpdateMatePostInput,
} from "@/lib/supabase/queries/mate-post";
import { detectContactInfoInFields } from "@/lib/validation/contact-detection";

/**
 * SA-MATE-POST — 동행글 CRUD·자동/수동 마감 Server Action.
 *
 * `src/lib/supabase/queries/mate-post.ts`(필수 필드·날짜 zod 검증, RLS로 작성자만
 * 쓰기 가능)를 감싸 이 계층에서만 처리 가능한 두 가지를 더한다: ① 제목·설명·
 * 희망 조건에서 공개 연락처 패턴을 탐지해 제출을 차단(REQ-FUNC-031, 032), ②
 * 마감/삭제 전 승인된(ACCEPTED) 신청자가 있으면 경고 정보를 함께 돌려준다
 * (REQ-FUNC-038 "승인자 존재 시 경고" — 차단은 아니며 호출측 UI가 확인 대화상자로
 * 쓴다). "작성자만 수정/마감/삭제"는 RLS(`mate_post_update_own`/`_delete_own`)가
 * 실제로 강제하므로, 이 Server Action은 인증된 사용자의 세션이 담긴 서버 클라이언트를
 * 그대로 통과시킨다.
 */

export interface MatePostActionResult {
  error: string | null;
  postId?: string;
}

export interface MatePostDeletionWarning {
  hasAcceptedApplicants: boolean;
  acceptedCount: number;
}

function contactInfoError(
  fields: Record<string, string | null | undefined>,
): string | null {
  const hits = detectContactInfoInFields(fields);
  if (hits.length === 0) return null;
  return "전화번호·메신저 ID·이메일처럼 보이는 공개 연락처가 포함되어 있어 등록할 수 없습니다. 연락처는 서비스 안에서만 주고받아 주세요.";
}

export type CreateMatePostActionInput = Omit<
  CreateMatePostInput,
  "authorId" | "safetyRulesAgreedAt"
> & { safetyRulesAgreed: boolean };

/** REQ-FUNC-031: 안전수칙 동의 없이는 등록할 수 없다. */
export async function createMatePostAction(
  input: CreateMatePostActionInput,
): Promise<MatePostActionResult> {
  if (!input.safetyRulesAgreed) {
    return { error: "안전수칙에 동의해야 동행글을 등록할 수 있습니다." };
  }

  const contactError = contactInfoError({
    title: input.title,
    description: input.description,
    preferredConditions: input.preferredConditions,
  });
  if (contactError) return { error: contactError };

  const user = await requireAdultUser();
  const supabase = await createClient();

  try {
    const post = await createMatePost(supabase, {
      title: input.title,
      countryCode: input.countryCode,
      region: input.region,
      startDate: input.startDate,
      endDate: input.endDate,
      headcount: input.headcount,
      preferredConditions: input.preferredConditions,
      travelStyle: input.travelStyle,
      description: input.description,
      authorId: user.id,
      safetyRulesAgreedAt: new Date().toISOString(),
    });
    revalidatePath("/mates");
    revalidatePath("/");
    return { error: null, postId: post.id };
  } catch {
    return { error: "등록 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}

export async function updateMatePostAction(
  id: string,
  input: UpdateMatePostInput,
): Promise<MatePostActionResult> {
  const contactError = contactInfoError({
    title: input.title,
    description: input.description,
    preferredConditions: input.preferredConditions,
  });
  if (contactError) return { error: contactError };

  await requireUser();
  const supabase = await createClient();

  try {
    await updateMatePost(supabase, id, input);
    revalidatePath("/mates");
    revalidatePath(`/mates/${id}`);
    return { error: null, postId: id };
  } catch {
    return { error: "수정 중 문제가 발생했습니다." };
  }
}

/** 마감/삭제 전 호출해 승인된 신청자가 있는지 확인한다(경고 표시용, 차단 아님). */
export async function getMatePostDeletionWarning(
  id: string,
): Promise<MatePostDeletionWarning> {
  await requireUser();
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("mate_application")
    .select("id", { count: "exact", head: true })
    .eq("mate_post_id", id)
    .eq("status", "ACCEPTED");

  if (error) return { hasAcceptedApplicants: false, acceptedCount: 0 };
  const acceptedCount = count ?? 0;
  return { hasAcceptedApplicants: acceptedCount > 0, acceptedCount };
}

export async function closeMatePostAction(
  id: string,
): Promise<MatePostActionResult> {
  await requireUser();
  const supabase = await createClient();

  try {
    await updateMatePost(supabase, id, { status: "CLOSED" });
    revalidatePath("/mates");
    revalidatePath(`/mates/${id}`);
    return { error: null, postId: id };
  } catch {
    return { error: "마감 처리 중 문제가 발생했습니다." };
  }
}

export async function deleteMatePostAction(
  id: string,
): Promise<MatePostActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  try {
    // `deleteMatePost`는 `.select()` 없이 delete만 호출하므로, RLS가 행을
    // 걸러내(작성자가 아님) 0건이 지워져도 에러 없이 반환된다(Postgres/PostgREST
    // 표준 동작 — 실제 브라우저 테스트로 발견). 삭제 전 소유자를 직접 확인해
    // "성공한 것처럼 보이지만 실제로는 아무 일도 안 일어남"을 막는다.
    const existing = await getMatePostById(supabase, id);
    if (!existing) {
      return { error: null };
    }
    if (existing.author_id !== user.id) {
      return { error: "본인이 작성한 동행글만 삭제할 수 있습니다." };
    }

    await deleteMatePost(supabase, id);
    revalidatePath("/mates");
    return { error: null };
  } catch {
    return { error: "삭제 중 문제가 발생했습니다." };
  }
}
