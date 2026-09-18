/**
 * DB-ACCESS 공통 유틸 — 자유 텍스트 필드(닉네임, 자기소개, 모집글 설명 등)를 저장하기
 * 전 HTML 특수문자를 escape해 저장된 XSS(stored XSS) 페이로드를 막는다
 * (Security/Privacy AC: "XSS 이스케이프"). 렌더링 시 React가 기본적으로 이스케이프하긴
 * 하지만, `dangerouslySetInnerHTML`을 쓰는 향후 코드나 API 직접 응답 시에도 안전하도록
 * 저장 시점에 한 번 더 이스케이프한다.
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function sanitizeText(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}
