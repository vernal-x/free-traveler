import { describe, expect, it } from "vitest";
import {
  detectContactInfo,
  detectContactInfoInFields,
} from "../contact-detection";

/**
 * UNIT-CONTACT-DETECTION — REQ-FUNC-032(축소): 전화번호/이메일/메신저 ID
 * 패턴 기준 테스트셋으로 탐지율을 확인한다(정량 목표 없이 케이스 기반).
 */

describe("detectContactInfo — 전화번호", () => {
  it.each([
    "010-1234-5678",
    "01012345678",
    "010.1234.5678",
    "+82 10-1234-5678",
  ])("휴대폰 번호 패턴 %s 을 탐지한다", (text) => {
    const result = detectContactInfo(text);
    expect(result.detected).toBe(true);
    expect(result.reasons).toContain("phone");
  });
});

describe("detectContactInfo — 이메일", () => {
  it("이메일 주소를 탐지한다", () => {
    const result = detectContactInfo("test@example.com 으로 연락주세요");
    expect(result.detected).toBe(true);
    expect(result.reasons).toContain("email");
  });
});

describe("detectContactInfo — 메신저 ID", () => {
  it.each([
    "카톡 아이디: myid123",
    "카카오톡 myid123",
    "텔레그램: myid123",
    "인스타 abcd_1234",
  ])("메신저 ID 패턴 %s 을 탐지한다", (text) => {
    const result = detectContactInfo(text);
    expect(result.detected).toBe(true);
    expect(result.reasons).toContain("messenger_id");
  });
});

describe("detectContactInfo — 오탐 방지(연락처 아닌 일반 텍스트)", () => {
  it.each([
    "일정 2026-12-01 부터 2026-12-05",
    "예산은 30-50만원 정도",
    "2박 3일 일정으로 계획중이에요",
    "그냥 평범한 설명입니다 아무 연락처도 없어요",
  ])("%s 는 연락처로 탐지하지 않는다", (text) => {
    const result = detectContactInfo(text);
    expect(result.detected).toBe(false);
    expect(result.reasons).toEqual([]);
  });
});

describe("detectContactInfoInFields", () => {
  it("연락처가 포함된 필드만 결과에 포함한다", () => {
    const hits = detectContactInfoInFields({
      title: "함께 여행해요",
      description: "카톡 아이디: myid123",
      preferredConditions: "2박 3일, 예산 30만원",
    });

    expect(hits).toHaveLength(1);
    expect(hits[0].field).toBe("description");
    expect(hits[0].result.reasons).toContain("messenger_id");
  });

  it("연락처가 전혀 없으면 빈 배열을 반환한다", () => {
    const hits = detectContactInfoInFields({
      title: "함께 여행해요",
      description: "즐거운 여행 만들어요",
      preferredConditions: null,
    });
    expect(hits).toEqual([]);
  });

  it("null/undefined 필드는 건너뛴다", () => {
    const hits = detectContactInfoInFields({
      title: undefined,
      description: null,
      preferredConditions: "test@example.com",
    });
    expect(hits).toHaveLength(1);
    expect(hits[0].field).toBe("preferredConditions");
  });
});
