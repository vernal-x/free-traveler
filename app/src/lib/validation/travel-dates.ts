/**
 * CMP-SCR003-FLIGHT-FORM(범위 확장, 사용자 승인) — 항공·숙소 날짜 검증 공유 모듈.
 *
 * `CMP-SCR003-FLIGHT-FORM`과 `CMP-SCR003-HOTEL-FORM`이 함께 사용하고,
 * `UNIT-TRAVEL-DATES`(W25)가 이 모듈을 직접 import해 경계값(오늘/어제/출발=귀국/
 * 역전)을 테스트한다. 순수 함수만 두어 UI 없이도 테스트 가능하게 한다.
 */

export interface DateRangeErrors {
  start?: string;
  end?: string;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseISODate(value: string): Date | null {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/** 항공: 출발일은 과거 불가, 귀국일은 출발일과 같거나 이후여야 한다(당일 왕복 허용). */
export function validateFlightDates(
  departureDate: string,
  returnDate: string,
  today: Date = startOfToday(),
): DateRangeErrors {
  const errors: DateRangeErrors = {};
  const departure = parseISODate(departureDate);
  const returning = parseISODate(returnDate);

  if (!departure) {
    errors.start = "출발일을 올바르게 입력하세요.";
  } else if (departure < today) {
    errors.start = "출발일은 오늘 이후여야 합니다.";
  }

  if (!returning) {
    errors.end = "귀국일을 올바르게 입력하세요.";
  } else if (departure && returning < departure) {
    errors.end = "귀국일은 출발일과 같거나 이후여야 합니다.";
  }

  return errors;
}

/** 숙소: 체크인은 과거 불가, 체크아웃은 체크인보다 반드시 이후여야 한다(당일 불가). */
export function validateHotelDates(
  checkInDate: string,
  checkOutDate: string,
  today: Date = startOfToday(),
): DateRangeErrors {
  const errors: DateRangeErrors = {};
  const checkIn = parseISODate(checkInDate);
  const checkOut = parseISODate(checkOutDate);

  if (!checkIn) {
    errors.start = "체크인 날짜를 올바르게 입력하세요.";
  } else if (checkIn < today) {
    errors.start = "체크인은 오늘 이후여야 합니다.";
  }

  if (!checkOut) {
    errors.end = "체크아웃 날짜를 올바르게 입력하세요.";
  } else if (checkIn && checkOut <= checkIn) {
    errors.end = "체크아웃은 체크인 이후 날짜여야 합니다.";
  }

  return errors;
}

export function hasDateRangeErrors(errors: DateRangeErrors): boolean {
  return Boolean(errors.start || errors.end);
}
