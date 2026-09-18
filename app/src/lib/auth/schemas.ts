import { z } from "zod";

/** AUTH-EMAIL-ADULT — 이메일 가입/로그인/재설정 입력 검증(REQ-FUNC-066). */

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;

export const updatePasswordSchema = z.object({
  password: z.string().min(8).max(72),
});
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
