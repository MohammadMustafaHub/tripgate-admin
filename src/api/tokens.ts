import type { AxiosError } from "axios";
import { fail, ok, type Result } from "@/lib/result";
import type { Tokens } from "@/models/auth";
import client from "./client";
import type { SuccessResponse } from "./responses";

export type RefreshTokenError = "INVALID_REFRESH_TOKEN" | "UNKNOWN_ERROR";

export async function refreshTokens({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<Result<Tokens, RefreshTokenError>> {
  try {
    const response = await client.post<SuccessResponse<Tokens>>(
      "/auth/Tokens/refresh",
      { refreshToken },
      { skipAuthRefresh: true },
    );
    return ok(response.data.data);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 401) return fail("INVALID_REFRESH_TOKEN");
    return fail("UNKNOWN_ERROR");
  }
}

export type RevokeTokenError = "TOKEN_NOT_FOUND" | "UNKNOWN_ERROR";

export async function revokeToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<Result<void, RevokeTokenError>> {
  try {
    await client.post("/auth/Tokens/revoke", { refreshToken }, { skipAuthRefresh: true });
    return ok(undefined);
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status === 404) return fail("TOKEN_NOT_FOUND");
    return fail("UNKNOWN_ERROR");
  }
}

export type RevokeAllTokensError = "UNKNOWN_ERROR";

export async function revokeAllTokens(): Promise<Result<void, RevokeAllTokensError>> {
  try {
    await client.post("/auth/Tokens/revoke-all");
    return ok(undefined);
  } catch {
    return fail("UNKNOWN_ERROR");
  }
}
