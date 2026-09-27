import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { Tokens } from "@/models/auth";
import client from "./client";
import type { SuccessResponse } from "./responses";

export type SendVerificationCodeError =
  | "ALREADY_CONFIRMED"
  | "TOO_MANY_REQUESTS"
  | "UNKNOWN_ERROR";

export async function sendVerificationCode(): Promise<Result<void, SendVerificationCodeError>> {
  try {
    await client.post("/auth/Verification/send-code");
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 409) return fail("ALREADY_CONFIRMED");
    if (status === 429) return fail("TOO_MANY_REQUESTS");
    return fail("UNKNOWN_ERROR");
  }
}

export type VerifyPhoneError = "INVALID_CODE" | "UNKNOWN_ERROR";

export async function verifyPhone({
  code,
}: {
  code: string;
}): Promise<Result<Tokens, VerifyPhoneError>> {
  try {
    const response = await client.post<SuccessResponse<Tokens>>(
      "/auth/Verification/verify",
      { code },
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 400) return fail("INVALID_CODE");
    return fail("UNKNOWN_ERROR");
  }
}
