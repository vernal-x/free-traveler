/**
 * SA-MATE-POST(범위 확장) — 공개 연락처 노출 탐지 공유 모듈.
 *
 * `src/lib/actions/mate-post.ts`가 제출 차단에 사용하고, `UNIT-CONTACT-DETECTION`
 * (W25)이 이 모듈을 직접 import해 테스트한다(REQ-FUNC-031, 032 — 정량 탐지율
 * 목표 없이 케이스 기반으로 축소). 순수 함수만 두어 UI 없이도 테스트 가능하게
 * 한다.
 */

const PHONE_PATTERN =
  /(01[016789][-.\s]?\d{3,4}[-.\s]?\d{4})|(\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4})/;

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const MESSENGER_ID_PATTERN =
  /(카카오\s?톡|카톡|kakao\s?talk|kakaotalk|텔레그램|telegram|왓츠앱|whatsapp|위챗|wechat|라인|line\s?id|인스타(그램)?|instagram)\s*(아이디|id)?\s*[:@\-]?\s*[a-zA-Z0-9_.]{2,}/i;

export type ContactDetectionReason = "phone" | "email" | "messenger_id";

export interface ContactDetectionResult {
  detected: boolean;
  reasons: ContactDetectionReason[];
}

/** 제목/설명/희망 조건 등 자유 입력 텍스트에서 공개 연락처 패턴을 탐지한다. */
export function detectContactInfo(text: string): ContactDetectionResult {
  const reasons: ContactDetectionReason[] = [];
  if (PHONE_PATTERN.test(text)) reasons.push("phone");
  if (EMAIL_PATTERN.test(text)) reasons.push("email");
  if (MESSENGER_ID_PATTERN.test(text)) reasons.push("messenger_id");
  return { detected: reasons.length > 0, reasons };
}

/** 여러 필드를 한 번에 검사할 때 사용한다(제목·설명·희망 조건 등). */
export function detectContactInfoInFields(
  fields: Record<string, string | null | undefined>,
): { field: string; result: ContactDetectionResult }[] {
  const hits: { field: string; result: ContactDetectionResult }[] = [];
  for (const [field, value] of Object.entries(fields)) {
    if (!value) continue;
    const result = detectContactInfo(value);
    if (result.detected) hits.push({ field, result });
  }
  return hits;
}
