import type { Config } from "tailwindcss";

/**
 * Tailwind v4는 색상·타이포·spacing·radius·shadow 디자인 토큰의 정본을
 * `src/app/globals.css`의 `@theme` 블록(CSS 변수)으로 관리한다(`@config`로 이 파일을
 * 그 CSS에서 불러온다). `design-reference/D-001/DESIGN.md`의 토큰 값을 이 파일에도
 * 중복 정의하지 않는다 — 정본은 하나여야 하며, 이 파일은 CSS `@theme`만으로 표현할 수
 * 없는 설정(콘텐츠 스캔 경로, 다크모드 전략)만 명시적으로 고정한다.
 *
 * darkMode를 비활성화하는 이유: DESIGN.md Color Token 표는 라이트(canvas 기반) 팔레트
 * 하나만 정의하며 다크 전용 색상을 별도로 두지 않는다 — 임의 색상 추가 금지 규칙
 * (Functional AC, Do Not "디자인 토큰 없는 임의 색상")에 따라 다크모드 색상을
 * 새로 만들지 않는다.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: false,
};

export default config;
