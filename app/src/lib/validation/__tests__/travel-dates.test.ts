import { describe, expect, it } from "vitest";
import {
  hasDateRangeErrors,
  validateFlightDates,
  validateHotelDates,
} from "../travel-dates";

/**
 * UNIT-TRAVEL-DATES — REQ-FUNC-013, 021: 항공·숙소 날짜 검증의 경계값(오늘/
 * 어제/출발=귀국/역전)을 커버한다. 두 규칙의 핵심 차이 — 항공은 당일 왕복
 * 허용(출발=귀국 유효), 숙소는 당일 불가(체크인=체크아웃 오류) — 를 각각
 * 명시적으로 검증한다. `today`를 고정값으로 주입해 실행 시점에 무관하게
 * 항상 같은 결과를 낸다.
 */

const TODAY = new Date("2026-06-15T00:00:00");
const YESTERDAY = "2026-06-14";
const TODAY_STR = "2026-06-15";
const TOMORROW = "2026-06-16";
const DAY_AFTER = "2026-06-17";

describe("validateFlightDates — 항공(당일 왕복 허용)", () => {
  it("출발일=귀국일=오늘이면 유효하다(경계값: 오늘, 당일 왕복 허용)", () => {
    const errors = validateFlightDates(TODAY_STR, TODAY_STR, TODAY);
    expect(errors).toEqual({});
  });

  it("출발일이 어제면 오류다(경계값: 어제, 과거 불가)", () => {
    const errors = validateFlightDates(YESTERDAY, TODAY_STR, TODAY);
    expect(errors.start).toBeTruthy();
  });

  it("귀국일이 출발일보다 이전이면 오류다(역전)", () => {
    const errors = validateFlightDates(TODAY_STR, YESTERDAY, TODAY);
    expect(errors.start).toBeUndefined();
    expect(errors.end).toBeTruthy();
  });

  it("출발일·귀국일이 모두 미래면 유효하다", () => {
    const errors = validateFlightDates(TOMORROW, DAY_AFTER, TODAY);
    expect(errors).toEqual({});
  });

  it("형식이 올바르지 않으면 두 필드 모두 오류다", () => {
    const errors = validateFlightDates("2026/06/15", "귀국일없음", TODAY);
    expect(errors.start).toBeTruthy();
    expect(errors.end).toBeTruthy();
  });
});

describe("validateHotelDates — 숙소(당일 불가)", () => {
  it("체크인=체크아웃=오늘이면 오류다(경계값: 당일 불가)", () => {
    const errors = validateHotelDates(TODAY_STR, TODAY_STR, TODAY);
    expect(errors.start).toBeUndefined();
    expect(errors.end).toBeTruthy();
  });

  it("체크인이 어제면 오류다(경계값: 어제, 과거 불가)", () => {
    const errors = validateHotelDates(YESTERDAY, TODAY_STR, TODAY);
    expect(errors.start).toBeTruthy();
  });

  it("체크인=오늘, 체크아웃=내일이면 유효하다", () => {
    const errors = validateHotelDates(TODAY_STR, TOMORROW, TODAY);
    expect(errors).toEqual({});
  });

  it("체크아웃이 체크인보다 이전이면 오류다(역전)", () => {
    const errors = validateHotelDates(TOMORROW, TODAY_STR, TODAY);
    expect(errors.start).toBeUndefined();
    expect(errors.end).toBeTruthy();
  });

  it("형식이 올바르지 않으면 두 필드 모두 오류다", () => {
    const errors = validateHotelDates("체크인없음", "2026/06/16", TODAY);
    expect(errors.start).toBeTruthy();
    expect(errors.end).toBeTruthy();
  });
});

describe("hasDateRangeErrors", () => {
  it("오류가 없으면 false를 반환한다", () => {
    expect(hasDateRangeErrors({})).toBe(false);
  });

  it("start 또는 end 중 하나라도 있으면 true를 반환한다", () => {
    expect(hasDateRangeErrors({ start: "오류" })).toBe(true);
    expect(hasDateRangeErrors({ end: "오류" })).toBe(true);
  });
});
