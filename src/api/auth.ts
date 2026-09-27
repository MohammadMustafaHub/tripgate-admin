import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { Tokens } from "@/models/auth";
import client from "./client";
import type { SuccessResponse } from "./responses";

export type RegisterError = "PHONE_ALREADY_REGISTERED" | "UNKNOWN_ERROR";

export async function register({
  phoneNumber,
  password,
}: {
  phoneNumber: string;
  password: string;
}): Promise<Result<Tokens, RegisterError>> {
  try {
    const response = await client.post<SuccessResponse<Tokens>>(
      "/auth/register",
      { phoneNumber, password },
      { skipAuthRefresh: true },
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 409) return fail("PHONE_ALREADY_REGISTERED");
    return fail("UNKNOWN_ERROR");
  }
}

export type LoginError =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "UNKNOWN_ERROR";

export async function login({
  phoneNumber,
  password,
}: {
  phoneNumber: string;
  password: string;
}): Promise<Result<Tokens, LoginError>> {
  try {
    const response = await client.post<SuccessResponse<Tokens>>(
      "/auth/login",
      { phoneNumber, password },
      { skipAuthRefresh: true },
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 401) return fail("INVALID_CREDENTIALS");
    if (status === 423) return fail("ACCOUNT_LOCKED");
    return fail("UNKNOWN_ERROR");
  }
}
