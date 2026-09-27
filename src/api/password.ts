import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { PasswordResetToken } from "@/models/auth";
import client from "./client";
import type { SuccessResponse } from "./responses";

export type ChangePasswordError = "INVALID_PASSWORD" | "UNKNOWN_ERROR";

export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}): Promise<Result<void, ChangePasswordError>> {
  try {
    await client.post("/auth/Password/change", { currentPassword, newPassword });
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_PASSWORD");
    return fail("UNKNOWN_ERROR");
  }
}

export type ForgotPasswordError = "TOO_MANY_REQUESTS" | "UNKNOWN_ERROR";

export async function forgotPassword({
  phoneNumber,
}: {
  phoneNumber: string;
}): Promise<Result<void, ForgotPasswordError>> {
  try {
    await client.post("/auth/Password/forgot", { phoneNumber }, { skipAuthRefresh: true });
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 429) return fail("TOO_MANY_REQUESTS");
    return fail("UNKNOWN_ERROR");
  }
}

export type VerifyPasswordCodeError = "INVALID_CODE" | "UNKNOWN_ERROR";

export async function verifyPasswordCode({
  phoneNumber,
  code,
}: {
  phoneNumber: string;
  code: string;
}): Promise<Result<PasswordResetToken, VerifyPasswordCodeError>> {
  try {
    const response = await client.post<SuccessResponse<PasswordResetToken>>(
      "/auth/Password/verify-code",
      { phoneNumber, code },
      { skipAuthRefresh: true },
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_CODE");
    return fail("UNKNOWN_ERROR");
  }
}

export type ResetPasswordError = "INVALID_TOKEN_OR_PASSWORD" | "UNKNOWN_ERROR";

export async function resetPassword({
  phoneNumber,
  token,
  newPassword,
}: {
  phoneNumber: string;
  token: string;
  newPassword: string;
}): Promise<Result<void, ResetPasswordError>> {
  try {
    await client.post(
      "/auth/Password/reset",
      { phoneNumber, token, newPassword },
      { skipAuthRefresh: true },
    );
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_TOKEN_OR_PASSWORD");
    return fail("UNKNOWN_ERROR");
  }
}
