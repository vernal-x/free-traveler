import { describe, expect, it } from "vitest";
import {
  canActorSetApplicationStatus,
  isValidApplicationTransition,
  isValidMatePostTransition,
  type ApplicationActorRole,
  type MateApplicationStatus,
  type MatePostStatus,
} from "../mate-state";

/**
 * UNIT-MATE-STATE — REQ-FUNC-035, 036, 037: 동행글·참가 신청 상태 전이 규칙을
 * 검증한다. 종료일 경과에 따른 자동 CLOSED 표시(`resolveMatePostDisplayStatus`)는
 * `src/lib/supabase/queries/mate-post.ts` 소관이라 이 Task Expected Files
 * (`mate-state.ts`)에는 없다 — 여기서는 작성자의 수동 마감 전이만 다룬다.
 * 중복 PENDING/ACCEPTED 요청 차단은 DB의 부분 유니크 인덱스가 강제하는
 * 영역이라 순수 함수 단위 테스트 대상이 아니다.
 */

describe("isValidMatePostTransition — 동행글 상태 전이", () => {
  it("RECRUITING(모집중)에서 CLOSED(마감)로는 전이할 수 있다", () => {
    expect(isValidMatePostTransition("RECRUITING", "CLOSED")).toBe(true);
  });

  it("CLOSED(마감)에서 RECRUITING(모집중)으로는 되돌릴 수 없다", () => {
    expect(isValidMatePostTransition("CLOSED", "RECRUITING")).toBe(false);
  });

  it.each<[MatePostStatus, MatePostStatus]>([
    ["RECRUITING", "RECRUITING"],
    ["CLOSED", "CLOSED"],
  ])("%s에서 %s로는(동일 상태) 전이로 취급하지 않는다", (from, to) => {
    expect(isValidMatePostTransition(from, to)).toBe(false);
  });
});

describe("isValidApplicationTransition — 참가 신청 상태 전이", () => {
  it.each<MateApplicationStatus>(["ACCEPTED", "REJECTED", "WITHDRAWN"])(
    "PENDING에서 %s로는 전이할 수 있다",
    (to) => {
      expect(isValidApplicationTransition("PENDING", to)).toBe(true);
    },
  );

  it.each<MateApplicationStatus>(["ACCEPTED", "REJECTED", "WITHDRAWN"])(
    "%s는 이미 종결된 상태라 그 이후로는 전이할 수 없다",
    (from) => {
      expect(isValidApplicationTransition(from, "ACCEPTED")).toBe(false);
      expect(isValidApplicationTransition(from, "REJECTED")).toBe(false);
      expect(isValidApplicationTransition(from, "WITHDRAWN")).toBe(false);
      expect(isValidApplicationTransition(from, "PENDING")).toBe(false);
    },
  );

  it("PENDING에서 PENDING으로는(동일 상태) 전이로 취급하지 않는다", () => {
    expect(isValidApplicationTransition("PENDING", "PENDING")).toBe(false);
  });
});

describe("canActorSetApplicationStatus — 역할별 허용 상태", () => {
  it("신청자는 WITHDRAWN(철회)만 설정할 수 있다", () => {
    expect(canActorSetApplicationStatus("APPLICANT", "WITHDRAWN")).toBe(true);
    expect(canActorSetApplicationStatus("APPLICANT", "ACCEPTED")).toBe(false);
    expect(canActorSetApplicationStatus("APPLICANT", "REJECTED")).toBe(false);
  });

  it("글 작성자는 ACCEPTED/REJECTED(승인/거절)만 설정할 수 있다", () => {
    expect(canActorSetApplicationStatus("POST_AUTHOR", "ACCEPTED")).toBe(true);
    expect(canActorSetApplicationStatus("POST_AUTHOR", "REJECTED")).toBe(true);
    expect(canActorSetApplicationStatus("POST_AUTHOR", "WITHDRAWN")).toBe(
      false,
    );
  });

  it.each<ApplicationActorRole>(["APPLICANT", "POST_AUTHOR"])(
    "%s는 PENDING을 직접 설정할 수 없다(초기값일 뿐 목표 상태가 아님)",
    (role) => {
      expect(canActorSetApplicationStatus(role, "PENDING")).toBe(false);
    },
  );
});
