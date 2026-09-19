/**
 * SA-MATE-APPLICATION(범위 확장, 동일 패턴 W14 travel-dates.ts/contact-detection.ts) —
 * 동행글·참가 신청 상태 전이 규칙 공유 모듈.
 *
 * `src/lib/actions/mate-application.ts`가 역할별 허용 전이를 검증하는 데 쓰고,
 * `UNIT-MATE-STATE`(W25)가 이 모듈을 직접 import해 테스트한다. 순수 함수만 두어
 * UI·DB 없이도 테스트 가능하게 한다.
 */

export type MatePostStatus = "RECRUITING" | "CLOSED";

const MATE_POST_TRANSITIONS: Record<MatePostStatus, MatePostStatus[]> = {
  RECRUITING: ["CLOSED"],
  CLOSED: [],
};

/** 동행글: RECRUITING(모집중) → CLOSED(마감, 작성자 수동)만 허용한다. */
export function isValidMatePostTransition(
  from: MatePostStatus,
  to: MatePostStatus,
): boolean {
  return MATE_POST_TRANSITIONS[from]?.includes(to) ?? false;
}

export type MateApplicationStatus =
  "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

const MATE_APPLICATION_TRANSITIONS: Record<
  MateApplicationStatus,
  MateApplicationStatus[]
> = {
  PENDING: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

/** 참가 신청: PENDING에서만 ACCEPTED/REJECTED/WITHDRAWN으로 전이할 수 있다. */
export function isValidApplicationTransition(
  from: MateApplicationStatus,
  to: MateApplicationStatus,
): boolean {
  return MATE_APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export type ApplicationActorRole = "APPLICANT" | "POST_AUTHOR";

const ALLOWED_TARGET_BY_ROLE: Record<
  ApplicationActorRole,
  MateApplicationStatus[]
> = {
  APPLICANT: ["WITHDRAWN"],
  POST_AUTHOR: ["ACCEPTED", "REJECTED"],
};

/**
 * "작성자만 승인/거절"(TC-1) — RLS(`mate_application_update_own_or_post_author`)는
 * 신청자·작성자 모두의 UPDATE를 허용하므로, 역할별로 실제 바꿀 수 있는 상태를
 * 이 함수가 앱 레벨에서 제한한다(RLS 정책 주석에 명시된 설계).
 */
export function canActorSetApplicationStatus(
  role: ApplicationActorRole,
  targetStatus: MateApplicationStatus,
): boolean {
  return ALLOWED_TARGET_BY_ROLE[role]?.includes(targetStatus) ?? false;
}
